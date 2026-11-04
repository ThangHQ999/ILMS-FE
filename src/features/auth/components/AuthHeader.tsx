'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

export function AuthHeader() {
  const tAuth = useTranslations('auth');
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
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:border-slate-800/80 dark:bg-[#0F131D]/80 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 md:px-8">
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

        {/* Right Navigation & Theme Switcher */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {tAuth('headerNoAccount')}
            </span>
            <Link
              href="/register"
              className="px-2 py-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-[#38BDF8] dark:hover:text-white"
            >
              {tAuth('headerRegisterNow')}
            </Link>
          </div>

          <Link
            href="/register"
            className="sm:hidden flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-[#38BDF8]/15 dark:text-[#38BDF8] dark:border dark:border-[#38BDF8]/30"
          >
            {tAuth('headerRegister')}
          </Link>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
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

          {/* Avatar Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-[#38BDF8]">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
