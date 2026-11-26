import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import type { QuestionRequestDTO } from '../schemas/quiz.schema';
import {
  bankQuestionItemSchema,
  questionConceptSchema,
  type AiGenerateQuestionsFormValues,
  type BankClassOption,
  type BankCourseOption,
  type BankQuestionItem,
  type ImportQuestionsResult,
  type QuestionBankFilterParams,
  type QuestionBankPage,
  type QuestionConcept,
  type QuestionConceptRequest,
  type TargetAssessmentOption,
} from '../schemas/question-bank.schema';

function extractArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.content)) return obj.content;
  if (Array.isArray(obj.questions)) return obj.questions;
  if (Array.isArray(obj.data)) return obj.data;
  return [];
}

function normalizeQuestion(raw: unknown): BankQuestionItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const q = raw as Record<string, unknown>;
  const correctKeys = String(q.correctAnswer ?? '')
    .toUpperCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const rawAnswers =
    Array.isArray(q.answers) && q.answers.length > 0
      ? q.answers
      : [
          q.optionA
            ? {
                id: `${String(q.id ?? '')}-a`,
                content: String(q.optionA),
                isCorrect: correctKeys.includes('A'),
              }
            : null,
          q.optionB
            ? {
                id: `${String(q.id ?? '')}-b`,
                content: String(q.optionB),
                isCorrect: correctKeys.includes('B'),
              }
            : null,
          q.optionC
            ? {
                id: `${String(q.id ?? '')}-c`,
                content: String(q.optionC),
                isCorrect: correctKeys.includes('C'),
              }
            : null,
          q.optionD
            ? {
                id: `${String(q.id ?? '')}-d`,
                content: String(q.optionD),
                isCorrect: correctKeys.includes('D'),
              }
            : null,
        ].filter(Boolean);

  const conceptIdsFromConcepts = Array.isArray(q.concepts)
    ? q.concepts
        .map((c) =>
          c && typeof c === 'object' ? String((c as Record<string, unknown>).id ?? '') : ''
        )
        .filter(Boolean)
    : [];

  const parsed = bankQuestionItemSchema.safeParse({
    ...q,
    id: String(q.id ?? ''),
    content: String(q.content ?? q.questionText ?? ''),
    difficultyLevel: q.difficultyLevel ?? q.difficulty ?? 'MEDIUM',
    answers: rawAnswers,
    conceptIds:
      Array.isArray(q.conceptIds) && q.conceptIds.length > 0
        ? q.conceptIds.map(String)
        : conceptIdsFromConcepts,
    tags: Array.isArray(q.tags) ? q.tags.map(String) : [],
  });

  return parsed.success ? parsed.data : null;
}

type QuestionSavePayload = QuestionRequestDTO & {
  courseId?: string;
  classId?: string;
  tags?: string[];
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

function buildQuestionApiPayload(payload: QuestionSavePayload): Record<string, unknown> {
  const answers = payload.answers ?? [];
  const optionA = answers[0]?.content ?? '';
  const optionB = answers[1]?.content ?? '';
  const optionC = answers[2]?.content ?? '';
  const optionD = answers[3]?.content ?? '';

  const correctLetters = answers
    .slice(0, 4)
    .map((ans, idx) => (ans.isCorrect ? OPTION_LETTERS[idx] : null))
    .filter((letter): letter is (typeof OPTION_LETTERS)[number] => Boolean(letter));

  const correctAnswer =
    correctLetters.length > 0 ? correctLetters.join(',') : payload.questionType === 'ESSAY' ? '' : 'A';

  return {
    ...payload,
    questionText: payload.content,
    difficulty: payload.difficultyLevel ?? 'MEDIUM',
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
  };
}

function normalizeConcept(raw: unknown): QuestionConcept | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const id = String(rec.id ?? '').trim();
  if (!id) return null;

  const rawName = rec.name;
  const rawConceptId = rec.conceptId;
  const displayName =
    typeof rawName === 'string' && rawName.trim().length > 0
      ? rawName.trim()
      : typeof rawConceptId === 'string' && rawConceptId.trim().length > 0
        ? rawConceptId.trim()
        : '';

  const parsed = questionConceptSchema.safeParse({
    ...rec,
    id,
    conceptId: typeof rawConceptId === 'string' ? rawConceptId.trim() : null,
    name: displayName,
  });
  return parsed.success ? parsed.data : null;
}

