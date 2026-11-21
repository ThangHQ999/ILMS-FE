'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface TeacherHeroHeaderProps {
  instructorName?: string;
  onOpenTimetable?: () => void;
  onCreateAnnouncement?: () => void;
}

export function TeacherHeroHeader({
  instructorName = 'TS. Nguyễn Văn An',
  onOpenTimetable,
  onCreateAnnouncement,
}: TeacherHeroHeaderProps) {
  const t = useTranslations('dashboard.teacher');

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#E3E3E3] font-sans">
          {t('teachingOverviewTitle')}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5 mt-2">
          <span className="bg-gray-200 text-gray-800 dark:bg-[#282A2C] dark:text-[#E3E3E3] px-3.5 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2 border-none font-sans">
            <span className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
            {t('instructorAndTerm', { instructor: instructorName })}
          </span>
          <span className="border border-gray-300 text-gray-600 dark:border-[#444746] dark:text-[#C4C7C5] px-3 py-1 rounded-full text-sm font-medium font-sans">
            {t('itFaculty')}
          </span>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenTimetable}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 border-none cursor-pointer whitespace-nowrap shadow-none font-sans"
        >
          <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
            calendar_today
          </span>
          <span>{t('viewWeeklyTimetable')}</span>
        </button>

        <button
          type="button"
          onClick={onCreateAnnouncement}
          className="bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] px-5 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 border-none cursor-pointer whitespace-nowrap shadow-none font-sans"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>{t('createAnnouncement')}</span>
        </button>
      </div>
    </div>
  );
}
