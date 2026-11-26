import { z } from 'zod';
import {
  BloomLevelEnum,
  DifficultyLevelEnum,
  QuestionTypeEnum,
  answerOptionSchema,
} from './quiz.schema';

export const questionSourceTypeEnum = z.enum(['MANUAL', 'AI_GENERATED', 'IMPORTED']);
export type QuestionSourceType = z.infer<typeof questionSourceTypeEnum>;

export const questionConceptSchema = z.object({
  id: z.string(),
  conceptId: z.string().optional().nullable(),
  name: z.string(),
  description: z.string().optional().nullable(),
  relevanceWeight: z.number().optional().nullable(),
  questionId: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});

export type QuestionConcept = z.infer<typeof questionConceptSchema>;

export const questionConceptRequestSchema = z.object({
  conceptId: z.string().optional(),
  name: z.string().min(1, 'Tên khái niệm không được để trống'),
  description: z.string().optional().default(''),
  code: z.string().optional(),
  courseId: z.string().optional().nullable(),
});

export type QuestionConceptRequest = z.infer<typeof questionConceptRequestSchema>;

export const questionStatsSchema = z.object({
  attemptCount: z.number().optional().nullable(),
  correctRate: z.number().optional().nullable(),
  discriminationIndex: z.number().optional().nullable(),
});

export const bankQuestionItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  questionType: QuestionTypeEnum.catch('SINGLE_CHOICE'),
  difficultyLevel: DifficultyLevelEnum.catch('MEDIUM'),
  bloomLevel: BloomLevelEnum.optional().nullable(),
  sourceType: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  codeSnippet: z.string().optional().nullable(),
  codeLanguage: z.string().optional().nullable(),
  diagramData: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ploId: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  answers: z.array(answerOptionSchema).default([]),
  conceptIds: z.array(z.string()).default([]),
  concepts: z.array(questionConceptSchema).optional().default([]),
  stats: questionStatsSchema.optional().nullable(),
  correctRate: z.number().optional().nullable(),
  discriminationIndex: z.number().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

export type BankQuestionItem = z.infer<typeof bankQuestionItemSchema>;

export const questionBankPageSchema = z.object({
  items: z.array(bankQuestionItemSchema),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
});

export type QuestionBankPage = z.infer<typeof questionBankPageSchema>;

export interface QuestionBankFilterParams {
  search?: string;
  courseId?: string;
  classId?: string;
  chapterId?: string;
  questionType?: string;
  difficultyLevel?: string;
  bloomLevel?: string;
  sourceType?: string;
  conceptId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const questionEditorFormSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  questionType: QuestionTypeEnum.default('SINGLE_CHOICE'),
  difficultyLevel: DifficultyLevelEnum.default('MEDIUM'),
  bloomLevel: BloomLevelEnum.default('UNDERSTAND'),
  explanation: z.string().optional().default(''),
  codeSnippet: z.string().optional().default(''),
  codeLanguage: z.string().optional().default(''),
  ploId: z.string().optional().default(''),
  courseId: z.string().optional().default(''),
  tagsText: z.string().optional().default(''),
  conceptIds: z.array(z.string()).default([]),
  answers: z
    .array(
      z.object({
        content: z.string().min(1, 'Nội dung đáp án không được để trống'),
        isCorrect: z.boolean().default(false),
      })
    )
    .default([]),
});

export type QuestionEditorFormValues = z.infer<typeof questionEditorFormSchema>;

export const aiGenerateQuestionsFormSchema = z.object({
  courseId: z.string().optional().default(''),
  classId: z.string().optional().default(''),
  conceptIds: z.array(z.string()).default([]),
  prompt: z.string().min(3, 'Vui lòng nhập chủ đề hoặc yêu cầu sinh câu hỏi'),
  questionType: QuestionTypeEnum.default('SINGLE_CHOICE'),
  difficultyLevel: DifficultyLevelEnum.default('MEDIUM'),
  bloomLevel: BloomLevelEnum.default('UNDERSTAND'),
  count: z.number().int().min(1).max(20).default(5),
});

export type AiGenerateQuestionsFormValues = z.infer<typeof aiGenerateQuestionsFormSchema>;

export interface ImportQuestionsResult {
  totalParsed: number;
  savedCount: number;
  questions: BankQuestionItem[];
}

export interface BankClassOption {
  id: string;
  name: string;
  title: string;
  code: string;
}

export interface BankCourseOption {
  id: string;
  title: string;
  code?: string;
}

export interface TargetAssessmentOption {
  id: string;
  title: string;
  kind: 'QUIZ' | 'EXAM';
  status?: string;
}
