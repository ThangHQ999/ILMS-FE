'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/features/auth';
import { useDashboardMode } from '../hooks/useDashboardMode';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { AnalyticsView } from './AnalyticsView/AnalyticsView';
import { FocusView } from './FocusView/FocusView';

export function DashboardPageView() {
  const t = useTranslations('dashboard');
  const { data: user } = useCurrentUser();
  const { isFocus, toggleMode, switchMode } = useDashboardMode();
  const { analytics, competency, aiInsight, courses, aiTasks, isLoading } = useDashboardData();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ilms_analytics_sidebar_collapsed');
      if (stored === 'true') {
        setIsSidebarCollapsed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ilms_analytics_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Nhật Minh';

  if (isLoading || !analytics || !competency || !aiInsight || !courses || !aiTasks) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6fafe] dark:bg-[#0B0F19] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6fafe] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 antialiased font-sans selection:bg-secondary/20 selection:text-secondary">
      {/* Dynamic Sidebar (80px in Focus Mode, 80px/260px in Analytics Mode) */}
      <DashboardSidebar
        isFocus={isFocus}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      {/* Main Container */}
      <div
        className={`transition-all duration-300 ${
          isFocus || isSidebarCollapsed ? 'pl-20' : 'pl-[260px]'
        }`}
      >
        {/* Dynamic Header */}
        <DashboardHeader
          isFocus={isFocus}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleMode={toggleMode}
          userFullName={userFullName}
        />

        {/* Dynamic Content View */}
        <main
          className={`w-full min-h-screen transition-all duration-300 ${
            isFocus ? 'pt-14' : 'pt-16'
          }`}
        >
          {isFocus ? (
            <FocusView userFullName={userFullName} aiTasks={aiTasks} />
          ) : (
            <AnalyticsView
              userFullName={userFullName}
              onSwitchToFocus={() => switchMode('focus')}
              stats={analytics}
              heatmap={competency.heatmap}
              pillars={competency.pillars}
              insight={aiInsight}
              courses={courses}
            />
          )}
        </main>
      </div>
    </div>
  );
}
