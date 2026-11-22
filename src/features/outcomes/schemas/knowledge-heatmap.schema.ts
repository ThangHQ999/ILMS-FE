import { z } from 'zod';

export const masteryStatusSchema = z.enum([
  'NOT_STARTED',
  'WEAK',
  'DEVELOPING',
  'PROFICIENT',
  'MASTERED',
]);
export type MasteryStatus = z.infer<typeof masteryStatusSchema>;

export const conceptMasteryItemSchema = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  chapterTitle: z.string().optional(),
  masteryScore: z.number(),
  status: masteryStatusSchema,
  quizAccuracy: z.number().optional(),
  socraticProgress: z.number().optional(),
  totalQuestionsAttempted: z.number().optional(),
});
export type ConceptMasteryItem = z.infer<typeof conceptMasteryItemSchema>;

export const courseKnowledgeHeatmapSchema = z.object({
  courseId: z.string(),
  courseName: z.string().optional(),
  totalConcepts: z.number().default(0),
  averageMasteryScore: z.number().default(0),
  concepts: z.array(conceptMasteryItemSchema).default([]),
});
export type CourseKnowledgeHeatmap = z.infer<typeof courseKnowledgeHeatmapSchema>;

export const conceptHeaderSchema = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  chapterTitle: z.string().optional(),
});
export type ConceptHeader = z.infer<typeof conceptHeaderSchema>;

export const classHeatmapRowSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  studentEmail: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  averageScore: z.number().default(0),
  conceptScores: z.record(z.string(), z.number()).default({}),
});
export type ClassHeatmapRow = z.infer<typeof classHeatmapRowSchema>;

export const classAverageItemSchema = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  averageScore: z.number().default(0),
  status: masteryStatusSchema,
});
export type ClassAverageItem = z.infer<typeof classAverageItemSchema>;

export const classKnowledgeHeatmapSchema = z.object({
  classId: z.string(),
  className: z.string().optional(),
  courseId: z.string(),
  courseName: z.string().optional(),
  conceptHeaders: z.array(conceptHeaderSchema).default([]),
  rows: z.array(classHeatmapRowSchema).default([]),
  classAverages: z.array(classAverageItemSchema).default([]),
});
export type ClassKnowledgeHeatmap = z.infer<typeof classKnowledgeHeatmapSchema>;

export const weakConceptSchema = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  chapterTitle: z.string().optional(),
  averageScore: z.number(),
  weakStudentCount: z.number(),
  totalStudents: z.number(),
});
export type WeakConcept = z.infer<typeof weakConceptSchema>;

export const atRiskStudentSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  studentEmail: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  averageScore: z.number(),
  weakConceptCount: z.number(),
});
export type AtRiskStudent = z.infer<typeof atRiskStudentSchema>;

export const classKnowledgeGapsSchema = z.object({
  classId: z.string(),
  className: z.string().optional(),
  threshold: z.number().default(50.0),
  weakConcepts: z.array(weakConceptSchema).default([]),
  atRiskStudents: z.array(atRiskStudentSchema).default([]),
});
export type ClassKnowledgeGaps = z.infer<typeof classKnowledgeGapsSchema>;
