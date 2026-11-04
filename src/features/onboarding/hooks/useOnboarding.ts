'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import {
  LayoutMode,
  AiPersona,
  ThemeMode,
  FontFamilyName,
  ColorOption,
} from '../types';
import {
  ONBOARDING_STORAGE_KEYS,
  PRIMARY_PALETTE,
  SECONDARY_PALETTE,
  TERTIARY_PALETTE,
  NEUTRAL_PALETTE,
} from '../constants';
import { FONT_VARIABLE_MAP } from '@/hooks/useDesignSystem';

export function useOnboarding() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const t = useTranslations('onboarding.footer');

  const [layout, setLayout] = useState<LayoutMode>('focus');
  const [persona, setPersona] = useState<AiPersona>('socratic');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  const [primaryColor, setPrimaryColor] = useState<ColorOption>(PRIMARY_PALETTE[0]);
  const [secondaryColor, setSecondaryColor] = useState<ColorOption>(SECONDARY_PALETTE[0]);
  const [tertiaryColor, setTertiaryColor] = useState<ColorOption>(TERTIARY_PALETTE[0]);
  const [neutralColor, setNeutralColor] = useState<ColorOption>(NEUTRAL_PALETTE[0]);
  const [fontFamily, setFontFamilyState] = useState<FontFamilyName>('Plus Jakarta Sans');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Apply theme to DOM
  const handleSelectTheme = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    setTheme(mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [setTheme]);

  // Apply colors to CSS Variables
  const applyTokensToCss = useCallback((p: ColorOption, s: ColorOption, t: ColorOption, n: ColorOption) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', p.rgb);
    root.style.setProperty('--color-secondary', s.rgb);
    root.style.setProperty('--color-tertiary', t.rgb);
    root.style.setProperty('--color-neutral', n.rgb);

    try {
      localStorage.setItem(
        ONBOARDING_STORAGE_KEYS.COLOR_TOKENS,
        JSON.stringify({
          primary: p.rgb,
          secondary: s.rgb,
          tertiary: t.rgb,
          neutral: n.rgb,
        })
      );
      window.dispatchEvent(new Event('ilms_design_system_change'));
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  // Apply Font to CSS Variables
  const handleSelectFont = useCallback((font: FontFamilyName) => {
    setFontFamilyState(font);
    const fontVal = FONT_VARIABLE_MAP[font] || FONT_VARIABLE_MAP['Plus Jakarta Sans'];
    document.documentElement.style.setProperty('--font-sans', fontVal);

    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.FONT_FAMILY, font);
      window.dispatchEvent(new Event('ilms_design_system_change'));
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  // Update specific palette
  const handleSelectColor = (type: 'primary' | 'secondary' | 'tertiary' | 'neutral', option: ColorOption) => {
    let p = primaryColor;
    let s = secondaryColor;
    let t = tertiaryColor;
    let n = neutralColor;

    if (type === 'primary') {
      setPrimaryColor(option);
      p = option;
    } else if (type === 'secondary') {
      setSecondaryColor(option);
      s = option;
    } else if (type === 'tertiary') {
      setTertiaryColor(option);
      t = option;
    } else if (type === 'neutral') {
      setNeutralColor(option);
      n = option;
    }

    applyTokensToCss(p, s, t, n);
  };

  // Initial sync from DOM / localStorage
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setThemeModeState(isDark ? 'dark' : 'light');

    // Read stored colors if any
    let initP = PRIMARY_PALETTE[0];
    let initS = SECONDARY_PALETTE[0];
    let initT = TERTIARY_PALETTE[0];
    let initN = NEUTRAL_PALETTE[0];

    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEYS.COLOR_TOKENS);
      if (stored) {
        const parsed = JSON.parse(stored);
        const foundP = PRIMARY_PALETTE.find((c) => c.rgb === parsed.primary);
        const foundS = SECONDARY_PALETTE.find((c) => c.rgb === parsed.secondary);
        const foundT = TERTIARY_PALETTE.find((c) => c.rgb === parsed.tertiary);
        const foundN = NEUTRAL_PALETTE.find((c) => c.rgb === parsed.neutral);
        if (foundP) { initP = foundP; setPrimaryColor(foundP); }
        if (foundS) { initS = foundS; setSecondaryColor(foundS); }
        if (foundT) { initT = foundT; setTertiaryColor(foundT); }
        if (foundN) { initN = foundN; setNeutralColor(foundN); }
      }

      const storedFont = localStorage.getItem(ONBOARDING_STORAGE_KEYS.FONT_FAMILY) as FontFamilyName | null;
      if (storedFont && FONT_VARIABLE_MAP[storedFont]) {
        setFontFamilyState(storedFont);
        document.documentElement.style.setProperty('--font-sans', FONT_VARIABLE_MAP[storedFont]);
      }
    } catch {
      // Fallback to defaults
    }

    applyTokensToCss(initP, initS, initT, initN);
  }, [applyTokensToCss]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const submitPreferences = (isDefault: boolean) => {
    setIsSubmitting(true);

    const finalLayout = isDefault ? 'focus' : layout;
    const finalPersona = isDefault ? 'socratic' : persona;
    const finalTheme = isDefault ? 'light' : themeMode;
    const finalP = isDefault ? PRIMARY_PALETTE[0] : primaryColor;
    const finalS = isDefault ? SECONDARY_PALETTE[0] : secondaryColor;
    const finalT = isDefault ? TERTIARY_PALETTE[0] : tertiaryColor;
    const finalN = isDefault ? NEUTRAL_PALETTE[0] : neutralColor;
    const finalFont = isDefault ? 'Plus Jakarta Sans' : fontFamily;

    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.LAYOUT_MODE, finalLayout);
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.AI_PERSONA, finalPersona);
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.THEME_MODE, finalTheme);
      localStorage.setItem(
        ONBOARDING_STORAGE_KEYS.COLOR_TOKENS,
        JSON.stringify({
          primary: finalP.rgb,
          secondary: finalS.rgb,
          tertiary: finalT.rgb,
          neutral: finalN.rgb,
        })
      );
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.FONT_FAMILY, finalFont);
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.COMPLETED, 'true');
    } catch {
      // Ignore if localStorage unavailable
    }

    if (isDefault) {
      handleSelectTheme('light');
      applyTokensToCss(PRIMARY_PALETTE[0], SECONDARY_PALETTE[0], TERTIARY_PALETTE[0], NEUTRAL_PALETTE[0]);
      handleSelectFont('Plus Jakarta Sans');
    }

    const message = isDefault
      ? t('toastDefault')
      : t('toastSuccess');

    showToast(message);

    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 1500);
  };

  return {
    layout,
    setLayout,
    persona,
    setPersona,
    themeMode,
    selectTheme: handleSelectTheme,
    primaryColor,
    secondaryColor,
    tertiaryColor,
    neutralColor,
    selectColor: handleSelectColor,
    fontFamily,
    selectFont: handleSelectFont,
    toastMessage,
    isSubmitting,
    submitPreferences,
  };
}
