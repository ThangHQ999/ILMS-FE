'use client';

import React, { Suspense, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTranslations } from 'next-intl';
import { useAssignmentItem } from '@/features/assignments/hooks/useAssignmentQueries';
import {
  StudentAssignmentDetailPageView,
  TeacherAssignmentSubmissionsPageView,
  useClassworkContexts,
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
  const t = useTranslations('classworkFlow');
  const { data: user, isLoading, isError } = useCurrentUser();
  const { isTeacher: isLegacyTeacher } = useUserRole();
  const assignment = useAssignmentItem(assignmentId, classId);
  const courseId = assignment.data?.courseId ?? '';
  const contexts = useClassworkContexts(courseId);
  const scope = contexts.data?.items.find((item) => item.classId === classId);
  const isTeacher = courseId ? scope?.canManage : isLegacyTeacher;

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.push('/login');
    }
  }, [user, isLoading, isError, router]);

  if (isLoading || assignment.isPending || (courseId && contexts.isPending)) {
    return <p className="p-6" role="status">{t('loading')}</p>;
  }
  if (assignment.isError || (courseId && !scope)) {
    return <p className="p-6" role="alert">{t('loadError')}</p>;
  }
  const userFullName = [user?.lastName, user?.firstName].filter(Boolean).join(' ');

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
