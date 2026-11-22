'use client';

import React, { Suspense, use } from 'react';
import { CourseOutcomesPageView } from '@/features/outcomes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseOutcomesPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-pulse" />
      }
    >
      <CourseOutcomesPageView courseId={id} />
    </Suspense>
  );
}
