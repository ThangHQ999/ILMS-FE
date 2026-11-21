import { z } from 'zod';

export const timetableSessionSchema = z.object({
  lessonSessionId: z.string(),
  classId: z.string(),
  className: z.string(),
  sessionDate: z.string(), // YYYY-MM-DD
  startTime: z.string(), // HH:mm:ss or HH:mm
  endTime: z.string(), // HH:mm:ss or HH:mm
  roomName: z.string(),
  roomShort: z.string(),
  note: z.string().optional(),
  studentsCount: z.number().int().nonnegative(),
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'SCHEDULED']),
  sessionType: z.enum(['theory', 'lab', 'exam']),
  tag: z.string().optional(),
  tagType: z.enum(['exam', 'info', 'code', 'contest']).optional(),
  actionType: z.enum(['attendance_now', 'attendance', 'detail', 'meet', 'contest']).optional(),
  meetingUrl: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6), // 1: Mon, ..., 6: Sat, 0: Sun
  startShift: z.number().int().min(1).max(12).default(1),
  endShift: z.number().int().min(1).max(12).default(3),
});

export const timetableKpisSchema = z.object({
  totalSessions: z.number().int(),
  totalPeriods: z.number().int(),
  labSessions: z.number().int(),
  peakDay: z.string(),
  peakConsecutive: z.number().int(),
  syncTimeText: z.string(),
});

export const swapRoomRequestSchema = z.object({
  sessionId: z.string().min(1, 'Vui lòng chọn ca học'),
  requestType: z.enum(['MAKEUP', 'SWAP_ROOM']),
  proposedDate: z.string().min(1, 'Vui lòng chọn ngày đề xuất'),
  proposedTime: z.string().min(1, 'Vui lòng chọn khung giờ'),
  proposedRoom: z.string().min(1, 'Vui lòng chọn phòng học mong muốn'),
  reason: z.string().min(5, 'Lý do điều chỉnh tối thiểu 5 ký tự'),
});

export const rawLessonSessionResponseSchema = z
  .object({
    id: z.string().optional(),
    lessonSessionId: z.string().optional(),
    sessionId: z.string().optional(),
    classId: z.string(),
    classCode: z.string().nullable().optional(),
    className: z.string().optional(),
    courseId: z.string().nullable().optional(),
    courseCode: z.string().nullable().optional(),
    courseName: z.string().nullable().optional(),
    subjectCode: z.string().nullable().optional(),
    subjectTitle: z.string().nullable().optional(),
    teacherId: z.string().nullable().optional(),
    teacherName: z.string().nullable().optional(),
    roomId: z.string().nullable().optional(),
    roomName: z.string().nullable().optional(),
    timeSlotId: z.string().nullable().optional(),
    timeSlotName: z.string().nullable().optional(),
    sessionDate: z.string(),
    startShift: z.number().nullable().optional(),
    endShift: z.number().nullable().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    note: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    studentsCount: z.number().nullable().optional(),
    totalStudents: z.number().nullable().optional(),
    attendedCount: z.number().nullable().optional(),
  })
  .passthrough();

export const createLessonSessionSchema = z.object({
  classId: z.string().min(1, 'Vui lòng chọn lớp học'),
  courseId: z.string().optional(),
  teacherId: z.string().optional(),
  timeSlotId: z.string().optional(),
  sessionDate: z.string().min(10, 'Vui lòng chọn ngày học (YYYY-MM-DD)'),
  startTime: z.string().min(1, 'Vui lòng chọn giờ bắt đầu'),
  endTime: z.string().min(1, 'Vui lòng chọn giờ kết thúc'),
  startShift: z.number().int().min(1).max(12).default(1),
  endShift: z.number().int().min(1).max(12).default(3),
  roomId: z.string().min(1, 'Vui lòng chọn hoặc nhập phòng học'),
  roomName: z.string().optional(),
  note: z.string().optional(),
});

export type TimetableSession = z.infer<typeof timetableSessionSchema>;
export type TimetableKpis = z.infer<typeof timetableKpisSchema>;
export type SwapRoomFormValues = z.infer<typeof swapRoomRequestSchema>;
export type RawLessonSessionResponse = z.infer<typeof rawLessonSessionResponseSchema>;
export type CreateLessonSessionRequest = z.infer<typeof createLessonSessionSchema>;
