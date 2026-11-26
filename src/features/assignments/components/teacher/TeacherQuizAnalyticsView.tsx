'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BarChart3, Download, RefreshCw, Search, Users } from 'lucide-react';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { useCurrentUser } from '@/features/auth';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { ApiError } from '@/types/common';
import { useQuizAnalytics } from '../../hooks/useQuizzes';
import {
  quizAnalyticsLearnerState,
  type QuizAnalyticsContext,
  type QuizAnalyticsDTO,
  type QuizAnalyticsLearner,
  type QuizAnalyticsQuestion,
} from '../../schemas/quiz.schema';

const UUID_PATTERN = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
const PANEL = 'min-w-0 rounded-3xl bg-surface p-5 sm:p-6';
const CONTROL = 'rounded-full bg-surface-hover px-4 py-2.5 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';
const BUTTON = CONTROL + ' inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:opacity-50';
const PAGE_SIZE = 12;
const BANDS = [
  { key: '0-4', from: 0, to: 0.5 },
  { key: '5-6', from: 0.5, to: 0.7 },
  { key: '7-8', from: 0.7, to: 0.9 },
  { key: '9-10', from: 0.9, to: 1 },
] as const;

const LEARNER_STYLES: Record<QuizAnalyticsLearner['state'], string> = {
  SUBMITTED: 'bg-success-container text-on-success-container',
  IN_PROGRESS: 'bg-primary-container text-on-primary-container',
  NOT_STARTED: 'bg-surface-hover text-on-surface',
  EXPIRED: 'bg-warning-container text-on-warning-container',
};

type LearnerFilter = 'ALL' | QuizAnalyticsLearner['state'];
type LearnerSort = 'NAME' | 'HIGHEST' | 'LOWEST';

function classworkHref(classId?: string | null, courseId?: string | null) {
  if (!classId || !UUID_PATTERN.test(classId)) return '/assignments';
  const params = new URLSearchParams({ tab: 'assignments' });
  if (courseId) params.set('courseId', courseId);
  return '/classes/' + encodeURIComponent(classId) + '?' + params;
}

function normalizedName(value: string) {
  return value.trim().toLowerCase().normalize('NFD').replace(/\p{Mark}/gu, '').replace(/đ/g, 'd');
}

