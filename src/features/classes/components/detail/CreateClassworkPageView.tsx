'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { CustomSelect } from '@/components/shared';
import { toast } from '@/components/ui/sonner';
import { uploadFile } from '@/lib/upload';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useCurrentUser } from '@/features/auth';
import {
  classworkKeys,
  useClassworkContexts,
  getClassworkDraft,
  saveClassworkDraft,
  publishClasswork,
  formatToLocalDateTime,
  getQuizById,
  getQuizzes,
  getExamById,
  getExamQuestions,
  useCourseLessons,
  createQuiz,
  updateQuiz,
  replaceQuizQuestions,
  publishQuiz,
  createExam,
  updateExam,
  replaceExamQuestions,
  publishExam,
} from '@/features/assignments';
import { useClassDetail, classDetailKeys } from '../../hooks/useClassDetail';
import { normalizeClassApiId } from '../../services/class.service';
import {
  QuizQuestionPickerPanel,
  type SelectedClassworkQuestion,
} from './QuizQuestionPickerPanel';
import { distributeQuestionPoints } from '../../utils/distribute-points';

export type ClassworkType = 'NOTICE' | 'ASSIGNMENT' | 'QUIZ' | 'EXAM';

interface CreateClassworkPageViewProps {
  classId: string;
  initialType?: ClassworkType;
  initialCourseId?: string;
  initialDraftId?: string;
  fromCourse?: boolean;
}

const TYPE_META = {
  NOTICE: { wireType: 'NOTE', icon: 'campaign', badgeClass: 'bg-primary-container text-on-primary-container' },
  ASSIGNMENT: { wireType: 'ASSIGNMENT', icon: 'assignment', badgeClass: 'bg-primary-container text-on-primary-container' },
  QUIZ: { wireType: 'QUIZ', icon: 'quiz', badgeClass: 'bg-primary-container text-on-primary-container' },
  EXAM: { wireType: 'EXAM', icon: 'school', badgeClass: 'bg-primary-container text-on-primary-container' },
} as const;

