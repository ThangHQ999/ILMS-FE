import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import {
  type ExamItem,
  type ExamListResponse,
  type CreateExamInput,
  type ExamQuestionItem,
  type AddExamQuestionInput,
  type UpdateExamQuestionInput,
  type BankQuestionItem,
  examItemSchema,
  examListEnvelopeSchema,
  examQuestionItemSchema,
  bankQuestionItemSchema,
  normalizeExamStatus,
  normalizeExamType,
} from '../schemas/exam.schema';

export interface GetClassExamsOptions {
  page?: number;
  size?: number;
  courseId?: string;
  examType?: string;
  status?: string;
  sort?: 'latest' | 'earliest' | string;
  search?: string;
  onlyPublished?: boolean;
}

export const CREATED_EXAMS_STORAGE_KEY = 'ilms_created_exams';
export const DELETED_DEMO_EXAMS_STORAGE_KEY = 'ilms_deleted_demo_exams';

export const MOCK_EXAMS: ExamItem[] = [
  {
    id: 'EXAM_001',
    title: 'Thi giữa kỳ Mạng máy tính',
    description:
      'Bài thi giữa kỳ kiểm tra kiến thức tổng hợp về mô hình OSI, kiến trúc giao thức TCP/IP, định tuyến và phân tích gói tin Wireshark. Sinh viên làm bài nghiêm túc, không sử dụng tài liệu ngoài.',
    courseId: 'cs-202',
    courseName: 'Mạng máy tính',
    courseCode: 'CS-202',
    examType: 'MIDTERM',
    durationMinutes: 60,
    maxScore: 10,
    totalScore: 10,
    startTime: '2024-11-15T07:30:00Z',
    endTime: '2024-11-15T09:00:00Z',
    status: 'UPCOMING',
    isPublished: true,
    questionCount: 20,
  },
  {
    id: 'EXAM_002',
    title: 'Kiểm tra TCP/IP',
    description: 'Kiểm tra trắc nghiệm kiến thức giao thức mạng TCP/IP',
    courseId: 'cs-202',
    courseName: 'Mạng máy tính',
    courseCode: 'CS-202',
    examType: 'QUIZ',
    durationMinutes: 20,
    maxScore: 10,
    totalScore: 10,
    startTime: '2024-11-04T08:00:00Z',
    endTime: '2024-11-04T23:59:00Z',
    status: 'OPENING',
    isPublished: true,
    questionCount: 2,
  },
  {
    id: 'EXAM_003',
    title: 'Kiểm tra mô hình OSI',
    description:
      'Bài kiểm tra đánh giá kiến thức về chức năng của 7 tầng trong mô hình OSI, cơ chế đóng gói dữ liệu và phân biệt giữa các tầng mạng.',
    courseId: 'cs-202',
    courseName: 'Mạng máy tính',
    courseCode: 'CS-202',
    examType: 'QUIZ',
    durationMinutes: 15,
    maxScore: 10,
    totalScore: 10,
    startTime: '2024-11-01T08:00:00Z',
    endTime: '2024-11-01T23:59:00Z',
    status: 'CLOSED',
    isPublished: true,
    questionCount: 2,
  },
];

export interface ExamNetworkLog {
  url: string;
  fullUrl: string;
  params?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  httpStatus: number;
  success: boolean;
  message?: string;
  timestamp: string;
  totalElements?: number;
  responseData?: unknown;
}

export function getCreatedExams(classId?: string): ExamItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CREATED_EXAMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (!classId) return parsed;
    return parsed.filter(
      (item: ExamItem & { classId?: string }) =>
        !item.classId || item.classId === classId
    );
  } catch {
    return [];
  }
}

