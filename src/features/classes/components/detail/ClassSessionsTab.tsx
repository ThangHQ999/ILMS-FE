'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { ClassItem } from '../../schemas/class.schema';
import {
  useLessonSessions,
  useRooms,
  useClassStudents,
  useAttendances,
  useCreateLessonSession,
  useUpdateLessonSession,
  useDeleteLessonSession,
  useSaveAttendances,
  AttendanceHeroBanner,
  AttendanceTable,
  AttendanceCockpitBar,
  LessonSessionTable,
  SessionFormModal,
  AttendanceStatus,
  LessonSession,
  CreateLessonSessionRequest,
  lessonSessionKeys,
} from '@/features/lesson-sessions';
import { TimetableGridMatrix } from '@/features/timetable/components/TimetableGridMatrix';
import {
  getCurrentWeekNumber,
  getWeekStartDate,
  getMondayOfWeek,
  formatDateShort,
  formatDateIso,
} from '@/features/timetable/services/timetable.service';
import type { DaySchedule, TimetableSession } from '@/features/timetable/types';

interface ClassSessionsTabProps {
  classId: string;
  classInfo: ClassItem;
  currentRole: 'student' | 'teacher' | 'owner';
  onToast: (msg: string) => void;
}

export function ClassSessionsTab({
  classId,
  classInfo,
  currentRole,
  onToast,
}: ClassSessionsTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isTeacher = currentRole !== 'student';
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [currentWeek, setCurrentWeek] = useState(() => getCurrentWeekNumber());

  // Helper to check for raw UUID strings
  const isUuid = useCallback((val?: string | null) => {
    return Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim()));
  }, []);

  // Queries
  const { data: sessions = [], isLoading: isLoadingSessions } = useLessonSessions(classId);
  const { data: rooms = [] } = useRooms();
  const { data: students = [] } = useClassStudents(classId);

  // Selected session for attendance
  const [selectedAttendanceSession, setSelectedAttendanceSession] = useState<LessonSession | null>(
    null
  );
  const [isLocked, setIsLocked] = useState(false);

  // Modal states for Create / Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeEditingSession, setActiveEditingSession] = useState<LessonSession | null>(null);
  const [selectedCellDate, setSelectedCellDate] = useState<string | undefined>();
  const [selectedCellShift, setSelectedCellShift] = useState<number | undefined>();

  // Detail / Quick Action popover for calendar card click
  const [detailSession, setDetailSession] = useState<LessonSession | null>(null);

  // Mutations
  const createMutation = useCreateLessonSession(classId);
  const updateMutation = useUpdateLessonSession(classId);
  const deleteMutation = useDeleteLessonSession(classId);
  const saveAttendancesMutation = useSaveAttendances(
    classId,
    selectedAttendanceSession?.lessonSessionId || ''
  );

  const { data: existingAttendances = [] } = useAttendances(
    classId,
    selectedAttendanceSession?.lessonSessionId
  );

  // Handle URL query ?action=attendance or ?sessionId=...
  const paramSessionId = searchParams?.get('sessionId') || null;
  const isAttendanceAction = searchParams?.get('action') === 'attendance';

  // Navigation handlers that sync attendance state seamlessly with URL
  const handleSelectAttendanceSession = useCallback(
    (session: LessonSession) => {
      setSelectedAttendanceSession(session);
      const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
      params.set('tab', 'sessions');
      params.set('action', 'attendance');
      params.set('sessionId', session.lessonSessionId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, pathname]
  );

  const handleSelectSessionFromDropdown = useCallback(
    (sessionId: string) => {
      const found = sessions.find((s) => s.lessonSessionId === sessionId);
      if (found) {
        setSelectedAttendanceSession(found);
        const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
        params.set('tab', 'sessions');
        params.set('action', 'attendance');
        params.set('sessionId', found.lessonSessionId);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [sessions, router, searchParams, pathname]
  );

  const handleBackToList = useCallback(() => {
    setSelectedAttendanceSession(null);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('tab', 'sessions');
    params.delete('action');
    params.delete('sessionId');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [router, searchParams, pathname]);

  // Two-way synchronization between URL params and selected attendance session
  useEffect(() => {
    if (sessions.length === 0) return;

    // Case 1: URL has a specific sessionId
    if (paramSessionId) {
      const match = sessions.find((s) => s.lessonSessionId === paramSessionId);
      if (match) {
        if (selectedAttendanceSession?.lessonSessionId !== paramSessionId) {
          setSelectedAttendanceSession(match);
        }
        return;
      }
    }

    // Case 2: URL has ?action=attendance without sessionId
    if (isAttendanceAction) {
      const todayIso = formatDateIso();
      const todaySession =
        sessions.find((s) => s.sessionDate === todayIso) ||
        sessions.find((s) => s.status === 'IN_PROGRESS') ||
        sessions[0];
      if (todaySession) {
        if (selectedAttendanceSession?.lessonSessionId !== todaySession.lessonSessionId) {
          setSelectedAttendanceSession(todaySession);
        }
        if (!paramSessionId) {
          const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
          params.set('tab', 'sessions');
          params.set('action', 'attendance');
          params.set('sessionId', todaySession.lessonSessionId);
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
      }
      return;
    }

    // Case 3: URL has neither ?action=attendance nor sessionId, reset attendance if open
    if (!paramSessionId && !isAttendanceAction && selectedAttendanceSession !== null) {
      setSelectedAttendanceSession(null);
    }
  }, [sessions, paramSessionId, isAttendanceAction, selectedAttendanceSession, searchParams, pathname, router]);

  // Attendance state
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus | null; note: string }>
  >({});
  const lastInitializedKeyRef = useRef<string>('');

  useEffect(() => {
    if (!selectedAttendanceSession || students.length === 0) return;

    const currentSessionId = selectedAttendanceSession.lessonSessionId;
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
  }, [selectedAttendanceSession, students, existingAttendances]);

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
    onToast(`Đã đánh dấu tất cả ${students.length} sinh viên Có mặt!`);
  };

  const handleSaveDraft = async () => {
    if (!selectedAttendanceSession) return;
    const list = Object.entries(attendanceMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      note: data.note,
    }));
    const checked = list.filter((a) => a.status !== null && a.status !== undefined).length;
    const total = students.length || selectedAttendanceSession.totalStudents || 45;
    const newStatus = checked >= total && total > 0 ? 'COMPLETED' : 'IN_PROGRESS';
    await saveAttendancesMutation.mutateAsync({
      attendances: list,
      status: newStatus,
    });
    onToast('Đã lưu nháp bảng điểm danh!');
  };

  const handleLockSession = async () => {
    if (!selectedAttendanceSession) return;
    const list = Object.entries(attendanceMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      note: data.note,
    }));
    const checked = list.filter((a) => a.status !== null && a.status !== undefined).length;
    const total = students.length || selectedAttendanceSession.totalStudents || 45;
    const newStatus = checked >= total && total > 0 ? 'COMPLETED' : 'IN_PROGRESS';
    await saveAttendancesMutation.mutateAsync({
      attendances: list,
      status: newStatus,
    });
    setIsLocked(true);
    onToast('Đã chốt thành công danh sách điểm danh!');
  };

  // Calendar week calculations
  const weekStartDate = useMemo(() => getWeekStartDate(currentWeek), [currentWeek]);
  const weekEndDate = useMemo(() => {
    const end = new Date(weekStartDate);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStartDate]);

  const daysSchedule = useMemo<DaySchedule[]>(() => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIso = formatDateIso();
    const days: DaySchedule[] = [];

    // Monday (0) to Sunday (6)
    for (let offset = 0; offset < 7; offset++) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + offset);
      const fullDate = formatDateIso(d);
      const dateString = formatDateShort(d);
      const dayOfWeek = d.getDay();

      const matchedSessions = sessions
        .filter((s) => s.sessionDate === fullDate)
        .map(
          (s): TimetableSession => {
            const rawName = s.className && !isUuid(s.className) ? s.className : '';
            const rawTitle = classInfo.title && !isUuid(classInfo.title) ? classInfo.title : '';
            const fallbackName = classInfo.name && !isUuid(classInfo.name) ? classInfo.name : 'Lập trình Web nâng cao';
            const baseTitle = rawName || rawTitle || fallbackName;

            const isTechnical = Boolean(s.note && (/^CA-?\d+$/i.test(s.note.trim()) || /^SES-?\d+/i.test(s.note.trim()) || isUuid(s.note)));
            const shiftLabel = `Tiết ${s.startShift || 1}-${s.endShift || 3}`;
            const noteText = s.note && !isTechnical ? s.note : shiftLabel;

            const safeRoom =
              !s.roomName || isUuid(s.roomName)
                ? rooms.find((r) => r.roomId === s.roomName)?.roomName || 'Phòng B2-302'
                : s.roomName;

            return {
              lessonSessionId: s.lessonSessionId,
              classId: s.classId,
              className: `${baseTitle} (${noteText})`,
              sessionDate: s.sessionDate,
              startTime: s.startTime,
              endTime: s.endTime,
              roomName: safeRoom,
              roomShort: safeRoom.replace(/^phòng\s*/i, ''),
              note: s.note,
              studentsCount: s.totalStudents || students.length || 45,
              status: s.status,
              sessionType: (s.note?.toLowerCase().includes('lab') ? 'lab' : 'theory') as 'theory' | 'lab' | 'exam',
              dayOfWeek,
              startShift: s.startShift || 1,
              endShift: s.endShift || 3,
            };
          }
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
  }, [weekStartDate, sessions, classInfo, students.length, isUuid]);

  // Open create modal
  const handleOpenCreate = (date?: string, shift?: number) => {
    setSelectedCellDate(date || formatDateIso());
    setSelectedCellShift(shift || 1);
    setFormMode('create');
    setActiveEditingSession(null);
    setIsFormModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (session: LessonSession) => {
    setActiveEditingSession(session);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  // Submit create or edit
  const handleFormSubmit = async (dto: CreateLessonSessionRequest) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(dto);
      onToast('Đã tạo thành công ca học mới!');
    } else if (formMode === 'edit' && activeEditingSession) {
      await updateMutation.mutateAsync({
        lessonSessionId: activeEditingSession.lessonSessionId,
        payload: dto,
      });
      onToast('Đã cập nhật ca học thành công!');
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string) => {
    await deleteMutation.mutateAsync({ lessonSessionId: sessionId, force: true });
    setDetailSession(null);
    onToast('Đã xóa ca học khỏi thời khóa biểu!');
  };

  // Select a session from timetable grid
  const handleSelectGridSession = (ts: TimetableSession) => {
    const rawMatch = sessions.find((s) => s.lessonSessionId === ts.lessonSessionId);
    if (rawMatch) {
      setDetailSession(rawMatch);
    }
  };

  // Attendance metrics
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'PRESENT').length;
  const lateCount = Object.values(attendanceMap).filter((a) => a.status === 'LATE').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'ABSENT').length;
  const excusedCount = Object.values(attendanceMap).filter((a) => a.status === 'EXCUSED').length;
  const checkedCount = Object.values(attendanceMap).filter(
    (a) => a.status !== null && a.status !== undefined
  ).length;
  const totalCount = students.length || classInfo.enrolledCount || 45;
  const presenceRate =
    totalCount > 0 ? (((presentCount + lateCount) / totalCount) * 100).toFixed(1) : '0';

  // If attendance mode is active
  if (selectedAttendanceSession) {
    return (
      <div className="space-y-6 pt-2 pb-24">
        <AttendanceHeroBanner
          session={selectedAttendanceSession}
          sessions={sessions}
          onSelectSession={handleSelectSessionFromDropdown}
          onBack={handleBackToList}
          onMarkAllPresent={handleMarkAllPresent}
          onRefresh={() => {
            queryClient.invalidateQueries({
              queryKey: lessonSessionKeys.attendances(
                classId,
                selectedAttendanceSession.lessonSessionId
              ),
            });
            onToast('Đã làm mới dữ liệu ca học!');
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
        />

        <AttendanceCockpitBar
          totalCount={totalCount}
          checkedCount={checkedCount}
          presenceRate={presenceRate}
          onBack={handleBackToList}
          onSaveDraft={handleSaveDraft}
          onLockSession={handleLockSession}
          isSaving={saveAttendancesMutation.isPending}
          isLocked={isLocked}
          sidebarPaddingClass="left-0 sm:left-64"
        />
      </div>
    );
  }

  const completedSessionsCount = sessions.filter((s) => s.status === 'COMPLETED').length;
  const classDisplayName =
    (!isUuid(classInfo.title) && classInfo.title) ||
    (!isUuid(classInfo.name) && classInfo.name) ||
    'Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)';

  return (
    <div className="space-y-6 pt-2">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#1E1F20] p-5 rounded-3xl border-none shadow-xs">
        {/* Left Telemetry */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
              Lịch &amp; Ca học của lớp
            </h2>
            <span className="px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs font-semibold whitespace-nowrap">
              {sessions.length} ca học
            </span>
            <span className="px-3 py-1 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-xs font-medium whitespace-nowrap">
              {completedSessionsCount} đã hoàn thành
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8E918F]">
            Theo dõi thời khóa biểu, sắp xếp ca học và tiến hành điểm danh học viên cho lớp {classDisplayName}
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
          {/* View Toggle: Calendar vs Table */}
          <div className="flex items-center p-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${viewMode === 'calendar'
                  ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                  : 'text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[17px]">calendar_month</span>
              <span>Dạng lịch</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${viewMode === 'table'
                  ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                  : 'text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[17px]">view_list</span>
              <span>Dạng danh sách</span>
            </button>
          </div>

          {/* Điểm danh hôm nay button */}
          <button
            type="button"
            onClick={() => {
              const todayIso = formatDateIso();
              const todaySess =
                sessions.find((s) => s.sessionDate === todayIso) ||
                sessions.find((s) => s.status === 'IN_PROGRESS') ||
                sessions[0];
              if (todaySess) {
                handleSelectAttendanceSession(todaySess);
              } else {
                onToast('Chưa có ca học nào được lên lịch cho lớp!');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold shadow-xs transition-all border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            <span>Điểm danh hôm nay</span>
          </button>

          {/* + Lên lịch học */}
          {isTeacher && (
            <button
              type="button"
              onClick={() => handleOpenCreate()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B57D0] text-white hover:bg-[#0842a0] text-xs font-semibold shadow-xs transition-all border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Thêm ca học</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content View: Calendar Grid vs Table */}
      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          {/* Week Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1E1F20] px-5 py-3 rounded-2xl border-none shadow-xs">
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentWeek(getCurrentWeekNumber())}
                className="px-3.5 py-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-slate-200 dark:hover:bg-[#333537] text-xs font-semibold text-slate-700 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer"
              >
                Tuần hiện tại
              </button>
            </div>
          </div>

          {/* Timetable Grid */}
          <TimetableGridMatrix
            days={daysSchedule}
            onSelectSession={handleSelectGridSession}
          />
        </div>
      ) : (
        <LessonSessionTable
          sessions={sessions}
          isLoading={isLoadingSessions}
          onSelectAttendance={handleSelectAttendanceSession}
          onOpenCreateModal={() => handleOpenCreate()}
          onEditSession={(session) => handleOpenEdit(session)}
          onDeleteSession={(session) => handleDeleteSession(session.lessonSessionId)}
        />
      )}

      {/* 3. Session Detail Modal on Calendar Card Click */}
      {detailSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDetailSession(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-2xl border-none space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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
                onClick={() => setDetailSession(null)}
                className="w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-gray-600 dark:text-[#C4C7C5] border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Session Info Details */}
            <div className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                  {detailSession.sessionCode || `#${detailSession.lessonSessionId}`}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${detailSession.status === 'COMPLETED'
                      ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]'
                      : 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                    }`}
                >
                  {detailSession.status === 'COMPLETED' ? 'Đã điểm danh' : 'Đang học / Lên lịch'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3]">
                {(!isUuid(detailSession.className) && detailSession.className) || (!isUuid(classInfo.title) && classInfo.title) || 'Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)'}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-[#C4C7C5] pt-1">
                <div>
                  <span className="block text-[11px] text-slate-400">Thời gian:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailSession.sessionDate} • {detailSession.startTime}-{detailSession.endTime} (Tiết {detailSession.startShift}-{detailSession.endShift})
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">Phòng học:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {!detailSession.roomName || isUuid(detailSession.roomName)
                      ? rooms.find((r) => r.roomId === detailSession.roomName)?.roomName || 'Phòng B2-302'
                      : detailSession.roomName}
                  </span>
                </div>
              </div>
              {detailSession.note && (
                <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500 block">Nội dung:</span>
                  <span>{detailSession.note}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              {isTeacher && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const sess = detailSession;
                      setDetailSession(null);
                      handleOpenEdit(sess);
                    }}
                    className="px-3.5 py-2 rounded-full bg-[#F0F4F9] hover:bg-slate-200 dark:bg-[#282A2C] text-xs font-semibold text-slate-700 dark:text-[#C4C7C5] flex items-center gap-1 border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Sửa ca</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(detailSession.lessonSessionId)}
                    className="px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Xóa</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const s = detailSession;
                  setDetailSession(null);
                  handleSelectAttendanceSession(s);
                }}
                className="px-5 py-2 rounded-full bg-[#0B57D0] text-white hover:bg-[#0842a0] dark:bg-[#A8C7FA] dark:text-[#062E6F] text-xs font-semibold flex items-center gap-1.5 border-none cursor-pointer ml-auto"
              >
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>Điểm danh ca này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Universal Create / Edit Session Modal */}
      <SessionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        mode={formMode}
        session={activeEditingSession}
        rooms={rooms}
        existingSessions={sessions}
        defaultDate={selectedCellDate}
        defaultShift={selectedCellShift}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteSession}
      />
    </div>
  );
}
