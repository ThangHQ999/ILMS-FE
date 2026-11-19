import { z } from 'zod';

export const assignmentTypeSchema = z.enum(['QUIZ', 'LAB', 'EXAM', 'PROJECT']);
export type AssignmentType = z.infer<typeof assignmentTypeSchema>;

export const assignmentStatusSchema = z.enum([
  'OPEN',
  'DUE_SOON',
  'SUBMITTED',
  'GRADED',
  'UPCOMING',
  'LOCKED',
]);
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;

export const ploSchema = z.object({
  code: z.string(),
  name: z.string(),
});
export type PloItem = z.infer<typeof ploSchema>;

export const sampleFileSchema = z.object({
  name: z.string(),
  size: z.string(),
  url: z.string().optional(),
});
export type SampleFile = z.infer<typeof sampleFileSchema>;

export const assignmentItemSchema = z.object({
  id: z.union([z.string(), z.number().transform(String)]),
  classId: z.string().nullable().optional(),
  lessonId: z.string().nullable().optional(),
  courseId: z.string().nullable().optional(),
  title: z.string().default('Bài tập'),
  description: z.string().nullable().optional(),
  type: z
    .union([assignmentTypeSchema, z.string()])
    .nullable()
    .optional()
    .transform((v) => {
      const s = String(v || '').toUpperCase();
      if (s === 'QUIZ' || s === 'EXAM' || s === 'PROJECT') return s as AssignmentType;
      return 'LAB' as AssignmentType;
    })
    .default('LAB'),
  status: z.union([assignmentStatusSchema, z.string()]).nullable().optional().default('OPEN'),
  typeLabel: z.string().nullable().optional(),
  chapter: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  bloomLevel: z.string().nullable().optional(),
  questionsCount: z.number().nullable().optional(),
  durationMinutes: z.number().nullable().optional(),
  plos: z.array(ploSchema).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  dueDateLabel: z.string().nullable().optional(),
  timeRemainingLabel: z.string().nullable().optional(),
  isDueSoon: z.boolean().nullable().optional(),
  maxScore: z.union([z.number(), z.string().transform((v) => Number(v))]).nullable().optional(),
  allowLateSubmission: z.boolean().nullable().optional(),
  fileAttachmentUrl: z.string().nullable().optional(),
  submittedCount: z.number().nullable().optional(),
  totalStudents: z.number().nullable().optional(),
  pendingGradingCount: z.number().nullable().optional(),
  classAverageScore: z.number().nullable().optional(),
  environment: z.string().nullable().optional(),
  sampleFile: sampleFileSchema.nullable().optional(),
  studentScore: z.union([z.number(), z.string().transform((v) => Number(v))]).nullable().optional(),
  studentMaxScore: z.union([z.number(), z.string().transform((v) => Number(v))]).nullable().optional(),
  studentRank: z.string().nullable().optional(),
  submissionDate: z.string().nullable().optional(),
  teacherFeedback: z.string().nullable().optional(),
  ploAchievedLabel: z.string().nullable().optional(),
  scoreClassification: z.string().nullable().optional(),
  unlockDate: z.string().nullable().optional(),
  unlockCondition: z.string().nullable().optional(),
  isLocked: z.boolean().nullable().optional(),
  createdAt: z.string().nullable().optional(),
});
export type AssignmentItem = z.infer<typeof assignmentItemSchema>;

export const assignmentListEnvelopeSchema = z.union([
  z.object({
    items: z.array(assignmentItemSchema),
    pageNumber: z.number().optional().default(0),
    page: z.number().optional(),
    pageSize: z.number().optional().default(10),
    size: z.number().optional(),
    totalElements: z.number().optional().default(0),
    totalPages: z.number().optional().default(1),
    last: z.boolean().optional().default(true),
  }).transform((val) => ({
    items: val.items,
    pageNumber: val.pageNumber ?? val.page ?? 0,
    pageSize: val.pageSize ?? val.size ?? 10,
    totalElements: val.totalElements ?? val.items.length,
    totalPages: val.totalPages ?? 1,
    last: val.last ?? true,
  })),
  z.object({
    content: z.array(assignmentItemSchema),
    number: z.number().optional().default(0),
    pageNumber: z.number().optional(),
    size: z.number().optional().default(10),
    pageSize: z.number().optional(),
    totalElements: z.number().optional().default(0),
    totalPages: z.number().optional().default(1),
    last: z.boolean().optional().default(true),
  }).transform((val) => ({
    items: val.content,
    pageNumber: val.number ?? val.pageNumber ?? 0,
    pageSize: val.size ?? val.pageSize ?? 10,
    totalElements: val.totalElements ?? val.content.length,
    totalPages: val.totalPages ?? 1,
    last: val.last ?? true,
  })),
  z.array(assignmentItemSchema).transform((items) => ({
    items,
    pageNumber: 0,
    pageSize: items.length || 10,
    totalElements: items.length,
    totalPages: 1,
    last: true,
  })),
]);
export type AssignmentListResponse = z.infer<typeof assignmentListEnvelopeSchema>;

