'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { MaterialsWorkspace } from '@/features/materials/MaterialsWorkspace';

export default function MaterialsPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();
  useEffect(() => {
    if (!isLoading && (isError || !user)) router.replace('/login');
  }, [isError, isLoading, router, user]);
  if (isLoading || !user || isError) return null;
  return <MaterialsWorkspace />;
}
