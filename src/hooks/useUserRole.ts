'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/features/auth';
import { ActiveRole, ROLES } from '@/constants/roles';

const STORAGE_KEY = 'ilms_active_role_override';

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

  // 2. Trạng thái Role hiện tại (hỗ trợ chuyển đổi góc nhìn để test/demo)
  const [activeRole, setActiveRole] = useState<ActiveRole>(detectedRole);
  const [isOverridden, setIsOverridden] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'TEACHER' || stored === 'STUDENT') {
        setActiveRole(stored);
        setIsOverridden(true);
      } else {
        setActiveRole(detectedRole);
        setIsOverridden(false);
      }
    } catch {
      setActiveRole(detectedRole);
    }
  }, [detectedRole]);

  const switchRole = useCallback((newRole: ActiveRole) => {
    setActiveRole(newRole);
    setIsOverridden(true);
    try {
      localStorage.setItem(STORAGE_KEY, newRole);
    } catch {
      // ignore
    }
  }, []);

  const resetRole = useCallback(() => {
    setActiveRole(detectedRole);
    setIsOverridden(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [detectedRole]);

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
