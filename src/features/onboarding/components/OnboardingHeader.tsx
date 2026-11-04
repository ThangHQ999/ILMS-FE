'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function OnboardingHeader() {
  const t = useTranslations('onboarding.header');

  return (
    <header className="flex flex-col items-center text-center pb-6 sm:pb-8">
      {/* Top Badge & Logo */}
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-[#38BDF8]/15 dark:border dark:border-[#38BDF8]/30 dark:text-[#38BDF8] text-xs font-semibold shadow-sm">
          <span className="material-symbols-outlined text-[14px]">tune</span>
          {t('step')}
        </span>
        <div className="h-10 flex items-center justify-center my-1">
          <Link href="/">
            <img
              alt="ILMS Logo"
              className="h-9 sm:h-10 w-auto object-contain"
              src="/logo.png"
            />
          </Link>
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mt-3">
        {t('title')}
      </h1>

      {/* Supporting Description */}
      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2 text-center leading-relaxed">
        {t('subtitle')}
      </p>
    </header>
  );
}
