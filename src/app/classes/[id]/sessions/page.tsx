'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { LessonSessionsPageView } from '@/features/lesson-sessions';

export default function ClassLessonSessionsPage() {
  const params = useParams();
  const rawId = params?.id || params?.classId;
  const classId = typeof rawId === 'string' ? rawId : 'CNTT-K21A';

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <LessonSessionsPageView classId={classId} />
    </Suspense>
  );
}
