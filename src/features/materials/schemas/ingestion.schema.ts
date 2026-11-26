import { z } from 'zod';

export const ingestionJobStatusEnum = z.enum([
  'QUEUED',
  'PROCESSING',
  'AWAITING_REVIEW',
  'PUBLISHING',
  'COMPLETED',
  'SUCCESS',
  'FAILED',
]);
export type IngestionJobStatus = z.infer<typeof ingestionJobStatusEnum>;

export const reviewDecisionEnum = z.enum([
  'APPROVED',
  'CHANGES_REQUESTED',
  'REJECTED',
]);
export type ReviewDecision = z.infer<typeof reviewDecisionEnum>;

export function normalizeIngestionJobStatus(status?: string | null): IngestionJobStatus {
  const value = (status ?? '').trim().toUpperCase();
  if (value === 'QUEUED') return 'QUEUED';
  if (value === 'PROCESSING') return 'PROCESSING';
  if (value === 'AWAITING_REVIEW') return 'AWAITING_REVIEW';
  if (value === 'PUBLISHING') return 'PUBLISHING';
  if (value === 'COMPLETED') return 'COMPLETED';
  if (value === 'SUCCESS' || value === 'PUBLISHED') return 'SUCCESS';
  if (value === 'FAILED' || value === 'ERROR') return 'FAILED';
  return 'QUEUED';
}

export function isActiveIngestionJobStatus(status?: string | null): boolean {
  const normalized = normalizeIngestionJobStatus(status);
  return (
    normalized === 'QUEUED' ||
    normalized === 'PROCESSING' ||
    normalized === 'PUBLISHING'
  );
}

export function isCompletedIngestionJobStatus(status?: string | null): boolean {
  const normalized = normalizeIngestionJobStatus(status);
  return normalized === 'COMPLETED' || normalized === 'SUCCESS';
}

/**
 * Maps real backend job status + stage to the 5-step pipeline stepper index (0..4):
 * 0: Queued (Hàng đợi)
 * 1: AI 4-Agents (AI_DRAFT / Extractor -> Expert -> Validator -> Reviewer)
 * 2: Draft Ready (DRAFT_READY / Neo4j Draft Sync)
 * 3: Review (AWAITING_REVIEW)
 * 4: Published (PUBLISHING / COMPLETED / SUCCESS)
 */
export function getPipelineStepIndex(
  status?: string | null,
  stage?: string | null
): number {
  const normalizedStatus = normalizeIngestionJobStatus(status);
  const normalizedStage = (stage ?? '').trim().toUpperCase();

  if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'SUCCESS') return 4;
  if (normalizedStatus === 'PUBLISHING' || normalizedStage === 'PREPARING_INDEXES') return 4;
  if (normalizedStatus === 'AWAITING_REVIEW') return 3;
  if (normalizedStage === 'DRAFT_READY') return 2;
  if (normalizedStatus === 'PROCESSING' || normalizedStage === 'AI_DRAFT') return 1;
  return 0;
}

export const validationIssueSchema = z
  .object({
    code: z.string().optional(),
    severity: z.string().optional(),
    level: z.string().optional(),
    message: z.string().optional(),
    reason: z.string().optional(),
    path: z.string().nullable().optional(),
    entityName: z.string().nullable().optional(),
    entity: z.string().nullable().optional(),
    claimId: z.string().nullable().optional(),
  })
  .passthrough();
export type ValidationIssue = z.infer<typeof validationIssueSchema>;

export const validationReportSchema = z
  .object({
    parser_warnings: z.array(z.string()).optional(),
    parserWarnings: z.array(z.string()).optional(),
    issues: z.array(validationIssueSchema).optional(),
    validationIssues: z.array(validationIssueSchema).optional(),
    review_notes: z.array(z.unknown()).optional(),
    reviewNotes: z.array(z.unknown()).optional(),
    evidence_rejections: z.array(z.unknown()).optional(),
  })
  .passthrough();
export type ValidationReport = z.infer<typeof validationReportSchema>;

export const ingestionDraftSchema = z.object({
  id: z.string(),
  revision: z.number().default(1),
  hash: z.string().default(''),
  reviewStatus: z.string().default('PENDING_REVIEW'),
  graph: z.record(z.string(), z.unknown()).default({}),
  source: z.record(z.string(), z.unknown()).default({}),
  validation: validationReportSchema.nullable().optional(),
});
export type IngestionDraft = z.infer<typeof ingestionDraftSchema>;

