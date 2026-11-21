'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClassDetail } from '@/features/classes/hooks/useClassDetail';
import { useCurrentUser } from '@/features/auth';
import { useClassHubInfo } from '../hooks/useClassHubInfo';
import { useAssignmentDetail } from '../hooks/useAssignmentQueries';
import { useSubmitAssignment, useUpdateSubmission } from '../hooks/useStudentSubmissions';
import {
  evaluateCanSubmitAssignment,
  evaluateCanEditSubmission,
} from '../utils/submissionValidation';
import {
  formatAssignmentDueDate,
  formatSubmissionTime,
  formatScore,
  getMySubmission,
} from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { MySubmission } from '../types';
import type { ApiError } from '@/types/common';

export type SubmissionFormMode = 'create' | 'edit';

interface StudentAssignmentSubmissionPageViewProps {
  classId: string;
  assignmentId: string;
  userFullName?: string;
  mode?: SubmissionFormMode;
}

function extractAttachmentFileName(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  try {
    const cleanUrl = url.trim().split('?')[0].split('#')[0];
    const withoutProtocol = cleanUrl.replace(/^https?:\/\//i, '');
    const slashIdx = withoutProtocol.indexOf('/');
    if (slashIdx === -1) return null;
    const pathPart = withoutProtocol.slice(slashIdx + 1).replace(/\/+$/, '');
    if (!pathPart) return null;
    const segments = pathPart.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return null;
    const decoded = decodeURIComponent(lastSegment).trim();
    if (!decoded || !/\.[a-z0-9]{1,8}$/i.test(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

function isPdfFile(url?: string | null): boolean {
  if (!url) return false;
  return /\.pdf(\?|#|$)/i.test(url.trim());
}

function renderContentWithLinks(text: string): React.ReactNode {
  const urlSplitRegex = /(https?:\/\/[^\s]+)/g;
  const isUrlRegex = /^https?:\/\/[^\s]+$/i;
  const parts = text.split(urlSplitRegex);
  return parts.map((part, i) => {
    if (isUrlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0059BB] dark:text-blue-400 underline font-semibold hover:opacity-85 break-all"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function extractHttpStatus(err: unknown): number {
  if (!err || typeof err !== 'object') return 0;
  const e = err as ApiError & { status?: number; response?: { status?: number } };
  return e.httpStatus || e.response?.status || e.status || 0;
}

function extractBackendMessage(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null;
  const e = err as ApiError & {
    response?: { data?: { message?: string; error?: string } };
  };
  const msg = e.response?.data?.message || e.response?.data?.error || e.message;
  return typeof msg === 'string' && msg.trim() ? msg.trim() : null;
}

function isUncertainNetworkError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as ApiError & {
    code?: string;
    message?: string;
    status?: number;
    response?: { status?: number };
  };
  const status = extractHttpStatus(err);
  const code = (e.code || '').toUpperCase();
  const msg = (e.message || '').toLowerCase();
  return (
    status === 0 ||
    status === 408 ||
    status === 504 ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ERR_NETWORK' ||
    msg.includes('network error') ||
    msg.includes('timeout')
  );
}

function isRecordGraded(record?: MySubmission | null): boolean {
  if (!record) return false;
  // Score === 0 is a valid graded score
  return (
    record.status === 'GRADED' ||
    (typeof record.score === 'number' && !isNaN(record.score))
  );
}

export function StudentAssignmentSubmissionPageView({
  classId,
  assignmentId,
  userFullName = 'Học viên ILMS',
  mode = 'create',
}: StudentAssignmentSubmissionPageViewProps) {
  const isEditMode = mode === 'edit';
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  const t = useTranslations('assignments.student');
  const tDetail = useTranslations('assignments.detail');
  const tSubmit = useTranslations('assignments.submit');
  const tClass = useTranslations('classes.detail');

  // App Shell states (preserving original DashboardSidebar / DashboardHeader)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Separate server baseline content vs active editable draft (dirty check in edit mode)
  const [initialServerContent, setInitialServerContent] = useState('');
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsStatusReload, setNeedsStatusReload] = useState(false);
  const [isUncertainOutcome, setIsUncertainOutcome] = useState(false);

  // Post-save lock & reload recovery state (prevents duplicate POST/PATCH on reload error)
  const [submittedRecord, setSubmittedRecord] = useState<MySubmission | null>(null);
  const [postSubmitReloadError, setPostSubmitReloadError] = useState(false);
  const [isRetryingReload, setIsRetryingReload] = useState(false);

  // Accordion state (expanded by default)
  const [isRequirementsExpanded, setIsRequirementsExpanded] = useState(true);

  // Synchronous double-submit guard & one-time edit draft initializer (protects draft on window-focus refetch)
  const isSubmittingRef = useRef(false);
  const initializedEditKeyRef = useRef<string | null>(null);

  // Reset all local state cleanly when switching assignment, class, or mode
  useEffect(() => {
    setInitialServerContent('');
    setContent('');
    setValidationError(null);
    setServerError(null);
    setNeedsStatusReload(false);
    setIsUncertainOutcome(false);
    setSubmittedRecord(null);
    setPostSubmitReloadError(false);
    setIsRetryingReload(false);
    setIsRequirementsExpanded(true);
    isSubmittingRef.current = false;
    initializedEditKeyRef.current = null;
  }, [assignmentId, classId, mode]);

  // Current user & class metadata
  const { data: currentUser } = useCurrentUser();
  const currentStudentId = currentUser?.id ? String(currentUser.id) : undefined;

  const { data: classDetailData } = useClassDetail(classId);
  const { data: hubInfo } = useClassHubInfo(classId);

  // Distinguish navigation route slug (classId) from canonical UUID when available
  const resolvedClassId = classDetailData?.classInfo?.id || classId;

  // Fetch assignment detail & personal submission status
  const {
    assignment,
    submission,
    isNotSubmitted,
    isLocalDemoNotFound,
    isAssignmentNotFound,
    isUnauthorized,
    isForbidden,
    isConflict,
    isSchemaError,
    isLoadError,
    isSubmissionLoadError,
    isLoading,
    isError,
    refetch,
    refetchSubmission,
  } = useAssignmentDetail(assignmentId, resolvedClassId, currentStudentId);

  // Mutation hooks (POST for create mode, PATCH with retry:false for edit mode)
  const submitMutation = useSubmitAssignment(
    assignmentId,
    resolvedClassId,
    currentStudentId
  );
  const updateMutation = useUpdateSubmission(
    assignmentId,
    currentStudentId,
    resolvedClassId
  );

  // Evaluate business permissions
  const canSubmitEvaluation = evaluateCanSubmitAssignment({
    assignment,
    submission,
    classDetail: classDetailData,
    currentUser,
  });
  const canEditEvaluation = evaluateCanEditSubmission({
    assignment,
    submission,
    currentUser,
    classDetail: classDetailData,
  });

  const { canSubmit, hasExistingSubmission, reason: createBlockReason } = canSubmitEvaluation;
  const { canEdit, reason: editBlockReason } = canEditEvaluation;

  // Navigation targets (never rely on history.back)
  const classAssignmentsHref = `/classes/${classId}?tab=assignments`;
  const assignmentDetailHref = `/classes/${classId}/assignments/${assignmentId}`;

  // Hydrate textarea ONCE in edit mode when server submission loads.
  // Never overwrite user's in-progress draft when TanStack Query refetches on window focus;
  // only sync fresh server content if the user hasn't modified the textarea yet.
  useEffect(() => {
    if (
      !isEditMode ||
      isLoading ||
      isError ||
      !submission ||
      submission.status === 'NOT_SUBMITTED'
    ) {
      return;
    }
    const editSessionKey = `${classId}::${assignmentId}::${submission.id ?? 'existing'}`;
    const serverContent = typeof submission.content === 'string' ? submission.content : '';
    if (initializedEditKeyRef.current !== editSessionKey) {
      initializedEditKeyRef.current = editSessionKey;
      setInitialServerContent(serverContent);
      setContent(serverContent);
      setValidationError(null);
      return;
    }
    if (content === initialServerContent && serverContent !== initialServerContent) {
      setInitialServerContent(serverContent);
      setContent(serverContent);
    }
  }, [
    isEditMode,
    isLoading,
    isError,
    submission,
    classId,
    assignmentId,
    content,
    initialServerContent,
  ]);

  // Create mode only: if student ALREADY has a submission, redirect back to Detail (never POST again or convert to PATCH)
  useEffect(() => {
    if (
      !isEditMode &&
      !isLoading &&
      !isError &&
      assignment &&
      hasExistingSubmission &&
      !submittedRecord
    ) {
      router.replace(assignmentDetailHref);
    }
  }, [
    isEditMode,
    isLoading,
    isError,
    assignment,
    hasExistingSubmission,
    submittedRecord,
    assignmentDetailHref,
    router,
  ]);

  // Real class & course metadata (zero sample defaults)
  const classInfo = classDetailData?.classInfo;
  const classTitle =
    classInfo?.title?.trim() ||
    classInfo?.name?.trim() ||
    hubInfo?.title?.trim() ||
    classId;

  const courseList = Array.isArray(classDetailData?.courses) ? classDetailData.courses : [];
  const matchedCourse = assignment?.courseId
    ? courseList.find((c) => c.id === assignment.courseId)
    : courseList.length === 1
      ? courseList[0]
      : undefined;

  const courseDisplayName = matchedCourse?.name?.trim() || null;
  const courseDisplayCode = matchedCourse?.code?.trim() || null;

  const rawChapter = typeof assignment?.chapter === 'string' ? assignment.chapter.trim() : '';
  const validChapter =
    rawChapter && rawChapter.toLowerCase() !== 'chương mới' ? rawChapter : null;

  const heroContextParts = [courseDisplayCode, courseDisplayName, validChapter].filter(
    (part): part is string => Boolean(part)
  );

  // Real assignment metadata (never coerce null maxScore -> 10 or null allowLate -> true)
  const assignmentTitle = assignment?.title?.trim() || '';
  const dueInfo = formatAssignmentDueDate(assignment?.dueDate);
  const isPastDue = !dueInfo.isNoDeadline && dueInfo.isPastDue;

  const hasValidMaxScore =
    typeof assignment?.maxScore === 'number' && !isNaN(assignment.maxScore);
  const formattedMaxScore = hasValidMaxScore
    ? `${formatScore(assignment.maxScore, locale)} ${t('points')}`
    : tSubmit('unavailableValue');

  const allowLatePolicy: boolean | null =
    typeof assignment?.allowLateSubmission === 'boolean'
      ? assignment.allowLateSubmission
      : null;

  const isLateSubmissionActive = !isEditMode && isPastDue && allowLatePolicy === true;

  // Real requirements & attachment (never substitute Stitch CSDL normalization sample)
  const rawDescription =
    typeof assignment?.description === 'string' ? assignment.description.trim() : '';
  const attachmentUrl = assignment?.fileAttachmentUrl?.trim() || null;
  const extractedFileName = extractAttachmentFileName(attachmentUrl);
  const attachmentDisplayName = extractedFileName || tDetail('viewAssignmentDocument');
  const isAttachmentPdf = isPdfFile(attachmentUrl);

  // Active submission record for info panel & hero status in edit mode
  const activeSubmissionRecord = submittedRecord || submission || null;
  const isActiveRecordGraded = isRecordGraded(activeSubmissionRecord);
  const latestSubmittedTime = formatSubmissionTime(activeSubmissionRecord?.submittedAt);
  const shouldShowTimelinessInfo =
    !dueInfo.isNoDeadline || Boolean(activeSubmissionRecord?.isLate);

  // Missing submission in edit mode (e.g. cancelled in another session or direct link before submitting)
  const isEditMissingSubmission =
    isEditMode && !isLoading && !isError && Boolean(assignment) && isNotSubmitted && !submittedRecord;

  // Derived business-lock & form-readiness states
  const isLockedByBusinessRule = isEditMode
    ? !isLoading &&
      !isError &&
      Boolean(assignment) &&
      !isNotSubmitted &&
      !canEdit &&
      !submittedRecord
    : !isLoading &&
      !isError &&
      Boolean(assignment) &&
      isNotSubmitted &&
      !canSubmit &&
      !submittedRecord;

  const isFormEditable = isEditMode
    ? Boolean(assignment) &&
      !isNotSubmitted &&
      Boolean(submission) &&
      canEdit &&
      !submittedRecord &&
      !needsStatusReload
    : Boolean(assignment) &&
      isNotSubmitted &&
      canSubmit &&
      !submittedRecord &&
      !needsStatusReload;

  const isSubmitting =
    submitMutation.isPending || updateMutation.isPending || isSubmittingRef.current;
  const hasNonEmptyContent = content.trim().length > 0;
  const isDirty = isEditMode ? content !== initialServerContent : true;
  const canTriggerSubmit = isFormEditable && hasNonEmptyContent && isDirty && !isSubmitting;

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);
    if (nextVal.trim().length === 0) {
      if (isEditMode || nextVal.length > 0) {
        setValidationError(tSubmit('emptyContentError'));
      }
    } else if (validationError) {
      setValidationError(null);
    }
    if (serverError && !needsStatusReload) {
      setServerError(null);
    }
  };

  const handleTextareaBlur = () => {
    if (!isFormEditable) return;
    if (content.trim().length === 0) {
      setValidationError(tSubmit('emptyContentError'));
    } else {
      setValidationError(null);
    }
  };

  const handleRetryPostSaveReload = async () => {
    if (isRetryingReload) return;
    setIsRetryingReload(true);
    try {
      const reloaded = await getMySubmission(
        assignmentId,
        currentStudentId,
        resolvedClassId
      );
      queryClient.setQueryData(
        assignmentKeys.mySubmission(assignmentId, currentStudentId, resolvedClassId),
        reloaded
      );
      queryClient.setQueriesData<MySubmission>(
        { queryKey: [...assignmentKeys.all, 'my-submission', assignmentId] },
        reloaded
      );
      queryClient.invalidateQueries({
        queryKey: [...assignmentKeys.all, 'my-submission', assignmentId],
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      setPostSubmitReloadError(false);
      router.push(assignmentDetailHref);
    } catch {
      setPostSubmitReloadError(true);
    } finally {
      setIsRetryingReload(false);
    }
  };

  const handleReloadStatusAfterError = async () => {
    if (isRetryingReload) return;
    setIsRetryingReload(true);
    try {
      const actual = await getMySubmission(
        assignmentId,
        currentStudentId,
        resolvedClassId
      );
      queryClient.setQueryData(
        assignmentKeys.mySubmission(assignmentId, currentStudentId, resolvedClassId),
        actual
      );
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...assignmentKeys.all, 'batch-submissions'] });

      if (!isEditMode) {
        if (actual && actual.status !== 'NOT_SUBMITTED') {
          router.replace(assignmentDetailHref);
          return;
        }
        setNeedsStatusReload(false);
        setIsUncertainOutcome(false);
        setServerError(null);
        return;
      }

      // Edit mode: inspect latest server state before letting student act again
      if (!actual || actual.status === 'NOT_SUBMITTED') {
        setNeedsStatusReload(false);
        setIsUncertainOutcome(false);
        setServerError(null);
        return;
      }

      // If an uncertain network PATCH actually succeeded on the server (content now matches draft), go to Detail
      if (isUncertainOutcome && actual.content === content) {
        router.push(assignmentDetailHref);
        return;
      }

      // Otherwise sync server baseline while keeping user's draft intact and clearing reload block
      if (typeof actual.content === 'string') {
        setInitialServerContent(actual.content);
      }
      setNeedsStatusReload(false);
      setIsUncertainOutcome(false);
      setServerError(null);
    } catch {
      setNeedsStatusReload(true);
      setServerError(
        isUncertainOutcome
          ? tSubmit('uncertainNetworkErrorDesc')
          : tSubmit('conflictReloadFailedDesc')
      );
    } finally {
      setIsRetryingReload(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Prevent double-submit & block if already recorded
    if (
      isSubmittingRef.current ||
      submitMutation.isPending ||
      updateMutation.isPending ||
      submittedRecord
    ) {
      return;
    }

    // Use trim ONLY to check emptiness; preserve original newlines/formatting when posting/patching
    if (!content.trim()) {
      setValidationError(tSubmit('emptyContentError'));
      return;
    }

    if (isEditMode && content === initialServerContent) {
      return;
    }

    if (!isFormEditable) {
      const msg = isEditMode
        ? canEditEvaluation.message || tDetail('cannotEditGeneric')
        : canSubmitEvaluation.message || tDetail('cannotSubmitGeneric');
      setServerError(msg);
      return;
    }

    setValidationError(null);
    setServerError(null);
    isSubmittingRef.current = true;

    try {
      const saved = isEditMode
        ? await updateMutation.mutateAsync({ content })
        : await submitMutation.mutateAsync({ content });

      // Lock further POST/PATCH immediately using exact server response
      setSubmittedRecord(saved);
      if (isEditMode && typeof saved.content === 'string') {
        setInitialServerContent(saved.content);
      }

      // Re-read authoritative submission state before navigating to Detail
      try {
        const reloadResult = await refetchSubmission();
        if (reloadResult.isError) {
          setPostSubmitReloadError(true);
          return;
        }
        router.push(assignmentDetailHref);
      } catch {
        setPostSubmitReloadError(true);
      }
    } catch (err: unknown) {
      const httpStatus = extractHttpStatus(err);
      const backendMsg = extractBackendMessage(err);

      if (isEditMode) {
        // Uncertain network/timeout failure on PATCH: require status reload before re-sending
        if (isUncertainNetworkError(err)) {
          setNeedsStatusReload(true);
          setIsUncertainOutcome(true);
          setServerError(tSubmit('uncertainNetworkErrorDesc'));
          return;
        }

        if (httpStatus === 403) {
          setServerError(backendMsg || tSubmit('updateForbiddenFallback'));
          return;
        }

        if (httpStatus === 409) {
          setNeedsStatusReload(true);
          setIsUncertainOutcome(false);
          setServerError(backendMsg || tSubmit('updateConflictFallback'));
          try {
            const actual = await getMySubmission(
              assignmentId,
              currentStudentId,
              resolvedClassId
            );
            queryClient.setQueryData(
              assignmentKeys.mySubmission(assignmentId, currentStudentId, resolvedClassId),
              actual
            );
            queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });
            queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
            setNeedsStatusReload(false);
          } catch {
            setServerError(tSubmit('conflictReloadFailedDesc'));
          }
          return;
        }

        // Preserve draft and show real backend message
        setServerError(backendMsg || tSubmit('updateFailedFallback'));
        return;
      }

      // Create mode conflict (409 - already submitted): refresh actual status before further action
      if (httpStatus === 409) {
        setNeedsStatusReload(true);
        setIsUncertainOutcome(false);
        setServerError(backendMsg || tSubmit('conflictErrorDesc'));
        try {
          const actual = await getMySubmission(
            assignmentId,
            currentStudentId,
            resolvedClassId
          );
          queryClient.setQueryData(
            assignmentKeys.mySubmission(assignmentId, currentStudentId, resolvedClassId),
            actual
          );
          queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });
          queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
          queryClient.invalidateQueries({
            queryKey: [...assignmentKeys.all, 'batch-submissions'],
          });

          if (actual && actual.status !== 'NOT_SUBMITTED') {
            router.replace(assignmentDetailHref);
            return;
          }
          setNeedsStatusReload(false);
        } catch {
          setServerError(tSubmit('conflictReloadFailedDesc'));
        }
        return;
      }

      // Preserve typed content intact and display real backend error message
      setServerError(backendMsg || tSubmit('submitFailedFallback'));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // Resolve locked reason copy for both create and edit modes
  const lockedNotice = isEditMode
    ? editBlockReason === 'ALREADY_GRADED'
      ? {
          title: tSubmit('editGradedLockedTitle'),
          desc: tSubmit('editGradedLockedDesc'),
          icon: 'verified',
        }
      : editBlockReason === 'DEADLINE_PASSED'
        ? {
            title: tSubmit('editPastDueLockedTitle'),
            desc: tSubmit('editPastDueLockedDesc'),
            icon: 'event_busy',
          }
        : editBlockReason === 'MAX_ATTEMPTS_REACHED'
          ? {
              title: tSubmit('editMaxAttemptsLockedTitle'),
              desc: tSubmit('editMaxAttemptsLockedDesc'),
              icon: 'block',
            }
          : editBlockReason === 'CLASS_READ_ONLY'
            ? {
                title: tSubmit('editClassReadOnlyTitle'),
                desc: tSubmit('editClassReadOnlyDesc'),
                icon: 'lock',
              }
            : {
                title: tSubmit('editNotOwnerLockedTitle'),
                desc: canEditEvaluation.message || tSubmit('editNotOwnerLockedDesc'),
                icon: 'gpp_maybe',
              }
    : createBlockReason === 'DEADLINE_PASSED'
      ? {
          title: tSubmit('pastDueLockedTitle'),
          desc: tSubmit('pastDueLockedDesc'),
          icon: 'event_busy',
        }
      : createBlockReason === 'CLASS_READ_ONLY'
        ? {
            title: tSubmit('classReadOnlyTitle'),
            desc: tSubmit('classReadOnlyDesc'),
            icon: 'lock',
          }
        : {
            title: tSubmit('notActiveStudentTitle'),
            desc: canSubmitEvaluation.message || tSubmit('notActiveStudentDesc'),
            icon: 'gpp_maybe',
          };

  return (
    <div
      data-submission-mode={mode}
      className="min-h-screen bg-[#F6FAFE] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900"
    >
      {/* 1. Original Application Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Original Application Header */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode((prev) => !prev)}
        userFullName={userFullName}
      />

      {/* 3. Main Content Area (wide max-w-[1440px], no extra shell elements) */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto ${
          isFocusMode || isSidebarCollapsed ? 'pl-24' : 'lg:pl-[296px]'
        }`}
      >
        {/* Breadcrumb Navigation */}
        <nav
          aria-label={tDetail('breadcrumbAria')}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-5 flex-wrap"
        >
          <Link
            href="/classes"
            className="flex items-center gap-1 hover:text-[#0059BB] dark:hover:text-blue-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0059BB] rounded-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{tDetail('allClassesBreadcrumb')}</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Link
            href={classAssignmentsHref}
            data-breadcrumb-class="true"
            className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-[#0059BB] dark:hover:text-blue-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0059BB] rounded-sm transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate max-w-[240px]">{classTitle}</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Link
            href={assignmentDetailHref}
            data-breadcrumb-assignment="true"
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-[#0059BB] dark:hover:text-blue-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0059BB] rounded-sm transition-colors truncate max-w-[280px]"
          >
            {assignmentTitle || tDetail('assignmentDetailBreadcrumb')}
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span
            aria-current="page"
            className="font-semibold text-[#0059BB] dark:text-blue-400"
          >
            {isEditMode ? tSubmit('breadcrumbEdit') : tSubmit('breadcrumbSubmit')}
          </span>
        </nav>

        {/* Core Async States inside <main> only */}
        {isLoading && !submittedRecord ? (
          <div className="space-y-6 animate-pulse" data-submit-state="loading">
            <div className="h-52 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 h-[460px] rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="lg:col-span-4 space-y-5">
                <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-60 rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        ) : !submittedRecord && isLocalDemoNotFound ? (
          <div
            data-submit-state="local-demo-not-found"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-amber-500">
              inventory_2
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('localDemoNotFoundTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {tDetail('localDemoNotFoundDesc', { id: assignmentId })}
            </p>
            <div className="pt-2">
              <Link
                href={classAssignmentsHref}
                className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs transition-colors"
              >
                {tDetail('backToAssignmentList')}
              </Link>
            </div>
          </div>
        ) : !submittedRecord && isAssignmentNotFound ? (
          <div
            data-submit-state="not-found"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-[#E2E8F0] dark:border-slate-800 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-slate-400">
              search_off
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('assignmentNotFoundTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('assignmentNotFoundDesc')}
            </p>
            <div className="pt-2">
              <Link
                href={classAssignmentsHref}
                className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs transition-colors"
              >
                {tDetail('backToAssignmentList')}
              </Link>
            </div>
          </div>
        ) : !submittedRecord && isUnauthorized ? (
          <div
            data-submit-state="unauthorized"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-amber-500">
              lock_person
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('unauthorizedTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('unauthorizedDesc')}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs transition-colors"
              >
                {tDetail('retryBtn')}
              </Link>
            </div>
          </div>
        ) : !submittedRecord && isForbidden ? (
          <div
            data-submit-state="forbidden"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-amber-500">lock</span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('forbiddenTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('forbiddenDesc')}
            </p>
            <div className="pt-2">
              <Link
                href={classAssignmentsHref}
                className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs transition-colors"
              >
                {tClass('backToClasses')}
              </Link>
            </div>
          </div>
        ) : !submittedRecord && isConflict ? (
          <div
            data-submit-state="conflict"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-amber-500">warning</span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('conflictTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('conflictDesc')}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs cursor-pointer"
              >
                {tDetail('retryBtn')}
              </button>
              <Link
                href={assignmentDetailHref}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {tSubmit('backToDetailBtn')}
              </Link>
            </div>
          </div>
        ) : !submittedRecord && isSchemaError ? (
          <div
            data-submit-state="schema-error"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-red-500">
              data_alert
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('schemaErrorTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('schemaErrorDesc')}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs cursor-pointer"
              >
                {tDetail('retryBtn')}
              </button>
            </div>
          </div>
        ) : !submittedRecord && isSubmissionLoadError ? (
          <div
            data-submit-state="submission-load-error"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-red-500">
              cloud_off
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tSubmit('mySubmissionLoadErrorTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {tSubmit('mySubmissionLoadErrorDesc')}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs cursor-pointer"
              >
                {tDetail('retryBtn')}
              </button>
              <Link
                href={assignmentDetailHref}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {tSubmit('backToDetailBtn')}
              </Link>
            </div>
          </div>
        ) : !submittedRecord && (isLoadError || isError || !assignment) ? (
          <div
            data-submit-state="load-error"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-red-500">
              error_outline
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('loadAssignmentError')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('loadErrorDesc')}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs cursor-pointer"
              >
                {tDetail('retryBtn')}
              </button>
            </div>
          </div>
        ) : !isEditMode && hasExistingSubmission && !submittedRecord ? (
          <div
            data-submit-state="already-submitted-redirect"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-[#E2E8F0] dark:border-slate-800 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-[#0059BB]">
              assignment_turned_in
            </span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {tSubmit('alreadySubmittedRedirecting')}
            </p>
            <div className="pt-1">
              <Link
                href={assignmentDetailHref}
                className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] transition-colors"
              >
                {tSubmit('openDetailBtn')}
              </Link>
            </div>
          </div>
        ) : isEditMissingSubmission ? (
          <div
            data-submit-state="edit-no-submission"
            data-edit-no-submission="true"
            className="my-8 p-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 text-center space-y-3 max-w-2xl mx-auto"
          >
            <span className="material-symbols-outlined text-[36px] text-amber-500">
              assignment_late
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tSubmit('noSubmissionToEditTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {tSubmit('noSubmissionToEditDesc')}
            </p>
            <div className="pt-2">
              <Link
                href={assignmentDetailHref}
                className="inline-flex items-center px-4 py-2.5 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs transition-colors"
              >
                {tSubmit('backToDetailBtn')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6" data-submit-state="ready">
            {/* ================= HERO NAVY SPOTLIGHT BANNER ================= */}
            <section
              data-submit-hero="true"
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0D1C32] via-[#0F2444] to-[#122C54] border-2 border-slate-700/60 p-6 sm:p-7 shadow-sm text-white"
            >
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-5">
                {/* Top Row: Eyebrow + H1 + Assignment Title & Top-Right Status Badge */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1 basis-[280px]">
                    {heroContextParts.length > 0 && (
                      <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#7DD3FC] flex-wrap">
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined shrink-0"
                          style={{ fontSize: '16px', lineHeight: 1 }}
                        >
                          school
                        </span>
                        <span>{heroContextParts.join(' • ')}</span>
                      </div>
                    )}

                    <h1 className="text-3xl sm:text-[36px] font-bold text-white tracking-tight leading-tight sm:leading-[44px]">
                      {isEditMode ? tSubmit('editPageTitle') : tSubmit('pageTitle')}
                    </h1>

                    {assignmentTitle && (
                      <p className="text-slate-300 text-sm sm:text-base font-medium break-words [overflow-wrap:anywhere]">
                        {assignmentTitle}
                      </p>
                    )}
                  </div>

                  {/* Top-Right Status Badge(s) */}
                  <div
                    data-submit-hero-badges="true"
                    className="flex flex-wrap items-center justify-end gap-2 ml-auto shrink-0"
                  >
                    {isEditMode ? (
                      <>
                        {isActiveRecordGraded ? (
                          <span
                            data-status-badge="graded"
                            className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 whitespace-nowrap"
                          >
                            <span
                              aria-hidden="true"
                              className="material-symbols-outlined"
                              style={{ fontSize: '15px', lineHeight: 1 }}
                            >
                              check_circle
                            </span>
                            <span>{tSubmit('heroGradedBadge')}</span>
                          </span>
                        ) : (
                          <span
                            data-status-badge="pending-grading"
                            className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/45 whitespace-nowrap"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>{tSubmit('heroPendingBadge')}</span>
                          </span>
                        )}
                        {activeSubmissionRecord?.isLate && (
                          <span className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/40 whitespace-nowrap">
                            <span
                              aria-hidden="true"
                              className="material-symbols-outlined"
                              style={{ fontSize: '15px', lineHeight: 1 }}
                            >
                              schedule
                            </span>
                            <span>{tSubmit('submittedLateTag')}</span>
                          </span>
                        )}
                      </>
                    ) : submittedRecord ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{tSubmit('submittedSuccessBadge')}</span>
                        </span>
                        {submittedRecord.isLate && (
                          <span className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/40 whitespace-nowrap">
                            <span
                              aria-hidden="true"
                              className="material-symbols-outlined"
                              style={{ fontSize: '15px', lineHeight: 1 }}
                            >
                              schedule
                            </span>
                            <span>{tSubmit('submittedLateTag')}</span>
                          </span>
                        )}
                      </>
                    ) : isNotSubmitted ? (
                      <span
                        data-status-badge="unsubmitted"
                        className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full text-xs font-semibold whitespace-nowrap border bg-rose-950/80 text-rose-200 border-rose-500/50"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>
                          {isPastDue
                            ? `${t('statusNotSubmitted')} · ${tDetail('pastDueBadge')}`
                            : t('statusNotSubmitted')}
                        </span>
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Metadata Row: Due Date / Max Score / Late Policy (always 3 clusters) */}
                <div
                  data-hero-metadata-grid="3-col"
                  className="pt-5 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"
                >
                  {/* 1. Hạn nộp */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 text-[#7DD3FC]">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined"
                        style={{ fontSize: '18px', lineHeight: 1 }}
                      >
                        event
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-300 block text-xs leading-none">
                        {tDetail('dueDateLabel')}
                      </span>
                      <span
                        data-hero-due-date="true"
                        className="text-sm font-semibold text-white mt-1 block whitespace-nowrap"
                      >
                        {dueInfo.isNoDeadline ? t('noDeadline') : dueInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* 2. Điểm tối đa */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 text-[#7DD3FC]">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined"
                        style={{ fontSize: '18px', lineHeight: 1 }}
                      >
                        military_tech
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-300 block text-xs leading-none">
                        {tDetail('maxScoreLabel')}
                      </span>
                      <span
                        data-hero-max-score="true"
                        className="text-sm font-semibold text-white mt-1 block whitespace-nowrap"
                      >
                        {formattedMaxScore}
                      </span>
                    </div>
                  </div>

                  {/* 3. Chính sách nộp muộn (luôn hiển thị; khi không có hạn nộp hiện "Không áp dụng" mà không đổi giá trị lưu) */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 text-[#7DD3FC]">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined"
                        style={{ fontSize: '18px', lineHeight: 1 }}
                      >
                        schedule
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-300 block text-xs leading-none mb-1">
                        {tDetail('lateSubmissionLabel')}
                      </span>
                      {dueInfo.isNoDeadline ? (
                        <span
                          data-hero-late-policy="not-applicable"
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800/90 text-slate-300 border border-slate-600/70 whitespace-nowrap"
                        >
                          {tSubmit('lateNotApplicable')}
                        </span>
                      ) : allowLatePolicy === true ? (
                        <span
                          data-hero-late-policy="allowed"
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 whitespace-nowrap"
                        >
                          {tDetail('lateAllowedShort')}
                        </span>
                      ) : allowLatePolicy === false ? (
                        <span
                          data-hero-late-policy="not-allowed"
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/40 whitespace-nowrap"
                        >
                          {tDetail('lateNotAllowedShort')}
                        </span>
                      ) : (
                        <span
                          data-hero-late-policy="unavailable"
                          className="text-sm font-semibold text-slate-300"
                        >
                          {tSubmit('unavailableValue')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= 2-COLUMN WORKSPACE (8 MAIN / 4 ASIDE) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT CHÍNH (8 CỘT): FORM NỘP BÀI / CHỈNH SỬA BÀI NỘP */}
              <div className="lg:col-span-8 min-w-0 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#E2E8F0] dark:border-slate-800 p-6 shadow-xs flex flex-col">
                  {/* Case 1: POST 201 or PATCH 200 succeeded, but reloading latest status failed */}
                  {submittedRecord && postSubmitReloadError ? (
                    <div
                      role="status"
                      data-post-submit-reload-error="true"
                      className="flex flex-col gap-4"
                    >
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[24px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center flex-wrap gap-2">
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                              {isEditMode
                                ? tSubmit('postUpdateRecordedTitle')
                                : tSubmit('postSubmitRecordedTitle')}
                            </h2>
                            {submittedRecord.isLate && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                {tSubmit('submittedLateTag')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {isEditMode
                              ? tSubmit('postUpdateReloadErrorDesc')
                              : tSubmit('postSubmitReloadErrorDesc')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                          href={assignmentDetailHref}
                          className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          {tSubmit('openDetailBtn')}
                        </Link>
                        <button
                          type="button"
                          disabled={isRetryingReload}
                          onClick={handleRetryPostSaveReload}
                          className="px-5 py-2.5 rounded-xl bg-[#0059BB] hover:bg-[#004493] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isRetryingReload ? 'animate-spin' : ''
                            }`}
                          >
                            refresh
                          </span>
                          <span>{tSubmit('retryReloadBtn')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
                      {/* Header & Helper */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 text-[22px]"
                        >
                          edit_note
                        </span>
                        <label
                          htmlFor="submission-content"
                          className="text-base font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                        >
                          {tSubmit('contentLabel')}{' '}
                          <span className="text-rose-500" aria-hidden="true">
                            *
                          </span>
                        </label>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-3.5 leading-relaxed">
                        {tSubmit('contentHelper')}
                      </p>

                      {/* Edit mode attempt note */}
                      {isEditMode && (
                        <div
                          data-edit-attempt-note="true"
                          className="bg-blue-50/80 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-800/70 text-blue-900 dark:text-blue-200 rounded-xl p-3 mb-4 text-xs flex items-center gap-2.5"
                        >
                          <span
                            aria-hidden="true"
                            className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 shrink-0"
                            style={{ fontSize: '18px', lineHeight: 1 }}
                          >
                            info
                          </span>
                          <span className="font-medium leading-relaxed">
                            {tSubmit('editAttemptNote')}
                          </span>
                        </div>
                      )}

                      {/* Locked Business Rule Banner */}
                      {isLockedByBusinessRule && (
                        <div
                          id="submit-locked-reason"
                          role="alert"
                          data-submit-locked-banner="true"
                          className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200"
                        >
                          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-rose-600 dark:text-rose-400">
                            {lockedNotice.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">{lockedNotice.title}</p>
                            <p className="text-xs sm:text-sm mt-0.5 leading-relaxed opacity-90">
                              {lockedNotice.desc}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Late Submission Warning Banner (Create mode only: Past due & late allowed) */}
                      {!isLockedByBusinessRule && isLateSubmissionActive && !submittedRecord && (
                        <div
                          role="status"
                          data-late-warning-banner="true"
                          className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2.5 text-amber-900 dark:text-amber-200"
                        >
                          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-amber-600 dark:text-amber-400">
                            schedule
                          </span>
                          <div className="min-w-0 flex-1 text-xs sm:text-sm leading-relaxed">
                            <span className="font-bold">{tSubmit('lateWarningTitle')}: </span>
                            <span>{tSubmit('lateWarningDesc')}</span>
                          </div>
                        </div>
                      )}

                      {/* Textarea */}
                      <div className="relative flex flex-col">
                        <textarea
                          id="submission-content"
                          name="content"
                          value={content}
                          onChange={handleTextareaChange}
                          onBlur={handleTextareaBlur}
                          disabled={!isFormEditable || isSubmitting}
                          placeholder={tSubmit('contentPlaceholder')}
                          rows={12}
                          aria-required="true"
                          aria-invalid={Boolean(validationError)}
                          aria-describedby="submission-inline-error submission-char-count"
                          className={`w-full p-4 rounded-xl border text-sm leading-relaxed resize-y min-h-[320px] transition-colors outline-none bg-white dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:bg-slate-50 dark:disabled:bg-slate-900/80 disabled:text-slate-500 disabled:cursor-not-allowed ${
                            validationError
                              ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                              : 'border-[#CBD5E1] dark:border-slate-700 focus:border-[#0059BB] focus:ring-2 focus:ring-[#0059BB]/15'
                          }`}
                        />

                        {/* Inline Validation Error + Live Character Counter */}
                        <div className="flex items-center justify-between gap-3 mt-1.5 px-0.5 min-h-[22px]">
                          <p
                            id="submission-inline-error"
                            role={validationError ? 'alert' : undefined}
                            className={`text-xs font-medium text-rose-600 dark:text-rose-400 ${
                              validationError ? 'block' : 'invisible'
                            }`}
                          >
                            {validationError || tSubmit('emptyContentError')}
                          </p>
                          <span
                            id="submission-char-count"
                            data-char-count="true"
                            className="ml-auto text-xs text-slate-400 dark:text-slate-500 tabular-nums shrink-0"
                          >
                            {tSubmit('charCount', { count: content.length })}
                          </span>
                        </div>
                      </div>

                      {/* Server Error Banner (keeps draft intact) */}
                      {serverError && (
                        <div
                          role="alert"
                          data-submit-server-error="true"
                          data-uncertain-outcome={isUncertainOutcome ? 'true' : 'false'}
                          className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                              error
                            </span>
                            <span className="font-medium break-words">{serverError}</span>
                          </div>
                          {needsStatusReload && (
                            <button
                              type="button"
                              id="reloadStatusAfterErrorBtn"
                              disabled={isRetryingReload}
                              onClick={handleReloadStatusAfterError}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                            >
                              {isUncertainOutcome
                                ? tSubmit('checkLatestStatusBtn')
                                : tSubmit('retryReloadBtn')}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Form Footer Actions */}
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-5 pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          id="cancelSubmitBtn"
                          disabled={isSubmitting}
                          onClick={() => router.push(assignmentDetailHref)}
                          className="px-5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isLockedByBusinessRule
                            ? tSubmit('backToDetailBtn')
                            : tSubmit('cancelBtn')}
                        </button>

                        <button
                          type="submit"
                          id="submitAssignmentBtn"
                          disabled={!canTriggerSubmit}
                          aria-describedby={
                            isLockedByBusinessRule
                              ? 'submit-locked-reason'
                              : validationError
                                ? 'submission-inline-error'
                                : undefined
                          }
                          className="px-6 py-2.5 rounded-xl bg-[#0059BB] hover:bg-[#004493] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined animate-spin motion-reduce:animate-none"
                                style={{ fontSize: '18px', lineHeight: 1 }}
                              >
                                progress_activity
                              </span>
                              <span>
                                {isEditMode ? tSubmit('updatingBtn') : tSubmit('submittingBtn')}
                              </span>
                            </>
                          ) : isEditMode ? (
                            <span>{tSubmit('updateBtn')}</span>
                          ) : (
                            <>
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined"
                                style={{ fontSize: '18px', lineHeight: 1 }}
                              >
                                send
                              </span>
                              <span>{tSubmit('submitBtn')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* CỘT PHỤ (4 CỘT): THÔNG TIN HỖ TRỢ */}
              <aside className="lg:col-span-4 min-w-0 flex flex-col gap-5">
                {/* Card 1: Thông tin bài nộp */}
                <section
                  data-submission-info-card="true"
                  className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#E2E8F0] dark:border-slate-800 p-5 shadow-xs"
                >
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[#0059BB] dark:text-blue-400"
                      style={{ fontSize: '20px', lineHeight: 1 }}
                    >
                      assignment
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {tSubmit('submissionInfoTitle')}
                    </h2>
                  </div>

                  {isEditMode && activeSubmissionRecord ? (
                    <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {/* Trạng thái hiện tại */}
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {tSubmit('currentStatusLabel')}
                        </span>
                        {isActiveRecordGraded ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                            {tSubmit('heroGradedBadge')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                            {tDetail('pendingGradingBadge')}
                          </span>
                        )}
                      </div>

                      {/* Thời gian nộp gần nhất + Đúng hạn / Nộp muộn */}
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {tSubmit('latestSubmittedAtLabel')}
                        </span>
                        <div className="text-right">
                          <span
                            data-latest-submitted-at="true"
                            className="font-semibold text-slate-900 dark:text-slate-100 block whitespace-nowrap"
                          >
                            {latestSubmittedTime.formatted || tSubmit('unavailableValue')}
                          </span>
                          {shouldShowTimelinessInfo && (
                            <span
                              data-timeliness-label="true"
                              className={`text-[11px] font-medium block mt-0.5 ${
                                activeSubmissionRecord.isLate
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {activeSubmissionRecord.isLate
                                ? tSubmit('latePolicyText')
                                : tSubmit('onTimePolicyText')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Số lượt đã nộp (đọc thẳng từ server, không tự cộng hay bịa số lượt còn lại) */}
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {tSubmit('attemptsSubmittedLabel')}
                        </span>
                        <span
                          data-submission-attempt-count="true"
                          className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap"
                        >
                          {typeof activeSubmissionRecord.submissionAttempt === 'number' &&
                          !isNaN(activeSubmissionRecord.submissionAttempt)
                            ? tSubmit('attemptsCountUnit', {
                                count: activeSubmissionRecord.submissionAttempt,
                              })
                            : tSubmit('unavailableValue')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {tSubmit('statusLabel')}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {submittedRecord ? (
                            <>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {tSubmit('submittedSuccessBadge')}
                              </span>
                              {submittedRecord.isLate && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  {tSubmit('submittedLateTag')}
                                </span>
                              )}
                            </>
                          ) : isNotSubmitted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              {t('statusNotSubmitted')}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {isNotSubmitted && !submittedRecord && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed pt-0.5">
                          {tSubmit('noSubmissionYetDesc')}
                        </p>
                      )}
                    </div>
                  )}
                </section>

                {/* Card 2: Accordion «Xem yêu cầu đề bài» (mặc định mở, chuột + Enter + Space) */}
                <section className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#E2E8F0] dark:border-slate-800 p-5 shadow-xs">
                  <button
                    type="button"
                    id="submission-requirements-toggle"
                    aria-expanded={isRequirementsExpanded}
                    aria-controls="submission-requirements-panel"
                    onClick={() => setIsRequirementsExpanded((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-2 text-left group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0059BB] rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 shrink-0"
                        style={{ fontSize: '20px', lineHeight: 1 }}
                      >
                        menu_book
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {tSubmit('viewRequirementsTitle')}
                      </h2>
                    </div>
                    <span
                      aria-hidden="true"
                      data-accordion-chevron="true"
                      className={`material-symbols-outlined text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 shrink-0 ${
                        isRequirementsExpanded ? 'rotate-180' : ''
                      }`}
                      style={{ fontSize: '20px', lineHeight: 1 }}
                    >
                      expand_more
                    </span>
                  </button>

                  {isRequirementsExpanded && (
                    <div
                      id="submission-requirements-panel"
                      className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300"
                    >
                      {rawDescription ? (
                        <div className="leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {renderContentWithLinks(rawDescription)}
                        </div>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 italic leading-relaxed">
                          {tSubmit('noRequirementsDesc')}
                        </p>
                      )}

                      {attachmentUrl && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                            {tSubmit('attachmentTitle')}
                          </p>
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-[#0059BB] transition-colors group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                aria-hidden="true"
                                className={`material-symbols-outlined shrink-0 ${
                                  isAttachmentPdf
                                    ? 'text-rose-500'
                                    : 'text-[#0059BB] dark:text-blue-400'
                                }`}
                                style={{ fontSize: '20px', lineHeight: 1 }}
                              >
                                {isAttachmentPdf ? 'picture_as_pdf' : 'description'}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0059BB] dark:group-hover:text-blue-400 truncate">
                                {attachmentDisplayName}
                              </span>
                            </div>
                            <span
                              aria-hidden="true"
                              className="material-symbols-outlined text-slate-400 group-hover:text-[#0059BB] shrink-0"
                              style={{ fontSize: '16px', lineHeight: 1 }}
                            >
                              open_in_new
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Card 3: Lưu ý chia sẻ đường dẫn */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#E2E8F0] dark:border-slate-800 p-4 shadow-xs flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-amber-500 shrink-0 mt-0.5"
                    style={{ fontSize: '20px', lineHeight: 1 }}
                  >
                    lightbulb
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {tSubmit('linkSharingTip')}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
