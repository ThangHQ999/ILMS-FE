'use client';

import { useEffect } from 'react';
import { FONT_VARIABLE_MAP, FontFamilyName, ColorTokens } from '@/hooks/useDesignSystem';

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
      } catch (err) {
        console.error('Failed to sync design system tokens:', err);
      }
    }

    // Apply on initial mount
    applySavedSystem();

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