export const ingestionJobSummarySchema = z
  .object({
    jobId: z.string(),
    materialId: z.string().nullable().optional(),
    title: z.string().default('Untitled material'),
    subject: z.string().nullable().optional(),
    courseId: z.string().nullable().optional(),
    courseTitle: z.string().nullable().optional(),
    status: z
      .string()
      .nullable()
      .optional()
      .transform((value) => normalizeIngestionJobStatus(value)),
    stage: z.string().nullable().optional(),
    errorCode: z.string().nullable().optional(),
    errorMessage: z.string().nullable().optional(),
    autoPublish: z.boolean().nullable().optional(),
    conceptsCount: z.number().nullable().optional(),
    hasBlockers: z.boolean().nullable().optional(),
    fileName: z.string().nullable().optional(),
    fileType: z.string().nullable().optional(),
    fileSizeBytes: z.number().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
  })
  .passthrough();
export type IngestionJobSummary = z.infer<typeof ingestionJobSummarySchema>;

export const ingestionJobDetailSchema = z
  .object({
    jobId: z.string(),
    materialId: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    courseId: z.string().nullable().optional(),
    courseTitle: z.string().nullable().optional(),
    status: z
      .string()
      .nullable()
      .optional()
      .transform((value) => normalizeIngestionJobStatus(value)),
    stage: z.string().nullable().optional(),
    errorCode: z.string().nullable().optional(),
    errorMessage: z.string().nullable().optional(),
    autoPublish: z.boolean().nullable().optional(),
    draft: ingestionDraftSchema.nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
  })
  .passthrough();
export type IngestionJobDetail = z.infer<typeof ingestionJobDetailSchema>;

export const draftGraphNodeSchema = z.object({
  id: z.string(),
  kind: z.string(),
  path: z.string(),
  label: z.string(),
});
export type DraftGraphNode = z.infer<typeof draftGraphNodeSchema>;

export const draftGraphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  kind: z.string(),
});
export type DraftGraphEdge = z.infer<typeof draftGraphEdgeSchema>;

export const draftGraphSnapshotSchema = z.object({
  revision_id: z.string(),
  status: z.string(),
  nodes: z.array(draftGraphNodeSchema).default([]),
  edges: z.array(draftGraphEdgeSchema).default([]),
});
export type DraftGraphSnapshot = z.infer<typeof draftGraphSnapshotSchema>;

