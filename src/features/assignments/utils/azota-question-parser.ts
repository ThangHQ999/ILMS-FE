import type { BloomLevel, DifficultyLevel, QuestionType } from '../schemas/quiz.schema';

export interface AzotaParsedOption {
  letter: string;
  content: string;
  isCorrect: boolean;
}

export interface AzotaParsedQuestion {
  index: number;
  content: string;
  questionType: QuestionType;
  difficultyLevel: DifficultyLevel;
  bloomLevel: BloomLevel;
  options: AzotaParsedOption[];
  explanation: string;
  issues: string[];
  isValid: boolean;
}

export interface AzotaParserDefaults {
  difficultyLevel: DifficultyLevel;
  bloomLevel: BloomLevel;
}

export const AZOTA_SAMPLE_TEXT = `Câu 1: Giao thức nào hoạt động ở tầng Mạng (Layer 3) trong mô hình OSI?
A. TCP
*B. IP
C. HTTP
D. Ethernet
Giải thích: Giao thức IP chịu trách nhiệm định tuyến và đánh địa chỉ logic ở tầng Mạng.

Câu 2: Chọn các giao thức thuộc tầng Giao vận (Transport Layer)?
*A. TCP
*B. UDP
C. ARP
D. ICMP
Giải thích: TCP và UDP là hai giao thức chính ở tầng Giao vận.

Câu 3: Địa chỉ IPv4 có độ dài bao nhiêu bit?
A. 16 bit
B. 32 bit
C. 64 bit
D. 128 bit
Đáp án: B`;

const QUESTION_START_RE = /^(?:câu|question|bài)\s*(\d+)\s*[:.)\-]?\s*(.*)$/i;
const NUMERIC_START_RE = /^(\d+)\s*[.)]\s+(.*)$/;
const OPTION_LINE_RE = /^(\*)?\s*([A-Fa-f])\s*[.)]\s*(.*)$/;
const ANSWER_LINE_RE = /^(?:đáp\s*án|dap\s*an|answer|key)\s*[:\-]\s*(.+)$/i;
const EXPLANATION_LINE_RE = /^(?:giải\s*thích|giai\s*thich|explanation|hướng\s*dẫn)\s*[:\-]\s*(.*)$/i;

interface RawDraft {
  contentLines: string[];
  options: Array<{ letter: string; lines: string[]; markedCorrect: boolean }>;
  explicitAnswerLetters: string[];
  explanationLines: string[];
}

function createEmptyDraft(): RawDraft {
  return {
    contentLines: [],
    options: [],
    explicitAnswerLetters: [],
    explanationLines: [],
  };
}

function finalizeDraft(
  draft: RawDraft,
  index: number,
  defaults: AzotaParserDefaults
): AzotaParsedQuestion | null {
  const content = draft.contentLines.join('\n').trim();
  if (!content && draft.options.length === 0) return null;

  const explicitSet = new Set(draft.explicitAnswerLetters.map((l) => l.toUpperCase()));
  const options: AzotaParsedOption[] = draft.options.map((opt) => ({
    letter: opt.letter.toUpperCase(),
    content: opt.lines.join(' ').trim(),
    isCorrect: opt.markedCorrect || explicitSet.has(opt.letter.toUpperCase()),
  }));

  const correctCount = options.filter((o) => o.isCorrect).length;
  const questionType: QuestionType =
    options.length === 0
      ? 'ESSAY'
      : correctCount > 1
        ? 'MULTIPLE_CHOICE'
        : 'SINGLE_CHOICE';

  const issues: string[] = [];
  if (!content) {
    issues.push('Thiếu nội dung câu hỏi');
  }
  if (options.length > 0 && options.length < 2) {
    issues.push('Cần tối thiểu 2 đáp án (A, B...)');
  }
  if (options.length > 4) {
    issues.push('Hệ thống hỗ trợ tối đa 4 đáp án (A–D)');
  }
  if (options.some((o) => !o.content)) {
    issues.push('Có đáp án đang bị để trống nội dung');
  }
  if (options.length >= 2 && correctCount === 0) {
    issues.push('Chưa chọn đáp án đúng (thêm * hoặc click A/B/C/D bên phải)');
  }

  return {
    index,
    content,
    questionType,
    difficultyLevel: defaults.difficultyLevel,
    bloomLevel: defaults.bloomLevel,
    options,
    explanation: draft.explanationLines.join('\n').trim(),
    issues,
    isValid: issues.length === 0,
  };
}

