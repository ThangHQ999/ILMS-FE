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
      <legend className="text-base font-semibold text-slate-900 dark:text-[#E3E3E3] mb-3.5 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] whitespace-nowrap text-xs font-bold flex items-center justify-center">
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
          className={`group relative text-left rounded-3xl p-5 transition-all duration-200 border-none ${
            layout === 'focus'
              ? 'bg-[#D3E3FD]/50 dark:bg-[#162B4D] shadow-none'
              : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] shadow-none'
          }`}
        >
          {layout === 'focus' && (
            <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] flex items-center justify-center shadow-none">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
          )}

          {/* Mini Wireframe: Video + Chat */}
          <div className="w-full h-24 bg-white dark:bg-[#1E1F20] rounded-2xl p-2.5 mb-3.5 flex gap-2 overflow-hidden pointer-events-none border-none">
            <div className="flex-1 h-full rounded-xl bg-[#D3E3FD] dark:bg-[#162B4D] flex flex-col justify-between p-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
                <div className="w-12 h-1.5 rounded-full bg-[#A8C7FA] dark:bg-blue-700/50" />
              </div>
              <div className="flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[22px]">
                  play_circle
                </span>
              </div>
              <div className="w-full h-1 rounded-full bg-[#A8C7FA]/60 dark:bg-blue-800/40" />
            </div>

            <div className="w-1/3 h-full rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] p-2 flex flex-col gap-1.5 justify-center">
              <div className="w-4/5 h-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#333537]" />
              <div className="w-full h-1.5 rounded-full bg-[#D3E3FD] dark:bg-blue-500/30" />
              <div className="w-3/5 h-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#333537]" />
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-900 dark:text-[#E3E3E3]">
            {t('focusTitle')}
          </div>
          <div className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-1 leading-relaxed">
            {t('focusDesc')}
          </div>
        </button>

        {/* Card 2: Chế độ Phân tích */}
        <button
          type="button"
          role="radio"
          aria-checked={layout === 'analytics'}
          onClick={() => onSelectLayout('analytics')}
          className={`group relative text-left rounded-3xl p-5 transition-all duration-200 border-none ${
            layout === 'analytics'
              ? 'bg-[#D3E3FD]/50 dark:bg-[#162B4D] shadow-none'
              : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] shadow-none'
          }`}
        >
          {layout === 'analytics' && (
            <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] flex items-center justify-center shadow-none">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
          )}

          {/* Mini Wireframe: Heatmap + Metrics */}
          <div className="w-full h-24 bg-white dark:bg-[#1E1F20] rounded-2xl p-2.5 mb-3.5 flex flex-col justify-between pointer-events-none border-none">
            <div className="flex justify-between items-center">
              <div className="w-14 h-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]" />
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
                <div className="w-2 h-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]" />
                <div className="w-2 h-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]" />
              </div>
            </div>

            {/* Activity Heatmap Grid */}
            <div className="grid grid-cols-8 gap-1 py-1">
              <div className="h-2 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D]" />
              <div className="h-2 rounded-full bg-[#A8C7FA] dark:bg-blue-700/60" />
              <div className="h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
              <div className="h-2 rounded-full bg-[#A8C7FA] dark:bg-blue-800/50" />
              <div className="h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
              <div className="h-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]" />
              <div className="h-2 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D]" />
              <div className="h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
            </div>

            <div className="flex gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-[#D3E3FD] dark:bg-blue-500/40" />
              <div className="h-1.5 w-1/4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]" />
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-900 dark:text-[#E3E3E3]">
            {t('analyticsTitle')}
          </div>
          <div className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-1 leading-relaxed">
            {t('analyticsDesc')}
          </div>
        </button>
      </div>
    </fieldset>
  );
}
