'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function LandingFooter() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="w-full bg-white dark:bg-[#1E1F20] border-none shadow-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 focus:outline-none">
            <img src="/logo-full.png" alt="ILMS Logo" className="h-7 w-auto object-contain" />
          </Link>
          <span className="text-sm text-slate-600 dark:text-[#C4C7C5]">
            {t('copyright')}
          </span>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/terms"
            className="text-xs sm:text-sm text-slate-500 dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-white transition-colors"
          >
            {t('terms')}
          </Link>
          <Link
            href="/privacy"
            className="text-xs sm:text-sm text-slate-500 dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-white transition-colors"
          >
            {t('privacy')}
          </Link>
          <a
            href="#lien-he"
            className="text-xs sm:text-sm text-slate-500 dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-white transition-colors"
          >
            {t('contact')}
          </a>
        </div>
      </div>
    </footer>
  );
}