export function parseAzotaQuestionsText(
  rawText: string,
  defaults: AzotaParserDefaults = {
    difficultyLevel: 'MEDIUM',
    bloomLevel: 'UNDERSTAND',
  }
): AzotaParsedQuestion[] {
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const drafts: RawDraft[] = [];
  let current: RawDraft | null = null;
  let activeSection: 'CONTENT' | 'OPTION' | 'EXPLANATION' = 'CONTENT';

  const pushCurrent = () => {
    if (current) {
      drafts.push(current);
      current = null;
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }

    const qMatch = trimmed.match(QUESTION_START_RE) ?? trimmed.match(NUMERIC_START_RE);
    if (qMatch) {
      pushCurrent();
      current = createEmptyDraft();
      activeSection = 'CONTENT';
      const firstLine = (qMatch[2] ?? '').trim();
      if (firstLine) {
        current.contentLines.push(firstLine);
      }
      continue;
    }

    if (!current) {
      current = createEmptyDraft();
      activeSection = 'CONTENT';
    }

    const ansMatch = trimmed.match(ANSWER_LINE_RE);
    if (ansMatch) {
      const letters = ansMatch[1]
        .toUpperCase()
        .replace(/[^A-F]/g, '')
        .split('')
        .filter(Boolean);
      current.explicitAnswerLetters.push(...letters);
      continue;
    }

    const expMatch = trimmed.match(EXPLANATION_LINE_RE);
    if (expMatch) {
      activeSection = 'EXPLANATION';
      if (expMatch[1]?.trim()) {
        current.explanationLines.push(expMatch[1].trim());
      }
      continue;
    }

    const optMatch = trimmed.match(OPTION_LINE_RE);
    if (optMatch) {
      activeSection = 'OPTION';
      current.options.push({
        letter: optMatch[2].toUpperCase(),
        lines: optMatch[3]?.trim() ? [optMatch[3].trim()] : [],
        markedCorrect: Boolean(optMatch[1]),
      });
      continue;
    }

    if (activeSection === 'OPTION' && current.options.length > 0) {
      current.options[current.options.length - 1].lines.push(trimmed);
    } else if (activeSection === 'EXPLANATION') {
      current.explanationLines.push(trimmed);
    } else {
      current.contentLines.push(trimmed);
    }
  }

  pushCurrent();

  return drafts
    .map((draft, idx) => finalizeDraft(draft, idx + 1, defaults))
    .filter((item): item is AzotaParsedQuestion => item !== null);
}

/**
 * Parse quick answer key string such as "1A 2BC 3.D 4:A" into a map of 1-based index -> letters.
 */
export function parseQuickAnswerKey(keyText: string): Record<number, string[]> {
  const result: Record<number, string[]> = {};
  const matches = keyText.toUpperCase().matchAll(/(\d+)\s*[.:\-]?\s*([A-D]+)/g);
  for (const match of matches) {
    const qNum = Number(match[1]);
    const letters = match[2].split('');
    if (qNum > 0 && letters.length > 0) {
      result[qNum] = Array.from(new Set(letters));
    }
  }
  return result;
}

/**
 * Apply manual or quick-key overrides onto parsed questions and recompute validity.
 */
export function applyAnswerAndDifficultyOverrides(
  questions: AzotaParsedQuestion[],
  answerOverrides: Record<number, string[]>,
  difficultyOverrides: Record<number, DifficultyLevel>
): AzotaParsedQuestion[] {
  return questions.map((q) => {
    const overrideLetters = answerOverrides[q.index];
    const nextDifficulty = difficultyOverrides[q.index] ?? q.difficultyLevel;
    const nextOptions = overrideLetters
      ? q.options.map((opt) => ({
          ...opt,
          isCorrect: overrideLetters.includes(opt.letter),
        }))
      : q.options;

    const correctCount = nextOptions.filter((o) => o.isCorrect).length;
    const questionType: QuestionType =
      nextOptions.length === 0
        ? 'ESSAY'
        : correctCount > 1
          ? 'MULTIPLE_CHOICE'
          : 'SINGLE_CHOICE';

    const issues: string[] = [];
    if (!q.content) issues.push('Thiếu nội dung câu hỏi');
    if (nextOptions.length > 0 && nextOptions.length < 2) {
      issues.push('Cần tối thiểu 2 đáp án (A, B...)');
    }
    if (nextOptions.length > 4) {
      issues.push('Hệ thống hỗ trợ tối đa 4 đáp án (A–D)');
    }
    if (nextOptions.some((o) => !o.content)) {
      issues.push('Có đáp án đang bị để trống nội dung');
    }
    if (nextOptions.length >= 2 && correctCount === 0) {
      issues.push('Chưa chọn đáp án đúng (thêm * hoặc click A/B/C/D bên phải)');
    }

    return {
      ...q,
      difficultyLevel: nextDifficulty,
      questionType,
      options: nextOptions,
      issues,
      isValid: issues.length === 0,
    };
  });
}
