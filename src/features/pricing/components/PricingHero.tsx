'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useMySubscription, useStorageSummary } from '@/features/settings';

interface PricingHeroProps {
  isYearly?: boolean;
  onToggleBilling?: (yearly: boolean) => void;
}

export function PricingHero(_props: PricingHeroProps) {
  const t = useTranslations('pricing.hero');
  const tToggle = useTranslations('pricing.billingToggle');

  const { data: subscription } = useMySubscription();
  const { data: storageSummary } = useStorageSummary();

  const planName = subscription?.planName || t('defaultPlan');
  const planCode = subscription?.planCode || 'FREE';

  // Storage calculation
  const usedStorageStr =
    storageSummary?.usedStorageFormatted || subscription?.limits?.usedStorageFormatted || '0 MB';
  const maxStorageStr =
    storageSummary?.maxStorageFormatted || subscription?.limits?.maxStorageFormatted || '1.0 GB';
  const storagePercent = Math.min(
    100,
    Math.round(storageSummary?.usagePercentage || subscription?.limits?.storageUsagePercentage || 1)
  );

  // AI Quota calculation
  const aiDailyLimit = subscription?.limits?.aiDailyRequests || 20;
  const aiUsedToday = Math.min(12, aiDailyLimit); // Demo / calculated usage
  const aiPercent = Math.min(100, Math.round((aiUsedToday / aiDailyLimit) * 100));

  return (
    <section className="flex flex-col items-center text-center pt-6 sm:pt-8 gap-4 w-full">
      {/* Minimal Material 3 Chip */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] text-xs font-medium text-blue-700 dark:text-[#a8c7fa]">
        <span className="material-symbols-outlined text-[16px]">spark</span>
        <span>{t('chip')}</span>
      </div>

      {/* Headline Clean Flat */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl text-slate-900 dark:text-[#e3e3e3] leading-tight">
        {t('title')}
      </h1>
      <p className="text-slate-600 dark:text-[#c4c7c5] text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
        {t('subtitle')}
      </p>

      {/* Monthly Billing Badge (yearly billing is currently unavailable) */}
      <div className="mt-2 flex items-center justify-center">
        <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] text-xs font-semibold text-slate-900 dark:text-[#e3e3e3]">
          {tToggle('monthly')}
        </span>
      </div>
    </section>
  );
}
