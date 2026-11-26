import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import {
  conceptDetailSchema,
  graphAuditLogItemSchema,
  graphRevisionItemSchema,
  importKnowledgeGraphResponseSchema,
  graphValidationResponseSchema,
  graphAiRepairResponseSchema,
  publishedGraphRawEdgeSchema,
  publishedGraphRawNodeSchema,
  publishedGraphSummarySchema,
  type ConceptDetail,
  type CreateKnowledgeNodeRequestDTO,
  type GraphAuditLogItem,
  type GraphRevisionItem,
  type ImportKnowledgeGraphRequestDTO,
  type ImportKnowledgeGraphResponseDTO,
  type ManageKnowledgeEdgeRequestDTO,
  type PublishedGraphRawEdge,
  type PublishedGraphRawNode,
  type PublishedGraphsPage,
  type UpdateKnowledgeNodeRequestDTO,
  type GraphValidationResponseDTO,
  type GraphAiRepairResponseDTO,
  type ApplyAiRepairRequestDTO,
} from '../knowledge-graph.schema';
import type {
  KnowledgeCategory,
  KnowledgeEdgeData,
  KnowledgeGraphStats,
  KnowledgeNodeData,
  KnowledgeRelationshipType,
  KnowledgeStatus,
  ShortestPathResult,
} from '../types';

export interface KnowledgeGraphResult {
  title?: string;
  nodes: KnowledgeNodeData[];
  edges: KnowledgeEdgeData[];
}

const RELATION_LABEL_MAP: Record<string, string> = {
  REQUIRES: 'Yêu cầu',
  DEPENDS_ON: 'Phụ thuộc',
  PREREQUISITE: 'Tiên quyết',
  IS_A: 'Là một loại',
  PART_OF: 'Thuộc phần',
  CONTRASTS_WITH: 'Đối chiếu với',
  USES: 'Sử dụng',
  APPLIES_TO: 'Áp dụng cho',
  RELATED_TO: 'Liên quan',
  INCLUDES: 'Bao gồm',
  DEFINES: 'Định nghĩa',
  HAS_DEFINITION: 'Định nghĩa',
  HAS_PROCESS: 'Quy trình',
  HAS_PROCESS_STEP: 'Bước quy trình',
  STEP: 'Bước thực hiện',
  HAS_EXERCISE: 'Bài tập',
  HAS_EXERCISE_STEP: 'Bước bài tập',
  HAS_EXAMPLE: 'Ví dụ',
  HAS_ARGUMENT: 'Luận cứ',
  ARGUES: 'Lập luận',
  SOURCE_CHUNK: 'Nguồn trích',
  EXTRACTED_FROM: 'Trích từ',
  BELONGS_TO: 'Thuộc về',
  SUPPORTS: 'Bổ trợ',
  DERIVED_FROM: 'Dẫn xuất từ',
  COVERS: 'Bao gồm',
  REFERENCES: 'Tham chiếu',
};

