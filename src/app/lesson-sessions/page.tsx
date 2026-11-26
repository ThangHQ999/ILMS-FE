'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LessonSessionsPageView } from '@/features/lesson-sessions';

function LessonSessionsContent() {
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId') || undefined;
  return <LessonSessionsPageView key={classId ?? 'all'} classId={classId} />;
}

export default function LessonSessionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] animate-pulse p-8">
          <div className="h-28 rounded-3xl bg-slate-200/70 dark:bg-[#1E1F20] max-w-7xl mx-auto" />
        </div>
      }
    >
      <LessonSessionsContent />
    </Suspense>
  );
}

