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
      <div className="relative w-14 h-14 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center mx-auto text-[#041E49] dark:text-[#A8C7FA] border-none shadow-none">
        <Lock className="w-7 h-7" />
      </div>

      {/* Heading & Subtext */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#E3E3E3] text-center mt-5 mb-2 tracking-tight">
        {t('formTitle')}
      </h1>
      <p className="text-sm text-slate-600 dark:text-[#C4C7C5] text-center px-1 mb-8 leading-relaxed">
        {t('formDescription')}
      </p>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <label
              htmlFor="recovery-email"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-[#C4C7C5] flex items-center gap-1.5"
            >
              <span>{t('emailLabel')}</span>
            </label>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-[#041E49] dark:text-[#A8C7FA] bg-[#D3E3FD] dark:bg-[#162B4D] px-2.5 py-0.5 rounded-full border-none font-medium">
              <Shield className="w-3 h-3" />
              <span>{t('securityBadge')}</span>
            </span>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center pointer-events-none text-slate-400 dark:text-[#8E918F]">
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
              className={`w-full h-12 bg-[#F0F4F9] dark:bg-[#282A2C] text-sm text-slate-900 dark:text-[#E3E3E3] pl-11 pr-4 rounded-full border-none outline-none transition-all ${
                error ? 'ring-2 ring-[#B3261E] dark:ring-[#F28B82]' : ''
              }`}
            />
          </div>

          {error && (
            <p className="text-xs text-[#B3261E] dark:text-[#F28B82] pt-0.5">
              {error}
            </p>
          )}

          {/* Format Hint */}
          <div className="flex items-start gap-1.5 pt-1 text-slate-500 dark:text-[#C4C7C5]">
            <CheckCircle2 className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA] shrink-0 mt-0.5" />
            <span className="text-xs leading-normal">
              {t('formatHint')}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium text-sm sm:text-base py-3.5 px-6 rounded-full border-none shadow-none transition-colors flex items-center justify-center gap-2 group mt-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
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
