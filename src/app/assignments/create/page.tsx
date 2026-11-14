'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { TeacherCreateQuizStudioView } from '@/features/assignments';

export default function CreateQuizPage() {
  const router = useRouter();
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

  return (
    <TeacherCreateQuizStudioView
      onBack={() => router.push('/assignments')}
      userFullName={userFullName}
      onPublishSuccess={() => router.push('/assignments')}
    />
  );
}

