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
  '/assignments/create': 'Tạo Quiz mới',
  '/assignments/create-quiz': 'Tạo Quiz mới',
  '/assignments/question-bank': 'Ngân hàng câu hỏi',
  '/assignments/proctoring': 'Giám sát phòng thi',
  '/question-bank': 'Ngân hàng câu hỏi',
  '/ai-tutor': 'Trợ lý AI Socratic',
  '/timetable': 'Thời khóa biểu theo tuần',
  '/teacher/timetable': 'Thời khóa biểu theo tuần',
  '/settings': 'Cài đặt hệ thống',
};

function getPageTitle(pathname: string): string {
  if (!pathname) return 'Không gian học tập';

  // Strip locale prefix if present (e.g. /vi/... or /en/...)
  const cleanPath = pathname.replace(/^\/(?:vi|en)(?=\/|$)/, '') || '/dashboard';

  // 1. Exact match
  if (routeMap[cleanPath]) {
    return routeMap[cleanPath];
  }

  // 2. Prefix match (longest matching route first)
  const matchedKey = Object.keys(routeMap)
    .sort((a, b) => b.length - a.length)
    .find((key) => cleanPath.startsWith(key));

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
  const isCreateQuiz = pathname?.startsWith('/assignments/create') || pathname?.startsWith('/assignments/create-quiz');
  const currentPageName = title || getPageTitle(pathname || '');

  if (isFocus) {
    return (
      <header className="fixed top-0 left-[72px] right-0 h-16 bg-white/90 dark:bg-[#131314]/95 backdrop-blur-xl z-40 border-b border-slate-200/80 dark:border-[#282A2C] transition-all duration-300">
        <div className="h-16 w-full px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-[#444746] dark:text-[#8E918F] font-medium whitespace-nowrap shrink-0 flex-nowrap"
            >
              <Link href="/dashboard" prefetch={true} className="hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] cursor-pointer">
                {t('home')}
              </Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] whitespace-nowrap shrink-0">
                {currentPageName}
              </span>
              <span className="ml-2 px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] font-medium text-xs flex items-center gap-1 border-none">
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                {t('focusModeBtn')}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
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

  // Header matching unified layout
  return (
    <header
      className={`fixed top-0 ${
        isSidebarCollapsed ? 'left-[72px]' : 'left-64'
      } right-0 h-16 bg-white/90 dark:bg-[#131314]/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 border-b border-slate-200/80 dark:border-[#282A2C] z-40 transition-all duration-300`}
    >
      {/* 1. Left: Breadcrumb */}
      <div className="flex items-center gap-1.5 min-w-0 shrink select-none">
        <Link
          href="/dashboard"
          prefetch={true}
          className="flex items-center text-gray-500 hover:text-gray-900 dark:text-[#8E918F] dark:hover:text-[#E3E3E3] transition-colors shrink-0"
          title={t('home')}
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
        </Link>
        <span className="text-gray-400 dark:text-[#8E918F] mx-1.5 shrink-0 font-normal text-sm">/</span>
        {isCreateQuiz ? (
          <>
            <Link
              href="/assignments"
              prefetch={true}
              className="text-gray-500 hover:text-gray-900 dark:text-[#8E918F] dark:hover:text-[#E3E3E3] font-medium transition-colors truncate"
            >
              Quản lý Đề thi &amp; Quiz
            </Link>
            <span className="text-gray-400 dark:text-[#8E918F] mx-1.5 shrink-0 font-normal">/</span>
            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight font-sans whitespace-nowrap shrink-0 leading-none">
              Tạo Quiz mới
            </span>
          </>
        ) : (
          <span
            className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight font-sans truncate whitespace-nowrap min-w-0 leading-none"
            title={currentPageName}
          >
            {currentPageName}
          </span>
        )}
      </div>

      {/* 2. Center: Search Bar */}
      <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md mx-2 sm:mx-4 lg:mx-6 min-w-0">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-4 text-[20px] text-[#747775] dark:text-[#8E918F]">
            search
          </span>
          <input
            className="w-full h-10 pl-11 pr-16 sm:pr-20 bg-[#F0F4F9] dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] rounded-full text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] text-xs focus:outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40 focus:bg-white dark:focus:bg-[#282A2C] transition-all border-none"
            placeholder={t('searchPlaceholder')}
            type="text"
            aria-label={t('searchPlaceholder')}
          />
          <div className="absolute right-3 hidden sm:flex items-center pointer-events-none">
            <kbd className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* 3. Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {onToggleWorkspaceMode && (
          <button
            onClick={onToggleWorkspaceMode}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#1E1F20] dark:hover:bg-[#282A2C] text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] transition-colors cursor-pointer whitespace-nowrap border-none"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
              sync_alt
            </span>
            <span>
              {workspaceMode === 'student' ? 'Đổi sang Giảng dạy' : 'Đổi chế độ'}
            </span>
          </button>
        )}

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
        <div className="flex items-center gap-2 pl-1">
          <UserMenuDropdown userFullName={userFullName} isFocus={false} />
        </div>
      </div>
    </header>
  );
}
