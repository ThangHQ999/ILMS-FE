'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PasswordStrength } from '../hooks/useRegisterForm';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
}

export function PasswordStrengthMeter({ strength }: PasswordStrengthMeterProps) {
  const t = useTranslations('auth.register');
  const { score, label } = strength;

  const getBarColor = (index: number) => {
    if (index >= score) return 'bg-slate-200 dark:bg-slate-800';
    if (score <= 1) return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]';
    if (score === 2) return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]';
    if (score === 3) return 'bg-blue-500 dark:bg-[#38BDF8] shadow-[0_0_6px_rgba(56,189,248,0.5)]';
    return 'bg-blue-600 dark:bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.6)]';
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <span className="material-symbols-outlined text-blue-600 dark:text-[#38BDF8] text-[16px]">
            verified
          </span>
          <span>{t('strengthTitle')}</span>
          <span className="font-semibold text-blue-600 dark:text-[#38BDF8]">
            {label}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {t('criteriaCount', { score })}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(index)}`}
          />
        ))}
      </div>
    </div>
  );
}
