'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/axios';
import { getUserFriendlyErrorMessage } from '@/lib/error-utils';
import { useCurrentUser } from '@/features/auth';
import { getQuizById } from '../services/quiz.service';
import { getExamById } from '../services/exam.service';
import { getClassworkPage } from '../services/classwork.service';
import { AzotaInProgressPlayer } from './assessment-player/AzotaInProgressPlayer';
import { AssessmentStatusShellView } from './assessment-player/AssessmentStatusShellView';

const answerSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string().nullish(),
});

const viewSchema = z.object({
  assessmentId: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  kind: z.enum(['QUIZ', 'EXAM']),
  maxScore: z.number(),
  durationMinutes: z.number().nullish(),
  questionCount: z.number().nullish(),
  totalQuestions: z.number().nullish(),
  maxAttempts: z.number().nullish(),
  attemptsUsed: z.number().nullish(),
  attemptCount: z.number().nullish(),
  remainingAttempts: z.number().nullish(),
  canRetry: z.boolean().nullish(),
  opensAt: z.string().nullish(),
  closesAt: z.string().nullish(),
  serverNow: z.string(),
  status: z.enum([
    'READY',
    'UPCOMING',
    'CLOSED',
    'IN_PROGRESS',
    'WAITING_FOR_RESULTS',
    'SUBMITTED',
    'EXPIRED',
  ]),
  attemptId: z.string().nullish(),
  expiresAt: z.string().nullish(),
  score: z.number().nullish(),
  questions: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      options: z.array(z.object({ id: z.string(), content: z.string() })),
    })
  ),
  answers: z.array(answerSchema),
});

type View = z.infer<typeof viewSchema>;
type Answer = z.infer<typeof answerSchema>;
type Operation =
  | { type: 'start' }
  | { type: 'submit'; attemptId: string; answers: Answer[] };

const AUTO_SAVE_DEBOUNCE_MS = 700;

