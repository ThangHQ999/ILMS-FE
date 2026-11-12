'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface DashboardSidebarProps {
  isFocus: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  workspaceMode?: 'faculty' | 'student';
}

export function DashboardSidebar({
  isFocus,
  isCollapsed = false,
  onToggleCollapse,
  workspaceMode = 'faculty',
}: DashboardSidebarProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();

  const isOverviewActive = pathname === '/dashboard';
  const isClassesActive = pathname.startsWith('/classes');
  const isMaterialsActive = pathname.startsWith('/materials');
  const isGraphActive = pathname.startsWith('/knowledge-graph');
  const isRadarActive = pathname.startsWith('/competency');
  const isAiTutorActive = pathname.startsWith('/ai-tutor');
  const isSettingsActive = pathname.startsWith('/settings');

  if (isFocus) {
    // 80px Compact Sidebar for Focus Mode
    return (
      <aside className="fixed left-0 top-0 h-full w-20 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-50 flex flex-col justify-between py-4 transition-all duration-300">
        <div className="flex flex-col items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-12 w-12 rounded-full focus:outline-none hover:opacity-90 transition-opacity"
            title="ILMS"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              IL
            </div>
          </Link>
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            <Link
              href="/dashboard"
              prefetch={true}
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                isOverviewActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
              }`}
              title="Tổng quan"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
            </Link>
            <Link
              href="/classes"
              prefetch={true}
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                isClassesActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
              }`}
              title={workspaceMode === 'student' ? 'Lớp học của tôi' : 'Các lớp học'}
            >
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </Link>
            <Link
              href="/materials"
              prefetch={true}
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                isMaterialsActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
              }`}
              title="Học liệu"
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
            </Link>
            <Link
              href="/knowledge-graph"
              prefetch={true}
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                isGraphActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
              }`}
              title="Đồ thị tri thức"
            >
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </Link>
            <Link
              href="/ai-tutor"
              prefetch={true}
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                isAiTutorActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
              }`}
              title="AI Tutor"
            >
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </Link>
            <Link
              href="/settings"
              prefetch={true}
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                isSettingsActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
              }`}
              title="Cài đặt"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </Link>
          </nav>
        </div>
      </aside>
    );
  }

  // Standard Sidebar
  return (
    <aside
      className={`fixed left-0 top-0 h-full ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-50 flex flex-col justify-between transition-all duration-300 shadow-xs select-none`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* App Header / Logo */}
        <div className={`h-16 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? 'px-3 justify-center' : 'px-5'}`}>
          <Link
            href="/dashboard"
            prefetch={true}
            className="flex items-center gap-2.5 focus:outline-none hover:opacity-90 transition-opacity group"
            title="ILMS"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">school</span>
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight font-display">
                ILMS
              </span>
            )}
          </Link>

          {/* Sidebar Collapse Toggle Button */}
          {onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
              title="Thu gọn menu"
              type="button"
              aria-label="Thu gọn menu"
            >
              <span className="material-symbols-outlined text-[20px]">menu_open</span>
            </button>
          )}
        </div>

        {/* Mode Pill Indicator */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100/80 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-semibold tracking-wide">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                  {workspaceMode === 'student' ? 'local_library' : 'school'}
                </span>
                <span>{workspaceMode === 'student' ? 'Chế độ Học tập' : 'Chế độ Giảng dạy'}</span>
              </div>
              <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className={`flex-1 space-y-1 overflow-y-auto scrollbar-none py-1 ${isCollapsed ? 'px-2 flex flex-col items-center' : 'px-3'}`}>
          {/* Tổng quan */}
          <Link
            href="/dashboard"
            prefetch={true}
            className={
              isOverviewActive
                ? isCollapsed
                  ? 'flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-xs transition-all'
                  : 'flex items-center gap-3 px-3.5 py-2.5 transition-colors bg-blue-600 text-white font-bold rounded-xl shadow-xs text-sm'
                : isCollapsed
                ? 'flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium'
            }
            title="Tổng quan"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            {!isCollapsed && <span>Tổng quan</span>}
          </Link>

          {/* Các lớp học / Lớp học của tôi */}
          <Link
            href="/classes"
            prefetch={true}
            className={
              isClassesActive
                ? isCollapsed
                  ? 'flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25 transition-all'
                  : 'flex items-center justify-between px-3.5 py-2.5 transition-colors bg-blue-600 text-white font-semibold text-sm shadow-sm shadow-blue-500/25 rounded-xl'
                : isCollapsed
                ? 'flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                : 'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium'
            }
            title={workspaceMode === 'student' ? 'Lớp học của tôi' : 'Các lớp học'}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">groups</span>
              {!isCollapsed && <span>{workspaceMode === 'student' ? 'Lớp học của tôi' : 'Các lớp học'}</span>}
            </div>
            {!isCollapsed && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isClassesActive ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'}`}>
                {workspaceMode === 'student' ? '4' : '12'}
              </span>
            )}
          </Link>

          {/* Học liệu */}
          <Link
            href="/materials"
            prefetch={true}
            className={
              isMaterialsActive
                ? isCollapsed
                  ? 'flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-xs transition-all'
                  : 'flex items-center gap-3 px-3.5 py-2.5 transition-colors bg-blue-600 text-white font-bold rounded-xl shadow-xs text-sm'
                : isCollapsed
                ? 'flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium'
            }
            title="Học liệu"
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            {!isCollapsed && <span>{workspaceMode === 'student' ? 'Học liệu & Bài tập' : 'Học liệu'}</span>}
          </Link>

          {/* Đồ thị tri thức */}
          <Link
            href="/knowledge-graph"
            prefetch={true}
            className={
              isGraphActive
                ? isCollapsed
                  ? 'flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-xs transition-all'
                  : 'flex items-center gap-3 px-3.5 py-2.5 transition-colors bg-blue-600 text-white font-bold rounded-xl shadow-xs text-sm'
                : isCollapsed
                ? 'flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium'
            }
            title="Đồ thị tri thức"
          >
            <span className="material-symbols-outlined text-[20px]">hub</span>
            {!isCollapsed && <span>Đồ thị tri thức</span>}
          </Link>

          {/* AI Tutor */}
          <Link
            href="/ai-tutor"
            prefetch={true}
            className={
              isAiTutorActive
                ? isCollapsed
                  ? 'flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-xs transition-all'
                  : 'flex items-center justify-between px-3.5 py-2.5 transition-colors bg-blue-600 text-white font-bold rounded-xl shadow-xs text-sm'
                : isCollapsed
                ? 'flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                : 'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium group'
            }
            title="AI Tutor"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              {!isCollapsed && <span>{workspaceMode === 'student' ? 'Gia sư AI (24/7)' : 'AI Tutor'}</span>}
            </div>
            {!isCollapsed && workspaceMode === 'student' && (
              <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                Socratic
              </span>
            )}
          </Link>

          {/* Student Mode extra items: Thảo luận, Thời khóa biểu */}
          {workspaceMode === 'student' ? (
            <>
              <Link
                href="/discussion"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-all"
                title="Thảo luận"
              >
                <span className="material-symbols-outlined text-[20px]">forum</span>
                {!isCollapsed && <span>Thảo luận</span>}
              </Link>
              <Link
                href="/schedule"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-all"
                title="Thời khóa biểu"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                {!isCollapsed && <span>Thời khóa biểu</span>}
              </Link>
            </>
          ) : (
            /* Faculty Mode item: Thống kê & Đánh giá */
            <Link
              href="/competency"
              className={
                isRadarActive
                  ? isCollapsed
                    ? 'flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-xs transition-all'
                    : 'flex items-center gap-3 px-3.5 py-2.5 transition-colors bg-blue-600 text-white font-bold rounded-xl shadow-xs text-sm'
                  : isCollapsed
                  ? 'flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                  : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium'
              }
              title="Thống kê & Đánh giá"
            >
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              {!isCollapsed && <span>Thống kê & Đánh giá</span>}
            </Link>
          )}

          {/* Cài đặt */}
          <Link
            href="/settings"
            prefetch={true}
            className={
              isSettingsActive
                ? isCollapsed
                  ? 'flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-xs transition-all'
                  : 'flex items-center gap-3 px-3.5 py-2.5 transition-colors bg-blue-600 text-white font-bold rounded-xl shadow-xs text-sm'
                : isCollapsed
                ? 'flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium'
            }
            title="Cài đặt"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {!isCollapsed && <span>Cài đặt</span>}
          </Link>

          {/* Student Mode item: Trợ giúp */}
          {workspaceMode === 'student' && (
            <Link
              href="/help"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-all"
              title="Trợ giúp"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
              {!isCollapsed && <span>Trợ giúp</span>}
            </Link>
          )}
        </nav>
      </div>

      {/* Instructor / Student Profile Card at Sidebar Footer */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shadow-sm">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
                {workspaceMode === 'student' ? 'NM' : 'LN'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {workspaceMode === 'student' ? 'Trần Nhật Minh' : 'TS. Lê Hoàng Nam'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {workspaceMode === 'student' ? 'Học viên & Trợ giảng' : 'Chủ nhiệm bộ môn'}
              </span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">unfold_more</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
            {workspaceMode === 'student' ? 'NM' : 'LN'}
          </div>
        </div>
      )}
    </aside>
  );
}
