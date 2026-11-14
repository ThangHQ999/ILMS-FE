'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NotificationDropdown } from './NotificationDropdown';
import { UserMenuDropdown } from './UserMenuDropdown';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';

const routeMap: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/teacher/dashboard': 'Tổng quan',
  '/classes': 'Lớp học của tôi',
  '/teacher/classes': 'Lớp học của tôi',
  '/courses': 'Không gian môn học',
  '/lesson-sessions': 'Ca học & Điểm danh',
  '/teacher/attendance': 'Ca học & Điểm danh',
  '/teacher/lesson-sessions': 'Ca học & Điểm danh',
  '/knowledge-graph': 'Đồ thị Tri thức',
  '/teacher/knowledge-graph': 'Đồ thị Tri thức',
  '/competency': 'Bản đồ năng lực',
  '/teacher/competency': 'Bản đồ năng lực',
  '/materials': 'Tài liệu & Học liệu',
  '/teacher/materials': 'Tài liệu & Học liệu',
  '/assignments': 'Quản lý Đề thi & Bài tập',
  '/ai-tutor': 'Trợ lý AI Socratic',
  '/timetable': 'Thời khóa biểu theo tuần',
  '/teacher/timetable': 'Thời khóa biểu theo tuần',
  '/settings': 'Cài đặt hệ thống',
};

function getPageTitle(pathname: string): string {
  if (!pathname) return 'Không gian học tập';

  // 1. Exact match
  if (routeMap[pathname]) {
    return routeMap[pathname];
  }

  // 2. Prefix match (longest matching route first)
  const matchedKey = Object.keys(routeMap)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname.startsWith(key));

  if (matchedKey) {
    return routeMap[matchedKey];
  }

  // 3. Default Fallback
  return 'Không gian học tập';
}

interface DashboardHeaderProps {
  isFocus: boolean;
  isSidebarCollapsed?: boolean;
  onToggleMode: () => void;
  userFullName?: string;
  workspaceMode?: 'faculty' | 'student';
  onToggleWorkspaceMode?: () => void;
  title?: string;
}

export function DashboardHeader({
  isFocus,
  isSidebarCollapsed = false,
  onToggleMode,
  userFullName = 'Nhật Minh',
  workspaceMode = 'faculty',
  onToggleWorkspaceMode,
  title,
}: DashboardHeaderProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();
  const currentPageName = title || getPageTitle(pathname || '');

  if (isFocus) {
    return (
      <header className="fixed top-0 left-20 right-0 h-14 bg-white/90 dark:bg-[#131314] backdrop-blur-xl z-40 border-none shadow-none transition-all duration-300">
        <div className="h-14 w-full px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-[#444746] dark:text-[#8E918F] font-medium"
            >
              <Link href="/dashboard" prefetch={true} className="hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] cursor-pointer">
                {t('home')}
              </Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                {currentPageName}
              </span>
              <span className="ml-2 px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] font-medium text-xs flex items-center gap-1 border-none">
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                {t('focusModeBtn')}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMode}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen_exit</span>
              <span>{t('exitFocusModeBtn')}</span>
            </button>
            <ThemeToggle />
            <LanguageSwitcher variant="minimal" />
            <div className="h-4 w-px bg-[#E1E5EA] dark:bg-[#282A2C]" />
            <UserMenuDropdown userFullName={userFullName} isFocus={true} />
          </div>
        </div>
      </header>
    );
  }

  // Header matching user template
  return (
    <header
      className={`fixed top-0 ${
        isSidebarCollapsed ? 'left-20' : 'left-72'
      } right-0 h-16 bg-white/85 dark:bg-[#131314] backdrop-blur-xl px-8 flex items-center justify-between border-none shadow-none z-40 transition-all duration-300`}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
        <Link
          href="/dashboard"
          prefetch={true}
          className="flex items-center text-gray-500 hover:text-gray-900 dark:text-[#8E918F] dark:hover:text-[#E3E3E3] transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
        </Link>
        <span className="text-gray-400 dark:text-[#8E918F] mx-1.5 shrink-0">/</span>
        <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight font-sans whitespace-nowrap shrink-0">
          {currentPageName}
        </span>
      </div>

      {/* Search Bar ("Tìm kiếm bài học...") */}
      <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-3 sm:mx-6 min-w-0">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-[20px] text-[#747775] dark:text-[#8E918F]">
            search
          </span>
          <input
            className="w-full h-10 pl-11 pr-20 bg-[#F0F4F9] dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] rounded-full text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] text-xs focus:outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40 focus:bg-white dark:focus:bg-[#282A2C] transition-all border-none"
            placeholder={t('searchPlaceholder')}
            type="text"
          />
          <div className="absolute right-3 flex items-center pointer-events-none">
            <kbd className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Focus Mode Button */}
        <button
          onClick={onToggleMode}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#1E1F20] dark:hover:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] transition-colors text-xs font-medium whitespace-nowrap border-none cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
            center_focus_strong
          </span>
          <span>{t('focusModeBtn')}</span>
        </button>

        {/* Role Switcher */}
        <RoleSwitcher compact />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notification Bell with alert badge */}
        <NotificationDropdown />

        {/* Header Profile Pill */}
        <div className="flex items-center gap-2 pl-2">
          <UserMenuDropdown userFullName={userFullName} isFocus={false} />
        </div>
      </div>
    </header>
  );
}