export function CreateClassworkPageView({
  classId,
  initialType = 'ASSIGNMENT',
  initialCourseId = '',
  initialDraftId,
  fromCourse = false,
}: CreateClassworkPageViewProps) {
  const router = useRouter();
  const t = useTranslations('classworkFlow');
  const queryClient = useQueryClient();
  const apiClassId = normalizeClassApiId(classId);
  const { data: currentUser } = useCurrentUser();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();

  const { data: classDetail } = useClassDetail(apiClassId, 'subjects', false, { loadAvailableCourses: false });
  const courses = classDetail?.courses.filter((course) => course.status === 'ACTIVE' && /^[0-9a-f-]{36}$/i.test(course.id)) ?? [];
  const classInfo = classDetail?.classInfo;

  const [classworkType, setClassworkType] = useState<ClassworkType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setCourseId] = useState(initialCourseId);
  const courseId = selectedCourseId || (courses.length === 1 ? courses[0].id : '');
  const [lessonId, setLessonId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [examOpensAt, setExamOpensAt] = useState('');
  const [countsTowardGrade, setCountsTowardGrade] = useState(true);
  const [maxSubmissions, setMaxSubmissions] = useState(1);
  const [maxScore, setMaxScore] = useState<number>(10);
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);

  // Attachment upload (NOTICE / ASSIGNMENT)
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quiz / Exam specific settings
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedClassworkQuestion[]>([]);
  const [autoDistributePoints, setAutoDistributePoints] = useState<boolean>(true);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState<number>(1);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [examType, setExamType] = useState<'QUIZ' | 'MIDTERM' | 'FINAL' | 'CONTEST'>('QUIZ');
  const [publishNow, setPublishNow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState(initialDraftId);
  const [sourceQuizId, setSourceQuizId] = useState('');
  const savedDraft = useQuery({
    queryKey: [...classworkKeys.scope(apiClassId, courseId), initialDraftId],
    queryFn: () => getClassworkDraft(apiClassId, courseId, initialDraftId ?? ''),
    enabled: Boolean(initialDraftId && courseId),
    staleTime: Infinity,
    refetchOnMount: true,
  });
  const context = useClassworkContexts(courseId);
  const canManage = context.data?.items.some((item) => item.classId === apiClassId && item.canManage) ?? false;
  const hasQuestions = classworkType === 'QUIZ' || classworkType === 'EXAM';
  const draftQuestions = useQuery({
    queryKey: [...classworkKeys.scope(apiClassId, courseId), 'draft-questions', initialDraftId, savedDraft.data?.type],
    queryFn: async () => {
      const id = initialDraftId ?? '';
      if (savedDraft.data?.type === 'QUIZ') {
        const quiz = await getQuizById(id);
        return { kind: 'QUIZ' as const, quiz, questions: quiz.questions ?? [] };
      }
      const [exam, questions] = await Promise.all([getExamById(id, apiClassId), getExamQuestions(id)]);
      return { kind: 'EXAM' as const, exam, questions };
    },
    enabled: canManage && Boolean(initialDraftId) && hasQuestions && savedDraft.data?.publicationStatus === 'DRAFT',
    staleTime: Infinity,
    refetchOnMount: true,
  });
  const inlineDraft = draftQuestions.data?.kind === 'QUIZ'
    && draftQuestions.data.questions.some((question) => !question.bankQuestionId);
  const quizSources = useQuery({
    queryKey: [...classworkKeys.scope(apiClassId, courseId), 'quiz-authoring-sources'],
    queryFn: async () => (await getQuizzes({classId: apiClassId, size: 50}))
      .filter((quiz) => quiz.courseId === courseId && quiz.questionCount > 0),
    enabled: canManage && hasQuestions && !draftId,
    refetchOnMount: true,
  });
  const source = useQuery({
    queryKey: ['classwork-source-questions', sourceQuizId],
    queryFn: () => getQuizById(sourceQuizId),
    enabled: canManage && hasQuestions && Boolean(sourceQuizId),
    staleTime: 0,
    refetchOnMount: true,
  });
  const sourceQuestions = source.data?.questions ?? [];
  const examCanUseSource = sourceQuestions.every((question) => Boolean(question.bankQuestionId))
    && new Set(sourceQuestions.map((question) => question.bankQuestionId)).size === sourceQuestions.length;
  const activeExamQuestions = sourceQuizId ? sourceQuestions.map((question) => ({
    questionId: question.bankQuestionId ?? '',
    score: question.point ?? 1,
  })) : selectedQuestions.map((question) => ({ questionId: question.id, score: question.point }));
  const examTotal = Number(activeExamQuestions.reduce((sum, question) => sum + question.score, 0).toFixed(2));
  const draftReady = !initialDraftId || (savedDraft.data?.publicationStatus === 'DRAFT'
    && (!hasQuestions || draftQuestions.isSuccess));
  const draftError = savedDraft.isError ? savedDraft : draftQuestions.isError ? draftQuestions : null;

  const { data: lessons = [] } = useCourseLessons(courseId || undefined);

  const notify = (msg: string) => {
    const isErr =
      msg.toLowerCase().includes('không thể') ||
      msg.toLowerCase().includes('vui lòng') ||
      msg.toLowerCase().includes('lỗi');
    if (isErr) toast.error(msg);
    else toast.success(msg);
  };

  useEffect(() => {
    setClassworkType(initialType);
  }, [initialType]);

  useEffect(() => {
    const item = savedDraft.data;
    if (!item) return;
    setTitle(item.title);
    setDescription(item.description ?? '');
    setMaxScore(item.scoreMax ?? 10);
    setCountsTowardGrade(item.countsTowardGrade);
    if (item.type === 'NOTE' || item.type === 'ASSIGNMENT') {
      setClassworkType(item.type === 'NOTE' ? 'NOTICE' : 'ASSIGNMENT');
      setLessonId(item.lessonId ?? '');
      setDueDate(item.dueDate?.slice(0, 16) ?? '');
      setAllowLateSubmission(item.allowLateSubmission ?? true);
      setMaxSubmissions(item.maxAttempts ?? 1);
      setAttachmentUrl(item.fileAttachmentUrl ?? '');
    } else {
      setClassworkType(item.type);
      setExamOpensAt(item.opensAt?.slice(0, 16) ?? '');
      setDueDate(item.closesAt?.slice(0, 16) ?? '');
      setDurationMinutes(item.durationMinutes ?? 30);
      setQuizMaxAttempts(item.maxAttempts ?? 1);
    }
  }, [savedDraft.data]);

  useEffect(() => {
    const data = draftQuestions.data;
    if (!data) return;
    if (data.kind === 'QUIZ') {
      if (typeof data.quiz.maxAttempts === 'number' && data.quiz.maxAttempts > 0) {
        setQuizMaxAttempts(data.quiz.maxAttempts);
      }
      setShuffleQuestions(data.quiz.shuffleQuestions);
      setShuffleAnswers(data.quiz.shuffleAnswers);
      setAutoDistributePoints(false);
      setSelectedQuestions(data.questions.flatMap((question) => question.bankQuestionId ? [{
        id: question.bankQuestionId,
        content: question.content,
        point: question.point ?? 1,
        type: question.questionType,
        answers: (question.answers ?? []).map((a) => ({
          content: a.content,
          isCorrect: Boolean(a.isCorrect),
        })),
      }] : []));
    } else {
      const type = data.exam.examType;
      if (type === 'QUIZ' || type === 'MIDTERM' || type === 'FINAL' || type === 'CONTEST') setExamType(type);
      setAutoDistributePoints(false);
      setSelectedQuestions(data.questions.map((question) => ({
        id: question.questionId, content: question.content, point: question.score, type: question.questionType === 'TRUE_FALSE' ? 'TRUE_FALSE' : 'SINGLE_CHOICE',
      })));
    }
  }, [draftQuestions.data]);

  const meta = TYPE_META[classworkType];
  const backParams = new URLSearchParams({ tab: 'assignments' });
  if (courseId) backParams.set(fromCourse ? 'classId' : 'courseId', fromCourse ? apiClassId : courseId);
  const backUrl = `${fromCourse && courseId ? `/courses/${courseId}` : `/classes/${apiClassId}`}?${backParams}`;
  const userFullName =
    currentUser?.firstName || currentUser?.lastName
      ? `${currentUser.lastName || ''} ${currentUser.firstName || ''}`.trim()
      : '';

  const handleToggleAutoDistribute = (enabled: boolean) => {
    setAutoDistributePoints(enabled);
    if (enabled && selectedQuestions.length > 0 && maxScore > 0) {
      setSelectedQuestions((prev) => distributeQuestionPoints(prev, maxScore));
    }
  };

  const handleMaxScoreChange = (nextScore: number) => {
    setMaxScore(nextScore);
    if (autoDistributePoints && selectedQuestions.length > 0 && nextScore > 0) {
      setSelectedQuestions((prev) => distributeQuestionPoints(prev, nextScore));
    }
  };

  const handleScrollToBuilderQuestion = (questionId: string) => {
    const el = document.getElementById(`quiz-builder-q-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const uploaded = await uploadFile(file, 'ilms/assignments');
      setAttachmentUrl(uploaded.url);
      setAttachmentName(uploaded.originalFilename || file.name);
      toast.success(t('uploadDone'));
    } catch {
      toast.error(t('uploadError'));
    } finally {
      setIsUploadingFile(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting || !draftReady) return;
    if (!title.trim()) {
      toast.error(t('titleRequired'));
      return;
    }
    if (!courseId || !canManage) {
      toast.error(t('selectScopeRequired'));
      return;
    }
    if (isUploadingFile) {
      toast.error(t('uploadPending'));
      return;
    }
    const opensAt = formatToLocalDateTime(examOpensAt);
    const closesAt = formatToLocalDateTime(dueDate);
    if (sourceQuizId && hasQuestions && (!source.isSuccess || !sourceQuestions.length || (classworkType === 'EXAM' && !examCanUseSource))) {
      toast.error(t('sourceUnavailable'));
      return;
    }
    if (publishNow && hasQuestions && !selectedQuestions.length && !sourceQuizId && !inlineDraft) {
      toast.error(t('questionRequired'));
      return;
    }
    if (classworkType === 'EXAM' && (!opensAt || !closesAt
      || new Date(closesAt).getTime() - new Date(opensAt).getTime() < durationMinutes * 60_000)) {
      toast.error(t('examTimeRequired'));
      return;
    }
    let persistedId = draftId;
    setIsSubmitting(true);
    try {
      if (classworkType === 'NOTICE' || classworkType === 'ASSIGNMENT') {
        const isAssignment = classworkType === 'ASSIGNMENT';
        const draft = await saveClassworkDraft(apiClassId, courseId, {
          type: isAssignment ? 'ASSIGNMENT' : 'NOTE',
          title: title.trim(),
          description: description.trim(),
          lessonId: isAssignment && lessonId ? lessonId : undefined,
          scoreMax: isAssignment ? maxScore : undefined,
          countsTowardGrade: isAssignment && countsTowardGrade,
          dueDate: isAssignment ? closesAt ?? undefined : undefined,
          allowLateSubmission: isAssignment ? allowLateSubmission : undefined,
          maxAttempts: isAssignment ? maxSubmissions : undefined,
          fileAttachmentUrl: attachmentUrl || undefined,
        }, persistedId);
        persistedId = draft.id;
        setDraftId(persistedId);
        if (publishNow) await publishClasswork(apiClassId, courseId, persistedId);
      } else if (classworkType === 'QUIZ') {
        const payload = {
          classId: apiClassId,
          courseId,
          sourceQuizId: sourceQuizId || undefined,
          title: title.trim(),
          description: description.trim(),
          status: 'DRAFT' as const,
          countsTowardGrade,
          maxScore,
          durationMinutes,
          maxAttempts: Math.max(1, quizMaxAttempts),
          shuffleQuestions,
          shuffleAnswers,
          startTime: opensAt ?? undefined,
          endTime: closesAt ?? undefined,
        };
        const quiz = persistedId ? await getQuizById(persistedId) : await createQuiz(payload);
        persistedId = quiz.id;
        setDraftId(persistedId);
        if (!quiz.isPublished) {
          if (draftId) await updateQuiz(persistedId, payload);
          if (!sourceQuizId && !inlineDraft) {
            await replaceQuizQuestions(persistedId, selectedQuestions.map((question) => ({
              bankQuestionId: question.id, score: question.point,
            })));
          }
          if (publishNow) await publishQuiz(persistedId);
        }
        await queryClient.invalidateQueries({ queryKey: ['class-quizzes', apiClassId] });
      } else if (opensAt && closesAt) {
        const payload = {
          courseId,
          title: title.trim(),
          description: description.trim(),
          examType,
          durationMinutes,
          totalScore: examTotal || maxScore,
          startTime: opensAt,
          endTime: closesAt,
        };
        const exam = persistedId ? await getExamById(persistedId, apiClassId) : await createExam(apiClassId, payload);
        persistedId = exam.id;
        setDraftId(persistedId);
        if (!exam.isPublished) {
          if (draftId) await updateExam(persistedId, payload, apiClassId);
          await replaceExamQuestions(persistedId, activeExamQuestions);
          if (publishNow) await publishExam(persistedId, apiClassId);
        }
        await queryClient.invalidateQueries({ queryKey: ['exams'] });
      }

      void queryClient.invalidateQueries({ queryKey: classworkKeys.scope(apiClassId, courseId), refetchType: 'none' });
      void queryClient.invalidateQueries({ queryKey: classworkKeys.gradebooks });
      void queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(apiClassId) });
      toast.success(t(publishNow ? 'published' : 'draftSaved'));
      router.push(backUrl);
    } catch {
      if (persistedId) void queryClient.invalidateQueries({ queryKey: classworkKeys.scope(apiClassId, courseId), refetchType: 'none' });
      toast.error(t(persistedId ? 'publishError' : 'saveError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0B0F19] text-gray-900 dark:text-[#E3E3E3] flex flex-col font-sans">
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <DashboardHeader
        isFocus={false}
        showFocusMode={false}
        showRoleSwitcher={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => {}}
        userFullName={userFullName}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 pt-16 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'
        }`}
      >
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 gap-5">
          {/* Top Action Bar (Google Classroom Page Header) */}
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={backUrl}
                className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-[#C4C7C5] flex items-center justify-center shrink-0"
                title={t('back')}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </Link>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${meta.badgeClass}`}>
                <span className="material-symbols-outlined text-[22px]">{meta.icon}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-[#8E918F]">
                  <span className="truncate max-w-[200px]">
                    {classInfo?.title || classInfo?.name || t('class')}
                  </span>
                  <span>•</span>
                  <span>{t('assignments')}</span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#E3E3E3] truncate">
                  {t(`types.${meta.wireType}`)}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={backUrl}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 dark:text-[#C4C7C5] hover:bg-black/5 dark:hover:bg-white/10"
              >
                {t('cancel')}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingFile || !canManage || !draftReady}
                className="px-5 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all border-none cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('save')}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>{t(publishNow ? 'publish' : 'saveDraft')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {(context.isError || draftError) && (
            <div className="rounded-3xl bg-surface p-5" role="alert">
              <p>{t('loadError')}</p>
              <button className="mt-2 rounded-full bg-primary-container px-4 py-2" type="button" onClick={() => void (draftError ?? context).refetch()}>{t('retry')}</button>
            </div>
          )}
          {courseId && context.isSuccess && !canManage && <p className="rounded-3xl bg-surface p-5" role="alert">{t('forbidden')}</p>}
          {/* 2-Column Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-12">
            {/* LEFT COLUMN (70%): Title, Instructions, Attachments, Question Builder */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 space-y-5 shadow-xs">
                <div>
                  <label htmlFor="classwork-title" className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                    {t('title')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="classwork-title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={255}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="classwork-description" className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                    {t(classworkType === 'NOTICE' ? 'noteBody' : 'details')}
                  </label>
                  <textarea
                    id="classwork-description"
                    rows={classworkType === 'QUIZ' || classworkType === 'EXAM' ? 4 : 6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                    className="w-full p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] border-none outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Attachment area for NOTICE / ASSIGNMENT */}
                {(classworkType === 'NOTICE' || classworkType === 'ASSIGNMENT') && (
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUploadingFile}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0F4F8] dark:bg-[#282A2C] hover:opacity-85 text-xs font-semibold text-gray-700 dark:text-[#E3E3E3] border-none cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                          attach_file
                        </span>
                        <span>{t(isUploadingFile ? 'loading' : 'attachFile')}</span>
                      </button>
                      {attachmentUrl && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                          <span className="material-symbols-outlined text-[15px]">description</span>
                          <span className="max-w-[200px] truncate">{attachmentName || t('attachment')}</span>
                          <button
                            type="button"
                            aria-label={t('removeAttachment')}
                            onClick={() => {
                              setAttachmentUrl('');
                              setAttachmentName('');
                            }}
                            className="text-emerald-700 dark:text-emerald-300 hover:text-rose-600 border-none bg-transparent cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {hasQuestions && !draftId && Boolean(quizSources.data?.length) && (
                  <label className="flex flex-col gap-2 text-sm">
                    <span>{t('sourceQuiz')}</span>
                    <select value={sourceQuizId} onChange={(event) => setSourceQuizId(event.target.value)} disabled={Boolean(draftId)} className="rounded-full bg-surface px-4 py-2">
                      <option value="">{t('newQuizQuestions')}</option>
                      {quizSources.data?.map((quiz) => <option value={quiz.id} key={quiz.id}>{quiz.title}</option>)}
                    </select>
                  </label>
                )}
                {sourceQuizId && (
                  <div className="space-y-2 rounded-2xl bg-surface p-4 text-sm">
                    {source.isPending && <p role="status">{t('loading')}</p>}
                    {(source.isError || (source.isSuccess && (!sourceQuestions.length || (classworkType === 'EXAM' && !examCanUseSource))))
                      && <p role="alert">{t('sourceUnavailable')}</p>}
                    {sourceQuestions.length > 0 && <ol className="list-decimal space-y-1 pl-5">
                      {sourceQuestions.map((question) => <li key={question.id}>{question.content} · {question.point ?? 1}</li>)}
                    </ol>}
                  </div>
                )}
                {inlineDraft && (
                  <Link className="text-primary underline" href={`/assignments/create?${new URLSearchParams({ classId: apiClassId, courseId, quizId: draftId ?? '' })}`}>{t('editInStudio')}</Link>
                )}
                {!sourceQuizId && !inlineDraft && hasQuestions && (
                  <QuizQuestionPickerPanel
                    key={courseId}
                    classId={apiClassId}
                    courseId={courseId}
                    selectedQuestions={selectedQuestions}
                    maxScore={maxScore}
                    autoDistributePoints={autoDistributePoints}
                    onToggleAutoDistribute={handleToggleAutoDistribute}
                    onChange={setSelectedQuestions}
                    onToast={notify}
                  />
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (30%): Azota Question Navigator + Settings */}
            <div className="lg:col-span-4 flex flex-col gap-4 sticky top-24">
              {!sourceQuizId && !inlineDraft && hasQuestions && selectedQuestions.length > 0 && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 shadow-xs space-y-3 border border-gray-100 dark:border-[#333537]">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#C4C7C5]">
                      Danh sách câu hỏi
                    </h4>
                    <span className="text-xs font-semibold text-primary">
                      {selectedQuestions.length} câu •{' '}
                      {Math.round(selectedQuestions.reduce((acc, q) => acc + q.point, 0) * 100) / 100}/{maxScore} đ
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {selectedQuestions.map((q, idx) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleScrollToBuilderQuestion(q.id)}
                        title={`Câu ${idx + 1} (${q.point} đ)`}
                        className="h-9 rounded-lg border border-gray-200 dark:border-[#333537] bg-[#F8FAFC] dark:bg-[#131314] hover:border-primary hover:bg-primary/10 hover:text-primary text-xs font-bold text-gray-700 dark:text-[#E3E3E3] transition-colors cursor-pointer tabular-nums"
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 space-y-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8E918F]">
                  {t('settings')}
                </h4>

                {/* Switch Type quickly */}
                {!draftId && <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                    {t('type')}
                  </label>
                  <CustomSelect<ClassworkType>
                    value={classworkType}
                    onChange={setClassworkType}
                    options={(Object.keys(TYPE_META) as ClassworkType[]).map((value) => ({
                      value, label: t(`types.${TYPE_META[value].wireType}`), icon: TYPE_META[value].icon,
                    }))}
                    triggerClassName="h-10 text-xs font-medium rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none"
                  />
                </div>}

                {/* Linked Course */}
                {courses.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                      {t('course')}
                    </label>
                    <CustomSelect<string>
                      value={courseId}
                      onChange={(val) => {
                        if (draftId) return;
                        setCourseId(val);
                        setLessonId('');
                        setSelectedQuestions([]);
                        setSourceQuizId('');
                      }}
                      options={courses.map((c) => ({
                        value: c.id,
                        label: c.code ? `${c.code} • ${c.name}` : c.name,
                        icon: 'book',
                      }))}
                      triggerClassName="h-10 text-xs font-medium rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none"
                    />
                  </div>
                )}

                {/* Lesson Topic (for ASSIGNMENT) */}
                {classworkType === 'ASSIGNMENT' && lessons.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                      {t('lesson')}
                    </label>
                    <CustomSelect<string>
                      value={lessonId}
                      onChange={setLessonId}
                      options={[
                        { value: '', label: t('noLesson') },
                        ...lessons.map((l) => ({
                          value: l.id,
                          label: l.title,
                        })),
                      ]}
                      triggerClassName="h-10 text-xs font-medium rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none"
                    />
                  </div>
                )}

                {/* Score */}
                {classworkType === 'NOTICE' ? (
                  <div className="p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs text-gray-600 dark:text-[#8E918F] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span>{t('noteGradebook')}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                        {t('scoreMax')}
                      </label>
                      <input
                        type="number"
                        aria-label={t('scoreMax')}
                        min={0.01}
                        max={100}
                        step={0.01}
                        value={classworkType === 'EXAM' && !autoDistributePoints ? examTotal || maxScore : maxScore}
                        readOnly={classworkType === 'EXAM' && !autoDistributePoints}
                        onChange={(e) => handleMaxScoreChange(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                        {t(classworkType === 'EXAM' ? 'closeAt' : 'dueDate')}
                      </label>
                      <input
                        type="datetime-local"
                        aria-label={t(classworkType === 'EXAM' ? 'closeAt' : 'dueDate')}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Assignment Late Submission */}
                {classworkType === 'ASSIGNMENT' && (
                  <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] cursor-pointer">
                    <span className="text-xs font-medium text-gray-800 dark:text-[#E3E3E3]">
                      {t('allowLate')}
                    </span>
                    <input
                      type="checkbox"
                      checked={allowLateSubmission}
                      onChange={(e) => setAllowLateSubmission(e.target.checked)}
                      className="w-4 h-4 accent-[#0B57D0] cursor-pointer"
                    />
                  </label>
                )}
                {classworkType === 'ASSIGNMENT' && (
                  <label className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3 text-sm">
                    {t('maxAttempts')}
                    <input type="number" min={1} max={10} value={maxSubmissions} onChange={(event) => setMaxSubmissions(Number(event.target.value))} className="w-20 rounded-full bg-surface-hover px-3 py-2" />
                  </label>
                )}
                {(classworkType === 'ASSIGNMENT' || classworkType === 'QUIZ') && (
                  <label className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3 text-sm">
                    {t('countTowardGrade')}
                    <input type="checkbox" checked={countsTowardGrade} onChange={(event) => setCountsTowardGrade(event.target.checked)} />
                  </label>
                )}

                {/* Quiz / Exam Specific Settings */}
                {(classworkType === 'QUIZ' || classworkType === 'EXAM') && (
                  <div className="space-y-3 pt-1">
                    <label className="flex flex-col gap-2 text-sm">
                      {t('openAt')}
                      <input
                        type="datetime-local"
                        required={classworkType === 'EXAM'}
                        value={examOpensAt}
                        onChange={(event) => setExamOpensAt(event.target.value)}
                        className="rounded-full bg-surface px-4 py-2"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                          {t('duration')}
                        </label>
                        <input
                          type="number"
                          aria-label={t('duration')}
                          min={5}
                          max={240}
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                        />
                      </div>
                      {classworkType === 'QUIZ' ? (
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                            {t('maxAttempts')}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={quizMaxAttempts}
                            onChange={(e) =>
                              setQuizMaxAttempts(Math.max(1, Number(e.target.value) || 1))
                            }
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                            {t('examType')}
                          </label>
                          <CustomSelect<'QUIZ' | 'MIDTERM' | 'FINAL' | 'CONTEST'>
                            value={examType}
                            onChange={setExamType}
                            options={[
                              { value: 'QUIZ', label: t('types.EXAM') },
                              { value: 'MIDTERM', label: t('midterm') },
                              { value: 'CONTEST', label: t('contest') },
                              { value: 'FINAL', label: t('final') },
                            ]}
                            triggerClassName="h-10 text-xs font-medium rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none"
                          />
                        </div>
                      )}
                    </div>

                    {classworkType === 'QUIZ' && (
                      <>
                        <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] cursor-pointer">
                          <span className="text-xs font-medium text-gray-800 dark:text-[#E3E3E3]">
                            {t('shuffleQuestions')}
                          </span>
                          <input
                            type="checkbox"
                            checked={shuffleQuestions}
                            onChange={(e) => setShuffleQuestions(e.target.checked)}
                            className="w-4 h-4 accent-[#0B57D0] cursor-pointer"
                          />
                        </label>
                        <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] cursor-pointer">
                          <span className="text-xs font-medium text-gray-800 dark:text-[#E3E3E3]">
                            {t('shuffleAnswers')}
                          </span>
                          <input
                            type="checkbox"
                            checked={shuffleAnswers}
                            onChange={(e) => setShuffleAnswers(e.target.checked)}
                            className="w-4 h-4 accent-[#0B57D0] cursor-pointer"
                          />
                        </label>
                      </>
                    )}

                  </div>
                )}
                <label className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3 text-sm">
                  {t('publishNow')}
                  <input type="checkbox" checked={publishNow} onChange={(event) => setPublishNow(event.target.checked)} />
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