export function saveCreatedExam(classId: string, exam: ExamItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCreatedExams();
    const updated = [{ ...exam, classId }, ...current.filter((e) => e.id !== exam.id)];
    localStorage.setItem(CREATED_EXAMS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export function getDeletedDemoExamIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_DEMO_EXAMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function markDemoExamDeleted(examId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDeletedDemoExamIds();
    if (!current.includes(examId)) {
      localStorage.setItem(
        DELETED_DEMO_EXAMS_STORAGE_KEY,
        JSON.stringify([...current, examId])
      );
    }
    const created = getCreatedExams().filter((e) => e.id !== examId);
    localStorage.setItem(CREATED_EXAMS_STORAGE_KEY, JSON.stringify(created));
  } catch {
    // Ignore storage errors
  }
}

export function resetCreatedExams(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CREATED_EXAMS_STORAGE_KEY);
    localStorage.removeItem(DELETED_DEMO_EXAMS_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function formatExamPayloadDateTime(dt: string): string {
  if (!dt) return dt;
  const trimmed = dt.trim();
  // If format is YYYY-MM-DDTHH:mm, append :00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }
  return trimmed;
}

const EXAM_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isExamUuid(id?: string | null): boolean {
  if (!id) return false;
  return EXAM_UUID_REGEX.test(id.trim());
}

export function isDemoExamClass(classId?: string | null): boolean {
  if (!classId) return false;
  return classId === 'csdl-k22-01' || classId.startsWith('csdl-');
}

export function isStaticShowcaseExam(examId?: string | null): boolean {
  if (!examId) return false;
  return examId === 'EXAM_001' || examId === 'EXAM_002' || examId === 'EXAM_003';
}

const LOCAL_DATETIME_NO_TZ_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?$/;

/**
 * Parse a backend LocalDateTime or ISO datetime string to epoch ms without
 * forcing 'Z' onto timezone-less strings (preventing UTC/+7 double shifts).
 */
export function parseExamLocalTimestamp(dt?: string | null): number | null {
  if (!dt || !dt.trim()) return null;
  const trimmed = dt.trim();

  const localMatch = trimmed.match(LOCAL_DATETIME_NO_TZ_REGEX);
  if (localMatch) {
    const year = Number(localMatch[1]);
    const month = Number(localMatch[2]) - 1;
    const day = Number(localMatch[3]);
    const hour = localMatch[4] ? Number(localMatch[4]) : 0;
    const minute = localMatch[5] ? Number(localMatch[5]) : 0;
    const second = localMatch[6] ? Number(localMatch[6]) : 0;
    const ms = localMatch[7] ? Number(localMatch[7].slice(0, 3).padEnd(3, '0')) : 0;
    const ts = new Date(year, month, day, hour, minute, second, ms).getTime();
    return Number.isNaN(ts) ? null : ts;
  }

  const parsed = new Date(trimmed).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Compute schedule status ('UPCOMING' | 'OPEN' | 'CLOSED') strictly from startTime/endTime
 * against the reference clock (nowMs). Returns null if timestamps are invalid/missing.
 */
export function computeExamScheduleStatus(
  startTime?: string | null,
  endTime?: string | null,
  nowMs: number = Date.now()
): 'UPCOMING' | 'OPEN' | 'CLOSED' | null {
  const startMs = parseExamLocalTimestamp(startTime);
  const endMs = parseExamLocalTimestamp(endTime);
  if (startMs === null || endMs === null) return null;
  if (nowMs < startMs) return 'UPCOMING';
  if (nowMs >= endMs) return 'CLOSED';
  return 'OPEN';
}

function getDemoStoredQuestionCount(examId: string): number | null {
  if (typeof window === 'undefined') {
    if (isStaticShowcaseExam(examId)) {
      return getStoredExamQuestions(examId).length;
    }
    return null;
  }
  try {
    const raw = localStorage.getItem(getExamQuestionsStorageKey(examId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.length;
    }
  } catch {
    // ignore storage errors
  }
  if (isStaticShowcaseExam(examId)) {
    return getStoredExamQuestions(examId).length;
  }
  return 0;
}

function syncDemoExamQuestionCount(examId: string, count: number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCreatedExams();
    let changed = false;
    const updated = current.map((exam) => {
      if (exam.id === examId) {
        changed = true;
        return { ...exam, questionCount: count };
      }
      return exam;
    });
    if (changed) {
      localStorage.setItem(CREATED_EXAMS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {
    // ignore storage errors
  }
}

export function hydrateDemoExam(item: ExamItem, nowMs: number = Date.now()): ExamItem {
  const normalizedType = normalizeExamType(item.examType);
  const isStatic = isStaticShowcaseExam(item.id);
  const computedStatus = !isStatic
    ? computeExamScheduleStatus(item.startTime, item.endTime, nowMs)
    : null;
  const resolvedStatus = computedStatus ?? normalizeExamStatus(item.status);
  const storedCount = getDemoStoredQuestionCount(item.id);
  const resolvedQuestionCount = !isStatic
    ? (storedCount ?? (typeof item.questionCount === 'number' ? item.questionCount : 0))
    : (storedCount ?? item.questionCount);

  return {
    ...item,
    examType: normalizedType,
    status: resolvedStatus,
    questionCount: resolvedQuestionCount,
  };
}

export interface ClassExamPermissionContext {
  classId: string;
  isStudentView: boolean;
  isDemoTeacherView?: boolean;
  isAuthLoading?: boolean;
  isClassLoading?: boolean;
  isClassError?: boolean;
  isClassInfoLive?: boolean;
  isMembersLive?: boolean;
  user?: {
    id?: string | null;
    roleName?: string | null;
  } | null;
  classInfo?: {
    ownerId?: string | null;
    instructor?: { id?: string | null } | null;
  } | null;
  members?: Array<{
    id?: string | null;
    userId?: string | null;
    role?: string | null;
    status?: string | null;
  }> | null;
}

/**
 * Evaluate whether the current authenticated user has real management permission
 * over exams in the active class.
 * - Real UUID classes: strictly requires authenticated session + live class/member data
 *   proving ADMIN, class owner/instructor, or approved OWNER/TEACHER class member.
 *   Never grants write permission solely from role switcher, email, avatar, or fallback mock.
 * - Demo classes (csdl-*): preserves local demo teacher workflow.
 */
export function evaluateCanManageClassExams(ctx: ClassExamPermissionContext): boolean {
  if (ctx.isStudentView) return false;

  if (isDemoExamClass(ctx.classId)) {
    return Boolean(ctx.isDemoTeacherView);
  }

  if (ctx.isAuthLoading || ctx.isClassLoading || ctx.isClassError) {
    return false;
  }

  const userId = ctx.user?.id?.trim();
  if (!userId) return false;

  if (!ctx.isClassInfoLive || !ctx.classInfo) {
    return false;
  }

  const normalizedRoleName = (ctx.user?.roleName || '').trim().toUpperCase();
  if (
    normalizedRoleName === 'ADMIN' ||
    normalizedRoleName === 'ROLE_ADMIN' ||
    normalizedRoleName === 'SYSTEM_ADMIN'
  ) {
    return true;
  }

  if (ctx.classInfo.ownerId && ctx.classInfo.ownerId === userId) {
    return true;
  }

  if (ctx.classInfo.instructor?.id && ctx.classInfo.instructor.id === userId) {
    return true;
  }

  if (ctx.isMembersLive && Array.isArray(ctx.members)) {
    const isApprovedClassTeacher = ctx.members.some((m) => {
      const memberUid = m.userId || m.id;
      if (!memberUid || memberUid !== userId) return false;
      const role = (m.role || '').trim().toUpperCase();
      const status = (m.status || 'APPROVED').trim().toUpperCase();
      const isManagerRole =
        role === 'OWNER' ||
        role === 'TEACHER' ||
        role === 'PRIMARY_INSTRUCTOR' ||
        role === 'TA';
      return isManagerRole && status !== 'PENDING' && status !== 'REJECTED';
    });
    if (isApprovedClassTeacher) return true;
  }

  return false;
}

/**
 * Format an exam LocalDateTime string ("YYYY-MM-DDTHH:mm(:ss)") into "HH:mm – DD/MM/YYYY"
 * without forcing UTC shifts or calling toISOString().
 */
export function formatExamLocalDateTime(dt?: string | null): string {
  if (!dt || !dt.trim()) return '--:--';
  const trimmed = dt.trim();
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2})?/
  );
  if (match) {
    const [, year, month, day, hours, minutes] = match;
    return `${hours}:${minutes} – ${day}/${month}/${year}`;
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} – ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Format an exam LocalDateTime string ("YYYY-MM-DDTHH:mm(:ss)") into "DD/MM/YYYY"
 * without forcing UTC shifts or calling toISOString().
 */
export function formatExamLocalDate(dt?: string | null): string {
  if (!dt || !dt.trim()) return '--';
  const trimmed = dt.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return '--';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function parseSortableExamTime(dt?: string | null): number {
  if (!dt) return 0;
  const match = dt.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6] || '0')
    ).getTime();
  }
  const parsed = new Date(dt).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

export function filterAndPaginateMockExams(
  options: GetClassExamsOptions = {},
  classId?: string
): ExamListResponse {
  const page = options.page ?? 0;
  const size = options.size ?? 10;

  const deletedIds = new Set(getDeletedDemoExamIds());
  const createdItems = getCreatedExams(classId).filter((c) => !deletedIds.has(c.id));
  let items = [
    ...createdItems,
    ...MOCK_EXAMS.filter(
      (m) => !deletedIds.has(m.id) && !createdItems.some((c) => c.id === m.id)
    ),
  ].map((item) => hydrateDemoExam(item));

  if (options.courseId) {
    items = items.filter((item) => item.courseId === options.courseId);
  }

  if (options.onlyPublished) {
    items = items.filter((item) => item.isPublished === true);
  }

  if (options.examType && options.examType !== 'ALL') {
    const targetType = normalizeExamType(options.examType);
    items = items.filter((item) => normalizeExamType(item.examType) === targetType);
  }

  if (options.status && options.status !== 'ALL') {
    const targetStatus = normalizeExamStatus(options.status);
    items = items.filter((item) => normalizeExamStatus(item.status) === targetStatus);
  }

  if (options.search?.trim()) {
    const q = options.search.trim().toLowerCase();
    items = items.filter((item) => item.title.toLowerCase().includes(q));
  }

  // Sort by startTime
  const sortDirection = options.sort === 'earliest' ? 1 : -1;
  items.sort((a, b) => {
    const timeA = parseSortableExamTime(a.startTime);
    const timeB = parseSortableExamTime(b.startTime);
    return (timeA - timeB) * sortDirection;
  });

  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const startIndex = page * size;
  const pagedItems = items.slice(startIndex, startIndex + size);

  return {
    items: pagedItems,
    pageNumber: page,
    pageSize: size,
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
  };
}

/**
 * Fetch class exams paged from backend:
 * Endpoint: GET /api/v1/classes/{classId}/exams
 * Query params: courseId?, examType?, status?, page, size, sort
 * Note:
 * - Never sends COMPETITION (adapted to CONTEST) or OPENING (adapted to OPEN).
 * - Never sends unsupported `search` param to backend.
 * - For real UUID classes: strictly parses PageResponse, never mixes localStorage or falls back to mocks.
 */
export async function getClassExamsPaged(
  classId: string,
  options: GetClassExamsOptions = {}
): Promise<ExamListResponse> {
  const page = options.page ?? 0;
  const size = options.size ?? 10;
  const isDemoClass = isDemoExamClass(classId);

  const queryParams: Record<string, unknown> = {
    page,
    size,
  };

  if (options.courseId) {
    queryParams.courseId = options.courseId;
  }
  if (options.examType && options.examType !== 'ALL') {
    queryParams.examType = normalizeExamType(options.examType);
  }
  if (options.status && options.status !== 'ALL') {
    queryParams.status = normalizeExamStatus(options.status);
  }
  if (options.sort) {
    queryParams.sort =
      options.sort === 'earliest' ? 'startTime,asc' : 'startTime,desc';
  }

  const endpointPath = `/classes/${classId}/exams`;
  const queryString = new URLSearchParams(
    Object.entries(queryParams).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null) {
        acc[k] = String(v);
      }
      return acc;
    }, {})
  ).toString();

  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}?${queryString}`;

  try {
    const { data } = await api.get<ApiResponse<unknown>>(endpointPath, {
      params: queryParams,
    });

    if (!data || data.data === undefined || data.data === null) {
      const schemaErr = new Error('Exam list response payload is missing data') as Error & {
        code?: string;
      };
      schemaErr.code = 'SCHEMA_ERROR';
      throw schemaErr;
    }

    const parsed = examListEnvelopeSchema.parse(data.data);

    // For real classes: trust server PageResponse verbatim (never mix localStorage or corrupt totalElements)
    if (!isDemoClass) {
      if (typeof window !== 'undefined') {
        const win = window as unknown as { __lastExamsNetworkCall?: ExamNetworkLog };
        win.__lastExamsNetworkCall = {
          url: endpointPath,
          fullUrl: fullRequestUrl,
          params: queryParams,
          httpStatus: 200,
          success: true,
          message: data?.message || 'OK',
          timestamp: new Date().toISOString(),
          totalElements: parsed.totalElements,
        };
      }
      return parsed;
    }

    // Demo class branch only
    let createdItems = getCreatedExams(classId);
    let apiItems = parsed.items;
    if (options.onlyPublished) {
      createdItems = createdItems.filter((c) => c.isPublished === true);
      apiItems = apiItems.filter((i) => i.isPublished === true);
    }
    const combinedItems = [
      ...createdItems.filter((c) => !apiItems.some((i) => i.id === c.id)),
      ...apiItems,
    ];
    const combinedTotal = Math.max(parsed.totalElements, combinedItems.length);
    const combinedPages = Math.max(1, Math.ceil(combinedTotal / size));

    const response: ExamListResponse = {
      ...parsed,
      items: combinedItems,
      totalElements: combinedTotal,
      totalPages: combinedPages,
      last: page >= combinedPages - 1,
    };

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastExamsNetworkCall?: ExamNetworkLog };
      win.__lastExamsNetworkCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        params: queryParams,
        httpStatus: 200,
        success: true,
        message: data?.message || 'OK',
        timestamp: new Date().toISOString(),
        totalElements: response.totalElements,
      };
    }
    return response;
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; status?: number })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      (err as { status?: number })?.status ||
      0;
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || (err as Error)?.message;

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastExamsNetworkCall?: ExamNetworkLog };
      win.__lastExamsNetworkCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        params: queryParams,
        httpStatus,
        success: false,
        message,
        timestamp: new Date().toISOString(),
      };
    }

    // Only fallback to mock exams for explicit demo classes (e.g. csdl-k22-01)
    if (isDemoClass) {
      return filterAndPaginateMockExams(options, classId);
    }

    // For real / UUID classes: propagate HTTP / network / schema errors directly (no mock fallback)
    throw err;
  }
}

/**
 * Fetch all pages of exams for a given class and filter options.
 * Fetches page 0 first, inspects totalPages, then fetches remaining pages in bounded concurrency chunks (max 4).
 * If any required page fails, throws so UI never reports an incomplete search result as complete.
 */
export async function fetchAllClassExams(
  classId: string,
  options: Omit<GetClassExamsOptions, 'page' | 'size'> = {}
): Promise<ExamItem[]> {
  const fetchPageSize = 20;
  const firstPage = await getClassExamsPaged(classId, {
    ...options,
    page: 0,
    size: fetchPageSize,
  });

  const allItems: ExamItem[] = [...(firstPage.items || [])];
  const totalPages = Math.max(1, firstPage.totalPages || 1);

  if (totalPages > 1) {
    const remainingPages: number[] = [];
    for (let p = 1; p < totalPages; p++) {
      remainingPages.push(p);
    }

    const CONCURRENCY_LIMIT = 4;
    for (let i = 0; i < remainingPages.length; i += CONCURRENCY_LIMIT) {
      const batch = remainingPages.slice(i, i + CONCURRENCY_LIMIT);
      const batchResults = await Promise.all(
        batch.map((p) =>
          getClassExamsPaged(classId, {
            ...options,
            page: p,
            size: fetchPageSize,
          })
        )
      );
      for (const res of batchResults) {
        allItems.push(...(res.items || []));
      }
    }
  }

  // Deduplicate by item.id while preserving order
  const seen = new Set<string>();
  return allItems.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * Create a new exam:
 * Endpoint: POST /api/v1/classes/{classId}/exams
 * Body: { courseId, title, description, examType, durationMinutes, totalScore, startTime, endTime }
 */
export async function createExam(
  classId: string,
  input: CreateExamInput
): Promise<ExamItem> {
  const endpointPath = `/classes/${classId}/exams`;
  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}`;

  const formattedStartTime = formatExamPayloadDateTime(input.startTime);
  const formattedEndTime = formatExamPayloadDateTime(input.endTime);

  const requestPayload = {
    courseId: input.courseId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    examType: input.examType,
    durationMinutes: Number(input.durationMinutes),
    totalScore: Number(input.totalScore),
    startTime: formattedStartTime,
    endTime: formattedEndTime,
  };

  try {
    const { data } = await api.post<ApiResponse<unknown>>(endpointPath, requestPayload);

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastExamCreateCall?: ExamNetworkLog };
      win.__lastExamCreateCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        payload: requestPayload,
        httpStatus: 201,
        success: true,
        message: data?.message || 'Tạo bài thi thành công',
        timestamp: new Date().toISOString(),
        responseData: data?.data,
      };
    }

    const responseObj = (data?.data as Record<string, unknown>) || {};
    const computedStatus =
      computeExamScheduleStatus(formattedStartTime, formattedEndTime) ?? 'UPCOMING';
    const createdItem: ExamItem = {
      id: (responseObj.id as string) || `exam-${Date.now()}`,
      courseId: input.courseId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      examType: input.examType,
      durationMinutes: Number(input.durationMinutes),
      maxScore: Number(input.totalScore),
      totalScore: Number(input.totalScore),
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      status:
        typeof responseObj.status === 'string' && responseObj.status.trim()
          ? normalizeExamStatus(responseObj.status)
          : computedStatus,
      isPublished:
        typeof responseObj.isPublished === 'boolean' ? responseObj.isPublished : false,
      questionCount:
        typeof responseObj.questionCount === 'number' ? responseObj.questionCount : 0,
      createdAt: new Date().toISOString(),
    };

    if (!isExamUuid(createdItem.id)) {
      saveCreatedExam(classId, createdItem);
    }
    return createdItem;
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; status?: number })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      (err as { status?: number })?.status ||
      0;
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || (err as Error)?.message || 'Lỗi khi tạo bài thi';

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastExamCreateCall?: ExamNetworkLog };
      win.__lastExamCreateCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        payload: requestPayload,
        httpStatus,
        success: false,
        message,
        timestamp: new Date().toISOString(),
        responseData: (err as { response?: { data?: unknown } })?.response?.data,
      };
    }

    // For demo classes (e.g. csdl-k22-01), fallback smoothly to local storage persistence
    if (classId === 'csdl-k22-01' || classId.startsWith('csdl-')) {
      const demoStatus =
        computeExamScheduleStatus(formattedStartTime, formattedEndTime) ?? 'UPCOMING';
      const demoItem: ExamItem = {
        id: `exam-demo-${Date.now()}`,
        courseId: input.courseId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        examType: input.examType,
        durationMinutes: Number(input.durationMinutes),
        maxScore: Number(input.totalScore),
        totalScore: Number(input.totalScore),
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        status: demoStatus,
        isPublished: false, // Đề vừa tạo phải hiện Chưa công bố
        questionCount: 0,
        courseName: 'Mạng máy tính',
        courseCode: 'CS-202',
        createdAt: new Date().toISOString(),
      };
      saveCreatedExam(classId, demoItem);
      return demoItem;
    }

    // Real API classes propagate error so form preserves inputs and shows API error
    throw err;
  }
}

