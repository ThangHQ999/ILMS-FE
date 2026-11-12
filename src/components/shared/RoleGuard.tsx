'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { ActiveRole } from '@/constants/roles';

interface RoleGuardProps {
  allowedRoles: ActiveRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * RoleGuard: Bảo vệ route hoặc block nội dung theo vai trò Giảng viên / Học sinh.
 * Tự động chuyển hướng về /403 hoặc trang chỉ định nếu không đủ quyền.
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallback,
  redirectTo = '/403',
}: RoleGuardProps) {
  const router = useRouter();
  const { activeRole, isLoading, isAuthenticated } = useUserRole();

  const isAllowed = allowedRoles.includes(activeRole);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isAllowed && redirectTo) {
        router.replace(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, isAllowed, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B57D0] border-t-transparent dark:border-[#A8C7FA] dark:border-t-transparent" />
      </div>
    );
  }

  if (!isAllowed) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

