'use client';

import { useSyncExternalStore, useCallback } from 'react';

let sidebarCollapsed = false;
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
 * Avoids post-mount localStorage hydration flickers/layout jumps on navigation.
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

  return [isSidebarCollapsed, setIsSidebarCollapsed] as const;
}
