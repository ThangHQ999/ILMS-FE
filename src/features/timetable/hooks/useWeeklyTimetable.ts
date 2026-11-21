'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  TimetableSession,
  TimetableFilterType,
  WeeklyTimetableData,
  DaySchedule,
  CreateLessonSessionRequest,
} from '../types';
import {
  getWeeklyTimetable,
  createLessonSession,
  getCurrentWeekNumber,
} from '../services/timetable.service';

export const timetableKeys = {
  all: ['timetable'] as const,
  weekly: (week: number, classId?: string, courseId?: string) =>
    [...timetableKeys.all, 'weekly', week, classId ?? 'all', courseId ?? 'all'] as const,
  classSessions: (classId: string) =>
    [...timetableKeys.all, 'classSessions', classId] as const,
};

export function useWeeklyTimetable() {
  const t = useTranslations('timetable');
  const queryClient = useQueryClient();

  const [currentWeek, setCurrentWeek] = useState(() => getCurrentWeekNumber());
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<TimetableFilterType>('all');
  const [selectedSession, setSelectedSession] = useState<TimetableSession | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSwapRoomModalOpen, setIsSwapRoomModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Real API integration using TanStack Query
  const timetableQuery = useQuery<WeeklyTimetableData>({
    queryKey: timetableKeys.weekly(currentWeek, selectedClassId, selectedCourseId),
    queryFn: () =>
      getWeeklyTimetable(currentWeek, {
        classId: selectedClassId,
        courseId: selectedCourseId,
      }),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const rawTimetable = timetableQuery.data;

  // Mutation to create a new session
  const createSessionMutation = useMutation({
    mutationFn: (payload: CreateLessonSessionRequest) =>
      createLessonSession(payload.classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      setIsCreateModalOpen(false);
      showToast('Đã tạo ca học mới thành công!');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể tạo ca học mới.';
      showToast(msg);
    },
  });

  const navigateWeek = useCallback(
    (delta: number) => {
      setCurrentWeek((prev) => {
        const next = Math.max(1, Math.min(20, prev + delta));
        showToast(t('navigatedWeekToast', { week: next }));
        return next;
      });
    },
    [showToast, t]
  );

  const goToCurrentWeek = useCallback(() => {
    const defaultWeek = getCurrentWeekNumber();
    setCurrentWeek(defaultWeek);
    showToast(t('currentWeekStatusToast', { week: defaultWeek }));
  }, [showToast, t]);

  const openSessionDetail = useCallback((session: TimetableSession) => {
    setSelectedSession(session);
    setIsDetailModalOpen(true);
  }, []);

  const closeSessionDetail = useCallback(() => {
    setIsDetailModalOpen(false);
  }, []);

  // Filter sessions according to filterType based on current week's rawTimetable
  const filteredDays = useMemo<DaySchedule[]>(() => {
    if (!rawTimetable?.days) return [];
    return rawTimetable.days.map((day) => {
      const filtered = day.sessions.filter((sess) => {
        if (filterType === 'all') return true;
        if (filterType === 'lab') return sess.sessionType === 'lab';
        if (filterType === 'theory') return sess.sessionType === 'theory';
        if (filterType === 'exam') return sess.sessionType === 'exam' || Boolean(sess.tag);
        return true;
      });
      return {
        ...day,
        sessions: filtered,
      };
    });
  }, [rawTimetable?.days, filterType]);

  const timetableData: WeeklyTimetableData = useMemo(() => {
    if (!rawTimetable) {
      return {
        weekNumber: currentWeek,
        startDate: '',
        endDate: '',
        semesterName: 'Học kỳ 1 (2026-2027)',
        facultyName: 'Khoa Công nghệ Thông tin',
        kpis: {
          totalSessions: 0,
          totalPeriods: 0,
          labSessions: 0,
          peakDay: 'Thứ 2',
          peakConsecutive: 0,
          syncTimeText: 'Đang tải...',
        },
        days: [],
      };
    }
    return {
      ...rawTimetable,
      weekNumber: currentWeek,
      days: filteredDays,
    };
  }, [rawTimetable, currentWeek, filteredDays]);

  return {
    currentWeek,
    selectedClassId,
    setSelectedClassId,
    selectedCourseId,
    setSelectedCourseId,
    filterType,
    setFilterType,
    timetableData,
    isLoading: timetableQuery.isLoading,
    isFetching: timetableQuery.isFetching,
    refetch: timetableQuery.refetch,
    selectedSession,
    isDetailModalOpen,
    isSwapRoomModalOpen,
    isExportModalOpen,
    isCreateModalOpen,
    setIsSwapRoomModalOpen,
    setIsExportModalOpen,
    setIsCreateModalOpen,
    createSessionMutation,
    openSessionDetail,
    closeSessionDetail,
    navigateWeek,
    goToCurrentWeek,
    toastMessage,
    showToast,
  };
}
