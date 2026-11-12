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
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-none bg-white/90 backdrop-blur-md shadow-none dark:bg-[#131314]">
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
              className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F9] dark:text-[#C4C7C5] dark:hover:text-white dark:hover:bg-[#282A2C] transition-colors"
            >
              {t('about')}
            </Link>
            <Link
              href="/#security-standards"
              className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F9] dark:text-[#C4C7C5] dark:hover:text-white dark:hover:bg-[#282A2C] transition-colors"
            >
              {t('security')}
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-xs sm:text-sm text-slate-500 dark:text-[#C4C7C5]">
                {t('hasAccount')}
              </span>
              <Link
                href="/login"
                className="px-4 py-2 text-xs sm:text-sm font-medium text-[#041E49] bg-[#D3E3FD] hover:bg-[#B9D0F9] rounded-full dark:bg-[#A8C7FA] dark:text-[#062E6F] transition-colors border-none shadow-none"
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F4F9] text-slate-700 transition-colors hover:bg-[#E1E5EA] dark:bg-[#282A2C] dark:text-[#A8C7FA] border-none shadow-none"
            >
              {mounted && resolvedTheme === 'dark' ? (
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">dark_mode</span>
              )}
            </button>

            {/* User Avatar Placeholder */}
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-700 dark:text-[#A8C7FA] border-none">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