/**
 * Fetch exam detail by ID:
 * Endpoint: GET /api/v1/exams/{id}
 * - For real UUID exam IDs: strictly calls backend API, parses with Zod, and propagates errors (no mock fallback).
 * - For demo/non-UUID IDs: reads from local created demo exams or built-in MOCK_EXAMS and computes live schedule status & questionCount.
 */
export async function getExamById(
  examId: string,
  classId?: string
): Promise<ExamItem> {
  const isUuid = isExamUuid(examId);

  if (isUuid) {
    const { data } = await api.get<ApiResponse<unknown>>(`/exams/${examId}`);
    if (!data || data.data === undefined || data.data === null) {
      const schemaErr = new Error('Exam detail payload is missing data') as Error & {
        code?: string;
      };
      schemaErr.code = 'SCHEMA_ERROR';
      throw schemaErr;
    }
    return examItemSchema.parse(data.data);
  }

  // Demo exam branch (non-UUID IDs such as exam-demo-*, EXAM_001, EXAM_002, EXAM_003)
  const deletedIds = new Set(getDeletedDemoExamIds());
  if (deletedIds.has(examId)) {
    const notFoundErr = new Error(`Không tìm thấy bài thi với ID: ${examId}`) as Error & {
      httpStatus?: number;
    };
    notFoundErr.httpStatus = 404;
    throw notFoundErr;
  }

  const createdExams = getCreatedExams(classId);
  const foundCreated = createdExams.find((e) => e.id === examId);
  if (foundCreated) {
    return examItemSchema.parse(hydrateDemoExam(foundCreated));
  }

  const foundMock = MOCK_EXAMS.find((e) => e.id === examId);
  if (foundMock) {
    return examItemSchema.parse(hydrateDemoExam(foundMock));
  }

  const notFoundErr = new Error(`Không tìm thấy bài thi với ID: ${examId}`) as Error & {
    httpStatus?: number;
  };
  notFoundErr.httpStatus = 404;
  throw notFoundErr;
}

