'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { CustomSelect } from '@/components/shared';
import { useUserRole } from '@/hooks/useUserRole';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { useClasses } from '@/features/classes/hooks/useClasses';
import { classDetailKeys } from '@/features/classes/constants';
import { getClassById, normalizeClassApiId } from '@/features/classes/services/class.service';
import { ApiError } from '@/types/common';
import {
  DashboardSidebar,
  DashboardHeader,
  useDashboardMode,
} from '@/features/dashboard';
import {
  useAttendances,
  useClassStudents,
  useCreateLessonSession,
  useUpdateLessonSession,
  useDeleteLessonSession,
  lessonSessionsQueryOptions,
  useLessonSessions,
  useRooms,
  useSaveAttendances,
} from '../hooks/useLessonSessions';
import {
  AttendanceStatus,
  ConflictDetails,
  CreateLessonSessionRequest,
  LessonSession,
} from '../types';
import { LessonSessionHeader } from './LessonSessionHeader';
import { LessonSessionTable } from './LessonSessionTable';
import { ConflictWarningModal } from './ConflictWarningModal';
import { AttendanceHeroBanner } from './AttendanceHeroBanner';
import { AttendanceTable } from './AttendanceTable';
import { AttendanceCockpitBar } from './AttendanceCockpitBar';
import { SessionFormModal } from './SessionFormModal';
import { TimetableGridMatrix } from '@/features/timetable/components/TimetableGridMatrix';
import {
  getCurrentWeekNumber,
  getMondayOfWeek,
  getWeekStartDate,
  formatDateShort,
  formatDateIso,
} from '@/features/timetable/services/timetable.service';
import type { DaySchedule, TimetableSession } from '@/features/timetable/types';

interface LessonSessionsPageViewProps {
  classId?: string;
}

function getWeekEndDate(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return end;
}

