'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LayoutGrid, TrendingUp, Bot } from 'lucide-react';

export function LandingHeatmapCard() {
  const t = useTranslations('landing.heatmapCard');

  return (
    <>
      <div className="relative w-full -mt-8 sm:-ml-6 bg-white dark:bg-[#161B26]/95 border border-slate-200 dark:border-slate-700/80 backdrop-blur-2xl rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/70 p-5 sm:p-6 transition-transform hover:-translate-y-1 duration-300 z-30">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#262A35] border border-blue-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-[#38BDF8]">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                {t('cardTitle')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('studentName', { name: 'Trần Nhật Minh' })}
              </p>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('growthBadge')}</span>
          </div>
        </div>

        {/* Heatmap Grid Matrix (8 cols x 3 rows) */}
        <div className="mt-4 space-y-2">
          {/* Row 1 */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
            <div className="h-6 rounded bg-rose-200 dark:bg-rose-900/70 border border-rose-300 dark:border-rose-700/60 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-rose-300 dark:bg-rose-900/70 border border-rose-400 dark:border-rose-700/60 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-amber-200 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-600/50 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-amber-300 dark:bg-amber-900/60 border border-amber-400 dark:border-amber-600/50 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-200 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-600/40 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-300 dark:bg-emerald-800/70 border border-emerald-400 dark:border-emerald-500/50 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-400 dark:bg-emerald-700/80 border border-emerald-500 dark:border-emerald-400/60 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-300/70 hover:scale-105 transition-transform" />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
            <div className="h-6 rounded bg-rose-300 dark:bg-rose-900/70 border border-rose-400 dark:border-rose-700/60 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-amber-200 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-600/50 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-amber-300 dark:bg-amber-900/60 border border-amber-400 dark:border-amber-600/50 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-200 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-600/40 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-300 dark:bg-emerald-700/80 border border-emerald-400 dark:border-emerald-400/60 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-400 dark:bg-emerald-600 border border-emerald-500 dark:border-emerald-300/70 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-200/80 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-200/80 hover:scale-105 transition-transform" />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
            <div className="h-6 rounded bg-rose-300 dark:bg-rose-900/70 border border-rose-400 dark:border-rose-700/60 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-rose-200 dark:bg-rose-900/70 border border-rose-300 dark:border-rose-700/60 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-amber-200 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-600/50 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-amber-300 dark:bg-amber-900/60 border border-amber-400 dark:border-amber-600/50 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-200 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-600/40 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-300 dark:bg-emerald-700/80 border border-emerald-400 dark:border-emerald-400/60 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-400 dark:bg-emerald-600 border border-emerald-500 dark:border-emerald-300/70 hover:scale-105 transition-transform" />
            <div className="h-6 rounded bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-200/80 hover:scale-105 transition-transform" />
          </div>
        </div>

        {/* Legend & Frequency */}
        <div className="mt-4 pt-1 flex flex-wrap items-center justify-between text-slate-500 dark:text-slate-400 text-xs gap-2">
          <div className="flex items-center gap-1.5">
            <span>{t('levelLabel')}</span>
            <span className="inline-block w-3 h-3 rounded-xs bg-rose-300 dark:bg-rose-900 border border-rose-400 dark:border-rose-600" />
            <span className="text-slate-600 dark:text-slate-300">{t('levelWeak')}</span>
            <span className="inline-block w-3 h-3 rounded-xs bg-amber-300 dark:bg-amber-800 border border-amber-400 dark:border-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">{t('levelProgressing')}</span>
            <span className="inline-block w-3 h-3 rounded-xs bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-400" />
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              {t('levelMastered')}
            </span>
          </div>
          <span className="text-slate-700 dark:text-slate-200 font-semibold">
            {t('practiceFrequency')}
          </span>
        </div>
      </div>

      {/* Floating Widget: AI Socratic */}
      <div className="absolute -top-3 -right-2 sm:-right-4 bg-white dark:bg-[#161B26]/95 border border-blue-200 dark:border-[#38BDF8]/40 backdrop-blur-md px-3 sm:px-4 py-2 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-cyan-500/20 flex items-center gap-2.5 z-40 animate-bounce duration-1000">
        <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-[#38BDF8] flex items-center justify-center text-white dark:text-slate-950 shadow-xs font-bold">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {t('aiFloatingTitle')}
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#38BDF8] animate-pulse" />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-300">
            {t('aiFloatingSub')}
          </span>
        </div>
      </div>
    </>
  );
}