/**
 * GET /api/v1/question-concepts
 */
export async function getQuestionConcepts(params?: {
  keyword?: string;
  questionId?: string;
}): Promise<QuestionConcept[]> {
  const query: Record<string, string> = {};
  if (params?.keyword?.trim()) query.keyword = params.keyword.trim();
  if (params?.questionId) query.questionId = params.questionId;

  const { data } = await api.get<ApiResponse<unknown>>('/question-concepts', {
    params: query,
  });
  const list = extractArray(data?.data ?? data);
  return list
    .map(normalizeConcept)
    .filter((c): c is QuestionConcept => c !== null);
}

/**
 * POST /api/v1/question-concepts
 */
export async function createQuestionConcept(
  payload: QuestionConceptRequest
): Promise<QuestionConcept> {
  const { data } = await api.post<ApiResponse<unknown>>('/question-concepts', {
    ...payload,
    conceptId: payload.conceptId?.trim() || payload.name.trim(),
  });
  const normalized = normalizeConcept(data?.data ?? data);
  if (!normalized) {
    throw new Error('Phản hồi tạo khái niệm không hợp lệ');
  }
  return normalized;
}

/**
 * DELETE /api/v1/question-concepts/{id}
 */
export async function deleteQuestionConcept(id: string): Promise<void> {
  await api.delete(`/question-concepts/${id}`);
}

/**
 * GET /api/v1/questions
 */
export async function getQuestionsPage(
  params: QuestionBankFilterParams = {}
): Promise<QuestionBankPage> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    size: params.size ?? 12,
    sort: params.sort ?? 'createdAt,desc',
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.courseId && params.courseId !== 'ALL') query.courseId = params.courseId;
  if (params.classId && params.classId !== 'ALL') query.classId = params.classId;
  if (params.chapterId && params.chapterId !== 'ALL') query.chapterId = params.chapterId;
  if (params.questionType && params.questionType !== 'ALL') query.questionType = params.questionType;
  if (params.difficultyLevel && params.difficultyLevel !== 'ALL') {
    query.difficultyLevel = params.difficultyLevel;
  }
  if (params.bloomLevel && params.bloomLevel !== 'ALL') query.bloomLevel = params.bloomLevel;
  if (params.sourceType && params.sourceType !== 'ALL') query.sourceType = params.sourceType;
  if (params.conceptId && params.conceptId !== 'ALL') query.conceptId = params.conceptId;

  const { data } = await api.get<ApiResponse<unknown>>('/questions', { params: query });
  const payload = (data?.data ?? data) as Record<string, unknown>;
  const rawItems = extractArray(payload);
  const items = rawItems
    .map(normalizeQuestion)
    .filter((item): item is BankQuestionItem => item !== null && item.id.length > 0);

  const totalItems = Number(
    payload?.totalItems ?? payload?.totalElements ?? items.length
  );
  const size = Number(payload?.size ?? query.size);
  const totalPages = Number(
    payload?.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(1, size)))
  );
  const page = Number(payload?.page ?? payload?.number ?? query.page);

  return {
    items,
    totalItems,
    totalPages,
    page,
    size,
  };
}

/**
 * GET /api/v1/questions/{id}
 */
export async function getQuestionDetail(id: string): Promise<BankQuestionItem> {
  const { data } = await api.get<ApiResponse<unknown>>(`/questions/${id}`);
  const normalized = normalizeQuestion(data?.data ?? data);
  if (!normalized) {
    throw new Error('Không thể đọc chi tiết câu hỏi từ máy chủ');
  }
  return normalized;
}

