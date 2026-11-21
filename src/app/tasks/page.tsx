'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TasksPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/materials/tasks');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-pulse" />
  );
}
