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
      <div className="bg-white dark:bg-[#1E1F20] p-2 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-1">
        <div className="px-3.5 py-1.5 text-[11px] uppercase tracking-wider text-[#747775] dark:text-[#8E918F] font-bold">
          {t('menuCategoriesTitle')}
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all border-none cursor-pointer ${
                isActive
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                  : 'text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]'
              }`}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'text-[#041E49] dark:text-[#A8C7FA]' : 'text-[#0B57D0] dark:text-[#A8C7FA]'
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold leading-snug ${
                      isActive ? 'text-[#041E49] dark:text-[#A8C7FA]' : 'text-[#1F1F1F] dark:text-[#E3E3E3]'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span
                    className={`text-[11px] leading-tight ${
                      isActive ? 'text-[#041E49]/80 dark:text-[#A8C7FA]/80' : 'text-[#747775] dark:text-[#8E918F]'
                    }`}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isActive ? 'text-[#041E49] dark:text-[#A8C7FA]' : 'opacity-30'
                }`}
              >
                chevron_right
              </span>
            </button>
          );
        })}
      </div>

      {/* Pro Membership & Cloud Lab Quota Card */}
      <div className="bg-white dark:bg-[#1E1F20] p-4 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                workspace_premium
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3] leading-snug">
                ILMS Pro Member
              </span>
              <span className="text-[11px] text-[#0B57D0] dark:text-[#A8C7FA] font-semibold">
                {t('quotaExpiresAt')}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-[10px] font-bold border-none">
            {t('badgeActive')}
          </span>
        </div>

        {/* Cloud Lab Storage Progress */}
        <div className="bg-[#F0F4F9] dark:bg-[#282A2C] p-3 rounded-2xl border-none flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#444746] dark:text-[#C4C7C5] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                cloud
              </span>
              {t('cloudQuotaTitle')}
            </span>
            <span className="font-mono text-[#1F1F1F] dark:text-[#E3E3E3] font-bold">
              15.6 / 20 GB
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#E1E5EA] dark:bg-[#1E1F20] overflow-hidden">
            <div className="h-full bg-[#0B57D0] dark:bg-[#A8C7FA] rounded-full" style={{ width: '78%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#747775] dark:text-[#8E918F]">
            <span>{t('usedPercentage')}</span>
            <button
              onClick={() => onSelectTab('tab-billing')}
              className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline font-semibold border-none cursor-pointer bg-transparent"
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
