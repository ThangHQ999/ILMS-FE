'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('pageTitle')}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
            <span>{CURRENT_SEMESTER}</span>
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('pageSubtitle')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {onExportClick && (
          <button
            onClick={onExportClick}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>{t('exportReport')}</span>
          </button>
        )}

        <button
          onClick={onCreateClick}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>{t('createClassBtn')}</span>
        </button>
      </div>
    </div>
  );
}

