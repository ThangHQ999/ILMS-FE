'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type KnowledgeGraphMode = 'analytics' | 'focus';

export function useGraphMode() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<KnowledgeGraphMode>('analytics');

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
      const stored = localStorage.getItem('ilms_graph_mode') as KnowledgeGraphMode | null;
      if (stored === 'focus' || stored === 'analytics') {
        setMode(stored);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  const switchMode = useCallback(
    (newMode: KnowledgeGraphMode) => {
      setMode(newMode);
      try {
        localStorage.setItem('ilms_graph_mode', newMode);
      } catch {
        // ignore
      }

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode === 'focus') {
        switchMode('analytics');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, switchMode]);

  return {
    mode,
    isFocus: mode === 'focus',
    switchMode,
    toggleMode,
  };
}
