import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import {
  classworkContextsSchema, classworkDraftSchema, classworkItemSchema,
  classworkPageSchema, courseClassGradebookSchema,
  type ClassworkContexts, type ClassworkDraft, type ClassworkItem,
  type ClassworkPage, type CourseClassGradebook,
} from '../schemas/classwork.schema';

function scopePath(classId: string, courseId: string): string {
  return `/classes/${encodeURIComponent(classId)}/courses/${encodeURIComponent(courseId)}`;
}

export async function getClassworkContexts(courseId: string): Promise<ClassworkContexts> {
  const { data } = await api.get<ApiResponse<unknown>>(`/courses/${encodeURIComponent(courseId)}/classwork-contexts`);
  return classworkContextsSchema.parse(data.data);
}

export async function getClassworkPage(classId: string, courseId: string, page: number): Promise<ClassworkPage> {
  const { data } = await api.get<ApiResponse<unknown>>(`${scopePath(classId, courseId)}/classwork`, { params: { page, size: 20 } });
  return classworkPageSchema.parse(data.data);
}

export async function getClassworkDraft(classId: string, courseId: string, id: string): Promise<ClassworkItem> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `${scopePath(classId, courseId)}/classwork/${encodeURIComponent(id)}`,
  );
  return classworkItemSchema.parse(data.data);
}

export async function saveClassworkDraft(
  classId: string,
  courseId: string,
  draft: ClassworkDraft,
  id?: string,
): Promise<ClassworkItem> {
  const path = `${scopePath(classId, courseId)}/classwork`;
  const payload = classworkDraftSchema.parse(draft);
  const { data } = id
    ? await api.put<ApiResponse<unknown>>(`${path}/${encodeURIComponent(id)}`, payload)
    : await api.post<ApiResponse<unknown>>(path, payload);
  return classworkItemSchema.parse(data.data);
}

export async function publishClasswork(classId: string, courseId: string, id: string): Promise<ClassworkItem> {
  const { data } = await api.patch<ApiResponse<unknown>>(
    `${scopePath(classId, courseId)}/classwork/${encodeURIComponent(id)}/publish`,
  );
  const item = classworkItemSchema.parse(data.data);
  if (item.publicationStatus !== 'PUBLISHED') {
    throw new Error('Classwork publication was not confirmed');
  }
  return item;
}

export async function getCourseClassGradebook(
  classId: string,
  courseId: string,
  page: number,
  canManage: boolean,
): Promise<CourseClassGradebook> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `${scopePath(classId, courseId)}/gradebook${canManage ? '' : '/me'}`,
    canManage ? { params: { page, size: 20 } } : undefined,
  );
  return courseClassGradebookSchema.parse(data.data);
}
