'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { CompetencyPageView } from '@/features/competency';

export default function CompetencyPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  return <CompetencyPageView />;
}
