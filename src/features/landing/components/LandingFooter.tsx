'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function LandingFooter() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="w-full bg-white/55 dark:bg-[#030d26]/70 backdrop-blur-xl border-t border-white/50 dark:border-sky-300/12 transition-colors">
      <div className="max-w-[1560px] mx-auto px-5 sm:px-8 lg:px-14 xl:px-20 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 focus:outline-none">
            <img src="/logo-full.png" alt="ILMS Logo" className="h-7 w-auto object-contain" />
          </Link>
          <span className="text-sm text-slate-700 dark:text-sky-100/80 font-medium">
            {t('copyright')}
          </span>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/terms"
            className="text-xs sm:text-sm text-slate-600 dark:text-sky-200/75 hover:text-blue-700 dark:hover:text-white font-medium transition-colors"
          >
            {t('terms')}
          </Link>
          <Link
            href="/privacy"
            className="text-xs sm:text-sm text-slate-600 dark:text-sky-200/75 hover:text-blue-700 dark:hover:text-white font-medium transition-colors"
          >
            {t('privacy')}
          </Link>
          <a
            href="#lien-he"
            className="text-xs sm:text-sm text-slate-600 dark:text-sky-200/75 hover:text-blue-700 dark:hover:text-white font-medium transition-colors"
          >
            {t('contact')}
          </a>
        </div>
      </div>
    </footer>
  );
}
