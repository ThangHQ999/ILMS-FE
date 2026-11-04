'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SettingsTabId } from '../types';

interface SettingsNavigationTabsProps {
  activeTab: SettingsTabId;
  onSelectTab: (tabId: SettingsTabId) => void;
}

export function SettingsNavigationTabs({
  activeTab,
  onSelectTab,
}: SettingsNavigationTabsProps) {
  const t = useTranslations('settings');

  const navItems: Array<{
    id: SettingsTabId;
    icon: string;
    title: string;
    subtitle: string;
  }> = [
    {
      id: 'tab-profile',
      icon: 'person',
      title: t('tabProfileTitle'),
      subtitle: t('tabProfileSubtitle'),
    },
    {
      id: 'tab-appearance',
      icon: 'palette',
      title: t('tabAppearanceTitle'),
      subtitle: t('tabAppearanceSubtitle'),
    },
    {
      id: 'tab-notifications',
      icon: 'notifications_active',
      title: t('tabNotificationsTitle'),
      subtitle: t('tabNotificationsSubtitle'),
    },
    {
      id: 'tab-security',
      icon: 'verified_user',
      title: t('tabSecurityTitle'),
      subtitle: t('tabSecuritySubtitle'),
    },
    {
      id: 'tab-billing',
      icon: 'credit_card',
      title: t('tabBillingTitle'),
      subtitle: t('tabBillingSubtitle'),
    },
    {
      id: 'tab-support',
      icon: 'help_center',
      title: t('tabSupportTitle'),
      subtitle: t('tabSupportSubtitle'),
    },
  ];

  return (
    <div className="flex flex-col gap-4 sticky top-20">
      {/* Navigation Menu */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
        <div className="px-3.5 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
          {t('menuCategoriesTitle')}
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'text-white' : 'text-secondary'
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold leading-snug ${
                      isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span
                    className={`text-[11px] leading-tight ${
                      isActive ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isActive ? 'text-white' : 'opacity-30'
                }`}
              >
                chevron_right
              </span>
            </button>
          );
        })}
      </div>

      {/* Pro Membership & Cloud Lab Quota Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                workspace_premium
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                ILMS Pro Member
              </span>
              <span className="text-[11px] text-secondary font-semibold">
                {t('quotaExpiresAt')}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">
            {t('badgeActive')}
          </span>
        </div>

        {/* Cloud Lab Storage Progress */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                cloud
              </span>
              {t('cloudQuotaTitle')}
            </span>
            <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
              15.6 / 20 GB
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: '78%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{t('usedPercentage')}</span>
            <button
              onClick={() => onSelectTab('tab-billing')}
              className="text-secondary hover:underline font-semibold"
              type="button"
            >
              {t('btnExpandStorage')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
