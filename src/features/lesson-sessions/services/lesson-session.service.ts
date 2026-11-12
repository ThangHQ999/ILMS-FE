import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  AttendanceRecord,
  CreateLessonSessionRequest,
  LessonSession,
  Room,
  Student,
} from '../types';
import {
  checkRoomMatch,
  checkTimeOverlap,
  EXTERNAL_CONFLICTS,
  MOCK_INITIAL_LESSON_SESSIONS,
  MOCK_ROOMS,
  MOCK_STUDENTS,
} from '../constants';

const SESSIONS_KEY = 'ilms_edupulse_sessions_v6';
const ATTENDANCE_KEY_PREFIX = 'ilms_edupulse_attendance_v6_';

function getStoredSessions(): LessonSession[] {
  if (typeof window === 'undefined') return MOCK_INITIAL_LESSON_SESSIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    let sessions: LessonSession[];
    if (!raw) {
      sessions = MOCK_INITIAL_LESSON_SESSIONS;
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(MOCK_INITIAL_LESSON_SESSIONS));
    } else {
      sessions = JSON.parse(raw);
    }

    // Dynamic synchronization: recalculate attendedCount for each session from stored attendances if present
    return sessions.map((sess) => {
      try {
        const attRaw = localStorage.getItem(`${ATTENDANCE_KEY_PREFIX}${sess.lessonSessionId}`);
        if (attRaw) {
          const attList: AttendanceRecord[] = JSON.parse(attRaw);
          if (Array.isArray(attList)) {
            const checked = attList.filter(
              (a) => a.status !== null && a.status !== undefined
            ).length;
            const total = attList.length || sess.totalStudents || 45;
            const determinedStatus: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' =
              checked >= total && total > 0
                ? 'COMPLETED'
                : checked > 0
                ? 'IN_PROGRESS'
                : sess.status;
            return {
              ...sess,
              attendedCount: checked,
              totalStudents: total,
              status: determinedStatus,
            };
          }
        }
      } catch {
        // ignore
      }
      return sess;
    });
  } catch {
    return MOCK_INITIAL_LESSON_SESSIONS;
  }
}

function saveStoredSessions(sessions: LessonSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

function getStoredAttendances(sessionId: string): AttendanceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${ATTENDANCE_KEY_PREFIX}${sessionId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 45) return parsed;
    }
  } catch {
    // ignore
  }

  // Find target attendedCount for this session from stored sessions or defaults
  let targetCount = 0;
  if (sessionId === 'SES-2024-B1-08') {
    targetCount = 42;
  } else if (sessionId === 'SES-2024-B1-09') {
    targetCount = 30;
  } else if (sessionId === 'SES-2024-B1-07') {
    targetCount = 45;
  } else {
    try {
      const rawSessions = localStorage.getItem(SESSIONS_KEY);
      if (rawSessions) {
        const sessions: LessonSession[] = JSON.parse(rawSessions);
        const match = sessions.find((s) => s.lessonSessionId === sessionId);
        if (match && typeof match.attendedCount === 'number') {
          targetCount = match.attendedCount;
        }
      }
    } catch {
      targetCount = 0;
    }
  }

  // Seed full 45 students:
  // Exactly targetCount students have a non-null status (PRESENT, LATE, ABSENT, EXCUSED)
  // All remaining students have status: null (chưa điểm danh)
  const seeded: AttendanceRecord[] = MOCK_STUDENTS.map((stu, index) => {
    if (index >= targetCount) {
      return { studentId: stu.studentId, status: null, note: '' };
    }

    if (stu.studentId === 'B21DCCN045') return { studentId: stu.studentId, status: 'LATE', note: 'Trễ 15p do kẹt xe' };
    if (stu.studentId === 'B21DCCN102') return { studentId: stu.studentId, status: 'ABSENT', note: 'Không lý do' };
    if (stu.studentId === 'B21DCCN089') return { studentId: stu.studentId, status: 'EXCUSED', note: 'Có đơn xin nghỉ ốm qua email' };
    if (stu.studentId === 'B21DCCN310') return { studentId: stu.studentId, status: 'LATE', note: 'Vào lớp lúc 08:05' };
    if (stu.studentId === 'B21DCCN512') return { studentId: stu.studentId, status: 'LATE', note: 'Muộn 10p' };

    return { studentId: stu.studentId, status: 'PRESENT', note: '' };
  });

  try {
    localStorage.setItem(`${ATTENDANCE_KEY_PREFIX}${sessionId}`, JSON.stringify(seeded));
  } catch {
    // ignore
  }
  return seeded;
}

