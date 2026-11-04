'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function AuthFooter() {
  const t = useTranslations('auth.footer');

  return (
    <footer className="w-full border-t border-slate-200/60 bg-white/90 py-4 shadow-[0_-1px_6px_rgba(0,0,0,0.02)] dark:border-slate-800/80 dark:bg-[#0F131D] dark:shadow-[0_-1px_12px_rgba(0,0,0,0.4)]">
      <div className="flex w-full flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 md:px-8 text-xs text-slate-500 dark:text-slate-400">
        {/* Copyright */}
        <div className="text-center md:text-left">
          <span>{t('copyright')}</span>
        </div>

        {/* Security Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#38BDF8]">lock</span>
            <span className="font-medium">{t('ssl')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#38BDF8]">verified_user</span>
            <span className="font-medium">{t('gdpr')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#38BDF8]">security</span>
            <span className="font-medium">{t('iso')}</span>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="transition-colors hover:text-blue-600 dark:hover:text-[#38BDF8]"
          >
            {t('privacy')}
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-blue-600 dark:hover:text-[#38BDF8]"
          >
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
