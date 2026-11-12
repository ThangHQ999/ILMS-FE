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
  .union([z.enum(['PRIMARY_INSTRUCTOR', 'TA', 'STUDENT']), z.string()])
  .nullable()
  .optional()
  .transform((val) => {
    if (!val) return 'PRIMARY_INSTRUCTOR' as const;
    const upper = String(val).toUpperCase();
    if (upper === 'TA') return 'TA' as const;
    if (upper === 'STUDENT') return 'STUDENT' as const;
    return 'PRIMARY_INSTRUCTOR' as const;
  });
export type TeachingRole = 'PRIMARY_INSTRUCTOR' | 'TA' | 'STUDENT';

export const scheduleInfoSchema = z.object({
  room: z.string().nullable().optional().default('Chưa xếp phòng'),
  dayOfWeek: z.string().nullable().optional().default('Chưa xếp lịch'),
  timeSlot: z.string().nullable().optional().default('Linh hoạt'),
});
export type ScheduleInfo = z.infer<typeof scheduleInfoSchema>;

export const classInstructorSchema = z.object({
  id: z.string().nullable().optional(),
  fullName: z.string().nullable().optional().default('TS. Lê Hoàng Nam'),
  email: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
});
export type ClassInstructor = z.infer<typeof classInstructorSchema>;

export const classStatsSchema = z.object({
  pendingRequestsCount: z.coerce.number().nullable().optional().default(0),
  ungradedAssignmentsCount: z.coerce.number().nullable().optional().default(0),
  attendanceRate: z.coerce.number().nullable().optional().default(100),
});
export type ClassStats = z.infer<typeof classStatsSchema>;

export const classItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  name: z.string().nullish().transform((v) => v ?? ''),
  title: z.string().nullish().transform((v) => v ?? ''),
  description: z.string().nullish().transform((v) => v ?? ''),
  academicYear: z.string().nullish().transform((v) => (v && v.trim() ? v : '2026-2027')),
  semester: z.string().nullish().transform((v) => (v && v.trim() ? v : 'Học kỳ 1 (2026-2027)')),
  major: z.string().nullish().transform((v) => (v && v.trim() ? v : 'Khoa học Máy tính')),
  maxStudents: z.coerce.number().nullish().transform((v) => (typeof v === 'number' && v > 0 ? v : 60)),
  enrolledCount: z.coerce.number().nullish().transform((v) => v ?? 0),
  enrollmentKey: z.string().nullish().transform((v) => v ?? ''),
  isCodeClosed: z.boolean().nullish().transform((v) => v ?? false),
  status: classStatusSchema,
  teachingRole: teachingRoleSchema,
  instructor: classInstructorSchema.nullish(),
  ownerId: z.string().nullable().optional(),
  schedule: scheduleInfoSchema.nullish(),
  stats: classStatsSchema.nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  deletedAt: z.string().nullish(),
});
export type ClassItem = z.infer<typeof classItemSchema>;

export const classListEnvelopeSchema = z.union([
  // Spring Boot Page response or custom wrapper with `content`
  z
    .object({
      content: z.array(classItemSchema),
      pageNumber: z.coerce.number().optional().default(0),
      pageSize: z.coerce.number().optional().default(10),
      totalElements: z.coerce.number().optional().default(0),
      totalPages: z.coerce.number().optional().default(1),
      last: z.boolean().optional().default(true),
    })
    .transform((val) => ({
      items: val.content,
      pageNumber: val.pageNumber,
      pageSize: val.pageSize,
      totalElements: val.totalElements,
      totalPages: val.totalPages,
      last: val.last,
    })),
  // Wrapper with `items`
  z.object({
    items: z.array(classItemSchema),
    pageNumber: z.coerce.number().optional().default(0),
    pageSize: z.coerce.number().optional().default(10),
    totalElements: z.coerce.number().optional().default(0),
    totalPages: z.coerce.number().optional().default(1),
    last: z.boolean().optional().default(true),
  }),
  // Raw array
  z.array(classItemSchema).transform((items) => ({
    items,
    pageNumber: 0,
    pageSize: items.length || 10,
    totalElements: items.length,
    totalPages: 1,
    last: true,
  })),
]);
export type ClassListResponse = z.infer<typeof classListEnvelopeSchema>;

export const createClassRequestSchema = z.object({
  name: z.string().min(2, 'classes.validation.nameMin').max(50),
  title: z.string().min(2, 'classes.validation.titleMin').max(150),
  description: z.string().max(500).optional().default(''),
  academicYear: z.string().min(4, 'classes.validation.academicYearRequired').default('2026-2027'),
  major: z.string().min(2, 'classes.validation.majorRequired').default('Khoa học Máy tính'),
  maxStudents: z.coerce.number().min(1).max(500).default(60),
  enrollmentKey: z.string().max(30).optional().default(''),
});
export type CreateClassRequest = z.infer<typeof createClassRequestSchema>;

export const updateClassRequestSchema = createClassRequestSchema.partial().extend({
  id: z.string(),
});
export type UpdateClassRequest = z.infer<typeof updateClassRequestSchema>;

export const classFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'ALL']).default('ACTIVE'),
  major: z.string().optional(),
  role: z.enum(['ALL', 'PRIMARY_INSTRUCTOR', 'TA', 'STUDENT']).default('ALL'),
  sort: z.enum(['updated_desc', 'name_asc', 'students_desc']).default('updated_desc'),
  page: z.number().default(0),
  size: z.number().default(12),
});
export type ClassFilters = z.infer<typeof classFiltersSchema>;

