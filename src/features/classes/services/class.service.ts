import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  classItemSchema,
  classListEnvelopeSchema,
  type ClassItem,
  type ClassListResponse,
  type CreateClassRequest,
  type UpdateClassRequest,
  type ClassFilters,
} from '../schemas/class.schema';

/**
 * Fetch list of classes with search, filters and pagination.
 * Endpoint: GET /api/v1/classes/listClasses
 */
export async function getClasses(
  filters: Partial<ClassFilters> = {}
): Promise<ClassListResponse> {
  const params: Record<string, unknown> = {};
  if (filters.search) params.search = filters.search.trim();
  if (filters.status && filters.status !== 'ALL') params.status = filters.status;
  if (typeof filters.page === 'number') params.page = filters.page;
  if (typeof filters.size === 'number') params.size = filters.size;

  const { data } = await api.get<ApiResponse<unknown>>('/classes/listClasses', {
    params,
  });

  return classListEnvelopeSchema.parse(data.data);
}

/**
 * Get single class details by ID.
 * Endpoint: GET /api/v1/classes/{id}
 */
export async function getClassById(id: string): Promise<ClassItem> {
  const { data } = await api.get<ApiResponse<unknown>>(`/classes/${id}`);
  return classItemSchema.parse(data.data);
}

/**
 * Create a new class.
 * Endpoint: POST /api/v1/classes
 */
export async function createClass(payload: CreateClassRequest): Promise<ClassItem> {
  const { data } = await api.post<ApiResponse<unknown>>('/classes', payload);
  return classItemSchema.parse(data.data);
}

/**
 * Update class information.
 * Endpoint: PUT /api/v1/classes/{id}
 */
export async function updateClass(
  id: string,
  payload: Partial<UpdateClassRequest>
): Promise<ClassItem> {
  const { data } = await api.put<ApiResponse<unknown>>(`/classes/${id}`, payload);
  return classItemSchema.parse(data.data);
}

/**
 * Archive class (soft delete).
 * Endpoint: DELETE /api/v1/classes/{id}/soft
 */
export async function archiveClass(id: string): Promise<void> {
  await api.delete<ApiResponse<unknown>>(`/classes/${id}/soft`);
}

/**
 * Restore archived class.
 * Endpoint: PATCH /api/v1/classes/{id}/restore
 */
export async function restoreClass(id: string): Promise<void> {
  await api.patch<ApiResponse<unknown>>(`/classes/${id}/restore`);
}

/**
 * Toggle enrollment code open/closed status.
 * Endpoint: PATCH /api/v1/classes/{id}/code-status?isClosed={true|false}
 */
export async function toggleClassCodeStatus(
  id: string,
  isClosed: boolean
): Promise<void> {
  await api.patch<ApiResponse<unknown>>(`/classes/${id}/code-status`, null, {
    params: { isClosed },
  });
}

/**
 * Join a class by class code or enrollment key (Student action).
 * Endpoint: POST /api/v1/classes/join-by-code
 */
export async function joinClassByCode(classCode: string): Promise<unknown> {
  const { data } = await api.post<ApiResponse<unknown>>('/classes/join-by-code', {
    class_code: classCode.trim(),
  });
  return data.data;
}


