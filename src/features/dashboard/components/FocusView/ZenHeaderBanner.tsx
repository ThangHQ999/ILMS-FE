'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function ZenHeaderBanner() {
  const t = useTranslations('dashboard');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs shadow-sm">
        <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
        <span className="font-semibold tracking-wider text-[11px] uppercase">
          {t('zenBanner')}
        </span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs">
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
