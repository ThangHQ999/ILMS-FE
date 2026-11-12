'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/features/auth';
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
  const { data: user } = useCurrentUser();
  const { isFocus, toggleMode } = useDashboardMode();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ilms_analytics_sidebar_collapsed');
      if (stored === 'true') setIsSidebarCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ilms_analytics_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

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

  const { data: sessions = [], isLoading: isLoadingSessions } = useLessonSessions(classId);
  const { data: rooms = [] } = useRooms();
  const { data: students = [] } = useClassStudents(classId);
  const { data: existingAttendances = [] } = useAttendances(
    classId,
    selectedSession?.lessonSessionId
  );

  const createSessionMutation = useCreateLessonSession(classId);
  const saveAttendancesMutation = useSaveAttendances(
    classId,
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

      <div className={`transition-all duration-300 ${isFocus || isSidebarCollapsed ? 'pl-20' : 'pl-72'}`}>
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
                <LessonSessionHeader onBackToClasses={() => setSelectedSession(null)} />
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
                  onBack={handleBackToList}
                  onMarkAllPresent={handleMarkAllPresent}
                  onRefresh={() => showToast('Đã làm mới dữ liệu ca học!')}
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
