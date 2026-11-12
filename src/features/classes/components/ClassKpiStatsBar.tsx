'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ClassKpiStats } from '../types';

interface ClassKpiStatsBarProps {
  stats: ClassKpiStats;
}

export function ClassKpiStatsBar({ stats }: ClassKpiStatsBarProps) {
  const t = useTranslations('classes');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
      {/* KPI 1: Active Classes */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] flex items-center justify-between border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
            {t('kpiTeaching')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {stats.activeClassesCount}
            </span>
            <span className="text-xs text-[#444746] dark:text-[#C4C7C5]">lớp</span>
          </div>
          <p className="text-[11px] font-medium text-[#0D652D] dark:text-[#81C995] flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0D652D] dark:bg-[#81C995]" />
            {t('kpiTeachingSub')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">school</span>
        </div>
      </div>

      {/* KPI 2: Total Students */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] flex items-center justify-between border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
            {t('kpiStudents')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {stats.totalStudentsCount}
            </span>
            <span className="text-xs text-[#444746] dark:text-[#C4C7C5]">sinh viên</span>
          </div>
          <p className="text-[11px] font-medium text-[#444746] dark:text-[#C4C7C5]">
            {t('kpiStudentsSub')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">group</span>
        </div>
      </div>

      {/* KPI 3: Needs Attention */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] flex items-center justify-between border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
            {t('kpiAttention')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {stats.needsAttentionCount}
            </span>
            <span className="text-xs text-[#444746] dark:text-[#C4C7C5]">lớp</span>
          </div>
          <p className="text-[11px] font-medium text-[#725200] dark:text-[#FFB784] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {t('kpiAttentionSub')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">notifications_active</span>
        </div>
      </div>
    </div>
  );
}
