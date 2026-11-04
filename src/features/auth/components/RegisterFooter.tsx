'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function RegisterFooter() {
  const t = useTranslations('auth.registerFooter');

  return (
    <footer className="relative z-10 w-full border-t border-slate-200/60 bg-white/80 dark:bg-[#0F131D] dark:border-slate-800/80 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_-1px_12px_rgba(0,0,0,0.4)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Security Certifications */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#38BDF8]">
                lock
              </span>
              <span>{t('ssl')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#38BDF8]">
                verified_user
              </span>
              <span>{t('gdpr')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#38BDF8]">
                shield
              </span>
              <span>{t('iso')}</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-[#38BDF8] transition-colors">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-[#38BDF8] transition-colors">
              {t('terms')}
            </Link>
            <Link href="/#compliance" className="hover:text-blue-600 dark:hover:text-[#38BDF8] transition-colors">
              {t('compliance')}
            </Link>
          </div>
        </div>

        {/* Copyright & System Status */}
        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <p className="text-center sm:text-left">
            {t('copyright')}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#38BDF8] animate-pulse" />
            <span>{t('systemSecure')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
