'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type CompetencyMode = 'analytics' | 'focus';

export function useCompetencyMode() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<CompetencyMode>('analytics');

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'focus') {
      setMode('focus');
      return;
    }
    if (urlMode === 'analytics') {
      setMode('analytics');
      return;
    }

    try {
      const stored = localStorage.getItem('ilms_competency_mode') as CompetencyMode | null;
      if (stored === 'focus' || stored === 'analytics') {
        setMode(stored);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  const switchMode = useCallback(
    (newMode: CompetencyMode) => {
      setMode(newMode);
      try {
        localStorage.setItem('ilms_competency_mode', newMode);
      } catch {
        // ignore
      }

      // Update URL query param cleanly without full reload
      const params = new URLSearchParams(window.location.search);
      if (newMode === 'focus') {
        params.set('mode', 'focus');
      } else {
        params.delete('mode');
      }
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      router.replace(newUrl, { scroll: false });
    },
    [router]
  );

  const toggleMode = useCallback(() => {
    switchMode(mode === 'focus' ? 'analytics' : 'focus');
  }, [mode, switchMode]);

  return {
    mode,
    isFocus: mode === 'focus',
    switchMode,
    toggleMode,
  };
}
