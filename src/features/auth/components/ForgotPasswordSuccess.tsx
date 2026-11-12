'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Mail, Info, ExternalLink, RefreshCw, BadgeCheck } from 'lucide-react';

interface ForgotPasswordSuccessProps {
  email: string;
  countdown: number;
  canResend: boolean;
  isLoading: boolean;
  onResend: () => void;
}

export function ForgotPasswordSuccess({
  email,
  countdown,
  canResend,
  isLoading,
  onResend,
}: ForgotPasswordSuccessProps) {
  const t = useTranslations('auth.forgotPasswordPage');

  return (
    <div className="w-full space-y-6">
      {/* Success Badge */}
      <div className="relative w-14 h-14 rounded-full bg-[#C4EED0] dark:bg-[#142E20] flex items-center justify-center mx-auto text-[#0D652D] dark:text-[#81C995] border-none shadow-none">
        <CheckCircle2 className="w-8 h-8 text-[#0D652D] dark:text-[#81C995]" />
      </div>

      {/* Heading & Subtext */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#E3E3E3] text-center mb-2 tracking-tight">
          {t('successTitle')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#C4C7C5] text-center px-1 leading-relaxed">
          {t.rich('successDescription', {
            email,
            bold: (chunks) => (
              <span className="font-semibold text-slate-900 dark:text-[#E3E3E3] bg-white dark:bg-[#282A2C] px-2.5 py-0.5 rounded-full font-mono text-xs inline-block my-0.5">
                {chunks}
              </span>
            ),
          })}
        </p>
      </div>

      {/* Recipient Details Card */}
      <div className="p-5 rounded-3xl bg-[#F0F4F9] dark:bg-[#1E1F20] border-none shadow-none text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-[#C4C7C5] font-medium">
            {t('recipientLabel')}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-xs text-[#0D652D] dark:text-[#81C995] bg-[#C4EED0] dark:bg-[#142E20] px-2.5 py-0.5 rounded-full border-none font-medium">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>{t('sentStatus')}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-slate-900 dark:text-[#E3E3E3] text-sm font-medium">
          <Mail className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
          <span>{email}</span>
        </div>

        <div className="pt-1 text-slate-500 dark:text-[#C4C7C5] text-xs flex items-start gap-1.5 leading-relaxed">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>{t('spamNotice')}</span>
        </div>
      </div>

      {/* Open Email Client CTA */}
      <a
        href="mailto:"
        className="w-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium text-sm sm:text-base py-3.5 px-6 rounded-full border-none shadow-none transition-colors flex items-center justify-center gap-2 group cursor-pointer whitespace-nowrap"
      >
        <ExternalLink className="w-4 h-4" />
        <span>{t('openEmailApp')}</span>
      </a>

      {/* Resend Action with Countdown */}
      <div className="flex items-center justify-center pt-1">
        <button
          type="button"
          onClick={onResend}
          disabled={!canResend || isLoading}
          className={`text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            canResend && !isLoading
              ? 'text-[#0B57D0] dark:text-[#A8C7FA] hover:underline'
              : 'text-slate-400 dark:text-[#8E918F] cursor-not-allowed'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>
            {canResend
              ? t('resendNow')
              : t('resendCountdown', { seconds: countdown })}
          </span>
        </button>
      </div>
    </div>
  );
}