export function formatRelationLabel(rawRelation?: string | null): string {
  if (!rawRelation) return 'Liên kết';
  const key = rawRelation.trim().toUpperCase();
  return RELATION_LABEL_MAP[key] ?? rawRelation;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SYSTEM_CODE_PREFIXES = [
  'INGESTION_',
  'CHUNK_',
  'DEF_',
  'TOPIC_',
  'ARG_',
  'NODE_',
  'ENTITY_',
  'REL_',
  'PROCESS_',
  'EXERCISE_',
];
const RAW_KIND_NAMES = new Set([
  'DEFINITION',
  'CHUNK',
  'TOPIC',
  'ARGUMENT',
  'KNOWLEDGE_ENTITY',
  'KNOWLEDGEENTITY',
  'CONCEPT',
  'PROCESS',
  'PROCESS_STEP',
  'PROCESSSTEP',
  'EXERCISE',
  'EXERCISE_STEP',
  'EXERCISESTEP',
  'EXAMPLE',
]);

export function isUuidOrCode(str?: string | null): boolean {
  if (!str) return true;
  const trimmed = str.trim();
  if (!trimmed) return true;
  if (UUID_REGEX.test(trimmed)) return true;
  if (SYSTEM_CODE_PREFIXES.some((p) => trimmed.toUpperCase().startsWith(p))) return true;
  if (RAW_KIND_NAMES.has(trimmed.toUpperCase())) return true;
  return false;
}

export function isGenericTopicName(str?: string | null): boolean {
  if (!str) return true;
  const trimmed = str.trim().toLowerCase();
  if (!trimmed) return true;
  if (isUuidOrCode(trimmed)) return true;
  if (trimmed === 'chủ đề' || trimmed === 'topic') return true;
  if (/^chủ đề\s*(#\d+|\d+)?$/i.test(trimmed)) return true;
  if (/^topic\s*(#\d+|\d+)?$/i.test(trimmed)) return true;
  if (/dijkstra|thuật toán dijkstra/i.test(trimmed)) return true;
  return false;
}

export function cleanDocTitle(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/\.(docx?|pdf|pptx?|txt|md|py|js|ts|java|go|sql|zip|rar)$/i, '')
    .trim();
}

export function deriveTopicDisplayName(
  topicCandidate?: string | null,
  contextConceptLabel?: string | null,
  materialTitle?: string | null,
  fallbackIndex = 1
): string {
  // 1. If explicit valid topic name candidate exists
  if (topicCandidate && typeof topicCandidate === 'string' && !isGenericTopicName(topicCandidate)) {
    const clean = topicCandidate.trim();
    if (clean && clean.toUpperCase() !== 'TOPIC') {
      return clean;
    }
  }

  // 2. Derive domain topic name from context concept or document title
  const contextStr = (contextConceptLabel || cleanDocTitle(materialTitle) || '').trim();
  const lower = contextStr.toLowerCase();

  if (lower.includes('sắp xếp') || lower.includes('sap xep') || lower.includes('sort')) {
    return 'Thuật toán Sắp xếp';
  }
  if (lower.includes('tìm kiếm') || lower.includes('tim kiem') || lower.includes('search')) {
    return 'Thuật toán Tìm kiếm';
  }
  if (lower.includes('dijkstra') || lower.includes('đồ thị') || lower.includes('do thi') || lower.includes('graph')) {
    return 'Lý thuyết Đồ thị';
  }
  if (lower.includes('cây') || lower.includes('cay') || lower.includes('tree')) {
    return 'Cấu trúc Cây & Cây nhị phân';
  }
  if (
    lower.includes('ngăn xếp') ||
    lower.includes('stack') ||
    lower.includes('hàng đợi') ||
    lower.includes('queue')
  ) {
    return 'Ngăn xếp & Hàng đợi';
  }
  if (lower.includes('danh sách') || lower.includes('linked list') || lower.includes('list')) {
    return 'Danh sách liên kết';
  }
  if (lower.includes('quy hoạch động') || lower.includes('dynamic programming') || lower.includes(' dp')) {
    return 'Quy hoạch động';
  }
  if (lower.includes('đệ quy') || lower.includes('recursion')) {
    return 'Giải thuật Đệ quy';
  }
  if (lower.includes('tham lam') || lower.includes('greedy')) {
    return 'Thuật toán Tham lam';
  }
  if (lower.includes('chia để trị') || lower.includes('divide and conquer')) {
    return 'Thuật toán Chia để trị';
  }
  if (lower.includes('quay lui') || lower.includes('backtrack')) {
    return 'Thuật toán Quay lui';
  }
  if (lower.includes('bảng băm') || lower.includes('hash')) {
    return 'Bảng băm (Hash Table)';
  }
  if (lower.includes('mảng') || lower.includes('array')) {
    return 'Cấu trúc Mảng';
  }
  if (lower.includes('chuỗi') || lower.includes('string')) {
    return 'Xử lý Chuỗi';
  }
  if (lower.includes('toán') || lower.includes('math')) {
    return 'Toán rời rạc & Đại số';
  }
  if (lower.includes('cơ sở dữ liệu') || lower.includes('database') || lower.includes('sql')) {
    return 'Cơ sở dữ liệu';
  }
  if (lower.includes('hướng đối tượng') || lower.includes('oop')) {
    return 'Lập trình Hướng đối tượng';
  }

  if (contextStr && !isUuidOrCode(contextStr)) {
    return `Chủ đề: ${cleanDocTitle(contextStr)}`;
  }

  return `Chủ đề #${fallbackIndex}`;
}

export function getBubbleSortStepAction(_stepNum: number): string {
  // Never fake step action strings when real data does not exist
  return '';
}

export function getPedagogicalDefinition(
  _conceptLabel?: string | null,
  _contextTitle?: string | null
): string {
  // Never fake definitions or descriptions when no real data exists from DB / ingestion.
  // Real data must come from conceptDetail, node.definitionText, or node.description.
  return '';
}

export function isAuxiliaryKind(
  kind?: string | null,
  raw?: Record<string, unknown> | null
): boolean {
  const norm = (kind ?? '').trim().toUpperCase();
  if (
    norm === 'DEFINITION' ||
    norm === 'CHUNK' ||
    norm === 'DOCUMENT_CHUNK' ||
    norm === 'DOCUMENTCHUNK' ||
    norm === 'PROCESS' ||
    norm === 'PROCESS_STEP' ||
    norm === 'PROCESSSTEP' ||
    norm === 'EXERCISE' ||
    norm === 'EXERCISE_STEP' ||
    norm === 'EXERCISESTEP' ||
    norm === 'EXAMPLE' ||
    norm === 'ARGUMENT' ||
    norm === 'AUXILIARYDETAIL' ||
    norm === 'AUXILIARY_DETAIL'
  ) {
    return true;
  }

  if (raw) {
    const rawLabels = Array.isArray(raw.labels)
      ? (raw.labels as unknown[])
      : Array.isArray((raw.properties as Record<string, unknown> | undefined)?.labels)
        ? ((raw.properties as Record<string, unknown>).labels as unknown[])
        : [];
    for (const l of rawLabels) {
      if (typeof l === 'string') {
        const u = l.trim().toUpperCase();
        if (
          u.includes('PROCESS') ||
          u.includes('EXERCISE') ||
          u.includes('EXAMPLE') ||
          u.includes('DEFINITION') ||
          u.includes('CHUNK') ||
          u.includes('ARGUMENT')
        ) {
          return true;
        }
      }
    }

    const nameCand = [
      raw.label,
      raw.name,
      raw.title,
      (raw.properties as Record<string, unknown> | undefined)?.name,
      (raw.properties as Record<string, unknown> | undefined)?.title,
      (raw.properties as Record<string, unknown> | undefined)?.label,
    ];
    for (const n of nameCand) {
      if (typeof n === 'string') {
        const s = n.trim().toLowerCase();
        if (
          s.startsWith('bước quy trình') ||
          s.startsWith('bước #') ||
          s.startsWith('step #') ||
          s.startsWith('quy trình thực thi') ||
          s.startsWith('bài tập rèn luyện') ||
          s.startsWith('bài tập minh họa') ||
          s.startsWith('bài tập') ||
          s.startsWith('định nghĩa khái niệm') ||
          s.startsWith('đoạn trích') ||
          s.startsWith('ví dụ minh họa') ||
          s.startsWith('ví dụ') ||
          s.startsWith('lập luận & luận cứ') ||
          s.startsWith('lập luận')
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

export function pickIconForKindAndCategory(
  kind?: string | null,
  category?: string | null
): string {
  const normKind = (kind ?? '').trim().toUpperCase();
  if (normKind === 'DEFINITION') return 'menu_book';
  if (normKind === 'CHUNK') return 'description';
  if (normKind === 'TOPIC') return 'folder_special';
  if (normKind === 'ARGUMENT') return 'forum';
  if (normKind === 'KNOWLEDGE_ENTITY' || normKind === 'KNOWLEDGEENTITY' || normKind === 'CONCEPT')
    return 'psychology';
  if (normKind === 'PROCESS') return 'schema';
  if (normKind === 'PROCESS_STEP' || normKind === 'PROCESSSTEP') return 'format_list_numbered';
  if (normKind === 'EXERCISE') return 'quiz';
  if (normKind === 'EXERCISE_STEP' || normKind === 'EXERCISESTEP') return 'rule';
  if (normKind === 'EXAMPLE') return 'code';

  const normCat = (category ?? '').toLowerCase();
  if (normCat.includes('algo') || normCat.includes('process')) return 'schema';
  if (normCat.includes('icpc') || normCat.includes('exercise')) return 'quiz';
  if (normCat.includes('plo') || normCat.includes('topic')) return 'folder_special';
  if (normCat.includes('math') || normCat.includes('definition')) return 'menu_book';
  if (normCat.includes('ds') || normCat.includes('entity')) return 'psychology';

  return 'hub';
}

function truncateSnippet(text: string, maxLen = 42): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? `${clean.slice(0, maxLen).trim()}…` : clean;
}

function getKindFriendlySublabel(kind?: string | null, topicOrCategory?: string | null): string {
  const norm = (kind ?? '').trim().toUpperCase();
  if (norm === 'DEFINITION') return 'Định nghĩa khái niệm';
  if (norm === 'CHUNK') return 'Đoạn trích tài liệu gốc';
  if (norm === 'TOPIC') return 'Chủ đề phân nhóm';
  if (norm === 'ARGUMENT') return 'Lập luận & Luận cứ';
  if (norm === 'KNOWLEDGE_ENTITY' || norm === 'KNOWLEDGEENTITY' || norm === 'CONCEPT')
    return 'Thực thể tri thức trung tâm';
  if (norm === 'PROCESS') return 'Quy trình thực thi';
  if (norm === 'PROCESS_STEP' || norm === 'PROCESSSTEP') return 'Bước quy trình';
  if (norm === 'EXERCISE') return 'Bài tập rèn luyện';
  if (norm === 'EXERCISE_STEP' || norm === 'EXERCISESTEP') return 'Bước bài tập';
  if (norm === 'EXAMPLE') return 'Ví dụ minh họa';

  if (topicOrCategory && !isUuidOrCode(topicOrCategory)) return topicOrCategory;
  return 'Thực thể tri thức';
}

export function extractNodeDisplayLabel(
  raw: PublishedGraphRawNode & Record<string, unknown>,
  fallbackTitle?: string,
  index = 0,
  contextConceptLabel?: string
): { label: string; sublabel?: string } {
  const normKind = (raw.kind ?? raw.type ?? '').trim().toUpperCase();

  // 1. Direct clean name candidates
  const explicitCandidates = [
    raw.concept,
    raw.conceptName,
    raw.concept_name,
    raw.entityName,
    raw.entity_name,
    raw.canonicalName,
    raw.canonical_name,
    raw.displayName,
    raw.display_name,
    raw.name,
    raw.title,
    raw.label,
  ];

  for (const cand of explicitCandidates) {
    if (typeof cand === 'string' && !isUuidOrCode(cand)) {
      const clean = cand.trim();
      if (clean) {
        return {
          label: clean,
          sublabel: getKindFriendlySublabel(normKind, raw.topic ?? raw.category),
        };
      }
    }
  }

  // 2. Kind-specific semantic extraction
  if (normKind === 'DEFINITION') {
    const defContent =
      extractDefinitionText(raw.definition) ||
      (typeof raw.content === 'string' ? raw.content : '') ||
      (typeof raw.text === 'string' ? raw.text : '') ||
      (typeof raw.description === 'string' ? raw.description : '') ||
      (typeof raw.summary === 'string' ? raw.summary : '');

    return {
      label: defContent ? truncateSnippet(defContent, 46) : 'Định nghĩa khái niệm',
      sublabel: 'Định nghĩa khái niệm',
    };
  }

  if (normKind === 'CHUNK') {
    const locator = typeof raw.locator === 'string' ? raw.locator.trim() : '';
    if (locator) {
      const formattedLoc = locator.toLowerCase().startsWith('page:')
        ? `Trang ${locator.slice(5).trim()}`
        : locator;
      return {
        label: `Đoạn trích (${formattedLoc})`,
        sublabel: 'Đoạn trích tài liệu gốc',
      };
    }
    const heading =
      (typeof raw.heading === 'string' && raw.heading) ||
      (typeof raw.heading_path === 'string' && raw.heading_path) ||
      '';
    if (heading && !isUuidOrCode(heading)) {
      return {
        label: truncateSnippet(heading, 40),
        sublabel: 'Đoạn trích tài liệu gốc',
      };
    }
    const chunkText =
      (typeof raw.text === 'string' && raw.text) ||
      (typeof raw.content === 'string' && raw.content) ||
      '';
    if (chunkText) {
      return {
        label: truncateSnippet(chunkText, 42),
        sublabel: 'Đoạn trích tài liệu gốc',
      };
    }
    return {
      label: `Đoạn trích #${index + 1}`,
      sublabel: 'Đoạn trích tài liệu gốc',
    };
  }

  if (normKind === 'TOPIC') {
    const rawProps = asRecord(raw.properties) ?? {};
    const topicCandidates = [
      raw.topicName,
      raw.topic_name,
      raw.topic,
      raw.name,
      raw.title,
      raw.summary,
      raw.description,
      raw.subject,
      raw.category,
      rawProps.name,
      rawProps.topic,
      rawProps.topicName,
      rawProps.topic_name,
      rawProps.summary,
      rawProps.title,
      rawProps.description,
      rawProps.subject,
    ];

    let foundTopicName: string | null = null;
    for (const cand of topicCandidates) {
      if (typeof cand === 'string' && !isUuidOrCode(cand)) {
        const clean = cand.trim();
        if (clean && clean.toUpperCase() !== 'TOPIC') {
          foundTopicName = clean;
          break;
        }
      }
    }

    const resolvedTopic = deriveTopicDisplayName(
      foundTopicName,
      contextConceptLabel,
      fallbackTitle,
      index + 1
    );

    return {
      label: resolvedTopic,
      sublabel: 'Chủ đề phân nhóm',
    };
  }

  if (normKind === 'ARGUMENT') {
    const claim =
      (typeof raw.claim === 'string' && raw.claim) ||
      (typeof raw.hypothesis === 'string' && raw.hypothesis) ||
      (typeof raw.content === 'string' && raw.content) ||
      (typeof raw.text === 'string' && raw.text) ||
      '';
    if (claim) {
      return {
        label: truncateSnippet(claim, 45),
        sublabel: 'Lập luận & Luận cứ',
      };
    }
    return {
      label: `Lập luận & Luận cứ #${index + 1}`,
      sublabel: 'Lập luận & Luận cứ',
    };
  }

  if (normKind === 'PROCESS') {
    const procName =
      (typeof raw.name === 'string' && raw.name) ||
      (typeof raw.title === 'string' && raw.title) ||
      '';
    return {
      label: procName && !isUuidOrCode(procName) ? procName : 'Quy trình thực thi',
      sublabel: 'Quy trình thực thi',
    };
  }

  if (normKind === 'PROCESS_STEP' || normKind === 'PROCESSSTEP') {
    const stepText =
      (typeof raw.action === 'string' && raw.action) ||
      (typeof raw.content === 'string' && raw.content) ||
      '';
    return {
      label: stepText ? truncateSnippet(stepText, 40) : `Bước quy trình #${index + 1}`,
      sublabel: 'Bước quy trình',
    };
  }

  if (normKind === 'EXERCISE') {
    const exName =
      (typeof raw.name === 'string' && raw.name) ||
      (typeof raw.title === 'string' && raw.title) ||
      '';
    return {
      label: exName && !isUuidOrCode(exName) ? exName : 'Bài tập rèn luyện',
      sublabel: 'Bài tập rèn luyện',
    };
  }

  if (normKind === 'EXAMPLE') {
    const egName =
      (typeof raw.name === 'string' && raw.name) ||
      (typeof raw.title === 'string' && raw.title) ||
      '';
    return {
      label: egName && !isUuidOrCode(egName) ? egName : 'Ví dụ minh họa',
      sublabel: 'Ví dụ minh họa',
    };
  }

  // 3. Central Knowledge Entity fallback (Uses clean document title if concept name was omitted)
  if (normKind === 'KNOWLEDGE_ENTITY' || normKind === 'KNOWLEDGEENTITY' || normKind === 'CONCEPT') {
    const docTitle =
      cleanDocTitle(typeof raw.materialTitle === 'string' ? raw.materialTitle : '') ||
      cleanDocTitle(fallbackTitle) ||
      '';
    if (docTitle && !isUuidOrCode(docTitle)) {
      return {
        label: docTitle.trim(),
        sublabel: 'Thực thể tri thức trung tâm',
      };
    }
    return {
      label: 'Khái niệm tri thức',
      sublabel: 'Thực thể tri thức trung tâm',
    };
  }

  // 4. General fallback
  const cleanedFallback = cleanDocTitle(fallbackTitle);
  if (cleanedFallback && !isUuidOrCode(cleanedFallback)) {
    return {
      label: cleanedFallback.trim(),
      sublabel: getKindFriendlySublabel(normKind, raw.topic ?? raw.category),
    };
  }

  return {
    label: `Thực thể #${index + 1}`,
    sublabel: getKindFriendlySublabel(normKind, raw.topic ?? raw.category),
  };
}

export function formatComplexityTime(kind: string): string {
  const norm = kind.toUpperCase();
  if (norm.startsWith('O(')) return kind;
  if (norm === 'BEGINNER') return 'Cơ bản';
  if (norm === 'INTERMEDIATE') return 'Trung bình';
  if (norm === 'ADVANCED') return 'Nâng cao';
  if (norm === 'DEFINITION') return 'Định nghĩa';
  if (norm === 'CHUNK') return 'Đoạn trích';
  if (norm === 'TOPIC') return 'Chủ đề';
  if (norm === 'ARGUMENT') return 'Luận cứ';
  if (norm === 'KNOWLEDGE_ENTITY' || norm === 'KNOWLEDGEENTITY' || norm === 'CONCEPT') return 'Cơ bản';
  if (norm === 'PROCESS') return 'Quy trình';
  if (norm === 'PROCESS_STEP' || norm === 'PROCESSSTEP') return 'Bước quy trình';
  if (norm === 'EXERCISE') return 'Bài tập';
  if (norm === 'EXERCISE_STEP' || norm === 'EXERCISESTEP') return 'Bước bài tập';
  if (norm === 'EXAMPLE') return 'Ví dụ';
  return 'Cơ bản';
}

function mapCategoryFromBackend(
  category?: string | null,
  kind?: string | null,
  labelOrName?: string | null
): Exclude<KnowledgeCategory, 'all'> {
  const source = `${category ?? ''} ${kind ?? ''} ${labelOrName ?? ''}`.toLowerCase();
  if (source.includes('algo') || source.includes('process') || source.includes('thuật toán') || source.includes('dijkstra')) {
    return 'algo';
  }
  if (source.includes('exercise') || source.includes('icpc') || source.includes('lab') || source.includes('bài tập')) {
    return 'icpc';
  }
  if (source.includes('plo') || source.includes('topic') || source.includes('chuẩn')) {
    return 'plo';
  }
  if (source.includes('math') || source.includes('toán') || source.includes('definition')) {
    return 'math';
  }
  return 'ds';
}

function mapStatusFromBackend(
  status?: string | null,
  masteryPercent?: number | null
): KnowledgeStatus {
  const normalized = (status ?? '').trim().toUpperCase();
  if (normalized === 'MASTERED' || normalized === 'COMPLETED') return 'mastered';
  if (normalized === 'IN_PROGRESS' || normalized === 'LEARNING') return 'learning';
  if (normalized === 'LOCKED') return 'locked';
  if (normalized === 'PREREQUISITE') return 'prerequisite';
  if (typeof masteryPercent === 'number' && masteryPercent >= 80) return 'mastered';
  if (typeof masteryPercent === 'number' && masteryPercent > 0) return 'learning';
  return 'prerequisite';
}

function mapRelationshipType(rawRelation?: string | null): KnowledgeRelationshipType {
  const normalized = (rawRelation ?? '').trim().toUpperCase();
  if (normalized === 'REQUIRES' || normalized === 'DEPENDS_ON' || normalized === 'PREREQUISITE') {
    return 'requires';
  }
  if (normalized === 'CONTRASTS_WITH') return 'optimizes';
  if (
    normalized === 'APPLIES_TO' ||
    normalized === 'USES' ||
    normalized === 'DEFINES' ||
    normalized === 'HAS_DEFINITION' ||
    normalized === 'STEP' ||
    normalized === 'HAS_PROCESS' ||
    normalized === 'HAS_PROCESS_STEP'
  ) {
    return 'solves';
  }
  if (
    normalized === 'PART_OF' ||
    normalized === 'INCLUDES' ||
    normalized === 'BELONGS_TO' ||
    normalized === 'HAS_EXERCISE' ||
    normalized === 'HAS_EXERCISE_STEP' ||
    normalized === 'COVERS'
  ) {
    return 'evaluates';
  }
  return 'extends';
}

/**
 * Deduplicate text at the paragraph level, eliminating exact duplicates,
 * whitespace/CRLF differences, and redundant sub-paragraphs.
 */
export function deduplicateParagraphs(rawText?: string | null): string {
  if (!rawText || typeof rawText !== 'string') return '';
  // 1. Normalize line endings (CRLF -> LF)
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return '';

  // 2. Split into blocks/paragraphs by one or more blank lines
  const paragraphs = normalized
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) return normalized;

  const uniqueParagraphs: string[] = [];
  const seenFingerprints = new Set<string>();

  for (const para of paragraphs) {
    // Generate fingerprint for fuzzy matching (case-insensitive, normalized spaces, stripped trailing punctuation)
    const fingerprint = para
      .toLowerCase()
      .replace(/[.,;:\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!fingerprint) continue;

    // Check exact or normalized duplicate
    if (seenFingerprints.has(fingerprint)) {
      continue;
    }

    // Check if this paragraph is already fully contained inside an existing paragraph (or vice-versa)
    const existingIndex = uniqueParagraphs.findIndex((existing) => {
      const existingFp = existing
        .toLowerCase()
        .replace(/[.,;:\s]+$/, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (existingFp === fingerprint) return true;
      const minLen = Math.min(existingFp.length, fingerprint.length);
      if (minLen >= 40) {
        if (existingFp.includes(fingerprint) || fingerprint.includes(existingFp)) {
          return true;
        }
      }
      return false;
    });

    if (existingIndex >= 0) {
      const existing = uniqueParagraphs[existingIndex];
      // If the new paragraph is longer/more detailed, replace the shorter one
      if (para.length > existing.length) {
        uniqueParagraphs[existingIndex] = para;
        seenFingerprints.delete(
          existing
            .toLowerCase()
            .replace(/[.,;:\s]+$/, '')
            .replace(/\s+/g, ' ')
            .trim()
        );
        seenFingerprints.add(fingerprint);
      }
      continue;
    }

    seenFingerprints.add(fingerprint);
    uniqueParagraphs.push(para);
  }

  return uniqueParagraphs.join('\n\n').trim();
}

/**
 * Deduplicate an array of definition strings, joining them cleanly without paragraph repeats.
 */
export function deduplicateDefinitions(defs: string[]): string {
  if (!defs || defs.length === 0) return '';
  const combined = defs
    .map((d) => (typeof d === 'string' ? d.trim() : ''))
    .filter(Boolean)
    .join('\n\n');
  return deduplicateParagraphs(combined);
}

function extractDefinitionText(
  def?: string | Record<string, unknown> | null
): string {
  if (typeof def === 'string') return def.trim();
  if (def && typeof def === 'object') {
    const candidates = [
      def.content,
      def.text,
      def.statement,
      def.description,
      def.meaning,
      def.details,
      def.explanation,
      def.formula,
      def.definition,
    ];
    for (const cand of candidates) {
      if (typeof cand === 'string' && cand.trim() && !isUuidOrCode(cand.trim())) {
        return cand.trim();
      }
    }
  }
  return '';
}

export function extractTextFromAnyNode(
  raw?: (PublishedGraphRawNode & Record<string, unknown>) | null
): string {
  if (!raw) return '';
  const props = asRecord(raw.properties) ?? {};
  const candidates = [
    raw.statement,
    props.statement,
    extractDefinitionText(raw.definition),
    extractDefinitionText(props.definition as string | Record<string, unknown> | undefined),
    raw.content,
    props.content,
    raw.text,
    props.text,
    raw.description,
    props.description,
    raw.summary,
    props.summary,
    raw.explanation,
    props.explanation,
    raw.details,
    props.details,
    raw.meaning,
    props.meaning,
    raw.formula,
    props.formula,
    raw.value,
    props.value,
    raw.val,
    props.val,
    raw.name,
    props.name,
    raw.title,
    props.title,
    raw.label,
    props.label,
  ];

  for (const cand of candidates) {
    if (typeof cand === 'string') {
      const clean = cand.trim();
      if (
        clean &&
        !isUuidOrCode(clean) &&
        clean !== 'Định nghĩa khái niệm' &&
        clean !== 'Đoạn trích tài liệu gốc' &&
        clean !== 'Thực thể tri thức' &&
        clean !== 'Thực thể tri thức trung tâm' &&
        clean.length > 5
      ) {
        return clean;
      }
    }
  }
  return '';
}

function unpackRawNode(
  raw: PublishedGraphRawNode & Record<string, unknown>
): PublishedGraphRawNode & Record<string, unknown> {
  const attrs = asRecord(raw.attributes) ?? {};
  const directProps = asRecord(raw.properties) ?? {};
  const props = { ...directProps, ...attrs };

  const pickFirstValid = (...vals: unknown[]): string | undefined => {
    for (const v of vals) {
      if (typeof v === 'string' && v.trim() && !isUuidOrCode(v)) {
        return v.trim();
      }
    }
    return undefined;
  };

  const nameVal = pickFirstValid(
    props.name,
    props.title,
    props.label,
    raw.name,
    raw.title,
    raw.label,
    raw.concept,
    raw.conceptName,
    raw.concept_name,
    raw.entityName,
    raw.entity_name
  );
  const topicVal = pickFirstValid(
    props.topic,
    props.topicName,
    props.topic_name,
    raw.topic,
    raw.topicName,
    raw.topic_name
  );
  const defVal =
    extractDefinitionText(props.content as string | Record<string, unknown> | undefined) ||
    extractDefinitionText(props.definition as string | Record<string, unknown> | undefined) ||
    extractDefinitionText(props.description as string | Record<string, unknown> | undefined) ||
    extractDefinitionText(raw.definition) ||
    extractDefinitionText(raw.description as string | Record<string, unknown> | undefined) ||
    extractDefinitionText(raw.content as string | Record<string, unknown> | undefined) ||
    undefined;

  let detectedKind =
    (typeof raw.kind === 'string' && raw.kind.trim()) ||
    (typeof props.kind === 'string' && props.kind.trim()) ||
    (typeof raw.type === 'string' && raw.type.trim()) ||
    (typeof props.type === 'string' && props.type.trim()) ||
    undefined;

  if (!detectedKind) {
    const rawLabels = Array.isArray(raw.labels)
      ? (raw.labels as unknown[])
      : Array.isArray(props.labels)
        ? (props.labels as unknown[])
        : [];
    for (const l of rawLabels) {
      if (typeof l === 'string' && l.trim()) {
        const u = l.trim().toUpperCase();
        if (
          u.includes('PROCESS_STEP') ||
          u.includes('PROCESSSTEP') ||
          u.includes('PROCESS') ||
          u.includes('EXERCISE_STEP') ||
          u.includes('EXERCISESTEP') ||
          u.includes('EXERCISE') ||
          u.includes('EXAMPLE') ||
          u.includes('DEFINITION') ||
          u.includes('CHUNK') ||
          u.includes('ARGUMENT') ||
          u.includes('TOPIC') ||
          u.includes('KNOWLEDGE') ||
          u.includes('CONCEPT')
        ) {
          detectedKind = u;
          break;
        }
      }
    }
  }

  if (!detectedKind) {
    const candName = (nameVal ?? props.name ?? props.title ?? raw.name ?? raw.title ?? raw.label) as string | undefined;
    if (typeof candName === 'string') {
      const s = candName.trim().toLowerCase();
      if (s.startsWith('bước quy trình') || s.startsWith('bước #') || s.startsWith('step #')) {
        detectedKind = 'PROCESS_STEP';
      } else if (s.startsWith('quy trình') || s === 'quy trình thực thi') {
        detectedKind = 'PROCESS';
      } else if (s.startsWith('bài tập')) {
        detectedKind = 'EXERCISE';
      } else if (s.startsWith('ví dụ') || s.startsWith('example')) {
        detectedKind = 'EXAMPLE';
      } else if (s.startsWith('định nghĩa')) {
        detectedKind = 'DEFINITION';
      } else if (s.startsWith('đoạn trích') || s.startsWith('page:')) {
        detectedKind = 'CHUNK';
      } else if (s.startsWith('lập luận')) {
        detectedKind = 'ARGUMENT';
      } else if (s.startsWith('chủ đề')) {
        detectedKind = 'TOPIC';
      }
    }
  }

  // Ensure algorithms & core entities like Dijkstra are never treated as a Topic
  const checkAlgorithmName = `${nameVal ?? ''} ${props.name ?? ''} ${props.title ?? ''} ${raw.name ?? ''} ${raw.title ?? ''} ${raw.label ?? ''}`.toLowerCase();
  if (/thuật toán|algorithm|giải thuật|dijkstra/i.test(checkAlgorithmName)) {
    if (!detectedKind || detectedKind.toUpperCase() === 'TOPIC') {
      detectedKind = 'KnowledgeEntity';
    }
  }

  const stepNumber =
    typeof props.step_number === 'number'
      ? props.step_number
      : typeof props.stepNumber === 'number'
        ? props.stepNumber
        : typeof props.order === 'number'
          ? props.order
          : typeof raw.stepNumber === 'number'
            ? raw.stepNumber
            : undefined;

  const actionText =
    (typeof props.action === 'string' && props.action.trim()) ||
    (typeof raw.action === 'string' && raw.action.trim()) ||
    undefined;

  const exceptions = Array.isArray(props.exceptions)
    ? (props.exceptions as string[])
    : Array.isArray(raw.exceptions)
      ? (raw.exceptions as string[])
      : undefined;

  const conditions = Array.isArray(props.conditions)
    ? (props.conditions as string[])
    : Array.isArray(raw.conditions)
      ? (raw.conditions as string[])
      : undefined;

  const finalId =
    raw.nodeId ??
    raw.id ??
    (typeof raw.canonicalCode === 'string' ? raw.canonicalCode : undefined) ??
    (typeof raw.canonical_code === 'string' ? raw.canonical_code : undefined);

  return {
    ...props,
    ...raw,
    id: finalId ?? undefined,
    nodeId: (raw.nodeId ?? raw.id ?? finalId) ?? undefined,
    name: nameVal ?? (typeof props.name === 'string' ? props.name : raw.name),
    title: (props.title ?? raw.title ?? (typeof props.name === 'string' ? props.name : undefined)) as string | undefined,
    label: (nameVal ?? raw.label ?? (typeof props.label === 'string' ? props.label : undefined)) as string | undefined,
    topic: topicVal ?? (raw.topic as string | undefined),
    topicName: (props.topicName ?? props.topic_name ?? raw.topicName ?? raw.topic_name) as string | undefined,
    topic_name: (props.topic_name ?? props.topicName ?? raw.topic_name ?? raw.topicName) as string | undefined,
    definition: defVal ?? raw.definition,
    summary: (props.summary ?? raw.summary) as string | undefined,
    description: (props.description ?? raw.description ?? defVal) as string | undefined,
    statement: (props.statement ?? raw.statement) as string | undefined,
    explanation: (props.explanation ?? raw.explanation) as string | undefined,
    details: (props.details ?? raw.details) as string | undefined,
    meaning: (props.meaning ?? raw.meaning) as string | undefined,
    formula: (props.formula ?? raw.formula) as string | undefined,
    subject: (props.subject ?? raw.subject) as string | undefined,
    concept: (raw.concept ?? (typeof props.concept === 'string' ? props.concept : undefined)) as string | null | undefined,
    conceptName: (raw.conceptName ?? (typeof props.conceptName === 'string' ? props.conceptName : undefined)) as string | null | undefined,
    kind: (detectedKind ?? raw.kind ?? (typeof props.kind === 'string' ? props.kind : undefined) ?? (typeof props.type === 'string' ? props.type : undefined)) as string | null | undefined,
    type: (detectedKind ?? raw.type ?? (typeof props.type === 'string' ? props.type : undefined)) as string | null | undefined,
    action: actionText,
    content: (props.content ?? raw.content) as string | null | undefined,
    text: (props.text ?? raw.text) as string | null | undefined,
    locator: (props.locator ?? raw.locator) as string | null | undefined,
    stepNumber,
    materialId: (raw.materialId ?? (typeof props.materialId === 'string' ? props.materialId : undefined)) as string | null | undefined,
    materialTitle: (raw.materialTitle ?? (typeof props.materialTitle === 'string' ? props.materialTitle : undefined)) as string | null | undefined,
    exceptions,
    conditions,
  };
}

export function mapRawGraphToCanvasData(
  rawNodes: PublishedGraphRawNode[],
  rawEdges: PublishedGraphRawEdge[],
  title?: string
): KnowledgeGraphResult {
  // 1. Unpack properties if backend sent nested properties inside nodes
  const unpackedNodes = rawNodes.map((n) =>
    unpackRawNode(n as PublishedGraphRawNode & Record<string, unknown>)
  );

  // Derive graph title fallback if missing from root
  const effectiveTitle =
    title ||
    unpackedNodes.find((n) => typeof n.materialTitle === 'string' && n.materialTitle)?.materialTitle ||
    undefined;

  const incomingCounts = new Map<string, number>();
  const outgoingMap = new Map<string, string[]>();
  const prereqMap = new Map<string, string[]>();

  // 2. Build a comprehensive node lookup table to resolve aliases (id, nodeId, canonicalCode, concept, name, etc.)
  const nodeLookup = new Map<string, string>();
  unpackedNodes.forEach((raw, index) => {
    const finalId = raw.id ?? raw.nodeId ?? raw.canonicalCode ?? raw.canonical_code ?? `node-${index}`;
    const registerKey = (key?: string | null) => {
      if (!key) return;
      const trimmed = key.trim();
      if (!trimmed) return;
      nodeLookup.set(trimmed, finalId);
      nodeLookup.set(trimmed.toLowerCase(), finalId);
    };

    registerKey(raw.id);
    registerKey(raw.nodeId);
    registerKey(raw.canonicalCode);
    registerKey(raw.canonical_code);
    registerKey(raw.concept);
    registerKey(raw.conceptName);
    registerKey(raw.concept_name);
    registerKey(raw.entityName);
    registerKey(raw.entity_name);
    registerKey(raw.name);
    registerKey(raw.title);
    registerKey(raw.label);
    registerKey(finalId);
  });

  const existingEdgeSet = new Set<string>();
  const edges: KnowledgeEdgeData[] = [];

  // 3. Parse provided raw edges with resolution via nodeLookup
  rawEdges.forEach((raw, index) => {
    const rawSource =
      raw.fromNodeId ??
      raw.from_node_id ??
      raw.source ??
      raw.from ??
      raw.sourceId ??
      raw.source_id ??
      raw.startNode ??
      raw.start_node ??
      '';
    const rawTarget =
      raw.toNodeId ??
      raw.to_node_id ??
      raw.target ??
      raw.to ??
      raw.targetId ??
      raw.target_id ??
      raw.endNode ??
      raw.end_node ??
      '';
    if (!rawSource || !rawTarget) return;

    const source = nodeLookup.get(rawSource) ?? nodeLookup.get(rawSource.trim().toLowerCase()) ?? rawSource;
    const target = nodeLookup.get(rawTarget) ?? nodeLookup.get(rawTarget.trim().toLowerCase()) ?? rawTarget;
    if (!source || !target || source === target) return;

    const rawRelation =
      raw.kind ??
      raw.relation ??
      raw.relationType ??
      raw.relation_type ??
      raw.type ??
      'RELATED_TO';
    const relationshipType = mapRelationshipType(rawRelation);

    incomingCounts.set(target, (incomingCounts.get(target) ?? 0) + 1);
    outgoingMap.set(source, [...(outgoingMap.get(source) ?? []), target]);
    if (relationshipType === 'requires') {
      prereqMap.set(target, [...(prereqMap.get(target) ?? []), source]);
    }

    const edgeKey = `${source}->${target}`;
    existingEdgeSet.add(edgeKey);
    existingEdgeSet.add(`${target}->${source}`);

    edges.push({
      id: raw.edgeId ?? raw.id ?? `edge-${source}-${target}-${index}`,
      source,
      target,
      rawRelation,
      label: raw.label ?? formatRelationLabel(rawRelation),
      relationshipType,
      animated: relationshipType === 'requires',
      dashed: relationshipType === 'optimizes' || relationshipType === 'evaluates',
      weight: raw.weight ?? 1,
    });
  });

  // 4. Identify the centerpiece / core knowledge entity
  let centerpieceId: string | null = null;
  const knowledgeEntityRaw = unpackedNodes.find((raw) => {
    const k = (raw.kind ?? raw.type ?? '').toUpperCase();
    return k === 'KNOWLEDGE_ENTITY' || k === 'KNOWLEDGEENTITY' || k === 'CONCEPT';
  });
  if (knowledgeEntityRaw) {
    centerpieceId =
      knowledgeEntityRaw.id ??
      knowledgeEntityRaw.nodeId ??
      knowledgeEntityRaw.canonicalCode ??
      knowledgeEntityRaw.canonical_code ??
      null;
  }

  if (!centerpieceId && unpackedNodes.length >= 3) {
    let bestDegree = -1;
    for (const raw of unpackedNodes) {
      const id = raw.id ?? raw.nodeId ?? raw.canonicalCode ?? raw.canonical_code ?? '';
      if (!id) continue;
      const degree = (incomingCounts.get(id) ?? 0) + (outgoingMap.get(id)?.length ?? 0);
      if (degree > bestDegree) {
        bestDegree = degree;
        centerpieceId = id;
      }
    }
  }

  // 5. Aggregate satellite content into KnowledgeEntity per entity (Edge-aware Satellite Aggregation)
  const coreEntities = unpackedNodes.filter((raw) => {
    const k = (raw.kind ?? raw.type ?? '').trim().toUpperCase();
    return !isAuxiliaryKind(k, raw) && k !== 'TOPIC';
  });

  const effectiveCoreEntities = coreEntities.length > 0
    ? coreEntities
    : unpackedNodes.filter((n, idx) => {
        const id = n.id ?? n.nodeId ?? n.canonicalCode ?? n.canonical_code ?? `node-${idx}`;
        return id === centerpieceId;
      });

  interface ProcessBucket {
    id?: string;
    name: string;
    description?: string;
    steps: Array<{ stepNumber: number; action: string }>;
  }
  interface ExerciseBucket {
    id?: string;
    title: string;
    content: string;
    steps: Array<{ stepNumber: number; action: string }>;
  }

  const entityDataMap = new Map<string, {
    definitions: string[];
    exceptions: string[];
    conditions: string[];
    chunks: Array<{ id?: string; locator?: string; text?: string }>;
    processes: Map<string, ProcessBucket>;
    unattachedSteps: Array<{ stepNumber: number; action: string }>;
    exercises: Map<string, ExerciseBucket>;
    unattachedExerciseSteps: Array<{ stepNumber: number; action: string }>;
    examples: Array<{ id?: string; title: string; explanation?: string; codeSnippet?: string }>;
    arguments: Array<{ id?: string; hypothesis: string; evidence: string; conclusion?: string }>;
  }>();

  effectiveCoreEntities.forEach((entity, idx) => {
    const entityId = entity.id ?? entity.nodeId ?? entity.canonicalCode ?? entity.canonical_code ?? `entity-${idx}`;
    entityDataMap.set(entityId, {
      definitions: [],
      exceptions: [],
      conditions: [],
      chunks: [],
      processes: new Map(),
      unattachedSteps: [],
      exercises: new Map(),
      unattachedExerciseSteps: [],
      examples: [],
      arguments: [],
    });
  });

  // Map each satellite to its parent core entity using BFS over the graph edges
  const auxiliaryParentMap = new Map<string, { parentId: string; parentLabel: string }>();

  // Build undirected adjacency list for BFS
  const adj = new Map<string, string[]>();
  edges.forEach((e) => {
    adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]);
    adj.set(e.target, [...(adj.get(e.target) ?? []), e.source]);
  });

  effectiveCoreEntities.forEach((entity, idx) => {
    const entityId = entity.id ?? entity.nodeId ?? entity.canonicalCode ?? entity.canonical_code ?? `entity-${idx}`;
    const parentLabel = extractNodeDisplayLabel(entity, effectiveTitle, idx).label;
    const queue = [entityId];
    const visited = new Set<string>([entityId]);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const neighbors = adj.get(curr) ?? [];
      for (const nbr of neighbors) {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          if (!entityDataMap.has(nbr)) {
            if (!auxiliaryParentMap.has(nbr)) {
              auxiliaryParentMap.set(nbr, { parentId: entityId, parentLabel });
            }
            queue.push(nbr);
          }
        }
      }
    }
  });

  // Fallback for any disconnected auxiliary nodes
  const defaultCoreId =
    effectiveCoreEntities[0]?.id ??
    effectiveCoreEntities[0]?.nodeId ??
    effectiveCoreEntities[0]?.canonicalCode ??
    centerpieceId;
  const defaultCoreLabel = effectiveCoreEntities[0]
    ? extractNodeDisplayLabel(effectiveCoreEntities[0], effectiveTitle, 0).label
    : cleanDocTitle(effectiveTitle);

  if (defaultCoreId) {
    unpackedNodes.forEach((raw, idx) => {
      const normKind = (raw.kind ?? raw.type ?? '').trim().toUpperCase();
      if (!isAuxiliaryKind(normKind, raw)) return;
      const id = raw.id ?? raw.nodeId ?? raw.canonicalCode ?? raw.canonical_code ?? `node-${idx}`;
      if (!auxiliaryParentMap.has(id)) {
        auxiliaryParentMap.set(id, { parentId: defaultCoreId, parentLabel: defaultCoreLabel });
      }
    });
  }

  // 6. Aggregate data from each auxiliary node into its parent core entity bucket
  unpackedNodes.forEach((raw, idx) => {
    const normKind = (raw.kind ?? raw.type ?? '').trim().toUpperCase();
    const id = raw.id ?? raw.nodeId ?? raw.canonicalCode ?? raw.canonical_code ?? `node-${idx}`;

    // If it's a core entity, seed its own definition/description/exceptions if present
    if (!isAuxiliaryKind(normKind, raw) && normKind !== 'TOPIC') {
      const selfBucket = entityDataMap.get(id);
      if (selfBucket) {
        if (raw.description && !isUuidOrCode(raw.description)) {
          selfBucket.definitions.push(raw.description.replace(/\r\n/g, '\n').trim());
        }
        const rawSourceRefs = Array.isArray(raw.sourceRefs)
          ? (raw.sourceRefs as Array<Record<string, unknown>>)
          : [];
        rawSourceRefs.forEach((sr, srIdx) => {
          if (typeof sr.excerpt === 'string' && sr.excerpt.trim()) {
            const ex = sr.excerpt.replace(/\r\n/g, '\n').trim();
            if (!selfBucket.definitions.includes(ex)) {
              selfBucket.definitions.push(ex);
            }
            selfBucket.chunks.push({
              id: (sr.chunkId as string) || `sr-${id}-${srIdx}`,
              text: ex,
            });
          }
        });
        if (Array.isArray(raw.exceptions)) {
          selfBucket.exceptions.push(...raw.exceptions);
        }
        if (Array.isArray(raw.conditions)) {
          selfBucket.conditions.push(...raw.conditions);
        }
      }
      return;
    }

    if (!isAuxiliaryKind(normKind, raw)) return;

    const parentInfo = auxiliaryParentMap.get(id);
    if (!parentInfo) return;
    const bucket = entityDataMap.get(parentInfo.parentId);
    if (!bucket) return;

    if (normKind === 'DEFINITION') {
      const text =
        (typeof raw.content === 'string' && raw.content.trim()) ||
        (typeof raw.description === 'string' && raw.description.trim()) ||
        (typeof raw.text === 'string' && raw.text.trim()) ||
        extractTextFromAnyNode(raw) ||
        extractDefinitionText(raw.definition);
      if (text && !isUuidOrCode(text)) {
        bucket.definitions.push(text.replace(/\r\n/g, '\n').trim());
      }
      if (Array.isArray(raw.exceptions)) {
        bucket.exceptions.push(...raw.exceptions);
      }
      if (Array.isArray(raw.conditions)) {
        bucket.conditions.push(...raw.conditions);
      }
    } else if (normKind === 'PROCESS') {
      const procName =
        (typeof raw.name === 'string' && raw.name.trim()) ||
        (typeof raw.title === 'string' && raw.title.trim()) ||
        'Quy trình thực thi';
      const procDesc =
        (typeof raw.description === 'string' && raw.description.trim()) ||
        (typeof raw.summary === 'string' && raw.summary.trim()) ||
        undefined;
      if (!bucket.processes.has(id)) {
        bucket.processes.set(id, { id, name: procName, description: procDesc, steps: [] });
      }
    } else if (normKind === 'PROCESS_STEP' || normKind === 'PROCESSSTEP') {
      const stepMatch = (raw.name || raw.title || raw.label || '').match(/#(\d+)|bước\s*(\d+)|step\s*(\d+)/i);
      const parsedNum = stepMatch ? parseInt(stepMatch[1] || stepMatch[2] || stepMatch[3], 10) : undefined;
      const num = typeof raw.stepNumber === 'number' ? raw.stepNumber : parsedNum ?? (idx + 1);

      const actionText =
        (typeof raw.action === 'string' && raw.action.trim()) ||
        (typeof raw.content === 'string' && raw.content.trim()) ||
        (typeof raw.text === 'string' && raw.text.trim()) ||
        (typeof raw.description === 'string' && raw.description.trim()) ||
        `Bước ${num}`;

      let attached = false;
      const connectedEdges = edges.filter((e) => e.source === id || e.target === id);
      for (const ce of connectedEdges) {
        const otherId = ce.source === id ? ce.target : ce.source;
        if (bucket.processes.has(otherId)) {
          bucket.processes.get(otherId)!.steps.push({ stepNumber: num, action: actionText });
          attached = true;
          break;
        }
      }
      if (!attached) {
        bucket.unattachedSteps.push({ stepNumber: num, action: actionText });
      }
    } else if (normKind === 'EXERCISE') {
      const exTitle =
        (typeof raw.title === 'string' && raw.title.trim()) ||
        (typeof raw.name === 'string' && raw.name.trim()) ||
        'Bài tập rèn luyện';
      const exContent =
        (typeof raw.content === 'string' && raw.content.trim()) ||
        (typeof raw.description === 'string' && raw.description.trim()) ||
        (typeof raw.summary === 'string' && raw.summary.trim()) ||
        'Thực hành giải thuật.';
      if (!bucket.exercises.has(id)) {
        bucket.exercises.set(id, { id, title: exTitle, content: exContent, steps: [] });
      }
    } else if (normKind === 'EXERCISE_STEP' || normKind === 'EXERCISESTEP') {
      const stepMatch = (raw.name || raw.title || raw.label || '').match(/#(\d+)|bước\s*(\d+)|step\s*(\d+)/i);
      const parsedNum = stepMatch ? parseInt(stepMatch[1] || stepMatch[2] || stepMatch[3], 10) : undefined;
      const num = typeof raw.stepNumber === 'number' ? raw.stepNumber : parsedNum ?? 1;

      const actionText =
        (typeof raw.action === 'string' && raw.action.trim()) ||
        (typeof raw.content === 'string' && raw.content.trim()) ||
        (typeof raw.text === 'string' && raw.text.trim()) ||
        `Yêu cầu bước ${num}`;

      let attached = false;
      const connectedEdges = edges.filter((e) => e.source === id || e.target === id);
      for (const ce of connectedEdges) {
        const otherId = ce.source === id ? ce.target : ce.source;
        if (bucket.exercises.has(otherId)) {
          bucket.exercises.get(otherId)!.steps.push({ stepNumber: num, action: actionText });
          attached = true;
          break;
        }
      }
      if (!attached) {
        bucket.unattachedExerciseSteps.push({ stepNumber: num, action: actionText });
      }
    } else if (normKind === 'EXAMPLE') {
      const egTitle =
        (typeof raw.title === 'string' && raw.title.trim()) ||
        (typeof raw.name === 'string' && raw.name.trim()) ||
        'Ví dụ minh họa';
      const explanation =
        (typeof raw.description === 'string' ? raw.description : '') ||
        (typeof raw.content === 'string' ? raw.content : '') ||
        '';
      const codeSnippet =
        (typeof (raw as Record<string, unknown>).codeSnippet === 'string'
          ? (raw as Record<string, unknown>).codeSnippet
          : typeof (raw as Record<string, unknown>).code === 'string'
            ? (raw as Record<string, unknown>).code
            : undefined) as string | undefined;
      bucket.examples.push({ id, title: egTitle, explanation, codeSnippet });
    } else if (normKind === 'CHUNK') {
      const text =
        (typeof raw.content === 'string' ? raw.content : '') ||
        (typeof raw.text === 'string' ? raw.text : '') ||
        extractTextFromAnyNode(raw) ||
        '';
      const loc = typeof raw.locator === 'string' ? raw.locator : undefined;
      if (text.trim() || loc) {
        bucket.chunks.push({ id, locator: loc, text: text.trim() });
      }
    } else if (normKind === 'ARGUMENT') {
      const hyp =
        (typeof raw.hypothesis === 'string' ? raw.hypothesis : '') ||
        (typeof raw.claim === 'string' ? raw.claim : '') ||
        '';
      const evi =
        (typeof raw.evidence === 'string' ? raw.evidence : '') ||
        (typeof raw.content === 'string' ? raw.content : '') ||
        '';
      if (hyp || evi) {
        bucket.arguments.push({ id, hypothesis: hyp, evidence: evi });
      }
    }
  });

  const centerpieceLabel = knowledgeEntityRaw
    ? extractNodeDisplayLabel(knowledgeEntityRaw, effectiveTitle, 0).label
    : cleanDocTitle(effectiveTitle);

  // 7. Core node set to sanitize learning dependencies
  const coreNodeIdSet = new Set<string>();
  unpackedNodes.forEach((raw, index) => {
    const normKind = (raw.kind ?? raw.type ?? '').trim().toUpperCase();
    if (!isAuxiliaryKind(normKind, raw)) {
      const id = raw.id ?? raw.nodeId ?? raw.canonicalCode ?? raw.canonical_code ?? `node-${index}`;
      coreNodeIdSet.add(id);
    }
  });

  // 8. Build final KnowledgeNodeData objects
  const nodes: KnowledgeNodeData[] = unpackedNodes
    .map((raw, index) => {
      const id = raw.id ?? raw.nodeId ?? raw.canonicalCode ?? raw.canonical_code ?? `node-${index}`;
      const canonicalCode = raw.canonicalCode ?? raw.canonical_code ?? id;
      const rawName = (raw.name || raw.label || raw.title || raw.concept || '').trim();
      let rawKind = (raw.kind ?? raw.type ?? '').trim();

      // Explicitly protect algorithms/concepts like Dijkstra from ever being misclassified as a Topic
      if (/thuật toán|algorithm|giải thuật|dijkstra/i.test(rawName) && (!rawKind || rawKind.toUpperCase() === 'TOPIC')) {
        rawKind = 'KnowledgeEntity';
      }

      const normKind = rawKind.toUpperCase();
      const isAuxiliary = isAuxiliaryKind(normKind, raw);

      const { label, sublabel } = extractNodeDisplayLabel(
        raw,
        effectiveTitle,
        index,
        centerpieceLabel
      );
      const category = mapCategoryFromBackend(raw.category ?? raw.topic, rawKind, rawName || label);
      const icon = pickIconForKindAndCategory(rawKind, category);
      const masteryScore = Math.max(0, Math.min(100, raw.masteryPercent ?? 0));
      const status = mapStatusFromBackend(raw.status, masteryScore);

      const allPrereqs =
        raw.prerequisites && raw.prerequisites.length > 0
          ? raw.prerequisites.map((p) => nodeLookup.get(p) ?? p)
          : prereqMap.get(id) ?? [];
      const allSuccessors = outgoingMap.get(id) ?? [];

      const prerequisites = isAuxiliary
        ? allPrereqs
        : allPrereqs.filter((targetId) => {
            if (!coreNodeIdSet.has(targetId)) return false;
            const targetNode = unpackedNodes.find(
              (n) => (n.id ?? n.nodeId ?? n.canonicalCode ?? n.canonical_code) === targetId
            );
            const targetKind = (targetNode?.kind ?? targetNode?.type ?? '').toUpperCase();
            if (targetKind === 'TOPIC') return false;
            return true;
          });
      const successors = isAuxiliary
        ? allSuccessors
        : allSuccessors.filter((targetId) => {
            if (!coreNodeIdSet.has(targetId)) return false;
            const targetNode = unpackedNodes.find(
              (n) => (n.id ?? n.nodeId ?? n.canonicalCode ?? n.canonical_code) === targetId
            );
            const targetKind = (targetNode?.kind ?? targetNode?.type ?? '').toUpperCase();
            if (targetKind === 'TOPIC') return false;
            return true;
          });

      const isCoreConcept = !isAuxiliary && (normKind.includes('KNOWLEDGE') || normKind === 'CONCEPT' || id === centerpieceId || (!isAuxiliary && normKind !== 'TOPIC'));
      const auxInfo = auxiliaryParentMap.get(id);

      const auxStepNumber = typeof raw.stepNumber === 'number'
        ? raw.stepNumber
        : (() => {
            const m = (raw.name || raw.title || raw.label || '').match(/#(\d+)|bước\s*(\d+)|step\s*(\d+)/i);
            return m ? parseInt(m[1] || m[2] || m[3], 10) : undefined;
          })();

      const auxActionText =
        (typeof raw.action === 'string' && raw.action.trim()) ||
        (typeof raw.content === 'string' && raw.content.trim()) ||
        (typeof raw.text === 'string' && raw.text.trim()) ||
        (typeof raw.description === 'string' && raw.description.trim()) ||
        (auxStepNumber ? `Bước ${auxStepNumber}` : undefined);

      const entityBucket = entityDataMap.get(id);

      // Final processes array:
      const procList = Array.from(entityBucket?.processes.values() ?? []);
      if (entityBucket && entityBucket.unattachedSteps.length > 0) {
        if (procList.length > 0) {
          procList[0].steps.push(...entityBucket.unattachedSteps);
        } else {
          procList.push({
            name: 'Quy trình thực thi',
            steps: entityBucket.unattachedSteps,
          });
        }
      }
      procList.forEach((p) => {
        p.steps.sort((a, b) => a.stepNumber - b.stepNumber);
        p.steps = p.steps.map((s, stepIndex) => ({
          stepNumber: stepIndex + 1,
          action: s.action,
        }));
      });

      // Final exercises array:
      const exList = Array.from(entityBucket?.exercises.values() ?? []);
      if (entityBucket && entityBucket.unattachedExerciseSteps.length > 0) {
        if (exList.length > 0) {
          exList[0].steps.push(...entityBucket.unattachedExerciseSteps);
        } else {
          exList.push({
            title: 'Bài tập rèn luyện',
            content: 'Thực hành giải thuật.',
            steps: entityBucket.unattachedExerciseSteps,
          });
        }
      }
      exList.forEach((e) => {
        if (e.steps) {
          e.steps.sort((a, b) => a.stepNumber - b.stepNumber);
          e.steps = e.steps.map((s, stepIndex) => ({
            stepNumber: stepIndex + 1,
            action: s.action,
          }));
        }
      });

      let effectiveDefText = '';
      if (isCoreConcept) {
        if (entityBucket?.definitions.length) {
          effectiveDefText = deduplicateDefinitions(entityBucket.definitions);
        }
        if (!effectiveDefText && raw.description && !isUuidOrCode(raw.description)) {
          effectiveDefText = deduplicateParagraphs(raw.description);
        }
        if (!effectiveDefText && entityBucket?.chunks.length && entityBucket.chunks[0].text) {
          effectiveDefText = deduplicateParagraphs(entityBucket.chunks[0].text);
        }
        if (!effectiveDefText) {
          const candidatePedagogical = getPedagogicalDefinition(label, effectiveTitle);
          if (
            candidatePedagogical &&
            !candidatePedagogical.startsWith('Khái niệm tri thức nền tảng trong chương trình đào tạo')
          ) {
            effectiveDefText = candidatePedagogical;
          }
        }
      }

      const description = isCoreConcept
        ? effectiveDefText
        : isAuxiliary
          ? (auxActionText || raw.description || raw.summary || extractTextFromAnyNode(raw) || '')
          : normKind === 'TOPIC'
            ? `Chủ đề phân nhóm: ${label}`
            : (raw.description || raw.summary || extractTextFromAnyNode(raw) || '');

      return {
        id,
        label,
        sublabel: sublabel ?? raw.topic ?? raw.category ?? undefined,
        canonicalCode,
        topic: raw.topic ?? raw.category ?? undefined,
        kind: rawKind || (isAuxiliary ? 'AuxiliaryDetail' : 'KnowledgeEntity'),
        isAuxiliary,
        parentEntityId: auxInfo?.parentId,
        parentEntityLabel: auxInfo?.parentLabel,
        auxiliaryActionText: auxActionText,
        stepNumber: auxStepNumber,
        materialId: raw.materialId ?? undefined,
        materialTitle: raw.materialTitle ?? effectiveTitle ?? undefined,
        linkedLessonIds: raw.linkedLessonIds ?? [],
        category,
        status,
        masteryScore,
        complexity: {
          time: raw.level ?? (raw.kind ? formatComplexityTime(raw.kind) : 'Cơ bản'),
          space: raw.topic ?? 'Neo4j',
        },
        description,
        icon,
        isCenterpiece: id === centerpieceId,
        relatedCount: prerequisites.length + successors.length,
        prerequisites,
        successors,
        definitionText: isCoreConcept ? effectiveDefText : undefined,
        exceptions: isCoreConcept && entityBucket && entityBucket.exceptions.length > 0 ? entityBucket.exceptions : (Array.isArray(raw.exceptions) ? raw.exceptions : undefined),
        conditions: isCoreConcept && entityBucket && entityBucket.conditions.length > 0 ? entityBucket.conditions : (Array.isArray(raw.conditions) ? raw.conditions : undefined),
        processes: isCoreConcept && procList.length > 0 ? procList : undefined,
        exercises: isCoreConcept && exList.length > 0 ? exList : undefined,
        examples: isCoreConcept && entityBucket && entityBucket.examples.length > 0 ? entityBucket.examples : undefined,
        arguments: isCoreConcept && entityBucket && entityBucket.arguments.length > 0 ? entityBucket.arguments : undefined,
        chunks: isCoreConcept && entityBucket && entityBucket.chunks.length > 0 ? entityBucket.chunks : undefined,
      };
    })
    .filter((n) => Boolean(n.id));

  // Tag edges as auxiliary if either endpoint is an auxiliary node
  const auxiliaryNodeIdSet = new Set(nodes.filter((n) => n.isAuxiliary).map((n) => n.id));
  const finalEdges = edges.map((e) => ({
    ...e,
    isAuxiliary: auxiliaryNodeIdSet.has(e.source) || auxiliaryNodeIdSet.has(e.target),
  }));

  return { title: effectiveTitle, nodes, edges: finalEdges };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseGraphNodesAndEdges(payload: unknown): {
  title?: string;
  rawNodes: PublishedGraphRawNode[];
  rawEdges: PublishedGraphRawEdge[];
} {
  const root = asRecord(payload);
  if (!root) return { rawNodes: [], rawEdges: [] };

  const graphObj = asRecord(root.graph) ?? root;

  // Support contributions array: payload.contributions or root.contributions or graphObj.contributions
  const contributions = Array.isArray(root.contributions)
    ? root.contributions
    : Array.isArray(graphObj.contributions)
      ? graphObj.contributions
      : [];

  let nodesCandidate: unknown[] = [];
  let edgesCandidate: unknown[] = [];

  if (contributions.length > 0) {
    for (const contrib of contributions) {
      const c = asRecord(contrib);
      if (c) {
        if (Array.isArray(c.nodes)) nodesCandidate.push(...c.nodes);
        if (Array.isArray(c.edges)) edgesCandidate.push(...c.edges);
      }
    }
  }

  if (nodesCandidate.length === 0) {
    nodesCandidate = Array.isArray(graphObj.nodes)
      ? graphObj.nodes
      : Array.isArray(graphObj.entities)
        ? graphObj.entities
        : Array.isArray(root.nodes)
          ? root.nodes
          : Array.isArray(root.entities)
            ? root.entities
            : [];
  }

  if (edgesCandidate.length === 0) {
    const edgeCandidatesList = [
      graphObj.edges,
      graphObj.relations,
      graphObj.knowledge_relations,
      graphObj.knowledgeRelations,
      graphObj.relationships,
      graphObj.links,
      graphObj.internal_relations,
      graphObj.internalRelations,
      root.edges,
      root.relations,
      root.knowledge_relations,
      root.knowledgeRelations,
      root.relationships,
      root.links,
    ];

    for (const candidate of edgeCandidatesList) {
      if (Array.isArray(candidate) && candidate.length > 0) {
        edgesCandidate = candidate;
        break;
      }
    }
  }

  const rawNodes = nodesCandidate
    .map((item) => publishedGraphRawNodeSchema.safeParse(item))
    .filter((res) => res.success)
    .map((res) => res.data);

  const rawEdges = edgesCandidate
    .map((item) => publishedGraphRawEdgeSchema.safeParse(item))
    .filter((res) => res.success)
    .map((res) => res.data);

  const title =
    (typeof root.courseTitle === 'string' && root.courseTitle) ||
    (typeof root.title === 'string' && root.title) ||
    (typeof root.materialTitle === 'string' && root.materialTitle) ||
    (typeof graphObj.title === 'string' && graphObj.title) ||
    (typeof graphObj.materialTitle === 'string' && graphObj.materialTitle) ||
    undefined;

  return { title, rawNodes, rawEdges };
}

/**
 * List published knowledge graphs in Neo4j.
 * GET /api/v1/knowledge-graphs/published?courseId=&subject=&q=&after=&limit=30
 */
export async function getPublishedKnowledgeGraphs(params?: {
  courseId?: string;
  subject?: string;
  q?: string;
  after?: string;
  limit?: number;
}): Promise<PublishedGraphsPage> {
  const { data: res } = await api.get<ApiResponse<unknown>>('/knowledge-graphs/published', {
    params: {
      limit: params?.limit ?? 30,
      ...(params?.courseId ? { courseId: params.courseId } : {}),
      ...(params?.subject ? { subject: params.subject } : {}),
      ...(params?.q ? { q: params.q } : {}),
      ...(params?.after ? { after: params.after } : {}),
    },
  });

  const payload = res?.data;
  const obj = asRecord(payload);
  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray(obj?.items)
      ? obj.items
      : Array.isArray(obj?.content)
        ? obj.content
        : [];

  const items = rawItems
    .map((item) => publishedGraphSummarySchema.safeParse(item))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data)
    .filter((item) => Boolean(item.materialId));

  const nextCursor =
    (typeof obj?.nextCursor === 'string' && obj.nextCursor) ||
    (typeof obj?.after === 'string' && obj.after) ||
    null;

  return {
    items,
    nextCursor,
    hasMore: Boolean(obj?.hasMore ?? nextCursor),
  };
}

/**
 * Fetch the published Neo4j graph for a single material.
 * GET /api/v1/knowledge-graphs/published/materials/{materialId}?nodeId=&depth=2&limit=200
 */
export async function getPublishedMaterialGraph(
  materialId: string,
  params?: { nodeId?: string; depth?: number; limit?: number }
): Promise<KnowledgeGraphResult> {
  const { data: res } = await api.get<ApiResponse<unknown>>(
    `/knowledge-graphs/published/materials/${materialId}`,
    {
      params: {
        depth: params?.depth ?? 2,
        limit: params?.limit ?? 200,
        ...(params?.nodeId ? { nodeId: params.nodeId } : {}),
      },
    }
  );
  const { title, rawNodes, rawEdges } = parseGraphNodesAndEdges(res?.data);
  return mapRawGraphToCanvasData(rawNodes, rawEdges, title);
}

/**
 * Fetch the canonical course-level knowledge graph.
 * GET /api/v1/courses/{courseId}/knowledge-graph
 */
export async function getCourseKnowledgeGraphData(
  courseId: string
): Promise<KnowledgeGraphResult> {
  const { data: res } = await api.get<ApiResponse<unknown>>(
    `/courses/${courseId}/knowledge-graph`
  );
  const { title, rawNodes, rawEdges } = parseGraphNodesAndEdges(res?.data);
  return mapRawGraphToCanvasData(rawNodes, rawEdges, title);
}

/**
 * Fetch rich concept details (definition, processes, exercises, examples, arguments, relations).
 * GET /api/v1/knowledge-graphs/published/concepts/{canonicalCode}
 */
export async function getPublishedConceptDetail(
  canonicalCode: string
): Promise<ConceptDetail> {
  const { data: res } = await api.get<ApiResponse<unknown>>(
    `/knowledge-graphs/published/concepts/${encodeURIComponent(canonicalCode)}`
  );
  const parsed = conceptDetailSchema.parse(res?.data ?? {});
  if (typeof parsed.definition === 'string') {
    parsed.definition = deduplicateParagraphs(parsed.definition);
  } else if (
    parsed.definition &&
    typeof parsed.definition === 'object' &&
    'content' in parsed.definition &&
    typeof (parsed.definition as { content?: string }).content === 'string'
  ) {
    (parsed.definition as { content?: string }).content = deduplicateParagraphs(
      (parsed.definition as { content?: string }).content
    );
  }
  if (typeof parsed.description === 'string') {
    parsed.description = deduplicateParagraphs(parsed.description);
  }
  return parsed;
}

/**
 * Fetch revision history of a material's knowledge graph.
 * GET /api/v1/knowledge-graphs/materials/{materialId}/revisions
 */
export async function getMaterialGraphRevisions(
  materialId: string
): Promise<GraphRevisionItem[]> {
  const { data: res } = await api.get<ApiResponse<unknown>>(
    `/knowledge-graphs/materials/${materialId}/revisions`
  );
  const payload = res?.data;
  const obj = asRecord(payload);
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(obj?.items)
      ? obj.items
      : Array.isArray(obj?.content)
        ? obj.content
        : [];
  return rawList
    .map((item) => graphRevisionItemSchema.safeParse(item))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data);
}

/**
 * Fetch audit logs of a material's knowledge graph.
 * GET /api/v1/knowledge-graphs/materials/{materialId}/audit
 */
export async function getMaterialGraphAuditLogs(
  materialId: string
): Promise<GraphAuditLogItem[]> {
  const { data: res } = await api.get<ApiResponse<unknown>>(
    `/knowledge-graphs/materials/${materialId}/audit`
  );
  const payload = res?.data;
  const obj = asRecord(payload);
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(obj?.items)
      ? obj.items
      : Array.isArray(obj?.content)
        ? obj.content
        : [];
  return rawList
    .map((item) => graphAuditLogItemSchema.safeParse(item))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data);
}

/**
 * Start a new editable draft revision from a published material graph.
 * POST /api/v1/knowledge-graphs/materials/{materialId}/drafts
 */
export async function startMaterialGraphDraft(
  materialId: string
): Promise<{ jobId: string; revisionId?: string }> {
  const { data: res } = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/materials/${materialId}/drafts`
  );
  const obj = asRecord(res?.data) ?? {};
  const jobId =
    (typeof obj.jobId === 'string' && obj.jobId) ||
    (typeof obj.id === 'string' && obj.id) ||
    '';
  const revisionId =
    (typeof obj.revisionId === 'string' && obj.revisionId) ||
    (typeof obj.draftRevisionId === 'string' && obj.draftRevisionId) ||
    undefined;
  return { jobId, revisionId };
}

/**
 * Withdraw a published knowledge graph version.
 * POST /api/v1/knowledge-graphs/materials/{materialId}/publications/{publicationId}/withdraw
 */
export async function withdrawPublishedGraph(
  materialId: string,
  publicationId: string,
  reason?: string
): Promise<void> {
  await api.post(
    `/knowledge-graphs/materials/${materialId}/publications/${publicationId}/withdraw`,
    reason ? { reason } : undefined
  );
}

export interface StudioCourseOption {
  courseId: string;
  name: string;
  className?: string;
}

/**
 * Fetch user's courses to populate the Course Scope Selector in Knowledge Graph Studio.
 * GET /api/v1/courses/users/{userId}
 */
export async function getStudioCourseOptions(
  userId: string
): Promise<StudioCourseOption[]> {
  if (!userId) return [];
  const { data: res } = await api.get<ApiResponse<unknown>>(`/courses/users/${userId}`);
  const payload = res?.data;
  const obj = asRecord(payload);
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(obj?.items)
      ? obj.items
      : Array.isArray(obj?.content)
        ? obj.content
        : [];

  const seen = new Set<string>();
  const list: StudioCourseOption[] = [];
  for (const item of rawList) {
    const row = asRecord(item);
    if (!row) continue;
    const courseId =
      (typeof row.courseId === 'string' && row.courseId) ||
      (typeof row.id === 'string' && row.id) ||
      '';
    const name =
      (typeof row.name === 'string' && row.name) ||
      (typeof row.courseTitle === 'string' && row.courseTitle) ||
      '';
    if (!courseId || !name || seen.has(courseId)) continue;
    seen.add(courseId);
    list.push({
      courseId,
      name,
      className: typeof row.className === 'string' ? row.className : undefined,
    });
  }
  return list;
}

/**
 * Retry a failed publication job.
 * POST /api/v1/knowledge-graphs/publications/{publicationId}/retry
 */
export async function retryGraphPublication(publicationId: string): Promise<void> {
  await api.post(`/knowledge-graphs/publications/${publicationId}/retry`);
}

// --- Pure Graph Analytics Helpers (strictly operating on real passed-in graph data) ---

export function findDijkstraShortestPath(
  sourceId: string,
  targetId: string,
  nodes: KnowledgeNodeData[] = [],
  edges: KnowledgeEdgeData[] = []
): ShortestPathResult {
  if (nodes.length === 0) {
    return {
      pathIds: [],
      nodeLabels: [],
      totalTimeEstimate: '0.0 giờ',
      stepsCount: 0,
    };
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  if (!sourceId || !targetId || sourceId === targetId) {
    const label = nodeMap.get(sourceId)?.label ?? sourceId;
    return {
      pathIds: sourceId ? [sourceId] : [],
      nodeLabels: label ? [label] : [],
      totalTimeEstimate: '0.5 giờ',
      stepsCount: 0,
    };
  }

  const adj = new Map<string, Array<{ target: string; weight: number }>>();
  nodes.forEach((n) => adj.set(n.id, []));

  if (edges.length > 0) {
    edges.forEach((e) => {
      const w = e.weight ?? 1.0;
      adj.get(e.source)?.push({ target: e.target, weight: w });
      adj.get(e.target)?.push({ target: e.source, weight: w * 1.2 });
    });
  } else {
    // Infer adjacency from node prerequisites/successors when edges are not supplied
    nodes.forEach((n) => {
      (n.prerequisites ?? []).forEach((preId) => {
        if (adj.has(preId)) {
          adj.get(preId)?.push({ target: n.id, weight: 1.0 });
          adj.get(n.id)?.push({ target: preId, weight: 1.2 });
        }
      });
      (n.successors ?? []).forEach((succId) => {
        if (adj.has(succId)) {
          adj.get(n.id)?.push({ target: succId, weight: 1.0 });
          adj.get(succId)?.push({ target: n.id, weight: 1.2 });
        }
      });
    });
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  nodes.forEach((n) => {
    dist.set(n.id, Infinity);
    prev.set(n.id, null);
  });

  if (dist.has(sourceId)) {
    dist.set(sourceId, 0);
  }

  while (visited.size < nodes.length) {
    let u: string | null = null;
    let minDist = Infinity;

    for (const [nodeId, d] of dist.entries()) {
      if (!visited.has(nodeId) && d < minDist) {
        minDist = d;
        u = nodeId;
      }
    }

    if (!u || u === targetId || minDist === Infinity) break;
    visited.add(u);

    const neighbors = adj.get(u) ?? [];
    for (const edge of neighbors) {
      if (visited.has(edge.target)) continue;
      const alt = (dist.get(u) ?? Infinity) + edge.weight;
      if (alt < (dist.get(edge.target) ?? Infinity)) {
        dist.set(edge.target, alt);
        prev.set(edge.target, u);
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = targetId;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev.get(curr) ?? null;
    if (curr === sourceId) {
      path.unshift(sourceId);
      break;
    }
  }

  const finalPath = path.length > 0 && path[0] === sourceId ? path : [sourceId, targetId];
  const nodeLabels = finalPath.map((id) => nodeMap.get(id)?.label ?? id);
  const stepsCount = Math.max(1, finalPath.length - 1);
  const hours = (stepsCount * 1.5).toFixed(1);

  return {
    pathIds: finalPath,
    nodeLabels,
    totalTimeEstimate: `${hours} giờ`,
    stepsCount,
  };
}

export function getKnowledgeStats(
  nodes: KnowledgeNodeData[] = [],
  edges: KnowledgeEdgeData[] = []
): KnowledgeGraphStats {
  const masteredCount = nodes.filter((n) => n.status === 'mastered').length;
  const inProgressCount = nodes.filter((n) => n.status === 'learning').length;
  return {
    totalEntities: nodes.length,
    masteredCount,
    inProgressCount,
    relationshipsCount: edges.length,
  };
}

/**
 * Import and publish knowledge graph directly from structured JSON (docs/api-spec.md §16.2).
 * POST /api/v1/knowledge-graphs/courses/{courseId}/import-json
 */
export async function importKnowledgeGraphFromJson(
  courseId: string,
  payload: ImportKnowledgeGraphRequestDTO
): Promise<ImportKnowledgeGraphResponseDTO> {
  const res = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/import-json`,
    payload
  );
  return importKnowledgeGraphResponseSchema.parse(res.data.data);
}

/**
 * Create a new knowledge node directly in the course knowledge graph (docs/api-spec.md §16.1 & §16.2).
 * POST /api/v1/knowledge-graphs/courses/{courseId}/nodes
 */
export async function createCourseKnowledgeNode(
  courseId: string,
  payload: CreateKnowledgeNodeRequestDTO
): Promise<unknown> {
  const res = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/nodes`,
    payload
  );
  return res.data.data;
}

/**
 * Update an existing knowledge node in the course knowledge graph (docs/api-spec.md §16.1 & §16.2).
 * PUT /api/v1/knowledge-graphs/courses/{courseId}/nodes/{nodeId}
 */
export async function updateCourseKnowledgeNode(
  courseId: string,
  nodeId: string,
  payload: UpdateKnowledgeNodeRequestDTO
): Promise<unknown> {
  const res = await api.put<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/nodes/${encodeURIComponent(nodeId)}`,
    payload
  );
  return res.data.data;
}

/**
 * Delete a knowledge node from the course knowledge graph with cascade edge cleanup (docs/api-spec.md §16.1 & §16.2).
 * DELETE /api/v1/knowledge-graphs/courses/{courseId}/nodes/{nodeId}
 */
export async function deleteCourseKnowledgeNode(
  courseId: string,
  nodeId: string
): Promise<void> {
  await api.delete(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/nodes/${encodeURIComponent(nodeId)}`
  );
}

/**
 * Add a directed relationship edge between two nodes in the course knowledge graph (docs/api-spec.md §16.1 & §16.2).
 * POST /api/v1/knowledge-graphs/courses/{courseId}/edges
 */
export async function createCourseKnowledgeEdge(
  courseId: string,
  payload: ManageKnowledgeEdgeRequestDTO
): Promise<unknown> {
  const res = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/edges`,
    payload
  );
  return res.data.data;
}

/**
 * Delete a relationship edge between two nodes in the course knowledge graph (docs/api-spec.md §16.1 & §16.2).
 * DELETE /api/v1/knowledge-graphs/courses/{courseId}/edges
 */
export async function deleteCourseKnowledgeEdge(
  courseId: string,
  payload: ManageKnowledgeEdgeRequestDTO
): Promise<void> {
  await api.delete(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/edges`,
    { data: payload }
  );
}

/**
 * Validate course knowledge graph for cycles, missing descriptions, orphan nodes (docs/api-spec.md §16.1 & §16.2).
 * POST /api/v1/knowledge-graphs/courses/{courseId}/validate
 */
export async function validateCourseKnowledgeGraph(
  courseId: string,
  snapshot?: { nodes: unknown[]; edges: unknown[] }
): Promise<GraphValidationResponseDTO> {
  const res = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/validate`,
    snapshot ?? {}
  );
  return graphValidationResponseSchema.parse(res.data.data);
}

/**
 * AI auto-repair course knowledge graph JSON (docs/api-spec.md §16.1 & §16.2).
 * POST /api/v1/knowledge-graphs/courses/{courseId}/ai-repair
 */
export async function aiRepairCourseKnowledgeGraph(
  courseId: string,
  payload: { nodes?: unknown[]; edges?: unknown[]; instruction?: string }
): Promise<GraphAiRepairResponseDTO> {
  const res = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/ai-repair`,
    payload
  );
  return graphAiRepairResponseSchema.parse(res.data.data);
}

/**
 * Apply AI repaired knowledge graph and save/publish to DB (docs/api-spec.md §16.1 & §16.2).
 * POST /api/v1/knowledge-graphs/courses/{courseId}/apply-ai-repair
 */
export async function applyAiRepairCourseKnowledgeGraph(
  courseId: string,
  payload: ApplyAiRepairRequestDTO
): Promise<ImportKnowledgeGraphResponseDTO> {
  const res = await api.post<ApiResponse<unknown>>(
    `/knowledge-graphs/courses/${encodeURIComponent(courseId)}/apply-ai-repair`,
    payload
  );
  return importKnowledgeGraphResponseSchema.parse(res.data.data);
}
