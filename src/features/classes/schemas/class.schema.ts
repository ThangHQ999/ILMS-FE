import { z } from 'zod';

export const classStatusSchema = z
  .union([z.enum(['ACTIVE', 'ARCHIVED', 'DRAFT']), z.string()])
  .nullable()
  .optional()
  .transform((val) => {
    if (!val) return 'ACTIVE' as const;
    const upper = String(val).toUpperCase();
    if (upper === 'ARCHIVED') return 'ARCHIVED' as const;
    if (upper === 'DRAFT') return 'DRAFT' as const;
    return 'ACTIVE' as const;
  });
export type ClassStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT';

export const teachingRoleSchema = z
  .union([z.enum(['OWNER', 'PRIMARY_INSTRUCTOR', 'TEACHER', 'TA', 'STUDENT']), z.string()])
  .nullable()
  .optional()
  .transform((val) => {
    if (!val) return 'STUDENT' as const;
    const upper = String(val).toUpperCase();
    if (upper === 'OWNER') return 'OWNER' as const;
    if (upper === 'PRIMARY_INSTRUCTOR') return 'PRIMARY_INSTRUCTOR' as const;
    if (upper === 'TEACHER') return 'TEACHER' as const;
    if (upper === 'TA') return 'TA' as const;
    if (upper === 'STUDENT') return 'STUDENT' as const;
    return 'STUDENT' as const;
  });
export type TeachingRole = 'OWNER' | 'PRIMARY_INSTRUCTOR' | 'TEACHER' | 'TA' | 'STUDENT';

export const scheduleInfoSchema = z.object({
  room: z.string().nullable().optional().default('Chưa xếp phòng'),
  dayOfWeek: z.string().nullable().optional().default('Chưa xếp lịch'),
  timeSlot: z.string().nullable().optional().default('Linh hoạt'),
});
export type ScheduleInfo = z.infer<typeof scheduleInfoSchema>;

export const classInstructorSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().default('Giảng viên'),
  email: z.string().optional(),
  avatar: z.string().optional(),
  avatarUrl: z.string().optional(),
});
export type ClassInstructor = z.infer<typeof classInstructorSchema>;

export const classStatsSchema = z.object({
  pendingRequestsCount: z.coerce.number().optional().default(0),
  ungradedAssignmentsCount: z.coerce.number().optional().default(0),
  attendanceRate: z.coerce.number().optional().default(100),
});
export type ClassStats = z.infer<typeof classStatsSchema>;

export const classItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    name: z.string().nullish().transform((v) => v ?? ''),
    title: z.string().nullish().transform((v) => v ?? ''),
    className: z.string().optional(),
    description: z.string().nullish().transform((v) => v ?? ''),
    academicYear: z.string().nullish().transform((v) => (v && v.trim() ? v : '2026-2027')),
    semester: z.string().nullish().transform((v) => (v && v.trim() ? v : 'Học kỳ 1 (2026-2027)')),
    major: z.string().nullish().transform((v) => (v && v.trim() ? v : 'Khoa học Máy tính')),
    maxStudents: z.coerce.number().nullish().transform((v) => (typeof v === 'number' && v > 0 ? v : 60)),
    maxCapacity: z.coerce.number().optional(),
    enrolledCount: z.coerce.number().nullish().transform((v) => v ?? 0),
    studentsCount: z.coerce.number().optional(),
    totalStudents: z.coerce.number().optional(),
    numberOfStudents: z.coerce.number().optional(),
    enrollmentKey: z.string().nullish().transform((v) => v ?? ''),
    classCode: z.string().optional(),
    code: z.string().optional(),
    thumbnailUrl: z.string().nullish().transform((v) => (v && v.trim() ? v : undefined)).optional(),
    backgroundUrl: z.string().nullish().transform((v) => (v && v.trim() ? v : undefined)).optional(),
    visibility: z.enum(['PUBLIC', 'PRIVATE']).nullish().transform((v) => v ?? undefined).optional(),
    requireApproval: z.boolean().nullish().transform((v) => v ?? undefined).optional(),
    startAt: z.string().nullish().transform((v) => (v && v.trim() ? v : undefined)).optional(),
    endAt: z.string().nullish().transform((v) => (v && v.trim() ? v : undefined)).optional(),
    isCodeClosed: z.boolean().nullish().transform((v) => v ?? false),
    isCodeActive: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    status: classStatusSchema,
    teachingRole: teachingRoleSchema,
    memberStatus: z.string().nullish().optional(),
    membershipStatus: z.string().nullish().optional(),
    myStatus: z.string().nullish().optional(),
    enrollmentStatus: z.string().nullish().optional(),
    instructor: z
      .any()
      .nullish()
      .transform((val): ClassInstructor | undefined => {
        if (!val) return { fullName: 'Giảng viên' };
        if (typeof val === 'string') return { fullName: val };
        const obj = val as Record<string, unknown>;
        const avatarStr = obj.avatar ? String(obj.avatar) : obj.avatarUrl ? String(obj.avatarUrl) : undefined;
        return {
          id: obj.id ? String(obj.id) : undefined,
          fullName: String(obj.fullName || obj.name || 'Giảng viên'),
          email: obj.email ? String(obj.email) : undefined,
          avatar: avatarStr,
          avatarUrl: avatarStr,
        };
      })
      .optional(),
    ownerId: z
      .union([z.string(), z.number()])
      .nullish()
      .transform((v) => (v !== null && v !== undefined ? String(v) : undefined))
      .optional(),
    schedule: scheduleInfoSchema.optional(),
    stats: classStatsSchema.optional(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish(),
    deletedAt: z.string().nullish(),
  })
  .transform((item) => {
    const finalCode = item.classCode || item.code || item.enrollmentKey || '';
    const finalName = item.name || item.className || item.title || '';
    const finalTitle = item.title || item.className || item.name || finalName;
    const rawMemberStatus =
      item.memberStatus ?? item.membershipStatus ?? item.myStatus ?? item.enrollmentStatus;
    const normalizedMemberStatus = rawMemberStatus
      ? String(rawMemberStatus).toUpperCase().trim()
      : undefined;
    return {
      ...item,
      ...(normalizedMemberStatus ? { memberStatus: normalizedMemberStatus } : {}),
      name: finalName,
      title: finalTitle,
      maxStudents: item.maxCapacity ?? item.maxStudents,
      enrolledCount: item.enrolledCount ?? item.studentsCount ?? item.totalStudents ?? item.numberOfStudents ?? 0,
      enrollmentKey: finalCode || item.enrollmentKey,
    };
  });
