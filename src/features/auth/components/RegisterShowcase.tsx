'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const SHOWCASE_IMG_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1W-ZzpMO6raM3-SNWM4CV44zZoy_xeMzikzoqYGoUSwK4IcCEG_7J1NZrUHsBAeaT8rkE017HE98Ki0tQYcgNVlMU_pdL8_ITYkuT-XC5sD8peRX7kG7hX8zb-VSpKGzChuAHrHZmD4v7Hr0YoigTPEmMMSwRbGXf3U7_MXgMzIuKNT_tvtwRSvS6gspOPNZjPmbW2MRxOSazlQq_sipoOXtBeesjdwjPvLfWgR6iIK1X8PH5_lVYGXo9v3';

export function RegisterShowcase() {
  const t = useTranslations('auth.registerShowcase');

  return (
    <div className="hidden lg:flex lg:col-span-5 flex-col justify-between relative pl-2 h-full">
      <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-[0_24px_60px_-12px_rgba(13,28,50,0.12)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] bg-white/70 dark:bg-[#161F33]/70 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between p-6 backdrop-blur-md">
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
          <div className="backdrop-blur-xl bg-white/90 dark:bg-[#0F172A]/85 border border-slate-200/80 dark:border-slate-700/80 px-4 py-3 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-[#38BDF8] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-none">
                  {t('aiTutorTitle')}
                </p>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-[#38BDF8]/20 dark:text-[#38BDF8] border border-transparent dark:border-[#38BDF8]/30 text-[10px] font-semibold">
                  {t('aiTutorBadge')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mt-1">
                <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">4.9/5</span>
                <span>•</span>
                <span>{t('instantFeedback')}</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-blue-600/90 dark:bg-[#38BDF8]/15 border border-transparent dark:border-[#38BDF8]/30 text-white dark:text-[#38BDF8] px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-white dark:bg-[#38BDF8] animate-ping" />
            <span>{t('sandbox')}</span>
          </div>
        </div>

        {/* Middle Floating Glass Badge 2: Adaptive Curriculum Track */}
        <div className="relative z-10 my-auto py-8">
          <div className="max-w-[280px] backdrop-blur-xl bg-white/90 dark:bg-[#0F172A]/90 border border-slate-200/80 dark:border-slate-700/80 p-4 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6)] transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-600 dark:text-[#38BDF8] font-bold uppercase tracking-wider">
                {t('roadmapLabel')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-[#38BDF8]/20 dark:border dark:border-[#38BDF8]/30 dark:text-[#38BDF8] text-[11px] font-bold">
                {t('levelBadge')}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2 leading-tight">
              {t('curriculumTitle')}
            </p>
            {/* Progress Visualization */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-600 dark:via-[#0284C7] dark:to-[#38BDF8] h-full w-4/5 rounded-full" />
            </div>
            <div className="flex justify-between items-center mt-2 text-slate-500 dark:text-slate-400 text-xs">
              <span>{t('interactiveLabs')}</span>
              <span className="font-semibold text-blue-600 dark:text-[#38BDF8]">{t('readyProgress')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Showcase: Social Proof Strip */}
        <div className="relative z-10 backdrop-blur-xl bg-white/90 dark:bg-[#161D2F]/80 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#161D2F] bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-[#38BDF8] flex items-center justify-center font-bold text-xs">NL</div>
                <div className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#161D2F] bg-indigo-100 text-indigo-700 dark:bg-blue-900/60 dark:text-white flex items-center justify-center font-bold text-xs">TD</div>
                <div className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#161D2F] bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-[#38BDF8] flex items-center justify-center font-bold text-xs">MK</div>
                <div className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#161D2F] bg-blue-600 text-white dark:bg-[#38BDF8] dark:text-slate-900 flex items-center justify-center font-bold text-[11px]">+50k</div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{t('learnerCount')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('universities')}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200 font-medium">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#38BDF8] text-[16px]">verified</span>
              {t('certTitle')}
            </span>
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-[#38BDF8] font-semibold">
              <span className="material-symbols-outlined text-[16px]">school</span>
              {t('certBadge')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
