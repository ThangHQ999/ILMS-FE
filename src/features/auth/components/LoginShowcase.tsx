'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const SHOWCASE_IMG_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1W-ZzpMO6raM3-SNWM4CV44zZoy_xeMzikzoqYGoUSwK4IcCEG_7J1NZrUHsBAeaT8rkE017HE98Ki0tQYcgNVlMU_pdL8_ITYkuT-XC5sD8peRX7kG7hX8zb-VSpKGzChuAHrHZmD4v7Hr0YoigTPEmMMSwRbGXf3U7_MXgMzIuKNT_tvtwRSvS6gspOPNZjPmbW2MRxOSazlQq_sipoOXtBeesjdwjPvLfWgR6iIK1X8PH5_lVYGXo9v3';

export function LoginShowcase() {
  const t = useTranslations('auth.showcase');

  return (
    <div className="hidden lg:flex w-full lg:max-w-2xl flex-col items-center justify-center relative">
      <div className="relative w-full max-w-2xl flex items-center justify-center">
        {/* Glow ambient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-blue-400/20 to-purple-400/15 dark:from-[#2563EB]/20 dark:via-[#38BDF8]/15 dark:to-[#A855F7]/10 rounded-full blur-3xl scale-95 pointer-events-none" />

        {/* Top Floating Card: AI Personal Tutor */}
        <div className="absolute -top-3 left-4 md:left-8 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,89,187,0.12)] border border-white dark:bg-[#0F172A]/85 dark:border-slate-700/80 dark:shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-cyan-400 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-800 dark:text-white leading-none">
                {t('aiTutorTitle')}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-cyan-950 dark:text-cyan-400 border border-transparent dark:border-cyan-800/40 text-[10px] font-semibold">
                {t('aiTutorBadge')}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-slate-500 dark:text-slate-400 text-xs">
              <span className="material-symbols-outlined text-[15px] text-amber-500 fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">4.9/5</span>
              <span>•</span>
              <span>{t('realtimeResponse')}</span>
            </div>
          </div>
        </div>

        {/* Center 3D Illustration */}
        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,35,80,0.14)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] bg-white/40 dark:bg-[#161F33]/70 border border-white/60 dark:border-slate-700/60 p-4 md:p-6 backdrop-blur-md flex items-center justify-center">
          <img
            alt={t('imageAlt')}
            className="w-full h-full object-contain rounded-2xl select-none pointer-events-none"
            src={SHOWCASE_IMG_URL}
          />
        </div>

        {/* Bottom Floating Card: Adaptive Roadmap */}
        <div className="absolute -bottom-4 right-4 md:right-8 z-20 flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,89,187,0.14)] border border-white dark:bg-[#0F172A]/90 dark:border-slate-700/80 dark:shadow-[0_16px_36px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-cyan-950/60 border border-blue-100 dark:border-cyan-800/40 flex items-center justify-center text-blue-600 dark:text-cyan-400 shadow-sm">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              track_changes
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {t('roadmapTitle')}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full w-[82%] shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
              </div>
              <span className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">{t('roadmapProgress')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Bar */}
      <div className="mt-10 w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-white/60 dark:bg-[#161D2F]/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden p-0.5">
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#161D2F] bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-700 dark:text-cyan-400 font-semibold text-xs">JD</div>
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#161D2F] bg-purple-100 dark:bg-indigo-950 flex items-center justify-center text-purple-700 dark:text-purple-300 font-semibold text-xs">AN</div>
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#161D2F] bg-blue-600 dark:bg-cyan-900 flex items-center justify-center text-white dark:text-cyan-200 font-semibold text-xs">TK</div>
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#161D2F] bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 flex items-center justify-center font-bold text-[11px]">+50k</div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-white">4.9/5</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('socialProof')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
          <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-cyan-400">verified</span>
          <span>{t('certified')}</span>
        </div>
      </div>
    </div>
  );
}
