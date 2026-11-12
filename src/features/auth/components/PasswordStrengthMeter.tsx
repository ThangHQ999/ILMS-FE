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
    if (index >= score) return 'bg-[#E1E5EA] dark:bg-[#1E1F20]';
    if (score <= 1) return 'bg-[#B3261E] dark:bg-[#F28B82]';
    if (score === 2) return 'bg-[#B58500] dark:bg-[#FFB784]';
    if (score === 3) return 'bg-[#0B57D0] dark:bg-[#A8C7FA]';
    return 'bg-[#0D652D] dark:bg-[#81C995]';
  };

  return (
    <div className="bg-[#F0F4F9] dark:bg-[#282A2C] rounded-2xl p-3 border-none shadow-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#C4C7C5] font-medium">
          <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[16px]">
            verified
          </span>
          <span>{t('strengthTitle')}</span>
          <span className="font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
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
