'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export function HeroLearningCard() {
  const t = useTranslations('dashboard');
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="relative bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 overflow-hidden transition-all duration-300 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
      {/* Card Header & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs font-medium flex items-center gap-1.5 whitespace-nowrap border-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#041E49] dark:bg-[#A8C7FA]" />
            {t('inProgressTag')}
          </span>
        </div>
        <span className="font-mono text-xs text-[#747775] dark:text-[#8E918F] px-2.5 py-1 font-medium">
          BST-MOD-03
        </span>
      </div>

      {/* Lesson Main Info */}
      <div className="space-y-2 relative z-10">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight">
          {t('chapter3Title')}
        </h2>
        <p className="text-sm text-[#444746] dark:text-[#C4C7C5] leading-relaxed max-w-3xl">
          {t('chapter3Desc')}
        </p>
      </div>

      {/* Progress Module */}
      <div className="space-y-2 relative z-10 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#747775] dark:text-[#C4C7C5]">{t('chapterProgress')}</span>
          <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-bold">
            65% <span className="font-normal text-[#747775] dark:text-[#C4C7C5]">{t('chapterLessonsCount', { completed: 13, total: 20 })}</span>
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] overflow-hidden border-none">
          <div
            className="h-full rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] transition-all duration-500 ease-out"
            style={{ width: '65%' }}
          />
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center gap-3 pt-1 relative z-10">
        <button
          className="inline-flex items-center gap-2 bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium rounded-full px-6 py-2.5 text-xs sm:text-sm whitespace-nowrap transition-colors active:scale-[0.98] border-none shadow-none cursor-pointer"
          type="button"
        >
          <span>{t('btnStudyNow')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <button
          className="inline-flex items-center gap-2 bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-5 py-2.5 text-xs sm:text-sm whitespace-nowrap transition-colors border-none shadow-none cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
            menu_book
          </span>
          <span>{t('btnSummary')}</span>
        </button>

        <button
          onClick={() => setIsBookmarked((prev) => !prev)}
          className={`inline-flex items-center gap-2 font-medium rounded-full px-5 py-2.5 transition-colors ml-auto text-xs whitespace-nowrap border-none cursor-pointer ${
            isBookmarked
              ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
              : 'bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3]'
          }`}
          type="button"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isBookmarked ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-[#747775] dark:text-[#8E918F]'
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