export type ClassItem = z.infer<typeof classItemSchema>;

export const classListEnvelopeSchema = z.any().transform((raw) => {
  if (!raw) {
    return {
      items: [] as ClassItem[],
      pageNumber: 0,
      pageSize: 12,
      totalElements: 0,
      totalPages: 1,
      last: true,
    };
  }

  // If raw is an array: [...]
  if (Array.isArray(raw)) {
    const items: ClassItem[] = raw.map((item) => classItemSchema.parse(item));
    return {
      items,
      pageNumber: 0,
      pageSize: items.length || 12,
      totalElements: items.length,
      totalPages: 1,
      last: true,
    };
  }

  // If Spring Boot Page (raw.content) or envelope (raw.items)
  const rawObj = raw as Record<string, unknown>;
  const rawList = Array.isArray(rawObj.content)
    ? rawObj.content
    : Array.isArray(rawObj.items)
    ? rawObj.items
    : [];

  const items: ClassItem[] = rawList.map((item: unknown) => classItemSchema.parse(item));
  const pageNumber = Number(rawObj.number ?? rawObj.pageNumber ?? rawObj.page ?? 0);
  const pageSize = Number(rawObj.size ?? rawObj.pageSize ?? 12);
  const totalElements = Number(rawObj.totalElements ?? items.length);
  const totalPages = Number(rawObj.totalPages ?? Math.max(1, Math.ceil(totalElements / (pageSize || 12))));
  const last = Boolean(rawObj.last ?? (pageNumber >= totalPages - 1));

  return {
    items,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    last,
  };
});
export type ClassListResponse = z.infer<typeof classListEnvelopeSchema>;

export const createClassRequestSchema = z.object({
  name: z.string().min(2, 'classes.validation.nameMin').max(50),
  title: z.string().min(2, 'classes.validation.titleMin').max(150),
  description: z.string().max(500).optional().default(''),
  academicYear: z.string().min(4, 'classes.validation.academicYearRequired').default('2026-2027'),
  major: z.string().min(2, 'classes.validation.majorRequired').default('Khoa học Máy tính'),
  maxStudents: z.coerce.number().min(1).max(500).optional().default(60),
  maxCapacity: z.coerce.number().min(1).max(500).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  requireApproval: z.boolean().default(true),
  isCodeActive: z.boolean().default(true),
  thumbnailUrl: z.string().optional(),
  backgroundUrl: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  enrollmentKey: z.string().max(30).optional().default(''),
});
export type CreateClassRequest = z.input<typeof createClassRequestSchema>;

export const updateClassRequestSchema = createClassRequestSchema.partial().extend({
  id: z.string(),
});
export type UpdateClassRequest = z.infer<typeof updateClassRequestSchema>;

export const classFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'ALL']).default('ACTIVE'),
  major: z.string().optional(),
  role: z.union([z.enum(['ALL', 'TEACHER', 'STUDENT', 'PRIMARY_INSTRUCTOR', 'TA']), z.string()]).default('ALL'),
  sort: z.enum(['updated_desc', 'name_asc', 'students_desc']).default('updated_desc'),
  page: z.number().default(0),
  size: z.number().default(12),
});
export type ClassFilters = z.infer<typeof classFiltersSchema>;

export const classKpiSummarySchema = z.any().transform((raw) => {
  if (!raw || typeof raw !== 'object') {
    return {
      activeClassesCount: 0,
      totalStudentsCount: 0,
      pendingRequestsCount: 0,
      ungradedAssignmentsCount: 0,
    };
  }
  const obj = raw as Record<string, unknown>;
  return {
    activeClassesCount: Number(obj.activeClassesCount ?? obj.activeClasses ?? 0),
    totalStudentsCount: Number(obj.totalStudentsCount ?? obj.totalStudents ?? obj.studentsCount ?? 0),
    pendingRequestsCount: Number(obj.pendingRequestsCount ?? obj.pendingRequests ?? 0),
    ungradedAssignmentsCount: Number(obj.ungradedAssignmentsCount ?? obj.ungradedAssignments ?? 0),
  };
});
export type ClassKpiSummary = z.infer<typeof classKpiSummarySchema>;
