'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { useUserRole } from '@/hooks/useUserRole';
import { AssignmentsTabView } from '@/features/assignments';

const TeacherExamManagementView = dynamic(
  () =>
    import('@/features/assignments').then((mod) => mod.TeacherExamManagementView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFE] dark:bg-[#131314]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-[#C4C7C5]">
            Đang tải Quản lý Đề thi &amp; Quiz...
          </p>
        </div>
      </div>
    ),
  }
);

const TeacherQuestionBankView = dynamic(
  () =>
    import('@/features/assignments').then((mod) => mod.TeacherQuestionBankView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFE] dark:bg-[#131314]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-[#C4C7C5]">
            Đang tải Ngân hàng Câu hỏi &amp; Ma trận Đề thi...
          </p>
        </div>
      </div>
    ),
  }
);

export default function AssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading, isError } = useCurrentUser();
  const { isTeacher: roleIsTeacher } = useUserRole();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  const viewParam = searchParams.get('view');
  const isTeacher = viewParam ? viewParam === 'teacher' : roleIsTeacher;

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : isTeacher
      ? 'TS. Lê Hoàng Nam'
      : 'Kỹ sư Vũ Minh';

  const tabParam = searchParams.get('tab');
  if (isTeacher) {
    if (tabParam === 'bank' || tabParam === 'question-bank') {
      return <TeacherQuestionBankView userFullName={userFullName} />;
    }
    return <TeacherExamManagementView userFullName={userFullName} />;
  }

  return <AssignmentsTabView classId="cs-202" userFullName={userFullName} />;
}
