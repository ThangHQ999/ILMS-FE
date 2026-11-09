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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
      {/* KPI 1: Active Classes */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('kpiTeaching')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
              {stats.activeClassesCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">lớp</span>
          </div>
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t('kpiTeachingSub')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">school</span>
        </div>
      </div>

      {/* KPI 2: Total Students */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('kpiStudents')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
              {stats.totalStudentsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">sinh viên</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t('kpiStudentsSub')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">group</span>
        </div>
      </div>

      {/* KPI 3: Needs Attention */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('kpiAttention')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
              {stats.needsAttentionCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">lớp</span>
          </div>
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {t('kpiAttentionSub')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">notifications_active</span>
        </div>
      </div>
    </div>
  );
}

