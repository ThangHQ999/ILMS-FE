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
      <footer className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Skip Action */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onSubmit(true)}
          className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 order-2 sm:order-1"
        >
          {t('skip')}
        </button>

        {/* Primary Confirmation Action */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onSubmit(false)}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-[#38BDF8] dark:hover:bg-[#38BDF8]/90 text-white dark:text-slate-900 font-semibold text-sm shadow-lg shadow-blue-600/20 dark:shadow-[#38BDF8]/20 transition-all flex items-center justify-center gap-2 order-1 sm:order-2 group disabled:opacity-50"
        >
          <span>{isSubmitting ? t('submitting') : t('submit')}</span>
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </footer>

      {/* Security & System Trust Indicators */}
      <aside className="w-full max-w-[960px] mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#38BDF8]">
            verified_user
          </span>
          <span>{t('trust1')}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#38BDF8]">
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
        className={`fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 transform ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-blue-400 dark:text-blue-600 text-[20px]">
          check_circle
        </span>
        <span className="text-sm font-medium">{toastMessage}</span>
      </div>
    </>
  );
}
