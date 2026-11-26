'use client';

import { Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssessmentPlayer } from '@/features/assignments';

function PlayRoute({ classId, assessmentId }: { classId: string; assessmentId: string }) {
  const search = useSearchParams();
  return <AssessmentPlayer classId={classId} assessmentId={assessmentId} courseId={search.get('courseId')} />;
}

export default function AssessmentPlayPage({ params }: { params: Promise<{ id: string; assessmentId: string }> }) {
  const { id, assessmentId } = use(params);
  return <Suspense fallback={null}><PlayRoute classId={id} assessmentId={assessmentId} /></Suspense>;
}
