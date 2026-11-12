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
              <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-semibold">
                {isCompetency ? 'Bản đồ năng lực' : isGraph ? 'Đồ thị tri thức' : isClasses ? 'Quản lý Lớp học' : t('algorithms')}
              </span>
              <span className="ml-2 px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] font-medium text-xs flex items-center gap-1 border-none">
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                {t('focusModeBtn')}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleMode}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#1E1F20] dark:hover:bg-[#282A2C] dark:text-[#E3E3E3] text-xs font-medium transition-colors whitespace-nowrap border-none cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen_exit</span>
              <span>{t('exitFocusModeBtn')}</span>
            </button>
            <RoleSwitcher compact />
            <ThemeToggle />
            <LanguageSwitcher variant="minimal" />
            <div className="h-4 w-px bg-[#E1E5EA] dark:bg-[#282A2C]" />
            <UserMenuDropdown userFullName={userFullName} isFocus={true} />
          </div>
        </div>
      </header>
    );
  }

  // 64px Header for Analytics Mode (left-72 or left-20 when collapsed)
  return (
    <header
      className={`fixed top-0 ${
        isSidebarCollapsed ? 'left-20' : 'left-72'
      } right-0 h-16 bg-white/85 dark:bg-[#131314] backdrop-blur-xl px-8 flex items-center justify-between border-none shadow-none z-40 transition-all duration-300`}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#444746] dark:text-[#8E918F]">
          <Link href="/dashboard" prefetch={true} className="flex items-center gap-1 hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]">
            <span className="material-symbols-outlined text-[18px]">home</span>
          </Link>
          <span className="text-[#747775] dark:text-[#8E918F]">/</span>
          <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-semibold">
            {isCompetency ? 'Bản đồ năng lực' : isGraph ? 'Đồ thị tri thức' : isClasses ? 'Quản lý Lớp học' : t('learningSpace')}
          </span>
        </div>
      </div>

      {/* Search Bar ("Tìm kiếm bài học...") */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-[20px] text-[#747775] dark:text-[#8E918F]">
            search
          </span>
          <input
            className="w-full sm:w-96 h-10 pl-11 pr-20 bg-[#F0F4F9] dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] rounded-full text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] text-xs focus:outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40 focus:bg-white dark:focus:bg-[#282A2C] transition-all border-none"
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

        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* User Menu Dropdown */}
        <div className="flex items-center pl-1">
          <UserMenuDropdown userFullName={userFullName} isFocus={false} />
        </div>
      </div>
    </header>
  );
}
