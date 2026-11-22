import { z } from 'zod';
import { bloomLevelSchema } from './plo.schema';

export const attainmentStatusSchema = z.enum([
  'NOT_ASSESSED',
  'BELOW',
  'APPROACHING',
  'MET',
  'EXCEEDED',
]);
export type AttainmentStatus = z.infer<typeof attainmentStatusSchema>;

export const classCloAttainmentSchema = z.object({
  cloId: z.string(),
  cloCode: z.string(),
  cloName: z.string().optional(),
  bloomLevel: bloomLevelSchema,
  targetScore: z.number().default(70.0),
  averageAttainmentScore: z.number(),
  attainmentRate: z.number(),
  studentsMetCount: z.number().default(0),
  status: attainmentStatusSchema,
});
export type ClassCloAttainment = z.infer<typeof classCloAttainmentSchema>;

export const classPloSummarySchema = z.object({
  ploId: z.string(),
  ploCode: z.string(),
  ploName: z.string().optional(),
  targetScore: z.number().default(70.0),
  averageAttainmentScore: z.number(),
  status: attainmentStatusSchema,
});
export type ClassPloSummary = z.infer<typeof classPloSummarySchema>;

export const classOutcomeAttainmentSchema = z.object({
  classId: z.string(),
  className: z.string().optional(),
  courseId: z.string(),
  courseName: z.string().optional(),
  totalStudents: z.number().default(0),
  cloAttainments: z.array(classCloAttainmentSchema).default([]),
  ploSummaries: z.array(classPloSummarySchema).default([]),
});
export type ClassOutcomeAttainment = z.infer<typeof classOutcomeAttainmentSchema>;

export const studentConceptBreakdownSchema = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  weight: z.number(),
  accuracy: z.number(),
  totalQuestions: z.number().optional(),
});
export type StudentConceptBreakdown = z.infer<typeof studentConceptBreakdownSchema>;

export const studentCloAttainmentSchema = z.object({
  cloId: z.string(),
  cloCode: z.string(),
  cloDescription: z.string().optional(),
  bloomLevel: bloomLevelSchema,
  targetScore: z.number().default(70.0),
  attainmentScore: z.number(),
  status: attainmentStatusSchema,
  conceptBreakdowns: z.array(studentConceptBreakdownSchema).default([]),
});
export type StudentCloAttainment = z.infer<typeof studentCloAttainmentSchema>;

export const studentPloAttainmentSchema = z.object({
  ploId: z.string(),
  ploCode: z.string(),
  ploDescription: z.string().optional(),
  bloomLevel: bloomLevelSchema,
  targetScore: z.number().default(70.0),
  calculatedScore: z.number(),
  status: attainmentStatusSchema,
});
export type StudentPloAttainment = z.infer<typeof studentPloAttainmentSchema>;

export const studentOutcomeAttainmentSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  avatarUrl: z.string().nullable().optional(),
  classId: z.string(),
  className: z.string().optional(),
  courseId: z.string(),
  courseTitle: z.string().optional(),
  overallAttainmentRate: z.number().default(0),
  metCloCount: z.number().default(0),
  totalCloCount: z.number().default(0),
  cloAttainments: z.array(studentCloAttainmentSchema).default([]),
  ploAttainments: z.array(studentPloAttainmentSchema).default([]),
});
export type StudentOutcomeAttainment = z.infer<typeof studentOutcomeAttainmentSchema>;
