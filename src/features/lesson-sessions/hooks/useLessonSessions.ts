'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLessonSession,
  getAttendances,
  getClassStudents,
  getLessonSessions,
  getRooms,
  getTeacherTodaySessions,
  saveAttendances,
} from '../services/lesson-session.service';
import { lessonSessionKeys } from '../constants';
import { AttendanceRecord, CreateLessonSessionRequest } from '../types';

export function useLessonSessions(classId: string) {
  return useQuery({
    queryKey: lessonSessionKeys.lists(classId),
    queryFn: () => getLessonSessions(classId),
  });
}

export function useClassStudents(classId: string) {
  return useQuery({
    queryKey: lessonSessionKeys.students(classId),
    queryFn: () => getClassStudents(classId),
  });
}

export function useAttendances(classId: string, sessionId?: string) {
  return useQuery({
    queryKey: sessionId
      ? lessonSessionKeys.attendances(classId, sessionId)
      : ['noop-attendance'],
    queryFn: () => (sessionId ? getAttendances(classId, sessionId) : Promise.resolve([])),
    enabled: Boolean(sessionId),
  });
}

export function useTeacherTodaySessions() {
  return useQuery({
    queryKey: lessonSessionKeys.today(),
    queryFn: () => getTeacherTodaySessions(),
    staleTime: 30 * 1000,
  });
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms-list'],
    queryFn: () => getRooms(),
  });
}

export function useCreateLessonSession(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLessonSessionRequest) =>
      createLessonSession(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lessonSessionKeys.lists(classId),
      });
      queryClient.invalidateQueries({
        queryKey: lessonSessionKeys.today(),
      });
    },
  });
}

export function useSaveAttendances(classId: string, sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload:
        | AttendanceRecord[]
        | {
            attendances: AttendanceRecord[];
            status?: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
          }
    ) => {
      if (Array.isArray(payload)) {
        return saveAttendances(classId, sessionId, payload);
      }
      return saveAttendances(classId, sessionId, payload.attendances, payload.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lessonSessionKeys.attendances(classId, sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: lessonSessionKeys.lists(classId),
      });
      queryClient.invalidateQueries({
        queryKey: lessonSessionKeys.today(),
      });
    },
  });
}
