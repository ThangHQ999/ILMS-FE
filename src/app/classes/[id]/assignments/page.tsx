'use client';

import React, { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { StudentAssignmentsPageView } from '@/features/assignments';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClassAssignmentsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.push('/login');
    }
  }, [user, isLoading, isError, router]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Học viên ILMS';

  return <StudentAssignmentsPageView classId={id} userFullName={userFullName} />;
}