export interface DraftValidationSummary {
  parserWarnings: string[];
  blockerIssues: ValidationIssue[];
  warningIssues: ValidationIssue[];
  reviewNotes: string[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toDisplayNote(item: unknown): string | null {
  if (typeof item === 'string' && item.trim()) return item.trim();
  const obj = asRecord(item);
  if (!obj) return null;
  const text =
    (typeof obj.message === 'string' && obj.message) ||
    (typeof obj.note === 'string' && obj.note) ||
    (typeof obj.reason === 'string' && obj.reason) ||
    (typeof obj.text === 'string' && obj.text);
  return text ? text.trim() : null;
}

export function extractValidationSummary(
  draft?: IngestionDraft | null
): DraftValidationSummary {
  if (!draft) {
    return {
      parserWarnings: [],
      blockerIssues: [],
      warningIssues: [],
      reviewNotes: [],
    };
  }

  const validation = draft.validation ?? {};
  const graph = asRecord(draft.graph) ?? {};

  const parserWarnings = Array.from(
    new Set([
      ...(validation.parser_warnings ?? []),
      ...(validation.parserWarnings ?? []),
    ])
  ).filter((item) => Boolean(item && item.trim()));

  const graphIssues = Array.isArray(graph.issues)
    ? graph.issues
        .map((item) => validationIssueSchema.safeParse(item))
        .filter((res) => res.success)
        .map((res) => res.data)
    : [];

  const allIssues: ValidationIssue[] = [
    ...(validation.issues ?? []),
    ...(validation.validationIssues ?? []),
    ...graphIssues,
  ];

  const blockerIssues: ValidationIssue[] = [];
  const warningIssues: ValidationIssue[] = [];

  for (const issue of allIssues) {
    const severity = (issue.severity ?? issue.level ?? '').toUpperCase();
    if (severity === 'BLOCKER' || severity === 'ERROR') {
      blockerIssues.push(issue);
    } else {
      warningIssues.push(issue);
    }
  }

  const rawNotes = [
    ...(validation.review_notes ?? []),
    ...(validation.reviewNotes ?? []),
    ...(Array.isArray(graph.review_notes) ? graph.review_notes : []),
  ];

  const reviewNotes = Array.from(
    new Set(
      rawNotes
        .map(toDisplayNote)
        .filter((item): item is string => Boolean(item))
    )
  );

  return {
    parserWarnings,
    blockerIssues,
    warningIssues,
    reviewNotes,
  };
}

export interface DraftEntitySummary {
  index: number;
  name: string;
  description: string;
  definition: string;
  processesCount: number;
  exercisesCount: number;
  examplesCount: number;
  argumentsCount: number;
}

export interface DraftGraphStructuredOverview {
  entities: DraftEntitySummary[];
  topics: Array<{ name: string; summary: string; conceptsIncluded: string[] }>;
  relationsCount: number;
}

export function extractDraftGraphOverview(
  graph?: Record<string, unknown> | null
): DraftGraphStructuredOverview {
  const root = asRecord(graph);
  if (!root) {
    return { entities: [], topics: [], relationsCount: 0 };
  }

  const rawEntities = Array.isArray(root.entities) ? root.entities : [];
  const entities: DraftEntitySummary[] = rawEntities.map((item, index) => {
    const obj = asRecord(item) ?? {};
    const defObj = asRecord(obj.definition);
    const definitionText =
      typeof obj.definition === 'string'
        ? obj.definition
        : typeof defObj?.content === 'string'
          ? defObj.content
          : '';
    return {
      index,
      name: typeof obj.name === 'string' && obj.name.trim() ? obj.name : `Entity #${index + 1}`,
      description: typeof obj.description === 'string' ? obj.description : '',
      definition: definitionText,
      processesCount: Array.isArray(obj.processes) ? obj.processes.length : 0,
      exercisesCount: Array.isArray(obj.exercises) ? obj.exercises.length : 0,
      examplesCount: Array.isArray(obj.examples) ? obj.examples.length : 0,
      argumentsCount: Array.isArray(obj.arguments) ? obj.arguments.length : 0,
    };
  });

  const rawTopics = Array.isArray(root.topics) ? root.topics : [];
  const topics = rawTopics.map((item, index) => {
    const obj = asRecord(item) ?? {};
    const included = Array.isArray(obj.concepts_included)
      ? obj.concepts_included.filter((c): c is string => typeof c === 'string')
      : [];
    return {
      name: typeof obj.name === 'string' && obj.name.trim() ? obj.name : `Topic #${index + 1}`,
      summary: typeof obj.summary === 'string' ? obj.summary : '',
      conceptsIncluded: included,
    };
  });

  const relationsCount = Array.isArray(root.knowledge_relations)
    ? root.knowledge_relations.length
    : 0;

  return { entities, topics, relationsCount };
}

// ==========================================
// 16. GRAPH VALIDATION & AI AUTO-REPAIR DTOs
// ==========================================

export const graphValidationIssueSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  severity: z.enum(['BLOCKER', 'WARNING', 'INFO']).default('WARNING'),
  targetId: z.string().optional(),
  targetType: z.enum(['NODE', 'EDGE', 'GRAPH']).default('GRAPH'),
  message: z.string(),
  suggestion: z.string().optional(),
});
export type GraphValidationIssue = z.infer<typeof graphValidationIssueSchema>;

export const graphValidationResponseSchema = z.object({
  valid: z.boolean(),
  totalBlockers: z.number().default(0),
  totalWarnings: z.number().default(0),
  issues: z.array(graphValidationIssueSchema).default([]),
});
export type GraphValidationResponseDTO = z.infer<typeof graphValidationResponseSchema>;

export const aiRepairActionSchema = z.object({
  action: z.string(),
  targetId: z.string().optional(),
  description: z.string(),
});
export type AiRepairAction = z.infer<typeof aiRepairActionSchema>;

export const graphAiRepairResponseSchema = z.object({
  summary: z.string(),
  changes: z.array(aiRepairActionSchema).default([]),
  repairedNodes: z.array(z.record(z.string(), z.unknown())).default([]),
  repairedEdges: z.array(z.record(z.string(), z.unknown())).default([]),
  remainingIssues: z.array(graphValidationIssueSchema).default([]),
  applied: z.boolean().default(false),
});
export type GraphAiRepairResponseDTO = z.infer<typeof graphAiRepairResponseSchema>;

export const applyAiRepairRequestSchema = z.object({
  repairSummary: z.string().optional(),
  repairedNodes: z.array(z.record(z.string(), z.unknown())),
  repairedEdges: z.array(z.record(z.string(), z.unknown())),
});
export type ApplyAiRepairRequestDTO = z.infer<typeof applyAiRepairRequestSchema>;

