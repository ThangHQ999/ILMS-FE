'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NotificationDropdown } from './NotificationDropdown';
import { UserMenuDropdown } from './UserMenuDropdown';

interface DashboardHeaderProps {
  isFocus: boolean;
  isSidebarCollapsed?: boolean;
  onToggleMode: () => void;
  userFullName?: string;
}

export function DashboardHeader({
  isFocus,
  isSidebarCollapsed = false,
  onToggleMode,
  userFullName = 'Nhật Minh',
}: DashboardHeaderProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();
  const isCompetency = pathname.startsWith('/competency');
  const isGraph = pathname.startsWith('/knowledge-graph');
  const isClasses = pathname.startsWith('/classes');

  if (isFocus) {
    // 56px Header for Focus Mode (left-20)
    return (
      <header className="fixed top-0 left-20 right-0 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40 border-b border-slate-200 dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all duration-300">
        <div className="h-14 w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium"
            >
              <Link href="/dashboard" prefetch={true} className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">
                {t('home')}
              </Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-slate-900 dark:text-slate-200 font-semibold">
                {isCompetency ? 'Bản đồ năng lực' : isGraph ? 'Đồ thị tri thức' : isClasses ? 'Quản lý Lớp học' : t('algorithms')}
              </span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-semibold text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                {t('focusModeBtn')}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleMode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen_exit</span>
              <span>{t('exitFocusModeBtn')}</span>
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <UserMenuDropdown userFullName={userFullName} isFocus={true} />
          </div>
        </div>
      </header>
    );
  }

  // 64px Header for Analytics Mode (left-[260px] or left-20 when collapsed)
  return (
    <header
      className={`fixed top-0 ${isSidebarCollapsed ? 'left-20' : 'left-[260px]'
        } right-0 h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl z-40 border-b border-slate-200 dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300`}
    >
      <div className="h-16 w-full px-6 flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Link href="/dashboard" prefetch={true} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100">
              <span className="material-symbols-outlined text-[18px]">home</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              {isCompetency ? 'Bản đồ năng lực' : isGraph ? 'Đồ thị tri thức' : isClasses ? 'Quản lý Lớp học' : t('learningSpace')}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[20px] text-slate-400">
              search
            </span>
            <input
              className="w-full h-10 pl-10 pr-20 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:bg-white dark:focus:bg-slate-900 transition-all border border-transparent focus:border-secondary/30"
              placeholder={t('searchPlaceholder')}
              type="text"
            />
            <div className="absolute right-2.5 flex items-center pointer-events-none">
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                Ctrl K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMode}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">
              center_focus_strong
            </span>
            <span>{t('focusModeBtn')}</span>
          </button>

          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* User Menu Dropdown */}
          <div className="flex items-center pl-1">
            <UserMenuDropdown userFullName={userFullName} isFocus={false} />
          </div>
        </div>
      </div>
    </header>
  );
}
