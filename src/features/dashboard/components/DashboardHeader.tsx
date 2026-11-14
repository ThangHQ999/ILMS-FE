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
  const isAssignments = pathname.startsWith('/assignments');
  const isCreateQuiz = pathname.startsWith('/assignments/create') || pathname.startsWith('/assignments/create-quiz');

  const currentUserName =
    userFullName || (workspaceMode === 'student' ? 'Trần Nhật Minh' : 'TS. Lê Hoàng Nam');

  if (isFocus) {
    return (
      <header className="fixed top-0 left-20 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40 border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300">
        <div className="h-16 w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
            <ThemeToggle />
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
      className={`fixed top-0 ${
        isSidebarCollapsed ? 'left-20' : 'left-0 lg:left-72'
      } right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-40 border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300 px-6 lg:px-8 flex items-center justify-between`}
    >
      {/* Left: Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-400">
            {workspaceMode === 'student' ? 'school' : 'school'}
          </span>
          <span>{workspaceMode === 'student' ? 'Không gian học tập' : 'Không gian giảng dạy'}</span>
        </Link>
        <span className="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-600">
          chevron_right
        </span>
        {isCreateQuiz ? (
          <>
            <Link
              href="/assignments"
              className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Quản lý Đề thi &amp; Quiz
            </Link>
            <span className="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-600">
              chevron_right
            </span>
            <span className="text-slate-900 dark:text-white font-semibold tracking-tight truncate">
              Tạo Quiz mới
            </span>
          </>
        ) : (
          <span className="text-slate-900 dark:text-white font-semibold tracking-tight truncate">
            {isAssignments
              ? 'Quản lý Đề thi & Quiz'
              : isClasses
              ? workspaceMode === 'student'
                ? 'Lớp học đang tham gia'
                : 'Các lớp học'
              : isCompetency
              ? 'Bản đồ năng lực'
              : isGraph
              ? 'Đồ thị tri thức'
              : 'Tổng quan'}
          </span>
        )}
      </nav>

      {/* Right: Search bar & Utilities */}
      <div className="flex items-center gap-3">
        {/* Global Search Input */}
        <div className="relative w-72 hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
            search
          </span>
          <input
            className="w-full pl-9 pr-14 py-2 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all outline-none"
            placeholder={workspaceMode === 'student' ? 'Tìm lớp học, môn học, tài liệu...' : 'Tìm lớp học, sinh viên...'}
            type="text"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-2xs pointer-events-none">
            Ctrl K
          </kbd>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        {/* Mode Switch Button */}
        {onToggleWorkspaceMode && (
          <button
            onClick={onToggleWorkspaceMode}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
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

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell with alert badge */}
        <NotificationDropdown />

        {/* Header Profile Pill */}
        <div className="flex items-center gap-2 pl-2">
          <UserMenuDropdown userFullName={currentUserName} isFocus={false} />
        </div>
      </div>
    </header>
  );
}
