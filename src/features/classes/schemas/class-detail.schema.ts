import { z } from 'zod';
import { classItemSchema, type ClassItem } from './class.schema';

export const classCourseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: z.enum(['ACTIVE', 'PENDING', 'COMPLETED']).default('ACTIVE'),
  chaptersCount: z.number().optional(),
  materialsCount: z.number().optional(),
  instructorName: z.string().optional(),
  instructorAvatar: z.string().optional(),
  instructorColor: z.string().optional(),
  hasAiTutor: z.boolean().optional(),
  badge: z.string().optional(),
  description: z.string().optional(),
  credits: z.number().optional(),
  currentWeek: z.string().optional(),
  lecturesCount: z.number().optional(),
  knowledgeNodesCount: z.number().optional(),
  quizzesCount: z.number().optional(),
  teachingProgress: z.number().optional(),
  specialFeature: z.string().optional(),
  specialFeatureIcon: z.string().optional(),
  semester: z.string().optional(),
  classAvgScore: z.number().optional(),
  studentsCount: z.number().optional(),
});
export type ClassCourse = z.infer<typeof classCourseSchema>;

export const courseTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  badge: z.string(),
  credits: z.number().default(3),
  description: z.string(),
  usedCount: z.number().default(0),
});
export type CourseTemplate = z.infer<typeof courseTemplateSchema>;

export const classAnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorName: z.string(),
  authorRole: z.string().default('Chủ lớp'),
  authorInitials: z.string().default('LN'),
  authorColor: z.string().default('bg-blue-700'),
  createdAt: z.string(),
  isPinned: z.boolean().default(false),
});
export type ClassAnnouncement = z.infer<typeof classAnnouncementSchema>;

export const ploStatusSchema = z.enum(['EXCELLENT', 'PASSED', 'NEEDS_SUPPORT']);
export type PloStatus = z.infer<typeof ploStatusSchema>;

export const gradebookStudentSchema = z.object({
  id: z.string(),
  stt: stringOrNumber(),
  name: z.string(),
  studentCode: z.string(),
  email: z.string(),
  avatar: z.string().default('SV'),
  avatarColor: z.string().default('bg-blue-100 text-blue-700'),
  attendanceScore: z.number(),
  quizScore: z.number(),
  labScore: z.number(),
  midtermScore: z.number(),
  finalScore: z.number(),
  letterGrade: z.string(),
  ploPercent: z.number(),
  ploStatus: ploStatusSchema,
  warning: z.string().optional(),
});
export type GradebookStudent = z.infer<typeof gradebookStudentSchema>;

function stringOrNumber() {
  return z.union([z.string(), z.number()]).transform((v) => String(v));
}

export const gradebookAiAnalysisSchema = z.object({
  averageScore: z.number().default(7.92),
  ploPassRate: z.number().default(88.1),
  ploPassedCount: z.number().default(37),
  totalStudents: z.number().default(42),
  gradingProgress: z.string().default('14/16'),
  gradingPercent: z.number().default(95.8),
  earlyInterventionCount: z.number().default(3),
  distribution: z.object({
    gradeA: z.object({ percent: z.number(), count: z.number() }),
    gradeB: z.object({ percent: z.number(), count: z.number() }),
    gradeC: z.object({ percent: z.number(), count: z.number() }),
    gradeDF: z.object({ percent: z.number(), count: z.number() }),
  }),
  recommendedTopic: z.string(),
  recommendedDescription: z.string(),
});
export type GradebookAiAnalysis = z.infer<typeof gradebookAiAnalysisSchema>;

export const classMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  studentCode: z.string().optional(),
  email: z.string(),
  role: z.enum(['OWNER', 'TEACHER', 'STUDENT']).default('STUDENT'),
  status: z.enum(['APPROVED', 'PENDING']).default('APPROVED'),
  avatar: z.string().default('SV'),
  joinedAt: z.string().optional(),
});
export type ClassMember = z.infer<typeof classMemberSchema>;

export const materialFormatSchema = z.enum([
  'PDF',
  'PPTX',
  'QUIZ',
  'CODE',
  'DOC',
  'OTHER',
]);
export type MaterialFormat = z.infer<typeof materialFormatSchema>;

export const classMaterialSchema = z.object({
  id: z.string(),
  stt: z.string().optional(),
  title: z.string(),
  filename: z.string(),
  subjectName: z.string(),
  subjectCode: z.string(),
  category: z.string(),
  categoryType: z.enum(['syllabus', 'slide', 'quiz', 'code', 'curriculum', 'other']).default('slide'),
  format: materialFormatSchema.default('PDF'),
  size: z.string(),
  updatedAt: z.string(),
  aiStatus: z.string(),
  aiStatusType: z.enum(['synced', 'ready', 'quiz', 'code', 'standard']).default('ready'),
  viewsCount: z.number().default(0),
  isPinned: z.boolean().default(false),
  badge: z.string().optional(),
  subDetail: z.string().optional(),
});
export type ClassMaterial = z.infer<typeof classMaterialSchema>;

export interface ClassDetailData {
  classInfo: ClassItem;
  courses: ClassCourse[];
  announcements: ClassAnnouncement[];
  gradebookStudents: GradebookStudent[];
  gradebookAi: GradebookAiAnalysis;
  members: ClassMember[];
  materials?: ClassMaterial[];
  courseTemplates?: CourseTemplate[];
}
