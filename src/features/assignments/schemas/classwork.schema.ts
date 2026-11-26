import { z } from 'zod';
import { pageResponseSchema } from '@/lib/page-response.schema';

export const classworkTypeSchema = z.enum(['NOTE', 'ASSIGNMENT', 'QUIZ', 'EXAM']);
export type ScopedClassworkType = z.infer<typeof classworkTypeSchema>;

const contextSchema = z.object({
  classId: z.string(),
  className: z.string(),
  canManage: z.boolean(),
});

export const classworkContextsSchema = z.object({
  courseId: z.string(),
  items: z.array(contextSchema),
});

export const classworkItemSchema = z.object({
  id: z.string(),
  type: classworkTypeSchema,
  title: z.string(),
  description: z.string().nullish(),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED']),
  countsTowardGrade: z.boolean(),
  scoreMax: z.number().nullish(),
  dueDate: z.string().nullish(),
  assessmentId: z.string().nullish(),
  opensAt: z.string().nullish(),
  closesAt: z.string().nullish(),
  durationMinutes: z.number().nullish(),
  lessonId: z.string().nullish(),
  allowLateSubmission: z.boolean().nullish(),
  maxAttempts: z.number().nullish(),
  fileAttachmentUrl: z.string().nullish(),
});

export const classworkPageSchema = pageResponseSchema(classworkItemSchema);

export const classworkDraftSchema = z.object({
  type: z.enum(['NOTE', 'ASSIGNMENT']),
  title: z.string().trim().min(1).max(255),
  description: z.string().optional(),
  lessonId: z.string().optional(),
  scoreMax: z.number().positive().optional(),
  countsTowardGrade: z.boolean(),
  dueDate: z.string().optional(),
  allowLateSubmission: z.boolean().optional(),
  maxAttempts: z.number().int().positive().optional(),
  fileAttachmentUrl: z.string().optional(),
});

const gradebookColumnSchema = classworkItemSchema.pick({
  id: true,
  title: true,
  type: true,
  scoreMax: true,
}).extend({ deliveryId: z.string() });

const gradebookCellSchema = z.object({
  assessmentId: z.string(),
  submissionId: z.string().nullish(),
  status: z.string(),
  score: z.number().nullable(),
  scoreMax: z.number().nullish(),
});

export const courseClassGradebookSchema = z.object({
  classId: z.string(),
  courseId: z.string(),
  assessments: z.array(gradebookColumnSchema),
  students: pageResponseSchema(z.object({
    studentId: z.string(),
    studentName: z.string(),
    cells: z.array(gradebookCellSchema),
  })),
});

export type ClassworkContexts = z.infer<typeof classworkContextsSchema>;
export type ClassworkItem = z.infer<typeof classworkItemSchema>;
export type ClassworkPage = z.infer<typeof classworkPageSchema>;
export type ClassworkDraft = z.infer<typeof classworkDraftSchema>;
export type CourseClassGradebook = z.infer<typeof courseClassGradebookSchema>;
