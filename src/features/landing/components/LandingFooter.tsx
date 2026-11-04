'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function LandingFooter() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="w-full bg-slate-50 dark:bg-[#080C14] border-t border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="flex items-center gap-3">
          <div className="py-1 px-1.5 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <img
              src="/logo-dark.png"
              alt="ILMS"
              className="h-7 w-auto object-contain hidden dark:block brightness-110 contrast-125"
            />
            <img
              src="/logo-light.png"
              alt="ILMS"
              className="h-7 w-auto object-contain block dark:hidden"
            />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {t('copyright')}
          </span>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/terms"
            className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
          >
            {t('terms')}
          </Link>
          <Link
            href="/privacy"
            className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
          >
            {t('privacy')}
          </Link>
          <a
            href="#lien-he"
            className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
          >
            {t('contact')}
          </a>
        </div>
      </div>
    </footer>
  );
}
