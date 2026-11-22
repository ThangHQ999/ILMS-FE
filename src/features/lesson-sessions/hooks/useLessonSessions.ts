'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLessonSession,
  deleteLessonSession,
  getAttendances,
  getClassStudents,
  getLessonSessions,
  getRooms,
  getTeacherTodaySessions,
  saveAttendances,
  updateLessonSession,
} from '../services/lesson-session.service';
import { lessonSessionKeys } from '../constants';
import { AttendanceRecord, CreateLessonSessionRequest } from '../types';

export function useLessonSessions(classId: string) {
  return useQuery({
    queryKey: lessonSessionKeys.lists(classId),
    queryFn: () => getLessonSessions(classId),
    staleTime: 60 * 1000,
  });
}

export function useClassStudents(classId: string) {
  return useQuery({
    queryKey: lessonSessionKeys.students(classId),
    queryFn: () => getClassStudents(classId),
    staleTime: 60 * 1000,
  });
}

export function useAttendances(classId: string, sessionId?: string) {
  return useQuery({
    queryKey: sessionId
      ? lessonSessionKeys.attendances(classId, sessionId)
      : ['noop-attendance'],
    queryFn: () => (sessionId ? getAttendances(classId, sessionId) : Promise.resolve([])),
    enabled: Boolean(sessionId),
    staleTime: 30 * 1000,
  });
}

export function useTeacherTodaySessions() {
  return useQuery({
    queryKey: lessonSessionKeys.today(),
    queryFn: () => getTeacherTodaySessions(),
    staleTime: 30 * 1000,
  });
}

export function useRooms(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['rooms-list'],
    queryFn: () => getRooms(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 10,
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

export function useUpdateLessonSession(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonSessionId,
      payload,
    }: {
      lessonSessionId: string;
      payload: Partial<CreateLessonSessionRequest>;
    }) => updateLessonSession(classId, lessonSessionId, payload),
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

export function useDeleteLessonSession(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonSessionId,
      force = true,
    }: {
      lessonSessionId: string;
      force?: boolean;
    }) => deleteLessonSession(classId, lessonSessionId, force),
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