export const mySubmissionStatusSchema = z.enum([
  'NOT_SUBMITTED',
  'SUBMITTED',
  'RESUBMITTED',
  'LATE',
  'GRADED',
]);
export type MySubmissionStatus = z.infer<typeof mySubmissionStatusSchema>;

export const mySubmissionSchema = z.object({
  id: z.string().optional(),
  assignmentId: z.string().optional(),
  assignmentTitle: z.string().optional(),
  studentId: z.string().optional(),
  studentName: z.string().optional(),
  studentCode: z.string().optional(),
  content: z.string().nullable().optional(),
  attachmentUrls: z.array(z.string()).optional().default([]),
  status: mySubmissionStatusSchema.optional().default('NOT_SUBMITTED'),
  score: z.number().nullable().optional(),
  feedback: z.string().nullable().optional(),
  submittedAt: z.string().nullable().optional(),
  gradedAt: z.string().nullable().optional(),
  gradedByTeacherId: z.string().nullable().optional(),
  gradedByTeacherName: z.string().nullable().optional(),
  isLate: z.boolean().optional(),
  submissionAttempt: z.number().nullable().optional(),
  maxAttempts: z.number().nullable().optional(),
});
export type MySubmission = z.infer<typeof mySubmissionSchema>;

export const teacherSubmissionItemSchema = z.object({
  id: z.string(),
  assignmentId: z.string().nullable().optional().transform((v) => v ?? ''),
  studentId: z.string().nullable().optional(),
  studentName: z.string().nullable().optional().transform((v) => (v && v.trim() ? v.trim() : '')),
  studentCode: z.string().nullable().optional(),
  studentAvatar: z.string().nullable().optional(),
  submittedAt: z.string().nullable().optional(),
  status: mySubmissionStatusSchema.nullable().optional().transform((v) => v ?? 'SUBMITTED'),
  isLate: z.boolean().nullable().optional().transform((v) => Boolean(v)),
  score: z
    .union([
      z.number(),
      z.string().transform((v) => (v.trim() === '' ? null : Number(v))),
    ])
    .nullable()
    .optional()
    .transform((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : null)),
  maxScore: z.number().nullable().optional(),
  feedback: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  attachmentUrls: z.array(z.string()).nullable().optional().transform((v) => v ?? []),
});
export type TeacherSubmissionItem = z.infer<typeof teacherSubmissionItemSchema>;

export const teacherSubmissionListEnvelopeSchema = z.union([
  z.object({
    items: z.array(teacherSubmissionItemSchema),
    pageNumber: z.number().optional().default(0),
    pageSize: z.number().optional().default(5),
    totalElements: z.number().optional().default(0),
    totalPages: z.number().optional().default(1),
    last: z.boolean().optional(),
  }).transform((val) => {
    const totalPages = Math.max(1, val.totalPages);
    return {
      items: val.items,
      pageNumber: val.pageNumber,
      pageSize: val.pageSize,
      totalElements: val.totalElements,
      totalPages,
      last: val.last ?? val.pageNumber >= totalPages - 1,
    };
  }),
  z.object({
    content: z.array(teacherSubmissionItemSchema),
    number: z.number().optional().default(0),
    size: z.number().optional().default(5),
    totalElements: z.number().optional().default(0),
    totalPages: z.number().optional().default(1),
    last: z.boolean().optional(),
  }).transform((val) => {
    const totalPages = Math.max(1, val.totalPages);
    return {
      items: val.content,
      pageNumber: val.number,
      pageSize: val.size,
      totalElements: val.totalElements,
      totalPages,
      last: val.last ?? val.number >= totalPages - 1,
    };
  }),
  z.array(teacherSubmissionItemSchema).transform((arr) => ({
    items: arr,
    pageNumber: 0,
    pageSize: arr.length || 5,
    totalElements: arr.length,
    totalPages: 1,
    last: true,
  })),
]);
export type TeacherSubmissionListResponse = z.infer<typeof teacherSubmissionListEnvelopeSchema>;

