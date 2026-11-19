'use client';

import React, { Suspense, use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { StudentAssignmentSubmissionPageView } from '@/features/assignments';

interface PageProps {
  params: Promise<{ id: string; assignmentId: string }>;
}

function ClassAssignmentSubmitContent({
  classId,
  assignmentId,
}: {
  classId: string;
  assignmentId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.push('/login');
    }
  }, [user, isLoading, isError, router]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Học viên ILMS';

  const mode = searchParams.get('mode') === 'edit' ? 'edit' : 'create';

  return (
    <StudentAssignmentSubmissionPageView
      classId={classId}
      assignmentId={assignmentId}
      userFullName={userFullName}
      mode={mode}
    />
  );
}

export default function ClassAssignmentSubmitPage({ params }: PageProps) {
  const { id: classId, assignmentId } = use(params);

  return (
    <Suspense fallback={null}>
      <ClassAssignmentSubmitContent classId={classId} assignmentId={assignmentId} />
    </Suspense>
  );
}
