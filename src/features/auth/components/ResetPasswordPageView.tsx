'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  ArrowLeft,
  HelpCircle,
  Sun,
  Moon,
  Lock,
  CheckCircle2,
  CheckCircle,
  FileCheck2,
} from 'lucide-react';
import { ResetPasswordForm } from './ResetPasswordForm';

export function ResetPasswordPageView() {
  const t = useTranslations('auth.resetPasswordPage');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
            id="reset-theme-toggle-btn"
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
        <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-3xl shadow-sm p-6 sm:p-10 border border-slate-200/60 dark:border-[#444746]/40 transition-all">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('successTitle')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-[#C4C7C5] leading-relaxed">
                  {t('successDescription')}
                </p>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm sm:text-base py-3.5 px-6 rounded-full shadow-none transition-colors cursor-pointer"
              >
                <span>{t('loginNow')}</span>
              </Link>
            </div>
          ) : (
            <ResetPasswordForm
              token={token}
              onSuccess={() => setIsSuccess(true)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#8E918F] z-10">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>SSL 256-bit</span>
          </span>
          <span className="flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>ISO 27001</span>
          </span>
        </div>

        <div>
          <span>© 2025 ILMS Platform. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
