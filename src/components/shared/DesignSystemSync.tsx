'use client';

import { useEffect } from 'react';
import { FONT_VARIABLE_MAP, FontFamilyName, ColorTokens } from '@/hooks/useDesignSystem';
import { getUserPreferences } from '@/features/settings/services/settings.service';

export function DesignSystemSync() {
  useEffect(() => {
    function applySavedSystem() {
      try {
        const root = document.documentElement;

        // Apply Color Tokens from localStorage
        const storedColors = localStorage.getItem('ilms_color_tokens');
        if (storedColors) {
          const parsed = JSON.parse(storedColors) as Partial<ColorTokens>;
          if (parsed.primary) root.style.setProperty('--color-primary', parsed.primary);
          if (parsed.secondary) root.style.setProperty('--color-secondary', parsed.secondary);
          if (parsed.tertiary) root.style.setProperty('--color-tertiary', parsed.tertiary);
          if (parsed.neutral) root.style.setProperty('--color-neutral', parsed.neutral);
        }

        // Apply Font Family from localStorage
        const storedFont = localStorage.getItem('ilms_font_family') as FontFamilyName | null;
        if (storedFont && FONT_VARIABLE_MAP[storedFont]) {
          root.style.setProperty('--font-sans', FONT_VARIABLE_MAP[storedFont]);
        }
      } catch {
        // ignore
      }
    }

    // 1. Instant local render (prevents flash of unstyled content)
    applySavedSystem();

    // 2. Fetch full user preferences from API: GET /api/v1/user/preferences
    getUserPreferences()
      .then((prefs) => {
        if (!prefs) return;
        const root = document.documentElement;

        // Sync colors
        if (prefs.primaryColor) root.style.setProperty('--color-primary', prefs.primaryColor);
        if (prefs.secondaryColor) root.style.setProperty('--color-secondary', prefs.secondaryColor);
        if (prefs.tertiaryColor) root.style.setProperty('--color-tertiary', prefs.tertiaryColor);
        if (prefs.neutralColor) root.style.setProperty('--color-neutral', prefs.neutralColor);

        // Sync font
        if (prefs.fontFamily && FONT_VARIABLE_MAP[prefs.fontFamily as FontFamilyName]) {
          root.style.setProperty('--font-sans', FONT_VARIABLE_MAP[prefs.fontFamily as FontFamilyName]);
          try {
            localStorage.setItem('ilms_font_family', prefs.fontFamily);
          } catch {}
        }

        // Sync dashboard mode
        if (prefs.defaultDashboardMode) {
          try {
            localStorage.setItem('ilms_dashboard_mode', prefs.defaultDashboardMode);
          } catch {}
        }

        // Sync sidebar
        if (typeof prefs.sidebarCollapsed === 'boolean') {
          try {
            localStorage.setItem('ilms_analytics_sidebar_collapsed', String(prefs.sidebarCollapsed));
          } catch {}
        }
      })
      .catch(() => {
        // Fallback silently if offline or token not set
      });

    // Listen to changes from other tabs or same tab events
    window.addEventListener('storage', applySavedSystem);
    window.addEventListener('ilms_design_system_change', applySavedSystem);

    return () => {
      window.removeEventListener('storage', applySavedSystem);
      window.removeEventListener('ilms_design_system_change', applySavedSystem);
    };
  }, []);

  return null;
}