export const batchGradeFailedItemSchema = z.object({
  id: z.string(),
  reason: z.string().nullable().optional().transform((v) => (v && v.trim() ? v.trim() : '')),
});
export type BatchGradeFailedItem = z.infer<typeof batchGradeFailedItemSchema>;

export const batchGradeResultSchema = z.object({
  totalRequested: z.number(),
  successCount: z.number(),
  failedCount: z.number(),
  successIds: z.array(z.string()),
  failedItems: z.array(batchGradeFailedItemSchema),
});
export type BatchGradeResult = z.infer<typeof batchGradeResultSchema>;

export const gradeCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  countLabel: z.string(),
  weight: z.number(),
  achievedScore: z.number().optional(),
  statusLabel: z.string(),
  progressPercent: z.number().optional().default(0),
  barColor: z.string().optional(),
});
export type GradeCategory = z.infer<typeof gradeCategorySchema>;

export const gradeProgressSchema = z.object({
  categories: z.array(gradeCategorySchema),
  currentAccumulated: z.number(),
  maxAccumulated: z.number(),
});
export type GradeProgress = z.infer<typeof gradeProgressSchema>;

export const aiRecommendationSchema = z.object({
  id: z.string(),
  topic: z.string(),
  reason: z.string(),
  actionLabel: z.string(),
  quizId: z.string().optional(),
});
export type AiRecommendation = z.infer<typeof aiRecommendationSchema>;

export const studentPerformanceSchema = z.object({
  averageQuizScore: z.number(),
  onTimeRate: z.number(),
  streakCount: z.number(),
  streakXp: z.number(),
  ploBadgeLevel: z.string(),
});
export type StudentPerformance = z.infer<typeof studentPerformanceSchema>;

export const assignmentFiltersSchema = z.object({
  search: z.string().optional().default(''),
  chapter: z.string().optional().default('ALL'),
  topic: z.string().optional().default('ALL'),
  difficulty: z.string().optional().default('ALL'),
});
export type AssignmentFilters = z.infer<typeof assignmentFiltersSchema>;

export const classHubInfoSchema = z.object({
  courseCode: z.string().default('CS-202'),
  semester: z.string().default('HK2 2024-2025'),
  room: z.string().default('Phòng học thông minh H6-302'),
  title: z.string().default('Mạng máy tính & Truyền thông dữ liệu'),
  instructorName: z.string().default('TS. Lê Hoàng Nam'),
  department: z.string().default('Bộ môn: Kỹ thuật Mạng & Truyền thông'),
  studentsCount: z.number().default(48),
  assignmentsCount: z.number().default(8),
  completionRate: z.number().default(78.5),
});
export type ClassHubInfo = z.infer<typeof classHubInfoSchema>;

/**
 * Course item in a class (Active)
 */
export const activeCourseItemSchema = z.object({
  id: z.string(),
  code: z.string().optional().default(''),
  name: z.string(),
  status: z.string().optional().default('ACTIVE'),
});
export type ActiveCourseItem = z.infer<typeof activeCourseItemSchema>;

/**
 * Lesson item in a chapter
 */
export const courseLessonItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  chapterId: z.string().optional(),
  chapterName: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type CourseLessonItem = z.infer<typeof courseLessonItemSchema>;

/**
 * Create Assignment Payload Schema:
 * Endpoint: POST /api/v1/classes/{classId}/assignments
 */
export const createAssignmentSchema = z.object({
  courseId: z.string().min(1, 'errors.courseRequired'),
  lessonId: z.string().nullable().optional(),
  title: z
    .string()
    .trim()
    .min(1, 'errors.titleRequired')
    .max(255, 'errors.titleMaxLength'),
  description: z.string().optional().default(''),
  maxScore: z
    .number()
    .gt(0, 'errors.maxScorePositive')
    .lte(100, 'errors.maxScoreLimit')
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: 'errors.maxScoreDecimals',
    }),
  dueDate: z.string().nullable().optional(),
  allowLateSubmission: z.boolean().default(true),
  fileAttachmentUrl: z
    .string()
    .trim()
    .url('errors.invalidUrl')
    .max(500, 'errors.urlMaxLength')
    .or(z.literal(''))
    .nullable()
    .optional(),
});
export type CreateAssignmentPayload = z.infer<typeof createAssignmentSchema>;

