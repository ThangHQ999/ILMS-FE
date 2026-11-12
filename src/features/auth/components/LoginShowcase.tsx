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
        {/* Top Floating Card: AI Personal Tutor */}
        <div className="absolute -top-3 left-4 md:left-8 z-20 flex items-center gap-3 px-4 py-3 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA]">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-800 dark:text-[#E3E3E3] leading-none">
                {t('aiTutorTitle')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] border-none text-[10px] font-medium">
                {t('aiTutorBadge')}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-slate-500 dark:text-[#C4C7C5] text-xs">
              <span className="material-symbols-outlined text-[15px] text-[#B58500] dark:text-[#FDD663] fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-semibold text-slate-800 dark:text-[#E3E3E3]">4.9/5</span>
              <span>•</span>
              <span>{t('realtimeResponse')}</span>
            </div>
          </div>
        </div>

        {/* Center 3D Illustration */}
        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white/70 dark:bg-[#1E1F20] border-none shadow-none p-4 md:p-6 flex items-center justify-center">
          <img
            alt={t('imageAlt')}
            className="w-full h-full object-contain rounded-2xl select-none pointer-events-none"
            src={SHOWCASE_IMG_URL}
          />
        </div>

        {/* Bottom Floating Card: Adaptive Roadmap */}
        <div className="absolute -bottom-4 right-4 md:right-8 z-20 flex items-center gap-3.5 px-5 py-3.5 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA]">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              track_changes
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 dark:text-[#E3E3E3]">
              {t('roadmapTitle')}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1.5 bg-[#F0F4F9] dark:bg-[#282A2C] rounded-full overflow-hidden">
                <div className="h-full bg-[#0B57D0] dark:bg-[#A8C7FA] rounded-full w-[82%]" />
              </div>
              <span className="text-xs text-[#0B57D0] dark:text-[#A8C7FA] font-medium">{t('roadmapProgress')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Bar */}
      <div className="mt-10 w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden p-0.5">
            <div className="inline-block h-9 w-9 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] font-medium text-xs">JD</div>
            <div className="inline-block h-9 w-9 rounded-full bg-[#FCEBA4] dark:bg-[#3C2A1E] flex items-center justify-center text-[#725200] dark:text-[#FFB784] font-medium text-xs">AN</div>
            <div className="inline-block h-9 w-9 rounded-full bg-[#C4EED0] dark:bg-[#142E20] flex items-center justify-center text-[#0D652D] dark:text-[#81C995] font-medium text-xs">TK</div>
            <div className="inline-block h-9 w-9 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-700 dark:text-[#E3E3E3] flex items-center justify-center font-bold text-[11px]">+50k</div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <div className="flex text-[#B58500] dark:text-[#FDD663]">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-[#E3E3E3]">4.9/5</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">{t('socialProof')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-700 dark:text-[#E3E3E3] text-xs font-medium">
          <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">verified</span>
          <span>{t('certified')}</span>
        </div>
      </div>
    </div>
  );
}
