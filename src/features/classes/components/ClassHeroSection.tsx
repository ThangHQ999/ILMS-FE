'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useUserRole } from '@/hooks/useUserRole';
import { CURRENT_SEMESTER } from '../constants';

interface ClassHeroSectionProps {
  onCreateClick: () => void;
  onExportClick?: () => void;
}

export function ClassHeroSection({
  onCreateClick,
  onExportClick,
}: ClassHeroSectionProps) {
  const t = useTranslations('classes');
  const { isTeacher } = useUserRole();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight">
            {t('pageTitle')}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] whitespace-nowrap border-none">
            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
            <span>{CURRENT_SEMESTER}</span>
          </span>
        </div>
        <p className="text-sm text-[#444746] dark:text-[#C4C7C5]">
          {t('pageSubtitle')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {onExportClick && (
          <button
            onClick={onExportClick}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-sm font-medium whitespace-nowrap transition-colors border-none shadow-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>{t('exportReport')}</span>
          </button>
        )}

        {isTeacher && (
          <button
            onClick={onCreateClick}
            type="button"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-sm font-medium whitespace-nowrap transition-colors border-none shadow-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>{t('createClassBtn')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
