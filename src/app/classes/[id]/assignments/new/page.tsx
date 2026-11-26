'use client';

import React, { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreateClassworkPageView, type ClassworkType } from '@/features/classes';

interface PageProps {
  params: Promise<{ id: string }>;
}

const VALID_TYPES = new Set<ClassworkType>(['NOTICE', 'ASSIGNMENT', 'QUIZ', 'EXAM']);

export default function ClassNewAssignmentPage({ params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const rawType = searchParams.get('type')?.toUpperCase() as ClassworkType | undefined;
  const initialType: ClassworkType = rawType && VALID_TYPES.has(rawType) ? rawType : 'ASSIGNMENT';

  return <CreateClassworkPageView
    classId={id}
    initialType={initialType}
    initialCourseId={searchParams.get('courseId') ?? undefined}
    initialDraftId={searchParams.get('draftId') ?? undefined}
    fromCourse={searchParams.get('from') === 'course'}
  />;
}
