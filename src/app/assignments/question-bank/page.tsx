'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';

const QuestionBankPageView = dynamic(
  () =>
    import('@/features/assignments').then((mod) => mod.QuestionBankPageView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F4F9] dark:bg-[#131314]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0B57D0] border-t-transparent dark:border-[#A8C7FA] dark:border-t-transparent" />
          <p className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
            Đang tải Ngân hàng Câu hỏi...
          </p>
        </div>
      </div>
    ),
  }
);

export default function QuestionBankPage() {
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
      : '';

  return <QuestionBankPageView userFullName={userFullName} />;
}
