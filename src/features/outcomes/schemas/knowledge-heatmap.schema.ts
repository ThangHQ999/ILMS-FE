import { z } from 'zod';
import { pageResponseSchema } from '@/lib/page-response.schema';

export const masteryStatusSchema = z.enum([
  'NOT_STARTED', 'WEAK', 'DEVELOPING', 'PROFICIENT', 'MASTERED',
]);
export type MasteryStatus = z.infer<typeof masteryStatusSchema>;

export const conceptHeaderSchema = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  category: z.string().nullish(),
});
export type ConceptHeader = z.infer<typeof conceptHeaderSchema>;

export const conceptMasteryItemSchema = conceptHeaderSchema.extend({
  masteryPercent: z.number().nullish(),
  masteryStatus: masteryStatusSchema,
  evidenceCount: z.number().default(0),
  correctCount: z.number().default(0),
  totalQuestions: z.number().default(0),
});
export type ConceptMasteryItem = z.infer<typeof conceptMasteryItemSchema>;

export const courseKnowledgeHeatmapSchema = z.object({
  courseId: z.string(),
  courseTitle: z.string().nullish(),
  totalConcepts: z.number(),
  overallMastery: z.number().nullish(),
  concepts: z.array(conceptMasteryItemSchema),
});
export type CourseKnowledgeHeatmap = z.infer<typeof courseKnowledgeHeatmapSchema>;

export const classHeatmapRowSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  overallMastery: z.number().nullish(),
  evidenceCount: z.number().default(0),
  conceptMastery: z.array(conceptMasteryItemSchema),
});
export type ClassHeatmapRow = z.infer<typeof classHeatmapRowSchema>;

export const classAverageItemSchema = conceptHeaderSchema.extend({
  averageMastery: z.number().nullish(),
  masteryStatus: masteryStatusSchema,
  assessedStudents: z.number(),
  totalStudents: z.number(),
});
export type ClassAverageItem = z.infer<typeof classAverageItemSchema>;

export const classKnowledgeHeatmapSchema = z.object({
  classId: z.string(),
  className: z.string(),
  courseId: z.string(),
  courseTitle: z.string(),
  generatedAt: z.string().optional(),
  concepts: z.array(conceptHeaderSchema),
  students: pageResponseSchema(classHeatmapRowSchema),
  classAverages: z.array(classAverageItemSchema),
});
export type ClassKnowledgeHeatmap = z.infer<typeof classKnowledgeHeatmapSchema>;

export const weakConceptSchema = conceptHeaderSchema.extend({
  averageMastery: z.number().nullish(),
  studentsBelow: z.number(),
  assessedStudents: z.number(),
  totalStudents: z.number(),
});
export type WeakConcept = z.infer<typeof weakConceptSchema>;

export const atRiskStudentSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  overallMastery: z.number(),
  weakConceptCount: z.number(),
});
export type AtRiskStudent = z.infer<typeof atRiskStudentSchema>;

export const classKnowledgeGapsSchema = z.object({
  classId: z.string(),
  courseId: z.string(),
  threshold: z.number(),
  gaps: z.array(weakConceptSchema),
  atRiskStudents: z.array(atRiskStudentSchema),
});
export type ClassKnowledgeGaps = z.infer<typeof classKnowledgeGapsSchema>;

export const studentMasterySchema = z.object({
  studentId: z.string(),
  concepts: z.array(conceptMasteryItemSchema.extend({
    evidence: z.array(z.object({
      assessmentId: z.string(),
      assessmentTitle: z.string(),
      quizId: z.string(),
      questionId: z.string(),
      submittedAt: z.string(),
      correct: z.boolean(),
    })),
  })),
});
