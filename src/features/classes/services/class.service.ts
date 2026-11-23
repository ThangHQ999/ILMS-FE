import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  classItemSchema,
  classListEnvelopeSchema,
  classKpiSummarySchema,
  type ClassItem,
  type ClassListResponse,
  type ClassKpiSummary,
  type CreateClassRequest,
  type UpdateClassRequest,
  type ClassFilters,
} from '../schemas/class.schema';
import {
  DEFAULT_FACULTY_CLASSES,
  DEFAULT_STUDENT_CLASSES,
  DEFAULT_ACADEMIC_YEAR,
  CURRENT_SEMESTER,
} from '../constants';

const STORAGE_KEY_CREATED_CLASSES = 'ilms_user_created_classes';

/**
 * Normalize a class route/state identifier into the raw backend class ID
 * (e.g. strips legacy `class-` prefix like `class-1794915134961` -> `1794915134961`).
 */
export function normalizeClassApiId(id: string): string {
  const clean = decodeURIComponent(id || '').trim();
  return clean.startsWith('class-') ? clean.slice('class-'.length) : clean;
}

/**
 * Get locally persisted classes created by user (SSR-safe).
 * Filters out legacy synthetic `class-*` IDs so only real backend IDs remain.
 */
export function getLocalCreatedClasses(): ClassItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CREATED_CLASSES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is ClassItem =>
        Boolean(c && c.id && !String(c.id).startsWith('class-'))
    );
  } catch {
    return [];
  }
}

/**
 * Save newly created class to localStorage for persistence across F5 refresh.
 */
export function saveLocalCreatedClass(item: ClassItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCreatedClasses();
    const updated = [item, ...current.filter((c) => c.id !== item.id && c.name !== item.name)];
    localStorage.setItem(STORAGE_KEY_CREATED_CLASSES, JSON.stringify(updated));
  } catch {
    // quota exceeded or storage disabled
  }
}

/**
 * Remove class from local storage cache if deleted.
 */