/**
 * POST /api/v1/questions
 */
export async function createBankQuestion(
  payload: QuestionSavePayload
): Promise<BankQuestionItem> {
  const { data } = await api.post<ApiResponse<unknown>>(
    '/questions',
    buildQuestionApiPayload(payload)
  );
  const normalized = normalizeQuestion(data?.data ?? data);
  if (!normalized) {
    throw new Error('Phản hồi tạo câu hỏi không hợp lệ');
  }
  return normalized;
}

/**
 * POST /api/v1/questions/batch
 */
export async function batchCreateQuestions(
  questions: QuestionSavePayload[]
): Promise<BankQuestionItem[]> {
  const { data } = await api.post<ApiResponse<unknown>>('/questions/batch', {
    questions: questions.map(buildQuestionApiPayload),
  });
  return extractArray(data?.data ?? data)
    .map(normalizeQuestion)
    .filter((item): item is BankQuestionItem => item !== null);
}

/**
 * POST /api/v1/questions/import
 */
export async function importQuestionsFile(params: {
  file: File;
  courseId?: string;
  chapterId?: string;
  saveToBank?: boolean;
}): Promise<ImportQuestionsResult> {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.courseId && params.courseId !== 'ALL') {
    formData.append('courseId', params.courseId);
  }
  if (params.chapterId && params.chapterId !== 'ALL') {
    formData.append('chapterId', params.chapterId);
  }
  formData.append('saveToBank', String(params.saveToBank ?? true));

  const { data } = await api.post<ApiResponse<unknown>>('/questions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const payload = (data?.data ?? data) as Record<string, unknown>;
  const questions = extractArray(payload)
    .map(normalizeQuestion)
    .filter((item): item is BankQuestionItem => item !== null);

  return {
    totalParsed: Number(payload?.totalParsed ?? questions.length),
    savedCount: Number(payload?.savedCount ?? questions.length),
    questions,
  };
}

/**
 * POST /api/v1/questions/generate-ai
 */
export async function generateQuestionsAi(
  payload: AiGenerateQuestionsFormValues
): Promise<BankQuestionItem[]> {
  const body: Record<string, unknown> = {
    prompt: payload.prompt,
    questionType: payload.questionType,
    difficultyLevel: payload.difficultyLevel,
    bloomLevel: payload.bloomLevel,
    count: payload.count,
  };
  if (payload.courseId && payload.courseId !== 'ALL') body.courseId = payload.courseId;
  if (payload.classId && payload.classId !== 'ALL') body.classId = payload.classId;
  if (payload.conceptIds.length > 0) body.conceptIds = payload.conceptIds;

  const { data } = await api.post<ApiResponse<unknown>>('/questions/generate-ai', body);
  return extractArray(data?.data ?? data)
    .map(normalizeQuestion)
    .filter((item): item is BankQuestionItem => item !== null);
}

/**
 * PUT /api/v1/questions/{id}
 */
export async function updateBankQuestion(
  id: string,
  payload: QuestionSavePayload
): Promise<BankQuestionItem> {
  const { data } = await api.put<ApiResponse<unknown>>(
    `/questions/${id}`,
    buildQuestionApiPayload(payload)
  );
  const normalized = normalizeQuestion(data?.data ?? data);
  if (!normalized) {
    throw new Error('Phản hồi cập nhật câu hỏi không hợp lệ');
  }
  return normalized;
}

/**
 * DELETE /api/v1/questions/{id}
 */
export async function deleteBankQuestion(id: string): Promise<void> {
  await api.delete(`/questions/${id}`);
}

/**
 * Classes taught by the current user (for scoping Question Bank & pushing questions to Quiz/Exam)
 */
