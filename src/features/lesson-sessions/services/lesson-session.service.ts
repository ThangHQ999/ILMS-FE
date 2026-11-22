import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  AttendanceRecord,
  AttendanceStatus,
  CreateLessonSessionRequest,
  LessonSession,
  Room,
  Student,
  TodaySessionItem,
} from '../types';
import {
  checkRoomMatch,
  checkTimeOverlap,
  EXTERNAL_CONFLICTS,
  MOCK_INITIAL_LESSON_SESSIONS,
  MOCK_ROOMS,
  MOCK_STUDENTS,
} from '../constants';
import {
  fromBackendAttendanceStatus,
  toBackendAttendanceStatus,
} from '../schemas/lesson-session.schema';

const SESSIONS_KEY = 'ilms_edupulse_sessions_v6';
const ATTENDANCE_KEY_PREFIX = 'ilms_edupulse_attendance_v6_';

export const DEFAULT_TEACHER_SESSIONS: TodaySessionItem[] = [
  {
    id: 'SES-2024-B1-08',
    timeSlot: '07:30 - 09:30',
    subjectTitle: 'Cấu trúc Dữ liệu & Giải thuật',
    subjectCode: 'CS-202',
    roomName: 'Phòng B1-204',
    studentsCount: 45,
    classId: 'CNTT-K21A',
    status: 'IN_PROGRESS',
    attendedCount: 42,
  },
  {
    id: 'SES-2024-B1-09',
    timeSlot: '09:45 - 11:45',
    subjectTitle: 'Thiết kế & Đánh giá Giải thuật',
    subjectCode: 'CS-301',
    roomName: 'Phòng A2-301',
    studentsCount: 45,
    classId: 'CNTT-K21B',
    status: 'IN_PROGRESS',
    attendedCount: 30,
  },
  {
    id: 'SES-2024-B1-07',
    timeSlot: '13:30 - 15:30',
    subjectTitle: 'Lập trình Web nâng cao',
    subjectCode: 'IT-101',
    roomName: 'Lab AI 4.0',
    studentsCount: 45,
    classId: 'CNTT-K21A',
    status: 'COMPLETED',
    attendedCount: 45,
  },
];

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

/**
 * Fetch Lesson Sessions for a class.
 * Endpoints:
 * - GET /api/v1/classes/{classId}/lesson-sessions (primary)
 * - GET /api/v1/classes/{classId}/lessonSessions (alias)
 * - GET /api/v1/users/me/timetable (user timetable fallback)
 */
