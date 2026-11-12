'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function RegisterTrustMetrics() {
  const t = useTranslations('auth.trustMetrics');

  const metrics = [
    {
      icon: 'security',
      label: t('m1'),
    },
    {
      icon: 'bolt',
      label: t('m2'),
    },
    {
      icon: 'terminal',
      label: t('m3'),
    },
    {
      icon: 'support_agent',
      label: t('m4'),
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
      {metrics.map((metric) => (
        <div
          key={metric.icon}
          className="bg-white dark:bg-[#1E1F20] border-none rounded-2xl p-3 shadow-none flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[20px]">
            {metric.icon}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-[#C4C7C5]">
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}
