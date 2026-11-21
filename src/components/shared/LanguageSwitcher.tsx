'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { setUserLocale } from '@/lib/locale';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'minimal';
}

export function LanguageSwitcher({
  className = '',
  variant = 'pill',
}: LanguageSwitcherProps) {
  const currentLocale = useLocale() as 'vi' | 'en';

  const handleSwitch = (locale: 'vi' | 'en') => {
    if (locale === currentLocale) return;
    setUserLocale(locale);
  };

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={() => handleSwitch(currentLocale === 'vi' ? 'en' : 'vi')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors whitespace-nowrap ${className}`}
        title={currentLocale === 'vi' ? 'Chuyển sang English' : 'Switch to Tiếng Việt'}
      >
        <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-[#8E918F]">
          language
        </span>
        <span className="uppercase font-bold tracking-wider text-[11px]">
          {currentLocale}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-[#1E1F20] text-xs ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => handleSwitch('vi')}
        className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all whitespace-nowrap ${
          currentLocale === 'vi'
            ? 'bg-white dark:bg-[#282A2C] text-blue-600 dark:text-[#A8C7FA]'
            : 'text-slate-500 dark:text-[#8E918F] hover:text-slate-800 dark:hover:text-[#E3E3E3]'
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => handleSwitch('en')}
        className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all whitespace-nowrap ${
          currentLocale === 'en'
            ? 'bg-white dark:bg-[#282A2C] text-blue-600 dark:text-[#A8C7FA]'
            : 'text-slate-500 dark:text-[#8E918F] hover:text-slate-800 dark:hover:text-[#E3E3E3]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