export function removeLocalCreatedClass(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCreatedClasses();
    const updated = current.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CREATED_CLASSES, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Fetch list of classes with search, filters and pagination.
 * Aligned with docs/api-spec.md Section 6.1:
 * Endpoint: GET /api/v1/classes
 * Chỉ gọi đúng 1 lần duy nhất đến /classes
 */
export async function getClasses(
  filters: Partial<ClassFilters> = {}
): Promise<ClassListResponse> {
  const params: Record<string, unknown> = {};
  if (filters.search) params.search = filters.search.trim();
  if (filters.status && filters.status !== 'ALL') params.status = filters.status;
  if (filters.role && filters.role !== 'ALL') params.role = filters.role;
  if (filters.major) params.major = filters.major;
  if (typeof filters.page === 'number') params.page = filters.page;
  if (typeof filters.size === 'number') params.size = filters.size;

  let backendItems: ClassItem[] = [];
  let pageNumber = typeof filters.page === 'number' ? filters.page : 0;
  let pageSize = typeof filters.size === 'number' ? filters.size : 12;
  let totalElements = 0;
  let totalPages = 1;
  let last = true;

  try {
    // Primary: GET /api/v1/classes (gọi đúng 1 lần, không gọi lặp hay fallback mock ngầm)
    const response = await api.get<ApiResponse<unknown>>('/classes', { params });
    const resData = response.data?.data ?? response.data;

    if (resData) {
      const parsed = classListEnvelopeSchema.parse(resData);
      backendItems = parsed.items;
      pageNumber = parsed.pageNumber;
      pageSize = parsed.pageSize;
      totalElements = parsed.totalElements;
      totalPages = parsed.totalPages;
      last = parsed.last;
    }
  } catch {
    // Backend offline hoặc chưa có lớp, trả về rỗng không chèn mock data
    backendItems = [];
    totalElements = 0;
  }

  // Merge locally created classes at top (guarantees newly created classes persist across F5 refresh)
  const localClasses = getLocalCreatedClasses();
  if (localClasses.length > 0) {
    const existingIds = new Set(backendItems.map((c) => String(c.id)));
    const existingNames = new Set(backendItems.map((c) => c.name?.toLowerCase()));

    const newLocalItems = localClasses.filter(
      (c) => !existingIds.has(String(c.id)) && (!c.name || !existingNames.has(c.name.toLowerCase()))
    );

    backendItems = [...newLocalItems, ...backendItems];
    totalElements += newLocalItems.length;
  }

  return {
    items: backendItems,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    last,
  };
}

/**
 * Get single class details by ID.
 * Endpoint: GET /api/v1/classes/{id}
 */
export async function getClassById(id: string): Promise<ClassItem> {
  const apiId = normalizeClassApiId(id);

  // 1. Always fetch from Backend API first using the normalized real ID
  try {
    const { data } = await api.get<ApiResponse<unknown>>(`/classes/${apiId}`);
    return classItemSchema.parse(data.data ?? data);
  } catch {
    // 2. Fallback to local cache / defaults only when backend is unavailable
    const localList = getLocalCreatedClasses();
    const local = localList.find(
      (c) =>
        String(c.id).toLowerCase() === apiId.toLowerCase() ||
        c.name?.toLowerCase() === apiId.toLowerCase() ||
        c.enrollmentKey?.toLowerCase() === apiId.toLowerCase()
    );
    if (local) return local;

    const fallback = DEFAULT_FACULTY_CLASSES.find(
      (c) =>
        String(c.id).toLowerCase() === apiId.toLowerCase() ||
        c.name?.toLowerCase() === apiId.toLowerCase() ||
        c.enrollmentKey?.toLowerCase() === apiId.toLowerCase()
    );
    if (fallback) return fallback;

    const studentFallback = DEFAULT_STUDENT_CLASSES.find(
      (c) =>
        String(c.id).toLowerCase() === apiId.toLowerCase() ||
        c.name?.toLowerCase() === apiId.toLowerCase() ||
        c.enrollmentKey?.toLowerCase() === apiId.toLowerCase()
    );
    if (studentFallback) return studentFallback;

    const isRawUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiId.trim());
    const fallbackTitle = isRawUuid
      ? 'Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)'
      : apiId;
    const fallbackName = isRawUuid ? 'INT3306 01' : apiId;

    // 3. Safe auto-recovery fallback
    return {
      id: apiId,
      name: fallbackName,
      title: fallbackTitle,
      description: 'Không gian học tập và trao đổi môn học',
      academicYear: DEFAULT_ACADEMIC_YEAR,
      semester: CURRENT_SEMESTER,
      major: 'Khoa học Máy tính',
      maxStudents: 60,
      enrolledCount: 0,
      enrollmentKey: fallbackName,
      isCodeClosed: false,
      status: 'ACTIVE',
      teachingRole: 'PRIMARY_INSTRUCTOR',
      instructor: {
        fullName: '',
      },
      schedule: {
        room: 'Chưa xếp phòng',
        dayOfWeek: 'Thứ 2',
        timeSlot: 'Tiết 1-3',
      },
      stats: {
        pendingRequestsCount: 0,
        ungradedAssignmentsCount: 0,
        attendanceRate: 100,
      },
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Create a new class.
 * Aligned with docs/api-spec.md Section 6.1:
 * Endpoint: POST /api/v1/classes (ClassCreateRequestDTO)
 */
export async function createClass(payload: CreateClassRequest): Promise<ClassItem> {
  let createdItem: ClassItem | null = null;

  const dtoPayload = {
    name: payload.name.trim(),
    title: payload.title.trim(),
    description: payload.description?.trim() || '',
    academicYear: payload.academicYear || DEFAULT_ACADEMIC_YEAR,
    major: payload.major || 'Khoa học Máy tính',
    maxCapacity: Number(payload.maxCapacity ?? payload.maxStudents ?? 60) || 60,
    visibility: payload.visibility ?? 'PUBLIC',
    requireApproval: payload.requireApproval ?? true,
    isCodeActive: payload.isCodeActive ?? true,
    ...(payload.thumbnailUrl ? { thumbnailUrl: payload.thumbnailUrl } : {}),
    ...(payload.backgroundUrl ? { backgroundUrl: payload.backgroundUrl } : {}),
    ...(payload.startAt ? { startAt: payload.startAt } : {}),
    ...(payload.endAt ? { endAt: payload.endAt } : {}),
  };

  // Call existing Spring Boot POST /api/v1/classes and require real backend response
  const { data } = await api.post<ApiResponse<unknown>>('/classes', dtoPayload);
  const resData = data?.data ?? data;
  if (!resData) {
    throw new Error('Server did not return created class data');
  }
  const finalItem = classItemSchema.parse(resData);
  saveLocalCreatedClass(finalItem);
  return finalItem;
}

/**
 * Update class information.
 * Endpoint: PUT /api/v1/classes/{id}
 */
export async function updateClass(
  id: string,
  payload: Partial<UpdateClassRequest>
): Promise<ClassItem> {
  const apiId = normalizeClassApiId(id);
  const { data } = await api.put<ApiResponse<unknown>>(`/classes/${apiId}`, payload);
  return classItemSchema.parse(data.data ?? data);
}

/**
 * Archive class (soft delete).
 * Endpoint: DELETE /api/v1/classes/{id}/soft (hoặc DELETE /api/v1/classes/{id})
 */
export async function archiveClass(id: string): Promise<void> {
  const apiId = normalizeClassApiId(id);
  try {
    await api.delete<ApiResponse<unknown>>(`/classes/${apiId}/soft`);
  } catch {
    await api.delete<ApiResponse<unknown>>(`/classes/${apiId}`);
  }
}

/**
 * Permanently delete a class.
 * Endpoint: DELETE /api/v1/classes/{id} (as specified in docs/api-spec.md line 654)
 */
export async function deleteClass(id: string): Promise<void> {
  const apiId = normalizeClassApiId(id);
  try {
    await api.delete<ApiResponse<unknown>>(`/classes/${apiId}`);
  } catch (err) {
    // Fallback if backend route uses /soft
    try {
      await api.delete<ApiResponse<unknown>>(`/classes/${apiId}/soft`);
    } catch {
      throw err;
    }
  } finally {
    removeLocalCreatedClass(apiId);
  }
}

/**
 * Restore archived class.
 * Endpoint: PATCH /api/v1/classes/{id}/restore
 */
export async function restoreClass(id: string): Promise<void> {
  const apiId = normalizeClassApiId(id);
  await api.patch<ApiResponse<unknown>>(`/classes/${apiId}/restore`);
}

/**
 * Toggle enrollment code open/closed status.
 * Endpoint: PATCH /api/v1/classes/{id}/code-status?isClosed={true|false}
 */
export async function toggleClassCodeStatus(
  id: string,
  isClosed: boolean
): Promise<void> {
  const apiId = normalizeClassApiId(id);
  await api.patch<ApiResponse<unknown>>(`/classes/${apiId}/code-status`, null, {
    params: { isClosed },
  });
}

/**
 * Join a class by class code or enrollment key (Student action).
 * Endpoint: POST /api/v1/classes/join-by-code
 */
export async function joinClassByCode(classCode: string): Promise<unknown> {
  const code = classCode.trim();
  const { data } = await api.post<ApiResponse<unknown>>('/classes/join-by-code', {
    classCode: code,
    class_code: code,
  });
  return data.data ?? data;
}

/**
 * Get KPI overview summary for classes.
 * Endpoint: GET /api/v1/classes/kpi-summary
 */
export async function getClassKpiSummary(): Promise<ClassKpiSummary> {
  try {
    const response = await api.get<ApiResponse<unknown>>('/classes/kpi-summary');
    const resData = response.data?.data ?? response.data;
    if (resData) {
      return classKpiSummarySchema.parse(resData);
    }
  } catch {
    // Fallback if backend endpoint is unavailable or user offline
  }

  return {
    activeClassesCount: 0,
    totalStudentsCount: 0,
    pendingRequestsCount: 0,
    ungradedAssignmentsCount: 0,
  };
}

/**
 * Regenerate enrollment / invite code for a class.
 * Endpoint: POST /api/v1/classes/{id}/regenerate-code
 */
export async function regenerateClassCode(classId: string): Promise<string> {
  const apiId = normalizeClassApiId(classId);
  const { data } = await api.post<ApiResponse<unknown>>(
    `/classes/${apiId}/regenerate-code`
  );
  const resData = data?.data ?? data;

  if (typeof resData === 'string' && resData.trim()) {
    return resData.trim();
  }
  if (resData && typeof resData === 'object') {
    const record = resData as Record<string, unknown>;
    const candidate =
      record.classCode ?? record.enrollmentKey ?? record.code ?? record.class_code;
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  throw new Error('Invalid regenerate-code response from server');
}

/**
 * Invite a member to a class by email.
 * Endpoint: POST /api/v1/classes/{classId}/members/invite-by-email
 */
export async function inviteMemberByEmail(
  classId: string,
  email: string,
  role: 'STUDENT' | 'TEACHER' = 'STUDENT'
): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  await api.post<ApiResponse<unknown>>(`/classes/${apiId}/members/invite-by-email`, {
    email: email.trim(),
    role,
  });
}
