import { z } from 'zod';

export const lessonTypeEnum = z.enum([
  'MODULAR',
  'TEXT',
  'VIDEO',
  'QUIZ',
  'DOCUMENT',
  'THEORY',
  'ASSIGNMENT',
]);
export type LessonType = z.infer<typeof lessonTypeEnum>;

export const lessonMaterialSchema = z.object({
  id: z.string(),
  title: z.string(),
  fileType: z.string().optional(),
  fileSize: z.string().optional(),
  url: z.string().optional(),
});
export type LessonMaterial = z.infer<typeof lessonMaterialSchema>;

export const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  orderIndex: z.number().default(1),
  lessonType: lessonTypeEnum.default('MODULAR'),
  duration: z.number().default(45), // duration in minutes
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED']).default('NOT_STARTED'),
  description: z.string().optional(),
  content: z.string().optional(),
  isPublished: z.boolean().optional(),
  materials: z.array(lessonMaterialSchema).default([]),
});
export type Lesson = z.infer<typeof lessonSchema>;

export const chapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  orderIndex: z.number().default(1),
  lessons: z.array(lessonSchema).default([]),
});
export type Chapter = z.infer<typeof chapterSchema>;

export const courseDetailSchema = z.object({
  id: z.string(),
  courseCode: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
  visibility: z.string().optional(),
  credits: z.number().default(3),
  instructorName: z.string().optional(),
  instructorAvatar: z.string().optional(),
  instructorColor: z.string().optional(),
  currentWeek: z.string().optional(),
  teachingProgress: z.number().default(0),
  knowledgeNodesCount: z.number().default(0),
  quizzesCount: z.number().default(0),
  lecturesCount: z.number().default(0),
  chaptersCount: z.number().default(0),
  specialFeature: z.string().optional(),
  specialFeatureIcon: z.string().optional(),
  semester: z.string().optional(),
  classId: z.string().optional(),
  className: z.string().optional(),
  backgroundUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  ownerId: z.string().optional(),
  hasAiTutor: z.boolean().default(true),
});
export type CourseDetail = z.infer<typeof courseDetailSchema>;

export const courseContentTreeSchema = z.object({
  courseId: z.string(),
  courseTitle: z.string(),
  chapters: z.array(chapterSchema).default([]),
});
export type CourseContentTree = z.infer<typeof courseContentTreeSchema>;

export const createChapterSchema = z.object({
  title: z.string().min(1, 'validation.required'),
  description: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type CreateChapterInput = z.infer<typeof createChapterSchema>;

export const createLessonSchema = z.object({
  title: z.string().min(1, 'validation.required'),
  description: z.string().optional(),
  content: z.string().optional(),
  lessonType: lessonTypeEnum.default('MODULAR'),
  duration: z.number().min(0).default(45),
  orderIndex: z.number().optional(),
  isPublished: z.boolean().optional(),
});
export type CreateLessonInput = z.infer<typeof createLessonSchema>;

export interface UpdateLessonInput {
  title?: string;
  content?: string;
  lessonType?: LessonType;
  durationSeconds?: number;
  orderIndex?: number;
  isPublished?: boolean;
}

export const aiIngestionStatusEnum = z.enum([
  'NOT_EXTRACTED',
  'QUEUED',
  'PROCESSING',
  'AWAITING_REVIEW',
  'PUBLISHING',
  'SUCCESS',
  'FAILED',
]);
export type AiIngestionStatus = z.infer<typeof aiIngestionStatusEnum>;

export function normalizeAiIngestionStatus(status?: string | null): AiIngestionStatus {
  const normalized = (status ?? '').trim().toUpperCase();
  if (normalized === 'QUEUED') return 'QUEUED';
  if (normalized === 'PROCESSING') return 'PROCESSING';
  if (normalized === 'AWAITING_REVIEW') return 'AWAITING_REVIEW';
  if (normalized === 'PUBLISHING') return 'PUBLISHING';
  if (normalized === 'SUCCESS' || normalized === 'COMPLETED' || normalized === 'PUBLISHED') {
    return 'SUCCESS';
  }
  if (normalized === 'FAILED' || normalized === 'ERROR') return 'FAILED';
  return 'NOT_EXTRACTED';
}

export function isActiveAiIngestionStatus(status?: string | null): boolean {
  const normalized = normalizeAiIngestionStatus(status);
  return normalized === 'QUEUED' || normalized === 'PROCESSING' || normalized === 'PUBLISHING';
}

export const courseMaterialItemSchema = z.object({
  id: z.string(),
  courseId: z.string().optional(),
  courseTitle: z.string().optional(),
  lessonId: z.string().nullable().optional(),
  lessonTitle: z.string().nullable().optional(),
  chapterId: z.string().nullable().optional(),
  chapterTitle: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  originalFileName: z.string().nullable().optional(),
  fileType: z.string().default('PDF'),
  mimeType: z.string().nullable().optional(),
  fileSizeBytes: z.number().nullable().optional(),
  fileSizeFormatted: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  downloadUrl: z.string().nullable().optional(),
  isDownloadable: z.boolean().default(true),
  uploadStatus: z.string().default('READY'),
  aiIngestionStatus: z
    .string()
    .nullable()
    .optional()
    .transform((value) => normalizeAiIngestionStatus(value)),
  conceptsCount: z.number().nullable().optional(),
  ingestionJobId: z.string().nullable().optional(),
  draftRevisionId: z.string().nullable().optional(),
  aiErrorCode: z.string().nullable().optional(),
  uploadedBy: z.string().nullable().optional(),
  uploadedByName: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});
export type CourseMaterialItem = z.infer<typeof courseMaterialItemSchema>;

export const courseKnowledgeGraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  canonicalCode: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  materialId: z.string().nullable().optional(),
  materialTitle: z.string().nullable().optional(),
  level: z.string().default('BEGINNER'),
  category: z.string().default('General'),
  masteryPercent: z.number().default(0),
  status: z.string().default('NOT_STARTED'),
  prerequisites: z.array(z.string()).default([]),
  linkedLessonIds: z.array(z.string()).default([]),
});
export type CourseKnowledgeGraphNode = z.infer<typeof courseKnowledgeGraphNodeSchema>;

