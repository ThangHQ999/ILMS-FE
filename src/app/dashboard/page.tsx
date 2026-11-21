'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { DashboardPageView } from '@/features/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  return <DashboardPageView />;
}
