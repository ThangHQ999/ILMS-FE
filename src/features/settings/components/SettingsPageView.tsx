'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/features/auth';
import {
  DashboardSidebar,
  DashboardHeader,
  useDashboardMode,
} from '@/features/dashboard';
import { useSettingsSearch } from '../hooks/useSettingsSearch';
import { SettingsHeader } from './SettingsHeader';
import { SettingsNavigationTabs } from './SettingsNavigationTabs';
import { ProfileTab } from './tabs/ProfileTab';
import { AppearanceTab } from './tabs/AppearanceTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { SecurityTab } from './tabs/SecurityTab';
import { BillingTab } from './tabs/BillingTab';
import { SupportTab } from './tabs/SupportTab';
import { SaveToast } from './SaveToast';

export function SettingsPageView() {
  const { data: user } = useCurrentUser();
  const { isFocus, toggleMode } = useDashboardMode();

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

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    handleSearchChange,
    showSaveToast,
    triggerSaveToast,
    hideSaveToast,
  } = useSettingsSearch('tab-profile');

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Trần Nhật Minh';

  return (
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] antialiased font-sans selection:bg-secondary/20 selection:text-secondary">
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
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
            {/* Header Block */}
            <SettingsHeader
              userFullName={userFullName}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />

            {/* 2-Column Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Navigation Tabs & Quota Card (lg:col-span-4) */}
              <div className="lg:col-span-4 w-full">
                <SettingsNavigationTabs
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                />
              </div>

              {/* Right Column: Settings Detail Panes (lg:col-span-8) */}
              <div className="lg:col-span-8 w-full">
                {activeTab === 'tab-profile' && (
                  <ProfileTab onSuccessToast={triggerSaveToast} />
                )}
                {activeTab === 'tab-appearance' && (
                  <AppearanceTab onSuccessToast={triggerSaveToast} />
                )}
                {activeTab === 'tab-notifications' && (
                  <NotificationsTab onSuccessToast={triggerSaveToast} />
                )}
                {activeTab === 'tab-security' && (
                  <SecurityTab onSuccessToast={triggerSaveToast} />
                )}
                {activeTab === 'tab-billing' && (
                  <BillingTab onSuccessToast={triggerSaveToast} />
                )}
                {activeTab === 'tab-support' && (
                  <SupportTab onSuccessToast={triggerSaveToast} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notification Overlay */}
      <SaveToast show={showSaveToast} onClose={hideSaveToast} />
    </div>
  );
}
