'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { MaterialsHubPageView } from '@/features/materials';

export default function MaterialsPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isError, isLoading, router, user]);

  if (isLoading || !user || isError) return null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-pulse" />
      }
    >
      <MaterialsHubPageView />
    </Suspense>
  );
}
