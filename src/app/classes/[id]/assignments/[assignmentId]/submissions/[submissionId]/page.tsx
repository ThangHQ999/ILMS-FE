'use client';

import React, { Suspense, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { TeacherSubmissionDetailView } from '@/features/assignments';

interface PageProps {
  params: Promise<{ id: string; assignmentId: string; submissionId: string }>;
}

function TeacherSubmissionDetailContent({
  classId,
  assignmentId,
  submissionId,
}: {
  classId: string;
  assignmentId: string;
  submissionId: string;
}) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.push('/login');
    }
  }, [user, isLoading, isError, router]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'TS. Lê Hoàng Nam';

  return (
    <TeacherSubmissionDetailView
      classId={classId}
      assignmentId={assignmentId}
      submissionId={submissionId}
      userFullName={userFullName}
    />
  );
}

export default function TeacherSubmissionDetailPage({ params }: PageProps) {
  const { id: classId, assignmentId, submissionId } = use(params);

  return (
    <Suspense fallback={null}>
      <TeacherSubmissionDetailContent
        classId={classId}
        assignmentId={assignmentId}
        submissionId={submissionId}
      />
    </Suspense>
  );
}
