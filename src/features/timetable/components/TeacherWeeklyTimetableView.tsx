'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useWeeklyTimetable } from '../hooks/useWeeklyTimetable';
import { TimetableKpiBar } from './TimetableKpiBar';
import { TimetableHeaderControls } from './TimetableHeaderControls';
import { TimetableDayColumn } from './TimetableDayColumn';
import { TimetableSessionDetailModal } from './TimetableSessionDetailModal';
import { TimetableSwapRoomModal } from './TimetableSwapRoomModal';
import { TimetableExportModal } from './TimetableExportModal';
import {
  TeacherAttendanceModal,
  TodaySessionItem,
} from '@/features/dashboard/components/TeacherOverview/TeacherAttendanceModal';
import { TimetableSession } from '../types';

interface TeacherWeeklyTimetableViewProps {
  userFullName?: string;
  onBack?: () => void;
}

export function TeacherWeeklyTimetableView({
  userFullName = 'TS. Nguyễn Văn An',
  onBack,
}: TeacherWeeklyTimetableViewProps) {
  const router = useRouter();
  const t = useTranslations('timetable');
  const tLegend = useTranslations('timetable.legend');

  const {
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
  } = useWeeklyTimetable();

  // Quick Attendance Modal State
  const [attendanceSession, setAttendanceSession] = useState<TodaySessionItem | null>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/dashboard');
    }
  };

  const handleTriggerAttendance = (session: TimetableSession) => {
    setAttendanceSession({
      id: session.lessonSessionId,
      timeSlot: `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`,
      subjectTitle: session.className,
      subjectCode: session.classId,
      roomName: session.roomName,
      studentsCount: session.studentsCount,
      classId: session.classId,
      status: session.status,
    });
  };

  const handleExport = (format: 'ics' | 'pdf') => {
    showToast(t('exportModal.exportingToast'));
    // Generate simulated download or file export
    setTimeout(() => {
      const fileName = `thoi-khoa-bieu-tuan-${currentWeek}.${format}`;
      const dummyContent = format === 'ics' ? 'BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR' : 'PDF';
      const blob = new Blob([dummyContent], { type: format === 'ics' ? 'text/calendar' : 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }, 400);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto font-sans antialiased text-gray-900 dark:text-[#E3E3E3] transition-colors duration-200">
      {/* 1. Top Navigation & Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] transition-colors shadow-sm dark:shadow-none border-none cursor-pointer font-sans"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="text-xs font-semibold tracking-wide">
              {t('backToOverview')}
            </span>
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200/80 dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] text-xs font-medium font-sans">
            <span className="w-2 h-2 rounded-full bg-[#137333] dark:bg-[#81C995]" />
            <span>{t('termPill')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D3E3FD]/60 dark:bg-[#004A77]/40 text-[#041E49] dark:text-[#C2E7FF] text-xs font-medium font-sans border-none">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{t('instructorBadge', { name: userFullName })}</span>
          </div>
        </div>
      </div>

      {/* 2. Timetable Header & Navigation Control Card */}
      <TimetableHeaderControls
        currentWeek={currentWeek}
        startDate={timetableData.startDate}
        endDate={timetableData.endDate}
        semesterName={timetableData.semesterName}
        facultyName={timetableData.facultyName}
        filterType={filterType}
        onFilterChange={setFilterType}
        onNavigateWeek={navigateWeek}
        onGoToCurrentWeek={goToCurrentWeek}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSwapRoomModal={() => setIsSwapRoomModalOpen(true)}
      />

      {/* 3. Weekly Summary KPIs (4 Tonal mini-cards) */}
      <TimetableKpiBar kpis={timetableData.kpis} />

      {/* 4. Weekly Grid View (Monday to Sunday - 7 Columns) */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5 min-w-[1000px] lg:min-w-0">
          {timetableData.days.map((day) => (
            <TimetableDayColumn
              key={day.dayOfWeek}
              day={day}
              onSelectSession={openSessionDetail}
              onTakeAttendance={handleTriggerAttendance}
            />
          ))}
        </div>
      </div>

      {/* 5. Quick Statistics & Legend Footer Card */}
      <div className="mt-6 bg-white dark:bg-[#1E1F20] rounded-3xl p-5 shadow-sm dark:shadow-none transition-colors flex flex-col md:flex-row items-center justify-between gap-4 border-none ring-0 outline-none">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-[#C4C7C5] font-sans">
          <span className="font-semibold text-gray-900 dark:text-[#E3E3E3]">
            {tLegend('title')}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#E8F0FE] dark:bg-[#1A385C]" />
            <span>{tLegend('theory')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C4EED0] dark:bg-[#0f5223]" />
            <span>{tLegend('lab')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FEEFC3] dark:bg-[#433100]" />
            <span>{tLegend('exam')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#D3E3FD] dark:bg-[#004A77]" />
            <span>{tLegend('today')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-sans">
          <button
            type="button"
            onClick={() => showToast(tLegend('downloadingToast'))}
            className="px-4 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] text-xs font-semibold text-gray-800 dark:text-[#E3E3E3] transition-colors flex items-center gap-1.5 border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">folder_zip</span>
            <span>{tLegend('downloadWeeklyMaterials')}</span>
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-9 h-9 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] flex items-center justify-center text-gray-600 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer"
            title={tLegend('scrollToTop')}
            aria-label={tLegend('scrollToTop')}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </div>
      </div>

      {/* 6. Modals */}
      <TimetableSessionDetailModal
        isOpen={isDetailModalOpen}
        session={selectedSession}
        onClose={closeSessionDetail}
        onTriggerAttendance={handleTriggerAttendance}
      />

      <TimetableSwapRoomModal
        isOpen={isSwapRoomModalOpen}
        sessions={timetableData.days.flatMap((d) => d.sessions)}
        onClose={() => setIsSwapRoomModalOpen(false)}
        onSubmitSuccess={(msg) => showToast(msg)}
      />

      <TimetableExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />

      {/* Integrated Attendance Modal */}
      <TeacherAttendanceModal
        isOpen={Boolean(attendanceSession)}
        session={attendanceSession}
        onClose={() => setAttendanceSession(null)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900 text-white dark:bg-[#E3E3E3] dark:text-[#131314] shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-5 duration-300 font-sans border-none">
          <span className="material-symbols-outlined text-[#137333] dark:text-[#0f5223] text-[20px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

