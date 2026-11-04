'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function ErrorPageFooter() {
  const t = useTranslations('errors');

  return (
    <footer className="w-full bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-200">ILMS</span>
          <span>© 2026 EduTech Innovations. {t('copyright')}</span>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Link
            href="/settings"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {t('footerSupportCenter')}
          </Link>
          <Link
            href="/terms"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {t('footerTermsAndPolicies')}
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('systemOperational')}
          </span>
        </div>
      </div>
    </footer>
  );
}
