'use client';

import React, { Suspense, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { ClassDetailPageView } from '@/features/classes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClassDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const cleanId = decodeURIComponent(id || '').trim();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.push('/login');
    }
  }, [user, isLoading, isError, router]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : '';

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0B0F19]" />}>
      <ClassDetailPageView classId={cleanId} userFullName={userFullName} />
    </Suspense>
  );
}
