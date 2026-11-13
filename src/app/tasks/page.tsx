'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundTasksPageView } from '@/features/materials';

export default function TasksPage() {
  const router = useRouter();

  useEffect(() => {
    // Optionally keep URL clean as /materials/tasks
    router.replace('/materials/tasks');
  }, [router]);

  return <BackgroundTasksPageView />;
}
