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
    <header className="fixed top-0 z-50 w-full border-none bg-white/90 backdrop-blur-md shadow-none dark:bg-[#131314]">
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
            <span className="text-sm text-slate-500 dark:text-[#C4C7C5]">
              {tAuth('headerNoAccount')}
            </span>
            <Link
              href="/register"
              className="px-2 py-1 text-sm font-medium text-[#0B57D0] transition-colors hover:underline dark:text-[#A8C7FA]"
            >
              {tAuth('headerRegisterNow')}
            </Link>
          </div>

          <Link
            href="/register"
            className="sm:hidden flex items-center rounded-full bg-[#D3E3FD] px-4 py-1.5 text-xs font-medium text-[#041E49] transition-colors hover:bg-[#B9D0F9] dark:bg-[#A8C7FA] dark:text-[#062E6F] border-none shadow-none"
          >
            {tAuth('headerRegister')}
          </Link>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
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

          {/* Avatar Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F4F9] text-slate-700 dark:bg-[#282A2C] dark:text-[#A8C7FA] border-none">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