export async function getLessonSessions(classId: string): Promise<LessonSession[]> {
  const todayStr = new Date().toISOString().split('T')[0];
  let list: Array<Record<string, unknown>> = [];
  let apiSucceeded = false;

  // Attempt 1: GET /classes/{classId}/lesson-sessions
  if (classId && classId !== 'all') {
    try {
      const res = await api.get<ApiResponse<Array<Record<string, unknown>>> | Array<Record<string, unknown>>>(
        `/classes/${classId}/lesson-sessions`
      );
      apiSucceeded = true;
      const data = res.data;
      if (Array.isArray(data)) list = data;
      else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) list = data.data;
    } catch {
      // Attempt 2: Alias /classes/{classId}/lessonSessions
      try {
        const res = await api.get<ApiResponse<Array<Record<string, unknown>>> | Array<Record<string, unknown>>>(
          `/classes/${classId}/lessonSessions`
        );
        apiSucceeded = true;
        const data = res.data;
        if (Array.isArray(data)) list = data;
        else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) list = data.data;
      } catch {
        // continue
      }
    }
  }

  // Attempt 3: If specific class endpoint is empty or classId is 'all', query personal timetable
  if (list.length === 0 && (!apiSucceeded || classId === 'all')) {
    try {
      const res = await api.get<ApiResponse<Array<Record<string, unknown>>> | Array<Record<string, unknown>>>(
        '/users/me/timetable',
        {
          params: classId && classId !== 'all' ? { classId } : undefined,
        }
      );
      apiSucceeded = true;
      const data = res.data;
      if (Array.isArray(data)) list = data;
      else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) list = data.data;
    } catch {
      // continue
    }
  }

  if (list.length > 0) {
    return list.map((item, index) => {
      const sessionId = String(item.lessonSessionId || item.id || `sess-${index + 1}`);
      let attended = typeof item.attendedCount === 'number' ? item.attendedCount : 0;
      let total = typeof item.totalStudents === 'number' ? item.totalStudents : typeof item.studentsCount === 'number' ? item.studentsCount : 45;
      let st: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' = (item.status as 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED') || 'SCHEDULED';

      // Check local attendance cache if present
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(`${ATTENDANCE_KEY_PREFIX}${sessionId}`);
          if (raw) {
            const recs: AttendanceRecord[] = JSON.parse(raw);
            if (Array.isArray(recs)) {
              attended = recs.filter((a) => a.status !== null && a.status !== undefined).length;
              total = recs.length || total;
              st = attended >= total && total > 0 ? 'COMPLETED' : attended > 0 ? 'IN_PROGRESS' : 'SCHEDULED';
            }
          }
        } catch {
          // ignore
        }
      }

      const startTime = item.startTime ? String(item.startTime).slice(0, 5) : '07:30';
      const endTime = item.endTime ? String(item.endTime).slice(0, 5) : '09:30';

      return {
        classId: String(item.classId || classId),
        lessonSessionId: sessionId,
        sessionCode: String(item.sessionCode || `CA-${index + 1}`),
        className: String(item.className || item.courseName || 'Lớp học phần'),
        subjectCode: String(item.courseCode || item.classCode || item.subjectCode || 'INT3306'),
        sessionDate: String(item.sessionDate || todayStr),
        startTime,
        endTime,
        startShift: typeof item.startShift === 'number' ? item.startShift : 1,
        endShift: typeof item.endShift === 'number' ? item.endShift : 3,
        roomId: String(item.roomId || 'room-1'),
        roomName: String(item.roomName || 'Phòng B1-204'),
        building: String(item.building || 'Tòa B1'),
        instructorName: String(item.teacherName || item.instructorName || 'Giảng viên'),
        note: String(item.note || ''),
        status: st,
        attendedCount: attended,
        totalStudents: total,
      };
    });
  }

  if (apiSucceeded) {
    if (classId && classId !== 'all') {
      const stored = getStoredSessions().filter((s) => s.classId === classId);
      if (stored.length > 0) return stored;
    }
    return [];
  }

  const allStored = getStoredSessions();
  if (classId && classId !== 'all') {
    const matched = allStored.filter((s) => s.classId === classId);
    if (matched.length > 0) return matched;
    if (classId !== 'CNTT-K21A') return [];
  }

  return allStored;
}

/**
 * Update an existing lesson session.
 * Endpoint: PUT /api/v1/classes/{classId}/lesson-sessions/{lessonSessionId}
 */
