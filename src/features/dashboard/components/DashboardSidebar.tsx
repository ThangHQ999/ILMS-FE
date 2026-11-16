'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export interface DashboardSidebarProps {
  isFocus?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  workspaceMode?: 'faculty' | 'student';
}

interface NavItem {
  href: string;
  icon: string;
  labelKey: string;
  defaultLabel: string;
  active: boolean;
  badge?: React.ReactNode;
  iconColor?: string;
}

interface NavGroup {
  groupKey: string;
  defaultGroup: string;
  items: NavItem[];
}

export function DashboardSidebar({
  isFocus = false,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const t = useTranslations('sidebar');
  const pathname = usePathname();

  // If in Focus mode, auto collapse to 72px
  const collapsed = isFocus || isCollapsed;

  // Active route matching
  const isOverviewActive = pathname === '/dashboard';
  const isClassesActive = pathname.startsWith('/classes') && !pathname.includes('discussions');
  const isMaterialsActive = pathname.startsWith('/materials');
  const isScheduleActive =
    pathname.startsWith('/lesson-sessions') || pathname.startsWith('/schedule');
  const isAssignmentsActive = pathname.startsWith('/assignments');
  const isGraphActive = pathname.startsWith('/knowledge-graph');
  const isAiTutorActive = pathname.startsWith('/ai-tutor');
  const isDiscussionsActive =
    pathname.startsWith('/discussions') ||
    (pathname.startsWith('/classes') && pathname.includes('discussions'));
  const isSettingsActive = pathname.startsWith('/settings');

  // Shared Design System Styling
  const activeClass =
    'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs';
  const inactiveClass =
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100 transition-colors font-medium';

  // Navigation Groups Definition (under 18 chars each)
  const navGroups: NavGroup[] = [
    {
      groupKey: 'generalGroup',
      defaultGroup: 'KHÔNG GIAN CHUNG',
      items: [
        {
          href: '/dashboard',
          icon: 'grid_view',
          labelKey: 'navOverview',
          defaultLabel: 'Tổng quan',
          active: isOverviewActive,
        },
        {
          href: '/classes',
          icon: 'school',
          labelKey: 'navMyClasses',
          defaultLabel: 'Lớp học của tôi',
          active: isClassesActive,
        },
        {
          href: '/materials',
          icon: 'auto_stories',
          labelKey: 'navMaterials',
          defaultLabel: 'Kho học liệu',
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
          labelKey: 'navSchedule',
          defaultLabel: 'Lịch trình',
          active: isScheduleActive,
        },
        {
          href: '/assignments',
          icon: 'quiz',
          labelKey: 'navAssignments',
          defaultLabel: 'Bài tập & Quiz',
          active: isAssignmentsActive,
          badge: (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 shrink-0">
              3
            </span>
          ),
        },
        {
          href: '/knowledge-graph',
          icon: 'hub',
          labelKey: 'navGraph',
          defaultLabel: 'Đồ thị tri thức',
          active: isGraphActive,
        },
      ],
    },
    {
      groupKey: 'aiGroup',
      defaultGroup: 'TƯƠNG TÁC & AI',
      items: [
        {
          href: '/ai-tutor',
          icon: 'auto_awesome',
          labelKey: 'navAiTutor',
          defaultLabel: 'Trợ lý AI',
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
          labelKey: 'navDiscussions',
          defaultLabel: 'Thảo luận',
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
      className={`fixed left-0 top-0 h-screen ${collapsed ? 'w-[72px]' : 'w-64'
        } bg-white dark:bg-[#121620] border-r border-slate-200/80 dark:border-slate-800 z-50 flex flex-col justify-between select-none transition-all duration-300`}
    >
      {/* ======================================================== */}
      {/* 1. ĐẦU TRANG (HEADER - Cao 60px)                          */}
      {/* ======================================================== */}
      <div className="h-[60px] px-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        {!collapsed ? (
          <>
            {/* Logo Dài (Full Brand Logo) */}
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

            {/* Nút thu gọn < gọn ở mép trên bên phải (ẩn khi ở chế độ Focus) */}
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
            {/* Logo Ngắn (Short Icon Logo khi thu gọn / Focus Mode) */}
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

            {/* Nút mở rộng > khi đang thu gọn (ẩn khi ở chế độ Focus) */}
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

      {/* ======================================================== */}
      {/* 2. MENU CUỘN Ở GIỮA (SCROLLABLE NAV AREA)               */}
      {/* ======================================================== */}
      <nav
        className={`flex-1 overflow-y-auto py-3 space-y-4 scrollbar-none ${collapsed ? 'px-2' : 'px-3'
          }`}
      >
        {navGroups.map((group) => (
          <div key={group.groupKey} className="space-y-1">
            {/* Tiêu đề nhóm */}
            {!collapsed ? (
              <div className="px-3 pt-1 pb-1.5">
                <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  {t(group.groupKey as any) || group.defaultGroup}
                </span>
              </div>
            ) : (
              <div className="h-2 w-full flex items-center justify-center">
                <div className="h-px w-6 bg-slate-200 dark:bg-slate-800 my-1" />
              </div>
            )}

            {/* Danh sách mục */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const label = t(item.labelKey as any) || item.defaultLabel;

                if (collapsed) {
                  return (
                    <Link
                      key={item.href + item.labelKey}
                      href={item.href}
                      prefetch={item.href.startsWith('/')}
                      title={label}
                      className={`relative flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all duration-200 ${item.active ? activeClass : inactiveClass
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
                          className={`material-symbols-outlined text-[20px] ${!item.active && item.iconColor ? item.iconColor : ''
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
                    key={item.href + item.labelKey}
                    href={item.href}
                    prefetch={item.href.startsWith('/')}
                    title={label}
                    className={`flex items-center justify-between gap-3 px-3 h-10 rounded-xl text-sm transition-all duration-200 ${item.active ? activeClass : inactiveClass
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.href === '/ai-tutor' ? (
                        <img
                          src="/socratic_mascot.png"
                          alt="AI"
                          className="w-5 h-5 object-contain shrink-0"
                        />
                      ) : (
                        <span
                          className={`material-symbols-outlined text-[20px] shrink-0 ${!item.active && item.iconColor ? item.iconColor : ''
                            }`}
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="truncate">{label}</span>
                    </div>
                    {item.badge}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ======================================================== */}
      {/* 3. CHÂN TRANG (FOOTER — GHIM CỐ ĐỊNH Ở ĐÁY)             */}
      {/* ======================================================== */}
      <div
        className={`shrink-0 pt-2 pb-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1 ${collapsed ? 'px-2 items-center' : 'px-3'
          }`}
      >
        {/* Trợ giúp */}
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

        {/* Cài đặt tài khoản */}
        {collapsed ? (
          <Link
            href="/settings"
            prefetch={true}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-colors ${isSettingsActive ? activeClass : inactiveClass
              }`}
            title={t('navSettings')}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </Link>
        ) : (
          <Link
            href="/settings"
            prefetch={true}
            className={`flex items-center gap-3 px-3 h-9 rounded-xl text-xs transition-colors ${isSettingsActive ? activeClass : inactiveClass
              }`}
          >
            <span className="material-symbols-outlined text-[19px] shrink-0">settings</span>
            <span className="truncate">{t('navSettings')}</span>
          </Link>
        )}

        {/* Metadata học kỳ và phiên bản — không đè chữ */}
        {!collapsed ? (
          <div className="pt-2 px-3 flex items-center justify-between text-[10.5px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 mt-1">
            <span className="truncate">{t('semesterBadge') || 'Học kỳ II - 2024'}</span>
            <span className="font-mono text-[10px] font-semibold text-slate-400">
              {t('systemVersion') || 'v2.5'}
            </span>
          </div>
        ) : (
          <div className="pt-1.5 text-center text-[9px] font-mono font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 w-8 mx-auto mt-1">
            v2.5
          </div>
        )}
      </div>
    </aside>
  );
}
