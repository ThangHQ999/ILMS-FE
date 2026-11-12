'use client';

import React, { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { ClassDetailPageView } from '@/features/classes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClassDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
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

  return <ClassDetailPageView classId={id} userFullName={userFullName} />;
}

