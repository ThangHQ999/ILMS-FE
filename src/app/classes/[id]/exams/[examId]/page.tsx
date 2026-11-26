'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TeacherExamDetailView, useClassworkContexts, useExamDetail } from '@/features/assignments';
import { assessmentPlayHref } from '@/features/assignments/utils/classworkRoutes';

export default function ExamClassworkPage({ params }: { params: Promise<{ id: string; examId: string }> }) {
  const { id: classId, examId } = use(params);
  const router = useRouter();
  const t = useTranslations('assessmentPlayer');
  const exam = useExamDetail(examId, classId);
  const scope = useClassworkContexts(exam.data?.courseId ?? '');
  if (exam.isPending || (exam.data?.courseId && scope.isPending)) return <p role="status" className="p-6">{t('loading')}</p>;
  const context = scope.data?.items.find(item => item.classId === classId);
  const courseId = exam.data?.courseId;
  if (!courseId || !context) return <p role="alert" className="p-6">{t('loadError')}</p>;
  if (!context.canManage) return <Link className="m-6 inline-block underline" href={assessmentPlayHref(classId, examId, 'EXAM', courseId)}>{t('EXAM')}</Link>;
  const classworkParams = new URLSearchParams({ tab: 'assignments', courseId });
  const editParams = new URLSearchParams({ courseId, draftId: examId, type: 'EXAM' });
  return <TeacherExamDetailView
    classId={classId}
    examId={examId}
    className={context.className}
    onBack={() => router.push(`/classes/${classId}?${classworkParams}`)}
    onEditExam={exam.data?.isPublished ? undefined : () => router.push(`/classes/${classId}/assignments/new?${editParams}`)}
  />;
}

