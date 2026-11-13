'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TimetableFilterType } from '../types';

interface TimetableHeaderControlsProps {
  currentWeek: number;
  startDate: string;
  endDate: string;
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
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none mb-6 transition-colors border-none ring-0 outline-none flex flex-col gap-5">
      {/* Top Row: Title & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-[#E3E3E3] font-sans">
            {t('weeklyTitle')}
          </h1>
          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-[#004A77] text-blue-900 dark:text-[#C2E7FF] border-none font-sans whitespace-nowrap">
            {t('weekBadge', { week: currentWeek })}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Today shortcut */}
          <button
            type="button"
            onClick={onGoToCurrentWeek}
            className="px-4 py-2 rounded-full bg-blue-100 text-blue-900 dark:bg-[#004A77] dark:text-[#C2E7FF] hover:opacity-80 text-xs font-semibold transition-opacity border-none cursor-pointer whitespace-nowrap font-sans"
          >
            {t('todayBtn')}
          </button>

          {/* Date Range Navigation */}
          <div className="flex items-center bg-gray-100 dark:bg-[#282A2C] rounded-full p-1 text-xs font-medium border-none font-sans">
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 dark:bg-[#282A2C] hover:opacity-80 text-gray-800 dark:text-[#E3E3E3] text-xs font-medium transition-opacity border-none cursor-pointer whitespace-nowrap font-sans"
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] hover:opacity-90 text-xs font-semibold transition-opacity border-none cursor-pointer whitespace-nowrap font-sans"
          >
            <span className="material-symbols-outlined text-[17px]">event_repeat</span>
            <span>{t('swapRoomBtn')}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips in a neat horizontal row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
        {filterTabs.map((tab) => {
          const isActive = filterType === tab.type;
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => onFilterChange(tab.type)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-opacity border-none cursor-pointer font-sans whitespace-nowrap ${
                isActive
                  ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] hover:opacity-90'
                  : 'bg-gray-200 dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] hover:opacity-80'
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
