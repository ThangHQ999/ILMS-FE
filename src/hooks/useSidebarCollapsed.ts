'use client';

import { useSyncExternalStore, useCallback, useEffect } from 'react';

// Auto-collapse sidebar on mobile & tablet viewports (< 1024px) to prevent covering mobile UI
let sidebarCollapsed = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return sidebarCollapsed;
}

function getServerSnapshot() {
  return false;
}

/**
 * Shared in-memory sidebar collapse state across client-side route transitions.
 * Auto-collapses on mobile/tablet viewports (< 1024px) to prevent covering main UI.
 */
export function useSidebarCollapsed() {
  const isSidebarCollapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setIsSidebarCollapsed = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(sidebarCollapsed) : value;
      if (next !== sidebarCollapsed) {
        sidebarCollapsed = next;
        listeners.forEach((listener) => listener());
      }
    },
    []
  );

  // Auto-collapse when initialized or resized below 1024px (mobile / tablet breakpoint)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && !sidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };

    // Initial check on mount
    if (window.innerWidth < 1024 && !sidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarCollapsed]);

  return [isSidebarCollapsed, setIsSidebarCollapsed] as const;
}
