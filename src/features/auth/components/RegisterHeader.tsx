'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

export function RegisterHeader() {
  const t = useTranslations('auth.registerHeader');
  const tCommon = useTranslations('common');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
      // Ignore storage write error if cookies/storage blocked
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:border-slate-800/80 dark:bg-[#0F131D]/80 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex h-16 sm:h-20 max-w-7xl mx-auto w-full items-center justify-between px-4 sm:px-6 lg:px-12">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center focus:outline-none">
            <img
              src="/logo.png"
              alt="ILMS Logo"
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="hidden sm:flex items-center gap-2">
            <Link
              href="/#overview"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
            >
              {t('about')}
            </Link>
            <Link
              href="/#security-standards"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
            >
              {t('security')}
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t('hasAccount')}
              </span>
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-lg dark:bg-transparent dark:text-[#38BDF8] dark:hover:text-white transition-colors"
              >
                {t('login')}
              </Link>
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-register"
              type="button"
              onClick={toggleTheme}
              aria-label={tCommon('toggleTheme')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-800 dark:text-[#38BDF8]"
            >
              {mounted && resolvedTheme === 'dark' ? (
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">dark_mode</span>
              )}
            </button>

            {/* User Avatar Placeholder */}
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-[#38BDF8]">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
