'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { usePreferences, usePatchPreferences } from '../../hooks/useSettings';
import { setUserLocale } from '@/lib/locale';
import { FONT_VARIABLE_MAP, FontFamilyName } from '@/hooks/useDesignSystem';
import { CustomSelect } from '@/components/shared';

interface AppearanceTabProps {
  onSuccessToast: () => void;
}

export function AppearanceTab({ onSuccessToast }: AppearanceTabProps) {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { data: preferences, isLoading } = usePreferences();
  const patchPreferencesMutation = usePatchPreferences(onSuccessToast);

  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'vi' | 'en'>('vi');
  const [timezone, setTimezone] = useState('(GMT+07:00) Bangkok, Hanoi, Jakarta');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY (15/08/2025)');
  const [fontSize, setFontSize] = useState<'100%' | '115%' | '125%'>('100%');
  const [highContrast, setHighContrast] = useState(false);
  const [selectedFont, setSelectedFont] = useState<FontFamilyName>('Plus Jakarta Sans');

  useEffect(() => {
    setMounted(true);
    if (preferences) {
      setSelectedLanguage(preferences.language || 'vi');
      setTimezone(preferences.timezone || '(GMT+07:00) Bangkok, Hanoi, Jakarta');
      setDateFormat(preferences.dateFormat || 'DD/MM/YYYY (15/08/2025)');
      setFontSize((preferences.fontSize as '100%' | '115%' | '125%') || '100%');
      setHighContrast(preferences.highContrast || false);
      if (preferences.fontFamily && preferences.fontFamily in FONT_VARIABLE_MAP) {
        setSelectedFont(preferences.fontFamily as FontFamilyName);
      }
    }
  }, [preferences]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    patchPreferencesMutation.mutate({ themeMode: newTheme, theme: newTheme });
  };

  const handleFontChange = (font: FontFamilyName) => {
    setSelectedFont(font);
    if (FONT_VARIABLE_MAP[font]) {
      document.documentElement.style.setProperty('--font-sans', FONT_VARIABLE_MAP[font]);
    }
    patchPreferencesMutation.mutate({ fontFamily: font });
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

  const handleFontSizeChange = (size: '100%' | '115%' | '125%') => {
    setFontSize(size);
    patchPreferencesMutation.mutate({ fontSize: size });
  };

  const handleHighContrastToggle = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    patchPreferencesMutation.mutate({ highContrast: nextVal });
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

        {/* 2. Language & Regional Formatting */}
        <div className="pt-4 border-t border-slate-200 dark:border-transparent flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
            {t('regionHeaderTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomSelect
              label={t('lblLanguage')}
              value={selectedLanguage}
              onChange={(val) => handleLanguageChange(val as 'vi' | 'en')}
              options={[
                { value: 'vi', label: 'Tiếng Việt', sublabel: 'Mặc định hệ thống', icon: 'translate' },
                { value: 'en', label: 'English (US)', sublabel: 'International', icon: 'language' },
              ]}
            />

            <CustomSelect
              label={t('lblTimezone')}
              value={timezone}
              onChange={(val) => {
                setTimezone(val);
                patchPreferencesMutation.mutate({ timezone: val });
              }}
              options={[
                { value: '(GMT+07:00) Bangkok, Hanoi, Jakarta', label: '(GMT+07:00) Bangkok, Hanoi, Jakarta', icon: 'schedule' },
                { value: '(GMT+08:00) Singapore, Beijing', label: '(GMT+08:00) Singapore, Beijing', icon: 'schedule' },
                { value: '(GMT+00:00) UTC Universal', label: '(GMT+00:00) UTC Universal', icon: 'public' },
              ]}
            />

            <CustomSelect
              label={t('lblDateFormat')}
              value={dateFormat}
              onChange={(val) => {
                setDateFormat(val);
                patchPreferencesMutation.mutate({ dateFormat: val });
              }}
              options={[
                { value: 'DD/MM/YYYY (15/08/2025)', label: 'DD/MM/YYYY', sublabel: '15/08/2025', icon: 'calendar_today' },
                { value: 'YYYY-MM-DD (2025-08-15)', label: 'YYYY-MM-DD', sublabel: '2025-08-15', icon: 'calendar_today' },
                { value: 'MM/DD/YYYY (08/15/2025)', label: 'MM/DD/YYYY', sublabel: '08/15/2025', icon: 'calendar_today' },
              ]}
            />
          </div>
        </div>

        {/* 3. Accessibility */}
        <div className="pt-4 border-t border-slate-200 dark:border-transparent flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
            {t('accessibilityTitle')}
          </h3>

          {/* Font Family Selection */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
                Phông chữ hiển thị (Typography)
              </span>
              <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
                Chọn kiểu chữ chính cho toàn bộ hệ thống
              </span>
            </div>
            <div className="w-full sm:w-64">
              <CustomSelect
                value={selectedFont}
                onChange={(val) => handleFontChange(val as FontFamilyName)}
                options={[
                  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', sublabel: 'Hiện đại & Thanh thoát' },
                  { value: 'Outfit', label: 'Outfit', sublabel: 'Gemini MD3' },
                  { value: 'Inter', label: 'Inter', sublabel: 'Tiêu chuẩn UI' },
                  { value: 'Be Vietnam Pro', label: 'Be Vietnam Pro', sublabel: 'Tối ưu Tiếng Việt chuẩn' },
                  { value: 'Montserrat', label: 'Montserrat', sublabel: 'Hình học sắc nét' },
                ]}
              />
            </div>
          </div>

          {/* Font Zoom Scale */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
                {t('fontSizeTitle')}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
                {t('fontSizeDesc')}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-[#1E1F20] p-1 rounded-xl">
              {(['100%', '115%', '125%'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontSize === size
                      ? 'bg-white dark:bg-[#282A2C] text-secondary shadow-xs'
                      : 'text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200/60 dark:border-transparent flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3]">
                {t('highContrastTitle')}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
                {t('highContrastDesc')}
              </span>
            </div>
            <button
              onClick={handleHighContrastToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                highContrast ? 'bg-secondary' : 'bg-slate-300 dark:bg-[#282A2C]'
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
