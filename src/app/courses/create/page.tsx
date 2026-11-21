'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { CreateCoursePageView } from '@/features/courses';

export default function CreateCoursePage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.push('/login?redirect=/courses/create');
    }
  }, [user, isLoading, isError, router]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : undefined;

  return (
    <Suspense fallback={null}>
      <CreateCoursePageView userFullName={userFullName} />
    </Suspense>
  );
}