export function AssessmentPlayer({
  classId,
  assessmentId,
  courseId,
}: {
  classId: string;
  assessmentId: string;
  courseId?: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : '';

  const path = `/classes/${classId}/assessments/${assessmentId}`;
  const key = ['assessment-play', classId, assessmentId] as const;

  const [elapsed, setElapsed] = useState(0);
  const [draftAnswers, setDraftAnswers] = useState<Answer[] | null>(null);
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLeaving, setIsLeaving] = useState(false);
  const saveTimerRef = useRef<number | null>(null);
  const latestAnswersRef = useRef<Answer[]>([]);
  const revisionRef = useRef(0);

  const query = useQuery({
    queryKey: key,
    queryFn: async () => viewSchema.parse((await api.get(`${path}/play`)).data.data),
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
    refetchOnWindowFocus: false,
  });

  const syncedAttemptRef = useRef<string | null>(null);
  useEffect(() => {
    const attemptId = query.data?.attemptId ?? null;
    if (attemptId && syncedAttemptRef.current !== attemptId) {
      syncedAttemptRef.current = attemptId;
      setDraftAnswers(query.data?.answers ?? []);
      latestAnswersRef.current = query.data?.answers ?? [];
      setSyncState('idle');
    }
  }, [query.data?.attemptId, query.data?.answers]);

  // Background debounced auto-save (never blocks option clicks)
  const saveMutation = useMutation({
    mutationFn: async (params: {
      attemptId: string;
      answers: Answer[];
      rev: number;
    }) => {
      const response = await api.put(
        `${path}/attempts/${params.attemptId}/answers`,
        { answers: params.answers }
      );
      return {
        view: viewSchema.parse(response.data.data),
        rev: params.rev,
      };
    },
    onMutate: () => setSyncState('saving'),
    onSuccess: ({ view: updatedView, rev }) => {
      if (rev === revisionRef.current) {
        queryClient.setQueryData(key, updatedView);
        setSyncState('saved');
      }
    },
    onError: () => setSyncState('error'),
  });

  // Start & Submit actions
  const actionMutation = useMutation({
    mutationFn: async (operation: Operation): Promise<View> => {
      if (operation.type === 'start') {
        return viewSchema.parse((await api.post(`${path}/attempts`)).data.data);
      }
      const attempt = `${path}/attempts/${operation.attemptId}`;
      const response = await api.post(`${attempt}/submit`, {
        answers: operation.answers,
      });
      return viewSchema.parse(response.data.data);
    },
    onMutate: () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      return queryClient.cancelQueries({ queryKey: key });
    },
    onSuccess: (updatedView, operation) => {
      queryClient.setQueryData(key, updatedView);
      if (operation.type === 'start') {
        setDraftAnswers(updatedView.answers);
        latestAnswersRef.current = updatedView.answers;
      }
      if (operation.type === 'submit' || updatedView.status === 'SUBMITTED') {
        void queryClient.invalidateQueries({ queryKey: ['classwork'] });
        void queryClient.invalidateQueries({ queryKey: ['classwork-gradebook'] });
      }
    },
  });

  const view = query.data;
  const playQuestionCount =
    view?.questionCount ??
    view?.totalQuestions ??
    (view && view.questions.length > 0 ? view.questions.length : null);
  const needsMetaFallback =
    (view?.status === 'READY' &&
      (view.durationMinutes == null || playQuestionCount == null || view.maxAttempts == null)) ||
    ((view?.status === 'SUBMITTED' || view?.status === 'EXPIRED') &&
      view.maxAttempts == null);

  const metaQuery = useQuery({
    queryKey: ['assessment-play-meta', classId, assessmentId, view?.kind, courseId ?? ''],
    enabled: needsMetaFallback,
    staleTime: 60_000,
    retry: false,
    queryFn: async (): Promise<{
      durationMinutes: number | null;
      questionCount: number | null;
      maxAttempts: number | null;
    } | null> => {
      try {
        if (view?.kind === 'QUIZ') {
          const quiz = await getQuizById(assessmentId);
          return {
            durationMinutes: quiz.durationMinutes ?? null,
            questionCount: quiz.questions?.length ?? null,
            maxAttempts: quiz.maxAttempts ?? null,
          };
        }
        if (view?.kind === 'EXAM') {
          const exam = await getExamById(assessmentId, classId);
          return {
            durationMinutes: exam.durationMinutes ?? null,
            questionCount: exam.questionCount ?? null,
            maxAttempts: null,
          };
        }
      } catch {
        // Fallback to classwork list if student does not have access to direct quiz/exam detail endpoint
      }
      if (courseId) {
        try {
          const page = await getClassworkPage(classId, courseId, 0);
          const match = page.items.find(
            (item) => item.assessmentId === assessmentId || item.id === assessmentId
          );
          if (match) {
            return {
              durationMinutes: match.durationMinutes ?? null,
              questionCount: null,
              maxAttempts: match.maxAttempts ?? null,
            };
          }
        } catch {
          // Ignore fallback errors; UI handles unknown metadata gracefully
        }
      }
      return null;
    },
  });

  const enrichedView = view
    ? {
        ...view,
        durationMinutes: view.durationMinutes ?? metaQuery.data?.durationMinutes ?? null,
        questionCount: playQuestionCount ?? metaQuery.data?.questionCount ?? null,
        maxAttempts: view.maxAttempts ?? metaQuery.data?.maxAttempts ?? null,
        attemptsUsed: view.attemptsUsed ?? view.attemptCount ?? null,
        remainingAttempts: view.remainingAttempts ?? null,
        canRetry: view.canRetry ?? null,
      }
    : undefined;

  const expiry = view?.expiresAt;
  const serverNow = view?.serverNow;
  const dataUpdatedAt = query.dataUpdatedAt;
  const hasDeadline = view?.status === 'IN_PROGRESS' && Boolean(expiry && serverNow);

  useEffect(() => {
    if (!hasDeadline || !expiry || !serverNow) return;
    const expiryMs = Date.parse(expiry);
    const serverNowMs = Date.parse(serverNow);
    const anchorClientMs = dataUpdatedAt > 0 ? dataUpdatedAt : Date.now();
    const clockOffsetMs = serverNowMs - anchorClientMs;
    const tick = () => {
      const estimatedServerNow = Date.now() + clockOffsetMs;
      const seconds = Math.max(0, Math.ceil((expiryMs - estimatedServerNow) / 1000));
      setElapsed(seconds);
      return seconds;
    };
    tick();
    const timer = window.setInterval(() => {
      if (!tick()) {
        window.clearInterval(timer);
        void query.refetch();
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [expiry, serverNow, dataUpdatedAt, hasDeadline, query.refetch]);

  useEffect(() => {
    if (view?.status !== 'IN_PROGRESS') return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [view?.status]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const selected = draftAnswers ?? view?.answers ?? [];
  const locked = actionMutation.isPending || (hasDeadline && elapsed === 0);
  const backHref = `/classes/${classId}?tab=assignments${
    courseId ? `&courseId=${encodeURIComponent(courseId)}` : ''
  }`;

  function handleChoose(questionId: string, optionId: string) {
    if (!view?.attemptId || locked) return;

    const nextAnswers: Answer[] = [
      ...selected.filter((a) => a.questionId !== questionId),
      { questionId, selectedOptionId: optionId },
    ];

    revisionRef.current += 1;
    const currentRev = revisionRef.current;
    latestAnswersRef.current = nextAnswers;
    setDraftAnswers(nextAnswers);
    setSyncState('saving');

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    const attemptId = view.attemptId;
    saveTimerRef.current = window.setTimeout(() => {
      saveMutation.mutate({
        attemptId,
        answers: latestAnswersRef.current,
        rev: currentRev,
      });
    }, AUTO_SAVE_DEBOUNCE_MS);
  }

  function handleSubmit() {
    if (!view?.attemptId || locked) return;
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    actionMutation.mutate({
      type: 'submit',
      attemptId: view.attemptId,
      answers: latestAnswersRef.current.length > 0 ? latestAnswersRef.current : selected,
    });
  }

  async function handleLeave() {
    setIsLeaving(true);
    try {
      if (saveTimerRef.current && view?.attemptId) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        await saveMutation.mutateAsync({
          attemptId: view.attemptId,
          answers: latestAnswersRef.current,
          rev: revisionRef.current,
        });
      }
    } catch {
      // Allow navigation even if the last background save fails
    } finally {
      router.push(backHref);
    }
  }

  if (view?.status === 'IN_PROGRESS' && view.attemptId) {
    return (
      <AzotaInProgressPlayer
        title={view.title}
        userFullName={userFullName}
        questions={view.questions}
        selected={selected}
        hasDeadline={hasDeadline}
        elapsed={elapsed}
        syncState={syncState}
        isSubmitting={actionMutation.isPending}
        isLeaving={isLeaving}
        locked={locked}
        onChoose={handleChoose}
        onSubmit={handleSubmit}
        onLeave={handleLeave}
        onRetrySave={() => {
          if (view.attemptId) {
            saveMutation.mutate({
              attemptId: view.attemptId,
              answers: latestAnswersRef.current,
              rev: revisionRef.current,
            });
          }
        }}
      />
    );
  }

  const startError = actionMutation.isError
    ? getUserFriendlyErrorMessage(
        actionMutation.error,
        'Không thể bắt đầu lượt làm bài mới. Có thể bạn đã hết số lần làm bài cho phép.'
      )
    : null;

  return (
    <AssessmentStatusShellView
      classId={classId}
      courseId={courseId}
      userFullName={userFullName}
      backHref={backHref}
      view={enrichedView}
      isLoading={query.isPending}
      isError={query.isError}
      isStarting={actionMutation.isPending}
      startError={startError}
      onRetry={() => void query.refetch()}
      onStart={() => actionMutation.mutate({ type: 'start' })}
      onRefresh={() => void query.refetch()}
    />
  );
}
