'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export function HeroLearningCard() {
  const t = useTranslations('dashboard');
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col gap-6 overflow-hidden transition-all duration-300 hover:shadow-xl border border-slate-100 dark:border-slate-800">
      {/* Subtle Zen Watermark */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-secondary/10 to-primary/0 pointer-events-none blur-2xl" />

      {/* Card Header & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold flex items-center gap-1.5 border border-secondary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {t('inProgressTag')}
          </span>
        </div>
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium">
          BST-MOD-03
        </span>
      </div>

      {/* Lesson Main Info */}
      <div className="space-y-2 relative z-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {t('chapter3Title')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {t('chapter3Desc')}
        </p>
      </div>

      {/* Progress Module */}
      <div className="space-y-2 relative z-10 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">{t('chapterProgress')}</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">
            65% <span className="font-normal text-slate-500 dark:text-slate-400">{t('chapterLessonsCount', { completed: 13, total: 20 })}</span>
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-500 ease-out"
            style={{ width: '65%' }}
          />
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center gap-3 pt-1 relative z-10">
        <button
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/90 text-white text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
          type="button"
        >
          <span>{t('btnStudyNow')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <button
          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-secondary">
            menu_book
          </span>
          <span>{t('btnSummary')}</span>
        </button>

        <button
          onClick={() => setIsBookmarked((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl transition-all ml-auto text-xs font-semibold ${
            isBookmarked
              ? 'bg-secondary/10 text-secondary border border-secondary/30'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
          type="button"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isBookmarked ? 'text-secondary' : 'text-slate-400'
            }`}
            style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
          >
            bookmark
          </span>
          <span>{isBookmarked ? t('btnSavedLesson') : t('btnSaveLesson')}</span>
        </button>
      </div>
    </div>
  );
}
