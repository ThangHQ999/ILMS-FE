'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  TimetableSession,
  TimetableFilterType,
  WeeklyTimetableData,
  DaySchedule,
} from '../types';
import { MOCK_WEEKLY_TIMETABLE_DATA } from '../constants';

export function useWeeklyTimetable() {
  const t = useTranslations('timetable');
  const [currentWeek, setCurrentWeek] = useState(9);
  const [filterType, setFilterType] = useState<TimetableFilterType>('all');
  const [selectedSession, setSelectedSession] = useState<TimetableSession | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSwapRoomModalOpen, setIsSwapRoomModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

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
    setCurrentWeek(9);
    showToast(t('currentWeekStatusToast', { week: 9 }));
  }, [showToast, t]);

  const openSessionDetail = useCallback((session: TimetableSession) => {
    setSelectedSession(session);
    setIsDetailModalOpen(true);
  }, []);

  const closeSessionDetail = useCallback(() => {
    setIsDetailModalOpen(false);
  }, []);

  // Filter sessions according to filterType
  const filteredDays = useMemo<DaySchedule[]>(() => {
    return MOCK_WEEKLY_TIMETABLE_DATA.days.map((day) => {
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
  }, [filterType]);

  const timetableData: WeeklyTimetableData = useMemo(() => {
    return {
      ...MOCK_WEEKLY_TIMETABLE_DATA,
      weekNumber: currentWeek,
      days: filteredDays,
    };
  }, [currentWeek, filteredDays]);

  return {
    currentWeek,
    filterType,
    setFilterType,
    timetableData,
    selectedSession,
    isDetailModalOpen,
    isSwapRoomModalOpen,
    isExportModalOpen,
    setIsSwapRoomModalOpen,
    setIsExportModalOpen,
    openSessionDetail,
    closeSessionDetail,
    navigateWeek,
    goToCurrentWeek,
    toastMessage,
    showToast,
  };
}

