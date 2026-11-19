'use client';

import React, { use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { StudentAssignmentDetailPageView } from '@/features/assignments';

interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default function AssignmentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { assignmentId } = use(params);
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.push('/login');
    }
  }, [user, isLoading, isError, router]);

  // Determine classId: from query parameter, or derived from assignment ID (e.g. assign-db-* belongs to csdl-k22-01)
  const classId =
    searchParams.get('classId') ||
    (assignmentId.startsWith('assign-db') ? 'csdl-k22-01' : 'cs-202');

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Học viên ILMS';

  return (
    <StudentAssignmentDetailPageView
      classId={classId}
      assignmentId={assignmentId}
      userFullName={userFullName}
    />
  );
}
