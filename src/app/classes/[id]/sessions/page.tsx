'use client';

import React, { Suspense, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

function ClassLessonSessionsRedirect() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawId = params?.id || params?.classId;
  const classId = typeof rawId === 'string' ? rawId : '';

  useEffect(() => {
    if (!classId) return;
    const query = new URLSearchParams(searchParams ? searchParams.toString() : '');
    query.set('tab', 'sessions');
    router.replace(`/classes/${classId}?${query.toString()}`);
  }, [classId, router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0B0F19] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  );
}

export default function ClassLessonSessionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0B0F19] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <ClassLessonSessionsRedirect />
    </Suspense>
  );
}

