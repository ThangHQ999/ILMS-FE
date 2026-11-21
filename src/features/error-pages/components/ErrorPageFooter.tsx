'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function ErrorPageFooter() {
  const t = useTranslations('errors');

  return (
    <footer className="w-full bg-white dark:bg-[#1E1F20] border-none py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-3 text-xs text-[#444746] dark:text-[#C4C7C5]">
          <span className="font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">ILMS</span>
          <span>© 2026 EduTech Innovations. {t('copyright')}</span>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-6 text-xs text-[#444746] dark:text-[#C4C7C5] font-medium">
          <Link
            href="/settings"
            className="hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] transition-colors"
          >
            {t('footerSupportCenter')}
          </Link>
          <Link
            href="/terms"
            className="hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] transition-colors"
          >
            {t('footerTermsAndPolicies')}
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#C4C7C5] border-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('systemOperational')}
          </span>
        </div>
      </div>
    </footer>
  );
}
