'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';

const TeacherQuizAnalyticsView = dynamic(
  () =>
    import('@/features/assignments').then(
      (mod) => mod.TeacherQuizAnalyticsView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFE] dark:bg-[#131314]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-[#C4C7C5]">
            Đang tải dữ liệu phân tích đề thi &amp; phổ điểm...
          </p>
        </div>
      </div>
    ),
  }
);

export default function QuizAnalyticsPage() {
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

  const quizIdParam = searchParams.get('quizId') || undefined;
  const classIdParam = searchParams.get('classId') || undefined;

  return (
    <TeacherQuizAnalyticsView
      onBack={() => router.push('/assignments')}
      userFullName={userFullName}
      initialQuizId={quizIdParam}
      initialClassId={classIdParam}
    />
  );
}
