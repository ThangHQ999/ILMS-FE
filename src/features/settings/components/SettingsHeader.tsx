'use client';

import React, { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface SettingsHeaderProps {
  userFullName?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SettingsHeader({
  userFullName = 'Trần Nhật Minh',
  searchQuery,
  onSearchChange,
}: SettingsHeaderProps) {
  const t = useTranslations('settings');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border-none shadow-none">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-[11px] font-bold uppercase tracking-wider border-none">
            {t('badgeHeaderTag')}
          </span>
          <span className="text-[#747775] dark:text-[#8E918F]">•</span>
          <span className="text-xs text-[#747775] dark:text-[#C4C7C5] font-semibold">
            {userFullName} (PRO LEARNER)
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
          {t('mainPageTitle')}
        </h1>
        <p className="text-xs text-[#747775] dark:text-[#C4C7C5] max-w-2xl leading-relaxed">
          {t('mainPageSubtitle')}
        </p>
      </div>

      {/* Quick Search Bar inside Page */}
      <div className="w-full md:w-96 flex flex-col gap-1 shrink-0">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775] dark:text-[#8E918F] text-[20px]">
            manage_search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full h-11 pl-11 pr-20 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] border-none text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] outline-none transition-all shadow-none"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#1E1F20] text-[10px] font-mono text-[#444746] dark:text-[#C4C7C5] font-semibold border-none">
              Ctrl+K
            </kbd>
          </div>
        </div>
        <span className="text-[11px] text-[#747775] dark:text-[#8E918F] px-1">
          {t('searchHintCount')}
        </span>
      </div>
    </div>
  );
}
