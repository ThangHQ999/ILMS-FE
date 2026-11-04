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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold uppercase tracking-wider">
            {t('badgeHeaderTag')}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {userFullName} (PRO LEARNER)
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('mainPageTitle')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          {t('mainPageSubtitle')}
        </p>
      </div>

      {/* Quick Search Bar inside Page */}
      <div className="w-full md:w-96 flex flex-col gap-1 shrink-0">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            manage_search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full h-11 pl-11 pr-20 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-secondary/30 transition-all shadow-xs"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300 font-semibold">
              Ctrl+K
            </kbd>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 px-1">
          {t('searchHintCount')}
        </span>
      </div>
    </div>
  );
}
