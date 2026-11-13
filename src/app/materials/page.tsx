'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { MaterialsWorkspace, BackgroundTasksPageView } from '@/features/materials';

function MaterialsContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  if (currentTab === 'workspace') {
    return (
      <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] py-8">
        <MaterialsWorkspace />
      </div>
    );
  }

  return <BackgroundTasksPageView />;
}

export default function MaterialsPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) router.replace('/login');
  }, [isError, isLoading, router, user]);

  if (isLoading || !user || isError) return null;

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-pulse" />}>
      <MaterialsContent />
    </Suspense>
  );
}
