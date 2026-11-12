'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function AuthFooter() {
  const t = useTranslations('auth.footer');

  return (
    <footer className="w-full border-none bg-white py-4 shadow-none dark:bg-[#131314]">
      <div className="flex w-full flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 md:px-8 text-xs text-[#444746] dark:text-[#C4C7C5]">
        {/* Copyright */}
        <div className="text-center md:text-left">
          <span>{t('copyright')}</span>
        </div>

        {/* Security Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 text-[#444746] dark:text-[#C4C7C5]">
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">lock</span>
            <span className="font-medium">{t('ssl')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#444746] dark:text-[#C4C7C5]">
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">verified_user</span>
            <span className="font-medium">{t('gdpr')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#444746] dark:text-[#C4C7C5]">
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">security</span>
            <span className="font-medium">{t('iso')}</span>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="transition-colors hover:text-[#0B57D0] dark:hover:text-[#A8C7FA]"
          >
            {t('privacy')}
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-[#0B57D0] dark:hover:text-[#A8C7FA]"
          >
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