/**
 * Update an existing exam:
 * Endpoint: PATCH /api/v1/exams/{id}
 * Body: only changed (dirty) fields
 */
export async function updateExam(
  examId: string,
  dirtyPayload: Partial<CreateExamInput>,
  classId?: string
): Promise<ExamItem> {
  const endpointPath = `/exams/${examId}`;
  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}`;

  const formattedPayload: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(dirtyPayload)) {
    if (val !== undefined) {
      if (key === 'startTime' || key === 'endTime') {
        formattedPayload[key] = formatExamPayloadDateTime(String(val));
      } else if (key === 'durationMinutes' || key === 'totalScore') {
        formattedPayload[key] = Number(val);
      } else if (key === 'title') {
        formattedPayload[key] = String(val).trim();
      } else if (key === 'description') {
        formattedPayload[key] = val ? String(val).trim() : null;
      } else {
        formattedPayload[key] = val;
      }
    }
  }

  try {
    const { data } = await api.patch<ApiResponse<unknown>>(
      endpointPath,
      formattedPayload
    );

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastExamUpdateCall?: ExamNetworkLog };
      win.__lastExamUpdateCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        payload: formattedPayload,
        httpStatus: 200,
        success: true,
        message: data?.message || 'Cập nhật bài thi thành công',
        timestamp: new Date().toISOString(),
        responseData: data?.data,
      };
    }

    const existing = await getExamById(examId, classId).catch(() => null);
    const fallbackBase: ExamItem = existing || {
      id: examId,
      title: String(formattedPayload.title || ''),
      examType: String(formattedPayload.examType || 'MIDTERM'),
      durationMinutes:
        formattedPayload.durationMinutes !== undefined
          ? Number(formattedPayload.durationMinutes)
          : null,
      maxScore:
        formattedPayload.totalScore !== undefined ? Number(formattedPayload.totalScore) : null,
      totalScore:
        formattedPayload.totalScore !== undefined ? Number(formattedPayload.totalScore) : null,
      startTime: String(formattedPayload.startTime || ''),
      endTime: String(formattedPayload.endTime || ''),
      status: 'UPCOMING',
      isPublished: null,
    };
    const updatedItem: ExamItem = {
      ...fallbackBase,
      ...((data?.data as Record<string, unknown>) || {}),
      ...formattedPayload,
      id: examId,
    };

    if (classId) {
      saveCreatedExam(classId, updatedItem);
    }
    return updatedItem;
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; status?: number })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      (err as { status?: number })?.status ||
      0;
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || (err as Error)?.message || 'Lỗi khi cập nhật bài thi';

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastExamUpdateCall?: ExamNetworkLog };
      win.__lastExamUpdateCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        payload: formattedPayload,
        httpStatus,
        success: false,
        message,
        timestamp: new Date().toISOString(),
        responseData: (err as { response?: { data?: unknown } })?.response?.data,
      };
    }

    // For demo exams or demo classes, persist update locally to preserve across F5
    const isDemo =
      examId.startsWith('EXAM_') ||
      examId.startsWith('exam-') ||
      (classId && (classId === 'csdl-k22-01' || classId.startsWith('csdl-')));

    if (isDemo) {
      const existing = await getExamById(examId, classId).catch(() => null);
      const fallbackBase: ExamItem = existing || {
        id: examId,
        title: String(formattedPayload.title || ''),
        examType: String(formattedPayload.examType || 'MIDTERM'),
        durationMinutes:
          formattedPayload.durationMinutes !== undefined
            ? Number(formattedPayload.durationMinutes)
            : null,
        maxScore:
          formattedPayload.totalScore !== undefined ? Number(formattedPayload.totalScore) : null,
        totalScore:
          formattedPayload.totalScore !== undefined ? Number(formattedPayload.totalScore) : null,
        startTime: String(formattedPayload.startTime || ''),
        endTime: String(formattedPayload.endTime || ''),
        status: 'UPCOMING',
        isPublished: null,
      };
      const updatedDemo: ExamItem = {
        ...fallbackBase,
        ...formattedPayload,
        id: examId,
      };
      if (formattedPayload.totalScore !== undefined) {
        updatedDemo.maxScore = Number(formattedPayload.totalScore);
        updatedDemo.totalScore = Number(formattedPayload.totalScore);
      }
      const hydratedDemo = hydrateDemoExam(updatedDemo);
      saveCreatedExam(classId || 'csdl-k22-01', hydratedDemo);
      return hydratedDemo;
    }

    // Real API classes propagate error so form preserves inputs and shows API error
    throw err;
  }
}

/**
 * Question Storage & Service Layer (Spec 13.2 & Spec 9.2)
 */

export function getExamQuestionsStorageKey(examId: string): string {
  return `ilms_exam_questions_${examId}`;
}

export const DEFAULT_EXAM_QUESTIONS: ExamQuestionItem[] = [
  { id: '1', questionId: 'q1', content: 'Mô hình OSI tiêu chuẩn bao gồm bao nhiêu tầng?', text: 'Mô hình OSI tiêu chuẩn bao gồm bao nhiêu tầng?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'EASY', level: 'Dễ', levelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300', score: 0.50, orderIndex: 1 },
  { id: '2', questionId: 'q2', content: 'Giao thức nào sau đây hoạt động tại tầng Giao vận (Transport Layer)?', text: 'Giao thức nào sau đây hoạt động tại tầng Giao vận (Transport Layer)?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'EASY', level: 'Dễ', levelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300', score: 0.50, orderIndex: 2 },
  { id: '3', questionId: 'q3', content: 'Quá trình bắt tay 3 bước (3-way handshake) của giao thức TCP sử dụng các cờ (flags) nào theo thứ tự?', text: 'Quá trình bắt tay 3 bước (3-way handshake) của giao thức TCP sử dụng các cờ (flags) nào theo thứ tự?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300', score: 0.50, orderIndex: 3 },
  { id: '4', questionId: 'q4', content: 'Địa chỉ IP nào sau đây thuộc dải địa chỉ Private theo chuẩn RFC 1918?', text: 'Địa chỉ IP nào sau đây thuộc dải địa chỉ Private theo chuẩn RFC 1918?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300', score: 0.50, orderIndex: 4 },
  { id: '5', questionId: 'q5', content: 'Cho dải mạng 192.168.1.0/26. Số lượng địa chỉ host hợp lệ có thể gán cho các thiết bị là bao nhiêu?', text: 'Cho dải mạng 192.168.1.0/26. Số lượng địa chỉ host hợp lệ có thể gán cho các thiết bị là bao nhiêu?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'HARD', level: 'Khó', levelClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300', score: 0.50, orderIndex: 5 },
  { id: '6', questionId: 'q6', content: 'Những giao thức nào sau đây sử dụng giao thức truyền tải hướng kết nối TCP?', text: 'Những giao thức nào sau đây sử dụng giao thức truyền tải hướng kết nối TCP?', questionType: 'MULTIPLE_CHOICE', type: 'Nhiều đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300', score: 0.50, orderIndex: 6 },
  { id: '7', questionId: 'q7', content: 'Giao thức ARP (Address Resolution Protocol) dùng để phân giải từ loại địa chỉ nào sang địa chỉ nào?', text: 'Giao thức ARP (Address Resolution Protocol) dùng để phân giải từ loại địa chỉ nào sang địa chỉ nào?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'EASY', level: 'Dễ', levelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300', score: 0.50, orderIndex: 7 },
  { id: '8', questionId: 'q8', content: 'Trong kiến trúc DNS, bản ghi nào ánh xạ trực tiếp tên miền FQDN sang địa chỉ IPv4?', text: 'Trong kiến trúc DNS, bản ghi nào ánh xạ trực tiếp tên miền FQDN sang địa chỉ IPv4?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300', score: 0.50, orderIndex: 8 },
  { id: '9', questionId: 'q9', content: 'Khi phân tích gói tin trong Wireshark, trường TTL (Time to Live) trong header IPv4 có mục đích chính là gì?', text: 'Khi phân tích gói tin trong Wireshark, trường TTL (Time to Live) trong header IPv4 có mục đích chính là gì?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'HARD', level: 'Khó', levelClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300', score: 0.50, orderIndex: 9 },
  { id: '10', questionId: 'q10', content: 'Giao thức định tuyến nội miền OSPF (Open Shortest Path First) dựa trên thuật toán nào?', text: 'Giao thức định tuyến nội miền OSPF (Open Shortest Path First) dựa trên thuật toán nào?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300', score: 0.50, orderIndex: 10 },
  { id: '11', questionId: 'q11', content: 'Địa chỉ MAC có độ dài tiêu chuẩn là bao nhiêu bit?', text: 'Địa chỉ MAC có độ dài tiêu chuẩn là bao nhiêu bit?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'EASY', level: 'Dễ', levelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300', score: 0.50, orderIndex: 11 },
  { id: '12', questionId: 'q12', content: 'Sự khác biệt cốt lõi giữa HTTP/1.1 và HTTP/2 là gì?', text: 'Sự khác biệt cốt lõi giữa HTTP/1.1 và HTTP/2 là gì?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300', score: 0.50, orderIndex: 12 },
  { id: '13', questionId: 'q13', content: 'Subnet mask mặc định của lớp C viết theo định dạng CIDR là gì?', text: 'Subnet mask mặc định của lớp C viết theo định dạng CIDR là gì?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'HARD', level: 'Khó', levelClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300', score: 0.50, orderIndex: 13 },
  { id: '14', questionId: 'q14', content: 'Các kỹ thuật chống nghẽn mạng (Congestion Control) nào được tích hợp sẵn trong TCP?', text: 'Các kỹ thuật chống nghẽn mạng (Congestion Control) nào được tích hợp sẵn trong TCP?', questionType: 'MULTIPLE_CHOICE', type: 'Nhiều đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300', score: 0.50, orderIndex: 14 },
  { id: '15', questionId: 'q15', content: 'Cổng mặc định được cấp phát chuẩn cho HTTPS là bao nhiêu?', text: 'Cổng mặc định được cấp phát chuẩn cho HTTPS là bao nhiêu?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'EASY', level: 'Dễ', levelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300', score: 0.50, orderIndex: 15 },
  { id: '16', questionId: 'q16', content: 'Giao thức BGP (Border Gateway Protocol) thuộc nhóm giao thức định tuyến nào sau đây?', text: 'Giao thức BGP (Border Gateway Protocol) thuộc nhóm giao thức định tuyến nào sau đây?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300', score: 0.50, orderIndex: 16 },
  { id: '17', questionId: 'q17', content: 'Cho địa chỉ IP 172.16.10.55/28, địa chỉ Broadcast của mạng con này là gì?', text: 'Cho địa chỉ IP 172.16.10.55/28, địa chỉ Broadcast của mạng con này là gì?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'HARD', level: 'Khó', levelClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300', score: 0.50, orderIndex: 17 },
  { id: '18', questionId: 'q18', content: 'Đơn vị dữ liệu (PDU) tại tầng Liên kết dữ liệu (Data Link) được gọi là gì?', text: 'Đơn vị dữ liệu (PDU) tại tầng Liên kết dữ liệu (Data Link) được gọi là gì?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'EASY', level: 'Dễ', levelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300', score: 0.50, orderIndex: 18 },
  { id: '19', questionId: 'q19', content: 'Giao thức DHCP sử dụng cổng dịch vụ (port) nào cho Client và Server?', text: 'Giao thức DHCP sử dụng cổng dịch vụ (port) nào cho Client và Server?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300', score: 0.50, orderIndex: 19 },
  { id: '20', questionId: 'q20', content: 'Để kết nối 2 thiết bị Switch với nhau và truyền tải nhiều VLAN khác nhau, cổng kết nối phải được cấu hình ở chế độ nào?', text: 'Để kết nối 2 thiết bị Switch với nhau và truyền tải nhiều VLAN khác nhau, cổng kết nối phải được cấu hình ở chế độ nào?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'HARD', level: 'Khó', levelClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300', score: 0.50, orderIndex: 20 },
];

export const DEFAULT_BANK_QUESTIONS: BankQuestionItem[] = [
  { id: 'b1', content: 'Mô hình OSI tiêu chuẩn bao gồm bao nhiêu tầng?', text: 'Mô hình OSI tiêu chuẩn bao gồm bao nhiêu tầng?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'EASY', level: 'Dễ', levelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
  { id: 'b2', content: 'Những phát biểu nào sau đây là đúng về kỹ thuật NAT (Network Address Translation)?', text: 'Những phát biểu nào sau đây là đúng về kỹ thuật NAT (Network Address Translation)?', questionType: 'MULTIPLE_CHOICE', type: 'Nhiều đáp án', difficultyLevel: 'HARD', level: 'Khó', levelClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
  { id: 'b3', content: 'Cổng mặc định chuẩn (Default Port) của giao thức SSH là bao nhiêu?', text: 'Cổng mặc định chuẩn (Default Port) của giao thức SSH là bao nhiêu?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'MEDIUM', level: 'Trung bình', levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300' },
  { id: 'b4', content: 'Giao thức ICMP (Internet Control Message Protocol) được sử dụng cho tiện ích mạng nào?', text: 'Giao thức ICMP (Internet Control Message Protocol) được sử dụng cho tiện ích mạng nào?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'EASY', level: 'Dễ', levelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
  { id: 'b5', content: 'Đặc điểm nào sau đây phân biệt giữa cơ chế định tuyến Distance Vector và Link State?', text: 'Đặc điểm nào sau đây phân biệt giữa cơ chế định tuyến Distance Vector và Link State?', questionType: 'MULTIPLE_CHOICE', type: 'Nhiều đáp án', difficultyLevel: 'HARD', level: 'Khó', levelClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
  { id: 'b6', content: 'Giao thức nào chịu trách nhiệm tự động gán địa chỉ IP động cho các thiết bị máy khách?', text: 'Giao thức nào chịu trách nhiệm tự động gán địa chỉ IP động cho các thiết bị máy khách?', questionType: 'SINGLE_CHOICE', type: 'Trắc nghiệm 1 đáp án', difficultyLevel: 'EASY', level: 'Dễ', levelClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
];

export const DEFAULT_TCP_IP_EXAM_QUESTIONS: ExamQuestionItem[] = [
  {
    id: 'q_tcp_01',
    questionId: 'q_tcp_01',
    content: 'Cơ chế bắt tay ba bước trong TCP có mục đích gì?',
    questionContent: 'Cơ chế bắt tay ba bước trong TCP có mục đích gì?',
    text: 'Cơ chế bắt tay ba bước trong TCP có mục đích gì?',
    questionType: 'SINGLE_CHOICE',
    type: 'Trắc nghiệm 1 đáp án',
    difficultyLevel: 'MEDIUM',
    level: 'Trung bình',
    levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    score: 5.0,
    orderIndex: 1,
  },
  {
    id: 'q_tcp_02',
    questionId: 'q_tcp_02',
    content: 'TCP và UDP khác nhau thế nào về độ tin cậy khi truyền dữ liệu?',
    questionContent: 'TCP và UDP khác nhau thế nào về độ tin cậy khi truyền dữ liệu?',
    text: 'TCP và UDP khác nhau thế nào về độ tin cậy khi truyền dữ liệu?',
    questionType: 'SINGLE_CHOICE',
    type: 'Trắc nghiệm 1 đáp án',
    difficultyLevel: 'MEDIUM',
    level: 'Trung bình',
    levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    score: 5.0,
    orderIndex: 2,
  },
];

export const DEFAULT_OSI_EXAM_QUESTIONS: ExamQuestionItem[] = [
  {
    id: 'q_osi_01',
    questionId: 'q_osi_01',
    content: 'Tầng Mạng trong mô hình OSI có nhiệm vụ gì?',
    questionContent: 'Tầng Mạng trong mô hình OSI có nhiệm vụ gì?',
    text: 'Tầng Mạng trong mô hình OSI có nhiệm vụ gì?',
    questionType: 'SINGLE_CHOICE',
    type: 'Trắc nghiệm 1 đáp án',
    difficultyLevel: 'MEDIUM',
    level: 'Trung bình',
    levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    score: 5.0,
    orderIndex: 1,
  },
  {
    id: 'q_osi_02',
    questionId: 'q_osi_02',
    content: 'Tầng Vận chuyển khác tầng Liên kết dữ liệu ở điểm nào?',
    questionContent: 'Tầng Vận chuyển khác tầng Liên kết dữ liệu ở điểm nào?',
    text: 'Tầng Vận chuyển khác tầng Liên kết dữ liệu ở điểm nào?',
    questionType: 'SINGLE_CHOICE',
    type: 'Trắc nghiệm 1 đáp án',
    difficultyLevel: 'MEDIUM',
    level: 'Trung bình',
    levelClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    score: 5.0,
    orderIndex: 2,
  },
];

export function getStoredExamQuestions(examId: string): ExamQuestionItem[] {
  if (typeof window === 'undefined') {
    if (examId === 'EXAM_001') return [...DEFAULT_EXAM_QUESTIONS];
    if (examId === 'EXAM_002') return [...DEFAULT_TCP_IP_EXAM_QUESTIONS];
    if (examId === 'EXAM_003') return [...DEFAULT_OSI_EXAM_QUESTIONS];
    return [];
  }
  try {
    const raw = localStorage.getItem(getExamQuestionsStorageKey(examId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  if (examId === 'EXAM_001') {
    return [...DEFAULT_EXAM_QUESTIONS];
  }
  if (examId === 'EXAM_002') {
    return [...DEFAULT_TCP_IP_EXAM_QUESTIONS];
  }
  if (examId === 'EXAM_003') {
    return [...DEFAULT_OSI_EXAM_QUESTIONS];
  }
  return [];
}

export function saveStoredExamQuestions(examId: string, questions: ExamQuestionItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getExamQuestionsStorageKey(examId), JSON.stringify(questions));
  } catch {
    // fallback
  }
}

/**
 * Fetch exam questions:
 * Endpoint: GET /api/v1/exams/{examId}/questions
 * - Real UUID exam: strictly calls backend API, parses response (empty array [] is valid),
 *   never reads/writes localStorage, and propagates HTTP/network errors (including 403).
 * - Explicit demo exam (non-UUID such as exam-demo-*, EXAM_001..003): reads local demo storage directly.
 */
export async function replaceExamQuestions(examId: string, questions: { questionId: string; score: number }[]): Promise<void> {
  const { data } = await api.put<ApiResponse<unknown>>(`/exams/${encodeURIComponent(examId)}/questions`, questions);
  if (!Array.isArray(data.data) || data.data.length !== questions.length) throw new Error('Exam questions were not saved');
}

export async function getExamQuestions(examId: string): Promise<ExamQuestionItem[]> {
  if (!isExamUuid(examId)) {
    const stored = getStoredExamQuestions(examId);
    return [...stored].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  const endpointPath = `/exams/${examId}/questions`;
  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}`;

  try {
    const { data } = await api.get<ApiResponse<unknown>>(endpointPath);
    const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    const parsedList = rawList
      .map((item, idx) => {
        const res = examQuestionItemSchema.safeParse(item);
        if (res.success) return res.data;
        const record = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
        return {
          id: String(record.id || idx + 1),
          questionId: String(record.questionId || record.id || idx + 1),
          content: String(record.content || record.questionContent || record.text || ''),
          questionContent: String(record.questionContent || record.content || record.text || ''),
          text: String(record.text || record.content || record.questionContent || ''),
          questionType: String(record.questionType || 'SINGLE_CHOICE'),
          type: String(record.type || 'Trắc nghiệm 1 đáp án'),
          difficultyLevel: String(record.difficultyLevel || 'EASY'),
          level: String(record.level || 'Dễ'),
          score: Number(record.score ?? 0),
          orderIndex: Number(record.orderIndex ?? idx + 1),
        };
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastExamQuestionsCall?: ExamNetworkLog };
      win.__lastExamQuestionsCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        httpStatus: 200,
        success: true,
        totalElements: parsedList.length,
        timestamp: new Date().toISOString(),
      };
    }

    return parsedList;
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; status?: number })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      (err as { status?: number })?.status ||
      0;

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastExamQuestionsCall?: ExamNetworkLog };
      win.__lastExamQuestionsCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        httpStatus,
        success: false,
        message:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message,
        timestamp: new Date().toISOString(),
      };
    }

    throw err;
  }
}

