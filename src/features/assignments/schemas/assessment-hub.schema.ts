import { z } from 'zod';

export const assessmentKindSchema = z.enum(['ASSIGNMENT', 'QUIZ', 'EXAM']);
export type AssessmentKind = z.infer<typeof assessmentKindSchema>;

export const unifiedAssessmentStatusSchema = z.enum([
  'TODO',
  'OVERDUE',
  'SUBMITTED',
  'GRADED',
  'DRAFT',
  'OPEN',
  'NEEDS_GRADING',
  'CLOSED',
]);
export type UnifiedAssessmentStatus = z.infer<typeof unifiedAssessmentStatusSchema>;

export const hubClassSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  classCode: z.string().optional(),
  teachingRole: z.enum(['OWNER', 'PRIMARY_INSTRUCTOR', 'TEACHER', 'TA', 'STUDENT']).default('STUDENT'),
  memberStatus: z.string().optional(),
  enrolledCount: z.number().default(0),
});
export type HubClassSummary = z.infer<typeof hubClassSummarySchema>;

export const hubCourseOptionSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  name: z.string(),
});
export type HubCourseOption = z.infer<typeof hubCourseOptionSchema>;

export const unifiedAssessmentItemSchema = z.object({
  id: z.string(),
  kind: assessmentKindSchema,
  classId: z.string(),
  className: z.string(),
  classCode: z.string().optional(),
  courseId: z.string().optional().nullable(),
  courseName: z.string().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  durationMinutes: z.number().optional().nullable(),
  questionCount: z.number().optional().nullable(),
  maxScore: z.number().default(10),
  status: unifiedAssessmentStatusSchema,
  isPublished: z.boolean().default(true),
  studentSubmissionId: z.string().optional().nullable(),
  studentScore: z.number().optional().nullable(),
  studentSubmittedAt: z.string().optional().nullable(),
  studentFeedback: z.string().optional().nullable(),
  totalStudents: z.number().optional().nullable(),
  submittedCount: z.number().optional().nullable(),
  pendingGradingCount: z.number().optional().nullable(),
  averageScore: z.number().optional().nullable(),
  actionHref: z.string(),
  createdAt: z.string().optional().nullable(),
});
export type UnifiedAssessmentItem = z.infer<typeof unifiedAssessmentItemSchema>;

export const assessmentHubKpiSchema = z.object({
  todoCount: z.number(),
  overdueCount: z.number(),
  submittedCount: z.number(),
  gradedCount: z.number(),
  averageScore: z.number().nullable(),
  pendingGradingCount: z.number(),
  openCount: z.number(),
  draftCount: z.number(),
  totalCount: z.number(),
  assignmentCount: z.number(),
  quizCount: z.number(),
  examCount: z.number(),
});
export type AssessmentHubKpi = z.infer<typeof assessmentHubKpiSchema>;
