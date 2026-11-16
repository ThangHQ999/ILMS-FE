'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NotificationDropdown } from './NotificationDropdown';
import { UserMenuDropdown } from './UserMenuDropdown';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

interface DashboardHeaderProps {
  isFocus: boolean;
  isSidebarCollapsed?: boolean;
  onToggleMode: () => void;
  userFullName?: string;
  workspaceMode?: 'faculty' | 'student';
  onToggleWorkspaceMode?: () => void;
}

export function DashboardHeader({
  isFocus,
  isSidebarCollapsed = false,
  onToggleMode,
  userFullName,
  workspaceMode = 'faculty',
  onToggleWorkspaceMode,
}: DashboardHeaderProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();

  const isClasses = pathname.startsWith('/classes');
  const isGraph = pathname.startsWith('/knowledge-graph');
  const isCompetency = pathname.startsWith('/competency');

  const currentUserName =
    userFullName || (workspaceMode === 'student' ? 'Trần Nhật Minh' : 'TS. Lê Hoàng Nam');

  if (isFocus) {
    return (
      <header className="fixed top-0 left-[72px] right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40 border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300">
        <div className="h-16 w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              Focus Mode
            </span>
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
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <UserMenuDropdown userFullName={currentUserName} isFocus={true} />
          </div>
        </div>
      </header>
    );
  }

  // Header matching user template
  return (
    <header
      className={`fixed top-0 ${isSidebarCollapsed ? 'left-[72px]' : 'left-64'
        } right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-40 border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300 px-6 sm:px-8 flex items-center justify-between gap-4`}
    >
      {/* 1. Left: Dynamic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm shrink-0 min-w-0">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-400">
            school
          </span>
          <span className="hidden md:inline">
            {workspaceMode === 'student' ? 'Không gian học tập' : 'Không gian giảng dạy'}
          </span>
        </Link>
        <span className="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-600 hidden md:inline">
          chevron_right
        </span>
        <span className="text-slate-900 dark:text-white font-semibold tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
          {isClasses
            ? workspaceMode === 'student'
              ? 'Lớp học đang tham gia'
              : 'Các lớp học'
            : isCompetency
              ? 'Bản đồ năng lực'
              : isGraph
                ? 'Đồ thị tri thức'
                : 'Tổng quan'}
        </span>
      </nav>

      {/* 2. Center: Prominent Centered Search Bar */}
      <div className="flex-1 flex justify-center items-center px-2 sm:px-4 max-w-2xl mx-auto">
        <div className="relative w-full max-w-lg lg:max-w-xl group">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[20px] pointer-events-none group-focus-within:text-blue-500 transition-colors">
            search
          </span>
          <input
            className="w-full h-11 pl-11 pr-20 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 shadow-xs transition-all outline-none"
            placeholder={t('searchPlaceholder')}
            type="text"
            aria-label={t('searchPlaceholder')}
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-2 py-0.5 text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700/90 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xs pointer-events-none">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* 3. Right: Global Utilities Cluster */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 justify-end">
        {/* Mode Switch Button */}
        {onToggleWorkspaceMode && (
          <button
            onClick={onToggleWorkspaceMode}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">
              sync_alt
            </span>
            <span>
              {workspaceMode === 'student' ? 'Đổi sang Giảng dạy' : 'Đổi chế độ'}
            </span>
          </button>
        )}

        {/* Notification Bell with alert badge */}
        <NotificationDropdown />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* Header Profile Dropdown */}
        <div className="flex items-center">
          <UserMenuDropdown userFullName={currentUserName} isFocus={false} />
        </div>
      </div>
    </header>
  );
}
