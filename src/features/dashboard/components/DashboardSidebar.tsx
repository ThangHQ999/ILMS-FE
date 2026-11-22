'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUserRole } from '@/hooks/useUserRole';

export interface DashboardSidebarProps {
  isFocus?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  workspaceMode?: 'faculty' | 'student';
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  badge?: React.ReactNode;
  iconColor?: string;
}

interface NavGroup {
  key: string;
  title: string;
  items: NavItem[];
}

export function DashboardSidebar({
  isFocus = false,
  isCollapsed = false,
  onToggleCollapse,
  workspaceMode,
}: DashboardSidebarProps) {
  const t = useTranslations('sidebar');
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isTeacher: roleIsTeacher } = useUserRole();
  const isTeacher = mounted
    ? (workspaceMode ? workspaceMode === 'faculty' : roleIsTeacher)
    : (workspaceMode === 'faculty');

  // In Focus mode, collapse automatically to 72px without triggering any API mutation
  const collapsed = isFocus || isCollapsed;

  // Active route matching (includes teammate routes: /courses, /competency, /timetable)
  const isOverviewActive = pathname === '/dashboard';
const isClassesActive =
    (pathname.startsWith('/classes') || pathname.startsWith('/courses')) &&
    !pathname.includes('discussions') &&
    !pathname.includes('assignments');
  const isMaterialsActive = pathname.startsWith('/materials');
  const isScheduleActive =
    pathname.startsWith('/lesson-sessions') ||
    pathname.startsWith('/schedule') ||
    pathname.startsWith('/timetable');
  const isRadarActive = pathname.startsWith('/competency');
  const isAssignmentsActive =
    pathname.startsWith('/assignments') ||
    (pathname.startsWith('/classes') && pathname.includes('assignments'));
  const isGraphActive = pathname.startsWith('/knowledge-graph');
  const isAiTutorActive = pathname.startsWith('/ai-tutor');
  const isDiscussionsActive =
    pathname.startsWith('/discussions') ||
    (pathname.startsWith('/classes') && pathname.includes('discussions'));
  const isSettingsActive = pathname.startsWith('/settings');

  // Unified Design System Styling (compatible with all workspace views)
  const activeClass =
    'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs';
  const inactiveClass =
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100 transition-colors font-medium';

  const examItems: NavItem[] = [
    {
      href: '/assignments/question-bank',
      icon: 'help_center',
      label: 'Ngân hàng câu hỏi',
      active:
        pathname.startsWith('/assignments/question-bank') ||
        pathname.startsWith('/question-bank') ||
        pathname.includes('tab=bank'),
    },
    {
      href: '/assignments',
      icon: 'fact_check',
      label: 'Quản lý Đề thi & Quiz',
      active:
        isAssignmentsActive &&
        !pathname.startsWith('/assignments/question-bank') &&
        !pathname.startsWith('/question-bank') &&
        !pathname.includes('tab=bank'),
    },
    {
      href: '/assignments/proctoring',
      icon: 'visibility',
      label: 'Giám sát phòng thi',
      active: pathname.startsWith('/assignments/proctoring') || pathname.includes('proctoring'),
    },
  ];

  const navGroups: NavGroup[] = [
    {
      key: 'generalGroup',
      title: t('generalGroup'),
      items: [
        {
          href: '/dashboard',
          icon: 'grid_view',
          label: t('navOverview'),
          active: isOverviewActive,
        },
        {
          href: '/classes',
          icon: 'school',
          label: t('navMyClasses'),
          active: isClassesActive,
        },
        {
          href: '/materials',
          icon: 'auto_stories',
          label: t('navMaterials'),
          active: isMaterialsActive,
          badge: (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 shrink-0">
              AI
            </span>
          ),
        },
        {
          href: '/lesson-sessions',
          icon: 'calendar_month',
          label: t('navSchedule'),
          active: isScheduleActive,
        },
        {
          href: '/competency',
          icon: 'radar',
          label: isTeacher ? t('navPloMatrix') : t('navCompetency'),
          active: isRadarActive,
        },
        ...(isTeacher
          ? []
          : [
              {
                href: '/assignments',
                icon: 'quiz',
                label: t('navAssignments'),
                active: isAssignmentsActive,
                badge: (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 shrink-0">
                    3
                  </span>
                ),
              },
            ]),
        {
          href: '/knowledge-graph',
          icon: 'hub',
          label: t('navGraph'),
          active: isGraphActive,
        },
      ],
    },
    ...(isTeacher
      ? [
          {
            key: 'examGroup',
            title: 'KHẢO THÍ & BÀI THI',
            items: examItems,
          },
        ]
      : []),
    {
      key: 'aiGroup',
      title: t('aiGroup'),
      items: [
        {
          href: '/ai-tutor',
          icon: 'auto_awesome',
          label: t('navAiTutor'),
          active: isAiTutorActive,
          iconColor: 'text-blue-600 dark:text-blue-400',
          badge: (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 shrink-0">
              24/7
            </span>
          ),
        },
        {
          href: '/classes?tab=discussions',
          icon: 'forum',
          label: t('navDiscussions'),
          active: isDiscussionsActive,
          badge: (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 shrink-0">
              5
            </span>
          ),
        },
      ],
    },
  ];

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen ${
        collapsed ? 'w-[72px]' : 'w-64'
      } bg-white dark:bg-[#121620] border-r border-slate-200/80 dark:border-slate-800 z-50 flex flex-col justify-between select-none transition-all duration-300`}
    >
      {/* 1. Header (Brand Logo + Top-Edge Collapse/Expand Button) */}
      <div className="h-[60px] px-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        {!collapsed ? (
          <>
            <Link
              href="/dashboard"
              prefetch={true}
              className="flex items-center group focus:outline-none min-w-0 h-9"
              title="ILMS EduTech"
            >
              <img
                src="/logo-full.png"
                alt="ILMS EduTech"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {!isFocus && onToggleCollapse && (
              <button
                type="button"
                onClick={handleToggle}
                aria-label={t('collapseSidebar')}
                title={t('collapseSidebar')}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
            )}
          </>
        ) : (
          <div className="w-full flex items-center justify-center relative">
            <Link
              href="/dashboard"
              prefetch={true}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
              title="ILMS EduTech"
            >
              <img
                src="/logo-short.png"
                alt="ILMS"
                className="w-8 h-8 object-contain"
              />
            </Link>

            {!isFocus && onToggleCollapse && (
              <button
                type="button"
                onClick={handleToggle}
                aria-label={t('expandSidebar')}
                title={t('expandSidebar')}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:scale-110 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Scrollable Navigation Area */}
      <nav
        className={`flex-1 overflow-y-auto py-3 space-y-4 scrollbar-none ${
          collapsed ? 'px-2' : 'px-3'
        }`}
      >
        {navGroups.map((group) => (
          <div key={group.key} className="space-y-1">
            {!collapsed ? (
              <div className="px-3 pt-1 pb-1.5">
                <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  {group.title}
                </span>
              </div>
            ) : (
              <div className="h-2 w-full flex items-center justify-center">
                <div className="h-px w-6 bg-slate-200 dark:bg-slate-800 my-1" />
              </div>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                if (collapsed) {
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      prefetch={item.href.startsWith('/')}
                      title={item.label}
                      suppressHydrationWarning
                      className={`relative flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all duration-200 ${
                        item.active ? activeClass : inactiveClass
                      }`}
                    >
                      {item.href === '/ai-tutor' ? (
                        <img
                          src="/socratic_mascot.png"
                          alt="AI"
                          className="w-5 h-5 object-contain"
                        />
                      ) : (
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            !item.active && item.iconColor ? item.iconColor : ''
                          }`}
                        >
                          {item.icon}
                        </span>
                      )}
                      {item.badge && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 ring-2 ring-white dark:ring-[#121620]" />
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    prefetch={item.href.startsWith('/')}
                    title={item.label}
                    suppressHydrationWarning
                    className={`flex items-center justify-between gap-3 px-3 h-10 rounded-xl text-sm transition-all duration-200 ${
                      item.active ? activeClass : inactiveClass
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0" suppressHydrationWarning>
                      {item.href === '/ai-tutor' ? (
                        <img
                          src="/socratic_mascot.png"
                          alt="AI"
                          className="w-5 h-5 object-contain shrink-0"
                        />
                      ) : (
                        <span
                          className={`material-symbols-outlined text-[20px] shrink-0 ${
                            !item.active && item.iconColor ? item.iconColor : ''
                          }`}
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="truncate" suppressHydrationWarning>
                        {item.label}
                      </span>
                    </div>
                    {item.badge}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Pinned Footer (Help, Settings, Semester Metadata) */}
      <div
        className={`shrink-0 pt-2 pb-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1 ${
          collapsed ? 'px-2 items-center' : 'px-3'
        }`}
      >
        {collapsed ? (
          <Link
            href="/settings"
            prefetch={true}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-colors ${inactiveClass}`}
            title={t('navHelp')}
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </Link>
        ) : (
          <Link
            href="/settings"
            prefetch={true}
            className={`flex items-center gap-3 px-3 h-9 rounded-xl text-xs transition-colors ${inactiveClass}`}
          >
            <span className="material-symbols-outlined text-[19px] shrink-0">help_outline</span>
            <span className="truncate">{t('navHelp')}</span>
          </Link>
        )}

        {collapsed ? (
          <Link
            href="/settings"
            prefetch={true}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-colors ${
              isSettingsActive ? activeClass : inactiveClass
            }`}
            title={t('navSettings')}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </Link>
        ) : (
          <Link
            href="/settings"
            prefetch={true}
            className={`flex items-center gap-3 px-3 h-9 rounded-xl text-xs transition-colors ${
              isSettingsActive ? activeClass : inactiveClass
            }`}
          >
            <span className="material-symbols-outlined text-[19px] shrink-0">settings</span>
            <span className="truncate">{t('navSettings')}</span>
          </Link>
        )}

        {!collapsed ? (
          <div className="pt-2 px-3 flex items-center justify-between text-[10.5px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 mt-1">
            <span className="truncate">{t('semesterBadge')}</span>
            <span className="font-mono text-[10px] font-semibold text-slate-400">
              {t('systemVersion')}
            </span>
          </div>
        ) : (
          <div className="pt-1.5 text-center text-[9px] font-mono font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 w-8 mx-auto mt-1">
            {t('systemVersion')}
          </div>
        )}
      </div>
    </aside>
  );
}
