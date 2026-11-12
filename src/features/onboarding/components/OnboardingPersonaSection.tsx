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
      <legend className="text-base font-semibold text-slate-900 dark:text-[#E3E3E3] mb-3.5 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] whitespace-nowrap text-xs font-bold flex items-center justify-center">
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
              className={`text-left relative rounded-3xl p-5 transition-all duration-200 border-none ${
                isSelected
                  ? 'bg-[#D3E3FD]/50 dark:bg-[#162B4D] shadow-none'
                  : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] shadow-none'
              }`}
            >
              {isSelected && (
                <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] flex items-center justify-center shadow-none">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </span>
              )}

              <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] mb-3 pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>

              <div className="text-sm font-semibold text-slate-900 dark:text-[#E3E3E3]">
                {item.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-1 leading-relaxed">
                {item.desc}
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
