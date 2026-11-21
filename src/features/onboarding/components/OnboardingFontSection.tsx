'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FontFamilyName } from '../types';

interface OnboardingFontSectionProps {
  fontFamily: FontFamilyName;
  onSelectFont: (font: FontFamilyName) => void;
}

export function OnboardingFontSection({
  fontFamily,
  onSelectFont,
}: OnboardingFontSectionProps) {
  const t = useTranslations('onboarding.fonts');

  const fontsList: {
    name: FontFamilyName;
    tag: string;
    description: string;
    weights: string;
    badge: string;
  }[] = [
    {
      name: 'Plus Jakarta Sans',
      tag: t('pjsTag'),
      description: t('pjsDesc'),
      weights: '700 / 600 / 500',
      badge: t('pjsBadge'),
    },
    {
      name: 'Inter',
      tag: t('interTag'),
      description: t('interDesc'),
      weights: '600 / 500 / 400',
      badge: t('interBadge'),
    },
    {
      name: 'Montserrat',
      tag: t('montTag'),
      description: t('montDesc'),
      weights: '700 / 600 / 400',
      badge: t('montBadge'),
    },
    {
      name: 'Be Vietnam Pro',
      tag: t('bvpTag'),
      description: t('bvpDesc'),
      weights: '700 / 500 / 400',
      badge: t('bvpBadge'),
    },
  ];

  return (
    <fieldset className="flex flex-col border-none p-0 m-0">
      <legend className="text-base font-semibold text-slate-900 dark:text-[#E3E3E3] mb-3.5 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] whitespace-nowrap text-xs font-bold flex items-center justify-center">
          4
        </span>
        {t('legend')}
      </legend>

      <div className="bg-[#F0F4F9] dark:bg-[#282A2C] rounded-3xl p-5 flex flex-col gap-3.5 border-none shadow-none">
        <div className="pb-2">
          <div className="text-xs uppercase tracking-wider text-[#1F1F1F] dark:text-[#E3E3E3] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
              text_fields
            </span>
            {t('header')}
          </div>
          <p className="text-[12px] text-[#444746] dark:text-[#C4C7C5] mt-0.5">
            {t('desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fontsList.map((f) => {
            const isSelected = fontFamily === f.name;
            return (
              <button
                key={f.name}
                type="button"
                onClick={() => onSelectFont(f.name)}
                className={`relative rounded-2xl p-3.5 text-left transition-all flex flex-col justify-between border-none ${
                  isSelected
                    ? 'bg-[#D3E3FD]/50 dark:bg-[#162B4D] shadow-none'
                    : 'bg-white dark:bg-[#1E1F20] hover:bg-slate-100 dark:hover:bg-[#333537] shadow-none'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px]">check</span>
                  </span>
                )}

                <div>
                  <div
                    className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]"
                    style={{ fontFamily: `'${f.name}', sans-serif` }}
                  >
                    {f.name}
                  </div>
                  <div className="text-[11px] text-[#0B57D0] dark:text-[#A8C7FA] font-medium mb-1.5">
                    {f.tag}
                  </div>
                  <p
                    className="text-[12px] text-[#444746] dark:text-[#C4C7C5] leading-snug line-clamp-2"
                    style={{ fontFamily: `'${f.name}', sans-serif` }}
                  >
                    {f.description}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-none flex items-center justify-between text-[11px] text-[#444746] dark:text-[#8E918F]">
                  <span className="font-mono text-[10px]">{f.weights}</span>
                  <span className="text-[10px] bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] px-2 py-0.5 rounded-full font-medium border-none">
                    {f.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}