/**
 * Add a question to an exam:
 * Endpoint: POST /api/v1/exams/{examId}/questions
 * - Real UUID exam: strictly calls backend API and propagates errors (never fakes success via localStorage).
 * - Demo exam (non-UUID): persists to local demo storage and syncs questionCount.
 */
export async function addExamQuestion(
  examId: string,
  input: AddExamQuestionInput
): Promise<ExamQuestionItem> {
  if (!isExamUuid(examId)) {
    const currentList = getStoredExamQuestions(examId);
    if (
      currentList.some(
        (q) => q.questionId === input.questionId || q.id === input.questionId
      )
    ) {
      throw new Error('Câu hỏi này đã có trong bài thi.');
    }

    const bankItem = DEFAULT_BANK_QUESTIONS.find((b) => b.id === input.questionId);
    const newIndex = input.orderIndex || currentList.length + 1;

    const newItem: ExamQuestionItem = {
      id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      questionId: input.questionId,
      content: bankItem?.content || bankItem?.text || 'Câu hỏi bổ sung',
      text: bankItem?.text || bankItem?.content || 'Câu hỏi bổ sung',
      questionType: bankItem?.questionType || 'SINGLE_CHOICE',
      type: bankItem?.type || 'Trắc nghiệm 1 đáp án',
      difficultyLevel: bankItem?.difficultyLevel || 'EASY',
      level: bankItem?.level || 'Dễ',
      levelClass: bankItem?.levelClass || 'bg-emerald-100 text-emerald-800',
      score: Number(input.score),
      orderIndex: newIndex,
    };

    const nextList = [...currentList, newItem].map((q, idx) => ({
      ...q,
      orderIndex: idx + 1,
    }));
    saveStoredExamQuestions(examId, nextList);
    syncDemoExamQuestionCount(examId, nextList.length);
    return nextList[nextList.length - 1];
  }

  const endpointPath = `/exams/${examId}/questions`;
  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}`;

  const payload: Record<string, unknown> = {
    questionId: input.questionId,
    score: Number(input.score),
  };
  if (input.orderIndex !== undefined && input.orderIndex !== null) {
    payload.orderIndex = input.orderIndex;
  }

  try {
    const { data } = await api.post<ApiResponse<unknown>>(endpointPath, payload);
    const parsed = examQuestionItemSchema.parse(data?.data);
    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastAddQuestionCall?: ExamNetworkLog };
      win.__lastAddQuestionCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        payload,
        httpStatus: 201,
        success: true,
        timestamp: new Date().toISOString(),
      };
    }
    return parsed;
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; status?: number })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      0;

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastAddQuestionCall?: ExamNetworkLog };
      win.__lastAddQuestionCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        payload,
        httpStatus,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }

    throw err;
  }
}

/**
 * Update a question in an exam (score or orderIndex):
 * Endpoint: PATCH /api/v1/exams/{examId}/questions/{id}
 */
export async function updateExamQuestion(
  examId: string,
  questionRelationId: string,
  input: UpdateExamQuestionInput
): Promise<ExamQuestionItem> {
  if (!isExamUuid(examId)) {
    const currentList = [...getStoredExamQuestions(examId)];
    const targetIdx = currentList.findIndex(
      (q) => q.id === questionRelationId || q.questionId === questionRelationId
    );
    if (targetIdx === -1) {
      throw new Error('Không tìm thấy câu hỏi cần cập nhật trong bài thi.');
    }

    const updatedItem = { ...currentList[targetIdx] };
    if (input.score !== undefined) {
      updatedItem.score = Number(input.score);
    }
    currentList[targetIdx] = updatedItem;

    let finalIdx = targetIdx;
    if (input.orderIndex !== undefined) {
      const newOrder = Number(input.orderIndex);
      const destinationIdx = Math.max(0, Math.min(newOrder - 1, currentList.length - 1));
      if (destinationIdx !== targetIdx) {
        const [moved] = currentList.splice(targetIdx, 1);
        currentList.splice(destinationIdx, 0, moved);
        finalIdx = destinationIdx;
      }
    }

    const reindexed = currentList.map((q, idx) => ({
      ...q,
      orderIndex: idx + 1,
    }));
    saveStoredExamQuestions(examId, reindexed);
    return reindexed[finalIdx];
  }

  const endpointPath = `/exams/${examId}/questions/${questionRelationId}`;
  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}`;

  const payload: Record<string, unknown> = {};
  if (input.score !== undefined) payload.score = Number(input.score);
  if (input.orderIndex !== undefined) payload.orderIndex = Number(input.orderIndex);

  try {
    const { data } = await api.patch<ApiResponse<unknown>>(endpointPath, payload);
    return examQuestionItemSchema.parse(data?.data);
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; status?: number })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      0;

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastUpdateQuestionCall?: ExamNetworkLog };
      win.__lastUpdateQuestionCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        payload,
        httpStatus,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }

    throw err;
  }
}

