'use client';

import { useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export type FontFamilyName =
  | 'Plus Jakarta Sans'
  | 'Inter'
  | 'Montserrat'
  | 'Be Vietnam Pro';

export interface ColorTokens {
  primary: string;
  secondary: string;
  tertiary: string;
  neutral: string;
}

export const STORAGE_KEYS = {
  THEME_MODE: 'ilms_theme_mode',
  COLOR_TOKENS: 'ilms_color_tokens',
  FONT_FAMILY: 'ilms_font_family',
} as const;

export const DEFAULT_COLOR_TOKENS_LIGHT: ColorTokens = {
  primary: '10 25 47',       // #0A192F Midnight Navy
  secondary: '0 123 255',    // #007BFF Tech Blue
  tertiary: '108 92 231',    // #6C5CE7 Electric Indigo
  neutral: '240 244 248',    // #F0F4F8 Soft Surface
};

export const DEFAULT_COLOR_TOKENS_DARK: ColorTokens = {
  primary: '56 189 248',    // #38BDF8 Tech Cyan
  secondary: '37 99 235',   // #2563EB Deep Blue
  tertiary: '52 211 153',   // #34D399 Vibrant Green
  neutral: '148 163 184',  // #94A3B8 Slate 400
};

export const FONT_VARIABLE_MAP: Record<FontFamilyName, string> = {
  'Plus Jakarta Sans': "var(--font-plus-jakarta-sans, 'Plus Jakarta Sans'), sans-serif",
  'Inter': "var(--font-inter, 'Inter'), sans-serif",
  'Montserrat': "var(--font-montserrat, 'Montserrat'), sans-serif",
  'Be Vietnam Pro': "var(--font-be-vietnam-pro, 'Be Vietnam Pro'), sans-serif",
};

export function useDesignSystem() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [colorTokens, setColorTokensState] = useState<ColorTokens>(DEFAULT_COLOR_TOKENS_LIGHT);
  const [fontFamily, setFontFamilyState] = useState<FontFamilyName>('Plus Jakarta Sans');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Apply theme class to <html>
  const applyThemeMode = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Apply color tokens to CSS variables
  const applyColorTokens = useCallback((tokens: ColorTokens) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', tokens.primary);
    root.style.setProperty('--color-secondary', tokens.secondary);
    root.style.setProperty('--color-tertiary', tokens.tertiary);
    root.style.setProperty('--color-neutral', tokens.neutral);
  }, []);

  // Apply font family to --font-sans
  const applyFontFamily = useCallback((font: FontFamilyName) => {
    const fontValue = FONT_VARIABLE_MAP[font] || FONT_VARIABLE_MAP['Plus Jakarta Sans'];
    document.documentElement.style.setProperty('--font-sans', fontValue);
  }, []);

  // Initial load and hydration avoidance
  useEffect(() => {
    setIsMounted(true);

    // Read stored theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME_MODE) as ThemeMode | null;
    const initialTheme: ThemeMode = savedTheme || 'light';
    setThemeModeState(initialTheme);
    applyThemeMode(initialTheme);

    // Read stored colors
    const savedColors = localStorage.getItem(STORAGE_KEYS.COLOR_TOKENS);
    let initialColors = initialTheme === 'dark' ? DEFAULT_COLOR_TOKENS_DARK : DEFAULT_COLOR_TOKENS_LIGHT;
    if (savedColors) {
      try {
        initialColors = { ...initialColors, ...JSON.parse(savedColors) };
      } catch {
        // Fallback to default on parse error
      }
    }
    setColorTokensState(initialColors);
    applyColorTokens(initialColors);

    // Read stored font
    const savedFont = localStorage.getItem(STORAGE_KEYS.FONT_FAMILY) as FontFamilyName | null;
    const initialFont: FontFamilyName = savedFont || 'Plus Jakarta Sans';
    setFontFamilyState(initialFont);
    applyFontFamily(initialFont);

    // Listen to system theme changes if in 'system' mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE) as ThemeMode | null;
      if (currentMode === 'system') {
        applyThemeMode('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [applyThemeMode, applyColorTokens, applyFontFamily]);

  // Setters with persistence
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    applyThemeMode(mode);
  };

  const setColorToken = (key: keyof ColorTokens, value: string) => {
    setColorTokensState((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEYS.COLOR_TOKENS, JSON.stringify(next));
      applyColorTokens(next);
      return next;
    });
  };

  const setFontFamily = (font: FontFamilyName) => {
    setFontFamilyState(font);
    localStorage.setItem(STORAGE_KEYS.FONT_FAMILY, font);
    applyFontFamily(font);
  };

  const resetToDefaults = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const defaultTokens = isDark ? DEFAULT_COLOR_TOKENS_DARK : DEFAULT_COLOR_TOKENS_LIGHT;
    setColorTokensState(defaultTokens);
    localStorage.setItem(STORAGE_KEYS.COLOR_TOKENS, JSON.stringify(defaultTokens));
    applyColorTokens(defaultTokens);

    setFontFamily('Plus Jakarta Sans');
  };

  return {
    isMounted,
    themeMode,
    colorTokens,
    fontFamily,
    setThemeMode,
    setColorToken,
    setFontFamily,
    resetToDefaults,
  };
}
