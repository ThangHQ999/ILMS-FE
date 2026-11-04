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
    <div className="bg-[#f6fafe] dark:bg-[#0B0F19] min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-blue-600/15 selection:text-blue-700 dark:selection:bg-[#38BDF8]/20 dark:selection:text-[#38BDF8] transition-colors">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-blue-500/10 dark:bg-[#38BDF8]/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/3 -left-48 w-[480px] h-[480px] bg-indigo-500/10 dark:bg-blue-600/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 right-1/4 w-[540px] h-[320px] bg-sky-400/15 dark:bg-indigo-600/10 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-[#161B26] dark:text-[#38BDF8] dark:hover:bg-[#262A35]"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#38BDF8]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <a
            href="#support"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-[#38BDF8] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('supportAssistance')}</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="flex flex-col w-full items-center justify-center relative">
          {/* Subtle Dot Matrix Pattern Background Decor */}
          <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center opacity-40 dark:opacity-20 overflow-hidden">
            <svg
              className="w-full h-full max-w-5xl"
              height="100%"
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="forgot-dot-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" className="fill-slate-400 dark:fill-slate-600" />
                </pattern>
                <radialGradient id="forgot-radial-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0070ea" stopOpacity="0.12" />
                  <stop offset="70%" stopColor="#0070ea" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#0070ea" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#forgot-dot-pattern)" />
              <circle cx="50%" cy="50%" r="380" fill="url(#forgot-radial-glow)" />
            </svg>
          </div>

          {/* Centered Auth Card Container */}
          <div className="w-full max-w-[480px] mx-auto relative px-2">
            <div className="bg-white dark:bg-[#161B26] rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/60 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 dark:from-[#38BDF8] dark:via-blue-500 dark:to-indigo-500" />

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
              <div className="mt-8 pt-6 bg-slate-50/80 dark:bg-[#0B0F19]/80 rounded-b-2xl -mx-8 sm:-mx-10 -mb-8 sm:-mb-10 text-center py-4 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-[#38BDF8] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('backToLogin')}</span>
                </Link>
              </div>
            </div>

            {/* Outer Security & Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-5 mt-6 text-slate-500 dark:text-slate-400 text-xs font-medium">
              <div className="inline-flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600 dark:text-[#38BDF8]" />
                <span>{t('sslEncryption')}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-[#38BDF8]" />
                <span>{t('twoFactor')}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="inline-flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-blue-600 dark:text-[#38BDF8]" />
                <span>{t('support247')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <CheckCircle className="w-4 h-4 text-blue-600 dark:text-[#38BDF8]" />
          <span>{t('copyright')}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full shadow-xs">
            <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-[#38BDF8]" />
            <span>SSL 256-bit Encryption</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full shadow-xs">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-[#38BDF8]" />
            <span>{t('isoCertified')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
