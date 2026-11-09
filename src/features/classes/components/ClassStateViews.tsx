'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function ClassLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 animate-pulse"
        >
          <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-850 rounded-lg" />
          </div>
          <div className="h-10 w-full bg-slate-100 dark:bg-slate-850 rounded-xl" />
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-7 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ClassEmptyStateProps {
  onCreateClick: () => void;
}

export function ClassEmptyState({ onCreateClick }: ClassEmptyStateProps) {
  const t = useTranslations('classes');

  return (
    <div className="my-8 p-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
        <span className="material-symbols-outlined text-[32px]">school</span>
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
          {t('emptyActiveTitle')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('emptyActiveDesc')}
        </p>
      </div>
      <button
        type="button"
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span>{t('createClassBtn')}</span>
      </button>
    </div>
  );
}

interface ClassSearchNotFoundStateProps {
  onClearFilters: () => void;
}

export function ClassSearchNotFoundState({ onClearFilters }: ClassSearchNotFoundStateProps) {
  const t = useTranslations('classes');

  return (
    <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px]">search_off</span>
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
          {t('emptySearchTitle')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('emptySearchDesc')}
        </p>
      </div>
      <button
        type="button"
        onClick={onClearFilters}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[16px]">restart_alt</span>
        <span>{t('clearFilters')}</span>
      </button>
    </div>
  );
}

