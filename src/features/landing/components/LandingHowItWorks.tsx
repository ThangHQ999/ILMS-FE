'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PlaySquare, MessagesSquare, BarChart3, MoveRight, MoveDown, Layers } from 'lucide-react';

export function LandingHowItWorks() {
  const t = useTranslations('landing.howItWorks');

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-none transition-colors"
      id="quy-trinh-hoat-dong"
    >
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs font-medium border-none shadow-none mb-4">
          <Layers className="w-4 h-4" />
          <span>{t('badge')}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight mb-3">
          {t('title')}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-[#C4C7C5] leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* 3-Step Horizontal Flow */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8 max-w-5xl mx-auto">
        {/* Step 1: Học */}
        <div className="flex-1 w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 border-none shadow-none hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center group">
          <div className="w-16 h-16 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center mb-5 border-none shadow-none group-hover:scale-110 transition-transform">
            <PlaySquare className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#041E49] dark:text-[#A8C7FA] text-[11px] font-medium tracking-wider mb-2 uppercase border-none">
            {t('step1')}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3] mb-2">
            {t('step1Title')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-[#C4C7C5] leading-relaxed">
            {t('step1Desc')}
          </p>
        </div>

        {/* Connector Arrow 1 */}
        <div className="hidden md:flex items-center justify-center text-slate-400 dark:text-[#8E918F] shrink-0">
          <MoveRight className="w-7 h-7" />
        </div>
        <div className="flex md:hidden items-center justify-center text-slate-400 dark:text-[#8E918F] py-1 shrink-0">
          <MoveDown className="w-7 h-7" />
        </div>

        {/* Step 2: Tương tác */}
        <div className="flex-1 w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 border-none shadow-none hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center group">
          <div className="w-16 h-16 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center mb-5 border-none shadow-none group-hover:scale-110 transition-transform">
            <MessagesSquare className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#041E49] dark:text-[#A8C7FA] text-[11px] font-medium tracking-wider mb-2 uppercase border-none">
            {t('step2')}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3] mb-2">
            {t('step2Title')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-[#C4C7C5] leading-relaxed">
            {t('step2Desc')}
          </p>
        </div>

        {/* Connector Arrow 2 */}
        <div className="hidden md:flex items-center justify-center text-slate-400 dark:text-[#8E918F] shrink-0">
          <MoveRight className="w-7 h-7" />
        </div>
        <div className="flex md:hidden items-center justify-center text-slate-400 dark:text-[#8E918F] py-1 shrink-0">
          <MoveDown className="w-7 h-7" />
        </div>

        {/* Step 3: Phân tích */}
        <div className="flex-1 w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 border-none shadow-none hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center group">
          <div className="w-16 h-16 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center mb-5 border-none shadow-none group-hover:scale-110 transition-transform">
            <BarChart3 className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#041E49] dark:text-[#A8C7FA] text-[11px] font-medium tracking-wider mb-2 uppercase border-none">
            {t('step3')}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3] mb-2">
            {t('step3Title')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-[#C4C7C5] leading-relaxed">
            {t('step3Desc')}
          </p>
        </div>
      </div>
    </section>
  );
}
