'use client';

import { useMemo, useCallback, useSyncExternalStore } from 'react';
import { useCurrentUser } from '@/features/auth';
import { ActiveRole, ROLES } from '@/constants/roles';

const STORAGE_KEY = 'ilms_active_role_override';
const ROLE_CHANGE_EVENT = 'ilms_role_changed';

// ============================================================================
// GLOBAL REACTIVE ROLE STORE
// Provides synchronous, app-wide reactive state updates across all components
// without requiring page reload (F5) or polling.
// ============================================================================

type StoreListener = () => void;
const listeners = new Set<StoreListener>();

let memoryOverride: ActiveRole | null = null;
let isStoreInitialized = false;

function initStore() {
  if (typeof window === 'undefined' || isStoreInitialized) return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ActiveRole | null;
    if (stored === 'TEACHER' || stored === 'STUDENT') {
      memoryOverride = stored;
    }
  } catch {
    // ignore local storage errors
  }

  // Cross-tab synchronization via storage event
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
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
    if (typeof window !== 'undefined' && !isStoreInitialized) initStore();
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
        localStorage.setItem(STORAGE_KEY, role);
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
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent(ROLE_CHANGE_EVENT, { detail: null }));
      } catch {
        // ignore
      }
    }
    notifyAll();
  },
};

export interface UserRoleResult {
  user: ReturnType<typeof useCurrentUser>['data'];
  activeRole: ActiveRole;
  detectedRole: ActiveRole;
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isOverridden: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  roleBadge: string;
  switchRole: (role: ActiveRole) => void;
  resetRole: () => void;
}

export function useUserRole(): UserRoleResult {
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useCurrentUser();

  // 1. Thuật toán tự động nhận diện vai trò dựa trên Backend data từ currentUser
  const detectedRole = useMemo<ActiveRole>(() => {
    if (!user) return 'STUDENT';

    // Ưu tiên 1: System Admin có quyền của Giảng viên cao cấp
    const roleUpper = String(user.roleName || '').toUpperCase();
    if (roleUpper === ROLES.ADMIN || roleUpper.includes('ADMIN')) {
      return 'TEACHER';
    }

    // Giảng viên từ roleName hoặc roles array
    if (roleUpper.includes('TEACHER') || roleUpper.includes('FACULTY') || roleUpper.includes('INSTRUCTOR')) {
      return 'TEACHER';
    }

    const anyUser = user as { roles?: string[] };
    if (Array.isArray(anyUser.roles) && anyUser.roles.some((r) => {
      const u = String(r).toUpperCase();
      return u.includes('TEACHER') || u.includes('FACULTY') || u.includes('ADMIN');
    })) {
      return 'TEACHER';
    }

    // Ưu tiên 2: Nhận diện qua Email Domain chuẩn đại học
    const email = (user.email || '').toLowerCase().trim();
    const isStudentEmail = email.includes('@stu.') || /b\d{2}dc/i.test(email);
    const isTeacherEmail = email.endsWith('@ptit.edu.vn') && !email.includes('@stu.');

    if (isTeacherEmail) {
      return 'TEACHER';
    }
    if (isStudentEmail) {
      return 'STUDENT';
    }

    return 'STUDENT';
  }, [user]);

  // 2. Trạng thái Role toàn cục: Đồng bộ thời gian thực qua useSyncExternalStore
  const override = useSyncExternalStore(
    globalRoleStore.subscribe,
    globalRoleStore.getSnapshot,
    globalRoleStore.getServerSnapshot
  );

  const activeRole: ActiveRole = override || detectedRole;
  const isOverridden = !!override && override !== detectedRole;

  // 3. Hàm chuyển đổi vai trò thủ công (Thay đổi ngay lập tức toàn bộ app không cần F5)
  const switchRole = useCallback((role: ActiveRole) => {
    globalRoleStore.set(role);
  }, []);

  // 4. Hàm khôi phục về vai trò gốc tự phát hiện
  const resetRole = useCallback(() => {
    globalRoleStore.reset();
  }, []);

  const isTeacher = activeRole === 'TEACHER';
  const isStudent = activeRole === 'STUDENT';
  const isAdmin = Boolean(
    user?.roleName === ROLES.ADMIN ||
    user?.roleName?.toUpperCase().includes('ADMIN')
  );

  const roleBadge = useMemo(() => {
    if (isAdmin) return 'Quản trị viên (Admin)';
    if (isTeacher) return 'Giảng viên (Faculty)';
    return 'Học viên (Student)';
  }, [isAdmin, isTeacher]);

  const isAuthenticated = Boolean(!isUserLoading && !isUserError && user);

  return {
    user,
    activeRole,
    detectedRole,
    isTeacher,
    isStudent,
    isAdmin,
    isOverridden,
    isLoading: isUserLoading,
    isAuthenticated,
    roleBadge,
    switchRole,
    resetRole,
  };
}
