'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function PublicMinimalFooter() {
  const tFooter = useTranslations('pricing.footer');
  const tLegal = useTranslations('legal.common');

  return (
    <footer className="w-full border-t border-slate-200 dark:border-[#3c4043] bg-white dark:bg-[#131314] relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <img
            src="/logo-full.png"
            alt="ILMS Logo"
            className="h-6 w-auto object-contain opacity-80"
          />
          <p className="text-xs text-slate-500 dark:text-[#8e918f]">
            {tFooter('copyright')}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-[#8e918f]">
          <Link href="/about" className="hover:text-slate-900 dark:hover:text-[#e3e3e3] transition-colors">
            {tLegal('aboutLink')}
          </Link>
          <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-[#e3e3e3] transition-colors">
            {tLegal('pricingLink')}
          </Link>
          <Link href="/terms" className="hover:text-slate-900 dark:hover:text-[#e3e3e3] transition-colors">
            {tLegal('termsTab')}
          </Link>
          <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-[#e3e3e3] transition-colors">
            {tLegal('privacyTab')}
          </Link>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043]">
            <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[14px]">
              verified_user
            </span>
            <span>{tFooter('soc2')}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043]">
            <span className="material-symbols-outlined text-blue-600 dark:text-[#a8c7fa] text-[14px]">
              lock
            </span>
            <span>{tFooter('ssl')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