/**
 * Update Assignment Payload Schema:
 * Endpoint: PATCH /api/v1/assignments/{id}
 */
export const updateAssignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'errors.titleRequired')
    .max(255, 'errors.titleMaxLength')
    .optional(),
  description: z.string().optional(),
  lessonId: z.string().nullable().optional(),
  maxScore: z
    .number()
    .gt(0, 'errors.maxScorePositive')
    .lte(100, 'errors.maxScoreLimit')
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: 'errors.maxScoreDecimals',
    })
    .optional(),
  dueDate: z.string().nullable().optional(),
  allowLateSubmission: z.boolean().optional(),
  fileAttachmentUrl: z
    .string()
    .trim()
    .url('errors.invalidUrl')
    .max(500, 'errors.urlMaxLength')
    .or(z.literal(''))
    .nullable()
    .optional(),
});
export type UpdateAssignmentPayload = z.infer<typeof updateAssignmentSchema>;

/**
 * Detailed Submission View Schema:
 * Endpoint: GET /api/v1/submissions/{id}
 */
export const submissionDetailSchema = z.object({
  id: z.string(),
  assignmentId: z.string(),
  assignmentTitle: z.string().nullable().optional(),
  assignmentDescription: z.string().nullable().optional(),
  studentId: z.string().nullable().optional(),
  studentName: z.string().nullable().optional(),
  studentCode: z.string().nullable().optional(),
  studentAvatar: z.string().nullable().optional(),
  submittedAt: z.string().nullable().optional(),
  status: mySubmissionStatusSchema.nullable().optional(),
  isLate: z.boolean().nullable().optional(),
  score: z.number().nullable().optional(),
  maxScore: z.number().nullable().optional(),
  feedback: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  attachmentUrls: z
    .array(z.string())
    .nullable()
    .optional()
    .transform((v) => (Array.isArray(v) ? v : [])),
  gradedAt: z.string().nullable().optional(),
  gradedByTeacherId: z.string().nullable().optional(),
  gradedByTeacherName: z.string().nullable().optional(),
  submissionAttempt: z.number().nullable().optional(),
  attempt: z.number().nullable().optional(),
  maxAttempts: z.number().nullable().optional(),
});
export type SubmissionDetail = z.infer<typeof submissionDetailSchema>;

export const MAX_FEEDBACK_UTF8_BYTES = 65535;

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function hasAtMostTwoSignificantDecimals(val: number): boolean {
  if (!Number.isFinite(val)) return false;
  const fixed = val.toFixed(6).replace(/0+$/, '');
  const parts = fixed.split('.');
  return parts.length <= 1 || parts[1].length <= 2;
}

/**
 * Payload Schema for Grading a single submission:
 * Endpoint: PATCH /api/v1/submissions/{id}/grade
 */
export const gradeSubmissionPayloadSchema = z.object({
  score: z
    .number()
    .finite('errors.scoreInvalid')
    .min(0, 'errors.scoreMin')
    .max(100, 'errors.scoreLimit')
    .refine(hasAtMostTwoSignificantDecimals, {
      message: 'errors.scoreDecimals',
    }),
  feedback: z
    .string()
    .refine((val) => utf8ByteLength(val) <= MAX_FEEDBACK_UTF8_BYTES, {
      message: 'errors.feedbackByteLimit',
    })
    .optional()
    .nullable(),
});
export type GradeSubmissionPayload = z.infer<typeof gradeSubmissionPayloadSchema>;

/**
 * Grading Record Schema:
 * Endpoint: GET /api/v1/submissions/{submissionId}/grading
 * Distinguishes gradingId (id) from submissionId and studentId.
 * Preserves numeric 0 for score, correctAnswersCount, scaledScore; never converts null to 0.
 */
export const submissionGradingSchema = z.object({
  id: z.string().min(1),
  submissionId: z.string().nullable().optional(),
  graderId: z.string().nullable().optional(),
  gradedByTeacherId: z.string().nullable().optional(),
  graderName: z.string().nullable().optional(),
  gradedByTeacherName: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  feedback: z.string().nullable().optional(),
  gradedAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  correctAnswersCount: z.number().nullable().optional(),
  scaledScore: z.number().nullable().optional(),
});
export type SubmissionGrading = z.infer<typeof submissionGradingSchema>;


