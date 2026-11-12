'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  ArrowLeft,
  HelpCircle,
  Sun,
  Moon,
  Lock,
  ShieldCheck,
  Headphones,
  CheckCircle,
  FileCheck2,
} from 'lucide-react';
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ForgotPasswordSuccess } from './ForgotPasswordSuccess';

export function ForgotPasswordPageView() {
  const t = useTranslations('auth.forgotPasswordPage');
  const tCommon = useTranslations('common');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const {
    email,
    error,
    isSubmitted,
    countdown,
    canResend,
    isLoading,
    handleEmailChange,
    handleSubmit,
    handleResend,
  } = useForgotPasswordForm();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark') || resolvedTheme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', nextTheme);
      localStorage.setItem('ilms_theme_mode', nextTheme);
    } catch {
      // storage safe ignore
    }
  };

  return (
    <div className="bg-[#E1E5EA] dark:bg-[#131314] min-h-screen flex flex-col justify-between relative overflow-x-hidden transition-colors">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToPlatform')}</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            id="forgot-theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={tCommon('toggleTheme')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#1E1F20] text-slate-700 dark:text-[#A8C7FA] transition-colors hover:bg-slate-100 border-none shadow-none"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#A8C7FA]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <a
            href="#support"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors px-3 py-1.5 rounded-full hover:bg-white/60"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('supportAssistance')}</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="flex flex-col w-full items-center justify-center relative">
          {/* Centered Auth Card Container */}
          <div className="w-full max-w-[480px] mx-auto relative px-2">
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none shadow-none p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
              {/* ILMS Brand Logo */}
              <div className="flex justify-center mb-6 pt-1">
                <Link href="/" className="focus:outline-none">
                  <img
                    src="/logo-dark.png"
                    alt="ILMS Logo"
                    className="h-10 sm:h-11 w-auto object-contain hidden dark:block brightness-110 contrast-125 transition-transform duration-200 hover:scale-105"
                  />
                  <img
                    src="/logo-light.png"
                    alt="ILMS Logo"
                    className="h-10 sm:h-11 w-auto object-contain block dark:hidden transition-transform duration-200 hover:scale-105"
                  />
                </Link>
              </div>

              {/* State Rendering: Form or Success */}
              {!isSubmitted ? (
                <ForgotPasswordForm
                  email={email}
                  error={error}
                  isLoading={isLoading}
                  onEmailChange={handleEmailChange}
                  onSubmit={handleSubmit}
                />
              ) : (
                <ForgotPasswordSuccess
                  email={email}
                  countdown={countdown}
                  canResend={canResend}
                  isLoading={isLoading}
                  onResend={handleResend}
                />
              )}

              {/* Back to Login Link Navigation */}
              <div className="mt-8 pt-6 bg-[#F0F4F9] dark:bg-[#282A2C] rounded-b-3xl -mx-8 sm:-mx-10 -mb-8 sm:-mb-10 text-center py-4 border-none">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-slate-600 dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('backToLogin')}</span>
                </Link>
              </div>
            </div>

            {/* Outer Security & Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-5 mt-6 text-slate-500 dark:text-[#C4C7C5] text-xs font-medium">
              <div className="inline-flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                <span>{t('sslEncryption')}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                <span>{t('twoFactor')}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="inline-flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                <span>{t('support247')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-[#C4C7C5]">
          <CheckCircle className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
          <span>{t('copyright')}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-[#C4C7C5] font-medium">
          <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[#1E1F20] border-none px-3 py-1 rounded-full shadow-none">
            <Lock className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
            <span>SSL 256-bit Encryption</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[#1E1F20] border-none px-3 py-1 rounded-full shadow-none">
            <FileCheck2 className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
            <span>{t('isoCertified')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
