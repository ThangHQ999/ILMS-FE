'use client';

import type { ActiveRole } from '@/constants/roles';

export const ROLE_STORAGE_KEY = 'ilms_active_role_override';
export const ROLE_CHANGE_EVENT = 'ilms_role_changed';

type StoreListener = () => void;
const listeners = new Set<StoreListener>();

let memoryOverride: ActiveRole | null = null;
let isStoreInitialized = false;

function initStore() {
  if (typeof window === 'undefined' || isStoreInitialized) return;

  try {
    const stored = localStorage.getItem(ROLE_STORAGE_KEY) as ActiveRole | null;
    if (stored === 'TEACHER' || stored === 'STUDENT') {
      memoryOverride = stored;
    }
  } catch {
    // ignore local storage errors
  }

  // Cross-tab synchronization via storage event
  window.addEventListener('storage', (e) => {
    if (e.key === ROLE_STORAGE_KEY) {
      const val = e.newValue as ActiveRole | null;
      memoryOverride = val === 'TEACHER' || val === 'STUDENT' ? val : null;
      notifyAll();
    }
  });

  // In-tab synchronization via CustomEvent
  window.addEventListener(ROLE_CHANGE_EVENT, (e: Event) => {
    const custom = e as CustomEvent<ActiveRole | null>;
    if (memoryOverride !== custom.detail) {
      memoryOverride = custom.detail;
      notifyAll();
    }
  });

  isStoreInitialized = true;
}

function notifyAll() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

export const globalRoleStore = {
  getSnapshot(): ActiveRole | null {
    if (typeof window === 'undefined') return null;
    if (!isStoreInitialized) initStore();
    return memoryOverride;
  },
  getServerSnapshot(): ActiveRole | null {
    return null;
  },
  subscribe(listener: StoreListener) {
    if (typeof window === 'undefined' && !isStoreInitialized) initStore();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  set(role: ActiveRole) {
    if (typeof window !== 'undefined' && !isStoreInitialized) initStore();
    memoryOverride = role;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ROLE_STORAGE_KEY, role);
        window.dispatchEvent(new CustomEvent(ROLE_CHANGE_EVENT, { detail: role }));
      } catch {
        // ignore
      }
    }
    notifyAll();
  },
  reset() {
    if (typeof window !== 'undefined' && !isStoreInitialized) initStore();
    memoryOverride = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ROLE_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent(ROLE_CHANGE_EVENT, { detail: null }));
      } catch {
        // ignore
      }
    }
    notifyAll();
  },
};
