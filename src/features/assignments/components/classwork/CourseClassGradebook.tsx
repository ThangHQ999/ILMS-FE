'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { useCourseClassGradebook } from '../../hooks/useClasswork';
import { assignmentHref } from '../../utils/classworkRoutes';

interface CourseClassGradebookProps {
  classId: string;
  courseId: string;
  canManage: boolean;
}

export function CourseClassGradebook({ classId, courseId, canManage }: CourseClassGradebookProps) {
  const t = useTranslations('classworkFlow');
  const format = useFormatter();
  const [page, setPage] = useState(0);
  const query = useCourseClassGradebook(classId, courseId, canManage, page);
  const book = query.data;

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-busy={query.isFetching}>
      <h2 className="text-xl font-semibold">{t('gradebook')}</h2>
      {query.isPending && <div className="h-36 animate-pulse rounded-3xl bg-surface" role="status"><span className="sr-only">{t('loading')}</span></div>}
      {query.isError && (
        <div className="rounded-3xl bg-surface p-6" role="alert">
          <p>{t('loadError')}</p>
          <button type="button" className="mt-2 rounded-full bg-primary-container px-4 py-2 text-on-primary-container" onClick={() => void query.refetch()}>{t('retry')}</button>
        </div>
      )}
      {book && (!book.assessments.length || !book.students.items.length) && <p className="rounded-3xl bg-surface p-6">{t('emptyGradebook')}</p>}
      {book && book.assessments.length > 0 && book.students.items.length > 0 && (
        <div className="overflow-x-auto rounded-3xl bg-surface p-4">
          <table className="w-full min-w-max text-left text-sm">
            <caption className="sr-only">{t('gradebook')}</caption>
            <thead>
              <tr className="bg-surface-hover">
                <th className="sticky left-0 bg-surface px-4 py-3" scope="col">{t('student')}</th>
                {book.assessments.map((assessment) => (
                  <th className="min-w-36 px-4 py-3" key={assessment.id} scope="col">
                    {canManage && assessment.type === 'ASSIGNMENT'
                      ? <Link className="underline" href={assignmentHref(classId, assessment.deliveryId)}>{assessment.title}</Link>
                      : assessment.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {book.students.items.map((student) => {
                const cells = new Map(student.cells.map((cell) => [cell.assessmentId, cell]));
                return (
                  <tr className="hover:bg-surface-hover" key={student.studentId}>
                    <th className="sticky left-0 bg-surface px-4 py-3 font-medium" scope="row">{student.studentName}</th>
                    {book.assessments.map((assessment) => {
                      const cell = cells.get(assessment.id);
                      const scoreMax = cell?.scoreMax ?? assessment.scoreMax;
                      const label = cell?.score != null
                        ? (scoreMax != null ? t('score', { score: format.number(cell.score), max: format.number(scoreMax) }) : format.number(cell.score))
                        : t.has(`gradeStatus.${cell?.status ?? 'NOT_SUBMITTED'}`)
                          ? t(`gradeStatus.${cell?.status ?? 'NOT_SUBMITTED'}`)
                          : t('gradeStatus.NO_SCORE');
                      const link = canManage && assessment.type === 'ASSIGNMENT' && cell?.submissionId
                        ? `${assignmentHref(classId, assessment.deliveryId)}/submissions/${encodeURIComponent(cell.submissionId)}`
                        : null;
                      return (
                        <td className="px-4 py-3" key={assessment.id}>
                          {link ? <Link className="text-primary underline" href={link}>{label}</Link> : label}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {book && canManage && book.students.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <button type="button" onClick={() => setPage(page - 1)} disabled={page === 0 || query.isFetching} className="rounded-full bg-surface px-4 py-2 disabled:opacity-40">{t('previous')}</button>
          <span>{t('page', { page: page + 1, total: book.students.totalPages })}</span>
          <button type="button" onClick={() => setPage(page + 1)} disabled={book.students.isLast || query.isFetching} className="rounded-full bg-surface px-4 py-2 disabled:opacity-40">{t('next')}</button>
        </div>
      )}
    </section>
  );
}
