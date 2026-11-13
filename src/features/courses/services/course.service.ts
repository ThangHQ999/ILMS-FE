import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import {
  type CourseDetail,
  type Chapter,
  type Lesson,
  type CreateChapterInput,
  type CreateLessonInput,
  courseDetailSchema,
  chapterSchema,
} from '../schemas/course.schema';
import { MOCK_COURSE_DETAILS, DEFAULT_MOCK_CHAPTERS } from '../constants';

const CHAPTER_STORAGE_KEY = (courseId: string) => `ilms_course_chapters_${courseId}`;

export function getLocalChapters(courseId: string): Chapter[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CHAPTER_STORAGE_KEY(courseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLocalChapters(courseId: string, chapters: Chapter[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAPTER_STORAGE_KEY(courseId), JSON.stringify(chapters));
  } catch {
    // ignore quota error
  }
}

export async function getCourseDetail(courseId: string): Promise<CourseDetail> {
  // 1. Check known mock courses
  if (MOCK_COURSE_DETAILS[courseId]) {
    return MOCK_COURSE_DETAILS[courseId];
  }

  // 2. Check local class courses created by user
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ilms_class_courses_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const matched = list.find((c: any) => c.id === courseId);
              if (matched) {
                return courseDetailSchema.parse({
                  id: matched.id,
                  courseCode: matched.code || 'CS-NEW',
                  name: matched.name || 'Môn học mới',
                  description: matched.description || 'Chương trình học tập thông minh tích hợp AI.',
                  status: matched.status || 'ACTIVE',
                  credits: matched.credits || 3,
                  instructorName: matched.instructorName || 'TS. Lê Hoàng Nam',
                  instructorAvatar: matched.instructorAvatar || 'HN',
                  instructorColor: matched.instructorColor || 'bg-blue-600',
                  currentWeek: matched.currentWeek || 'Tuần 1/15',
                  teachingProgress: matched.teachingProgress || 10,
                  knowledgeNodesCount: matched.knowledgeNodesCount || 42,
                  quizzesCount: matched.quizzesCount || 5,
                  lecturesCount: matched.lecturesCount || 12,
                  chaptersCount: matched.chaptersCount || 3,
                  specialFeature: matched.specialFeature || 'Trợ lý AI Socratic',
                  specialFeatureIcon: matched.specialFeatureIcon || 'auto_awesome',
                  semester: matched.semester || 'Học kỳ II (2024-2025)',
                  hasAiTutor: true,
                });
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Try to fetch from backend API
  try {
    const { data: res } = await api.get<ApiResponse<any>>(`/courses/${courseId}`);
    if (res?.data) {
      const b = res.data;
      return courseDetailSchema.parse({
        id: b.id || courseId,
        courseCode: b.courseCode || 'CS-AUTO',
        name: b.name || 'Học phần',
        description: b.description || 'Mô tả học phần',
        status: b.status === 'PUBLISHED' || b.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
        credits: b.credits || 3,
        instructorName: 'TS. Nguyễn Văn A',
        instructorAvatar: 'NA',
        currentWeek: 'Tuần 1/15',
        teachingProgress: 15,
        knowledgeNodesCount: 30,
        quizzesCount: 4,
        lecturesCount: 10,
        chaptersCount: 2,
        hasAiTutor: true,
      });
    }
  } catch {
    // API failed or mock ID
  }

  // 4. Default graceful fallback
  return courseDetailSchema.parse({
    id: courseId,
    courseCode: courseId.startsWith('course-') ? courseId.replace('course-', '').toUpperCase() : 'HP-01',
    name: 'Không gian môn học',
    description: 'Chương trình giảng dạy học phần tích hợp Đồ thị tri thức và Trợ lý AI Socratic.',
    status: 'ACTIVE',
    credits: 3,
    instructorName: 'TS. Lê Hoàng Nam',
    instructorAvatar: 'HN',
    instructorColor: 'bg-blue-600',
    currentWeek: 'Tuần 1/15',
    teachingProgress: 25,
    knowledgeNodesCount: 50,
    quizzesCount: 8,
    lecturesCount: 16,
    chaptersCount: 4,
    hasAiTutor: true,
  });
}

export async function getCourseChapters(courseId: string): Promise<Chapter[]> {
  // 1. Check local storage changes
  const local = getLocalChapters(courseId);
  if (local && local.length > 0) {
    return local;
  }

  // 2. Try backend API GET /api/v1/courses/{courseId}/content
  try {
    const { data: res } = await api.get<ApiResponse<any>>(`/courses/${courseId}/content`);
    if (res?.data && res.data.chapters && Array.isArray(res.data.chapters) && res.data.chapters.length > 0) {
      const parsedChapters: Chapter[] = res.data.chapters.map((ch: any, idx: number) => ({
        id: ch.id || `chap-${courseId}-${idx + 1}`,
        title: ch.title || `Chương ${idx + 1}`,
        description: ch.description || '',
        orderIndex: ch.orderIndex || idx + 1,
        lessons: (ch.lessons || []).map((les: any, lIdx: number) => ({
          id: les.id || `les-${idx + 1}-${lIdx + 1}`,
          title: les.title || `Bài học ${lIdx + 1}`,
          orderIndex: les.orderIndex || lIdx + 1,
          lessonType: (les.lessonType || 'THEORY') as any,
          duration: les.duration || 45,
          status: 'NOT_STARTED',
          description: les.description || '',
          materials: les.materials || [],
        })),
      }));
      saveLocalChapters(courseId, parsedChapters);
      return parsedChapters;
    }
  } catch {
    // API not connected or returned error
  }

  // 3. Fallback to default mock chapters
  const fallback = DEFAULT_MOCK_CHAPTERS[courseId] || DEFAULT_MOCK_CHAPTERS['course-cs-202'] || [];
  return fallback;
}

export async function createChapter(
  courseId: string,
  input: CreateChapterInput
): Promise<Chapter> {
  const currentChapters = await getCourseChapters(courseId);
  const nextOrder = input.orderIndex || currentChapters.length + 1;

  let newChapter: Chapter = {
    id: `chap-${Date.now()}`,
    title: input.title,
    description: input.description,
    orderIndex: nextOrder,
    lessons: [],
  };

  try {
    const { data: res } = await api.post<ApiResponse<any>>(`/courses/${courseId}/chapters`, {
      title: input.title,
      description: input.description,
      orderIndex: nextOrder,
    });
    if (res?.data && res.data.id) {
      newChapter.id = res.data.id;
    }
  } catch {
    // Backend unavailable or mock course, persist locally
  }

  const updatedChapters = [...currentChapters, newChapter];
  saveLocalChapters(courseId, updatedChapters);
  return newChapter;
}

export async function createLesson(
  courseId: string,
  chapterId: string,
  input: CreateLessonInput
): Promise<Lesson> {
  const currentChapters = await getCourseChapters(courseId);
  const chapter = currentChapters.find((c) => c.id === chapterId);
  const currentLessons = chapter ? chapter.lessons : [];
  const nextOrder = input.orderIndex || currentLessons.length + 1;

  let newLesson: Lesson = {
    id: `les-${Date.now()}`,
    title: input.title,
    description: input.description,
    content: input.content,
    lessonType: input.lessonType,
    duration: input.duration,
    orderIndex: nextOrder,
    status: 'NOT_STARTED',
    materials: [],
  };

  try {
    const { data: res } = await api.post<ApiResponse<any>>(`/chapters/${chapterId}/lessons`, {
      title: input.title,
      description: input.description,
      content: input.content,
      lessonType: input.lessonType,
      duration: input.duration,
      orderIndex: nextOrder,
    });
    if (res?.data && res.data.id) {
      newLesson.id = res.data.id;
    }
  } catch {
    // Backend unavailable or mock course, persist locally
  }

  const updatedChapters = currentChapters.map((ch) => {
    if (ch.id === chapterId) {
      return {
        ...ch,
        lessons: [...ch.lessons, newLesson],
      };
    }
    return ch;
  });

  saveLocalChapters(courseId, updatedChapters);
  return newLesson;
}
