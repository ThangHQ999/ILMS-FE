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

export type TimetableSession = z.infer<typeof timetableSessionSchema>;
export type TimetableKpis = z.infer<typeof timetableKpisSchema>;
export type SwapRoomFormValues = z.infer<typeof swapRoomRequestSchema>;

