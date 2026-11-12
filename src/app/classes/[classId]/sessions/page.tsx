'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { LessonSessionsPageView } from '@/features/lesson-sessions';

export default function ClassLessonSessionsPage() {
  const params = useParams();
  const classId = typeof params?.classId === 'string' ? params.classId : 'CNTT-K21A';

  return <LessonSessionsPageView classId={classId} />;
}

