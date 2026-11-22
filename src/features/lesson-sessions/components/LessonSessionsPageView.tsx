'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { useClasses } from '@/features/classes/hooks/useClasses';
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
import { lessonSessionKeys } from '../constants';
import { LessonSessionHeader } from './LessonSessionHeader';
import { LessonSessionTable } from './LessonSessionTable';
import { CreateSessionModal } from './CreateSessionModal';
import { ConflictWarningModal } from './ConflictWarningModal';
import { AttendanceHeroBanner } from './AttendanceHeroBanner';
import { AttendanceTable } from './AttendanceTable';
import { AttendanceCockpitBar } from './AttendanceCockpitBar';

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
  const { data: classesData } = useClasses({ page: 0, size: 50 });
  const classesList: ClassItem[] = classesData?.items ?? [];

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (classId && classId !== 'CNTT-K21A') return classId;
    return '';
  });

  useEffect(() => {
    if (classId && classId !== 'CNTT-K21A') {
      setSelectedClassId(classId);
      return;
    }
    if (!selectedClassId && classesList.length > 0) {
      // Find matching class or default to first
      const matched = classesList.find((c) => c.id === classId || c.code === classId);
      setSelectedClassId(matched ? matched.id : classesList[0].id);
    }
  }, [classesList, selectedClassId, classId]);

  const effectiveClassId = selectedClassId || (classId !== 'CNTT-K21A' ? classId : classesList[0]?.id || 'CNTT-K21A');
  const activeClass = useMemo(
    () => classesList.find((c) => c.id === effectiveClassId) || null,
    [classesList, effectiveClassId]
  );

  const handleToggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, [setIsSidebarCollapsed]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'ThS. Nguyễn Văn An';

  const [selectedSession, setSelectedSession] = useState<LessonSession | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<ConflictDetails | null>(null);
  const [roomOverride, setRoomOverride] = useState<string | undefined>();
  const [timeOverride, setTimeOverride] = useState<{ startTime: string; endTime: string } | undefined>();
  const [isLocked, setIsLocked] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { data: sessions = [], isLoading: isLoadingSessions } = useLessonSessions(effectiveClassId);
  const { data: rooms = [] } = useRooms();
  const { data: students = [] } = useClassStudents(effectiveClassId);
  const { data: existingAttendances = [] } = useAttendances(
    effectiveClassId,
    selectedSession?.lessonSessionId
  );

  const paramSessionId = searchParams?.get('sessionId') || null;
  const isAttendanceAction = searchParams?.get('action') === 'attendance';
  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    if (sessions.length === 0) return;

    if (paramSessionId) {
      const matched = sessions.find(
        (s) => s.lessonSessionId === paramSessionId
      );
      if (matched) {
        setSelectedSession(matched);
        return;
      }
    }

    if (isAttendanceAction && !hasAutoSelectedRef.current) {
      hasAutoSelectedRef.current = true;
      const todayStr = new Date().toISOString().split('T')[0];
      const todaySession =
        sessions.find((s) => s.sessionDate === todayStr) ||
        sessions.find((s) => s.status === 'IN_PROGRESS') ||
        sessions[0];
      if (todaySession) {
        setSelectedSession(todaySession);
      }
    }
  }, [sessions, paramSessionId, isAttendanceAction]);

  const createSessionMutation = useCreateLessonSession(effectiveClassId);
  const saveAttendancesMutation = useSaveAttendances(
    effectiveClassId,
    selectedSession?.lessonSessionId || ''
  );

  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus | null; note: string }>
  >({});

  useEffect(() => {
    if (!selectedSession || students.length === 0) return;
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
  }, [selectedSession?.lessonSessionId, students, existingAttendances]);

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
    showToast('Đã đánh dấu tất cả sinh viên Có mặt (45/45)!');
  };

  const handleTriggerConflict = (details: ConflictDetails) => {
    setIsCreateModalOpen(false);
    setConflictDetails(details);
    setIsConflictModalOpen(true);
  };

  const handleSelectAlternativeRoom = (newRoom: string) => {
    setRoomOverride(newRoom);
    setIsConflictModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleApplyNewTime = (start: string, end: string) => {
    setTimeOverride({ startTime: start, endTime: end });
    setIsConflictModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleEditConflict = () => {
    setIsConflictModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleCloseConflict = () => {
    setIsConflictModalOpen(false);
  };

  const handleOpenCreateModal = () => {
    setRoomOverride(undefined);
    setTimeOverride(undefined);
    setIsCreateModalOpen(true);
  };

  const handleCreateSession = async (payload: CreateLessonSessionRequest) => {
    await createSessionMutation.mutateAsync(payload);
    showToast('Đã tạo thành công ca học mới!');
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

  const handleBackToList = async () => {
    if (selectedSession) {
      const list = Object.entries(attendanceMap).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        note: data.note,
      }));
      const checked = list.filter((a) => a.status !== null && a.status !== undefined).length;
      const total = students.length || selectedSession.totalStudents || 45;
      const newStatus = checked >= total && total > 0 ? 'COMPLETED' : checked > 0 ? 'IN_PROGRESS' : 'SCHEDULED';
      await saveAttendancesMutation.mutateAsync({
        attendances: list,
        status: newStatus,
      });
    }
    setSelectedSession(null);
  };

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
            <span className="material-symbols-outlined text-[20px] text-[#0D652D] dark:text-[#81C995]">check_circle</span>
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
                      router.push(`/classes/${effectiveClassId}?tab=members`);
                    } else {
                      router.push('/classes');
                    }
                  }}
                />
                <LessonSessionTable
                  sessions={sessions}
                  isLoading={isLoadingSessions}
                  onSelectAttendance={(session) => setSelectedSession(session)}
                  onOpenCreateModal={handleOpenCreateModal}
                />
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
                />
              </>
            )}
          </div>
        </main>
      </div>

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSession}
        rooms={rooms}
        existingSessions={sessions}
        isSubmitting={createSessionMutation.isPending}
        onTriggerConflict={handleTriggerConflict}
        selectedRoomOverride={roomOverride}
        timeOverride={timeOverride}
      />

      <ConflictWarningModal
        isOpen={isConflictModalOpen}
        onClose={handleCloseConflict}
        onSelectAlternativeRoom={handleSelectAlternativeRoom}
        onApplyNewTime={handleApplyNewTime}
        onEditConflict={handleEditConflict}
        conflictDetails={conflictDetails}
      />
    </div>
  );
};
