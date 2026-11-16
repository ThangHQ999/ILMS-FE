'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useMySubscription, useStorageSummary } from '@/features/settings';

interface PricingHeroProps {
  isYearly: boolean;
  onToggleBilling: (yearly: boolean) => void;
}

export function PricingHero({ isYearly, onToggleBilling }: PricingHeroProps) {
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

      {/* Current Status Card Flat Material */}
      <div className="w-full max-w-2xl bg-slate-50 dark:bg-[#1e1f20] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-[#3c4043] mt-2">
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#282a2c] border border-blue-200 dark:border-[#3c4043] flex items-center justify-center text-blue-700 dark:text-[#a8c7fa] shrink-0">
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-[#c4c7c5]">
                {t('currentPlan')}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white dark:bg-[#282a2c] text-slate-800 dark:text-[#e3e3e3] border border-slate-200 dark:border-[#3c4043]">
                {planName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#8e918f] mt-0.5">
              {t('dailyResetHint')}
            </p>
          </div>
        </div>

        {/* Progress Quota */}
        <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end text-xs">
          {/* Storage Quota */}
          <div className="flex flex-col gap-1 w-28 sm:w-32">
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-[#8e918f]">
              <span>{t('storage')}</span>
              <span className="font-mono text-slate-800 dark:text-[#e3e3e3]">
                {usedStorageStr}/{maxStorageStr}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#282a2c] overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-[#a8c7fa] rounded-full transition-all duration-300"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>

          {/* Socratic AI Quota */}
          <div className="flex flex-col gap-1 w-28 sm:w-32">
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-[#8e918f]">
              <span className="flex items-center gap-1">
                <img src="/socratic_mascot.png" alt="AI" className="w-3.5 h-3.5 object-contain" />
                <span>{t('aiSocratic')}</span>
              </span>
              <span className="font-mono text-slate-800 dark:text-[#e3e3e3]">
                {aiUsedToday}/{aiDailyLimit}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#282a2c] overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-[#a8c7fa] rounded-full transition-all duration-300"
                style={{ width: `${aiPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle Flat */}
      <div className="mt-2 flex items-center justify-center">
        <div className="p-1 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => onToggleBilling(false)}
            type="button"
            className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
              !isYearly
                ? 'bg-white dark:bg-[#282a2c] text-slate-900 dark:text-[#e3e3e3] font-semibold shadow-xs'
                : 'text-slate-600 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3]'
            }`}
          >
            {tToggle('monthly')}
          </button>
          <button
            onClick={() => onToggleBilling(true)}
            type="button"
            className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
              isYearly
                ? 'bg-white dark:bg-[#282a2c] text-slate-900 dark:text-[#e3e3e3] font-semibold shadow-xs'
                : 'text-slate-600 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3]'
            }`}
          >
            <span>{tToggle('yearly')}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              {tToggle('savePercent')}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