function saveStoredAttendances(
  sessionId: string,
  attendances: AttendanceRecord[],
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED'
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${ATTENDANCE_KEY_PREFIX}${sessionId}`, JSON.stringify(attendances));

    // Also update attendedCount, totalStudents AND status in stored sessions
    const rawSessions = localStorage.getItem(SESSIONS_KEY);
    if (rawSessions) {
      const sessions: LessonSession[] = JSON.parse(rawSessions);
      const checked = attendances.filter(
        (a) => a.status !== null && a.status !== undefined
      ).length;
      const total = attendances.length;
      const determinedStatus: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' =
        checked >= total && total > 0
          ? 'COMPLETED'
          : checked > 0
          ? 'IN_PROGRESS'
          : (status || 'SCHEDULED');

      const updatedSessions = sessions.map((s) =>
        s.lessonSessionId === sessionId
          ? {
              ...s,
              attendedCount: checked,
              totalStudents: total,
              status: determinedStatus,
            }
          : s
      );
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    }
  } catch (err) {
    console.error('Failed to save attendances:', err);
  }
}

export async function getLessonSessions(classId: string): Promise<LessonSession[]> {
  try {
    const res = await api.get<ApiResponse<LessonSession[]> | LessonSession[]>(
      `/classes/${classId}/lessonSessions`
    );
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && 'data' in data && Array.isArray(data.data)) return data.data;
  } catch {
    // Fallback quietly to local mock data
  }
  return getStoredSessions();
}

export async function createLessonSession(
  classId: string,
  payload: CreateLessonSessionRequest
): Promise<LessonSession> {
  const selectedRoom = MOCK_ROOMS.find((r) => r.roomId === payload.roomId);
  const roomName = selectedRoom ? selectedRoom.roomName : payload.roomId;

  const current = getStoredSessions();

  // Validate conflict against existing sessions
  const hasInternalConflict = current.some((s) => {
    const sameRoom =
      checkRoomMatch(s.roomId, payload.roomId) ||
      checkRoomMatch(s.roomName, payload.roomId);
    const sameDate = s.sessionDate === payload.sessionDate;
    const timeOverlap = checkTimeOverlap(payload.startTime, payload.endTime, s.startTime, s.endTime);
    return sameRoom && sameDate && timeOverlap;
  });

  // Validate conflict against external schedule
  const hasExternalConflict = EXTERNAL_CONFLICTS.some((ext) => {
    const sameRoom = checkRoomMatch(ext.roomName, payload.roomId);
    const sameDate = ext.date === payload.sessionDate;
    const [extStart, extEnd] = ext.timeSlot.split(' - ');
    const timeOverlap = checkTimeOverlap(payload.startTime, payload.endTime, extStart, extEnd);
    return sameRoom && sameDate && timeOverlap;
  });

  if (hasInternalConflict || hasExternalConflict) {
    throw new Error('ROOM_SCHEDULE_CONFLICT: Ca học bị trùng phòng và khung giờ với ca học đã có!');
  }

  try {
    const res = await api.post<ApiResponse<LessonSession> | LessonSession>(
      `/classes/${classId}/lessonSessions`,
      payload
    );
    const data = res.data;
    if (data && 'data' in data && data.data) return data.data;
    if (data && 'lessonSessionId' in data) return data as LessonSession;
  } catch {
    // Fallback quietly to local mock store
  }

  const newSession: LessonSession = {
    classId,
    lessonSessionId: `SES-2024-B1-${Date.now().toString().slice(-2)}`,
    sessionCode: `CA-${current.length + 10}`,
    className: 'Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)',
    subjectCode: 'INT3306 01',
    sessionDate: payload.sessionDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
    startShift: payload.startShift,
    endShift: payload.endShift,
    roomId: payload.roomId,
    roomName,
    instructorName: 'ThS. Nguyễn Văn An',
    note: payload.note || '',
    status: 'SCHEDULED',
    attendedCount: 0,
    totalStudents: 45,
  };

  saveStoredSessions([newSession, ...current]);
  return newSession;
}

export async function getAttendances(
  classId: string,
  sessionId: string
): Promise<AttendanceRecord[]> {
  try {
    const res = await api.get<ApiResponse<AttendanceRecord[]> | AttendanceRecord[]>(
      `/classes/${classId}/lessonSessions/${sessionId}/attendances`
    );
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && 'data' in data && Array.isArray(data.data)) return data.data;
  } catch {
    // Fallback quietly
  }
  return getStoredAttendances(sessionId);
}

export async function saveAttendances(
  classId: string,
  sessionId: string,
  attendances: AttendanceRecord[],
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED'
): Promise<void> {
  try {
    await api.post(`/classes/${classId}/lessonSessions/${sessionId}/attendances`, {
      attendances,
      status,
    });
  } catch {
    // Fallback quietly
  }
  saveStoredAttendances(sessionId, attendances, status);
}

export async function getClassStudents(classId: string): Promise<Student[]> {
  try {
    const res = await api.get<ApiResponse<Student[]> | Student[]>(
      `/classes/${classId}/students`
    );
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && 'data' in data && Array.isArray(data.data)) return data.data;
  } catch {
    // Fallback quietly
  }
  return MOCK_STUDENTS;
}

export async function getRooms(): Promise<Room[]> {
  return MOCK_ROOMS;
}

