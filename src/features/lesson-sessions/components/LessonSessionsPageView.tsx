'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { useClasses } from '@/features/classes/hooks/useClasses';
import { useClassDetail } from '@/features/classes/hooks/useClassDetail';
import type { ClassItem } from '@/features/classes/types';
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
import { lessonSessionKeys, MOCK_STUDENTS } from '../constants';
import { LessonSessionHeader } from './LessonSessionHeader';
import { LessonSessionTable } from './LessonSessionTable';
import { CreateSessionModal } from './CreateSessionModal';
import { ConflictWarningModal } from './ConflictWarningModal';
import { AttendanceHeroBanner } from './AttendanceHeroBanner';
import { AttendanceTable } from './AttendanceTable';
import { AttendanceCockpitBar } from './AttendanceCockpitBar';
import { SessionFormModal } from './SessionFormModal';
import { TimetableGridMatrix } from '@/features/timetable/components/TimetableGridMatrix';
import {
  getCurrentWeekNumber,
  getWeekStartDate,
  formatDateShort,
  formatDateIso,
} from '@/features/timetable/services/timetable.service';
import type { DaySchedule, TimetableSession } from '@/features/timetable/types';

interface LessonSessionsPageViewProps {
  classId?: string;
}

export const LessonSessionsPageView: React.FC<LessonSessionsPageViewProps> = ({
  classId = 'CNTT-K21A',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const { isFocus, toggleMode } = useDashboardMode();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();

  // Optimized fetching: Only fetch full classes list if no specific class is targeted
  const isSpecificClass = Boolean(classId && classId !== 'CNTT-K21A');
  const { data: classesData } = useClasses(
    { page: 0, size: 50 },
    { enabled: !isSpecificClass }
  );
  const classesList: ClassItem[] = classesData?.items ?? [];

  // Query specific class details immediately from cache or single request
  const { data: classDetail } = useClassDetail(
    isSpecificClass ? classId : '',
    'stream',
    false
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(classId || 'CNTT-K21A');

  const effectiveClassId = selectedClassId || classId || 'CNTT-K21A';

  const activeClass = useMemo(() => {
    if (classDetail?.classInfo) {
      const info = classDetail.classInfo;
      return {
        id: info.id,
        name: info.title || info.name || 'Lớp học',
        code: info.enrollmentKey || info.name,
        enrolledCount: info.enrolledCount ?? classDetail.members?.length ?? 45,
        academicYear: info.academicYear || '2026-2027',
        semester: info.semester || 'Học kỳ 1',
        schedule: info.schedule,
      };
    }
    return classesList.find((c) => c.id === effectiveClassId) || null;
  }, [classDetail?.classInfo, classDetail?.members?.length, classesList, effectiveClassId]);

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
  const { data: sessions = [], isLoading: isLoadingSessions } = useLessonSessions(effectiveClassId);
  const { data: rooms = [] } = useRooms();
  const { data: rawStudents = [] } = useClassStudents(effectiveClassId);

  // Resolve students: prefer rawStudents or classDetail members
  const students = useMemo(() => {
    if (rawStudents.length > 0) return rawStudents;
    if (classDetail?.members && classDetail.members.length > 0) {
      const studentMembers = classDetail.members
        .filter((m) => m.role === 'STUDENT' || !m.role)
        .map((m) => ({
          studentId: m.id,
          studentCode: m.studentCode || `SV-${m.id.slice(0, 6)}`,
          studentName: m.name,
          email: m.email || '',
          avatarUrl: m.avatarUrl,
        }));
      if (studentMembers.length > 0) return studentMembers;
    }
    const targetCount = activeClass?.enrolledCount || 42;
    return MOCK_STUDENTS.slice(0, targetCount);
  }, [rawStudents, classDetail?.members, activeClass?.enrolledCount]);

  const { data: existingAttendances = [] } = useAttendances(
    effectiveClassId,
    selectedSession?.lessonSessionId
  );

  // Check URL params
  const paramSessionId = searchParams?.get('sessionId') || null;
  const isAttendanceAction = searchParams?.get('action') === 'attendance';
  const hasAutoSelectedRef = useRef(false);
  const lastInitializedKeyRef = useRef<string>('');

  useEffect(() => {
    if (sessions.length === 0) return;

    if (paramSessionId) {
      if (selectedSession?.lessonSessionId !== paramSessionId) {
        const matched = sessions.find((s) => s.lessonSessionId === paramSessionId);
        if (matched) {
          setSelectedSession(matched);
        }
      }
      return;
    }

    if (isAttendanceAction && !hasAutoSelectedRef.current && !selectedSession) {
      hasAutoSelectedRef.current = true;
      const todayStr = formatDateIso();
      const todaySession =
        sessions.find((s) => s.sessionDate === todayStr) ||
        sessions.find((s) => s.status === 'IN_PROGRESS') ||
        sessions[0];
      if (todaySession) {
        setSelectedSession(todaySession);
      }
    }
  }, [sessions, paramSessionId, isAttendanceAction, selectedSession]);

  // Mutations
  const createSessionMutation = useCreateLessonSession(effectiveClassId);
  const updateSessionMutation = useUpdateLessonSession(effectiveClassId);
  const deleteSessionMutation = useDeleteLessonSession(effectiveClassId);
  const saveAttendancesMutation = useSaveAttendances(
    effectiveClassId,
    selectedSession?.lessonSessionId || ''
  );

  // Attendance Map
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus | null; note: string }>
  >({});

  useEffect(() => {
    if (!selectedSession || students.length === 0) return;

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
  }, [selectedSession, students, existingAttendances]);

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
        payload,
      });
      showToast('Đã cập nhật ca học thành công!');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSessionMutation.mutateAsync({
      lessonSessionId: sessionId,
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
    const total = students.length || selectedSession.totalStudents || 45;
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
    const total = students.length || selectedSession.totalStudents || 45;
    const newStatus = checked >= total && total > 0 ? 'COMPLETED' : 'IN_PROGRESS';
    await saveAttendancesMutation.mutateAsync({
      attendances: list,
      status: newStatus,
    });
    setIsLocked(true);
    showToast('Đã chốt thành công danh sách điểm danh!');
  };

  const handleBackToList = () => {
    setSelectedSession(null);
  };

  // Calendar calculations
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
            studentsCount: s.totalStudents || students.length || 45,
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
  }, [weekStartDate, sessions, activeClass?.name, students.length]);

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
  const totalCount = students.length || activeClass?.enrolledCount || 45;
  const presenceRate =
    totalCount > 0 ? (((presentCount + lateCount) / totalCount) * 100).toFixed(1) : '0';

  const sidebarPaddingClass =
    isFocus || isSidebarCollapsed ? 'left-0 sm:left-[72px]' : 'left-0 sm:left-64';

  return (
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] transition-colors font-sans">
      <DashboardSidebar
        isFocus={isFocus}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      <div className={`transition-all duration-300 ${isFocus || isSidebarCollapsed ? 'pl-[72px]' : 'pl-64'}`}>
        <DashboardHeader
          isFocus={isFocus}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleMode={toggleMode}
          userFullName={userFullName}
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
                <LessonSessionHeader
                  activeClass={activeClass}
                  classesList={classesList}
                  selectedClassId={effectiveClassId}
                  onSelectClassId={(id) => setSelectedClassId(id)}
                  totalSessionsCount={sessions.length || 12}
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
                      : 95.0
                  }
                  onBackToClasses={() => {
                    if (effectiveClassId) {
                      router.push(`/classes/${effectiveClassId}?tab=sessions`);
                    } else {
                      router.push('/classes');
                    }
                  }}
                />

                {/* View switcher & Quick Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1E1F20] p-4 rounded-3xl shadow-xs">
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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const todayIso = formatDateIso();
                        const todaySess =
                          sessions.find((s) => s.sessionDate === todayIso) ||
                          sessions.find((s) => s.status === 'IN_PROGRESS') ||
                          sessions[0];
                        if (todaySess) {
                          setSelectedSession(todaySess);
                        } else {
                          showToast('Chưa có ca học nào được lên lịch cho lớp!');
                        }
                      }}
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
                  </div>
                </div>

                {viewMode === 'calendar' ? (
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

                    <TimetableGridMatrix
                      days={daysSchedule}
                      onSelectSession={handleSelectGridSession}
                    />
                  </div>
                ) : (
                  <LessonSessionTable
                    sessions={sessions}
                    isLoading={isLoadingSessions}
                    onSelectAttendance={(session) => setSelectedSession(session)}
                    onOpenCreateModal={() => handleOpenCreateModal()}
                    onEditSession={(session) => handleOpenEditModal(session)}
                    onDeleteSession={(session) => handleDeleteSession(session.lessonSessionId)}
                  />
                )}
              </>
            ) : (
              <>
                <AttendanceHeroBanner
                  session={selectedSession}
                  sessions={sessions}
                  onSelectSession={(sessionId) => {
                    const found = sessions.find((s) => s.lessonSessionId === sessionId);
                    if (found) setSelectedSession(found);
                  }}
                  onBack={handleBackToList}
                  onMarkAllPresent={handleMarkAllPresent}
                  onRefresh={() => {
                    if (selectedSession) {
                      queryClient.invalidateQueries({
                        queryKey: lessonSessionKeys.attendances(
                          effectiveClassId,
                          selectedSession.lessonSessionId
                        ),
                      });
                    }
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
                  sidebarPaddingClass={sidebarPaddingClass}
                />
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
