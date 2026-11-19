'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClassDetail } from '@/features/classes/hooks/useClassDetail';
import { useCurrentUser } from '@/features/auth';
import { useAssignmentItem } from '../hooks/useAssignmentItem';
import {
  useSubmissionDetail,
  useSubmissionGrading,
  useGradeSubmission,
  useDeleteGrading,
} from '../hooks/useSubmissionDetail';
import {
  evaluateCanManageClassSubmissions,
  evaluateCanModifyGrading,
  formatAssignmentDueDate,
  formatScore,
  formatSubmissionTime,
  isDemoAssignment,
  isSubmissionGraded,
  validateFeedbackUtf8Bytes,
  validateGradeScore,
} from '../services/assignment.service';
import { DeleteGradingConfirmModal } from './DeleteGradingConfirmModal';

export interface TeacherSubmissionDetailViewProps {
  classId: string;
  assignmentId: string;
  submissionId: string;
  userFullName?: string;
}

type SaveBannerState =
  | { kind: 'error'; title: string; message: string }
  | { kind: 'conflict'; title: string; message: string }
  | { kind: 'uncertain'; title: string; message: string }
  | null;

const SAFE_URL_REGEX = /^https?:\/\/[^\s<>"]+$/i;
const INLINE_URL_SPLIT_REGEX = /(https?:\/\/[^\s<>"]+)/gi;

function isSafeDisplayUrl(url?: string | null): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  return SAFE_URL_REGEX.test(trimmed) || trimmed.startsWith('/');
}

function getStudentInitial(name?: string | null): string {
  const cleaned = (name || '').trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const lastWord = parts[parts.length - 1] || cleaned;
  return lastWord.charAt(0).toUpperCase();
}

function extractErrorMeta(err: unknown): {
  status: number;
  code: string;
  serverMessage: string;
} {
  if (!err || typeof err !== 'object') {
    return { status: 0, code: '', serverMessage: '' };
  }
  const e = err as {
    httpStatus?: number;
    status?: number;
    code?: string;
    message?: string;
    response?: {
      status?: number;
      data?: { message?: string; error?: string };
    };
  };
  const status = e.httpStatus || e.response?.status || e.status || 0;
  const code = (e.code || '').toUpperCase();
  const serverMessage =
    (typeof e.response?.data?.message === 'string' && e.response.data.message.trim()) ||
    (typeof e.message === 'string' && e.message.trim()) ||
    '';
  return { status, code, serverMessage };
}

function isUncertainMutationError(err: unknown): boolean {
  const { status, code, serverMessage } = extractErrorMeta(err);
  const msgLower = serverMessage.toLowerCase();
  return (
    code === 'SCHEMA_ERROR' ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ERR_NETWORK' ||
    status === 0 ||
    status === 408 ||
    status === 504 ||
    msgLower.includes('network error') ||
    msgLower.includes('timeout')
  );
}

/**
 * Safely renders plain text preserving newlines and wrapping long unbroken tokens/URLs.
 * Never renders untrusted raw HTML; only converts explicit http(s) URLs into safe anchors.
 */
function SafeFormattedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const tokens = text.split(INLINE_URL_SPLIT_REGEX);
  return (
    <div
      className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${className || ''}`}
    >
      {tokens.map((token, idx) => {
        if (SAFE_URL_REGEX.test(token)) {
          return (
            <a
              key={idx}
              href={token}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0059BB] dark:text-blue-400 underline underline-offset-2 hover:text-[#004493] break-all"
            >
              {token}
            </a>
          );
        }
        return <React.Fragment key={idx}>{token}</React.Fragment>;
      })}
    </div>
  );
}

export function TeacherSubmissionDetailView({
  classId,
  assignmentId,
  submissionId,
  userFullName,
}: TeacherSubmissionDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnQuery = searchParams.get('returnQuery') || '';
  const safeReturnQuery =
    rawReturnQuery.startsWith('?') && !rawReturnQuery.includes('//') ? rawReturnQuery : '';
  const submissionsListHref = `/classes/${classId}/assignments/${assignmentId}${safeReturnQuery}`;

  const t = useTranslations('assignments.teacher.submissionDetail');
  const tSub = useTranslations('assignments.teacher.submissions');
  const tClass = useTranslations('classes.detail');
  const locale = useLocale();

  // App Shell layout states (preserve original sidebar & header)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Accordion state: collapsed by default per Stitch prototype
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);

  // First-time grading form state (initially blank — never prefilled with 0 or sample text)
  const [scoreInput, setScoreInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<SaveBannerState>(null);
  const [needsReloadBeforeRetry, setNeedsReloadBeforeRetry] = useState(false);
  const [postSaveReloadFailed, setPostSaveReloadFailed] = useState(false);
  const [isRetryingReload, setIsRetryingReload] = useState(false);
  const isSubmittingRef = useRef(false);

  // In-place Edit Grade mode state (for already-graded submissions)
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [editOriginalScore, setEditOriginalScore] = useState<number | null>(null);
  const [editOriginalFeedback, setEditOriginalFeedback] = useState<string | null>(null);
  const [editScoreInput, setEditScoreInput] = useState<string>('');
  const [editFeedbackInput, setEditFeedbackInput] = useState<string>('');
  const [editScoreError, setEditScoreError] = useState<string | null>(null);
  const [editFeedbackError, setEditFeedbackError] = useState<string | null>(null);
  const [editSaveBanner, setEditSaveBanner] = useState<SaveBannerState>(null);
  const [editNeedsReloadBeforeRetry, setEditNeedsReloadBeforeRetry] = useState(false);

  // Delete Grading confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteErrorTitle, setDeleteErrorTitle] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [deleteNeedsReload, setDeleteNeedsReload] = useState(false);
  const isDeletingRef = useRef(false);

  // Auth & Class permission check (real permission — never from role switcher/email/localStorage)
  const { data: currentUser, isLoading: isAuthLoading } = useCurrentUser();
  const {
    data: classDetailData,
    isLoading: isClassLoading,
    isError: isClassError,
  } = useClassDetail(classId);

  const classInfo = classDetailData?.classInfo;
  const resolvedClassId = classInfo?.id || classId;
  const isDemo = isDemoAssignment(assignmentId, resolvedClassId);
  const isVerifyingPermission = !isDemo && (isAuthLoading || isClassLoading);

  const canManageSubmissions = useMemo(
    () =>
      evaluateCanManageClassSubmissions({
        classId: resolvedClassId,
        isDemoTeacherView: isDemo,
        isAuthLoading,
        isClassLoading,
        isClassError,
        isClassInfoLive: classDetailData?.isClassInfoLive,
        isMembersLive: classDetailData?.isMembersLive,
        user: currentUser,
        classInfo: classDetailData?.classInfo,
        members: classDetailData?.members,
      }),
    [
      resolvedClassId,
      isDemo,
      isAuthLoading,
      isClassLoading,
      isClassError,
      classDetailData,
      currentUser,
    ]
  );

  // Assignment query: GET /api/v1/assignments/{assignmentId} only (never calls student /my-submission)
  const {
    data: assignmentData,
    isLoading: isAssignmentLoading,
    isError: isAssignmentError,
    error: assignmentError,
    refetch: refetchAssignment,
  } = useAssignmentItem(assignmentId, resolvedClassId);

  // Submission Detail query: GET /api/v1/submissions/{submissionId}
  const {
    data: submissionData,
    isLoading: isSubmissionLoading,
    isError: isSubmissionError,
    error: submissionError,
    refetch: refetchSubmission,
  } = useSubmissionDetail(submissionId, assignmentId, resolvedClassId, {
    userId: currentUser?.id,
    enabled: !isVerifyingPermission && canManageSubmissions,
  });

  // Graded status from authoritative SubmissionDetail (score === 0 IS graded)
  const isAlreadyGraded = isSubmissionGraded(submissionData);

  // Grading Record query: GET /api/v1/submissions/{submissionId}/grading (fetches authoritative gradingId & graderId)
  const {
    data: gradingData,
    isLoading: isGradingLoading,
    isError: isGradingError,
    refetch: refetchGrading,
  } = useSubmissionGrading(submissionId, assignmentId, resolvedClassId, {
    userId: currentUser?.id,
    enabled:
      !isVerifyingPermission &&
      canManageSubmissions &&
      Boolean(submissionData) &&
      isAlreadyGraded,
  });

  // Mutations (retry: false on both)
  const gradeMutation = useGradeSubmission(assignmentId, resolvedClassId, currentUser?.id);
  const deleteGradingMutation = useDeleteGrading(assignmentId, resolvedClassId, currentUser?.id);

  // Strict Edit/Delete permission check (Admin or current graderId with active class permission + verified gradingId)
  const modifyPermission = useMemo(
    () =>
      evaluateCanModifyGrading({
        classId: resolvedClassId,
        isDemoTeacherView: isDemo,
        canManageClassSubmissions: canManageSubmissions,
        isAuthLoading,
        isGradingLoading,
        isGradingError,
        user: currentUser,
        grading: gradingData,
        submissionGraderId: submissionData?.gradedByTeacherId ?? null,
      }),
    [
      resolvedClassId,
      isDemo,
      canManageSubmissions,
      isAuthLoading,
      isGradingLoading,
      isGradingError,
      currentUser,
      gradingData,
      submissionData?.gradedByTeacherId,
    ]
  );

  // Mismatch check: Submission claims graded, but GET /submissions/{id}/grading returned 404 (null)
  const isGradingMismatch =
    isAlreadyGraded && !isGradingLoading && !isGradingError && gradingData === null;

  // Authoritative graded fields from server (never substitute class owner, current user, or device clock)
  const authoritativeScore: number | null =
    typeof gradingData?.score === 'number' && !Number.isNaN(gradingData.score)
      ? gradingData.score
      : typeof submissionData?.score === 'number' && !Number.isNaN(submissionData.score)
        ? submissionData.score
        : null;

  const authoritativeFeedback: string | null =
    gradingData !== undefined && gradingData !== null
      ? gradingData.feedback ?? null
      : submissionData?.feedback ?? null;

  const authoritativeGraderName: string | null =
    gradingData?.graderName?.trim() ||
    gradingData?.gradedByTeacherName?.trim() ||
    submissionData?.gradedByTeacherName?.trim() ||
    null;

  const authoritativeGradedAt: string | null =
    gradingData?.gradedAt || submissionData?.gradedAt || null;

  const correctAnswersCount: number | null =
    typeof gradingData?.correctAnswersCount === 'number' &&
    !Number.isNaN(gradingData.correctAnswersCount)
      ? gradingData.correctAnswersCount
      : null;

  const scaledScore: number | null =
    typeof gradingData?.scaledScore === 'number' && !Number.isNaN(gradingData.scaledScore)
      ? gradingData.scaledScore
      : null;

  // Real metadata (zero Stitch hardcoded fallbacks)
  const classTitle = classInfo?.title?.trim() || classInfo?.name?.trim() || classId;
  const courseList = Array.isArray(classDetailData?.courses) ? classDetailData.courses : [];
  const matchedCourse = assignmentData?.courseId
    ? courseList.find((c) => c.id === assignmentData.courseId)
    : courseList.length === 1
      ? courseList[0]
      : undefined;
  const courseCode = matchedCourse?.code?.trim() || null;
  const rawChapter = typeof assignmentData?.chapter === 'string' ? assignmentData.chapter.trim() : '';
  const validChapter =
    rawChapter && rawChapter.toLowerCase() !== 'chương mới' ? rawChapter : null;
  const heroContextParts = [courseCode, t('eyebrowAssignment'), validChapter].filter(
    (part): part is string => Boolean(part)
  );

  const assignmentTitle =
    assignmentData?.title?.trim() || submissionData?.assignmentTitle?.trim() || '';

  const assignmentDescription =
    typeof assignmentData?.description === 'string'
      ? assignmentData.description.trim()
      : typeof submissionData?.assignmentDescription === 'string'
        ? submissionData.assignmentDescription.trim()
        : '';

  const assignmentAttachmentUrl = isSafeDisplayUrl(assignmentData?.fileAttachmentUrl)
    ? assignmentData!.fileAttachmentUrl!.trim()
    : null;

  // Max score strictly from real Assignment (or SubmissionDetail fallback if Assignment lacks it) — NEVER default to 10
  const rawMaxScore =
    typeof assignmentData?.maxScore === 'number' && !Number.isNaN(assignmentData.maxScore)
      ? assignmentData.maxScore
      : typeof submissionData?.maxScore === 'number' && !Number.isNaN(submissionData.maxScore)
        ? submissionData.maxScore
        : null;
  const hasValidMaxScore = rawMaxScore !== null && rawMaxScore > 0;
  const effectiveMaxScore = hasValidMaxScore ? Math.min(rawMaxScore, 100) : null;
  const formattedMaxScore =
    hasValidMaxScore && rawMaxScore !== null ? formatScore(rawMaxScore, locale) : '';

  const dueInfo = formatAssignmentDueDate(assignmentData?.dueDate);
  const allowLatePolicy: boolean | null =
    typeof assignmentData?.allowLateSubmission === 'boolean'
      ? assignmentData.allowLateSubmission
      : null;

  // Error / permission classification
  const submissionErrMeta = extractErrorMeta(submissionError);
  const assignmentErrMeta = extractErrorMeta(assignmentError);

  const isForbidden =
    (!isVerifyingPermission && !canManageSubmissions) ||
    submissionErrMeta.status === 403 ||
    assignmentErrMeta.status === 403;

  const isAssignmentClassMismatch =
    !isDemo &&
    Boolean(assignmentData?.classId) &&
    Boolean(resolvedClassId) &&
    assignmentData!.classId !== resolvedClassId;

  const isSubmissionAssignmentMismatch =
    submissionErrMeta.code === 'ASSIGNMENT_MISMATCH' ||
    Boolean(
      submissionData?.assignmentId &&
        assignmentId &&
        submissionData.assignmentId !== assignmentId
    );

  const isNotFound = submissionErrMeta.status === 404 || assignmentErrMeta.status === 404;

  // Student info from authoritative SubmissionDetail (no hardcoded sample name or fake student code)
  const studentDisplayName =
    submissionData?.studentName?.trim() || t('cards.studentWork.unknownStudent');
  const studentIdentifier =
    submissionData?.studentCode?.trim() || submissionData?.studentId?.trim() || null;
  const studentAvatarUrl = isSafeDisplayUrl(submissionData?.studentAvatar)
    ? submissionData!.studentAvatar!.trim()
    : null;

  const submittedAtFormatted = submissionData?.submittedAt
    ? formatSubmissionTime(submissionData.submittedAt).formatted
    : null;

  const submissionAttemptValue =
    typeof submissionData?.submissionAttempt === 'number' &&
    !Number.isNaN(submissionData.submissionAttempt)
      ? submissionData.submissionAttempt
      : typeof submissionData?.attempt === 'number' && !Number.isNaN(submissionData.attempt)
        ? submissionData.attempt
        : null;

  const safeAttachments = useMemo(
    () =>
      (submissionData?.attachmentUrls ?? [])
        .filter((url): url is string => isSafeDisplayUrl(url))
        .map((url) => url.trim()),
    [submissionData?.attachmentUrls]
  );

  // Timeliness badge is independent of grading status
  const isSubmissionLate =
    submissionData?.isLate === true || submissionData?.status === 'LATE';
  const isSubmissionOnTime =
    submissionData?.isLate === false && submissionData?.status !== 'LATE';

  // Map validation error code to localized message
  const mapScoreErrorMessage = (
    errorCode: 'required' | 'invalid' | 'negative' | 'range' | 'decimals'
  ): string => {
    const maxDisplay =
      effectiveMaxScore !== null ? formatScore(effectiveMaxScore, locale) : '';
    switch (errorCode) {
      case 'required':
        return t('cards.grading.scoreErrors.required');
      case 'negative':
        return t('cards.grading.scoreErrors.negative');
      case 'range':
        return t('cards.grading.scoreErrors.range', { maxScore: maxDisplay });
      case 'decimals':
        return t('cards.grading.scoreErrors.decimals');
      default:
        return t('cards.grading.scoreErrors.invalidNumber');
    }
  };

  // --- First-time grading validation ---
  const scoreCheck = useMemo(() => {
    if (!hasValidMaxScore || effectiveMaxScore === null) {
      return { valid: false as const, errorCode: 'required' as const };
    }
    return validateGradeScore(scoreInput, effectiveMaxScore);
  }, [scoreInput, hasValidMaxScore, effectiveMaxScore]);

  const feedbackCheck = useMemo(
    () => validateFeedbackUtf8Bytes(feedbackInput),
    [feedbackInput]
  );

  const isScoreValid = scoreInput.trim() !== '' && scoreCheck.valid;
  const canSubmitGrade =
    !isVerifyingPermission &&
    canManageSubmissions &&
    !isAssignmentError &&
    hasValidMaxScore &&
    isScoreValid &&
    feedbackCheck.valid &&
    !gradeMutation.isPending &&
    !needsReloadBeforeRetry &&
    !isAlreadyGraded &&
    !postSaveReloadFailed;

  // --- Edit Grade validation & strict dirty check ---
  const editScoreCheck = useMemo(() => {
    if (!hasValidMaxScore || effectiveMaxScore === null) {
      return { valid: false as const, errorCode: 'required' as const };
    }
    return validateGradeScore(editScoreInput, effectiveMaxScore);
  }, [editScoreInput, hasValidMaxScore, effectiveMaxScore]);

  const editFeedbackCheck = useMemo(
    () => validateFeedbackUtf8Bytes(editFeedbackInput),
    [editFeedbackInput]
  );

  const isEditScoreValid = editScoreInput.trim() !== '' && editScoreCheck.valid;
  const isEditScoreChanged = useMemo(() => {
    if (!editScoreCheck.valid) return false;
    if (editOriginalScore === null) return true;
    // Equivalent numeric representations (e.g. 8.5 and 8.50) are NOT considered a real change
    return Math.abs(editScoreCheck.numericValue - editOriginalScore) > 1e-9;
  }, [editScoreCheck, editOriginalScore]);

  const normalizedEditOriginalFeedback =
    editOriginalFeedback && editOriginalFeedback.trim().length > 0
      ? editOriginalFeedback
      : null;
  const normalizedEditNextFeedback =
    editFeedbackInput.trim().length > 0 ? editFeedbackInput : null;
  const isEditFeedbackChanged =
    normalizedEditNextFeedback !== normalizedEditOriginalFeedback;

  const isEditDirty = isEditScoreChanged || isEditFeedbackChanged;
  const canSaveEdit =
    modifyPermission.canEdit &&
    !isGradingMismatch &&
    !isAssignmentError &&
    hasValidMaxScore &&
    isEditScoreValid &&
    editFeedbackCheck.valid &&
    isEditDirty &&
    !gradeMutation.isPending &&
    !editNeedsReloadBeforeRetry;

  // --- Handlers: First-time grading ---
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setScoreInput(rawVal);
    if (saveBanner?.kind === 'error') {
      setSaveBanner(null);
    }

    if (rawVal.trim() === '') {
      setScoreError(null);
      return;
    }

    if (effectiveMaxScore !== null) {
      const check = validateGradeScore(rawVal, effectiveMaxScore);
      setScoreError(check.valid ? null : mapScoreErrorMessage(check.errorCode));
    }
  };

  const handleScoreBlur = () => {
    if (scoreInput.trim() === '') {
      setScoreError(null);
      return;
    }
    if (effectiveMaxScore !== null) {
      const check = validateGradeScore(scoreInput, effectiveMaxScore);
      setScoreError(check.valid ? null : mapScoreErrorMessage(check.errorCode));
    }
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setFeedbackInput(nextVal);
    if (saveBanner?.kind === 'error') {
      setSaveBanner(null);
    }
    const byteCheck = validateFeedbackUtf8Bytes(nextVal);
    if (!byteCheck.valid) {
      setFeedbackError(
        t('cards.grading.feedbackByteError', {
          bytes: byteCheck.bytes,
          maxBytes: byteCheck.maxBytes,
        })
      );
    } else {
      setFeedbackError(null);
    }
  };

  const handleReloadStatusBeforeRetry = async () => {
    setIsRetryingReload(true);
    try {
      const [subRes, gradeRes] = await Promise.all([
        refetchSubmission(),
        isAlreadyGraded ? refetchGrading() : Promise.resolve(null),
      ]);
      if (!subRes.error && subRes.data && (!gradeRes || !gradeRes.error)) {
        setNeedsReloadBeforeRetry(false);
        setSaveBanner(null);
        setEditNeedsReloadBeforeRetry(false);
        setEditSaveBanner(null);
      }
    } finally {
      setIsRetryingReload(false);
    }
  };

  const handleRetryReloadAfterSave = async () => {
    setIsRetryingReload(true);
    try {
      const subRes = await refetchSubmission();
      if (!subRes.error && subRes.data) {
        if (isSubmissionGraded(subRes.data)) {
          await refetchGrading();
        }
        setPostSaveReloadFailed(false);
      }
    } finally {
      setIsRetryingReload(false);
    }
  };

  const handleSaveGrade = async () => {
    if (isSubmittingRef.current || gradeMutation.isPending) return;
    if (!canManageSubmissions || !hasValidMaxScore || effectiveMaxScore === null) return;
    if (needsReloadBeforeRetry || isAlreadyGraded || postSaveReloadFailed) return;

    const check = validateGradeScore(scoreInput, effectiveMaxScore);
    if (!check.valid) {
      setScoreError(mapScoreErrorMessage(check.errorCode));
      return;
    }

    const byteCheck = validateFeedbackUtf8Bytes(feedbackInput);
    if (!byteCheck.valid) {
      setFeedbackError(
        t('cards.grading.feedbackByteError', {
          bytes: byteCheck.bytes,
          maxBytes: byteCheck.maxBytes,
        })
      );
      return;
    }

    setScoreError(null);
    setFeedbackError(null);
    setSaveBanner(null);
    isSubmittingRef.current = true;

    try {
      const hasNonEmptyFeedback = feedbackInput.trim().length > 0;
      await gradeMutation.mutateAsync({
        submissionId,
        payload: {
          score: check.numericValue,
          ...(hasNonEmptyFeedback ? { feedback: feedbackInput } : {}),
        },
      });

      // Mandatory authoritative reload of SubmissionDetail & GradingResponse after successful PATCH
      const reloadedSub = await refetchSubmission();
      if (reloadedSub.isError || reloadedSub.error || !reloadedSub.data) {
        setPostSaveReloadFailed(true);
        return;
      }

      if (isSubmissionGraded(reloadedSub.data)) {
        await refetchGrading();
      }
      setPostSaveReloadFailed(false);
      setNeedsReloadBeforeRetry(false);
    } catch (err: unknown) {
      const { status, serverMessage } = extractErrorMeta(err);

      if (status === 409) {
        setSaveBanner({
          kind: 'conflict',
          title: t('cards.grading.conflictTitle'),
          message: t('cards.grading.conflictDesc'),
        });
        setNeedsReloadBeforeRetry(true);
        void refetchSubmission();
        return;
      }

      if (isUncertainMutationError(err)) {
        setSaveBanner({
          kind: 'uncertain',
          title: t('cards.grading.uncertainTitle'),
          message: t('cards.grading.uncertainDesc'),
        });
        setNeedsReloadBeforeRetry(true);
        return;
      }

      if (status === 403) {
        setSaveBanner({
          kind: 'error',
          title: t('cards.grading.errorBanner.title'),
          message: t('cards.grading.forbiddenSaveDesc'),
        });
        return;
      }

      if (status === 404) {
        setSaveBanner({
          kind: 'error',
          title: t('cards.grading.errorBanner.title'),
          message: t('cards.grading.notFoundSaveDesc'),
        });
        return;
      }

      setSaveBanner({
        kind: 'error',
        title: t('cards.grading.errorBanner.title'),
        message: serverMessage || t('cards.grading.errorBanner.description'),
      });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // --- Handlers: Edit Grade mode ---
  const handleOpenEditGrade = () => {
    if (!modifyPermission.canEdit || isGradingMismatch || isGradingLoading) return;
    const savedScore = authoritativeScore;
    const savedFeedback = authoritativeFeedback;
    setEditOriginalScore(savedScore);
    setEditOriginalFeedback(savedFeedback);
    setEditScoreInput(savedScore !== null ? String(savedScore) : '');
    setEditFeedbackInput(savedFeedback ?? '');
    setEditScoreError(null);
    setEditFeedbackError(null);
    setEditSaveBanner(null);
    setEditNeedsReloadBeforeRetry(false);
    setIsEditingGrade(true);
  };

  const handleCancelEditGrade = () => {
    if (gradeMutation.isPending) return;
    setIsEditingGrade(false);
    setEditScoreError(null);
    setEditFeedbackError(null);
    setEditSaveBanner(null);
    setEditNeedsReloadBeforeRetry(false);
  };

  const handleEditScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setEditScoreInput(rawVal);
    if (editSaveBanner?.kind === 'error') {
      setEditSaveBanner(null);
    }

    if (effectiveMaxScore !== null) {
      const check = validateGradeScore(rawVal, effectiveMaxScore);
      setEditScoreError(check.valid ? null : mapScoreErrorMessage(check.errorCode));
    }
  };

  const handleEditFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setEditFeedbackInput(nextVal);
    if (editSaveBanner?.kind === 'error') {
      setEditSaveBanner(null);
    }
    const byteCheck = validateFeedbackUtf8Bytes(nextVal);
    if (!byteCheck.valid) {
      setEditFeedbackError(
        t('cards.grading.feedbackByteError', {
          bytes: byteCheck.bytes,
          maxBytes: byteCheck.maxBytes,
        })
      );
    } else {
      setEditFeedbackError(null);
    }
  };

  const handleSaveEditGrade = async () => {
    if (isSubmittingRef.current || gradeMutation.isPending) return;
    if (!canSaveEdit || effectiveMaxScore === null) return;

    const check = validateGradeScore(editScoreInput, effectiveMaxScore);
    if (!check.valid) {
      setEditScoreError(mapScoreErrorMessage(check.errorCode));
      return;
    }

    const byteCheck = validateFeedbackUtf8Bytes(editFeedbackInput);
    if (!byteCheck.valid) {
      setEditFeedbackError(
        t('cards.grading.feedbackByteError', {
          bytes: byteCheck.bytes,
          maxBytes: byteCheck.maxBytes,
        })
      );
      return;
    }

    setEditScoreError(null);
    setEditFeedbackError(null);
    setEditSaveBanner(null);
    isSubmittingRef.current = true;

    try {
      // Build exact PATCH payload:
      // - Always send score as JSON number
      // - Omit feedback if unchanged
      // - Send feedback: null if actively clearing existing feedback
      // - Send feedback string (preserving newlines) if updated to non-empty text
      const payload: { score: number; feedback?: string | null } = {
        score: check.numericValue,
      };
      if (isEditFeedbackChanged) {
        payload.feedback = normalizedEditNextFeedback === null ? null : editFeedbackInput;
      }

      await gradeMutation.mutateAsync({
        submissionId,
        payload,
      });

      // Reload BOTH SubmissionDetail and GradingResponse from server
      const [reloadedSub, reloadedGrading] = await Promise.all([
        refetchSubmission(),
        refetchGrading(),
      ]);

      if (
        reloadedSub.isError ||
        reloadedSub.error ||
        !reloadedSub.data ||
        reloadedGrading.isError ||
        reloadedGrading.error
      ) {
        setIsEditingGrade(false);
        setPostSaveReloadFailed(true);
        return;
      }

      setIsEditingGrade(false);
      setPostSaveReloadFailed(false);
      setEditNeedsReloadBeforeRetry(false);
    } catch (err: unknown) {
      const { status, serverMessage } = extractErrorMeta(err);

      if (status === 409) {
        setEditSaveBanner({
          kind: 'conflict',
          title: t('cards.grading.conflictTitle'),
          message: t('cards.grading.conflictDesc'),
        });
        setEditNeedsReloadBeforeRetry(true);
        void Promise.all([refetchSubmission(), refetchGrading()]);
        return;
      }

      if (isUncertainMutationError(err)) {
        setEditSaveBanner({
          kind: 'uncertain',
          title: t('cards.grading.uncertainTitle'),
          message: t('cards.grading.uncertainDesc'),
        });
        setEditNeedsReloadBeforeRetry(true);
        return;
      }

      if (status === 403) {
        setEditSaveBanner({
          kind: 'error',
          title: t('cards.grading.errorBanner.title'),
          message: t('cards.grading.forbiddenSaveDesc'),
        });
        return;
      }

      if (status === 404) {
        setEditSaveBanner({
          kind: 'error',
          title: t('cards.grading.errorBanner.title'),
          message: t('cards.grading.notFoundSaveDesc'),
        });
        return;
      }

      setEditSaveBanner({
        kind: 'error',
        title: t('cards.grading.errorBanner.title'),
        message: serverMessage || t('cards.grading.errorBanner.description'),
      });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // --- Handlers: Delete Grading ---
  const handleOpenDeleteModal = () => {
    if (!modifyPermission.canDelete || !gradingData?.id || isGradingMismatch) return;
    setDeleteErrorTitle(null);
    setDeleteErrorMessage(null);
    setDeleteNeedsReload(false);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleteGradingMutation.isPending) return;
    setIsDeleteModalOpen(false);
    setDeleteErrorTitle(null);
    setDeleteErrorMessage(null);
    setDeleteNeedsReload(false);
  };

  const handleReloadAfterUncertainDelete = async () => {
    setIsRetryingReload(true);
    try {
      const [subRes] = await Promise.all([refetchSubmission(), refetchGrading()]);
      if (!subRes.error && subRes.data) {
        setDeleteNeedsReload(false);
        setDeleteErrorTitle(null);
        setDeleteErrorMessage(null);
        if (!isSubmissionGraded(subRes.data)) {
          setIsDeleteModalOpen(false);
          setIsEditingGrade(false);
        }
      }
    } finally {
      setIsRetryingReload(false);
    }
  };

  const handleConfirmDeleteGrading = async () => {
    if (isDeletingRef.current || deleteGradingMutation.isPending) return;
    const gradingId = gradingData?.id?.trim();
    if (!modifyPermission.canDelete || !gradingId) return;

    setDeleteErrorTitle(null);
    setDeleteErrorMessage(null);
    isDeletingRef.current = true;

    try {
      // Strictly call DELETE /api/v1/gradings/{gradingId} (never DELETE /submissions/{id})
      await deleteGradingMutation.mutateAsync({
        gradingId,
        submissionId,
      });

      // Reload authoritative SubmissionDetail & GradingResponse (404 on GET grading is expected -> null)
      const [subRes] = await Promise.all([refetchSubmission(), refetchGrading()]);

      setIsDeleteModalOpen(false);
      setIsEditingGrade(false);
      // Reset blank first-time grading form so teacher can re-grade cleanly
      setScoreInput('');
      setFeedbackInput('');
      setScoreError(null);
      setFeedbackError(null);
      setSaveBanner(null);
      setNeedsReloadBeforeRetry(false);

      if (subRes.error || !subRes.data) {
        setPostSaveReloadFailed(true);
      }
    } catch (err: unknown) {
      const { status, serverMessage } = extractErrorMeta(err);

      if (isUncertainMutationError(err)) {
        setDeleteErrorTitle(t('cards.grading.deleteModal.uncertainTitle'));
        setDeleteErrorMessage(t('cards.grading.deleteModal.uncertainDesc'));
        setDeleteNeedsReload(true);
        return;
      }

      if (status === 403) {
        setDeleteErrorTitle(t('cards.grading.deleteModal.errorTitle'));
        setDeleteErrorMessage(t('cards.grading.deleteModal.forbiddenDesc'));
        return;
      }

      if (status === 404) {
        setDeleteErrorTitle(t('cards.grading.deleteModal.errorTitle'));
        setDeleteErrorMessage(t('cards.grading.deleteModal.notFoundDesc'));
        setDeleteNeedsReload(true);
        return;
      }

      setDeleteErrorTitle(t('cards.grading.deleteModal.errorTitle'));
      setDeleteErrorMessage(serverMessage || t('cards.grading.deleteModal.errorFallback'));
    } finally {
      isDeletingRef.current = false;
    }
  };

  // Cancel: zero API write, zero DELETE; return to submissions list preserving filters/page
  const handleCancel = () => {
    router.push(submissionsListHref);
  };

  const gradedAtFormatted = authoritativeGradedAt
    ? formatSubmissionTime(authoritativeGradedAt).formatted
    : null;

  const currentScoreModalDisplay =
    authoritativeScore !== null
      ? hasValidMaxScore
        ? `${formatScore(authoritativeScore, locale)} / ${formattedMaxScore}`
        : formatScore(authoritativeScore, locale)
      : t('unavailable');

  return (
    <div className="min-h-screen bg-[#F6FAFE] dark:bg-slate-950 text-[#171C1F] dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Original Application Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        workspaceMode="faculty"
      />

      {/* 2. Original Application Header */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode((prev) => !prev)}
        userFullName={userFullName}
        workspaceMode="faculty"
      />

      {/* 3. Main Workspace Container */}
      <main
        className={`flex-1 min-w-0 transition-all duration-300 pt-20 pb-20 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 ${
          isFocusMode || isSidebarCollapsed ? 'pl-24' : 'lg:pl-[284px]'
        }`}
      >
        <div className="w-full max-w-[1040px] mx-auto space-y-6 min-w-0">
          {/* Explicit Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 min-w-0 flex-wrap">
              <Link
                href="/classes"
                className="hover:text-[#0059BB] dark:hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors shrink-0"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[17px]">
                  arrow_back
                </span>
                <span>{tClass('backToClasses')}</span>
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <Link
                href={`/classes/${classId}?tab=assignments`}
                className="hover:text-[#0059BB] dark:hover:text-blue-400 font-semibold truncate flex items-center gap-1.5 transition-colors max-w-[220px]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{classTitle}</span>
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <Link
                href={submissionsListHref}
                className="hover:text-[#0059BB] dark:hover:text-blue-400 font-semibold truncate max-w-[260px] transition-colors"
              >
                {assignmentTitle || tSub('title')}
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span
                aria-current="page"
                className="font-bold text-slate-900 dark:text-slate-100 shrink-0"
              >
                {t('pageTitle')}
              </span>
            </div>
          </nav>

          {/* State: Verifying Permission or Initial Submission Loading */}
          {isVerifyingPermission ||
          (canManageSubmissions && isSubmissionLoading && !submissionData) ? (
            <div data-submission-detail-loading="true" className="space-y-6 animate-pulse">
              <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div className="h-72 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="lg:col-span-4">
                  <div className="h-80 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              {isVerifyingPermission && (
                <p className="sr-only">{t('verifyingPermission')}</p>
              )}
            </div>
          ) : isForbidden ? (
            /* State: 403 / Unauthorized inside App Shell */
            <section
              data-submission-detail-forbidden="true"
              className="bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200 dark:border-amber-900/60 p-10 text-center space-y-4 shadow-xs"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <span aria-hidden="true" className="material-symbols-outlined text-[28px]">
                  lock
                </span>
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-lg font-bold text-[#171C1F] dark:text-slate-100">
                  {t('forbiddenTitle')}
                </h1>
                <p className="text-sm text-[#44474D] dark:text-slate-400 max-w-md mx-auto">
                  {t('forbiddenDesc')}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={`/classes/${classId}?tab=assignments`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0059BB] hover:bg-[#004493] text-white text-xs font-semibold transition-colors"
                >
                  {tClass('backToClasses')}
                </Link>
              </div>
            </section>
          ) : isSubmissionAssignmentMismatch || isAssignmentClassMismatch ? (
            /* State: Submission / Assignment / Class mismatch */
            <section
              data-submission-detail-mismatch="true"
              className="bg-white dark:bg-slate-900 rounded-xl border-2 border-rose-200 dark:border-rose-900/60 p-10 text-center space-y-4 shadow-xs"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                <span aria-hidden="true" className="material-symbols-outlined text-[28px]">
                  link_off
                </span>
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-lg font-bold text-[#171C1F] dark:text-slate-100">
                  {t('mismatchTitle')}
                </h1>
                <p className="text-sm text-[#44474D] dark:text-slate-400 max-w-md mx-auto">
                  {t('mismatchDesc')}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={submissionsListHref}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0059BB] hover:bg-[#004493] text-white text-xs font-semibold transition-colors"
                >
                  {t('returnToSubmissions')}
                </Link>
              </div>
            </section>
          ) : isNotFound ? (
            /* State: 404 Submission or Assignment not found */
            <section
              data-submission-detail-not-found="true"
              className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-10 text-center space-y-4 shadow-xs"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mx-auto flex items-center justify-center">
                <span aria-hidden="true" className="material-symbols-outlined text-[28px]">
                  search_off
                </span>
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-lg font-bold text-[#171C1F] dark:text-slate-100">
                  {t('notFoundTitle')}
                </h1>
                <p className="text-sm text-[#44474D] dark:text-slate-400 max-w-md mx-auto">
                  {t('notFoundDesc')}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={submissionsListHref}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0059BB] hover:bg-[#004493] text-white text-xs font-semibold transition-colors"
                >
                  {t('returnToSubmissions')}
                </Link>
              </div>
            </section>
          ) : !submissionData || (!postSaveReloadFailed && isSubmissionError) ? (
            /* State: Generic Load Error inside App Shell */
            <section
              data-submission-detail-error="true"
              className="bg-white dark:bg-slate-900 rounded-xl border-2 border-rose-200 dark:border-rose-900/60 p-10 text-center space-y-4 shadow-xs"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                <span aria-hidden="true" className="material-symbols-outlined text-[28px]">
                  error
                </span>
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-lg font-bold text-[#171C1F] dark:text-slate-100">
                  {t('loadErrorTitle')}
                </h1>
                <p className="text-sm text-[#44474D] dark:text-slate-400 max-w-md mx-auto">
                  {submissionErrMeta.serverMessage || t('loadErrorDesc')}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void refetchSubmission();
                    void refetchAssignment();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0059BB] hover:bg-[#004493] text-white text-xs font-semibold transition-colors"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                    refresh
                  </span>
                  <span>{t('retryLoadBtn')}</span>
                </button>
                <Link
                  href={submissionsListHref}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  {t('returnToSubmissions')}
                </Link>
              </div>
            </section>
          ) : (
            <>
              {/* HERO NAVY BANNER — Synced with Danh sách bài nộp */}
              <section
                data-submission-detail-hero="navy"
                className="rounded-2xl p-6 text-white border-2 border-slate-800 shadow-sm min-w-0"
                style={{ background: 'linear-gradient(to right, #0D1C32, #122C54)' }}
              >
                {heroContextParts.length > 0 && (
                  <div className="text-xs font-semibold tracking-wider text-[#7DD3FC] uppercase truncate">
                    {heroContextParts.join(' • ')}
                  </div>
                )}

                <h1 className="font-display text-3xl sm:text-[36px] sm:leading-[44px] font-bold text-white tracking-tight mt-2">
                  {t('pageTitle')}
                </h1>

                {isAssignmentLoading ? (
                  <div className="h-5 w-72 max-w-full bg-white/15 rounded mt-2 animate-pulse" />
                ) : assignmentTitle ? (
                  <p className="text-slate-300 text-sm mt-1 font-medium break-words">
                    {assignmentTitle}
                  </p>
                ) : null}

                <div className="border-t border-white/10 my-4" />

                {/* 3 Metadata Clusters: Hạn nộp / Điểm tối đa / Nộp muộn */}
                <div
                  data-hero-metadata-grid="3-col"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  {/* 1. Hạn nộp */}
                  <div className="flex items-center gap-3 p-1.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-[18px] text-[#7DD3FC]"
                      >
                        event
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-300 font-medium">
                        {t('hero.dueDateLabel')}
                      </div>
                      <div
                        data-hero-due-date="true"
                        className="text-sm font-semibold text-white mt-0.5 whitespace-nowrap"
                      >
                        {isAssignmentLoading || isAssignmentError
                          ? t('unavailable')
                          : dueInfo.isNoDeadline
                            ? t('hero.noDeadline')
                            : dueInfo.label}
                      </div>
                    </div>
                  </div>

                  {/* 2. Điểm tối đa */}
                  <div className="flex items-center gap-3 p-1.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-[18px] text-[#7DD3FC]"
                      >
                        military_tech
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-300 font-medium">
                        {t('hero.maxScoreLabel')}
                      </div>
                      <div
                        data-hero-max-score="true"
                        className="text-sm font-semibold text-white mt-0.5 whitespace-nowrap"
                      >
                        {isAssignmentLoading || !hasValidMaxScore
                          ? t('unavailable')
                          : `${formattedMaxScore} ${t('hero.pointsUnit')}`}
                      </div>
                    </div>
                  </div>

                  {/* 3. Nộp muộn */}
                  <div className="flex items-center gap-3 p-1.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-[18px] text-[#7DD3FC]"
                      >
                        schedule
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-300 font-medium">
                        {t('hero.latePolicyLabel')}
                      </div>
                      <div className="mt-0.5">
                        {isAssignmentLoading || isAssignmentError ? (
                          <span className="text-sm font-semibold text-slate-300">
                            {t('unavailable')}
                          </span>
                        ) : dueInfo.isNoDeadline ? (
                          <span
                            data-hero-late-policy="not-applicable"
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-slate-200 border border-white/15 whitespace-nowrap"
                          >
                            {t('hero.lateNotApplicable')}
                          </span>
                        ) : allowLatePolicy === true ? (
                          <span
                            data-hero-late-policy="allowed"
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 whitespace-nowrap"
                          >
                            {t('hero.lateAllowed')}
                          </span>
                        ) : allowLatePolicy === false ? (
                          <span
                            data-hero-late-policy="not-allowed"
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/30 whitespace-nowrap"
                          >
                            {t('hero.lateNotAllowed')}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-slate-300">
                            {t('unavailable')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2-COLUMN WORKSPACE (8:4, 24px below Hero) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
                {/* ================= LEFT COLUMN (8 cols) ================= */}
                <div className="lg:col-span-8 min-w-0 space-y-6">
                  {/* Card 1: Student & Submitted Work */}
                  <section
                    data-student-submission-card="true"
                    className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#E0E3E8] dark:border-slate-700 p-6 shadow-xs space-y-5 min-w-0"
                  >
                    {/* Student Header & Independent Status Badges */}
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {studentAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={studentAvatarUrl}
                            alt={studentDisplayName}
                            className="w-11 h-11 rounded-full object-cover border border-blue-200 dark:border-blue-800 shrink-0"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#0059BB] dark:text-blue-300 font-display font-bold text-[16px] flex items-center justify-center shrink-0"
                          >
                            {getStudentInitial(submissionData.studentName)}
                          </div>
                        )}
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h2
                            data-student-name="true"
                            className="text-[17px] font-display font-bold text-[#171C1F] dark:text-slate-100 break-words leading-snug"
                          >
                            {studentDisplayName}
                          </h2>
                          {studentIdentifier && (
                            <div
                              data-student-identifier="true"
                              className="text-[11.5px] font-mono text-slate-500 dark:text-slate-400 select-all leading-tight break-all"
                            >
                              {t('cards.studentWork.studentCodeLabel')}{' '}
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {studentIdentifier}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Badges: Grading status + independent Timeliness */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {isAlreadyGraded ? (
                          <span
                            data-grading-badge="graded"
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap"
                          >
                            {t('cards.studentWork.statusGraded')}
                          </span>
                        ) : (
                          <span
                            data-grading-badge="ungraded"
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap"
                          >
                            {t('cards.studentWork.statusPending')}
                          </span>
                        )}

                        {isSubmissionLate ? (
                          <span
                            data-timeliness-badge="late"
                            className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap"
                          >
                            {t('cards.studentWork.late')}
                          </span>
                        ) : isSubmissionOnTime ? (
                          <span
                            data-timeliness-badge="on-time"
                            className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap"
                          >
                            {t('cards.studentWork.onTime')}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Metadata Bar: Submitted At + Submission Attempt */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-slate-600 dark:text-slate-300 bg-[#F6FAFE] dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined text-[16px] text-slate-400 shrink-0"
                        >
                          schedule
                        </span>
                        <span>
                          {t('cards.studentWork.submittedTime')}{' '}
                          <strong
                            data-submitted-at="true"
                            className="text-slate-800 dark:text-slate-100 font-medium"
                          >
                            {submittedAtFormatted || t('unavailable')}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 shrink-0">
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined text-[16px] text-slate-400 shrink-0"
                        >
                          history
                        </span>
                        <span>
                          {t('cards.studentWork.attemptLabel')}{' '}
                          <strong
                            data-submission-attempt="true"
                            className="text-slate-800 dark:text-slate-100 font-medium"
                          >
                            {submissionAttemptValue !== null
                              ? submissionAttemptValue
                              : t('unavailable')}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Submitted Content (Read-Only, newline-preserving, safe URL wrapping, zero raw HTML) */}
                    <div className="space-y-2 min-w-0">
                      <div className="block text-[13px] font-display font-semibold text-slate-800 dark:text-slate-200">
                        {t('cards.studentWork.contentLabel')}
                      </div>
                      <div
                        data-submission-content="true"
                        className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-[13.5px] leading-relaxed text-slate-800 dark:text-slate-200 font-sans select-text shadow-2xs min-w-0"
                      >
                        {submissionData.content && submissionData.content.trim().length > 0 ? (
                          <SafeFormattedText text={submissionData.content} />
                        ) : (
                          <p className="text-slate-400 dark:text-slate-500 italic">
                            {t('cards.studentWork.noContent')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Real Attachments only (never fabricate sample docs) */}
                    {safeAttachments.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="block text-[13px] font-display font-semibold text-slate-800 dark:text-slate-200">
                          {t('cards.studentWork.attachmentsLabel')}
                        </div>
                        <div className="space-y-2">
                          {safeAttachments.map((url, idx) => (
                            <a
                              key={`${url}-${idx}`}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors text-xs text-[#0059BB] dark:text-blue-400 font-medium min-w-0"
                            >
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[18px] shrink-0"
                              >
                                attach_file
                              </span>
                              <span className="truncate">
                                {url.split('/').pop() || url}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Card 2: Accordion "Xem yêu cầu đề bài" (Collapsed by default) */}
                  <section
                    id="assignment-specs-card"
                    data-assignment-specs-accordion="true"
                    className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#E0E3E8] dark:border-slate-700 shadow-xs overflow-hidden min-w-0"
                  >
                    <button
                      id="btn-toggle-assignment-specs"
                      type="button"
                      aria-expanded={isSpecsOpen}
                      aria-controls="assignment-specs-panel"
                      onClick={() => setIsSpecsOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0059BB]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-300 flex items-center justify-center shrink-0">
                          <span
                            aria-hidden="true"
                            className="material-symbols-outlined text-[18px]"
                          >
                            description
                          </span>
                        </div>
                        <span className="text-[15px] font-display font-bold text-[#171C1F] dark:text-slate-100 truncate">
                          {t('cards.assignmentSpecs.title')}
                        </span>
                      </div>
                      <span
                        aria-hidden="true"
                        className={`material-symbols-outlined text-[20px] text-slate-400 shrink-0 transition-transform duration-200 ${
                          isSpecsOpen ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {isSpecsOpen && (
                      <div
                        id="assignment-specs-panel"
                        role="region"
                        aria-labelledby="btn-toggle-assignment-specs"
                        className="px-6 pb-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 min-w-0"
                      >
                        {assignmentDescription ? (
                          <div
                            id="assignment-specs-description"
                            className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans select-text"
                          >
                            <SafeFormattedText text={assignmentDescription} />
                          </div>
                        ) : (
                          <p
                            id="assignment-specs-empty"
                            className="text-[13px] text-slate-500 dark:text-slate-400 italic"
                          >
                            {t('cards.assignmentSpecs.noDescription')}
                          </p>
                        )}

                        {assignmentAttachmentUrl && (
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              {t('cards.assignmentSpecs.attachmentLabel')}
                            </div>
                            <a
                              href={assignmentAttachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-[#0059BB] dark:text-blue-400 max-w-full"
                            >
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[16px] shrink-0"
                              >
                                attach_file
                              </span>
                              <span className="truncate">
                                {assignmentAttachmentUrl.split('/').pop() ||
                                  assignmentAttachmentUrl}
                              </span>
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                </div>

                {/* ================= RIGHT COLUMN: GRADING / RESULT PANEL (4 cols) ================= */}
                <aside className="lg:col-span-4 min-w-0">
                  <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                    <section
                      data-grading-panel="true"
                      className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#E0E3E8] dark:border-slate-700 p-5 shadow-xs space-y-5"
                    >
                      {/* Panel Header */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            aria-hidden="true"
                            className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 text-[20px] shrink-0"
                          >
                            {isEditingGrade ? 'edit_note' : 'grading'}
                          </span>
                          <h2 className="text-[16px] font-display font-bold text-[#171C1F] dark:text-slate-100 truncate">
                            {isEditingGrade
                              ? t('cards.grading.editTitle')
                              : isAlreadyGraded
                                ? t('cards.grading.resultTitle')
                                : t('cards.grading.title')}
                          </h2>
                        </div>

                        {isEditingGrade ? (
                          <span
                            id="grading-status-badge"
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap shrink-0"
                          >
                            {t('cards.grading.editModeBadge')}
                          </span>
                        ) : isAlreadyGraded || postSaveReloadFailed ? (
                          <span
                            id="grading-status-badge"
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{t('cards.grading.statusGraded')}</span>
                          </span>
                        ) : (
                          <span
                            id="grading-status-badge"
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap shrink-0"
                          >
                            {t('cards.grading.statusUngraded')}
                          </span>
                        )}
                      </div>

                      {/* STATE 1: PATCH succeeded, but reloading latest details failed */}
                      {postSaveReloadFailed ? (
                        <div data-post-save-reload-error="true" className="space-y-4">
                          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[17px] text-amber-600 dark:text-amber-400 shrink-0"
                              >
                                check_circle
                              </span>
                              <span>{t('cards.grading.savedReloadFailedTitle')}</span>
                            </div>
                            <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                              {t('cards.grading.savedReloadFailedDesc')}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              id="btn-retry-reload-result"
                              type="button"
                              disabled={isRetryingReload}
                              onClick={handleRetryReloadAfterSave}
                              className="w-full bg-[#0059BB] hover:bg-[#004493] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <span
                                aria-hidden="true"
                                className={`material-symbols-outlined text-[17px] ${
                                  isRetryingReload ? 'animate-spin' : ''
                                }`}
                              >
                                refresh
                              </span>
                              <span>{t('cards.grading.retryReloadResultBtn')}</span>
                            </button>
                            <button
                              id="btn-cancel"
                              type="button"
                              onClick={handleCancel}
                              className="w-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
                            >
                              {t('returnToSubmissions')}
                            </button>
                          </div>
                        </div>
                      ) : isAlreadyGraded && isEditingGrade ? (
                        /* STATE 2A: In-Place Edit Grade Mode (for authorized grader / Admin) */
                        <div data-grading-edit-form="true" className="space-y-4">
                          {/* Score Input */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <label
                                htmlFor="edit-input-score"
                                className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap"
                              >
                                {t('cards.grading.scoreLabel')}{' '}
                                <span className="text-rose-600">
                                  {t('cards.grading.scoreRequired')}
                                </span>
                              </label>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                                {hasValidMaxScore
                                  ? t('cards.grading.scaleLabel', {
                                      maxScore: formattedMaxScore,
                                    })
                                  : t('cards.grading.scaleUnavailable')}
                              </span>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                id="edit-input-score"
                                value={editScoreInput}
                                onChange={handleEditScoreChange}
                                aria-invalid={Boolean(editScoreError)}
                                aria-describedby={
                                  editScoreError ? 'edit-score-error' : 'edit-score-guide'
                                }
                                disabled={
                                  gradeMutation.isPending ||
                                  !hasValidMaxScore ||
                                  isAssignmentError
                                }
                                placeholder={t('cards.grading.scorePlaceholder')}
                                className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border rounded-xl text-[14px] font-mono font-medium outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-24 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                                  editScoreError
                                    ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                    : isEditScoreValid
                                      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                      : 'border-slate-300 dark:border-slate-700 focus:border-[#0059BB] focus:ring-1 focus:ring-[#0059BB]'
                                }`}
                              />
                              {hasValidMaxScore && (
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12.5px] font-mono font-semibold text-slate-400 pointer-events-none whitespace-nowrap">
                                  {t('cards.grading.scoreSuffix', {
                                    maxScore: formattedMaxScore,
                                  })}
                                </div>
                              )}
                            </div>

                            {editScoreError ? (
                              <div
                                id="edit-score-error"
                                role="alert"
                                className="text-[11.5px] text-rose-600 dark:text-rose-400 font-medium flex items-start gap-1"
                              >
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[14px] shrink-0 mt-0.5"
                                >
                                  error
                                </span>
                                <span id="edit-score-error-text">{editScoreError}</span>
                              </div>
                            ) : (
                              <p
                                id="edit-score-guide"
                                className="text-[11.5px] text-slate-500 dark:text-slate-400"
                              >
                                {hasValidMaxScore && effectiveMaxScore !== null
                                  ? t('cards.grading.scoreGuide', {
                                      maxScore: formatScore(effectiveMaxScore, locale),
                                    })
                                  : t('cards.grading.scoreGuideUnavailable')}
                              </p>
                            )}
                          </div>

                          {/* Feedback Textarea (Optional, preserves newlines, no arbitrary char cap) */}
                          <div className="space-y-1.5">
                            <label
                              htmlFor="edit-input-feedback"
                              className="block text-[13px] font-semibold text-slate-800 dark:text-slate-200"
                            >
                              {t('cards.grading.feedbackLabel')}{' '}
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                                {t('cards.grading.feedbackOptional')}
                              </span>
                            </label>
                            <textarea
                              id="edit-input-feedback"
                              rows={4}
                              value={editFeedbackInput}
                              onChange={handleEditFeedbackChange}
                              aria-invalid={Boolean(editFeedbackError)}
                              aria-describedby={
                                editFeedbackError ? 'edit-feedback-error' : undefined
                              }
                              disabled={gradeMutation.isPending}
                              placeholder={t('cards.grading.feedbackPlaceholder')}
                              className={`w-full p-3 bg-white dark:bg-slate-950 border rounded-xl text-[13.5px] leading-relaxed outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-y disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                                editFeedbackError
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#0059BB] focus:ring-1 focus:ring-[#0059BB]'
                              }`}
                            />
                            {editFeedbackError && (
                              <div
                                id="edit-feedback-error"
                                role="alert"
                                className="text-[11.5px] text-rose-600 dark:text-rose-400 font-medium flex items-start gap-1"
                              >
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[14px] shrink-0 mt-0.5"
                                >
                                  error
                                </span>
                                <span>{editFeedbackError}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Row: Cancel + Save Changes */}
                          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              id="btn-cancel-edit"
                              type="button"
                              disabled={gradeMutation.isPending}
                              onClick={handleCancelEditGrade}
                              className="flex-1 h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 font-semibold text-[13px] rounded-xl transition-colors flex items-center justify-center whitespace-nowrap"
                            >
                              {t('cards.grading.cancelButton')}
                            </button>
                            <button
                              id="btn-save-edit"
                              type="button"
                              disabled={!canSaveEdit}
                              onClick={handleSaveEditGrade}
                              className="flex-1 h-10 px-4 bg-[#0059BB] hover:bg-[#004493] disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-semibold text-[13px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              {gradeMutation.isPending ? (
                                <>
                                  <span
                                    aria-hidden="true"
                                    className="material-symbols-outlined text-[17px] animate-spin shrink-0"
                                  >
                                    progress_activity
                                  </span>
                                  <span id="btn-save-edit-text">
                                    {t('cards.grading.savingChangesButton')}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span
                                    aria-hidden="true"
                                    className="material-symbols-outlined text-[17px] shrink-0"
                                  >
                                    check
                                  </span>
                                  <span id="btn-save-edit-text">
                                    {t('cards.grading.saveChangesButton')}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Edit Error / Conflict / Uncertain Banner */}
                          {editSaveBanner && (
                            <div
                              id="edit-save-error-banner"
                              role="alert"
                              data-banner-kind={editSaveBanner.kind}
                              className={`p-3 rounded-xl border text-[12px] space-y-2 ${
                                editSaveBanner.kind === 'error'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-semibold">
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[16px] shrink-0"
                                >
                                  {editSaveBanner.kind === 'error'
                                    ? 'warning'
                                    : 'sync_problem'}
                                </span>
                                <span>{editSaveBanner.title}</span>
                              </div>
                              <p className="leading-normal">{editSaveBanner.message}</p>
                              {editNeedsReloadBeforeRetry && (
                                <button
                                  id="btn-edit-reload-status"
                                  type="button"
                                  disabled={isRetryingReload}
                                  onClick={handleReloadStatusBeforeRetry}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`material-symbols-outlined text-[15px] ${
                                      isRetryingReload ? 'animate-spin' : ''
                                    }`}
                                  >
                                    refresh
                                  </span>
                                  <span>{t('cards.grading.reloadStatusBtn')}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : isAlreadyGraded ? (
                        /* STATE 2B: Authoritative Graded View Mode (Stitch 6e53a5f64ecf4582ab8369d573172ab0) */
                        <div data-graded-result-panel="true" className="space-y-4">
                          {/* Score Display Block */}
                          <div className="bg-[#F6FAFE] dark:bg-blue-950/30 border-2 border-blue-200/70 dark:border-blue-800/70 rounded-xl p-4 text-center space-y-1">
                            <span className="text-[11px] font-bold font-display uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                              {t('cards.grading.gradedScoreLabel')}
                            </span>
                            <div
                              data-graded-score-value="true"
                              className="flex items-baseline justify-center gap-1.5"
                            >
                              <span className="text-[36px] font-extrabold font-display text-[#0059BB] dark:text-blue-400 leading-none tracking-tight">
                                {authoritativeScore !== null
                                  ? formatScore(authoritativeScore, locale)
                                  : t('unavailable')}
                              </span>
                              {hasValidMaxScore && (
                                <span className="text-[15px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                  / {formattedMaxScore} {t('hero.pointsUnit')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Optional Read-Only Grading Metrics (correctAnswersCount / scaledScore — preserves 0) */}
                          {(correctAnswersCount !== null || scaledScore !== null) && (
                            <div
                              data-grading-extra-metrics="true"
                              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 space-y-1.5 text-[12.5px]"
                            >
                              {correctAnswersCount !== null && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    {t('cards.grading.correctAnswersLabel')}
                                  </span>
                                  <span
                                    data-grading-correct-answers="true"
                                    className="font-mono font-semibold text-slate-800 dark:text-slate-200"
                                  >
                                    {correctAnswersCount}
                                  </span>
                                </div>
                              )}
                              {scaledScore !== null && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    {t('cards.grading.scaledScoreLabel')}
                                  </span>
                                  <span
                                    data-grading-scaled-score="true"
                                    className="font-mono font-semibold text-slate-800 dark:text-slate-200"
                                  >
                                    {formatScore(scaledScore, locale)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Authoritative Server Grader & Graded Time */}
                          <div className="space-y-2.5 text-[12.5px] text-slate-600 dark:text-slate-400">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-slate-500 dark:text-slate-400 shrink-0">
                                {t('cards.grading.gradedByLabel')}
                              </span>
                              <span
                                data-graded-by-name="true"
                                className="font-semibold text-slate-800 dark:text-slate-200 text-right break-words"
                              >
                                {authoritativeGraderName || t('unavailable')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-500 dark:text-slate-400 shrink-0">
                                {t('cards.grading.gradedAtLabel')}
                              </span>
                              <span
                                data-graded-at-time="true"
                                className="font-medium text-slate-800 dark:text-slate-200 text-right whitespace-nowrap"
                              >
                                {gradedAtFormatted || t('unavailable')}
                              </span>
                            </div>
                          </div>

                          {/* Feedback Quote Box */}
                          <div className="space-y-1.5">
                            <div className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                              {t('cards.grading.gradedFeedbackLabel')}
                            </div>
                            <div
                              data-graded-feedback-value="true"
                              className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200"
                            >
                              {authoritativeFeedback &&
                              authoritativeFeedback.trim().length > 0 ? (
                                <SafeFormattedText text={authoritativeFeedback} />
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 italic">
                                  {t('cards.grading.noFeedback')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Grading Load Error Banner (never treat error as ungraded) */}
                          {isGradingError && (
                            <div
                              data-grading-load-error="true"
                              role="alert"
                              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-2"
                            >
                              <div className="flex items-center gap-1.5 font-semibold">
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[16px] shrink-0"
                                >
                                  error
                                </span>
                                <span>{t('cards.grading.gradingLoadErrorTitle')}</span>
                              </div>
                              <p className="leading-relaxed">
                                {t('cards.grading.gradingLoadErrorDesc')}
                              </p>
                              <button
                                id="btn-reload-grading"
                                type="button"
                                onClick={() => void refetchGrading()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
                              >
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[15px]"
                                >
                                  refresh
                                </span>
                                <span>{t('cards.grading.reloadGradingBtn')}</span>
                              </button>
                            </div>
                          )}

                          {/* Submission vs Grading Mismatch Banner */}
                          {isGradingMismatch && (
                            <div
                              data-grading-mismatch-warning="true"
                              role="alert"
                              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2"
                            >
                              <div className="flex items-center gap-1.5 font-semibold">
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[16px] shrink-0"
                                >
                                  sync_problem
                                </span>
                                <span>{t('cards.grading.gradingMismatchTitle')}</span>
                              </div>
                              <p className="leading-relaxed">
                                {t('cards.grading.gradingMismatchDesc')}
                              </p>
                              <button
                                id="btn-resync-grading"
                                type="button"
                                onClick={() => {
                                  void refetchSubmission();
                                  void refetchGrading();
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors"
                              >
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[15px]"
                                >
                                  refresh
                                </span>
                                <span>{t('cards.grading.reloadStatusBtn')}</span>
                              </button>
                            </div>
                          )}

                          {/* Action Buttons governed strictly by evaluateCanModifyGrading */}
                          {isGradingLoading ? (
                            <div
                              data-verifying-grading-permission="true"
                              className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2"
                            >
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[16px] animate-spin"
                              >
                                progress_activity
                              </span>
                              <span>{t('cards.grading.verifyingGradingPermission')}</span>
                            </div>
                          ) : modifyPermission.canEdit || modifyPermission.canDelete ? (
                            <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                              {modifyPermission.canEdit && (
                                <button
                                  id="btn-open-edit-grade"
                                  type="button"
                                  disabled={isGradingMismatch || !hasValidMaxScore}
                                  onClick={handleOpenEditGrade}
                                  className="w-full py-2.5 px-4 bg-[#0059BB] hover:bg-[#004493] disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-semibold text-[13.5px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="material-symbols-outlined text-[17px]"
                                  >
                                    edit
                                  </span>
                                  <span>{t('cards.grading.editButton')}</span>
                                </button>
                              )}

                              {modifyPermission.canDelete && (
                                <button
                                  id="btn-delete-grade"
                                  type="button"
                                  disabled={isGradingMismatch || !gradingData?.id}
                                  onClick={handleOpenDeleteModal}
                                  className="w-full py-2.5 px-4 rounded-xl border-2 border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 disabled:cursor-not-allowed text-rose-600 dark:text-rose-400 font-semibold text-[13.5px] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="material-symbols-outlined text-[18px]"
                                  >
                                    delete
                                  </span>
                                  <span>{t('cards.grading.deleteButton')}</span>
                                </button>
                              )}
                            </div>
                          ) : !isGradingError && !isGradingMismatch ? (
                            <div
                              data-grading-readonly-notice="true"
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[12px] text-slate-600 dark:text-slate-400 flex items-start gap-2"
                            >
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[16px] text-slate-400 shrink-0 mt-0.5"
                              >
                                info
                              </span>
                              <span className="leading-relaxed">
                                {t('cards.grading.gradedReadOnlyHint')}
                              </span>
                            </div>
                          ) : null}

                          {/* Explicit navigation back to Submissions List preserving filters/page */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              id="btn-cancel"
                              type="button"
                              onClick={handleCancel}
                              className="w-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-xl font-medium text-[13px] transition-colors text-center whitespace-nowrap"
                            >
                              {t('returnToSubmissions')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* STATE 3: First-time Grading Form (Ungraded) */
                        <div data-grading-form="true" className="space-y-5">
                          {/* Score Input Group */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <label
                                htmlFor="input-score"
                                className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap"
                              >
                                {t('cards.grading.scoreLabel')}{' '}
                                <span className="text-rose-600">
                                  {t('cards.grading.scoreRequired')}
                                </span>
                              </label>
                              <span
                                data-score-scale="true"
                                className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0"
                              >
                                {hasValidMaxScore
                                  ? t('cards.grading.scaleLabel', {
                                      maxScore: formattedMaxScore,
                                    })
                                  : t('cards.grading.scaleUnavailable')}
                              </span>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                id="input-score"
                                value={scoreInput}
                                onChange={handleScoreChange}
                                onBlur={handleScoreBlur}
                                aria-invalid={Boolean(scoreError)}
                                aria-describedby={scoreError ? 'score-error' : 'score-guide'}
                                disabled={
                                  gradeMutation.isPending ||
                                  !hasValidMaxScore ||
                                  !canManageSubmissions ||
                                  isAssignmentError
                                }
                                placeholder={t('cards.grading.scorePlaceholder')}
                                className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border rounded-xl text-[14px] font-mono font-medium outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-24 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                                  scoreError
                                    ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                    : isScoreValid
                                      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                      : 'border-slate-300 dark:border-slate-700 focus:border-[#0059BB] focus:ring-1 focus:ring-[#0059BB]'
                                }`}
                              />
                              {hasValidMaxScore && (
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12.5px] font-mono font-semibold text-slate-400 pointer-events-none whitespace-nowrap">
                                  {t('cards.grading.scoreSuffix', {
                                    maxScore: formattedMaxScore,
                                  })}
                                </div>
                              )}
                            </div>

                            {scoreError ? (
                              <div
                                id="score-error"
                                role="alert"
                                className="text-[11.5px] text-rose-600 dark:text-rose-400 font-medium flex items-start gap-1"
                              >
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[14px] shrink-0 mt-0.5"
                                >
                                  error
                                </span>
                                <span id="score-error-text">{scoreError}</span>
                              </div>
                            ) : (
                              <p
                                id="score-guide"
                                className="text-[11.5px] text-slate-500 dark:text-slate-400"
                              >
                                {hasValidMaxScore && effectiveMaxScore !== null
                                  ? t('cards.grading.scoreGuide', {
                                      maxScore: formatScore(effectiveMaxScore, locale),
                                    })
                                  : t('cards.grading.scoreGuideUnavailable')}
                              </p>
                            )}
                          </div>

                          {/* Feedback Input (Optional, preserves newlines, no arbitrary char cap) */}
                          <div className="space-y-1.5">
                            <label
                              htmlFor="input-feedback"
                              className="block text-[13px] font-semibold text-slate-800 dark:text-slate-200"
                            >
                              {t('cards.grading.feedbackLabel')}{' '}
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                                {t('cards.grading.feedbackOptional')}
                              </span>
                            </label>
                            <textarea
                              id="input-feedback"
                              rows={4}
                              value={feedbackInput}
                              onChange={handleFeedbackChange}
                              aria-invalid={Boolean(feedbackError)}
                              aria-describedby={feedbackError ? 'feedback-error' : undefined}
                              disabled={gradeMutation.isPending || !canManageSubmissions}
                              placeholder={t('cards.grading.feedbackPlaceholder')}
                              className={`w-full p-3 bg-white dark:bg-slate-950 border rounded-xl text-[13.5px] leading-relaxed outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-y disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                                feedbackError
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#0059BB] focus:ring-1 focus:ring-[#0059BB]'
                              }`}
                            />
                            {feedbackError && (
                              <div
                                id="feedback-error"
                                role="alert"
                                className="text-[11.5px] text-rose-600 dark:text-rose-400 font-medium flex items-start gap-1"
                              >
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[14px] shrink-0 mt-0.5"
                                >
                                  error
                                </span>
                                <span>{feedbackError}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Row: Cancel (secondary) + Save Grade (primary) */}
                          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                              id="btn-cancel"
                              type="button"
                              disabled={gradeMutation.isPending}
                              onClick={handleCancel}
                              className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
                            >
                              {t('cards.grading.cancelButton')}
                            </button>

                            <button
                              id="btn-save-grade"
                              type="button"
                              disabled={!canSubmitGrade}
                              onClick={handleSaveGrade}
                              className="bg-[#0059BB] hover:bg-[#004493] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                            >
                              {gradeMutation.isPending ? (
                                <>
                                  <span
                                    aria-hidden="true"
                                    className="material-symbols-outlined text-[18px] animate-spin shrink-0"
                                  >
                                    progress_activity
                                  </span>
                                  <span id="btn-save-text">
                                    {t('cards.grading.savingButton')}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span
                                    aria-hidden="true"
                                    className="material-symbols-outlined text-[18px] shrink-0"
                                  >
                                    check
                                  </span>
                                  <span id="btn-save-text">
                                    {t('cards.grading.saveButton')}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Save Error / Conflict / Uncertain Banner */}
                          {saveBanner && (
                            <div
                              id="save-error-banner"
                              role="alert"
                              data-banner-kind={saveBanner.kind}
                              className={`p-3 rounded-xl border text-[12px] space-y-2 ${
                                saveBanner.kind === 'error'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-semibold">
                                <span
                                  aria-hidden="true"
                                  className="material-symbols-outlined text-[16px] shrink-0"
                                >
                                  {saveBanner.kind === 'error' ? 'warning' : 'sync_problem'}
                                </span>
                                <span>{saveBanner.title}</span>
                              </div>
                              <p className="leading-normal">{saveBanner.message}</p>

                              {needsReloadBeforeRetry && (
                                <button
                                  id="btn-reload-status"
                                  type="button"
                                  disabled={isRetryingReload}
                                  onClick={handleReloadStatusBeforeRetry}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`material-symbols-outlined text-[15px] ${
                                      isRetryingReload ? 'animate-spin' : ''
                                    }`}
                                  >
                                    refresh
                                  </span>
                                  <span>{t('cards.grading.reloadStatusBtn')}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Delete Grading Confirmation Dialog */}
      <DeleteGradingConfirmModal
        isOpen={isDeleteModalOpen}
        studentName={studentDisplayName}
        assignmentTitle={assignmentTitle || tSub('title')}
        currentScoreDisplay={currentScoreModalDisplay}
        isPending={deleteGradingMutation.isPending}
        errorTitle={deleteErrorTitle}
        errorMessage={deleteErrorMessage}
        needsReloadBeforeRetry={deleteNeedsReload}
        isReloadingStatus={isRetryingReload}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteGrading}
        onReloadStatus={handleReloadAfterUncertainDelete}
      />
    </div>
  );
}
