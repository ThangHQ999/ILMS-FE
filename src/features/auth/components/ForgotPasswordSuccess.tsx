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
      <div className="relative w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-xs group">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-30" />
        <div className="relative flex items-center justify-center w-full h-full rounded-full">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      {/* Heading & Subtext */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-2 tracking-tight">
          {t('successTitle')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center px-1 leading-relaxed">
          {t.rich('successDescription', {
            email,
            bold: (chunks) => (
              <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-xs inline-block my-0.5">
                {chunks}
              </span>
            ),
          })}
        </p>
      </div>

      {/* Recipient Details Card */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
            {t('recipientLabel')}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80 font-medium">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>{t('sentStatus')}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-slate-900 dark:text-slate-100 text-sm font-medium">
          <Mail className="w-4 h-4 text-blue-600 dark:text-[#38BDF8]" />
          <span>{email}</span>
        </div>

        <div className="pt-1 text-slate-500 dark:text-slate-400 text-xs flex items-start gap-1.5 leading-relaxed">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>{t('spamNotice')}</span>
        </div>
      </div>

      {/* Open Email Client CTA */}
      <a
        href="mailto:"
        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-[#38BDF8] dark:hover:bg-[#60A5FA] active:scale-[0.99] text-white dark:text-slate-950 font-semibold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-md shadow-blue-500/20 dark:shadow-cyan-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
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
              ? 'text-blue-600 dark:text-[#38BDF8] hover:underline'
              : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
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
