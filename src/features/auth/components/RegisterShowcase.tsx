'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const SHOWCASE_IMG_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1W-ZzpMO6raM3-SNWM4CV44zZoy_xeMzikzoqYGoUSwK4IcCEG_7J1NZrUHsBAeaT8rkE017HE98Ki0tQYcgNVlMU_pdL8_ITYkuT-XC5sD8peRX7kG7hX8zb-VSpKGzChuAHrHZmD4v7Hr0YoigTPEmMMSwRbGXf3U7_MXgMzIuKNT_tvtwRSvS6gspOPNZjPmbW2MRxOSazlQq_sipoOXtBeesjdwjPvLfWgR6iIK1X8PH5_lVYGXo9v3';

export function RegisterShowcase() {
  const t = useTranslations('auth.registerShowcase');

  return (
    <div className="hidden lg:flex lg:col-span-5 flex-col justify-between relative pl-2 h-full">
      <div className="w-full h-full relative rounded-3xl overflow-hidden bg-white/70 dark:bg-[#1E1F20] border-none shadow-none flex flex-col justify-between p-6">
        {/* Background Showcase Image with Soft Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            alt={t('imageAlt')}
            className="w-full h-full object-contain rounded-2xl select-none pointer-events-none transform scale-100 hover:scale-105 transition-transform duration-700 ease-out"
            src={SHOWCASE_IMG_URL}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/90 dark:from-[#0B0F19]/90 via-transparent to-white/40 dark:to-[#161F33]/40" />
        </div>

        {/* Top Floating Glass Badge 1: AI Assistant Score */}
        <div className="relative z-10 flex justify-between items-start gap-2">
          <div className="bg-white dark:bg-[#1E1F20] border-none shadow-none px-4 py-3 rounded-3xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA]">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#E3E3E3] leading-none">
                  {t('aiTutorTitle')}
                </p>
                <span className="px-2 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] border-none text-[10px] font-medium">
                  {t('aiTutorBadge')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-[#C4C7C5] text-xs mt-1">
                <span className="material-symbols-outlined text-[14px] text-[#B58500] dark:text-[#FDD663]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-semibold text-slate-800 dark:text-[#E3E3E3]">4.9/5</span>
                <span>•</span>
                <span>{t('instantFeedback')}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] px-3.5 py-1.5 rounded-full border-none shadow-none flex items-center gap-1.5 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-ping" />
            <span>{t('sandbox')}</span>
          </div>
        </div>

        {/* Middle Floating Glass Badge 2: Adaptive Curriculum Track */}
        <div className="relative z-10 my-auto py-8">
          <div className="max-w-[280px] bg-white dark:bg-[#1E1F20] border-none shadow-none p-4 rounded-3xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#0B57D0] dark:text-[#A8C7FA] font-medium uppercase tracking-wider">
                {t('roadmapLabel')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] border-none text-[11px] font-medium">
                {t('levelBadge')}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#E3E3E3] mb-2 leading-tight">
              {t('curriculumTitle')}
            </p>
            {/* Progress Visualization */}
            <div className="w-full bg-[#F0F4F9] dark:bg-[#282A2C] h-2 rounded-full overflow-hidden">
              <div className="bg-[#0B57D0] dark:bg-[#A8C7FA] h-full w-4/5 rounded-full" />
            </div>
            <div className="flex justify-between items-center mt-2 text-slate-500 dark:text-[#C4C7C5] text-xs">
              <span>{t('interactiveLabs')}</span>
              <span className="font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">{t('readyProgress')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Showcase: Social Proof Strip */}
        <div className="relative z-10 bg-white dark:bg-[#1E1F20] border-none shadow-none rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center font-medium text-xs">NL</div>
                <div className="w-8 h-8 rounded-full bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] flex items-center justify-center font-medium text-xs">TD</div>
                <div className="w-8 h-8 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] flex items-center justify-center font-medium text-xs">MK</div>
                <div className="w-8 h-8 rounded-full bg-[#F0F4F9] text-slate-700 dark:bg-[#282A2C] dark:text-[#E3E3E3] flex items-center justify-center font-bold text-[11px]">+50k</div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">{t('learnerCount')}</p>
                <p className="text-xs text-slate-500 dark:text-[#C4C7C5]">{t('universities')}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#E1E5EA] dark:border-[#282A2C] text-xs text-slate-500 dark:text-[#C4C7C5]">
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-[#E3E3E3] font-medium">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[16px]">verified</span>
              {t('certTitle')}
            </span>
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-[#A8C7FA] font-semibold">
              <span className="material-symbols-outlined text-[16px]">school</span>
              {t('certBadge')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
