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
  id: z.string(),
  classId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  type: assignmentTypeSchema,
  status: assignmentStatusSchema,
  typeLabel: z.string().optional(),
  chapter: z.string().optional(),
  topic: z.string().optional(),
  bloomLevel: z.string().optional(),
  questionsCount: z.number().optional(),
  durationMinutes: z.number().optional(),
  plos: z.array(ploSchema).optional(),
  dueDate: z.string().optional(),
  dueDateLabel: z.string().optional(),
  timeRemainingLabel: z.string().optional(),
  isDueSoon: z.boolean().optional(),
  submittedCount: z.number().optional(),
  totalStudents: z.number().optional(),
  pendingGradingCount: z.number().optional(),
  classAverageScore: z.number().optional(),
  environment: z.string().optional(),
  sampleFile: sampleFileSchema.optional(),
  studentScore: z.number().optional(),
  studentMaxScore: z.number().optional(),
  studentRank: z.string().optional(),
  submissionDate: z.string().optional(),
  teacherFeedback: z.string().optional(),
  ploAchievedLabel: z.string().optional(),
  scoreClassification: z.string().optional(),
  unlockDate: z.string().optional(),
  unlockCondition: z.string().optional(),
  isLocked: z.boolean().optional(),
});
export type AssignmentItem = z.infer<typeof assignmentItemSchema>;

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
