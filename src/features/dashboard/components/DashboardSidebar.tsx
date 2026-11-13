'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUserRole } from '@/hooks/useUserRole';

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
  const { isTeacher } = useUserRole();

  const isOverviewActive = pathname === '/dashboard';
  const isClassesActive = pathname.startsWith('/classes');
  const isSessionsActive = pathname.startsWith('/lesson-sessions') || pathname.includes('/sessions');
  const isGraphActive = pathname.startsWith('/knowledge-graph');
  const isRadarActive = pathname.startsWith('/competency');
  const isAssignmentsActive = pathname.startsWith('/assignments') || (pathname.startsWith('/classes') && (pathname.includes('assignments') || pathname.includes('cs-202')));
  const isMaterialsActive = pathname.startsWith('/materials');
  const isAiTutorActive = pathname.startsWith('/ai-tutor');
  const isSettingsActive = pathname.startsWith('/settings');

  // ==========================================
  // 1. TEACHER SIDEBAR CONFIGURATION
  // ==========================================
  interface TeacherNavItem {
    href: string;
    icon: string;
    label: string;
    active: boolean;
    badge?: React.ReactNode;
    iconColor?: string;
  }

  interface TeacherNavSection {
    title: string;
    items: TeacherNavItem[];
  }

  const teacherSections: TeacherNavSection[] = [
    {
      title: 'QUẢN TRỊ ĐÀO TẠO',
      items: [
        {
          href: '/dashboard',
          icon: 'dashboard',
          label: 'Tổng quan',
          active: isOverviewActive,
        },
        {
          href: '/classes',
          icon: 'school',
          label: 'Lớp học phụ trách',
          active: isClassesActive && !isAssignmentsActive,
        },
        {
          href: '/materials',
          icon: 'library_books',
          label: 'Kho học liệu & Bóc tách AI',
          active: isMaterialsActive,
          badge: (
            <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary dark:bg-[#0842A0]/40 dark:text-[#A8C7FA] font-mono text-[10px] font-bold">
              AI
            </span>
          ),
        },
        {
          href: '/knowledge-graph',
          icon: 'account_tree',
          label: 'Đồ thị tri thức môn học',
          active: isGraphActive,
        },
        {
          href: '/competency',
          icon: 'analytics',
          label: 'Bảng điểm & Ma trận PLO',
          active: isRadarActive,
        },
      ],
    },
    {
      title: 'KHẢO THÍ & BÀI THI',
      items: [
        {
          href: '/assignments',
          icon: 'help_center',
          label: 'Ngân hàng câu hỏi',
          active: pathname.includes('tab=bank'),
        },
        {
          href: '/assignments',
          icon: 'fact_check',
          label: 'Quản lý Đề thi & Quiz',
          active: isAssignmentsActive && !pathname.includes('tab=bank'),
        },
        {
          href: '/assignments',
          icon: 'visibility',
          label: 'Giám sát phòng thi',
          active: pathname.includes('proctoring'),
          badge: (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
          ),
        },
        {
          href: '/assignments',
          icon: 'gavel',
          label: 'Khiếu nại & Chấm lại',
          active: pathname.includes('appeals'),
          badge: (
            <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary dark:bg-[#0842A0]/50 dark:text-[#A8C7FA] font-bold text-[11px] flex items-center justify-center">
              3
            </span>
          ),
        },
      ],
    },
    {
      title: 'TƯƠNG TÁC & HỖ TRỢ',
      items: [
        {
          href: '/classes',
          icon: 'forum',
          label: 'Thảo luận & Tương tác',
          active: pathname.startsWith('/discussions'),
        },
        {
          href: '/ai-tutor',
          icon: 'smart_toy',
          label: 'Trợ lý AI Giảng dạy',
          active: isAiTutorActive,
          iconColor: 'text-purple-600 dark:text-purple-400',
        },
      ],
    },
  ];

  // ==========================================
  // 2. TEACHER SIDEBAR RENDERING
  // ==========================================
  if (isTeacher) {
    if (isFocus) {
      // 80px Focus mode for Teacher
      return (
        <aside className="fixed left-0 top-0 h-full w-20 bg-white dark:bg-[#1E1F20] border-r border-[#E1E5EA] dark:border-[#282A2C] z-50 flex flex-col justify-between py-4 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="flex flex-col items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center justify-center h-12 w-12 rounded-full focus:outline-none hover:opacity-90 transition-opacity"
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
            <nav className="flex flex-col items-center gap-1.5 w-full px-2">
              {teacherSections.flatMap((s) => s.items).map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  prefetch={item.href.startsWith('/')}
                  className={`flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-secondary text-white font-medium shadow-sm'
                      : 'text-[#444746] hover:bg-[#E9EEF6] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:bg-[#282A2C] dark:hover:text-[#E3E3E3]'
                  }`}
                  title={item.label}
                >
                  <span className={`material-symbols-outlined text-[20px] ${!item.active && item.iconColor ? item.iconColor : ''}`}>
                    {item.icon}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            <Link
              href="/settings"
              prefetch={true}
              className={`flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${
                isSettingsActive
                  ? 'bg-secondary text-white font-medium shadow-sm'
                  : 'text-[#444746] hover:bg-[#E9EEF6] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:bg-[#282A2C] dark:hover:text-[#E3E3E3]'
              }`}
              title={t('navSettings')}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </Link>
          </div>
        </aside>
      );
    }

    // Standard / Collapsible Sidebar for Teacher
    return (
      <aside
        className={`fixed left-0 top-0 h-full ${
          isCollapsed ? 'w-20' : 'w-72'
        } bg-white dark:bg-[#1E1F20] border-r border-[#E1E5EA] dark:border-[#282A2C] flex flex-col justify-between z-50 transition-all duration-300 shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:shadow-none`}
      >
        {/* Collapse/Expand Floating Button on the border */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-white dark:bg-[#282A2C] border border-[#E1E5EA] dark:border-[#383A3C] shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group"
            title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
            type="button"
            aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            <span className="material-symbols-outlined text-[15px] text-[#444746] group-hover:text-black dark:text-[#C4C7C5] dark:group-hover:text-white transition-colors">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        )}

        <div className="flex flex-col min-h-0 flex-1">
          {/* Header */}
          <div
            className={`h-16 flex items-center bg-white dark:bg-[#1E1F20] border-b border-[#E1E5EA] dark:border-[#282A2C] transition-all ${
              isCollapsed ? 'justify-center px-0' : 'px-4'
            }`}
          >
            <Link
              href="/dashboard"
              prefetch={true}
              className="flex items-center focus:outline-none hover:opacity-90 transition-opacity"
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

          {/* Navigation Scroll Area */}
          <div
            className={`flex-1 overflow-y-auto ${
              isCollapsed ? 'px-2 py-3' : 'px-4 py-3'
            } flex flex-col gap-4 scrollbar-none`}
          >
            {teacherSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-1">
                {!isCollapsed && (
                  <div className="px-2 py-1 font-semibold text-[11px] uppercase tracking-wider text-[#747775] dark:text-[#8E918F]">
                    {section.title}
                  </div>
                )}
                <nav className={`flex flex-col gap-1 ${isCollapsed ? 'items-center' : ''}`}>
                  {section.items.map((item) => {
                    const activeClass = 'bg-secondary text-white font-semibold shadow-sm';
                    const inactiveClass =
                      'text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E9EEF6] dark:hover:bg-[#282A2C] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] transition-all';

                    if (isCollapsed) {
                      return (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          prefetch={item.href.startsWith('/')}
                          className={`flex items-center justify-center w-11 h-11 rounded-lg ${
                            item.active ? activeClass : inactiveClass
                          }`}
                          title={item.label}
                        >
                          <span
                            className={`material-symbols-outlined text-[20px] ${
                              !item.active && item.iconColor ? item.iconColor : ''
                            }`}
                          >
                            {item.icon}
                          </span>
                        </Link>
                      );
                    }

                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        prefetch={item.href.startsWith('/')}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium ${
                          item.active ? activeClass : inactiveClass
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`material-symbols-outlined text-[20px] ${
                              !item.active && item.iconColor ? item.iconColor : ''
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="p-3 bg-white dark:bg-[#1E1F20] border-t border-[#E1E5EA] dark:border-[#282A2C] flex flex-col gap-1">
          <nav className={`flex flex-col gap-1 ${isCollapsed ? 'items-center' : ''}`}>
            <Link
              href="/settings"
              className={`flex items-center ${
                isCollapsed ? 'justify-center w-11 h-11' : 'gap-2.5 px-3 py-1.5'
              } rounded-lg text-xs font-medium text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E9EEF6] dark:hover:bg-[#282A2C] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] transition-all`}
              title="Trợ giúp & Hướng dẫn"
            >
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
              {!isCollapsed && <span>Trợ giúp & Hướng dẫn</span>}
            </Link>
            <Link
              href="/settings"
              className={`flex items-center ${
                isCollapsed ? 'justify-center w-11 h-11' : 'gap-2.5 px-3 py-1.5'
              } rounded-lg text-xs font-medium ${
                isSettingsActive
                  ? 'bg-secondary text-white font-medium shadow-sm'
                  : 'text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E9EEF6] dark:hover:bg-[#282A2C] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]'
              } transition-all`}
              title={t('navSettings')}
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              {!isCollapsed && <span>Cài đặt tài khoản</span>}
            </Link>
          </nav>
          {!isCollapsed && (
            <div className="pt-2 px-2 flex items-center justify-between text-[11px] text-[#747775] dark:text-[#8E918F] border-t border-[#E1E5EA]/60 dark:border-[#282A2C]/60 mt-1">
              <span>Học kỳ II - 2024</span>
              <span className="font-mono">v2.5</span>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // ==========================================
  // 3. STUDENT SIDEBAR (PRESERVED ORIGINAL)
  // ==========================================
  const studentNavItems = [
    {
      href: '/dashboard',
      icon: 'grid_view',
      label: t('navOverview'),
      active: isOverviewActive,
      show: true,
    },
    {
      href: '/classes',
      icon: 'school',
      label: 'Khóa học của tôi',
      active: isClassesActive,
      show: true,
    },
    {
      href: '/lesson-sessions',
      icon: 'calendar_view_week',
      label: 'Lịch học của tôi',
      active: isSessionsActive,
      show: true,
    },
    {
      href: '/knowledge-graph',
      icon: 'hub',
      label: t('navGraph'),
      active: isGraphActive,
      show: true,
    },
    {
      href: '/competency',
      icon: 'radar',
      label: 'Năng lực cá nhân',
      active: isRadarActive,
      show: true,
    },
    {
      href: '/assignments',
      icon: 'quiz',
      label: t('navQuizzes'),
      active: isAssignmentsActive,
      badge: '3 Mới',
      show: true,
    },
    {
      href: '/ai-tutor',
      icon: 'auto_awesome',
      label: t('navAiTutor'),
      active: isAiTutorActive,
      badge: '24/7',
      show: true,
    },
  ].filter((item) => item.show);

  if (isFocus) {
    // 80px Compact Sidebar for Focus Mode (Student)
    return (
      <aside className="fixed left-0 top-0 h-full w-20 bg-white dark:bg-[#1E1F20] border-none z-50 flex flex-col justify-between py-4 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="flex flex-col items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-12 w-12 rounded-full focus:outline-none hover:opacity-90 transition-opacity"
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
          <nav className="flex flex-col items-center gap-1.5 w-full px-2">
            {studentNavItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                prefetch={item.href.startsWith('/')}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  item.active
                    ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#0842A0]/60 dark:text-[#D3E3FD] font-medium'
                    : 'text-[#444746] hover:bg-[#E9EEF6] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:bg-[#282A2C] dark:hover:text-[#E3E3E3]'
                }`}
                title={item.label}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-1.5 w-full px-2">
          <Link
            href="/settings"
            prefetch={true}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
              isSettingsActive
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#0842A0]/60 dark:text-[#D3E3FD] font-medium'
                : 'text-[#444746] hover:bg-[#E9EEF6] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:bg-[#282A2C] dark:hover:text-[#E3E3E3]'
            }`}
            title={t('navSettings')}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </Link>
        </div>
      </aside>
    );
  }

  // Sidebar for Analytics Mode (Student)
  return (
    <aside
      className={`fixed left-0 top-0 h-full ${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-white dark:bg-[#1E1F20] border-none p-4 flex flex-col justify-between z-50 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none`}
    >
      {/* Collapse/Expand Floating Button on the border */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-white dark:bg-[#282A2C] border-none shadow-none flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          type="button"
          aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
        >
          <span className="material-symbols-outlined text-[15px] text-[#444746] group-hover:text-black dark:text-[#C4C7C5] dark:group-hover:text-white transition-colors">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      )}

      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className={`h-14 flex items-center mb-3 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
          <Link
            href="/dashboard"
            prefetch={true}
            className="flex items-center focus:outline-none hover:opacity-90 transition-opacity"
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

        {/* Section title */}
        {!isCollapsed && (
          <div className="px-3 py-1 mb-1">
            <span className="font-medium text-xs text-[#747775] dark:text-[#8E918F] uppercase tracking-wider">
              {t('learningArea')}
            </span>
          </div>
        )}

        {/* Nav Links */}
        <nav className={`flex-1 flex flex-col gap-1.5 overflow-y-auto scrollbar-none ${isCollapsed ? 'items-center' : ''}`}>
          {studentNavItems.map((item) => {
            const activeClass = 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#0842A0]/60 dark:text-[#D3E3FD] font-medium';
            const inactiveClass = 'text-[#444746] hover:bg-[#E9EEF6] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:bg-[#282A2C] dark:hover:text-[#E3E3E3] transition-colors';

            if (isCollapsed) {
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  prefetch={item.href.startsWith('/')}
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    item.active ? activeClass : inactiveClass
                  }`}
                  title={item.label}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                prefetch={item.href.startsWith('/')}
                className={`flex items-center gap-3.5 h-12 px-4 rounded-full text-sm font-medium ${
                  item.active ? activeClass : inactiveClass
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E9EEF6] dark:bg-[#282A2C] text-[#0B57D0] dark:text-[#A8C7FA]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-1 border-none" />

          {/* Settings */}
          {isCollapsed ? (
            <Link
              href="/settings"
              prefetch={true}
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                isSettingsActive
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#0842A0]/60 dark:text-[#D3E3FD] font-medium'
                  : 'text-[#444746] hover:bg-[#E9EEF6] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:bg-[#282A2C] dark:hover:text-[#E3E3E3] transition-colors'
              }`}
              title={t('navSettings')}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </Link>
          ) : (
            <Link
              href="/settings"
              prefetch={true}
              className={`flex items-center gap-3.5 h-12 px-4 rounded-full text-sm font-medium ${
                isSettingsActive
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#0842A0]/60 dark:text-[#D3E3FD] font-medium'
                  : 'text-[#444746] hover:bg-[#E9EEF6] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:bg-[#282A2C] dark:hover:text-[#E3E3E3] transition-colors'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span>{t('navSettings')}</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom Storage Widget ("Bộ nhớ Cloud Lab") */}
      {!isCollapsed ? (
        <div className="bg-[#F0F4F9] dark:bg-[#131314] rounded-2xl p-4 border-none mt-4 shadow-none">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
              {t('cloudStorage')}
            </span>
            <span className="font-mono text-xs text-[#0B57D0] dark:text-[#A8C7FA] font-medium">78%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#E9EEF6] dark:bg-[#282A2C] overflow-hidden mb-2.5">
            <div className="bg-[#0B57D0] dark:bg-[#A8C7FA] h-full rounded-full transition-all duration-300" style={{ width: '78%' }} />
          </div>
          <div className="flex items-center justify-between text-xs text-[#747775] dark:text-[#8E918F]">
            <span>15.6 GB / 20 GB</span>
            <a href="#" className="font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline">
              {t('upgrade')}
            </a>
          </div>
        </div>
      ) : (
        <div
          className="p-2.5 mx-auto mt-4 rounded-full bg-[#F0F4F9] dark:bg-[#131314] border-none shadow-none flex flex-col items-center gap-1 cursor-pointer hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] transition-colors"
          title={`${t('cloudStorage')}: 15.6 GB / 20 GB (78%)`}
        >
          <span className="material-symbols-outlined text-[20px] text-[#0B57D0] dark:text-[#A8C7FA]">
            cloud
          </span>
          <span className="font-mono text-[10px] text-[#0B57D0] dark:text-[#A8C7FA] font-medium">
            78%
          </span>
        </div>
      )}
    </aside>
  );
}
