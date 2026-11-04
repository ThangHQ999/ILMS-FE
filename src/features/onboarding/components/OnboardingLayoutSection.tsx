'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LayoutMode } from '../types';

interface OnboardingLayoutSectionProps {
  layout: LayoutMode;
  onSelectLayout: (layout: LayoutMode) => void;
}

export function OnboardingLayoutSection({
  layout,
  onSelectLayout,
}: OnboardingLayoutSectionProps) {
  const t = useTranslations('onboarding.layout');

  return (
    <fieldset className="flex flex-col border-none p-0 m-0">
      <legend className="text-base font-semibold text-slate-900 dark:text-white mb-3.5 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          1
        </span>
        {t('legend')}
      </legend>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup">
        {/* Card 1: Chế độ Tập trung */}
        <button
          type="button"
          role="radio"
          aria-checked={layout === 'focus'}
          onClick={() => onSelectLayout('focus')}
          className={`group relative text-left rounded-xl p-4 transition-all duration-200 border ${
            layout === 'focus'
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-600 dark:border-[#38BDF8] shadow-sm'
              : 'bg-slate-50 dark:bg-[#161D2F] border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          {layout === 'focus' && (
            <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-blue-600 dark:bg-[#38BDF8] text-white dark:text-slate-900 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
          )}

          {/* Mini Wireframe: Video + Chat */}
          <div className="w-full h-24 bg-slate-100 dark:bg-slate-900/60 rounded-lg p-2.5 mb-3.5 flex gap-2 overflow-hidden pointer-events-none border border-slate-200/60 dark:border-slate-800">
            <div className="flex-1 h-full rounded-md bg-blue-100 dark:bg-blue-900/30 flex flex-col justify-between p-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-[#38BDF8]" />
                <div className="w-12 h-1.5 rounded-full bg-blue-300 dark:bg-blue-700/50" />
              </div>
              <div className="flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-[#38BDF8] text-[22px]">
                  play_circle
                </span>
              </div>
              <div className="w-full h-1 rounded-full bg-blue-200 dark:bg-blue-800/40" />
            </div>

            <div className="w-1/3 h-full rounded-md bg-white dark:bg-slate-800 p-2 flex flex-col gap-1.5 justify-center">
              <div className="w-4/5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-full h-1.5 rounded-full bg-blue-200 dark:bg-blue-500/30" />
              <div className="w-3/5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('focusTitle')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {t('focusDesc')}
          </div>
        </button>

        {/* Card 2: Chế độ Phân tích */}
        <button
          type="button"
          role="radio"
          aria-checked={layout === 'analytics'}
          onClick={() => onSelectLayout('analytics')}
          className={`group relative text-left rounded-xl p-4 transition-all duration-200 border ${
            layout === 'analytics'
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-600 dark:border-[#38BDF8] shadow-sm'
              : 'bg-slate-50 dark:bg-[#161D2F] border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          {layout === 'analytics' && (
            <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-blue-600 dark:bg-[#38BDF8] text-white dark:text-slate-900 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
          )}

          {/* Mini Wireframe: Heatmap + Metrics */}
          <div className="w-full h-24 bg-white dark:bg-slate-900/60 rounded-lg p-2.5 mb-3.5 flex flex-col justify-between pointer-events-none border border-slate-200/60 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <div className="w-14 h-2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded bg-blue-500 dark:bg-[#38BDF8]" />
                <div className="w-2 h-2 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="w-2 h-2 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>

            {/* Activity Heatmap Grid */}
            <div className="grid grid-cols-8 gap-1 py-1">
              <div className="h-2 rounded-sm bg-blue-200 dark:bg-blue-900/40" />
              <div className="h-2 rounded-sm bg-blue-400 dark:bg-blue-700/60" />
              <div className="h-2 rounded-sm bg-blue-600 dark:bg-[#38BDF8]" />
              <div className="h-2 rounded-sm bg-blue-300 dark:bg-blue-800/50" />
              <div className="h-2 rounded-sm bg-blue-500 dark:bg-blue-600" />
              <div className="h-2 rounded-sm bg-slate-200 dark:bg-slate-700" />
              <div className="h-2 rounded-sm bg-blue-200 dark:bg-blue-900/30" />
              <div className="h-2 rounded-sm bg-blue-600 dark:bg-[#38BDF8]" />
            </div>

            <div className="flex gap-2">
              <div className="h-1.5 flex-1 rounded bg-blue-300 dark:bg-blue-500/40" />
              <div className="h-1.5 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('analyticsTitle')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {t('analyticsDesc')}
          </div>
        </button>
      </div>
    </fieldset>
  );
}
