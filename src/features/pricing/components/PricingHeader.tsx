'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/features/auth';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { UserMenuDropdown } from '@/features/dashboard/components/UserMenuDropdown';

export function PricingHeader() {
  const t = useTranslations('pricing.header');
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  const isPricing = pathname === '/pricing';

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white/90 dark:bg-[#131314]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#3c4043] transition-colors">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo & Main Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <img
              src="/logo-full.png"
              alt="ILMS Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-medium">
            <Link
              href="/classes"
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#1e1f20] transition-colors"
            >
              {t('courses')}
            </Link>
            <Link
              href="/knowledge-graph"
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#1e1f20] transition-colors"
            >
              {t('knowledgeGraph')}
            </Link>
            <Link
              href="/pricing"
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
                isPricing
                  ? 'text-blue-700 bg-blue-50 dark:text-[#a8c7fa] dark:bg-[#a8c7fa]/10'
                  : 'text-slate-600 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#1e1f20]'
              }`}
            >
              {t('pricing')}
            </Link>
            <Link
              href="/ai-tutor"
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#1e1f20] transition-colors flex items-center gap-1.5"
            >
              <img src="/socratic_mascot.png" alt="Socratic AI" className="w-4 h-4 object-contain" />
              <span>{t('aiTutor')}</span>
            </Link>
          </nav>
        </div>

        {/* Action items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] text-slate-600 dark:text-[#c4c7c5] text-xs font-medium">
            <span className="material-symbols-outlined text-[16px] text-amber-500">
              local_fire_department
            </span>
            <span>{t('streakDays', { days: 14 })}</span>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Button */}
          <button
            aria-label={t('notifications')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#1e1f20] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>

          {/* User Profile or Guest Login/Register */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#3c4043]">
            {user ? (
              <UserMenuDropdown
                userFullName={
                  [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') ||
                  user.email
                }
                isFocus={false}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#c4c7c5] hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#a8c7fa] dark:hover:bg-[#b9d5fb] dark:text-[#00325b] text-xs font-semibold transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
