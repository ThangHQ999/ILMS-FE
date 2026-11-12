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
    <div className="md:col-span-7 bg-[#F0F4F9] dark:bg-[#1E1F20] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden border-none shadow-none">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-[#444746] dark:text-[#C4C7C5] font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
              preview
            </span>
            {t('title')}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-xs font-semibold border-none">
            {t('activePreset')}
          </span>
        </div>

        {/* Simulated Mini UI Widget */}
        <div
          className="bg-white dark:bg-[#131314] rounded-2xl p-4 shadow-none border-none flex flex-col gap-3 transition-all"
          style={{ fontFamily: `'${fontFamily}', sans-serif` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[13px] font-bold shadow-none transition-colors duration-200"
                style={{ backgroundColor: primaryColor.hex }}
              >
                AI
              </div>
              <div>
                <div className="text-[13px] font-bold leading-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {getPersonaTitle()}
                </div>
                <div className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">
                  {t('syncing')}
                </div>
              </div>
            </div>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white transition-colors duration-200"
              style={{ backgroundColor: secondaryColor.hex }}
            >
              {secondaryColor.name}
            </span>
          </div>

          {/* Progress Bar with Tertiary Accent */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[#444746] dark:text-[#C4C7C5]">
              <span>{t('progressLabel')}</span>
              <span className="font-semibold transition-colors duration-200" style={{ color: tertiaryColor.hex }}>
                {t('progressValue')}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] overflow-hidden flex">
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
              className="px-4 py-1.5 rounded-full text-white text-[12px] font-medium border-none shadow-none transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor.hex }}
            >
              {t('ctaBtn')}
            </button>
            <button
              type="button"
              className="px-4 py-1.5 rounded-full text-[#1F1F1F] dark:text-[#E3E3E3] text-[12px] font-medium bg-[#F0F4F9] dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] transition-colors border-none cursor-pointer"
            >
              {t('detailsBtn')}
            </button>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-[#444746] dark:text-[#C4C7C5] mt-3 flex items-center justify-between">
        <span>{t('caption')}</span>
        <span className="font-mono text-[10px] text-[#0B57D0] dark:text-[#A8C7FA] font-medium">
          Font: {fontFamily}
        </span>
      </div>
    </div>
  );
}
