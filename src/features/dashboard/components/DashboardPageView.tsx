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

  const isDataReady =
    !isLoading && analytics && competency && aiInsight && courses && aiTasks;

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
          {!isDataReady ? (
            <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
              <div className="h-44 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
                <div className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
                <div className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
                <div className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-96 lg:col-span-2 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
                <div className="h-96 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
              </div>
            </div>
          ) : isFocus ? (
            <FocusView userFullName={userFullName} aiTasks={aiTasks!} />
          ) : (
            <AnalyticsView
              userFullName={userFullName}
              onSwitchToFocus={() => switchMode('focus')}
              stats={analytics!}
              heatmap={competency!.heatmap}
              pillars={competency!.pillars}
              insight={aiInsight!}
              courses={courses!}
            />
          )}
        </main>
      </div>
    </div>
  );
}
