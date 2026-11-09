import { z } from 'zod';

export const classStatusSchema = z.enum(['ACTIVE', 'ARCHIVED', 'DRAFT']).default('ACTIVE');
export type ClassStatus = z.infer<typeof classStatusSchema>;

export const teachingRoleSchema = z
  .enum(['PRIMARY_INSTRUCTOR', 'TA', 'STUDENT'])
  .default('PRIMARY_INSTRUCTOR');
export type TeachingRole = z.infer<typeof teachingRoleSchema>;

export const scheduleInfoSchema = z.object({
  room: z.string().optional().default('Chưa xếp phòng'),
  dayOfWeek: z.string().optional().default('Chưa xếp lịch'),
  timeSlot: z.string().optional().default('Linh hoạt'),
});
export type ScheduleInfo = z.infer<typeof scheduleInfoSchema>;

export const classInstructorSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().default('TS. Lê Hoàng Nam'),
  email: z.string().optional(),
  avatar: z.string().nullable().optional(),
});
export type ClassInstructor = z.infer<typeof classInstructorSchema>;

export const classStatsSchema = z.object({
  pendingRequestsCount: z.number().default(0),
  ungradedAssignmentsCount: z.number().default(0),
  attendanceRate: z.number().default(100),
});
export type ClassStats = z.infer<typeof classStatsSchema>;

export const classItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string().nullable().optional().default(''),
  academicYear: z.string().default('2026-2027'),
  semester: z.string().optional().default('Học kỳ 1 (2026-2027)'),
  major: z.string().default('Khoa học Máy tính'),
  maxStudents: z.number().default(60),
  enrolledCount: z.number().default(0),
  enrollmentKey: z.string().nullable().optional().default(''),
  isCodeClosed: z.boolean().default(false),
  status: classStatusSchema,
  teachingRole: teachingRoleSchema,
  instructor: classInstructorSchema.optional(),
  schedule: scheduleInfoSchema.optional(),
  stats: classStatsSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
});
export type ClassItem = z.infer<typeof classItemSchema>;

export const classListEnvelopeSchema = z.union([
  z.object({
    items: z.array(classItemSchema),
    pageNumber: z.number().default(0),
    pageSize: z.number().default(10),
    totalElements: z.number().default(0),
    totalPages: z.number().default(1),
    last: z.boolean().default(true),
  }),
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
  role: z.enum(['ALL', 'PRIMARY_INSTRUCTOR', 'TA']).default('ALL'),
  sort: z.enum(['updated_desc', 'name_asc', 'students_desc']).default('updated_desc'),
  page: z.number().default(0),
  size: z.number().default(12),
});
export type ClassFilters = z.infer<typeof classFiltersSchema>;

