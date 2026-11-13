'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { TeacherWeeklyTimetableView } from './TeacherWeeklyTimetableView';

interface TimetablePageViewProps {
  userFullName?: string;
}

export function TimetablePageView({
  userFullName = 'TS. Nguyễn Văn An',
}: TimetablePageViewProps) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] antialiased font-sans selection:bg-secondary/20 selection:text-secondary">
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={`transition-all duration-300 ${
          isFocusMode || isSidebarCollapsed ? 'pl-20' : 'pl-72'
        }`}
      >
        <DashboardHeader
          isFocus={isFocusMode}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleMode={() => setIsFocusMode((prev) => !prev)}
          userFullName={userFullName}
        />

        <main className="w-full min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-16">
          <TeacherWeeklyTimetableView
            userFullName={userFullName}
            onBack={() => router.push('/dashboard')}
          />
        </main>
      </div>
    </div>
  );
}