function csvField(value: string | number | null | undefined) {
  let text = String(value ?? '');
  if (typeof value === 'string' && /^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export function TeacherQuizAnalyticsView({ initialQuizId, initialClassId }: {
  initialQuizId?: string;
  initialClassId?: string;
}) {
  const t = useTranslations('quizAnalytics');
  const userQuery = useCurrentUser();
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const [focus, setFocus] = useState(false);
  const quizId = initialQuizId?.trim().toLowerCase() ?? '';
  const classId = initialClassId?.trim().toLowerCase();
  const validLink = UUID_PATTERN.test(quizId) && (!classId || UUID_PATTERN.test(classId));
  const query = useQuizAnalytics(validLink && userQuery.data ? quizId : '', classId);
  const context = query.data?.context;
  const errorStatus = query.error instanceof ApiError ? query.error.httpStatus : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar
        isFocus={focus}
        isCollapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        workspaceMode="faculty"
      />
      <DashboardHeader
        isFocus={focus}
        isSidebarCollapsed={collapsed}
        onToggleMode={() => setFocus(!focus)}
        userFullName={[userQuery.data?.lastName, userQuery.data?.firstName].filter(Boolean).join(' ')}
        workspaceMode="faculty"
        title={t('title')}
      />
      <div className={focus || collapsed ? 'lg:pl-[72px]' : 'lg:pl-72'}>
        <main className="mx-auto max-w-[1500px] space-y-6 px-4 pb-12 pt-20 sm:px-6 lg:px-8">
          <Link href={classworkHref(context?.classId ?? classId, context?.courseId)} className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-primary hover:underline">
            <ArrowLeft size={16} aria-hidden />
            {t('back')}
          </Link>

          {validLink && userQuery.data && query.data && context && !query.isError ? (
            <QuizAnalyticsContent
              key={quizId + ':' + (context.classId ?? '')}
              analytics={query.data}
              context={context}
              refreshing={query.isFetching}
              onRefresh={() => void query.refetch()}
            />
          ) : (
            <section className={PANEL + ' space-y-3'}>
              <h1 className="text-2xl font-semibold">{t('title')}</h1>
              {!validLink ? <p role="alert">{t('invalidLink')}</p>
                : userQuery.isPending || (userQuery.data && query.isPending) ? <p role="status">{t('loading')}</p>
                : !userQuery.data ? (
                  <>
                    <p role="alert">{t('signInRequired')}</p>
                    <Link href="/login" className={BUTTON}>{t('signIn')}</Link>
                  </>
                ) : (
                  <>
                    <p role="alert">{t(errorStatus === 403 ? 'forbidden' : errorStatus === 404 ? 'notFound'
                      : errorStatus === 409 ? 'unsupportedVersion' : 'loadError')}</p>
                    {errorStatus !== 403 && errorStatus !== 404 &&
                      <button type="button" className={BUTTON} onClick={() => void query.refetch()}>{t('retry')}</button>}
                  </>
                )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function QuizAnalyticsContent({ analytics, context, refreshing, onRefresh }: {
  analytics: QuizAnalyticsDTO;
  context: QuizAnalyticsContext;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const t = useTranslations('quizAnalytics');
  const format = useFormatter();
  const number = (value: number) => format.number(value, { maximumFractionDigits: 2 });
  const count = (value?: number | null) => value == null ? '—' : number(value);
  const score = (value?: number | null) => analytics.totalParticipants === 0 || value == null
    ? '—' : t('score', { value: number(value), max: number(context.maxScore) });
  const scope = [context.className, context.courseName].filter(Boolean).join(' · ');
  const submitted = analytics.submittedCount ?? analytics.totalParticipants;
  const heatmap = context.courseId && context.classId
    ? '/courses/' + encodeURIComponent(context.courseId) + '/outcomes?' + new URLSearchParams({ tab: 'heatmap', classId: context.classId })
    : null;
  const closeTime = context.closesAt && format.dateTime(new Date(context.closesAt), { dateStyle: 'medium', timeStyle: 'short' });
  const openTime = context.state === 'UPCOMING' && context.opensAt
    && format.dateTime(new Date(context.opensAt), { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <header className={PANEL + ' flex flex-wrap items-start justify-between gap-4'}>
        <div className="min-w-0 flex-1 basis-72">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {scope && <span>{scope}</span>}
            <span className="rounded-full bg-surface-hover px-3 py-1 text-xs font-medium text-on-surface">
              {t('quizState.' + context.state)}
            </span>
          </div>
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{context.title}</h1>
          {(context.questionCount != null || openTime || closeTime) && <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {context.questionCount != null && <span>{t('questionCount', { count: context.questionCount })}</span>}
            {openTime && <span>{t('opensAt', { time: openTime })}</span>}
            {closeTime && <span>{t('closesAt', { time: closeTime })}</span>}
          </p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {heatmap && <Link href={heatmap} className={BUTTON}>{t('heatmap')}</Link>}
          <button type="button" disabled={refreshing} onClick={onRefresh} className={BUTTON}>
            <RefreshCw size={16} aria-hidden className={refreshing ? 'animate-spin' : undefined} />
            {t('refresh')}
          </button>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Metric label={t(analytics.submittedCount == null ? 'graded' : 'submitted')} value={analytics.enrolledCount == null ? number(submitted)
          : t('submittedRatio', { submitted: number(submitted), enrolled: number(analytics.enrolledCount) })}
          note={analytics.submittedCount != null ? t('gradedCount', { count: analytics.totalParticipants }) : undefined} />
        <Metric label={t('average')} value={score(analytics.averageScore)} />
        <Metric label={t('highest')} value={score(analytics.highestScore)} />
        <Metric label={t('passRate')} value={analytics.totalParticipants === 0 || analytics.passRate == null
          ? '—' : format.number(analytics.passRate / 100, { style: 'percent', maximumFractionDigits: 1 })}
          note={context.passingScore == null ? undefined : t('passThreshold', { score: count(context.passingScore) })} />
      </dl>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ScoreDistribution analytics={analytics} maxScore={context.maxScore} />
        <QuestionAnalysis questions={analytics.questions} gradedCount={analytics.totalParticipants} />
      </div>
      <LearnerResults learners={analytics.learners} quizId={analytics.quizId} maxScore={context.maxScore} />
    </>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="min-w-0 rounded-3xl bg-surface p-4 sm:p-6">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-xl font-semibold tabular-nums sm:text-2xl">{value}</dd>
      {note && <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</dd>}
    </div>
  );
}

function ScoreDistribution({ analytics, maxScore }: { analytics: QuizAnalyticsDTO; maxScore: number }) {
  const t = useTranslations('quizAnalytics');
  const format = useFormatter();
  const total = analytics.totalParticipants;
  const counts = BANDS.map(band => analytics.scoreDistribution[band.key] ?? 0);
  const hasDistribution = counts.reduce((sum, value) => sum + value, 0) === total;
  return (
    <section className={PANEL} aria-labelledby="quiz-score-distribution">
      <h2 id="quiz-score-distribution" className="flex items-center gap-2 text-lg font-semibold">
        <BarChart3 size={19} aria-hidden className="text-primary" />{t('distribution')}
      </h2>
      {total === 0 || !hasDistribution ? <p className="mt-4 text-sm text-muted-foreground">
        {t(total === 0 ? 'noGradedAttempts' : 'detailUnavailable')}
      </p> : (
        <ol className="mt-5 space-y-4">
          {BANDS.map((band, index) => {
            const from = format.number(maxScore * band.from, { maximumFractionDigits: 3 });
            const to = format.number(maxScore * band.to, { maximumFractionDigits: 3 });
            return (
              <li key={band.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span>{t(band.to === 1 ? 'scoreRangeInclusive' : 'scoreRange', { from, to })}</span>
                  <strong className="tabular-nums">{format.number(counts[index])}</strong>
                </div>
                <div aria-hidden className="h-2.5 overflow-hidden rounded-full bg-surface-hover">
                  <div className="h-full rounded-full bg-primary" style={{ width: (counts[index] * 100 / total) + '%' }} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function QuestionAnalysis({ questions, gradedCount }: { questions?: QuizAnalyticsQuestion[]; gradedCount: number }) {
  const t = useTranslations('quizAnalytics');
  const format = useFormatter();
  const ranked = questions?.map(question => {
    const samples = question.correctCount + question.incorrectCount + question.unansweredCount;
    return { ...question, samples, accuracy: samples ? question.correctCount / samples : null };
  }).sort((left, right) => (left.accuracy ?? 2) - (right.accuracy ?? 2) || left.orderIndex - right.orderIndex);
  return (
    <section className={PANEL} aria-labelledby="quiz-question-analysis">
      <h2 id="quiz-question-analysis" className="text-lg font-semibold">{t('questionAnalysis')}</h2>
      {!ranked?.length ? <p className="mt-4 text-sm text-muted-foreground">{t(questions ? 'noQuestions' : 'detailUnavailable')}</p>
        : <div tabIndex={0} role="region" aria-label={t('questionAnalysis')} className="mt-3 max-h-[25rem] space-y-2 overflow-y-auto rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          {ranked.map(question => (
            <article key={question.questionId} className="rounded-2xl bg-surface-hover p-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 whitespace-pre-wrap break-words text-sm font-medium">
                  {t('questionLabel', { index: question.orderIndex, content: question.content })}
                </h3>
                <strong className="shrink-0 text-sm tabular-nums">
                  {question.accuracy == null ? '—' : format.number(question.accuracy, { style: 'percent', maximumFractionDigits: 1 })}
                </strong>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {question.samples ? t('answers', { correct: question.correctCount, incorrect: question.incorrectCount,
                  unanswered: question.unansweredCount, samples: question.samples, total: gradedCount }) : t('noQuestionEvidence')}
              </p>
            </article>
          ))}
        </div>}
    </section>
  );
}

function LearnerResults({ learners, quizId, maxScore }: { learners?: QuizAnalyticsLearner[]; quizId: string; maxScore: number }) {
  const t = useTranslations('quizAnalytics');
  const format = useFormatter();
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<LearnerFilter>('ALL');
  const [sort, setSort] = useState<LearnerSort>('NAME');
  const [page, setPage] = useState(0);
  const keyword = normalizedName(search);
  const rows = learners?.filter(learner => (filter === 'ALL' || learner.state === filter)
    && normalizedName(learner.studentName).includes(keyword)).sort((left, right) => {
      const byName = left.studentName.localeCompare(right.studentName, locale);
      if (sort === 'NAME' || left.score == null && right.score == null) return byName;
      if (left.score == null) return 1;
      if (right.score == null) return -1;
      return (sort === 'HIGHEST' ? right.score - left.score : left.score - right.score) || byName;
    }) ?? [];
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const learnerName = (learner: QuizAnalyticsLearner) => learner.studentName.trim() || t('unknownLearner');
  const scoreLabel = (score: number) => t('score', {
    value: format.number(score, { maximumFractionDigits: 2 }), max: format.number(maxScore, { maximumFractionDigits: 2 }),
  });

  function exportCsv() {
    const data = [
      [t('learner'), t('state'), t('points'), t('maxScore'), t('submittedAt')],
      ...rows.map(row => [learnerName(row), t('learnerState.' + row.state), row.score, maxScore, row.submittedAt]),
    ];
    const url = URL.createObjectURL(new Blob(['\ufeff', data.map(row => row.map(csvField).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz-' + quizId + '-results.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className={PANEL + ' space-y-4'} aria-labelledby="quiz-learner-results">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="quiz-learner-results" className="flex items-center gap-2 text-lg font-semibold">
          <Users size={19} aria-hidden className="text-primary" />{t('learnerResults')}
        </h2>
        {!!rows.length && <button type="button" onClick={exportCsv} className={BUTTON}>
          <Download size={16} aria-hidden />{t('exportCsv')}
        </button>}
      </div>
      {!learners?.length ? <p className="text-sm text-muted-foreground">{t(learners ? 'noLearners' : 'detailUnavailable')}</p> : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-0 flex-1 basis-52">
              <span className="sr-only">{t('search')}</span>
              <Search size={16} aria-hidden className="pointer-events-none absolute left-4 top-3 text-muted-foreground" />
              <input type="search" value={search} placeholder={t('search')} className={CONTROL + ' w-full pl-10'}
                onChange={event => { setSearch(event.target.value); setPage(0); }} />
            </label>
            <select value={filter} aria-label={t('filter')} className={CONTROL}
              onChange={event => { setFilter(event.target.value as LearnerFilter); setPage(0); }}>
              <option value="ALL">{t('allStates')}</option>
              {quizAnalyticsLearnerState.options.map(state => <option key={state} value={state}>{t('learnerState.' + state)}</option>)}
            </select>
            <select value={sort} aria-label={t('sort')} className={CONTROL}
              onChange={event => { setSort(event.target.value as LearnerSort); setPage(0); }}>
              <option value="NAME">{t('sortName')}</option>
              <option value="HIGHEST">{t('sortHighest')}</option>
              <option value="LOWEST">{t('sortLowest')}</option>
            </select>
          </div>
          {rows.length === 0 ? <p role="status" className="text-sm text-muted-foreground">{t('noMatchingLearners')}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <caption className="sr-only">{t('learnerResults')}</caption>
                <thead className="bg-surface-hover text-muted-foreground">
                  <tr>
                    <th scope="col" className="rounded-l-xl px-3 py-2.5 font-medium">{t('learner')}</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">{t('state')}</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">{t('points')}</th>
                    <th scope="col" className="rounded-r-xl px-3 py-2.5 font-medium">{t('submittedAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE).map(learner => (
                    <tr key={learner.studentId} className="hover:bg-surface-hover/60">
                      <th scope="row" className="px-3 py-3 font-medium">{learnerName(learner)}</th>
                      <td className="px-3 py-3"><span className={'whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ' + LEARNER_STYLES[learner.state]}>
                        {t('learnerState.' + learner.state)}
                      </span></td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">{learner.score == null ? '—' : scoreLabel(learner.score)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                        {learner.submittedAt ? format.dateTime(new Date(learner.submittedAt), { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pageCount > 1 && <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
            <button type="button" className={BUTTON} onClick={() => setPage(current - 1)} disabled={!current}>{t('previous')}</button>
            <span>{t('page', { page: current + 1, total: pageCount })}</span>
            <button type="button" className={BUTTON} onClick={() => setPage(current + 1)} disabled={current >= pageCount - 1}>{t('next')}</button>
          </div>}
        </>
      )}
    </section>
  );
}
