'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface OnboardingFooterProps {
  isSubmitting: boolean;
  onSubmit: (isDefault: boolean) => void;
  toastMessage: string | null;
}

export function OnboardingFooter({
  isSubmitting,
  onSubmit,
  toastMessage,
}: OnboardingFooterProps) {
  const t = useTranslations('onboarding.footer');

  return (
    <>
      {/* Card Actions */}
      <footer className="mt-8 pt-6 border-none flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Skip Action */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onSubmit(true)}
          className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-[#C4C7C5] dark:hover:text-white transition-colors py-2.5 px-5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] order-2 sm:order-1"
        >
          {t('skip')}
        </button>

        {/* Primary Confirmation Action */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onSubmit(false)}
          className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium text-sm border-none shadow-none transition-colors flex items-center justify-center gap-2 order-1 sm:order-2 group disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          <span>{isSubmitting ? t('submitting') : t('submit')}</span>
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </footer>

      {/* Security & System Trust Indicators */}
      <aside className="w-full max-w-[960px] mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-500 dark:text-[#C4C7C5] text-xs">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
            verified_user
          </span>
          <span>{t('trust1')}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
            sync
          </span>
          <span>{t('trust2')}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5 font-mono">
          <span>{t('version')}</span>
        </div>
      </aside>

      {/* Notification Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-[#1E1F20] text-white dark:bg-[#282A2C] px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-300 transform border-none ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[#81C995] text-[20px]">
          check_circle
        </span>
        <span className="text-sm font-medium">{toastMessage}</span>
      </div>
    </>
  );
}
