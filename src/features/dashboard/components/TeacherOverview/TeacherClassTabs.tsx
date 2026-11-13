'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export type TeacherTabId = 'overview' | 'courses' | 'announcements' | 'students' | 'gradebook' | 'settings';

interface TeacherClassTabsProps {
  activeTab?: TeacherTabId;
  onTabChange?: (tab: TeacherTabId) => void;
  coursesCount?: number;
  announcementsCount?: number;
  studentsCount?: number;
}

export function TeacherClassTabs({
  activeTab = 'overview',
  onTabChange,
  coursesCount = 4,
  announcementsCount = 5,
  studentsCount = 42,
}: TeacherClassTabsProps) {
  const t = useTranslations('dashboard.teacher');

  const tabs: Array<{ id: TeacherTabId; label: string; icon: string; count?: number }> = [
    { id: 'overview', label: t('tabOverview'), icon: 'dashboard_customize' },
    { id: 'courses', label: t('tabCourses'), icon: 'auto_stories', count: coursesCount },
    { id: 'announcements', label: t('tabAnnouncements'), icon: 'campaign', count: announcementsCount },
    { id: 'students', label: t('tabStudents'), icon: 'groups', count: studentsCount },
    { id: 'gradebook', label: t('tabGradebook'), icon: 'insights' },
    { id: 'settings', label: t('tabClassSettings'), icon: 'tune' },
  ];

  return (
    <nav
      aria-label="Teacher class tabs"
      className="sticky top-16 z-30 w-full mt-4 rounded-full bg-surface/90 backdrop-blur-md shadow-md3-1 dark:shadow-none p-1.5 flex items-center gap-1 overflow-x-auto border-none scrollbar-none"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-none cursor-pointer ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-none font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                  isActive
                    ? 'bg-white/70 dark:bg-black/30 text-on-primary-container'
                    : 'bg-surface-variant text-on-surface-variant'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
