'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { SettingsPageView } from '@/features/settings';

export default function SettingsPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E1E5EA] dark:bg-[#131314]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-[#C4C7C5]">
            Đang tải cài đặt hệ thống...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return <SettingsPageView />;
}
