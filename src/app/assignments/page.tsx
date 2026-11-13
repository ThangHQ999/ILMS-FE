'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { useUserRole } from '@/hooks/useUserRole';
import { AssignmentsTabView, TeacherExamManagementView } from '@/features/assignments';

export default function AssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading, isError } = useCurrentUser();
  const { isTeacher: roleIsTeacher } = useUserRole();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  const viewParam = searchParams.get('view');
  const isTeacher = viewParam ? viewParam === 'teacher' : roleIsTeacher;

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : isTeacher
      ? 'TS. Lê Hoàng Nam'
      : 'Kỹ sư Vũ Minh';

  if (isTeacher) {
    return <TeacherExamManagementView userFullName={userFullName} />;
  }

  return <AssignmentsTabView classId="cs-202" userFullName={userFullName} />;
}

