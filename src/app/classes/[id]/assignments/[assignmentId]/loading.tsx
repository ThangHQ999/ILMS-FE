'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';

export default function Loading() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
      />
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto ${isFocusMode
            ? 'pl-24'
            : isSidebarCollapsed
              ? 'pl-24'
              : 'lg:pl-[284px]'
          }`}
      >
        <div className="space-y-6 animate-pulse">
          <div className="h-5 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
