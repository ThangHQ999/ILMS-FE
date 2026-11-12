'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function RegisterFooter() {
  const t = useTranslations('auth.registerFooter');

  return (
    <footer className="relative z-10 w-full border-none bg-white dark:bg-[#131314] shadow-none mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Security Certifications */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#C4C7C5] text-xs font-medium border-none">
              <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                lock
              </span>
              <span>{t('ssl')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#C4C7C5] text-xs font-medium border-none">
              <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                verified_user
              </span>
              <span>{t('gdpr')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#C4C7C5] text-xs font-medium border-none">
              <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                shield
              </span>
              <span>{t('iso')}</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
            <Link href="/privacy" className="hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors">
              {t('terms')}
            </Link>
            <Link href="/#compliance" className="hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors">
              {t('compliance')}
            </Link>
          </div>
        </div>

        {/* Copyright & System Status */}
        <div className="mt-4 pt-4 border-none flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#444746] dark:text-[#C4C7C5]">
          <p className="text-center sm:text-left">
            {t('copyright')}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#A8C7FA] animate-pulse" />
            <span>{t('systemSecure')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
