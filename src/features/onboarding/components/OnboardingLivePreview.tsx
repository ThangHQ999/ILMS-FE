'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ColorOption, FontFamilyName, AiPersona } from '../types';

interface OnboardingLivePreviewProps {
  primaryColor: ColorOption;
  secondaryColor: ColorOption;
  tertiaryColor: ColorOption;
  fontFamily: FontFamilyName;
  persona: AiPersona;
}

export function OnboardingLivePreview({
  primaryColor,
  secondaryColor,
  tertiaryColor,
  fontFamily,
  persona,
}: OnboardingLivePreviewProps) {
  const t = useTranslations('onboarding.preview');

  const getPersonaTitle = () => {
    if (persona === 'cheerleader') return t('assistantCheerleader');
    if (persona === 'academic') return t('assistantAcademic');
    return t('assistantSocratic');
  };

  return (
    <div className="md:col-span-7 bg-slate-50 dark:bg-[#161D2F] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden border border-slate-200 dark:border-slate-800">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#38BDF8]">
              preview
            </span>
            {t('title')}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-[#38BDF8]/20 text-blue-700 dark:text-[#38BDF8] text-[11px] font-semibold">
            {t('activePreset')}
          </span>
        </div>

        {/* Simulated Mini UI Widget */}
        <div
          className="bg-white dark:bg-[#0B0F19] rounded-xl p-3.5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 transition-all"
          style={{ fontFamily: `'${fontFamily}', sans-serif` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[13px] font-bold shadow-sm transition-colors duration-200"
                style={{ backgroundColor: primaryColor.hex }}
              >
                AI
              </div>
              <div>
                <div className="text-[13px] font-bold leading-tight text-slate-900 dark:text-white">
                  {getPersonaTitle()}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('syncing')}
                </div>
              </div>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-semibold text-white shadow-xs transition-colors duration-200"
              style={{ backgroundColor: secondaryColor.hex }}
            >
              {secondaryColor.name}
            </span>
          </div>

          {/* Progress Bar with Tertiary Accent */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{t('progressLabel')}</span>
              <span className="font-semibold transition-colors duration-200" style={{ color: tertiaryColor.hex }}>
                {t('progressValue')}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: '75%', backgroundColor: tertiaryColor.hex }}
              />
            </div>
          </div>

          {/* Mock Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-white text-[12px] font-medium shadow-sm transition-all"
              style={{ backgroundColor: primaryColor.hex }}
            >
              {t('ctaBtn')}
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 text-[12px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t('detailsBtn')}
            </button>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-between">
        <span>{t('caption')}</span>
        <span className="font-mono text-[10px] text-blue-600 dark:text-[#38BDF8] font-medium">
          Font: {fontFamily}
        </span>
      </div>
    </div>
  );
}