/**
 * Remove a question from an exam:
 * Endpoint: DELETE /api/v1/exams/{examId}/questions/{id}
 */
export async function deleteExamQuestion(
  examId: string,
  questionRelationId: string
): Promise<void> {
  if (!isExamUuid(examId)) {
    const nextList = getStoredExamQuestions(examId)
      .filter((q) => q.id !== questionRelationId && q.questionId !== questionRelationId)
      .map((q, idx) => ({
        ...q,
        orderIndex: idx + 1,
      }));
    saveStoredExamQuestions(examId, nextList);
    syncDemoExamQuestionCount(examId, nextList.length);
    return;
  }

  const endpointPath = `/exams/${examId}/questions/${questionRelationId}`;
  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}`;

  try {
    await api.delete(endpointPath);
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; status?: number })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      0;

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastDeleteQuestionCall?: ExamNetworkLog };
      win.__lastDeleteQuestionCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        httpStatus,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }

    throw err;
  }
}

/**
 * Publish exam:
 * Endpoint: PATCH /api/v1/exams/{id}/publish (empty body, returns ExamDetail)
 * - Real UUID exam: strictly calls backend API, parses with Zod, propagates 400/403/409/500/network errors without local fallback.
 * - Demo exam: updates local demo storage when offline/401.
 */
export async function publishExam(
  examId: string,
  classId?: string
): Promise<ExamItem> {
  const endpointPath = `/exams/${examId}/publish`;
  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}`;
  const isUuid = isExamUuid(examId);

  try {
    const { data } = await api.patch<ApiResponse<unknown>>(endpointPath);
    if (!data || data.data === undefined || data.data === null) {
      if (isUuid) {
        const schemaErr = new Error('Publish response payload is missing data') as Error & {
          code?: string;
        };
        schemaErr.code = 'SCHEMA_ERROR';
        throw schemaErr;
      }
    } else {
      const parsed = examItemSchema.parse(data.data);
      if (typeof window !== 'undefined') {
        const win = window as unknown as { __lastPublishCall?: ExamNetworkLog };
        win.__lastPublishCall = {
          url: endpointPath,
          fullUrl: fullRequestUrl,
          httpStatus: 200,
          success: true,
          message: data?.message,
          responseData: data.data,
          timestamp: new Date().toISOString(),
        };
      }
      if (!isUuid && classId) {
        saveCreatedExam(classId, parsed);
      }
      return parsed;
    }
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      0;
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (err as Error)?.message ||
      'Không thể công bố bài thi';

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastPublishCall?: ExamNetworkLog };
      win.__lastPublishCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        httpStatus,
        success: false,
        message,
        responseData: (err as { response?: { data?: unknown } })?.response?.data,
        timestamp: new Date().toISOString(),
      };
    }

    if (isUuid) {
      throw err;
    }

    // Demo-only fallback (non-UUID exams such as EXAM_001)
    const exam = await getExamById(examId, classId).catch(() => null);
    if (exam) {
      const updatedExam: ExamItem = {
        ...exam,
        isPublished: true,
      };
      saveCreatedExam(classId || 'csdl-k22-01', updatedExam);
      return updatedExam;
    }
    throw err;
  }

  const exam = await getExamById(examId, classId);
  const updatedExam: ExamItem = { ...exam, isPublished: true };
  if (!isUuid) {
    saveCreatedExam(classId || 'csdl-k22-01', updatedExam);
  }
  return updatedExam;
}

