'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Shield, CheckCircle2, Send, Loader2, Lock } from 'lucide-react';

interface ForgotPasswordFormProps {
  email: string;
  error?: string;
  isLoading: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ForgotPasswordForm({
  email,
  error,
  isLoading,
  onEmailChange,
  onSubmit,
}: ForgotPasswordFormProps) {
  const t = useTranslations('auth.forgotPasswordPage');

  return (
    <div className="w-full">
      {/* Security & Padlock Icon Badge */}
      <div className="relative w-14 h-14 rounded-full bg-blue-50 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 flex items-center justify-center mx-auto text-blue-600 dark:text-[#38BDF8] shadow-xs group">
        <div className="absolute inset-0 rounded-full bg-blue-600/15 dark:bg-[#38BDF8]/20 animate-ping opacity-30" />
        <div className="relative flex items-center justify-center w-full h-full rounded-full">
          <Lock className="w-7 h-7" />
        </div>
      </div>

      {/* Heading & Subtext */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mt-5 mb-2 tracking-tight">
        {t('formTitle')}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center px-1 mb-8 leading-relaxed">
        {t('formDescription')}
      </p>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <label
              htmlFor="recovery-email"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5"
            >
              <span>{t('emailLabel')}</span>
            </label>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-blue-600 dark:text-[#38BDF8] bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200/60 dark:border-slate-700 font-medium">
              <Shield className="w-3 h-3" />
              <span>{t('securityBadge')}</span>
            </span>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="recovery-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={onEmailChange}
              placeholder={t('emailPlaceholder')}
              disabled={isLoading}
              className={`w-full bg-white dark:bg-[#0B0F19] text-sm text-slate-900 dark:text-slate-100 py-3.5 pl-11 pr-4 rounded-xl border ${
                error
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700/80 focus:border-blue-500 dark:focus:border-[#38BDF8]'
              } outline-none shadow-xs focus:shadow-md focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#38BDF8]/20 transition-all`}
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 dark:text-rose-400 pt-0.5">
              {error}
            </p>
          )}

          {/* Format Hint */}
          <div className="flex items-start gap-1.5 pt-1 text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-[#38BDF8] shrink-0 mt-0.5" />
            <span className="text-xs leading-normal">
              {t('formatHint')}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-[#38BDF8] dark:hover:bg-[#60A5FA] active:scale-[0.99] text-white dark:text-slate-950 font-semibold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-md shadow-blue-500/20 dark:shadow-cyan-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group mt-6 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('submitting')}</span>
            </>
          ) : (
            <>
              <span>{t('submitButton')}</span>
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
