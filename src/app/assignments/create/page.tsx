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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFE] dark:bg-[#131314]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-[#C4C7C5]">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return (
    <TeacherCreateQuizStudioView
      onBack={() => router.push('/assignments')}
      userFullName={userFullName}
      onPublishSuccess={() => router.push('/assignments')}
    />
  );
}

