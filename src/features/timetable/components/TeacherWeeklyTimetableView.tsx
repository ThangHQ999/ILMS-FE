'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useWeeklyTimetable } from '../hooks/useWeeklyTimetable';
import { TimetableHeaderControls } from './TimetableHeaderControls';
import { TimetableGridMatrix } from './TimetableGridMatrix';
import { TimetableClassStudentsModal } from './TimetableClassStudentsModal';
import { TimetableSwapRoomModal } from './TimetableSwapRoomModal';
import { TimetableExportModal } from './TimetableExportModal';

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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/dashboard');
    }
  };

  const handleExport = (format: 'ics' | 'pdf') => {
    showToast(t('exportModal.exportingToast'));
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
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] transition-colors shadow-sm dark:shadow-none border-none cursor-pointer font-sans"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="text-xs font-semibold tracking-wide">
              {t('backToOverview')}
            </span>
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-200 dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] text-xs font-medium font-sans">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>{t('termPill')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-[#162B4D] text-blue-900 dark:text-[#A8C7FA] text-xs font-medium font-sans border-none">
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
        filterType={filterType}
        onFilterChange={setFilterType}
        onNavigateWeek={navigateWeek}
        onGoToCurrentWeek={goToCurrentWeek}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSwapRoomModal={() => setIsSwapRoomModalOpen(true)}
      />

      {/* 3. 2D Academic Schedule Grid Matrix (Time/Shifts on Y-axis, Days on X-axis) */}
      <TimetableGridMatrix
        days={timetableData.days}
        onSelectSession={openSessionDetail}
      />

      {/* 4. Class Students Roster Modal (Shown when clicking any class block) */}
      <TimetableClassStudentsModal
        isOpen={isDetailModalOpen}
        session={selectedSession}
        onClose={closeSessionDetail}
      />

      {/* 5. Swap Room & Make-up Modal */}
      <TimetableSwapRoomModal
        isOpen={isSwapRoomModalOpen}
        sessions={timetableData.days.flatMap((d) => d.sessions)}
        onClose={() => setIsSwapRoomModalOpen(false)}
        onSubmitSuccess={(msg) => showToast(msg)}
      />

      {/* 6. Export Schedule Modal */}
      <TimetableExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900 text-white dark:bg-[#E3E3E3] dark:text-[#131314] shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-5 duration-300 font-sans border-none">
          <span className="material-symbols-outlined text-green-500 text-[20px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
