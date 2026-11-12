export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface LessonSession {
  classId: string;
  lessonSessionId: string;
  sessionCode?: string;      // e.g. CA-12, #SES-2024-B1-09
  className: string;
  subjectCode?: string;      // e.g. INT3306 01, INT1434
  sessionDate: string;       // YYYY-MM-DD
  startTime: string;         // HH:mm
  endTime: string;           // HH:mm
  startShift: number;
  endShift: number;
  roomId: string;
  roomName: string;
  building?: string;
  instructorName?: string;
  note?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
  attendedCount?: number;
  totalStudents?: number;
}

export interface CreateLessonSessionRequest {
  roomId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  startShift: number;
  endShift: number;
  note?: string;
  sendEmailNotification?: boolean;
}

export interface Student {
  studentId: string;
  studentCode: string;
  studentName: string;
  avatarColor?: string;
  email?: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus | null;
  note: string;
}

export interface Room {
  roomId: string;
  roomName: string;
  building: string;
  capacity: number;
  isAvailable?: boolean;
}

export interface ConflictDetails {
  roomName: string;
  conflictingCourse: string;
  instructorName: string;
  timeSlot: string;
  date: string;
  shifts: string;
}

