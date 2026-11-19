'use client';

import React, { Suspense, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { useUserRole } from '@/hooks/useUserRole';
import {
  StudentAssignmentDetailPageView,
  TeacherAssignmentSubmissionsPageView,
} from '@/features/assignments';

interface PageProps {
  params: Promise<{ id: string; assignmentId: string }>;
}

function ClassAssignmentDetailContent({
  classId,
  assignmentId,
}: {
  classId: string;
  assignmentId: string;
}) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();
  const { isTeacher } = useUserRole();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.push('/login');
    }
  }, [user, isLoading, isError, router]);

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : isTeacher
        ? 'TS. Lê Hoàng Nam'
        : 'Học viên ILMS';

  if (isTeacher) {
    return (
      <TeacherAssignmentSubmissionsPageView
        classId={classId}
        assignmentId={assignmentId}
        userFullName={userFullName}
      />
    );
  }

  return (
    <StudentAssignmentDetailPageView
      classId={classId}
      assignmentId={assignmentId}
      userFullName={userFullName}
    />
  );
}

export default function ClassAssignmentDetailPage({ params }: PageProps) {
  const { id: classId, assignmentId } = use(params);

  return (
    <Suspense fallback={null}>
      <ClassAssignmentDetailContent classId={classId} assignmentId={assignmentId} />
    </Suspense>
  );
}
