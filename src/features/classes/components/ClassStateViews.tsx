'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function ClassLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="rounded-3xl bg-white dark:bg-[#1E1F20] p-6 space-y-4 animate-pulse border-none shadow-none"
        >
          <div className="h-24 w-full bg-[#E1E5EA] dark:bg-[#282A2C] rounded-2xl" />
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-[#E1E5EA] dark:bg-[#282A2C] rounded-full" />
            <div className="h-4 w-1/2 bg-[#F0F4F9] dark:bg-[#333537] rounded-full" />
          </div>
          <div className="h-10 w-full bg-[#F0F4F9] dark:bg-[#333537] rounded-2xl" />
          <div className="h-2 w-full bg-[#E1E5EA] dark:bg-[#282A2C] rounded-full" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-7 w-20 bg-[#F0F4F9] dark:bg-[#282A2C] rounded-full" />
            <div className="h-8 w-28 bg-[#E1E5EA] dark:bg-[#282A2C] rounded-full" />
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
    <div className="my-8 p-12 rounded-3xl bg-white dark:bg-[#1E1F20] text-center flex flex-col items-center justify-center space-y-4 border-none shadow-none">
      <div className="w-16 h-16 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px]">school</span>
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-lg font-display font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
          {t('emptyActiveTitle')}
        </h3>
        <p className="text-xs text-[#747775] dark:text-[#8E918F] leading-relaxed">
          {t('emptyActiveDesc')}
        </p>
      </div>
      <button
        type="button"
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-medium whitespace-nowrap transition-colors border-none shadow-none cursor-pointer"
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
    <div className="my-8 p-10 rounded-3xl bg-white dark:bg-[#1E1F20] text-center flex flex-col items-center justify-center space-y-4 border-none shadow-none">
      <div className="w-14 h-14 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-[#747775] dark:text-[#8E918F] flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px]">search_off</span>
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-display font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
          {t('emptySearchTitle')}
        </h3>
        <p className="text-xs text-[#747775] dark:text-[#8E918F]">
          {t('emptySearchDesc')}
        </p>
      </div>
      <button
        type="button"
        onClick={onClearFilters}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-medium whitespace-nowrap transition-colors border-none shadow-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">restart_alt</span>
        <span>{t('clearFilters')}</span>
      </button>
    </div>
  );
}
