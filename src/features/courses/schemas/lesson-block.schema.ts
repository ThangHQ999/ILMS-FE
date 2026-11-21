import { z } from 'zod';

export const lessonBlockTypeEnum = z.enum([
  'HEADING',
  'TEXT',
  'CALLOUT',
  'VIDEO',
  'SLIDE',
  'CODE_SANDBOX',
  'QUIZ',
  'DIAGRAM',
  'IMAGE',
  'DIVIDER',
]);
export type LessonBlockType = z.infer<typeof lessonBlockTypeEnum>;

export const headingBlockContentSchema = z.object({
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  text: z.string().default(''),
});

export const textBlockContentSchema = z.object({
  markdown: z.string().default(''),
});

export const calloutBlockContentSchema = z.object({
  variant: z.enum(['INFO', 'TIP', 'WARNING', 'THEOREM']).default('INFO'),
  title: z.string().default(''),
  markdown: z.string().default(''),
});

export const videoChapterMarkerSchema = z.object({
  timeSec: z.number().nonnegative(),
  title: z.string(),
});

export const videoBlockContentSchema = z.object({
  url: z.string().default(''),
  sourceType: z.enum(['YOUTUBE', 'DRIVE', 'MP4']).default('MP4'),
  durationSeconds: z.number().nonnegative().default(0),
  caption: z.string().optional().default(''),
  chapters: z.array(videoChapterMarkerSchema).optional().default([]),
});

export const slideBlockContentSchema = z.object({
  materialId: z.string().nullable().optional(),
  url: z.string().default(''),
  fileName: z.string().optional().default(''),
  totalPages: z.number().nonnegative().optional().default(0),
  embedType: z.enum(['PDF', 'GOOGLE_SLIDES']).default('PDF'),
});

export const codeSandboxBlockContentSchema = z.object({
  language: z.enum(['javascript', 'python', 'java', 'cpp', 'sql']).default('javascript'),
  title: z.string().optional().default(''),
  initialCode: z.string().default(''),
  expectedOutput: z.string().optional().default(''),
  allowRun: z.boolean().default(true),
  readOnly: z.boolean().default(false),
});

export const quizBlockContentSchema = z.object({
  question: z.string().default(''),
  options: z.array(z.string()).default(['', '']),
  correctIndex: z.number().int().nonnegative().nullable().optional(),
  explanation: z.string().nullable().optional(),
  allowRetry: z.boolean().default(true),
});

export const diagramBlockContentSchema = z.object({
  engine: z.enum(['MERMAID', 'VIS3D']).default('MERMAID'),
  code: z.string().default(''),
  caption: z.string().optional().default(''),
});

export const imageBlockContentSchema = z.object({
  url: z.string().default(''),
  caption: z.string().optional().default(''),
});

export const dividerBlockContentSchema = z.object({});

export type HeadingBlockContent = z.infer<typeof headingBlockContentSchema>;
export type TextBlockContent = z.infer<typeof textBlockContentSchema>;
export type CalloutBlockContent = z.infer<typeof calloutBlockContentSchema>;
export type VideoBlockContent = z.infer<typeof videoBlockContentSchema>;
export type SlideBlockContent = z.infer<typeof slideBlockContentSchema>;
export type CodeSandboxBlockContent = z.infer<typeof codeSandboxBlockContentSchema>;
export type QuizBlockContent = z.infer<typeof quizBlockContentSchema>;
export type DiagramBlockContent = z.infer<typeof diagramBlockContentSchema>;
export type ImageBlockContent = z.infer<typeof imageBlockContentSchema>;
export type DividerBlockContent = z.infer<typeof dividerBlockContentSchema>;

export const studentBlockStateSchema = z
  .object({
    isCompleted: z.boolean().default(false),
    interactionState: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .nullable()
  .optional();

export const lessonBlockSchema = z.object({
  id: z.string(),
  lessonId: z.string().optional(),
  type: lessonBlockTypeEnum,
  content: z.record(z.string(), z.unknown()).default({}),
  orderIndex: z.number().default(1000.0),
  materialId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  version: z.number().int().default(0),
  studentState: studentBlockStateSchema,
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});
export type LessonBlock = z.infer<typeof lessonBlockSchema>;

export const lessonProgressDetailSchema = z.object({
  lessonId: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).default('NOT_STARTED'),
  progressPercent: z.number().min(0).max(100).default(0),
  lastAccessedBlockId: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});
export type LessonProgressDetail = z.infer<typeof lessonProgressDetailSchema>;

export const lessonBlocksWorkspaceResponseSchema = z.object({
  lessonId: z.string(),
  lessonTitle: z.string().optional().default(''),
  contentMode: z.string().optional().default('MODULAR'),
  canEdit: z.boolean().default(false),
  legacyContent: z.string().nullable().optional(),
  rebalanced: z.boolean().optional().default(false),
  lessonProgress: lessonProgressDetailSchema.nullable().optional(),
  blocks: z.array(lessonBlockSchema).default([]),
});
export type LessonBlocksWorkspaceResponse = z.infer<
  typeof lessonBlocksWorkspaceResponseSchema
>;

export const blockQuizAttemptResponseSchema = z.object({
  blockId: z.string(),
  isCorrect: z.boolean(),
  selectedIndex: z.number().int().nonnegative(),
  correctIndex: z.number().int().nonnegative().nullable().optional(),
  explanation: z.string().nullable().optional(),
  lessonProgressPercent: z.number().min(0).max(100).optional(),
  lessonStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
});
export type BlockQuizAttemptResponse = z.infer<typeof blockQuizAttemptResponseSchema>;
