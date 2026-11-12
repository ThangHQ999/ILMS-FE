'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/features/auth';
import { UserMenuDropdown } from '@/features/dashboard/components/UserMenuDropdown';

interface ErrorPageHeaderProps {
  currentPage?: '404' | '403';
}

export function ErrorPageHeader({ currentPage = '404' }: ErrorPageHeaderProps) {
  const t = useTranslations('errors');
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Trần Nhật Minh';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#1E1F20] backdrop-blur-xl border-none shadow-none">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 focus:outline-none">
            <img
              src="/logo-dark.png"
              alt="ILMS Logo"
              className="h-8 w-auto object-contain hidden dark:block"
            />
            <img
              src="/logo-light.png"
              alt="ILMS Logo"
              className="h-8 w-auto object-contain block dark:hidden"
            />
            <span className="text-base font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight hidden sm:inline-block">
              EduTech Innovations
            </span>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {t('navHome')}
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {t('navCourses')}
          </Link>
          <Link
            href="/settings"
            className="text-xs font-semibold text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {t('navHelp')}
          </Link>
          <Link
            href="/ai-tutor"
            className="text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] transition-colors"
          >
            {t('navAiExplore')}
          </Link>
        </nav>

        {/* Right Auth Action */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#1E1F20] animate-pulse" />
          ) : !user ? (
            // Chưa đăng nhập -> Hiện nút Đăng nhập
            <Link
              href="/login"
              className="inline-flex items-center justify-center text-xs font-medium px-5 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap border-none shadow-none transition-all cursor-pointer"
            >
              {t('signInBtn')}
            </Link>
          ) : (
            // Đã đăng nhập -> Ẩn nút đăng nhập, hiển thị Avatar Menu Dropdown
            <UserMenuDropdown userFullName={userFullName} isFocus={false} />
          )}
        </div>
      </div>
    </header>
  );
}
