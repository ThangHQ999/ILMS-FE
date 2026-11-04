'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { usePreferences, useUpdatePreferences } from '../../hooks/useSettings';

interface AppearanceTabProps {
  onSuccessToast: () => void;
}

export function AppearanceTab({ onSuccessToast }: AppearanceTabProps) {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { data: preferences, isLoading } = usePreferences();
  const updatePreferencesMutation = useUpdatePreferences(onSuccessToast);

  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'vi' | 'en'>('vi');
  const [timezone, setTimezone] = useState('(GMT+07:00) Bangkok, Hanoi, Jakarta');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY (15/08/2025)');
  const [fontSize, setFontSize] = useState<'100%' | '115%' | '125%'>('100%');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (preferences) {
      setSelectedLanguage(preferences.language || 'vi');
      setTimezone(preferences.timezone || '(GMT+07:00) Bangkok, Hanoi, Jakarta');
      setDateFormat(preferences.dateFormat || 'DD/MM/YYYY (15/08/2025)');
      setFontSize(preferences.fontSize || '100%');
      setHighContrast(preferences.highContrast || false);
    }
  }, [preferences]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updatePreferencesMutation.mutate({ theme: newTheme });
  };

  const handleLanguageChange = (newLang: 'vi' | 'en') => {
    setSelectedLanguage(newLang);
    updatePreferencesMutation.mutate({ language: newLang });
    // Switch cookie locale or redirect if next-intl prefix exists
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.refresh();
  };

  const handleFontSizeChange = (size: '100%' | '115%' | '125%') => {
    setFontSize(size);
    updatePreferencesMutation.mutate({ fontSize: size });
  };

  const handleHighContrastToggle = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    updatePreferencesMutation.mutate({ highContrast: nextVal });
  };

  if (isLoading || !mounted) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  const currentTheme = theme || 'system';

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Theme Selector Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('themeHeaderTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('themeHeaderSubtitle')}
          </p>
        </div>

        {/* 3 Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme */}
          <div
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all ${
              currentTheme === 'light'
                ? 'bg-secondary/5 dark:bg-secondary/10 border-secondary shadow-sm ring-2 ring-secondary/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-full h-24 rounded-lg bg-white p-2.5 flex flex-col justify-between shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span className="w-12 h-2 rounded bg-slate-200" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-2 rounded bg-slate-100" />
                <div className="w-2/3 h-2 rounded bg-slate-200" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('themeLight')}
              </span>
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTheme === 'light' ? 'text-secondary' : 'text-slate-400'
                }`}
              >
                {currentTheme === 'light'
                  ? 'radio_button_checked'
                  : 'radio_button_unchecked'}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('themeLightDesc')}
            </span>
          </div>

          {/* Dark Theme */}
          <div
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all ${
              currentTheme === 'dark'
                ? 'bg-secondary/5 dark:bg-secondary/10 border-secondary shadow-sm ring-2 ring-secondary/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-full h-24 rounded-lg bg-slate-950 p-2.5 flex flex-col justify-between shadow-xs border border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span className="w-12 h-2 rounded bg-slate-800" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-2 rounded bg-slate-800" />
                <div className="w-2/3 h-2 rounded bg-slate-900" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('themeDark')}
              </span>
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTheme === 'dark' ? 'text-secondary' : 'text-slate-400'
                }`}
              >
                {currentTheme === 'dark'
                  ? 'radio_button_checked'
                  : 'radio_button_unchecked'}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('themeDarkDesc')}
            </span>
          </div>

          {/* System Theme */}
          <div
            onClick={() => handleThemeChange('system')}
            className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all ${
              currentTheme === 'system'
                ? 'bg-secondary/5 dark:bg-secondary/10 border-secondary shadow-sm ring-2 ring-secondary/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-full h-24 rounded-lg bg-gradient-to-r from-white to-slate-950 p-2.5 flex flex-col justify-between shadow-xs border border-slate-300 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span className="w-12 h-2 rounded bg-slate-400/30" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-2 rounded bg-slate-400/40" />
                <div className="w-2/3 h-2 rounded bg-slate-400/20" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('themeSystem')}
              </span>
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTheme === 'system' ? 'text-secondary' : 'text-slate-400'
                }`}
              >
                {currentTheme === 'system'
                  ? 'radio_button_checked'
                  : 'radio_button_unchecked'}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('themeSystemDesc')}
            </span>
          </div>
        </div>

        {/* 2. Language & Regional Formatting */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t('regionHeaderTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('lblLanguage')}
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) =>
                  handleLanguageChange(e.target.value as 'vi' | 'en')
                }
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="vi">Tiếng Việt (Mặc định)</option>
                <option value="en">English (US)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('lblTimezone')}
              </label>
              <select
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  updatePreferencesMutation.mutate({ timezone: e.target.value });
                }}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="(GMT+07:00) Bangkok, Hanoi, Jakarta">
                  (GMT+07:00) Bangkok, Hanoi, Jakarta
                </option>
                <option value="(GMT+08:00) Singapore, Beijing">
                  (GMT+08:00) Singapore, Beijing
                </option>
                <option value="(GMT+00:00) UTC Universal">
                  (GMT+00:00) UTC Universal
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('lblDateFormat')}
              </label>
              <select
                value={dateFormat}
                onChange={(e) => {
                  setDateFormat(e.target.value);
                  updatePreferencesMutation.mutate({ dateFormat: e.target.value });
                }}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="DD/MM/YYYY (15/08/2025)">
                  DD/MM/YYYY (15/08/2025)
                </option>
                <option value="YYYY-MM-DD (2025-08-15)">
                  YYYY-MM-DD (2025-08-15)
                </option>
                <option value="MM/DD/YYYY (08/15/2025)">
                  MM/DD/YYYY (08/15/2025)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Accessibility */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t('accessibilityTitle')}
          </h3>

          {/* Font Zoom Scale */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('fontSizeTitle')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('fontSizeDesc')}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl">
              {(['100%', '115%', '125%'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontSize === size
                      ? 'bg-white dark:bg-slate-700 text-secondary shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('highContrastTitle')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('highContrastDesc')}
              </span>
            </div>
            <button
              onClick={handleHighContrastToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                highContrast ? 'bg-secondary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              type="button"
              role="switch"
              aria-checked={highContrast}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
