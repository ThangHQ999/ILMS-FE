import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import {
  type CourseDetail,
  type Chapter,
  type Lesson,
  type CreateChapterInput,
  type CreateLessonInput,
  type UpdateLessonInput,
  type CourseMaterialItem,
  type CourseKnowledgeGraph,
  type CourseConceptDetail,
  courseDetailSchema,
  courseMaterialItemSchema,
  courseKnowledgeGraphSchema,
  courseConceptDetailSchema,
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
  const cleanId = decodeURIComponent(courseId || '').trim().toLowerCase();

  // 1. Check known mock courses (flexible lookup by id or code)
  const matchedKey = Object.keys(MOCK_COURSE_DETAILS).find(
    (k) =>
      k.toLowerCase() === cleanId ||
      MOCK_COURSE_DETAILS[k]?.courseCode?.toLowerCase() === cleanId ||
      k.toLowerCase().replace('course-', '') === cleanId.replace('course-', '')
  );
  if (matchedKey && MOCK_COURSE_DETAILS[matchedKey]) {
    return MOCK_COURSE_DETAILS[matchedKey];
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
                  instructorName: matched.instructorName || '',
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
        description: b.description || '',
        status: b.status === 'PUBLISHED' || b.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
        visibility: b.visibility || undefined,
        credits: Number(b.credits ?? 3),
        instructorName: b.instructorName || b.instructor?.fullName || 'Giảng viên',
        instructorAvatar: b.instructorAvatar || 'GV',
        semester: b.semester || undefined,
        currentWeek:
          typeof b.currentWeek === 'number'
            ? `Tuần ${b.currentWeek}`
            : b.currentWeek || undefined,
        specialFeature: b.specialFeature || undefined,
        specialFeatureIcon: b.specialFeatureIcon || undefined,
        teachingProgress: Number(b.teachingProgress ?? 0),
        knowledgeNodesCount: Number(b.knowledgeNodesCount ?? 0),
        quizzesCount: Number(b.quizzesCount ?? 0),
        lecturesCount: Number(b.lecturesCount ?? 0),
        chaptersCount: Number(b.chaptersCount ?? 0),
        backgroundUrl: b.backgroundUrl || b.thumbnailUrl || undefined,
        thumbnailUrl: b.thumbnailUrl || undefined,
        ownerId: b.ownerId || undefined,
        hasAiTutor: b.hasAiTutor ?? true,
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
    instructorName: '',
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
  const cleanId = decodeURIComponent(courseId || '').trim().toLowerCase();

  // 1. Check local storage changes
  const local = getLocalChapters(courseId);
  if (local && local.length > 0) {
    return local;
  }

  // 2. Fetch directly from backend API GET /api/v1/courses/{courseId}/content
  try {
    const { data: res } = await api.get<ApiResponse<any>>(`/courses/${courseId}/content`);
    const rawChapters = Array.isArray(res?.data?.chapters)
      ? res.data.chapters
      : Array.isArray(res?.data)
        ? res.data
        : [];

    if (rawChapters.length > 0) {
      const parsedChapters: Chapter[] = rawChapters.map((ch: any, idx: number) => ({
        id: ch.id || `chap-${courseId}-${idx + 1}`,
        title: ch.title || `Chương ${idx + 1}`,
        description: ch.description || '',
        orderIndex: ch.orderIndex ?? idx + 1,
        lessons: (ch.lessons || []).map((les: any, lIdx: number) => ({
          id: les.id || `les-${idx + 1}-${lIdx + 1}`,
          title: les.title || `Bài học ${lIdx + 1}`,
          orderIndex: les.orderIndex ?? lIdx + 1,
          lessonType: (les.lessonType || 'THEORY') as any,
          duration:
            les.duration ??
            (typeof les.durationSeconds === 'number'
              ? Math.max(1, Math.round(les.durationSeconds / 60))
              : 45),
          status: (les.status === 'COMPLETED' || les.status === 'IN_PROGRESS'
            ? les.status
            : 'NOT_STARTED') as Lesson['status'],
          description: les.description || '',
          isPublished: typeof les.isPublished === 'boolean' ? les.isPublished : true,
          materials: les.materials || [],
        })),
      }));
      saveLocalChapters(courseId, parsedChapters);
      return parsedChapters;
    }
  } catch {
    // API not connected or returned error
  }

  // 3. Fallback to default mock chapters (flexible matching)
  const matchedKey = Object.keys(DEFAULT_MOCK_CHAPTERS).find(
    (k) =>
      k.toLowerCase() === cleanId ||
      k.toLowerCase().replace('course-', '') === cleanId.replace('course-', '')
  );
  const fallback = (matchedKey && DEFAULT_MOCK_CHAPTERS[matchedKey]) || DEFAULT_MOCK_CHAPTERS['course-cs-202'] || [];
  return fallback;

}

export async function createChapter(
  courseId: string,
  input: CreateChapterInput
): Promise<Chapter> {
  const { data: res } = await api.post<ApiResponse<any>>(`/courses/${courseId}/chapters`, {
    title: input.title,
    description: input.description,
    orderIndex: input.orderIndex ?? 1,
  });
  const ch = res?.data ?? {};
  return {
    id: ch.id || `chap-${Date.now()}`,
    title: ch.title || input.title,
    description: ch.description ?? input.description,
    orderIndex: ch.orderIndex ?? input.orderIndex ?? 1,
    lessons: ch.lessons || [],
  };
}

export async function deleteChapter(chapterId: string): Promise<void> {
  await api.delete(`/chapters/${chapterId}`);
}

export async function createLesson(
  courseId: string,
  chapterId: string,
  input: CreateLessonInput
): Promise<Lesson> {
  const safeContent =
    input.content?.trim() || input.description?.trim() || input.title.trim();
  const safeLessonType =
    input.lessonType === 'THEORY'
      ? 'TEXT'
      : input.lessonType === 'ASSIGNMENT'
        ? 'MODULAR'
        : input.lessonType || 'MODULAR';
  const durationMinutes = Math.max(1, input.duration ?? 45);
  const { data: res } = await api.post<ApiResponse<any>>(`/chapters/${chapterId}/lessons`, {
    title: input.title.trim(),
    content: safeContent,
    lessonType: safeLessonType,
    orderIndex: input.orderIndex ?? 1,
    duration: durationMinutes,
  });
  const les = (res?.data ?? res ?? {}) as Record<string, any>;
  const createdId = les.id || les.lessonId;
  if (!createdId) {
    throw new Error('Backend không trả về ID bài học mới.');
  }
  return {
    id: String(createdId),
    title: les.title || input.title,
    description: les.description ?? input.description,
    content: les.content ?? safeContent,
    isPublished:
      typeof les.isPublished === 'boolean'
        ? les.isPublished
        : input.isPublished ?? true,
    lessonType: (les.lessonType || safeLessonType) as Lesson['lessonType'],
    duration:
      les.duration ??
      (typeof les.durationSeconds === 'number'
        ? Math.max(1, Math.round(les.durationSeconds / 60))
        : durationMinutes),
    orderIndex: les.orderIndex ?? input.orderIndex ?? 1,
    status: (les.status || 'NOT_STARTED') as Lesson['status'],
    materials: les.materials || [],
  };
}

export async function updateLessonMetadata(
  lessonId: string,
  input: UpdateLessonInput
): Promise<void> {
  const payload: Record<string, unknown> = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.lessonType !== undefined ? { lessonType: input.lessonType } : {}),
    ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
    ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
    ...(input.durationSeconds !== undefined
      ? { duration: Math.max(1, Math.round(input.durationSeconds / 60)) }
      : {}),
  };
  await api.put(`/lessons/${lessonId}`, payload);
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await api.delete(`/lessons/${lessonId}`);
}

