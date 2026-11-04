'use client';

import { useState, useEffect, useCallback } from 'react';
import { DASHBOARD_STORAGE_KEY } from '../constants';
import { DashboardMode } from '../types';

export function useDashboardMode() {
  const [mode, setMode] = useState<DashboardMode>('analytics');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (stored === 'focus' || stored === 'analytics') {
        setMode(stored);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const switchMode = useCallback((newMode: DashboardMode) => {
    setMode(newMode);
    try {
      localStorage.setItem(DASHBOARD_STORAGE_KEY, newMode);
    } catch {
      // Ignore
    }
  }, []);

  const toggleMode = useCallback(() => {
    switchMode(mode === 'analytics' ? 'focus' : 'analytics');
  }, [mode, switchMode]);

  return {
    mode,
    isLoaded,
    switchMode,
    toggleMode,
    isFocus: mode === 'focus',
    isAnalytics: mode === 'analytics',
  };
}
