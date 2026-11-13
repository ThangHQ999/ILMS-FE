import { z } from 'zod';

export const lessonTypeEnum = z.enum(['THEORY', 'VIDEO', 'QUIZ', 'ASSIGNMENT', 'DOCUMENT']);
export type LessonType = z.infer<typeof lessonTypeEnum>;

export const lessonMaterialSchema = z.object({
  id: z.string(),
  title: z.string(),
  fileType: z.string().optional(),
  fileSize: z.string().optional(),
  url: z.string().optional(),
});
export type LessonMaterial = z.infer<typeof lessonMaterialSchema>;

export const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  orderIndex: z.number().default(1),
  lessonType: lessonTypeEnum.default('THEORY'),
  duration: z.number().default(45), // duration in minutes
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED']).default('NOT_STARTED'),
  description: z.string().optional(),
  content: z.string().optional(),
  materials: z.array(lessonMaterialSchema).default([]),
});
export type Lesson = z.infer<typeof lessonSchema>;

export const chapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  orderIndex: z.number().default(1),
  lessons: z.array(lessonSchema).default([]),
});
export type Chapter = z.infer<typeof chapterSchema>;

export const courseDetailSchema = z.object({
  id: z.string(),
  courseCode: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
  visibility: z.string().optional(),
  credits: z.number().default(3),
  instructorName: z.string().optional(),
  instructorAvatar: z.string().optional(),
  instructorColor: z.string().optional(),
  currentWeek: z.string().optional(),
  teachingProgress: z.number().default(0),
  knowledgeNodesCount: z.number().default(0),
  quizzesCount: z.number().default(0),
  lecturesCount: z.number().default(0),
  chaptersCount: z.number().default(0),
  specialFeature: z.string().optional(),
  specialFeatureIcon: z.string().optional(),
  semester: z.string().optional(),
  classId: z.string().optional(),
  className: z.string().optional(),
  hasAiTutor: z.boolean().default(true),
});
export type CourseDetail = z.infer<typeof courseDetailSchema>;

export const courseContentTreeSchema = z.object({
  courseId: z.string(),
  courseTitle: z.string(),
  chapters: z.array(chapterSchema).default([]),
});
export type CourseContentTree = z.infer<typeof courseContentTreeSchema>;

export const createChapterSchema = z.object({
  title: z.string().min(1, 'validation.required'),
  description: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type CreateChapterInput = z.infer<typeof createChapterSchema>;

export const createLessonSchema = z.object({
  title: z.string().min(1, 'validation.required'),
  description: z.string().optional(),
  content: z.string().optional(),
  lessonType: lessonTypeEnum.default('THEORY'),
  duration: z.number().min(0).default(45),
  orderIndex: z.number().optional(),
});
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
