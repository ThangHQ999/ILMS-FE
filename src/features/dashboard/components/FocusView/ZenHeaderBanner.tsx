'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function ZenHeaderBanner() {
  const t = useTranslations('dashboard');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] text-[#444746] dark:text-[#C4C7C5] text-xs whitespace-nowrap">
        <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
        <span className="font-semibold tracking-wider text-[11px] uppercase">
          {t('zenBanner')}
        </span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9]/70 dark:bg-[#1E1F20]/60 text-[#444746] dark:text-[#C4C7C5] text-xs whitespace-nowrap">
        <span className="material-symbols-outlined text-[16px] text-secondary">
          self_improvement
        </span>
        <span className="font-medium">
          {t('zenQuiet')}
        </span>
      </div>
    </div>
  );
}