export async function updateLessonSession(
  classId: string,
  lessonSessionId: string,
  payload: Partial<CreateLessonSessionRequest>
): Promise<LessonSession> {
  const current = getStoredSessions();
  let updatedFromApi: LessonSession | null = null;

  try {
    const res = await api.put<ApiResponse<LessonSession> | LessonSession>(
      `/classes/${classId}/lesson-sessions/${lessonSessionId}`,
      payload
    );
    const data = res.data;
    if (data && 'data' in data && data.data) updatedFromApi = data.data;
    else if (data && 'lessonSessionId' in data) updatedFromApi = data as LessonSession;
  } catch {
    try {
      const res = await api.put<ApiResponse<LessonSession> | LessonSession>(
        `/classes/${classId}/lessonSessions/${lessonSessionId}`,
        payload
      );
      const data = res.data;
      if (data && 'data' in data && data.data) updatedFromApi = data.data;
      else if (data && 'lessonSessionId' in data) updatedFromApi = data as LessonSession;
    } catch {
      // Fallback to local storage update
    }
  }

  const existing = current.find((s) => s.lessonSessionId === lessonSessionId);
  const selectedRoom = MOCK_ROOMS.find((r) => r.roomId === payload.roomId);
  const roomName = selectedRoom ? selectedRoom.roomName : (payload.roomId || existing?.roomName || 'Phòng học');

  const updated: LessonSession = updatedFromApi || {
    ...(existing || {
      classId,
      lessonSessionId,
      sessionCode: 'CA-UPD',
      className: 'Lớp học',
      subjectCode: 'INT3306',
      status: 'SCHEDULED' as const,
      attendedCount: 0,
      totalStudents: 45,
    }),
    sessionDate: payload.sessionDate || existing?.sessionDate || new Date().toISOString().split('T')[0],
    startTime: payload.startTime || existing?.startTime || '07:30',
    endTime: payload.endTime || existing?.endTime || '09:30',
    startShift: payload.startShift ?? existing?.startShift ?? 1,
    endShift: payload.endShift ?? existing?.endShift ?? 3,
    roomId: payload.roomId || existing?.roomId || 'room-1',
    roomName,
    note: payload.note !== undefined ? payload.note : existing?.note || '',
  };

  const updatedList = current.map((s) => (s.lessonSessionId === lessonSessionId ? updated : s));
  saveStoredSessions(updatedList);
  return updated;
}

/**
 * Delete a lesson session.
 * Endpoint: DELETE /api/v1/classes/{classId}/lesson-sessions/{lessonSessionId}?force=true
 */
export async function deleteLessonSession(
  classId: string,
  lessonSessionId: string,
  force: boolean = true
): Promise<void> {
  try {
    await api.delete(`/classes/${classId}/lesson-sessions/${lessonSessionId}`, {
      params: { force },
    });
  } catch {
    try {
      await api.delete(`/classes/${classId}/lessonSessions/${lessonSessionId}`, {
        params: { force },
      });
    } catch (err) {
      console.warn('Backend delete lesson session failed, updating local cache:', err);
    }
  }

  // Always remove from local storage
  const current = getStoredSessions();
  saveStoredSessions(current.filter((s) => s.lessonSessionId !== lessonSessionId));
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`${ATTENDANCE_KEY_PREFIX}${lessonSessionId}`);
    } catch {
      // ignore
    }
  }
}

/**
 * Create a new lesson session.
 * Endpoint: POST /api/v1/classes/{classId}/lessonSessions
 */
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
      `/classes/${classId}/lesson-sessions`,
      payload
    );
    const data = res.data;
    if (data && 'data' in data && data.data) return data.data;
    if (data && 'lessonSessionId' in data) return data as LessonSession;
  } catch {
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

/**
 * Fetch Attendances for a session.
 * Endpoint: GET /api/v1/classes/{classId}/lessonSessions/{sessionId}/attendances
 */
export async function getAttendances(
  classId: string,
  sessionId: string
): Promise<AttendanceRecord[]> {
  try {
    let data: unknown = null;
    try {
      const res = await api.get<
        ApiResponse<Array<{ studentId: string; status: string; note?: string }>>
      >(`/classes/${classId}/lesson-sessions/${sessionId}/attendances`);
      data = res.data?.data || res.data;
    } catch {
      const res = await api.get<
        ApiResponse<Array<{ studentId: string; status: string; note?: string }>>
      >(`/classes/${classId}/lessonSessions/${sessionId}/attendances`);
      data = res.data?.data || res.data;
    }

    if (Array.isArray(data) && data.length > 0) {
      const mapped: AttendanceRecord[] = data.map((item) => ({
        studentId: String(item.studentId),
        status: fromBackendAttendanceStatus(item.status),
        note: item.note || '',
      }));

      // Cache locally to keep offline and F5 view synchronized
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`${ATTENDANCE_KEY_PREFIX}${sessionId}`, JSON.stringify(mapped));
        } catch {
          // ignore
        }
      }
      return mapped;
    }
  } catch {
    // Fallback quietly
  }
  return getStoredAttendances(sessionId);
}

