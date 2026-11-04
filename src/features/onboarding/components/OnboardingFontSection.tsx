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
      <legend className="text-base font-semibold text-slate-900 dark:text-white mb-3.5 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          4
        </span>
        {t('legend')}
      </legend>

      <div className="bg-slate-50 dark:bg-[#161D2F] rounded-xl p-4 flex flex-col gap-3.5 border border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="text-xs uppercase tracking-wider text-slate-900 dark:text-white font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-[#38BDF8]">
              text_fields
            </span>
            {t('header')}
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
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
                className={`relative rounded-xl p-3 text-left transition-all bg-white dark:bg-[#0B0F19] flex flex-col justify-between border ${
                  isSelected
                    ? 'border-2 border-blue-600 dark:border-[#38BDF8] shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-600 dark:bg-[#38BDF8] text-white dark:text-slate-900 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[11px]">check</span>
                  </span>
                )}

                <div>
                  <div
                    className="text-sm font-bold text-slate-900 dark:text-white"
                    style={{ fontFamily: `'${f.name}', sans-serif` }}
                  >
                    {f.name}
                  </div>
                  <div className="text-[11px] text-blue-600 dark:text-[#38BDF8] font-medium mb-1.5">
                    {f.tag}
                  </div>
                  <p
                    className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2"
                    style={{ fontFamily: `'${f.name}', sans-serif` }}
                  >
                    {f.description}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-[10px]">{f.weights}</span>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-[#38BDF8] px-1.5 py-0.5 rounded font-medium">
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
