import { z } from 'zod';

/**
 * Zod Schema for Student Grade Report (GET /api/v1/classes/{classId}/grade-reports/me)
 * docs/api-spec.md section 12
 */
export const studentGradeReportSchema = z.object({
  id: z.string().optional(),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  studentName: z.string().optional().default(''),
  studentUUID: z.string().optional(),
  attendanceScore: z.number().nullable().optional(),
  midtermScore: z.number().nullable().optional(),
  finalScore: z.number().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export type StudentGradeReport = z.infer<typeof studentGradeReportSchema>;

/**
 * Single Grade Report Item for Class Grade Reports Table (Teacher View)
 */
export const gradeReportItemSchema = z.object({
  id: z.string().optional(),
  classId: z.string().optional(),
  studentId: z.string(),
  studentName: z.string().optional().default('Học viên'),
  studentUUID: z.string().optional(),
  attendanceScore: z.number().nullable().optional(),
  midtermScore: z.number().nullable().optional(),
  finalScore: z.number().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export type GradeReportItem = z.infer<typeof gradeReportItemSchema>;

/**
 * Envelope for Class Grade Reports List (GET /api/v1/classes/{classId}/grade-reports)
 */
export const gradeReportListResponseSchema = z.object({
  items: z.array(gradeReportItemSchema).default([]),
  pageNumber: z.number().default(0),
  pageSize: z.number().default(10),
  totalElements: z.number().default(0),
  totalPages: z.number().default(1),
});

export type GradeReportListResponse = z.infer<typeof gradeReportListResponseSchema>;

/**
 * Input for Creating a Grade Report (POST /api/v1/classes/{classId}/grade-reports)
 */
export const createGradeReportSchema = z.object({
  studentId: z.string().min(1, 'Vui lòng chọn học viên'),
  attendanceScore: z
    .number()
    .min(0, 'Điểm từ 0 đến 10')
    .max(10, 'Điểm từ 0 đến 10')
    .nullable()
    .optional(),
  midtermScore: z
    .number()
    .min(0, 'Điểm từ 0 đến 10')
    .max(10, 'Điểm từ 0 đến 10')
    .nullable()
    .optional(),
  finalScore: z
    .number()
    .min(0, 'Điểm từ 0 đến 10')
    .max(10, 'Điểm từ 0 đến 10')
    .nullable()
    .optional(),
});

export type CreateGradeReportInput = z.infer<typeof createGradeReportSchema>;

/**
 * Input for Updating a Grade Report (PATCH /api/v1/classes/{classId}/grade-reports/users/{studentId})
 */
export const updateGradeReportSchema = z.object({
  attendanceScore: z
    .number()
    .min(0, 'Điểm từ 0 đến 10')
    .max(10, 'Điểm từ 0 đến 10')
    .nullable()
    .optional(),
  midtermScore: z
    .number()
    .min(0, 'Điểm từ 0 đến 10')
    .max(10, 'Điểm từ 0 đến 10')
    .nullable()
    .optional(),
  finalScore: z
    .number()
    .min(0, 'Điểm từ 0 đến 10')
    .max(10, 'Điểm từ 0 đến 10')
    .nullable()
    .optional(),
});

export type UpdateGradeReportInput = z.infer<typeof updateGradeReportSchema>;

/**
 * Class Member Student item from GET /api/v1/classes/{classId}/members?role=STUDENT
 */
export const classMemberStudentItemSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  studentId: z.string().optional(),
  name: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  studentCode: z.string().optional(),
  role: z.string().optional(),
  user: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      fullName: z.string().optional(),
      email: z.string().optional(),
      studentCode: z.string().optional(),
    })
    .optional(),
});

export type ClassMemberStudentItem = z.infer<typeof classMemberStudentItemSchema>;