export async function getTeacherClassesForBank(): Promise<BankClassOption[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/classes', {
    params: { status: 'ACTIVE', page: 0, size: 50 },
  });
  const list = extractArray(data?.data ?? data);
  return list
    .map((entry): BankClassOption | null => {
      if (!entry || typeof entry !== 'object') return null;
      const rec = entry as Record<string, unknown>;
      const id = String(rec.id ?? '').trim();
      if (!id) return null;
      const role = String(rec.teachingRole ?? 'STUDENT').toUpperCase();
      if (role === 'STUDENT') return null;
      return {
        id,
        name: String(rec.name ?? rec.title ?? 'Lớp học'),
        title: String(rec.title ?? rec.name ?? 'Lớp học'),
        code: String(rec.code ?? rec.classCode ?? ''),
      };
    })
    .filter((c): c is BankClassOption => c !== null);
}

/**
 * Courses inside a class: GET /api/v1/classes/{classId}/courses
 */
export async function getClassCoursesForBank(classId: string): Promise<BankCourseOption[]> {
  if (!classId || classId === 'ALL') return [];
  const { data } = await api.get<ApiResponse<unknown>>(`/classes/${classId}/courses`);
  const list = extractArray(data?.data ?? data);
  return list
    .map((entry): BankCourseOption | null => {
      if (!entry || typeof entry !== 'object') return null;
      const rec = entry as Record<string, unknown>;
      const id = String(rec.courseId ?? rec.id ?? '').trim();
      if (!id) return null;
      return {
        id,
        title: String(rec.title ?? rec.courseTitle ?? rec.name ?? 'Môn học'),
        code: rec.code ? String(rec.code) : undefined,
      };
    })
    .filter((c): c is BankCourseOption => c !== null);
}

/**
 * Quizzes & Exams in a class for "Push to Assessment"
 */
export async function getClassTargetAssessments(
  classId: string
): Promise<TargetAssessmentOption[]> {
  if (!classId) return [];
  const [quizzesRes, examsRes] = await Promise.allSettled([
    api.get<ApiResponse<unknown>>('/quizzes', {
      params: { classId, page: 0, size: 50 },
    }),
    api.get<ApiResponse<unknown>>(`/classes/${classId}/exams`, {
      params: { page: 0, size: 50 },
    }),
  ]);

  const results: TargetAssessmentOption[] = [];

  if (quizzesRes.status === 'fulfilled') {
    const rawList = extractArray(quizzesRes.value.data?.data ?? quizzesRes.value.data);
    for (const item of rawList) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      const id = String(rec.id ?? '').trim();
      if (!id) continue;
      results.push({
        id,
        title: String(rec.title ?? 'Quiz không tên'),
        kind: 'QUIZ',
        status: rec.status ? String(rec.status) : undefined,
      });
    }
  }

  if (examsRes.status === 'fulfilled') {
    const rawList = extractArray(examsRes.value.data?.data ?? examsRes.value.data);
    for (const item of rawList) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      const id = String(rec.id ?? '').trim();
      if (!id) continue;
      results.push({
        id,
        title: String(rec.title ?? 'Bài kiểm tra không tên'),
        kind: 'EXAM',
        status: rec.status ? String(rec.status) : undefined,
      });
    }
  }

  return results;
}

/**
 * Push selected questions into an existing Quiz or Exam
 */
export async function pushQuestionsToTargetAssessment(params: {
  kind: 'QUIZ' | 'EXAM';
  targetId: string;
  questionIds: string[];
  pointPerQuestion: number;
}): Promise<void> {
  if (params.kind === 'QUIZ') {
    await api.post(`/quizzes/${params.targetId}/questions/batch`, {
      questions: params.questionIds.map((questionId, idx) => ({
        questionId,
        point: params.pointPerQuestion,
        orderIndex: idx + 1,
      })),
    });
    return;
  }

  await Promise.all(
    params.questionIds.map((questionId, idx) =>
      api.post(`/exams/${params.targetId}/questions`, {
        questionId,
        score: params.pointPerQuestion,
        orderIndex: idx + 1,
      })
    )
  );
}
