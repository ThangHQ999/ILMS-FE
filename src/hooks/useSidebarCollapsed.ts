'use client';

import { useSyncExternalStore, useCallback } from 'react';

// Desktop sidebar collapsed state (persisted in-memory across client-side transitions)
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

// Mobile drawer open/close state (triggered by Hamburger Menu 3-bars button)
let mobileSidebarOpen = false;
const mobileListeners = new Set<() => void>();

function subscribeMobile(listener: () => void) {
  mobileListeners.add(listener);
  return () => {
    mobileListeners.delete(listener);
  };
}

function getMobileSnapshot() {
  return mobileSidebarOpen;
}

function getServerMobileSnapshot() {
  return false;
}

/**
 * Hook to control the mobile drawer sidebar via the 3-bars hamburger menu.
 */
export function useMobileSidebar() {
  const isMobileOpen = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerMobileSnapshot
  );

  const setIsMobileOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(mobileSidebarOpen) : value;
      if (next !== mobileSidebarOpen) {
        mobileSidebarOpen = next;
        mobileListeners.forEach((listener) => listener());
      }
    },
    []
  );

  const toggleMobileOpen = useCallback(() => {
    mobileSidebarOpen = !mobileSidebarOpen;
    mobileListeners.forEach((listener) => listener());
  }, []);

  return { isMobileOpen, setIsMobileOpen, toggleMobileOpen };
}

/**
 * Shared in-memory sidebar collapse state for Desktop viewports.
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
