'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface DashboardSidebarProps {
  isFocus: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DashboardSidebar({
  isFocus,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();

  const isOverviewActive = pathname === '/dashboard';
  const isGraphActive = pathname.startsWith('/knowledge-graph');
  const isRadarActive = pathname.startsWith('/competency');
  const isAiTutorActive = pathname.startsWith('/ai-tutor');
  const isSettingsActive = pathname.startsWith('/settings');

  if (isFocus) {
    // 80px Compact Sidebar for Focus Mode
    return (
      <aside className="fixed left-0 top-0 h-full w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col justify-between py-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300">
        <div className="flex flex-col items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-12 w-12 rounded-xl focus:outline-none hover:opacity-90 transition-opacity"
            title="ILMS"
          >
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
          </Link>
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            <Link
              href="/dashboard"
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isOverviewActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={t('navOverview')}
            >
              <span className="material-symbols-outlined text-[22px]">space_dashboard</span>
            </Link>
            <a
              href="#"
              className="flex items-center justify-center w-12 h-12 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
              title={t('navCourses')}
            >
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </a>
            <Link
              href="/knowledge-graph"
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isGraphActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={t('navGraph')}
            >
              <span className="material-symbols-outlined text-[22px]">hub</span>
            </Link>
            <Link
              href="/competency"
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isRadarActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={t('navRadar')}
            >
              <span className="material-symbols-outlined text-[22px]">radar</span>
            </Link>
            <a
              href="#"
              className="flex items-center justify-center w-12 h-12 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
              title={t('navQuizzes')}
            >
              <span className="material-symbols-outlined text-[22px]">fact_check</span>
            </a>
            <Link
              href="/ai-tutor"
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isAiTutorActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={t('navAiTutor')}
            >
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            </Link>
            <a
              href="#"
              className="flex items-center justify-center w-12 h-12 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
              title={t('navDiscussion')}
            >
              <span className="material-symbols-outlined text-[22px]">forum</span>
            </a>
          </nav>
        </div>

        <div className="flex flex-col items-center gap-2 w-full px-2">
          <Link
            href="/settings"
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
              isSettingsActive
                ? 'bg-secondary text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            title={t('navSettings')}
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </Link>
        </div>
      </aside>
    );
  }

  // Sidebar for Analytics Mode (Expandable / Collapsible between 260px and 80px)
  return (
    <aside
      className={`fixed left-0 top-0 h-full ${
        isCollapsed ? 'w-20' : 'w-[260px]'
      } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300`}
    >
      {/* Collapse/Expand Floating Button on the border */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_8px_rgba(0,0,0,0.12)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          type="button"
          aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
        >
          <span className="material-symbols-outlined text-[15px] text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      )}

      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
          <Link
            href="/dashboard"
            className="flex items-center justify-center focus:outline-none hover:opacity-90 transition-opacity"
            title="ILMS"
          >
            {isCollapsed ? (
              <img
                src="/logo-short.png"
                alt="ILMS Logo"
                className="h-8 w-auto object-contain transition-transform hover:scale-105"
              />
            ) : (
              <>
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
              </>
            )}
          </Link>
        </div>

        {/* Section title / divider */}
        {!isCollapsed ? (
          <div className="px-4 py-1">
            <div className="px-3 py-1 font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
              {t('learningArea')}
            </div>
          </div>
        ) : (
          <div className="py-1">
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 mx-auto my-1" />
          </div>
        )}

        {/* Nav Links */}
        <nav
          className={`flex-1 space-y-1 overflow-y-auto scrollbar-none ${
            isCollapsed ? 'px-2 flex flex-col items-center' : 'px-4'
          }`}
        >
          {/* Overview */}
          <Link
            href="/dashboard"
            className={
              isOverviewActive
                ? isCollapsed
                  ? 'flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-white shadow-sm transition-all'
                  : 'flex items-center gap-3 px-3.5 py-2.5 transition-colors bg-secondary text-white font-medium rounded-xl shadow-sm'
                : isCollapsed
                ? 'flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm font-medium'
            }
            title={t('navOverview')}
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            {!isCollapsed && <span className="text-sm">{t('navOverview')}</span>}
          </Link>

          {/* Courses */}
          <a
            href="#"
            className={
              isCollapsed
                ? 'flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm font-medium'
            }
            title={t('navCourses')}
          >
            <span className="material-symbols-outlined text-[20px]">school</span>
            {!isCollapsed && <span>{t('navCourses')}</span>}
          </a>

          {/* Knowledge Graph */}
          <Link
            href="/knowledge-graph"
            className={
              isGraphActive
                ? isCollapsed
                  ? 'flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-white shadow-sm transition-all'
                  : 'flex items-center gap-3 px-3.5 py-2.5 transition-colors bg-secondary text-white font-medium rounded-xl shadow-sm'
                : isCollapsed
                ? 'flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm font-medium'
            }
            title={t('navGraph')}
          >
            <span className="material-symbols-outlined text-[20px]">hub</span>
            {!isCollapsed && <span>{t('navGraph')}</span>}
          </Link>

          {/* Competency Radar */}
          <Link
            href="/competency"
            className={
              isRadarActive
                ? isCollapsed
                  ? 'flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-white shadow-sm transition-all'
                  : 'flex items-center gap-3 px-3.5 py-2.5 transition-colors bg-secondary text-white font-medium rounded-xl shadow-sm'
                : isCollapsed
                ? 'flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm font-medium'
            }
            title={t('navRadar')}
          >
            <span className="material-symbols-outlined text-[20px]">radar</span>
            {!isCollapsed && <span>{t('navRadar')}</span>}
          </Link>

          {/* Quizzes */}
          <a
            href="#"
            className={
              isCollapsed
                ? 'flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm font-medium'
            }
            title={t('navQuizzes')}
          >
            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            {!isCollapsed && <span>{t('navQuizzes')}</span>}
          </a>

          {/* AI Tutor */}
          <Link
            href="/ai-tutor"
            className={
              isCollapsed
                ? 'flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm font-medium'
            }
            title={t('navAiTutor')}
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">
              auto_awesome
            </span>
            {!isCollapsed && (
              <>
                <span className="flex-1">{t('navAiTutor')}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">
                  24/7
                </span>
              </>
            )}
          </Link>

          {/* Discussion */}
          <a
            href="#"
            className={
              isCollapsed
                ? 'flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm font-medium'
            }
            title={t('navDiscussion')}
          >
            <span className="material-symbols-outlined text-[20px]">forum</span>
            {!isCollapsed && <span>{t('navDiscussion')}</span>}
          </a>

          <div className="pt-2 pb-1">
            <div
              className={`h-px bg-slate-200 dark:bg-slate-800 my-1 ${
                isCollapsed ? 'w-8 mx-auto' : 'mx-2'
              }`}
            />
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className={
              isCollapsed
                ? 'flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
                : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm font-medium'
            }
            title={t('navSettings')}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {!isCollapsed && <span>{t('navSettings')}</span>}
          </Link>
        </nav>
      </div>

      {/* Cloud Lab Storage Widget */}
      {!isCollapsed ? (
        <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('cloudStorage')}
            </span>
            <span className="font-mono text-xs text-secondary font-bold">78%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-secondary h-full rounded-full" style={{ width: '78%' }} />
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>15.6 GB / 20 GB</span>
            <a href="#" className="font-semibold text-secondary hover:underline">
              {t('upgrade')}
            </a>
          </div>
        </div>
      ) : (
        <div
          className="p-2.5 mx-auto my-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`${t('cloudStorage')}: 15.6 GB / 20 GB (78%)`}
        >
          <span className="material-symbols-outlined text-[20px] text-secondary">
            cloud
          </span>
          <span className="font-mono text-[10px] text-secondary font-bold">
            78%
          </span>
        </div>
      )}
    </aside>
  );
}
