'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/features/auth';
import { useClasses } from '@/features/classes/hooks/useClasses';
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
  const { data: classesData, isLoading: isClassesLoading } = useClasses();

  // 1. Thuật toán tự động nhận diện vai trò dựa trên Backend data
  const detectedRole = useMemo<ActiveRole>(() => {
    if (!user) return 'STUDENT';

    // Ưu tiên 1: System Admin có quyền của Giảng viên cao cấp
    if (user.roleName === ROLES.ADMIN || user.roleName?.includes('ADMIN')) {
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

    // Ưu tiên 3: Dựa vào quyền sở hữu lớp học hoặc vai trò giảng dạy trong lớp
    const hasTeachingClasses = classesData?.items?.some(
      (c) =>
        (c.ownerId && c.ownerId === user.id) ||
        c.teachingRole === 'PRIMARY_INSTRUCTOR' ||
        c.teachingRole === 'TA'
    );

    if (hasTeachingClasses) {
      return 'TEACHER';
    }

    return 'STUDENT';
  }, [user, classesData]);

  // 2. Trạng thái Role hiện tại (hỗ trợ chuyển đổi góc nhìn để test/demo)
  const [activeRole, setActiveRole] = useState<ActiveRole>(detectedRole);
  const [isOverridden, setIsOverridden] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ActiveRole | null;
      if (stored === 'TEACHER' || stored === 'STUDENT') {
        setActiveRole(stored);
        setIsOverridden(stored !== detectedRole);
      } else {
        setActiveRole(detectedRole);
        setIsOverridden(false);
      }
    } catch {
      setActiveRole(detectedRole);
      setIsOverridden(false);
    }
  }, [detectedRole]);

  // 3. Hàm chuyển đổi vai trò thủ công (Dành cho Giảng viên muốn xem giao diện SV hoặc khi test UI)
  const switchRole = useCallback(
    (role: ActiveRole) => {
      setActiveRole(role);
      setIsOverridden(role !== detectedRole);
      try {
        localStorage.setItem(STORAGE_KEY, role);
      } catch {
        // ignore storage errors
      }
    },
    [detectedRole]
  );

  // 4. Hàm khôi phục về vai trò gốc tự phát hiện
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
  const isAdmin = user?.roleName === ROLES.ADMIN || user?.roleName?.includes('ADMIN') || false;

  const roleBadge = isAdmin
    ? 'Quản trị viên'
    : isTeacher
    ? 'Giảng viên'
    : 'Học sinh';

  return {
    user,
    activeRole,
    detectedRole,
    isTeacher,
    isStudent,
    isAdmin,
    isOverridden,
    isLoading: isUserLoading || (!user && isClassesLoading),
    isAuthenticated: !isUserLoading && !isUserError && !!user,
    roleBadge,
    switchRole,
    resetRole,
  };
}

