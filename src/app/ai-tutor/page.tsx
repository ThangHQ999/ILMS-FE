'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { AiTutorPageView } from '@/features/ai-tutor';

export default function AiTutorPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    // ProtectedRoute guard: redirect to login if not authenticated
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6fafe] dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-cyan-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Đang xác thực phiên học viên Gia sư AI...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return <AiTutorPageView />;
}
