'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useFormatter } from 'next-intl';
import { useClassKnowledgeHeatmap, useClassKnowledgeGaps } from '../hooks/useOutcomes';
import { getStudentKnowledgeMastery } from '../services/outcome.service';
import { studentMasterySchema, type MasteryStatus } from '../schemas/knowledge-heatmap.schema';

interface Props {
  classId: string;
  courseId: string;
}

const colors: Record<MasteryStatus, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  WEAK: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200',
  DEVELOPING: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  PROFICIENT: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
  MASTERED: 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200',
};

export function ClassKnowledgeHeatmapMatrix({ classId, courseId }: Props) {
  const t = useTranslations('assessmentHeatmap');
  const format = useFormatter();
  const [page, setPage] = useState(0);
  const [selection, setSelection] = useState<{ studentId: string; studentName: string; conceptId: string } | null>(null);
  const validScope = [classId, courseId].every(id => /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id));
  const matrix = useClassKnowledgeHeatmap(validScope ? classId : '', courseId, page);
  const gaps = useClassKnowledgeGaps(validScope ? classId : '', courseId);
  const details = useQuery({
    queryKey: ['knowledge-evidence', classId, courseId, selection?.studentId],
    queryFn: async () => studentMasterySchema.parse(
      await getStudentKnowledgeMastery(classId, selection?.studentId ?? '', courseId)
    ),
    enabled: validScope && Boolean(selection),
  });
  const concept = details.data?.concepts.find(item => item.conceptId === selection?.conceptId);
  function badge(score: number | null | undefined, status: MasteryStatus = 'NOT_STARTED') {
    return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 tabular-nums ${colors[status]}`}>
      {score == null ? t('noEvidence') : format.number(score / 100, { style: 'percent', maximumFractionDigits: 1 })}
    </span>;
  }
  if (!validScope) return <p role="status" className="rounded-xl border p-4">{t('pickScope')}</p>;
  if (matrix.isPending) return <p role="status">{t('loading')}</p>;
  if (matrix.isError) return <p role="alert">{t('loadError')}{' '}
    <button type="button" className="underline" onClick={() => void matrix.refetch()}>{t('retry')}</button></p>;

  const data = matrix.data;
  const averages = new Map(data.classAverages.map(item => [item.conceptId, item]));
  return <section className="space-y-4">
    <header>
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <p className="text-sm text-muted-foreground">{data.className} · {data.courseTitle}</p>
      {data.generatedAt && <p className="text-xs text-muted-foreground">
        {t('generatedAt', { time: format.dateTime(new Date(data.generatedAt), { dateStyle: 'short', timeStyle: 'short' }) })}
      </p>}
    </header>
    {!data.concepts.length ? <p className="rounded-xl border p-4">{t('noConcepts')}</p> : <>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="sticky left-0 min-w-40 bg-muted p-3">{t('student')}</th>
              {data.concepts.map(item => <th key={item.conceptId} scope="col" className="min-w-32 p-3">{item.conceptName}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.students.items.map(student => {
              const scores = new Map(student.conceptMastery.map(item => [item.conceptId, item]));
              return <tr key={student.studentId} className="border-t">
                <th scope="row" className="sticky left-0 bg-card p-3">{student.studentName}</th>
                {data.concepts.map(item => {
                  const value = scores.get(item.conceptId);
                  return <td key={item.conceptId} className="p-2">
                    {value?.masteryPercent == null ? badge(undefined) : <button type="button" className="space-y-1 rounded-md text-left focus-visible:ring-2"
                      onClick={() => setSelection({ studentId: student.studentId, studentName: student.studentName, conceptId: item.conceptId })}>
                      {badge(value.masteryPercent, value.masteryStatus)}
                      <span className="block text-xs text-muted-foreground">
                        {t('questions', { count: value.evidenceCount })}{value.evidenceCount < 3 ? ` · ${t('smallSample')}` : ''}
                      </span>
                    </button>}
                  </td>;
                })}
              </tr>;
            })}
          </tbody>
          <tfoot className="bg-muted">
            <tr>
              <th scope="row" className="sticky left-0 bg-muted p-3">{t('average')}</th>
              {data.concepts.map(item => {
                const average = averages.get(item.conceptId);
                return <td key={item.conceptId} className="p-2 space-y-1">
                  {badge(average?.averageMastery, average?.masteryStatus)}
                  {average && <p className="text-xs text-muted-foreground">
                    {t('coverage', { assessed: average.assessedStudents, total: average.totalStudents })}
                  </p>}
                </td>;
              })}
            </tr>
          </tfoot>
        </table>
      </div>
      {data.students.totalPages > 1 && <nav aria-label={t('pagination')} className="flex items-center gap-4 text-sm">
        <button type="button" className="underline disabled:opacity-40" disabled={!page} onClick={() => setPage(page - 1)}>{t('previous')}</button>
        <span>{data.students.pageNumber + 1}/{data.students.totalPages}</span>
        <button type="button" className="underline disabled:opacity-40" disabled={data.students.isLast} onClick={() => setPage(page + 1)}>{t('next')}</button>
      </nav>}
    </>}
    {gaps.data && <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl border p-4">
        <h3 className="font-semibold">{t('gaps')}</h3>
        {gaps.data.gaps.length ? <ul className="mt-2 space-y-1 text-sm">{gaps.data.gaps.map(item =>
          <li key={item.conceptId}>{item.conceptName} · {t('below', { below: item.studentsBelow, assessed: item.assessedStudents })}</li>
        )}</ul> : <p className="mt-2 text-sm text-muted-foreground">{t('noAlerts')}</p>}
      </section>
      <section className="rounded-xl border p-4">
        <h3 className="font-semibold">{t('atRisk')}</h3>
        {gaps.data.atRiskStudents.length ? <ul className="mt-2 space-y-1 text-sm">{gaps.data.atRiskStudents.map(item =>
          <li key={item.studentId}>{item.studentName} · {format.number(item.overallMastery / 100, { style: 'percent', maximumFractionDigits: 1 })}</li>
        )}</ul> : <p className="mt-2 text-sm text-muted-foreground">{t('noAlerts')}</p>}
      </section>
    </div>}
    {gaps.isError && <p role="alert" className="text-sm">{t('gapsError')}{' '}
      <button type="button" className="underline" onClick={() => void gaps.refetch()}>{t('retry')}</button></p>}
    {selection && <section className="space-y-3 rounded-xl border p-4" aria-label={t('evidence')}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{selection.studentName} · {concept?.conceptName ?? t('evidence')}</h3>
        <button type="button" className="text-sm underline" onClick={() => setSelection(null)}>{t('close')}</button>
      </div>
      {details.isPending && <p role="status">{t('loading')}</p>}
      {details.isError && <p role="alert">{t('loadError')}{' '}
        <button type="button" className="underline" onClick={() => void details.refetch()}>{t('retry')}</button></p>}
      {concept && <>
        <p className="text-sm">{t('correctCount', { count: concept.correctCount, total: concept.evidenceCount })}</p>
        <ul className="divide-y text-sm">{concept.evidence.map(item =>
          <li key={`${item.quizId}/${item.questionId}`} className="py-2">
            {item.assessmentTitle} · {t(item.correct ? 'correct' : 'incorrect')} · {format.dateTime(new Date(item.submittedAt), { dateStyle: 'short', timeStyle: 'short' })}
          </li>)}</ul>
      </>}
    </section>}
  </section>;
}
