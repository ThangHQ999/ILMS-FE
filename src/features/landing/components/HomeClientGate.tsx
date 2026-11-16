'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { LandingPageView } from './LandingPageView';

function HomeClientGateInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isSuccess } = useCurrentUser();
  const errorParam =
    searchParams.get('error') || searchParams.get('error_description');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (errorParam) {
      router.replace(`/login?error=${encodeURIComponent(errorParam)}`);
    } else if (isSuccess && user) {
      router.replace('/dashboard');
    }
  }, [isMounted, errorParam, isSuccess, user, router]);

  if (isMounted && isSuccess && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E1E5EA] dark:bg-[#131314]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-sky-400 dark:border-t-transparent" />
          <p className="text-sm font-medium text-slate-600 dark:text-[#C4C7C5]">
            Đang chuyển hướng tới bảng điều khiển...
          </p>
        </div>
      </div>
    );
  }

  return <LandingPageView />;
}

export function HomeClientGate() {
  return (
    <Suspense fallback={<LandingPageView />}>
      <HomeClientGateInner />
    </Suspense>
  );
}
