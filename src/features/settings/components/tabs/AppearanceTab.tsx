'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { usePreferences, usePatchPreferences } from '../../hooks/useSettings';
import { setUserLocale } from '@/lib/locale';
import { CustomSelect } from '@/components/shared';

interface AppearanceTabProps {
  onSuccessToast: () => void;
}

export function AppearanceTab({ onSuccessToast }: AppearanceTabProps) {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  const { data: preferences, isLoading } = usePreferences();
  const patchPreferencesMutation = usePatchPreferences(onSuccessToast);

  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    setMounted(true);
    if (preferences) {
      setSelectedLanguage(preferences.language || 'vi');
    }
  }, [preferences]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    patchPreferencesMutation.mutate({ themeMode: newTheme, theme: newTheme });
  };

  const handleLanguageChange = async (newLang: 'vi' | 'en') => {
    setSelectedLanguage(newLang);
    try {
      localStorage.setItem('ilms_language', newLang);
    } catch {
      // ignore
    }
    try {
      await patchPreferencesMutation.mutateAsync({ language: newLang });
    } catch {
      // Continue switching locale even if backend is unreachable
    }
    setUserLocale(newLang, '/settings?tab=appearance');
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
      <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-none flex flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#E3E3E3]">
            {t('themeHeaderTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#C4C7C5]">
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
                : 'bg-slate-50 dark:bg-[#1E1F20] border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-slate-700'
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
              <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
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
            <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
              {t('themeLightDesc')}
            </span>
          </div>

          {/* Dark Theme */}
          <div
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all ${
              currentTheme === 'dark'
                ? 'bg-secondary/5 dark:bg-secondary/10 border-secondary shadow-sm ring-2 ring-secondary/20'
                : 'bg-slate-50 dark:bg-[#1E1F20] border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-slate-700'
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
              <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
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
            <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
              {t('themeDarkDesc')}
            </span>
          </div>

          {/* System Theme */}
          <div
            onClick={() => handleThemeChange('system')}
            className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all ${
              currentTheme === 'system'
                ? 'bg-secondary/5 dark:bg-secondary/10 border-secondary shadow-sm ring-2 ring-secondary/20'
                : 'bg-slate-50 dark:bg-[#1E1F20] border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-full h-24 rounded-lg bg-gradient-to-r from-white to-slate-950 p-2.5 flex flex-col justify-between shadow-xs border border-slate-300 dark:border-transparent">
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
              <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
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
            <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
              {t('themeSystemDesc')}
            </span>
          </div>
        </div>

        {/* 2. Language */}
        <div className="pt-4 border-t border-slate-200 dark:border-transparent flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
            {t('lblLanguage')}
          </h3>
          <div className="grid grid-cols-1 max-w-sm gap-4">
            <CustomSelect
              label={t('lblLanguage')}
              value={selectedLanguage}
              onChange={(val) => handleLanguageChange(val as 'vi' | 'en')}
              options={[
                { value: 'vi', label: 'Tiếng Việt', sublabel: 'Mặc định hệ thống', icon: 'translate' },
                { value: 'en', label: 'English (US)', sublabel: 'International', icon: 'language' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