export const LessonSessionsPageView: React.FC<LessonSessionsPageViewProps> = ({
  classId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useTranslations('classes.detail');
  const { user, isTeacher, isAuthenticated, isLoading: isAuthenticating } = useUserRole();
  const { isFocus, toggleMode } = useDashboardMode();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();

  const isSpecificClass = Boolean(classId && classId !== 'CNTT-K21A' && classId !== 'all');
  const classesQuery = useClasses({ page: 0, size: 50 }, { enabled: isAuthenticated });
  const classesList = classesQuery.data?.items ?? [];

  const [effectiveClassId, setSelectedClassId] = useState(
    () => isSpecificClass && classId ? normalizeClassApiId(classId) : 'all'
  );

  const listedClass = classesList.find(cls => cls.id === effectiveClassId);
  const classQuery = useQuery({
    queryKey: classDetailKeys.info(effectiveClassId),
    queryFn: () => getClassById(effectiveClassId),
    enabled: isAuthenticated && classesQuery.isSuccess && effectiveClassId !== 'all' && !listedClass,
    staleTime: 5 * 60_000,
    retry: false,
  });
  const classInfo = listedClass ?? (effectiveClassId !== 'all' ? classQuery.data : undefined);
  const activeClass = classInfo ? {
    ...classInfo,
    name: classInfo.title || classInfo.name,
    code: classInfo.classCode || classInfo.code || classInfo.enrollmentKey || classInfo.name,
  } : null;

  const handleToggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, [setIsSidebarCollapsed]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'ThS. Nguyễn Văn An';

  // View state
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [currentWeek, setCurrentWeek] = useState(() => getCurrentWeekNumber());
  const [selectedSession, setSelectedSession] = useState<LessonSession | null>(null);
  const weekStartDate = useMemo(() => getWeekStartDate(currentWeek), [currentWeek]);
  const weekEndDate = useMemo(() => getWeekEndDate(weekStartDate), [weekStartDate]);
  const paramSessionId = searchParams.get('sessionId');
  const isAttendanceAction = searchParams.get('action') === 'attendance';
  const loadWeek = !isSpecificClass && viewMode === 'calendar' && !paramSessionId;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeEditingSession, setActiveEditingSession] = useState<LessonSession | null>(null);
  const [selectedCellDate, setSelectedCellDate] = useState<string | undefined>();
  const [selectedCellShift, setSelectedCellShift] = useState<number | undefined>();
  const [detailModalSession, setDetailModalSession] = useState<LessonSession | null>(null);

  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<ConflictDetails | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Queries
  const scheduleQuery = useLessonSessions(effectiveClassId, {
    canonical: true,
    enabled: isAuthenticated,
    startDate: loadWeek ? formatDateIso(weekStartDate) : undefined,
    endDate: loadWeek ? formatDateIso(weekEndDate) : undefined,
  });
  const { data: sessions = [], isLoading: isLoadingSessions } = scheduleQuery;
  const { data: rooms = [], isLoading: areRoomsLoading } = useRooms({ enabled: isFormModalOpen && isAuthenticated });
  const attendanceClassId = selectedSession?.classId ?? '';
  const studentsQuery = useClassStudents(attendanceClassId, { enabled: isAuthenticated, canonical: true });
  const attendancesQuery = useAttendances(
    attendanceClassId,
    isAuthenticated ? selectedSession?.lessonSessionId : undefined,
    { canonical: true },
  );
  const students = studentsQuery.data ?? [];
  const existingAttendances = attendancesQuery.data ?? [];
  const attendanceIsReady = studentsQuery.isSuccess && attendancesQuery.isSuccess;
  const attendanceError = studentsQuery.error ?? attendancesQuery.error;
  const handledAttendanceLinkRef = useRef<string | null>(null);
  const lastInitializedKeyRef = useRef<string>('');

  useEffect(() => {
    if (!paramSessionId && !isAttendanceAction) {
      handledAttendanceLinkRef.current = null;
      return;
    }

    const link = paramSessionId ?? 'today';
    if (handledAttendanceLinkRef.current === link) return;

    const today = formatDateIso();
    const target = sessions.find(session => paramSessionId
      ? session.lessonSessionId === paramSessionId
      : session.sessionDate === today);
    if (target) {
      handledAttendanceLinkRef.current = link;
      setSelectedSession(target);
    }
  }, [sessions, paramSessionId, isAttendanceAction]);

  // Mutations
  const createSessionMutation = useCreateLessonSession(effectiveClassId);
  const updateSessionMutation = useUpdateLessonSession(effectiveClassId);
  const deleteSessionMutation = useDeleteLessonSession(effectiveClassId);
  const saveAttendancesMutation = useSaveAttendances(
    attendanceClassId,
    selectedSession?.lessonSessionId || ''
  );

  // Attendance Map
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus | null; note: string }>
  >({});

  useEffect(() => {
    if (!selectedSession || !attendanceIsReady || students.length === 0) return;

    const currentSessionId = selectedSession.lessonSessionId;
    const attSignature = existingAttendances
      .map((a) => `${a.studentId}:${a.status}:${a.note || ''}`)
      .join('|');
    const initKey = `${currentSessionId}_${students.length}_${attSignature}`;

    if (lastInitializedKeyRef.current === initKey) return;
    lastInitializedKeyRef.current = initKey;

    const initialMap: Record<string, { status: AttendanceStatus | null; note: string }> = {};
    students.forEach((stu) => {
      const rec = existingAttendances.find((a) => a.studentId === stu.studentId);
      initialMap[stu.studentId] = {
        status: rec ? rec.status : null,
        note: rec?.note || '',
      };
    });
    setAttendanceMap(initialMap);
    setIsLocked(false);
  }, [selectedSession, students, existingAttendances, attendanceIsReady]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus | null) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
    setIsLocked(false);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], note },
    }));
    setIsLocked(false);
  };

  const handleMarkAllPresent = () => {
    setAttendanceMap((prev) => {
      const updated: typeof prev = {};
      students.forEach((stu) => {
        updated[stu.studentId] = {
          status: 'PRESENT',
          note: prev[stu.studentId]?.note || '',
        };
      });
      return updated;
    });
    setIsLocked(false);
    showToast(`Đã đánh dấu tất cả ${students.length} sinh viên Có mặt!`);
  };

  const handleTriggerConflict = (details: ConflictDetails) => {
    setIsFormModalOpen(false);
    setConflictDetails(details);
    setIsConflictModalOpen(true);
  };

  const handleOpenCreateModal = (date?: string, shift?: number) => {
    if (effectiveClassId === 'all') {
      showToast(t('selectClassForLessonSession'));
      return;
    }
    setSelectedCellDate(date || formatDateIso());
    setSelectedCellShift(shift || 1);
    setFormMode('create');
    setActiveEditingSession(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (session: LessonSession) => {
    setActiveEditingSession(session);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (payload: CreateLessonSessionRequest) => {
    if (formMode === 'create') {
      await createSessionMutation.mutateAsync(payload);
      showToast('Đã tạo thành công ca học mới!');
    } else if (formMode === 'edit' && activeEditingSession) {
      await updateSessionMutation.mutateAsync({
        lessonSessionId: activeEditingSession.lessonSessionId,
        targetClassId: activeEditingSession.classId,
        payload,
      });
      showToast('Đã cập nhật ca học thành công!');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const target = [activeEditingSession, detailModalSession, ...sessions]
      .find(session => session?.lessonSessionId === sessionId);
    if (!target) return;
    await deleteSessionMutation.mutateAsync({
      lessonSessionId: sessionId,
      targetClassId: target.classId,
      force: true,
    });
    setDetailModalSession(null);
    showToast('Đã xóa ca học thành công!');
  };

  const handleSaveDraft = async () => {
    if (!selectedSession) return;
    const list = Object.entries(attendanceMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      note: data.note,
    }));
    const checked = list.filter((a) => a.status !== null && a.status !== undefined).length;
    const total = students.length || selectedSession.totalStudents || 0;
    const newStatus = checked >= total && total > 0 ? 'COMPLETED' : 'IN_PROGRESS';
    await saveAttendancesMutation.mutateAsync({
      attendances: list,
      status: newStatus,
    });
    showToast('Đã lưu nháp bảng điểm danh!');
  };

  const handleLockSession = async () => {
    if (!selectedSession) return;
    const list = Object.entries(attendanceMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      note: data.note,
    }));
    const checked = list.filter((a) => a.status !== null && a.status !== undefined).length;
    const total = students.length || selectedSession.totalStudents || 0;
    const newStatus = checked >= total && total > 0 ? 'COMPLETED' : 'IN_PROGRESS';
    await saveAttendancesMutation.mutateAsync({
      attendances: list,
      status: newStatus,
    });
    setIsLocked(true);
    showToast('Đã chốt thành công danh sách điểm danh!');
  };

  const handleBackToList = () => {
    if (paramSessionId || isAttendanceAction) {
      const url = new URL(window.location.href);
      url.searchParams.delete('sessionId');
      if (isAttendanceAction) url.searchParams.delete('action');
      window.history.replaceState(null, '', url);
    }
    setSelectedSession(null);
  };

  const handleTodayAttendance = async () => {
    const now = new Date();
    const today = formatDateIso(now);
    const isWeekInView = today >= formatDateIso(weekStartDate) && today <= formatDateIso(weekEndDate);
    try {
      let available = sessions;
      if (loadWeek && !isWeekInView) {
        const currentWeekStart = getMondayOfWeek(now);
        available = await queryClient.fetchQuery(lessonSessionsQueryOptions(effectiveClassId, {
          canonical: true,
          startDate: formatDateIso(currentWeekStart),
          endDate: formatDateIso(getWeekEndDate(currentWeekStart)),
        }));
      }
      const todaySession = available.find(session => session.sessionDate === today);
      if (todaySession) setSelectedSession(todaySession);
      else showToast(t('noLessonSessionsToday'));
    } catch {
      showToast(t('classSessionsLoadError'));
    }
  };

  const daysSchedule = useMemo<DaySchedule[]>(() => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIso = formatDateIso();
    const days: DaySchedule[] = [];

    for (let offset = 0; offset < 7; offset++) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + offset);
      const fullDate = formatDateIso(d);
      const dateString = formatDateShort(d);
      const dayOfWeek = d.getDay();

      const matchedSessions = sessions
        .filter((s) => s.sessionDate === fullDate)
        .map(
          (s): TimetableSession => ({
            lessonSessionId: s.lessonSessionId,
            classId: s.classId,
            className: `${activeClass?.name || s.className} (${s.note || s.sessionCode || 'Ca học'})`,
            sessionDate: s.sessionDate,
            startTime: s.startTime,
            endTime: s.endTime,
            roomName: s.roomName,
            roomShort: s.roomName.replace(/^phòng\s*/i, ''),
            note: s.note,
            studentsCount: s.totalStudents ?? 0,
            status: s.status,
            sessionType: (s.note?.toLowerCase().includes('lab') ? 'lab' : 'theory') as 'theory' | 'lab' | 'exam',
            dayOfWeek,
            startShift: s.startShift || 1,
            endShift: s.endShift || 3,
          })
        );

      days.push({
        dayOfWeek,
        dayNameKey: dayNames[dayOfWeek],
        dateString,
        fullDate,
        isToday: fullDate === todayIso,
        sessions: matchedSessions,
      });
    }
    return days;
  }, [weekStartDate, sessions, activeClass?.name]);

  const handleSelectGridSession = (ts: TimetableSession) => {
    const rawMatch = sessions.find((s) => s.lessonSessionId === ts.lessonSessionId);
    if (rawMatch) {
      setDetailModalSession(rawMatch);
    }
  };

  // Telemetry counts
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'PRESENT').length;
  const lateCount = Object.values(attendanceMap).filter((a) => a.status === 'LATE').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'ABSENT').length;
  const excusedCount = Object.values(attendanceMap).filter((a) => a.status === 'EXCUSED').length;
  const checkedCount = Object.values(attendanceMap).filter(
    (a) => a.status !== null && a.status !== undefined
  ).length;
  const totalCount = students.length;
  const presenceRate =
    totalCount > 0 ? (((presentCount + lateCount) / totalCount) * 100).toFixed(1) : '0';
  const attendanceSessions = selectedSession && !sessions.some(session => session.lessonSessionId === selectedSession.lessonSessionId)
    ? [selectedSession, ...sessions]
    : sessions;

  const sidebarPaddingClass =
    isFocus || isSidebarCollapsed ? 'left-0 sm:left-[72px]' : 'left-0 sm:left-64';

  return (
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] transition-colors font-sans">
      <DashboardSidebar
        isFocus={isFocus}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      <div className={`transition-all duration-300 pl-0 ${isFocus || isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <DashboardHeader
          isFocus={isFocus}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleMode={toggleMode}
          userFullName={userFullName}
          title={isSpecificClass ? 'Ca học & Điểm danh' : 'Lịch trình cá nhân'}
        />

        {toastMsg && (
          <div className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-full bg-white dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#E3E3E3] px-5 py-3 shadow-xl border-none">
            <span className="material-symbols-outlined text-[20px] text-[#0D652D] dark:text-[#81C995]">
              check_circle
            </span>
            <span className="text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">{toastMsg}</span>
          </div>
        )}

        <main className={`w-full min-h-screen ${isFocus ? 'pt-14' : 'pt-16'} pb-28`}>
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6">
            {!selectedSession ? (
              <>
                {isSpecificClass ? (
                  <LessonSessionHeader
                    activeClass={activeClass}
                    classesList={classesList}
                    selectedClassId={effectiveClassId}
                    onSelectClassId={(id) => setSelectedClassId(id)}
                    totalSessionsCount={sessions.length}
                    completedSessionsCount={sessions.filter((s) => s.status === 'COMPLETED').length}
                    attendanceRate={
                      sessions.length > 0
                        ? (sessions.reduce(
                            (acc, s) =>
                              acc +
                              (s.totalStudents && s.totalStudents > 0
                                ? (s.attendedCount ?? 0) / s.totalStudents
                                : 1),
                            0
                          ) /
                            sessions.length) *
                          100
                        : 0
                    }
                    onBackToClasses={() => {
                      if (effectiveClassId && effectiveClassId !== 'all') {
                        router.push(`/classes/${effectiveClassId}?tab=sessions`);
                      } else {
                        router.push('/classes');
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
                      Lịch trình cá nhân
                    </h1>
                    <p className="text-xs sm:text-sm text-[#444746] dark:text-[#8E918F]">
                      Tổng hợp lịch học và lịch giảng dạy của bạn theo tuần
                    </p>
                  </div>
                )}

                {/* View switcher & Quick Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1E1F20] p-4 rounded-3xl shadow-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center p-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]">
                      <button
                        type="button"
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
                          viewMode === 'calendar'
                            ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                            : 'text-slate-600 dark:text-[#C4C7C5]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">calendar_month</span>
                        <span>Dạng lịch</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
                          viewMode === 'table'
                            ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                            : 'text-slate-600 dark:text-[#C4C7C5]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">view_list</span>
                        <span>Dạng danh sách</span>
                      </button>
                    </div>

                    {!isSpecificClass && (
                      <div className="min-w-[220px]">
                        <CustomSelect
                          value={effectiveClassId}
                          onChange={(val) => setSelectedClassId(val)}
                          options={[
                            { value: 'all', label: `Tất cả lớp học (${classesList.length})` },
                            ...classesList.map((cls) => ({
                              value: cls.id,
                              label: cls.code ? `${cls.code} · ${cls.name}` : cls.name,
                            })),
                          ]}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isTeacher && (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleTodayAttendance()}
                          disabled={!isAuthenticated || isLoadingSessions || scheduleQuery.isError}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold shadow-xs transition-all border-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                          <span>Điểm danh hôm nay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCreateModal()}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B57D0] text-white hover:bg-[#0842a0] text-xs font-semibold shadow-xs transition-all border-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          <span>+ Thêm ca học</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!isAuthenticated ? (
                  <p role="status" className="rounded-3xl bg-surface p-6 text-sm">
                    {t(isAuthenticating ? 'lessonScheduleLoading' : 'classOverviewSignIn')}
                  </p>
                ) : scheduleQuery.isError ? (
                  <div role="alert" className="rounded-3xl bg-surface p-6 text-sm">
                    <p>{t(scheduleQuery.error instanceof ApiError && scheduleQuery.error.httpStatus === 403
                      ? 'classSessionsForbidden' : 'classSessionsLoadError')}</p>
                    <button type="button" onClick={() => void scheduleQuery.refetch()} className="mt-3 font-semibold text-primary">
                      {t('retryClassContent')}
                    </button>
                  </div>
                ) : viewMode === 'calendar' ? (
                  <div className="space-y-4">
                    {/* Week navigation */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1E1F20] px-5 py-3 rounded-2xl shadow-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentWeek((w) => Math.max(1, w - 1))}
                          className="w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-slate-200 dark:hover:bg-[#333537] flex items-center justify-center text-slate-700 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer"
                          title="Tuần trước"
                        >
                          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-[#E3E3E3] min-w-[170px] text-center font-mono">
                          Tuần {currentWeek} ({formatDateShort(weekStartDate)} - {formatDateShort(weekEndDate)})
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentWeek((w) => Math.min(20, w + 1))}
                          className="w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-slate-200 dark:hover:bg-[#333537] flex items-center justify-center text-slate-700 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer"
                          title="Tuần sau"
                        >
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentWeek(getCurrentWeekNumber())}
                        className="px-3.5 py-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-slate-200 dark:hover:bg-[#333537] text-xs font-semibold text-slate-700 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer"
                      >
                        Tuần hiện tại
                      </button>
                    </div>

                    {isLoadingSessions ? (
                      <p role="status" className="rounded-3xl bg-surface p-6 text-sm">{t('lessonScheduleLoading')}</p>
                    ) : (
                      <TimetableGridMatrix days={daysSchedule} onSelectSession={handleSelectGridSession} />
                    )}
                  </div>
                ) : (
                  <LessonSessionTable
                    sessions={sessions}
                    isLoading={isLoadingSessions}
                    isTeacher={isTeacher}
                    onSelectAttendance={isTeacher ? (session) => setSelectedSession(session) : undefined}
                    onOpenCreateModal={() => handleOpenCreateModal()}
                    onEditSession={(session) => handleOpenEditModal(session)}
                    onDeleteSession={(session) => handleDeleteSession(session.lessonSessionId)}
                  />
                )}
              </>
            ) : !attendanceIsReady ? (
              <div role={attendanceError ? 'alert' : 'status'} className="rounded-3xl bg-surface p-6 text-sm">
                <p>{t(attendanceError ? 'lessonAttendanceLoadError' : 'lessonAttendanceLoading')}</p>
                <div className="mt-3 flex gap-4">
                  <button type="button" onClick={handleBackToList} className="font-semibold text-primary">
                    {t('viewClassSchedule')}
                  </button>
                  {attendanceError && (
                    <button type="button" onClick={() => {
                      if (studentsQuery.isError) void studentsQuery.refetch();
                      if (attendancesQuery.isError) void attendancesQuery.refetch();
                    }} className="font-semibold text-primary">
                      {t('retryClassContent')}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <AttendanceHeroBanner
                  session={selectedSession}
                  sessions={attendanceSessions}
                  onSelectSession={(sessionId) => {
                    const found = attendanceSessions.find((s) => s.lessonSessionId === sessionId);
                    if (found) setSelectedSession(found);
                  }}
                  onBack={handleBackToList}
                  onMarkAllPresent={handleMarkAllPresent}
                  onRefresh={() => {
                    void attendancesQuery.refetch();
                    showToast('Đã làm mới dữ liệu ca học!');
                  }}
                  totalStudents={totalCount}
                  checkedCount={checkedCount}
                  presentCount={presentCount}
                  lateCount={lateCount}
                  absentCount={absentCount}
                  excusedCount={excusedCount}
                  isLocked={isLocked}
                />
                <AttendanceTable
                  students={students}
                  attendanceMap={attendanceMap}
                  onStatusChange={handleStatusChange}
                  onNoteChange={handleNoteChange}
                  onBack={handleBackToList}
                />
                {totalCount > 0 && (
                  <AttendanceCockpitBar
                    totalCount={totalCount}
                    checkedCount={checkedCount}
                    presenceRate={presenceRate}
                    onBack={handleBackToList}
                    onSaveDraft={handleSaveDraft}
                    onLockSession={handleLockSession}
                    isSaving={saveAttendancesMutation.isPending}
                    isLocked={isLocked}
                    sidebarPaddingClass={sidebarPaddingClass}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Calendar Card Detail Popover Modal */}
      {detailModalSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDetailModalSession(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-2xl border-none space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA]">
                  event_available
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-[#E3E3E3]">
                  Thông tin Ca học
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalSession(null)}
                className="w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-gray-600 dark:text-[#C4C7C5] border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                  {detailModalSession.sessionCode || `#${detailModalSession.lessonSessionId}`}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    detailModalSession.status === 'COMPLETED'
                      ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]'
                      : 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                  }`}
                >
                  {detailModalSession.status === 'COMPLETED' ? 'Đã điểm danh' : 'Đang học / Lên lịch'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3]">
                {activeClass?.name || detailModalSession.className}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-[#C4C7C5] pt-1">
                <div>
                  <span className="block text-[11px] text-slate-400">Thời gian:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailModalSession.sessionDate} • {detailModalSession.startTime}-{detailModalSession.endTime} (Tiết {detailModalSession.startShift}-{detailModalSession.endShift})
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">Phòng học:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailModalSession.roomName}
                  </span>
                </div>
              </div>
              {detailModalSession.note && (
                <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500 block">Nội dung:</span>
                  <span>{detailModalSession.note}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const sess = detailModalSession;
                    setDetailModalSession(null);
                    handleOpenEditModal(sess);
                  }}
                  className="px-3.5 py-2 rounded-full bg-[#F0F4F9] hover:bg-slate-200 dark:bg-[#282A2C] text-xs font-semibold text-slate-700 dark:text-[#C4C7C5] flex items-center gap-1 border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Sửa ca</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSession(detailModalSession.lessonSessionId)}
                  className="px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Xóa</span>
                </button>
              </div>

              {isTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    const s = detailModalSession;
                    setDetailModalSession(null);
                    setSelectedSession(s);
                  }}
                  className="px-5 py-2 rounded-full bg-[#0B57D0] text-white hover:bg-[#0842a0] dark:bg-[#A8C7FA] dark:text-[#062E6F] text-xs font-semibold flex items-center gap-1.5 border-none cursor-pointer ml-auto"
                >
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                  <span>Điểm danh ca này</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Universal Session Form Modal (Create / Edit / Delete) */}
      <SessionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        mode={formMode}
        session={activeEditingSession}
        rooms={rooms}
        roomsLoading={areRoomsLoading}
        existingSessions={sessions}
        defaultDate={selectedCellDate}
        defaultShift={selectedCellShift}
        isSubmitting={createSessionMutation.isPending || updateSessionMutation.isPending}
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteSession}
        onTriggerConflict={handleTriggerConflict}
      />

      <ConflictWarningModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        onSelectAlternativeRoom={(newRoom) => {
          setIsConflictModalOpen(false);
          setIsFormModalOpen(true);
        }}
        onApplyNewTime={(start, end) => {
          setIsConflictModalOpen(false);
          setIsFormModalOpen(true);
        }}
        onEditConflict={() => {
          setIsConflictModalOpen(false);
          setIsFormModalOpen(true);
        }}
        conflictDetails={conflictDetails}
      />
    </div>
  );
};
