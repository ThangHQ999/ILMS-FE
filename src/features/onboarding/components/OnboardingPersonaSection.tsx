'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AiPersona } from '../types';

interface OnboardingPersonaSectionProps {
  persona: AiPersona;
  onSelectPersona: (persona: AiPersona) => void;
}

export function OnboardingPersonaSection({
  persona,
  onSelectPersona,
}: OnboardingPersonaSectionProps) {
  const t = useTranslations('onboarding.persona');

  const personas = [
    {
      id: 'socratic' as const,
      title: t('socraticTitle'),
      icon: 'explore',
      desc: t('socraticDesc'),
    },
    {
      id: 'cheerleader' as const,
      title: t('cheerleaderTitle'),
      icon: 'sentiment_very_satisfied',
      desc: t('cheerleaderDesc'),
    },
    {
      id: 'academic' as const,
      title: t('academicTitle'),
      icon: 'auto_stories',
      desc: t('academicDesc'),
    },
  ];

  return (
    <fieldset className="flex flex-col border-none p-0 m-0">
      <legend className="text-base font-semibold text-slate-900 dark:text-white mb-3.5 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          2
        </span>
        {t('legend')}
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" role="radiogroup">
        {personas.map((item) => {
          const isSelected = persona === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectPersona(item.id)}
              className={`text-left relative rounded-xl p-4 transition-all duration-200 border ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-600 dark:border-[#38BDF8] shadow-sm'
                  : 'bg-slate-50 dark:bg-[#161D2F] border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {isSelected && (
                <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-blue-600 dark:bg-[#38BDF8] text-white dark:text-slate-900 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </span>
              )}

              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] mb-3 pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>

              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {item.desc}
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
