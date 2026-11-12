'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { AssignmentsTabView } from '@/features/assignments';

export default function ClassDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = typeof params?.classId === 'string' ? params.classId : 'cs-202';

  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Kỹ sư Vũ Minh';

  return <AssignmentsTabView classId={classId} userFullName={userFullName} />;
}

