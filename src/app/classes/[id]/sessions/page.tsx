'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { LessonSessionsPageView } from '@/features/lesson-sessions';

export default function ClassLessonSessionsPage() {
  const params = useParams();
  const rawId = params?.id || params?.classId;
  const classId = typeof rawId === 'string' ? rawId : 'CNTT-K21A';

  return <LessonSessionsPageView classId={classId} />;
}
