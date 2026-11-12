'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '../../hooks/useSettings';

interface NotificationsTabProps {
  onSuccessToast: () => void;
}

export function NotificationsTab({ onSuccessToast }: NotificationsTabProps) {
  const t = useTranslations('settings');
  const { data: settings, isLoading } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings(onSuccessToast);

  if (isLoading || !settings) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  const toggleChannel = (channelKey: 'push' | 'email' | 'sms') => {
    updateMutation.mutate({
      channels: {
        ...settings.channels,
        [channelKey]: !settings.channels[channelKey],
      },
    });
  };

  const toggleCategory = (
    catKey:
      | 'tutorAndAiMessages'
      | 'deadlineReminders'
      | 'streaksAndRankings'
      | 'webinarsAndPromotions'
  ) => {
    updateMutation.mutate({
      categories: {
        ...settings.categories,
        [catKey]: !settings.categories[catKey],
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-none flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#E3E3E3]">
            {t('notifChannelsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#C4C7C5]">
            {t('notifChannelsSubtitle')}
          </p>
        </div>

        {/* Channels Toggles */}
        <div className="flex flex-col gap-3">
          {/* Push Notification */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  devices_other
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('pushNotifTitle')}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
                  {t('pushNotifDesc')}
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleChannel('push')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.channels.push
                  ? 'bg-secondary'
                  : 'bg-slate-300 dark:bg-[#282A2C]'
              }`}
              type="button"
              role="switch"
              aria-checked={settings.channels.push}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.channels.push ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Email Notification */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  mark_email_unread
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('emailNotifTitle')}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
                  {t('emailNotifDesc')}
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleChannel('email')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.channels.email
                  ? 'bg-secondary'
                  : 'bg-slate-300 dark:bg-[#282A2C]'
              }`}
              type="button"
              role="switch"
              aria-checked={settings.channels.email}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.channels.email ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* SMS Notification */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">sms</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('smsNotifTitle')}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
                  {t('smsNotifDesc')}
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleChannel('sms')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.channels.sms
                  ? 'bg-secondary'
                  : 'bg-slate-300 dark:bg-[#282A2C]'
              }`}
              type="button"
              role="switch"
              aria-checked={settings.channels.sms}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.channels.sms ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Granular Content Preferences */}
        <div className="pt-4 border-t border-slate-200 dark:border-transparent flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
            {t('notifCategoriesTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Item 1 */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent flex items-center justify-between">
              <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('catTutorMessages')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                  {t('catTutorMessagesDesc')}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.categories.tutorAndAiMessages}
                onChange={() => toggleCategory('tutorAndAiMessages')}
                className="w-5 h-5 accent-secondary cursor-pointer"
              />
            </div>

            {/* Item 2 */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent flex items-center justify-between">
              <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('catDeadlineReminders')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                  {t('catDeadlineRemindersDesc')}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.categories.deadlineReminders}
                onChange={() => toggleCategory('deadlineReminders')}
                className="w-5 h-5 accent-secondary cursor-pointer"
              />
            </div>

            {/* Item 3 */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent flex items-center justify-between">
              <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('catStreakRanking')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                  {t('catStreakRankingDesc')}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.categories.streaksAndRankings}
                onChange={() => toggleCategory('streaksAndRankings')}
                className="w-5 h-5 accent-secondary cursor-pointer"
              />
            </div>

            {/* Item 4 */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent flex items-center justify-between">
              <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('catWebinarPromos')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                  {t('catWebinarPromosDesc')}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.categories.webinarsAndPromotions}
                onChange={() => toggleCategory('webinarsAndPromotions')}
                className="w-5 h-5 accent-secondary cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