/**
 * Save batch attendances for a session.
 * Endpoints:
 * - POST /api/v1/classes/{classId}/lesson-sessions/{sessionId}/attendances
 * - POST /api/v1/classes/{classId}/lessonSessions/{sessionId}/attendances
 * Note: Backend requires @NotNull on status. Only non-null entries are submitted.
 */
export async function saveAttendances(
  classId: string,
  sessionId: string,
  attendances: AttendanceRecord[],
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED'
): Promise<void> {
  // Always update local cache immediately for instantaneous UI updates
  saveStoredAttendances(sessionId, attendances, status);

  // Prepare payload for backend BatchAttendanceRequestDTO
  const validAttendances = attendances
    .filter((a) => a.status !== null && a.status !== undefined)
    .map((a) => ({
      studentId: a.studentId,
      status: toBackendAttendanceStatus(a.status as AttendanceStatus),
      note: a.note || '',
    }));

  if (validAttendances.length > 0) {
    try {
      await api.post(`/classes/${classId}/lesson-sessions/${sessionId}/attendances`, {
        attendances: validAttendances,
      });
    } catch {
      try {
        await api.post(`/classes/${classId}/lessonSessions/${sessionId}/attendances`, {
          attendances: validAttendances,
        });
      } catch (err) {
        console.warn('Backend batch attendance sync failed (operating in offline/fallback mode):', err);
      }
    }
  }
}

/**
 * Fetch class students / members.
 * Endpoint: GET /api/v1/classes/{classId}/members?role=STUDENT&size=100
 */
export async function getClassStudents(classId: string): Promise<Student[]> {
  try {
    const res = await api.get<ApiResponse<unknown>>(`/classes/${classId}/members`, {
      params: { role: 'STUDENT', size: 100 },
    });

    const raw = res.data?.data ?? res.data;
    const content = Array.isArray(raw)
      ? raw
      : (raw as { content?: unknown[]; items?: unknown[] })?.content ??
        (raw as { items?: unknown[] })?.items ??
        [];

    if (Array.isArray(content) && content.length > 0) {
      // Filter student items if role is present
      const studentItems = content.filter((item: unknown) => {
        if (!item || typeof item !== 'object') return false;
        const rec = item as Record<string, unknown>;
        const userRec = rec.user as Record<string, unknown> | undefined;
        const role = String(rec.role || userRec?.role || 'STUDENT').toUpperCase();
        return role === 'STUDENT';
      });

      const listToMap = studentItems.length > 0 ? studentItems : content;

      return listToMap.map((item: unknown, index: number) => {
        const rec = item as Record<string, unknown>;
        const u = (rec.user as Record<string, unknown> | undefined) || rec;

        const nameParts = [u.lastName, u.middleName, u.firstName].filter(Boolean);
        const studentName =
          typeof rec.name === 'string' && rec.name.trim().length > 0
            ? rec.name
            : typeof u.fullName === 'string' && u.fullName.trim().length > 0
            ? u.fullName
            : nameParts.length > 0
            ? nameParts.join(' ')
            : typeof u.email === 'string'
            ? u.email
            : `Sinh viên ${index + 1}`;

        const email = String(rec.email || u.email || '');
        const studentCode =
          typeof rec.studentCode === 'string' && rec.studentCode.length > 0
            ? rec.studentCode
            : typeof u.studentCode === 'string' && u.studentCode.length > 0
            ? u.studentCode
            : email.includes('@')
            ? email.split('@')[0].toUpperCase()
            : u.id
            ? `SV-${String(u.id).slice(0, 8).toUpperCase()}`
            : `SV24-${index + 1}`;

        const studentId = String(u.id || rec.id || `stu-${index + 1}`);

        return {
          studentId,
          studentCode,
          studentName,
          email,
          avatarUrl:
            typeof rec.avatarUrl === 'string'
              ? rec.avatarUrl
              : typeof u.avatarUrl === 'string'
              ? u.avatarUrl
              : undefined,
        };
      });
    }

    // If API returned 200 with an empty list for a specific real class:
    if (classId !== 'CNTT-K21A') {
      return [];
    }
  } catch {
    // Fallback quietly
  }
  return classId === 'CNTT-K21A' ? MOCK_STUDENTS : [];
}

