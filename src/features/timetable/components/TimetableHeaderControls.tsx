'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TimetableFilterType } from '../types';

interface TimetableHeaderControlsProps {
  currentWeek: number;
  startDate: string;
  endDate: string;
  semesterName: string;
  facultyName: string;
  filterType: TimetableFilterType;
  onFilterChange: (type: TimetableFilterType) => void;
  onNavigateWeek: (delta: number) => void;
  onGoToCurrentWeek: () => void;
  onOpenExportModal: () => void;
  onOpenSwapRoomModal: () => void;
}

export function TimetableHeaderControls({
  currentWeek,
  startDate,
  endDate,
  semesterName,
  facultyName,
  filterType,
  onFilterChange,
  onNavigateWeek,
  onGoToCurrentWeek,
  onOpenExportModal,
  onOpenSwapRoomModal,
}: TimetableHeaderControlsProps) {
  const t = useTranslations('timetable');
  const tFilters = useTranslations('timetable.filters');

  const filterTabs: { type: TimetableFilterType; label: string }[] = [
    { type: 'all', label: tFilters('all', { count: 4 }) },
    { type: 'theory', label: tFilters('theory') },
    { type: 'lab', label: tFilters('lab') },
    { type: 'exam', label: tFilters('exam') },
  ];

  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 lg:p-7 shadow-sm dark:shadow-none mb-6 transition-colors border-none ring-0 outline-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#E3E3E3] font-sans">
              {t('weeklyTitle')}
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF] border-none font-sans">
              {t('weekBadge', { week: currentWeek })}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#C4C7C5] font-sans">
            {semesterName} • {startDate} - {endDate} • {facultyName}
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Today shortcut */}
          <button
            type="button"
            onClick={onGoToCurrentWeek}
            className="px-4 py-2 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF] hover:bg-[#C2E7FF] dark:hover:bg-[#005c94] text-xs font-semibold transition-all border-none cursor-pointer whitespace-nowrap font-sans"
          >
            {t('todayBtn')}
          </button>

          {/* Date Range Navigation */}
          <div className="flex items-center bg-[#F0F4F9] dark:bg-[#282A2C] rounded-full p-1 text-xs font-medium border-none font-sans">
            <button
              type="button"
              onClick={() => onNavigateWeek(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-[#333538] text-gray-700 dark:text-[#E3E3E3] transition-colors border-none cursor-pointer"
              title={t('prevWeek')}
              aria-label={t('prevWeek')}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-3 text-gray-900 dark:text-[#E3E3E3] font-semibold whitespace-nowrap">
              {t('weekRangeDisplay', {
                week: currentWeek,
                range: `${startDate.slice(0, 5)} - ${endDate.slice(0, 5)}, 2024`,
              })}
            </span>
            <button
              type="button"
              onClick={() => onNavigateWeek(1)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-[#333538] text-gray-700 dark:text-[#E3E3E3] transition-colors border-none cursor-pointer"
              title={t('nextWeek')}
              aria-label={t('nextWeek')}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Export Schedule (.ics/PDF) */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200/80 dark:hover:bg-[#333538] text-gray-800 dark:text-[#E3E3E3] text-xs font-medium transition-colors border-none cursor-pointer whitespace-nowrap font-sans"
          >
            <span className="material-symbols-outlined text-[17px] text-[#0B57D0] dark:text-[#A8C7FA]">
              ios_share
            </span>
            <span>{t('exportScheduleBtn')}</span>
          </button>

          {/* Swap Room / Make-up request */}
          <button
            type="button"
            onClick={onOpenSwapRoomModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] hover:bg-[#0842a0] dark:hover:bg-[#8ab4f8] text-xs font-semibold transition-colors shadow-sm dark:shadow-none border-none cursor-pointer whitespace-nowrap font-sans"
          >
            <span className="material-symbols-outlined text-[17px]">event_repeat</span>
            <span>{t('swapRoomBtn')}</span>
          </button>
        </div>
      </div>

      {/* Quick filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = filterType === tab.type;
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => onFilterChange(tab.type)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border-none cursor-pointer font-sans ${
                isActive
                  ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] shadow-sm dark:shadow-none'
                  : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] hover:bg-gray-200/80 dark:hover:bg-[#333538]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

