'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LayoutGrid, TrendingUp, Bot } from 'lucide-react';

export function LandingHeatmapCard() {
  const t = useTranslations('landing.heatmapCard');

  return (
    <>
      <div className="relative w-full -mt-8 sm:-ml-6 bg-white dark:bg-[#1E1F20] border-none rounded-3xl shadow-none p-5 sm:p-6 transition-transform hover:-translate-y-1 duration-300 z-30">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA]">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {t('cardTitle')}
              </h4>
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                {t('studentName', { name: 'Trần Nhật Minh' })}
              </p>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995] px-3 py-1 rounded-full text-xs font-semibold border-none">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('growthBadge')}</span>
          </div>
        </div>

        {/* Heatmap Grid Matrix (8 cols x 3 rows) - De-saturated Muted Pastel Scale */}
        <div className="mt-4 space-y-2">
          {/* Row 1 */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
            <div className="h-6 rounded-lg bg-[#C4EED0] dark:bg-[#142E20] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#C4EED0] dark:bg-[#142E20] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#FCEBA4] dark:bg-[#3C2A1E] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#FCEBA4] dark:bg-[#3C2A1E] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#A8C7FA] dark:bg-[#162B4D] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#A8C7FA] dark:bg-[#162B4D] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#6CC38D] dark:bg-[#81C995] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#6CC38D] dark:bg-[#81C995] hover:scale-105 transition-transform" />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
            <div className="h-6 rounded-lg bg-[#C4EED0] dark:bg-[#142E20] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#FCEBA4] dark:bg-[#3C2A1E] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#FCEBA4] dark:bg-[#3C2A1E] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#A8C7FA] dark:bg-[#162B4D] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#A8C7FA] dark:bg-[#162B4D] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#6CC38D] dark:bg-[#81C995] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#6CC38D] dark:bg-[#81C995] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#6CC38D] dark:bg-[#81C995] hover:scale-105 transition-transform" />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
            <div className="h-6 rounded-lg bg-[#C4EED0] dark:bg-[#142E20] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#C4EED0] dark:bg-[#142E20] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#FCEBA4] dark:bg-[#3C2A1E] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#FCEBA4] dark:bg-[#3C2A1E] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#A8C7FA] dark:bg-[#162B4D] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#A8C7FA] dark:bg-[#162B4D] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#6CC38D] dark:bg-[#81C995] hover:scale-105 transition-transform" />
            <div className="h-6 rounded-lg bg-[#6CC38D] dark:bg-[#81C995] hover:scale-105 transition-transform" />
          </div>
        </div>

        {/* Legend & Frequency */}
        <div className="mt-4 pt-1 flex flex-wrap items-center justify-between text-[#444746] dark:text-[#C4C7C5] text-xs gap-2">
          <div className="flex items-center gap-1.5">
            <span>{t('levelLabel')}</span>
            <span className="inline-block w-3 h-3 rounded-full bg-[#C4EED0] dark:bg-[#142E20]" />
            <span className="text-[#444746] dark:text-[#C4C7C5]">{t('levelWeak')}</span>
            <span className="inline-block w-3 h-3 rounded-full bg-[#FCEBA4] dark:bg-[#3C2A1E]" />
            <span className="text-[#444746] dark:text-[#C4C7C5]">{t('levelProgressing')}</span>
            <span className="inline-block w-3 h-3 rounded-full bg-[#6CC38D] dark:bg-[#81C995]" />
            <span className="font-medium text-[#0D652D] dark:text-[#81C995]">
              {t('levelMastered')}
            </span>
          </div>
          <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-semibold">
            {t('practiceFrequency')}
          </span>
        </div>
      </div>

      {/* Floating Widget: AI Socratic */}
      <div className="absolute -top-3 -right-2 sm:-right-4 bg-white dark:bg-[#1E1F20] border-none px-4 py-2.5 rounded-full shadow-none flex items-center gap-2.5 z-40 animate-bounce duration-1000">
        <div className="w-7 h-7 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] font-bold">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {t('aiFloatingTitle')}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
          </div>
          <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">
            {t('aiFloatingSub')}
          </span>
        </div>
      </div>
    </>
  );
}
