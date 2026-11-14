'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { TeacherCreateQuizStudioView } from '@/features/assignments';

export default function CreateQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'TS. Lê Hoàng Nam';

  const classIdParam = searchParams.get('classId') || undefined;

  return (
    <TeacherCreateQuizStudioView
      onBack={() => router.push('/assignments')}
      userFullName={userFullName}
      onPublishSuccess={() => router.push('/assignments')}
      initialClassId={classIdParam}
    />
  );
}

