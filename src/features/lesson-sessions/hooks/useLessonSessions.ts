'use client';

import { queryOptions, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { classDetailKeys } from '@/features/classes/constants';
import {
  createLessonSession,
  deleteLessonSession,
  getAttendances,
  getClassStudents,
  getLessonSessions,
  getRooms,
  getTeacherTodaySessions,
  saveAttendances,
  type LessonSessionQueryOptions,
  updateLessonSession,
} from '../services/lesson-session.service';
import { lessonSessionKeys } from '../constants';
import { AttendanceRecord, CreateLessonSessionRequest } from '../types';

type ScheduleOptions = Omit<LessonSessionQueryOptions, 'signal'> & { enabled?: boolean };

export function lessonSessionsQueryOptions(
  classId: string, { canonical = false, startDate, endDate, enabled = true }: ScheduleOptions = {},
) {
  const listKey = lessonSessionKeys.lists(classId);
  const range = startDate || endDate ? [{ startDate, endDate }] : [];
  return queryOptions({
    queryKey: canonical ? [...listKey, 'canonical', ...range] : listKey,
    queryFn: context => canonical
      ? getLessonSessions(classId, { canonical: true, startDate, endDate, signal: context.signal })
      : getLessonSessions(classId),
    enabled,
    staleTime: 60 * 1000,
    retry: canonical ? false : undefined,
  });
}

export function useLessonSessions(classId: string, options?: ScheduleOptions) {
  return useQuery(lessonSessionsQueryOptions(classId, options));
}

export function useClassStudents(classId: string, { enabled = true, canonical = false } = {}) {
  const key = lessonSessionKeys.students(classId);
  return useQuery({
    queryKey: canonical ? [...key, 'canonical'] : key,
    queryFn: context => canonical
      ? getClassStudents(classId, { canonical: true, signal: context.signal })
      : getClassStudents(classId),
    enabled: enabled && Boolean(classId && classId !== 'all' && classId !== 'CNTT-K21A'),
    staleTime: 60 * 1000,
    retry: canonical ? false : undefined,
  });
}

export function useAttendances(classId: string, sessionId?: string, { canonical = false } = {}) {
  const key = sessionId ? lessonSessionKeys.attendances(classId, sessionId) : ['noop-attendance'];
  return useQuery({
    queryKey: canonical ? [...key, 'canonical'] : key,
    queryFn: context => !sessionId ? Promise.resolve([])
      : canonical ? getAttendances(classId, sessionId, { canonical: true, signal: context.signal })
      : getAttendances(classId, sessionId),
    enabled: Boolean(sessionId && (!canonical || (classId && classId !== 'all'))),
    staleTime: 30 * 1000,
    retry: canonical ? false : undefined,
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

function invalidateSchedules(queryClient: QueryClient, classId: string) {
  void queryClient.invalidateQueries({ queryKey: lessonSessionKeys.lists(classId) });
  if (classId !== 'all') void queryClient.invalidateQueries({ queryKey: lessonSessionKeys.lists('all') });
  void queryClient.invalidateQueries({ queryKey: lessonSessionKeys.today() });
}

export function useCreateLessonSession(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLessonSessionRequest) =>
      createLessonSession(classId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classDetailKeys.overview(classId) });
      invalidateSchedules(queryClient, classId);
    },
  });
}

export function useUpdateLessonSession(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonSessionId,
      payload,
      targetClassId = classId,
    }: {
      lessonSessionId: string;
      payload: Partial<CreateLessonSessionRequest>;
      targetClassId?: string;
    }) => updateLessonSession(targetClassId, lessonSessionId, payload),
    onSuccess: (_data, { targetClassId = classId }) => {
      void queryClient.invalidateQueries({ queryKey: classDetailKeys.overview(targetClassId) });
      invalidateSchedules(queryClient, targetClassId);
    },
  });
}

export function useDeleteLessonSession(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonSessionId,
      force = true,
      targetClassId = classId,
    }: {
      lessonSessionId: string;
      force?: boolean;
      targetClassId?: string;
    }) => deleteLessonSession(targetClassId, lessonSessionId, force),
    onSuccess: (_data, { targetClassId = classId }) => {
      void queryClient.invalidateQueries({ queryKey: classDetailKeys.overview(targetClassId) });
      invalidateSchedules(queryClient, targetClassId);
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
      invalidateSchedules(queryClient, classId);
    },
  });
}
