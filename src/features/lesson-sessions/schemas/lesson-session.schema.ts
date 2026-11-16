import { z } from 'zod';

export const createLessonSessionSchema = z
  .object({
    sessionDate: z.string().min(1, { message: 'Vui lòng chọn ngày học' }),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Định dạng giờ không hợp lệ (HH:mm)' }),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Định dạng giờ không hợp lệ (HH:mm)' }),
    startShift: z.coerce.number().min(1).max(12),
    endShift: z.coerce.number().min(1).max(12),
    roomId: z.string().min(1, { message: 'Vui lòng chọn phòng học' }),
    note: z.string().optional(),
    sendEmailNotification: z.boolean().default(true),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu',
    path: ['endTime'],
  })
  .refine((data) => data.endShift >= data.startShift, {
    message: 'Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu',
    path: ['endShift'],
  });

export type CreateLessonSessionFormValues = z.infer<typeof createLessonSessionSchema>;

/**
 * Backend Attendance Status enum:
 * Backend Spring Boot (AttendanceStatus.java): PRESENT, ABSENT, LATE, EXCUSE
 */
export const backendAttendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSE']);
export type BackendAttendanceStatus = z.infer<typeof backendAttendanceStatusSchema>;

/**
 * Frontend Attendance Status enum:
 * PRESENT, ABSENT, LATE, EXCUSED
 */
export const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']);
export type FrontendAttendanceStatus = z.infer<typeof attendanceStatusSchema>;

/**
 * Convert frontend attendance status to backend compatible status.
 * Note: Backend uses 'EXCUSE' without 'D'.
 */
export function toBackendAttendanceStatus(status: FrontendAttendanceStatus): BackendAttendanceStatus {
  if (status === 'EXCUSED') return 'EXCUSE';
  return status;
}

/**
 * Convert backend status to frontend status.
 */
export function fromBackendAttendanceStatus(status?: string | null): FrontendAttendanceStatus | null {
  if (!status) return null;
  const upper = status.toUpperCase().trim();
  if (upper === 'EXCUSE' || upper === 'EXCUSED') return 'EXCUSED';
  if (upper === 'PRESENT' || upper === 'LATE' || upper === 'ABSENT') {
    return upper as FrontendAttendanceStatus;
  }
  return 'PRESENT';
}

/**
 * Backend Batch Attendance Request Schema (BatchAttendanceRequestDTO)
 */
export const batchAttendanceRequestSchema = z.object({
  attendances: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: backendAttendanceStatusSchema,
      note: z.string().optional(),
    })
  ),
});
export type BatchAttendanceRequest = z.infer<typeof batchAttendanceRequestSchema>;

/**
 * Backend Attendance Response Item Schema (AttendanceResponseDTO)
 */
export const backendAttendanceResponseSchema = z.object({
  classId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  studentId: z.string(),
  status: z.string(),
  note: z.string().nullable().optional(),
});
export type BackendAttendanceResponse = z.infer<typeof backendAttendanceResponseSchema>;

/**
 * Backend Lesson Session Response Schema (LessonSessionResponseDTO)
 */
export const lessonSessionResponseSchema = z.object({
  classId: z.string().uuid(),
  lessonSessionId: z.string().uuid(),
  className: z.string().optional().default(''),
  roomName: z.string().optional().default(''),
  sessionDate: z.string(),
  note: z.string().nullable().optional(),
  startTime: z.string(),
  endTime: z.string(),
});
export type LessonSessionResponseDTO = z.infer<typeof lessonSessionResponseSchema>;