/**
 * Fetch Today Sessions for Teacher Overview Dashboard.
 * Tries real timetable API (/api/v1/users/me/timetable) for today,
 * then checks upcoming 7-day sessions from classes,
 * falling back gracefully to DEFAULT_TEACHER_SESSIONS synced with localStorage.
 */
export async function getTeacherTodaySessions(): Promise<TodaySessionItem[]> {
  const todayStr = new Date().toISOString().split('T')[0];

  // Attempt 1: GET /api/v1/users/me/timetable for today
  try {
    const res = await api.get<ApiResponse<Array<Record<string, unknown>>> | Array<Record<string, unknown>>>(
      '/users/me/timetable',
      {
        params: { startDate: todayStr, endDate: todayStr },
      }
    );
    const rawList = Array.isArray(res.data)
      ? res.data
      : (res.data && typeof res.data === 'object' && 'data' in res.data && Array.isArray(res.data.data))
      ? res.data.data
      : [];

    if (rawList.length > 0) {
      return rawList.map((m, idx) => {
        const id = String(m.lessonSessionId || m.id || `today-${idx}`);
        const total = typeof m.totalStudents === 'number' ? m.totalStudents : typeof m.studentsCount === 'number' ? m.studentsCount : 45;
        let attended = typeof m.attendedCount === 'number' ? m.attendedCount : 0;

        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(`${ATTENDANCE_KEY_PREFIX}${id}`);
            if (raw) {
              const list: AttendanceRecord[] = JSON.parse(raw);
              if (Array.isArray(list)) {
                attended = list.filter((a) => a.status !== null && a.status !== undefined).length;
              }
            }
          } catch {
            // ignore
          }
        }

        const st: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' =
          attended >= total && total > 0
            ? 'COMPLETED'
            : attended > 0
            ? 'IN_PROGRESS'
            : (m.status as 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED') || 'SCHEDULED';

        const startTime = m.startTime ? String(m.startTime).slice(0, 5) : '07:30';
        const endTime = m.endTime ? String(m.endTime).slice(0, 5) : '09:30';

        return {
          id,
          timeSlot: `${startTime} - ${endTime}`,
          subjectTitle: String(m.courseName || m.className || 'Ca học'),
          subjectCode: String(m.courseCode || m.classCode || 'CS-202'),
          roomName: String(m.roomName || 'Phòng học'),
          studentsCount: total,
          classId: String(m.classId || ''),
          status: st,
          attendedCount: attended,
        };
      });
    }
  } catch {
    // continue
  }

  // Attempt 2: If no sessions strictly on today's calendar date, fetch upcoming 7-day timetable
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const res = await api.get<ApiResponse<Array<Record<string, unknown>>> | Array<Record<string, unknown>>>(
      '/users/me/timetable',
      {
        params: { startDate: todayStr, endDate: nextWeekStr },
      }
    );
    const rawList = Array.isArray(res.data)
      ? res.data
      : (res.data && typeof res.data === 'object' && 'data' in res.data && Array.isArray(res.data.data))
      ? res.data.data
      : [];

    if (rawList.length > 0) {
      return rawList.slice(0, 5).map((m, idx) => {
        const id = String(m.lessonSessionId || m.id || `up-${idx}`);
        const total = typeof m.totalStudents === 'number' ? m.totalStudents : typeof m.studentsCount === 'number' ? m.studentsCount : 45;
        let attended = typeof m.attendedCount === 'number' ? m.attendedCount : 0;
        const startTime = m.startTime ? String(m.startTime).slice(0, 5) : '07:30';
        const endTime = m.endTime ? String(m.endTime).slice(0, 5) : '09:30';

        return {
          id,
          timeSlot: `${startTime} - ${endTime}`,
          subjectTitle: String(m.courseName || m.className || 'Ca học'),
          subjectCode: String(m.courseCode || m.classCode || 'CS'),
          roomName: String(m.roomName || 'Phòng học'),
          studentsCount: total,
          classId: String(m.classId || ''),
          status: (m.status as 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED') || 'SCHEDULED',
          attendedCount: attended,
        };
      });
    }
  } catch {
    // continue
  }

  // Attempt 3: Aggregation via classes
  try {
    const classesRes = await api.get<ApiResponse<{ content?: Array<{ id: string; name?: string; title?: string }> }>>('/classes', {
      params: { size: 10 },
    });
    const classes = classesRes.data?.data?.content || [];

    if (Array.isArray(classes) && classes.length > 0) {
      const foundToday: TodaySessionItem[] = [];

      for (const cls of classes.slice(0, 5)) {
        try {
          const sessRes = await api.get<ApiResponse<LessonSession[]>>(`/classes/${cls.id}/lesson-sessions`);
          const sessList = sessRes.data?.data || [];
          const matches = sessList.filter((s) => s.sessionDate === todayStr);

          for (const m of matches) {
            let attended = m.attendedCount || 0;
            const total = m.totalStudents || 45;

            try {
              const attRes = await api.get<ApiResponse<Array<{ status: string }>>>(
                `/classes/${cls.id}/lesson-sessions/${m.lessonSessionId}/attendances`
              );
              const atts = attRes.data?.data || [];
              if (Array.isArray(atts) && atts.length > 0) {
                attended = atts.filter((a) => a.status).length;
              }
            } catch {
              // ignore
            }

            const status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' =
              attended >= total && total > 0
                ? 'COMPLETED'
                : attended > 0
                ? 'IN_PROGRESS'
                : 'SCHEDULED';

            foundToday.push({
              id: m.lessonSessionId,
              timeSlot: `${m.startTime || '07:30'} - ${m.endTime || '09:30'}`,
              subjectTitle: m.className || cls.name || 'Môn học',
              subjectCode: m.subjectCode || 'INT3306',
              roomName: m.roomName || 'Phòng học',
              studentsCount: total,
              classId: cls.id,
              attendedCount: attended,
              status,
            });
          }
        } catch {
          // ignore error per class
        }
      }

      if (foundToday.length > 0) {
        return foundToday;
      }
    }
  } catch {
    // Fallback to local default sessions
  }

  // Graceful Fallback: Enrich DEFAULT_TEACHER_SESSIONS with local storage attendances
  if (typeof window === 'undefined') return DEFAULT_TEACHER_SESSIONS;

  return DEFAULT_TEACHER_SESSIONS.map((sess) => {
    try {
      const raw = localStorage.getItem(`${ATTENDANCE_KEY_PREFIX}${sess.id}`);
      if (raw) {
        const list: AttendanceRecord[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          const checked = list.filter((a) => a.status !== null && a.status !== undefined).length;
          const total = list.length || sess.studentsCount;
          const determinedStatus: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' =
            checked >= total && total > 0
              ? 'COMPLETED'
              : checked > 0
              ? 'IN_PROGRESS'
              : 'SCHEDULED';
          return {
            ...sess,
            attendedCount: checked,
            studentsCount: total,
            status: determinedStatus,
          };
        }
      }
    } catch {
      // ignore
    }
    return sess;
  });
}

export async function getRooms(): Promise<Room[]> {
  try {
    const res = await api.get<ApiResponse<Array<Record<string, unknown>>> | Array<Record<string, unknown>>>('/rooms');
    const raw = Array.isArray(res.data)
      ? res.data
      : res.data && typeof res.data === 'object' && 'data' in res.data && Array.isArray(res.data.data)
      ? res.data.data
      : [];

    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((r, index) => ({
        roomId: String(r.id || r.roomId || `room-${index + 1}`),
        roomName: String(r.name || r.roomName || `Phòng ${index + 1}`),
        building: String(r.building || 'Tòa nhà'),
        capacity: typeof r.capacity === 'number' ? r.capacity : 50,
        isAvailable: typeof r.isAvailable === 'boolean' ? r.isAvailable : true,
      }));
    }
  } catch {
    // fallback
  }
  return MOCK_ROOMS;
}