/**
 * Unpublish exam:
 * Endpoint: PATCH /api/v1/exams/{id}/unpublish (empty body, returns ExamDetail)
 * - Real UUID exam: strictly calls backend API, parses with Zod, propagates 400/403/409/500/network errors without local fallback.
 * - Demo exam: updates local demo storage when offline/401.
 */
export async function unpublishExam(
  examId: string,
  classId?: string
): Promise<ExamItem> {
  const endpointPath = `/exams/${examId}/unpublish`;
  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}`;
  const isUuid = isExamUuid(examId);

  try {
    const { data } = await api.patch<ApiResponse<unknown>>(endpointPath);
    if (!data || data.data === undefined || data.data === null) {
      if (isUuid) {
        const schemaErr = new Error('Unpublish response payload is missing data') as Error & {
          code?: string;
        };
        schemaErr.code = 'SCHEMA_ERROR';
        throw schemaErr;
      }
    } else {
      const parsed = examItemSchema.parse(data.data);
      if (typeof window !== 'undefined') {
        const win = window as unknown as { __lastUnpublishCall?: ExamNetworkLog };
        win.__lastUnpublishCall = {
          url: endpointPath,
          fullUrl: fullRequestUrl,
          httpStatus: 200,
          success: true,
          message: data?.message,
          responseData: data.data,
          timestamp: new Date().toISOString(),
        };
      }
      if (!isUuid && classId) {
        saveCreatedExam(classId, parsed);
      }
      return parsed;
    }
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      0;
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (err as Error)?.message ||
      'Không thể thu hồi công bố bài thi';

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastUnpublishCall?: ExamNetworkLog };
      win.__lastUnpublishCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        httpStatus,
        success: false,
        message,
        responseData: (err as { response?: { data?: unknown } })?.response?.data,
        timestamp: new Date().toISOString(),
      };
    }

    if (isUuid) {
      throw err;
    }

    // Demo-only fallback (non-UUID exams such as EXAM_001)
    const exam = await getExamById(examId, classId).catch(() => null);
    if (exam) {
      const updatedExam: ExamItem = {
        ...exam,
        isPublished: false,
      };
      saveCreatedExam(classId || 'csdl-k22-01', updatedExam);
      return updatedExam;
    }
    throw err;
  }

  const exam = await getExamById(examId, classId);
  const updatedExam: ExamItem = { ...exam, isPublished: false };
  if (!isUuid) {
    saveCreatedExam(classId || 'csdl-k22-01', updatedExam);
  }
  return updatedExam;
}

/**
 * Delete an exam:
 * Endpoint: DELETE /api/v1/exams/{id} (204 No Content, empty body)
 * - Real UUID exam: strictly propagates 403/409/500/network errors and NEVER deletes locally on failure.
 * - Demo exam: removes from local demo storage when offline/401.
 */
export async function deleteExam(
  examId: string,
  classId?: string
): Promise<void> {
  const endpointPath = `/exams/${examId}`;
  const fullRequestUrl = `https://api.ilms.page/api/v1${endpointPath}`;
  const isUuid = isExamUuid(examId);

  try {
    const response = await api.delete(endpointPath);
    const httpStatus = response?.status || 204;

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastDeleteExamCall?: ExamNetworkLog };
      win.__lastDeleteExamCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        httpStatus,
        success: true,
        timestamp: new Date().toISOString(),
      };
    }

    if (!isUuid || (classId && isDemoExamClass(classId))) {
      markDemoExamDeleted(examId);
    }
  } catch (err: unknown) {
    const httpStatus =
      (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status ||
      0;
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (err as Error)?.message ||
      'Không thể xóa bài thi';

    if (typeof window !== 'undefined') {
      const win = window as unknown as { __lastDeleteExamCall?: ExamNetworkLog };
      win.__lastDeleteExamCall = {
        url: endpointPath,
        fullUrl: fullRequestUrl,
        httpStatus,
        success: false,
        message,
        responseData: (err as { response?: { data?: unknown } })?.response?.data,
        timestamp: new Date().toISOString(),
      };
    }

    if (isUuid) {
      throw err;
    }

    // Demo-only fallback (non-UUID exams such as EXAM_001)
    markDemoExamDeleted(examId);
  }
}