export async function getCourseMaterials(
  courseId: string,
  params?: { fileType?: string; search?: string; page?: number; size?: number }
): Promise<CourseMaterialItem[]> {
  const { data: res } = await api.get<ApiResponse<unknown>>(`/courses/${courseId}/materials`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      ...(params?.fileType ? { fileType: params.fileType } : {}),
      ...(params?.search ? { search: params.search } : {}),
    },
  });
  const payload = res?.data;
  const payloadObj =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  const rawList: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payloadObj?.content)
      ? payloadObj.content
      : Array.isArray(payloadObj?.items)
        ? payloadObj.items
        : [];
  return rawList.map((item) => courseMaterialItemSchema.parse(item));
}

export async function uploadCourseMaterial(
  courseId: string,
  file: File,
  title?: string,
  description?: string,
  isDownloadable = true,
  options?: { isStorageOnly?: boolean; skipAiExtraction?: boolean }
): Promise<CourseMaterialItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title?.trim() || file.name);
  if (description?.trim()) {
    formData.append('description', description.trim());
  }
  formData.append('isDownloadable', String(isDownloadable));
  if (options?.isStorageOnly || options?.skipAiExtraction) {
    formData.append('isStorageOnly', 'true');
    formData.append('skipAiExtraction', 'true');
  }

  const { data: res } = await api.post<ApiResponse<unknown>>(
    `/courses/${courseId}/materials`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return courseMaterialItemSchema.parse(res.data);
}

export async function extractCourseMaterial(
  materialId: string,
  options?: { autoPublish?: boolean }
): Promise<CourseMaterialItem> {
  const autoPublish = options?.autoPublish ?? false;
  const { data: res } = await api.post<ApiResponse<unknown>>(
    `/materials/${materialId}/extract`,
    undefined,
    { params: { autoPublish } }
  );
  return courseMaterialItemSchema.parse(res.data);
}

export async function updateCourseMaterialDownloadable(
  materialId: string,
  isDownloadable: boolean
): Promise<void> {
  await api.patch(`/materials/${materialId}/downloadable`, { isDownloadable });
}

export async function deleteCourseMaterial(materialId: string): Promise<void> {
  await api.delete(`/materials/${materialId}`);
}

export async function downloadCourseMaterial(
  materialId: string,
  filename: string
): Promise<void> {
  const response = await api.get(`/materials/${materialId}/download`, {
    responseType: 'blob',
  });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename || 'material');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export async function getCourseKnowledgeGraph(
  courseId: string
): Promise<CourseKnowledgeGraph> {
  // Canonical endpoint per docs/api-spec.md & CourseController.java
  const { data: res } = await api.get<ApiResponse<unknown>>(
    `/courses/${courseId}/knowledge-graph`
  );
  return courseKnowledgeGraphSchema.parse(res.data);
}

export async function getCourseConceptDetail(
  canonicalCode: string
): Promise<CourseConceptDetail> {
  const { data: res } = await api.get<ApiResponse<unknown>>(
    `/knowledge-graphs/published/concepts/${encodeURIComponent(canonicalCode)}`
  );
  return courseConceptDetailSchema.parse(res.data ?? {});
}