export const courseKnowledgeGraphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  relation: z.string().default('PREREQUISITE'),
  label: z.string().nullable().optional(),
});
export type CourseKnowledgeGraphEdge = z.infer<typeof courseKnowledgeGraphEdgeSchema>;

export const courseKnowledgeGraphSchema = z.object({
  courseId: z.string(),
  courseTitle: z.string().optional(),
  totalNodes: z.number().default(0),
  totalEdges: z.number().default(0),
  nodes: z.array(courseKnowledgeGraphNodeSchema).default([]),
  edges: z.array(courseKnowledgeGraphEdgeSchema).default([]),
});
export type CourseKnowledgeGraph = z.infer<typeof courseKnowledgeGraphSchema>;

const conceptStepItemSchema = z
  .object({
    stepNumber: z.number().nullable().optional(),
    step_number: z.number().nullable().optional(),
    order: z.number().nullable().optional(),
    action: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => ({
    stepNumber: raw.stepNumber ?? raw.step_number ?? raw.order ?? null,
    action: raw.action ?? raw.content ?? raw.description ?? '',
  }));

export const courseConceptDetailSchema = z
  .object({
    canonicalCode: z.string().optional(),
    canonical_code: z.string().optional(),
    name: z.string().optional(),
    label: z.string().optional(),
    topic: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    definition: z
      .union([z.string(), z.object({ content: z.string().optional() }).passthrough()])
      .nullable()
      .optional(),
    processes: z
      .array(
        z
          .object({
            name: z.string().nullable().optional(),
            title: z.string().nullable().optional(),
            description: z.string().nullable().optional(),
            steps: z.array(conceptStepItemSchema).optional(),
            processSteps: z.array(conceptStepItemSchema).optional(),
            process_steps: z.array(conceptStepItemSchema).optional(),
          })
          .passthrough()
      )
      .optional(),
    exercises: z
      .array(
        z
          .object({
            title: z.string().nullable().optional(),
            name: z.string().nullable().optional(),
            content: z.string().nullable().optional(),
            problem: z.string().nullable().optional(),
            solution: z.string().nullable().optional(),
            steps: z.array(conceptStepItemSchema).optional(),
            exerciseSteps: z.array(conceptStepItemSchema).optional(),
            exercise_steps: z.array(conceptStepItemSchema).optional(),
          })
          .passthrough()
      )
      .optional(),
    examples: z
      .array(
        z
          .object({
            title: z.string().nullable().optional(),
            explanation: z.string().nullable().optional(),
            content: z.string().nullable().optional(),
            codeSnippet: z.string().nullable().optional(),
            code_snippet: z.string().nullable().optional(),
          })
          .passthrough()
      )
      .optional(),
    arguments: z
      .array(
        z
          .object({
            hypothesis: z.string().nullable().optional(),
            claim: z.string().nullable().optional(),
            evidence: z.string().nullable().optional(),
            conclusion: z.string().nullable().optional(),
          })
          .passthrough()
      )
      .optional(),
    sourceQuotes: z.array(z.string()).optional(),
    quotes: z.array(z.string()).optional(),
  })
  .passthrough()
  .transform((raw) => {
    const defText =
      typeof raw.definition === 'string'
        ? raw.definition
        : raw.definition && typeof raw.definition.content === 'string'
          ? raw.definition.content
          : '';
    return {
      canonicalCode: raw.canonicalCode ?? raw.canonical_code ?? '',
      name: raw.name ?? raw.label ?? '',
      topic: raw.topic ?? null,
      description: raw.description ?? '',
      definition: defText,
      processes: (raw.processes ?? []).map((p) => ({
        name: p.name ?? p.title ?? 'Quy trình',
        description: p.description ?? '',
        steps: (p.steps ?? p.processSteps ?? p.process_steps ?? []).map((s, idx) => ({
          stepNumber: s.stepNumber ?? idx + 1,
          action: s.action,
        })),
      })),
      exercises: (raw.exercises ?? []).map((ex) => ({
        title: ex.title ?? ex.name ?? 'Bài tập',
        content: ex.content ?? ex.problem ?? '',
        solution: ex.solution ?? '',
        steps: (ex.steps ?? ex.exerciseSteps ?? ex.exercise_steps ?? []).map((s, idx) => ({
          stepNumber: s.stepNumber ?? idx + 1,
          action: s.action,
        })),
      })),
      examples: (raw.examples ?? []).map((eg) => ({
        title: eg.title ?? 'Ví dụ minh họa',
        explanation: eg.explanation ?? eg.content ?? '',
        codeSnippet: eg.codeSnippet ?? eg.code_snippet ?? null,
      })),
      arguments: (raw.arguments ?? []).map((arg) => ({
        hypothesis: arg.hypothesis ?? arg.claim ?? '',
        evidence: arg.evidence ?? '',
        conclusion: arg.conclusion ?? '',
      })),
      sourceQuotes: raw.sourceQuotes ?? raw.quotes ?? [],
    };
  });
export type CourseConceptDetail = z.infer<typeof courseConceptDetailSchema>;