/**
 * Get question bank questions:
 * Endpoint: GET /api/v1/questions?page=1&size=20&search=...
 */
export async function getBankQuestions(params: {
  courseId?: string;
  search?: string;
  page?: number;
  size?: number;
} = {}): Promise<{ items: BankQuestionItem[]; totalElements: number; totalPages: number }> {
  const page = params.page ?? 1; // page starts at 1 per spec 9.2
  const size = params.size ?? 20;

  const queryParams: Record<string, unknown> = { page, size };
  if (params.search?.trim()) queryParams.search = params.search.trim();
  if (params.courseId) queryParams.courseId = params.courseId;

  const endpointPath = `/questions`;
  try {
    const { data } = await api.get<ApiResponse<unknown>>(endpointPath, {
      params: queryParams,
    });
    const items = Array.isArray(data?.data) ? data.data : [];
    if (items.length > 0) {
      const parsed = items.map((item) => {
        const res = bankQuestionItemSchema.safeParse(item);
        if (res.success) return res.data;
        return item as BankQuestionItem;
      });
      return {
        items: parsed,
        totalElements: parsed.length,
        totalPages: Math.max(1, Math.ceil(parsed.length / size)),
      };
    }
  } catch {
    // Fallback to default bank
  }

  let items = [...DEFAULT_BANK_QUESTIONS];
  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.content.toLowerCase().includes(q) ||
        (item.text && item.text.toLowerCase().includes(q))
    );
  }

  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const startIndex = (page - 1) * size;
  const pagedItems = items.slice(startIndex, startIndex + size);

  return {
    items: pagedItems,
    totalElements,
    totalPages,
  };
}

