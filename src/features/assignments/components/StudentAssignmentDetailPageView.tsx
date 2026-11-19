'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Hourglass } from 'lucide-react';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClassDetail } from '@/features/classes/hooks/useClassDetail';
import { useCurrentUser } from '@/features/auth';
import { useClassHubInfo } from '../hooks/useClassHubInfo';
import { useAssignmentDetail } from '../hooks/useAssignmentDetail';
import { useDeleteSubmission } from '../hooks/useDeleteSubmission';
import {
  evaluateCanSubmitAssignment,
  evaluateCanCancelSubmission,
  evaluateCanEditSubmission,
} from '../utils/submissionValidation';
import {
  formatAssignmentDueDate,
  formatSubmissionTime,
  formatScore,
  isDemoAssignment,
} from '../services/assignment.service';

interface StudentAssignmentDetailPageViewProps {
  classId: string;
  assignmentId: string;
  userFullName?: string;
}

/**
 * Extracts a meaningful filename from an attachment URL.
 * Returns null if no filename can be reliably determined from the URL.
 */
function extractAttachmentFileName(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  try {
    const cleanUrl = url.trim().split('?')[0].split('#')[0];
    // Reject bare origin URLs (e.g. https://drive.google.com or https://example.com/)
    const withoutProtocol = cleanUrl.replace(/^https?:\/\//i, '');
    const slashIdx = withoutProtocol.indexOf('/');
    if (slashIdx === -1) return null;
    const pathPart = withoutProtocol.slice(slashIdx + 1).replace(/\/+$/, '');
    if (!pathPart) return null;
    const segments = pathPart.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return null;
    const decoded = decodeURIComponent(lastSegment).trim();
    // Only treat as a filename when it looks like a file (contains a dot with extension)
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

/**
 * Safely parse text and turn web URLs (http/https) into clickable anchor links.
 */
function renderContentWithLinks(text?: string | null) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
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

export function StudentAssignmentDetailPageView({
  classId,
  assignmentId,
  userFullName = 'Học viên ILMS',
}: StudentAssignmentDetailPageViewProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('assignments.student');
  const tDetail = useTranslations('assignments.detail');
  const tClass = useTranslations('classes.detail');

  // App Shell States (preserving DashboardSidebar / DashboardHeader)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Accordion state for assignment specification
  const [isSpecExpanded, setIsSpecExpanded] = useState(true);

  // Cancel Submission Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelErrorMessage, setCancelErrorMessage] = useState<string | null>(null);

  // Reset local interactive UI state whenever switching assignments or classes
  useEffect(() => {
    setIsSpecExpanded(true);
    setIsCancelModalOpen(false);
    setCancelErrorMessage(null);
  }, [assignmentId, classId]);

  // Fetch Current User
  const { data: currentUser } = useCurrentUser();
  const currentStudentId = currentUser?.id ? String(currentUser.id) : undefined;

  // Mutations
  const deleteMutation = useDeleteSubmission(assignmentId, currentStudentId, classId);

  // Fetch Class Info from unified class registry
  const { data: classDetailData } = useClassDetail(classId);
  const { data: hubInfo } = useClassHubInfo(classId);

  // Fetch Assignment Detail & Personal Submission Status
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
    isLoading,
    isError,
    refetch,
  } = useAssignmentDetail(assignmentId, classId, currentStudentId);

  const classInfo = classDetailData?.classInfo;
  const classTitle =
    classInfo?.title?.trim() ||
    classInfo?.name?.trim() ||
    hubInfo?.title?.trim() ||
    classId;

  // Resolve course strictly by assignment.courseId from real class courses metadata
  const courseList = Array.isArray(classDetailData?.courses) ? classDetailData.courses : [];
  const matchedCourse = assignment?.courseId
    ? courseList.find((c) => c.id === assignment.courseId)
    : courseList.length === 1
      ? courseList[0]
      : undefined;

  const courseDisplayName = matchedCourse?.name?.trim() || null;
  const courseDisplayCode = matchedCourse?.code?.trim() || null;
  const semesterInfo =
    classInfo?.semester?.trim() || matchedCourse?.semester?.trim() || null;

  // Ignore empty or legacy placeholder chapter labels
  const rawChapter = typeof assignment?.chapter === 'string' ? assignment.chapter.trim() : '';
  const validChapter =
    rawChapter && rawChapter.toLowerCase() !== 'chương mới' ? rawChapter : null;

  const heroContextParts = [courseDisplayCode, courseDisplayName, validChapter].filter(
    (part): part is string => Boolean(part)
  );

  // Evaluate single source of truth for submission / edit / cancel permissions
  const canSubmitEvaluation = evaluateCanSubmitAssignment({
    assignment,
    submission,
    classDetail: classDetailData,
    currentUser,
  });
  const { canSubmit, hasExistingSubmission } = canSubmitEvaluation;

  const canCancelEvaluation = evaluateCanCancelSubmission({
    submission,
    currentUser,
    classDetail: classDetailData,
  });
  const { canCancel } = canCancelEvaluation;

  const canEditEvaluation = evaluateCanEditSubmission({
    assignment,
    submission,
    currentUser,
    classDetail: classDetailData,
  });
  const { canEdit } = canEditEvaluation;

  // Format Due Date, Times & Scores (using LocalDateTime convention)
  const dueInfo = formatAssignmentDueDate(assignment?.dueDate);
  const submissionTime = formatSubmissionTime(submission?.submittedAt);
  const gradedTime = formatSubmissionTime(submission?.gradedAt);
  const formattedScore = formatScore(submission?.score, locale);
  const maxScoreValue =
    typeof assignment?.maxScore === 'number' && !isNaN(assignment.maxScore)
      ? assignment.maxScore
      : 10;
  const formattedMaxScore = formatScore(maxScoreValue, locale);

  // Grader name strictly from API response (never substitute class owner or sample name)
  const teacherGradedName = submission?.gradedByTeacherName?.trim() || null;

  // Status flags (strictly separated; score=0 with status=GRADED is graded, never pending)
  const isGraded =
    !isNotSubmitted && !isLoading && !isError && submission?.status === 'GRADED';
  const hasNumericScore =
    typeof submission?.score === 'number' && !isNaN(submission.score);
  const isSubmittedPending =
    !isNotSubmitted &&
    !isLoading &&
    !isError &&
    !isGraded &&
    !hasNumericScore &&
    (submission?.status === 'SUBMITTED' ||
      submission?.status === 'RESUBMITTED' ||
      submission?.status === 'LATE');

  // Known reason for disabled Edit Submission button (never invent maxAttempts when absent)
  const editLockedReasonText = !canEdit
    ? canEditEvaluation.reason === 'DEADLINE_PASSED'
      ? tDetail('cannotEditPastDueReason')
      : canEditEvaluation.reason === 'MAX_ATTEMPTS_REACHED'
        ? tDetail('cannotEditMaxAttemptsReason')
        : canEditEvaluation.reason === 'CLASS_READ_ONLY'
          ? tDetail('cannotSubmitClassReadOnly')
          : canEditEvaluation.reason === 'NOT_OWNER'
            ? tDetail('cannotEditNotOwnerReason')
            : null
    : null;

  // Detect inconsistent score when status=GRADED (score=0 is valid; null/undefined/NaN is not)
  const hasInconsistentScore =
    isGraded &&
    (submission?.score === null ||
      submission?.score === undefined ||
      typeof submission?.score !== 'number' ||
      isNaN(submission.score));

  const isPastDue = dueInfo.isPastDue;
  const allowLate = Boolean(assignment?.allowLateSubmission);

  // Unified description source for both Hero and Requirements section
  const rawDescription =
    typeof assignment?.description === 'string' ? assignment.description.trim() : '';
  const heroSummary = rawDescription
    ? rawDescription
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find(Boolean) || ''
    : '';

  const isDb01DemoFixture =
    assignmentId === 'assign-db-01' && isDemoAssignment(assignmentId, classId);

  const attachmentUrl = assignment?.fileAttachmentUrl?.trim() || null;
  const extractedFileName = extractAttachmentFileName(attachmentUrl);
  const attachmentDisplayName = extractedFileName || tDetail('viewAssignmentDocument');
  const isAttachmentPdf = isPdfFile(attachmentUrl);

  const hasSpecContent = Boolean(isDb01DemoFixture || rawDescription || attachmentUrl);

  // Whether to show On-Time / Late badge (only when assignment has a deadline or submission is explicitly late)
  const shouldShowTimelinessBadge = !dueInfo.isNoDeadline || Boolean(submission?.isLate);

  const assignmentTitle = assignment?.title?.trim() || '';

  const studentSubmitterName =
    submission?.studentName?.trim() ||
    (currentUser
      ? `${currentUser.lastName || ''} ${currentUser.firstName || ''}`.trim()
      : '') ||
    userFullName;

  const handleNavigateToEditSubmission = () => {
    router.push(`/classes/${classId}/assignments/${assignmentId}/submit?mode=edit`);
  };

  const handleConfirmCancel = async () => {
    try {
      setCancelErrorMessage(null);
      if (!canCancel) {
        setCancelErrorMessage(canCancelEvaluation.message || tDetail('cancelNotAllowedError'));
        return;
      }
      const isMock = isDemoAssignment(assignmentId, classId);
      const subId = submission?.id || (isMock ? `sub-${assignmentId}` : '');
      if (!subId) {
        setCancelErrorMessage(tDetail('cancelMissingIdError'));
        return;
      }
      await deleteMutation.mutateAsync({
        submissionId: subId,
        currentSubmission: submission,
      });
      setIsCancelModalOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string; response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        tDetail('cancelFailedError');
      setCancelErrorMessage(msg);
    }
  };

  const courseSubheaderText = courseDisplayName
    ? courseDisplayCode && semesterInfo
      ? tDetail('courseSectionLabel', {
          name: courseDisplayName,
          code: courseDisplayCode,
          semester: semesterInfo,
        })
      : courseDisplayCode
        ? tDetail('courseSectionNoSemester', {
            name: courseDisplayName,
            code: courseDisplayCode,
          })
        : tDetail('courseSectionNameOnly', {
            name: courseDisplayName,
          })
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. App Shell Sidebar (Khung ứng dụng gốc) */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Top Header with Breadcrumbs, Search, Theme & User Simulator */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
        userFullName={userFullName}
      />

      {/* 3. Main Workspace Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto ${
          isFocusMode
            ? 'pl-24'
            : isSidebarCollapsed
              ? 'pl-24'
              : 'lg:pl-[284px]'
        }`}
      >
        {/* Line 1: Dòng breadcrumb điều hướng nội dung */}
        <nav
          aria-label={tDetail('breadcrumbAria')}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2 flex-wrap"
        >
          <Link
            href="/classes"
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm font-medium transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{tDetail('allClassesBreadcrumb')}</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Link
            href={`/classes/${classId}?tab=assignments`}
            className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>{classTitle}</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span
            aria-current="page"
            className="font-semibold text-slate-900 dark:text-slate-100"
          >
            {tDetail('assignmentDetailBreadcrumb')}
          </span>
        </nav>

        {/* Line 2: Dòng thông tin học phần phụ (chỉ hiện khi có metadata môn học thật) */}
        {courseSubheaderText && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6">
            <span className="material-symbols-outlined text-[17px] text-[#0059BB] dark:text-blue-400 shrink-0">
              school
            </span>
            <span>{courseSubheaderText}</span>
          </div>
        )}
        {!courseSubheaderText && <div className="mb-4" />}

        {/* Async UI States */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="lg:col-span-4 h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ) : isLocalDemoNotFound ? (
          <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 text-center space-y-3 max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-[36px] text-amber-500">
              inventory_2
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('localDemoNotFoundTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {tDetail('localDemoNotFoundDesc', { id: assignmentId })}
            </p>
            <div className="pt-2">
              <Link
                href={`/classes/${classId}?tab=assignments`}
                className="inline-block px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs transition-colors"
              >
                {tDetail('backToAssignmentList')}
              </Link>
            </div>
          </div>
        ) : isAssignmentNotFound ? (
          <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#E2E8F0] dark:border-slate-800 text-center space-y-3 max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-[36px] text-slate-400">
              search_off
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('assignmentNotFoundTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('assignmentNotFoundDesc')}
            </p>
            <div className="pt-2">
              <Link
                href={`/classes/${classId}?tab=assignments`}
                className="inline-block px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs transition-colors"
              >
                {tDetail('backToAssignmentList')}
              </Link>
            </div>
          </div>
        ) : isUnauthorized ? (
          <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 text-center space-y-3 max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-[36px] text-amber-500">
              lock_person
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('unauthorizedTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('unauthorizedDesc')}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs transition-colors"
              >
                {tDetail('retryBtn')}
              </Link>
            </div>
          </div>
        ) : isForbidden ? (
          <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 text-center space-y-3 max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-[36px] text-amber-500">
              lock
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('forbiddenTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('forbiddenDesc')}
            </p>
            <div className="pt-2">
              <Link
                href={`/classes/${classId}?tab=assignments`}
                className="inline-block px-4 py-2 text-xs font-bold rounded-xl bg-[#0059BB] text-white hover:bg-[#004493] shadow-xs transition-colors"
              >
                {tClass('backToClasses')}
              </Link>
            </div>
          </div>
        ) : isConflict ? (
          <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 text-center space-y-3 max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-[36px] text-amber-500">
              sync_problem
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('conflictTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {tDetail('conflictDesc')}
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
        ) : isSchemaError ? (
          <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 text-center space-y-3 max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-[36px] text-red-500">
              data_alert
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('schemaErrorTitle')}
            </h3>
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
        ) : isLoadError || isError || !assignment ? (
          <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 text-center space-y-3 max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-[36px] text-red-500">
              error_outline
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {tDetail('loadAssignmentError')}
            </h3>
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
        ) : (
          <div className="space-y-6">
            {/* ================= KHỐI ĐẦU TRANG SPOTLIGHT CARD (NAVY BLUE GRADIENT) ================= */}
            <section className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#0D1C32] via-[#0F2444] to-[#122C54] border-2 border-slate-700/60 shadow-lg text-white relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-4">
                {/* Row 1: Context Line & Status Pill Badge */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {heroContextParts.length > 0 ? (
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-200/80 uppercase flex-wrap">
                      {heroContextParts.map((part, idx) => (
                        <React.Fragment key={`${part}-${idx}`}>
                          {idx > 0 && (
                            <span className="inline-block w-1 h-1 rounded-full bg-sky-300/50" />
                          )}
                          <span>{part}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Status Badges for 3 states */}
                  <div className="shrink-0 flex items-center gap-2 flex-wrap">
                    {isNotSubmitted && (
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap border ${
                          isPastDue
                            ? 'bg-rose-950/80 text-rose-200 border-rose-500/50'
                            : 'bg-slate-800/90 text-sky-200 border-sky-400/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPastDue ? 'bg-rose-400' : 'bg-sky-400'
                          }`}
                        />
                        <span>
                          {isPastDue
                            ? `${t('statusNotSubmitted')} · ${tDetail('pastDueBadge')}`
                            : t('statusNotSubmitted')}
                        </span>
                      </span>
                    )}
                    {isSubmittedPending && (
                      <span className="bg-amber-950/80 text-amber-300 border border-amber-500/50 text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{tDetail('pendingGradingBadge')}</span>
                      </span>
                    )}
                    {isGraded && (
                      <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{tDetail('statusGradedBadge')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Title & Summary from same AssignmentDetail.description source */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#0059BB]/25 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                    <span className="material-symbols-outlined text-[24px]">assignment</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-[24px] font-semibold text-white tracking-tight leading-snug break-words [overflow-wrap:anywhere]">
                      {assignmentTitle}
                    </h1>
                    {heroSummary && (
                      <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mt-1 line-clamp-2 break-words [overflow-wrap:anywhere]">
                        {heroSummary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: Metadata items (uniform 18px outline icons: event, military_tech, schedule) */}
                <div
                  className={`mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-1 ${
                    dueInfo.isNoDeadline ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
                  } gap-4 text-xs`}
                >
                  {/* Ô 1: Hạn nộp */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 text-sky-300">
                      <span className="material-symbols-outlined text-[18px]">event</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-300 block text-xs leading-none">
                        {tDetail('dueDateLabel')}
                      </span>
                      <span className="text-sm font-semibold text-slate-50 mt-1 block whitespace-nowrap">
                        {dueInfo.isNoDeadline ? t('noDeadline') : dueInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Ô 2: Điểm tối đa */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 text-sky-300">
                      <span className="material-symbols-outlined text-[18px]">military_tech</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-300 block text-xs leading-none">
                        {tDetail('maxScoreLabel')}
                      </span>
                      <span className="text-sm font-semibold text-slate-50 mt-1 block whitespace-nowrap">
                        {formattedMaxScore} {t('points')}
                      </span>
                    </div>
                  </div>

                  {/* Ô 3: Nộp muộn (ẩn khi bài không có hạn nộp) */}
                  {!dueInfo.isNoDeadline && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0 text-sky-300">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-slate-300 block text-xs leading-none mb-1">
                          {tDetail('lateSubmissionLabel')}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium inline-block ${
                            allowLate
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                          }`}
                        >
                          {allowLate
                            ? tDetail('lateAllowedShort')
                            : tDetail('lateNotAllowedShort')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ================= BỐ CỤC 2 CỘT (8 MAIN / 4 ASIDE) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT CHÍNH (8 COLS TRÊN DESKTOP) */}
              <div className="lg:col-span-8 order-2 lg:order-1 space-y-6 min-w-0">
                {/* 1. THẺ NHẬN XÉT CỦA GIẢNG VIÊN (TOP 1 KHI ĐÃ CHẤM) */}
                {isGraded && (
                  <section className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70 dark:border-emerald-800/60 flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                        <span className="material-symbols-outlined text-[22px]">rate_review</span>
                        <h2 className="text-base sm:text-lg font-bold">
                          {tDetail('teacherFeedbackTitle')}
                        </h2>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
                        <span className="material-symbols-outlined text-[15px] shrink-0">school</span>
                        <span>
                          {teacherGradedName
                            ? `${teacherGradedName} • ${tDetail('instructorRoleLabel')}`
                            : tDetail('noGradedByInfo')}
                        </span>
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800/60 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs tracking-wider uppercase">
                        <span className="material-symbols-outlined text-[17px]">format_quote</span>
                        <span>{tDetail('detailedFeedbackHeader')}</span>
                      </div>
                      {submission?.feedback && submission.feedback.trim() ? (
                        <blockquote className="text-slate-800 dark:text-slate-200 text-sm italic pl-2 leading-relaxed border-l-2 border-emerald-400 whitespace-pre-line break-words [overflow-wrap:anywhere]">
                          “{submission.feedback.trim()}”
                        </blockquote>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-sm italic pl-2 leading-relaxed border-l-2 border-emerald-300">
                          {tDetail('noGradingFeedback')}
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {/* 2. CARD "BÀI LÀM ĐÃ NỘP" (HIỆN KHI ĐÃ CÓ BÀI NỘP: CHỜ CHẤM HOẶC ĐÃ CHẤM) */}
                {hasExistingSubmission && submission && (
                  <section className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs border-2 border-[#E2E8F0] dark:border-slate-800 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">task</span>
                        </div>
                        <h2 className="text-[18px] font-bold text-slate-900 dark:text-slate-100">
                          {tDetail('submittedWorkHeading')}
                        </h2>
                      </div>

                      {/* Lượt nộp hiển thị đúng 1 lần duy nhất tại đây */}
                      {typeof submission.submissionAttempt === 'number' && (
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold whitespace-nowrap">
                          {tDetail('submissionAttemptCount', {
                            attempt: submission.submissionAttempt,
                          })}
                        </span>
                      )}
                    </div>

                    {/* Box nội dung bài nộp (giữ tên học viên & nội dung, không lặp thời gian nộp/nhãn hạn) */}
                    <div className="rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-700/80 p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]/80 dark:border-slate-700/80">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400 shrink-0">
                            person
                          </span>
                          <span>{tDetail('studentAuthorLabel', { name: studentSubmitterName })}</span>
                        </span>
                      </div>

                      {typeof submission.content === 'string' && submission.content.trim() ? (
                        <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed pl-1 font-normal select-text break-words [overflow-wrap:anywhere]">
                          {renderContentWithLinks(submission.content)}
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3 flex-wrap">
                          <span>{tDetail('noSubmissionContentError')}</span>
                          <button
                            type="button"
                            onClick={() => refetch()}
                            className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-bold hover:bg-amber-700 cursor-pointer"
                          >
                            {tDetail('retryBtn')}
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* 3. CARD YÊU CẦU BÀI TẬP & ĐỀ BÀI ĐỐI CHIẾU */}
                <section
                  className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs border-2 border-[#E2E8F0] dark:border-slate-800 flex flex-col gap-4"
                  id="section-assignment-spec"
                >
                  {hasSpecContent ? (
                    <button
                      type="button"
                      id="accordion-header"
                      aria-expanded={isSpecExpanded}
                      aria-controls="accordion-content"
                      onClick={() => setIsSpecExpanded((prev) => !prev)}
                      className="w-full flex items-center justify-between gap-3 cursor-pointer select-none pb-2 border-b border-[#E2E8F0] dark:border-slate-800 text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0059BB] rounded-md"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">description</span>
                        </span>
                        <span className="text-[18px] font-bold text-slate-900 dark:text-slate-100">
                          {hasExistingSubmission
                            ? tDetail('assignmentSpecCompareTitle')
                            : tDetail('assignmentRequirements')}
                        </span>
                      </span>

                      <span className="flex items-center gap-1 text-xs font-semibold text-[#0059BB] dark:text-blue-400 shrink-0">
                        <span>
                          {isSpecExpanded ? tDetail('collapseSpec') : tDetail('expandSpec')}
                        </span>
                        <span className="material-symbols-outlined text-[18px]">
                          {isSpecExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#E2E8F0] dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">description</span>
                      </div>
                      <h2 className="text-[18px] font-bold text-slate-900 dark:text-slate-100">
                        {hasExistingSubmission
                          ? tDetail('assignmentSpecCompareTitle')
                          : tDetail('assignmentRequirements')}
                      </h2>
                    </div>
                  )}

                  {!hasSpecContent ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                      {tDetail('noDescriptionNotice')}
                    </p>
                  ) : (
                    isSpecExpanded && (
                      <div
                        id="accordion-content"
                        className="space-y-4 text-slate-800 dark:text-slate-200 leading-relaxed pt-1"
                      >
                        {isDb01DemoFixture ? (
                          <>
                            <p className="text-sm">
                              Cho lược đồ quan hệ{' '}
                              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[#0059BB] dark:text-blue-400 font-semibold font-mono">
                                R(A, B, C, D, E, G)
                              </code>{' '}
                              với tập phụ thuộc hàm{' '}
                              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[#0059BB] dark:text-blue-400 font-semibold font-mono">
                                F = {'{'} AB → C, C → D, D → E, E → G, G → A {'}'}
                              </code>
                              .
                            </p>

                            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-700/80 flex flex-col gap-3">
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {tDetail('studentTasksTitle')}
                              </h3>
                              <ul className="space-y-3 list-none text-sm text-slate-800 dark:text-slate-200">
                                <li className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0059BB] dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    1
                                  </span>
                                  <div>
                                    <strong className="font-semibold text-slate-900 dark:text-slate-100">
                                      Yêu cầu 1:
                                    </strong>{' '}
                                    Xác định tất cả các khóa dự tuyển (<em>Candidate Keys</em>) của lược đồ quan hệ{' '}
                                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                                      R
                                    </code>
                                    . Trình bày chi tiết các bước tính bao đóng của tập thuộc tính.
                                  </div>
                                </li>
                                <li className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0059BB] dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    2
                                  </span>
                                  <div>
                                    <strong className="font-semibold text-slate-900 dark:text-slate-100">
                                      Yêu cầu 2:
                                    </strong>{' '}
                                    Xác định dạng chuẩn cao nhất hiện tại của lược đồ quan hệ{' '}
                                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                                      R
                                    </code>{' '}
                                    (1NF, 2NF, 3NF hay BCNF) đối với tập phụ thuộc hàm{' '}
                                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                                      F
                                    </code>{' '}
                                    và giải thích chi tiết lý do vi phạm.
                                  </div>
                                </li>
                                <li className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0059BB] dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    3
                                  </span>
                                  <div>
                                    <strong className="font-semibold text-slate-900 dark:text-slate-100">
                                      Yêu cầu 3:
                                    </strong>{' '}
                                    Áp dụng thuật toán phân rã bảo toàn phụ thuộc hàm và không mất mát thông tin để đưa lược đồ{' '}
                                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                                      R
                                    </code>{' '}
                                    về dạng chuẩn 3 (3NF). Nêu rõ thuật toán tìm phủ tối thiểu{' '}
                                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                                      F&apos;
                                    </code>
                                    .
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </>
                        ) : rawDescription ? (
                          <div className="whitespace-pre-line leading-relaxed text-sm break-words [overflow-wrap:anywhere]">
                            {rawDescription}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {tDetail('noDescriptionNotice')}
                          </p>
                        )}

                        {/* Tài liệu đề bài (Chỉ dựng khi có fileAttachmentUrl thật từ API) */}
                        {attachmentUrl && (
                          <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-800 p-3.5 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors gap-3 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isAttachmentPdf
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:border-rose-900/40'
                                    : 'bg-blue-50 text-[#0059BB] border-blue-200 dark:bg-blue-950/60 dark:border-blue-900/40'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[22px]">
                                  {isAttachmentPdf ? 'picture_as_pdf' : 'description'}
                                </span>
                              </div>
                              <div className="text-xs min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {attachmentDisplayName}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 truncate">
                                  {tDetail('officialAssignmentDocument')}
                                </p>
                              </div>
                            </div>
                            <a
                              href={attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-lg border border-[#0059BB] dark:border-blue-400 text-[#0059BB] dark:text-blue-400 hover:bg-[#0059BB] hover:text-white dark:hover:bg-blue-600 text-xs font-semibold transition-all shrink-0 whitespace-nowrap"
                            >
                              {tDetail('openAttachmentBtn')}
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </section>
              </div>

              {/* CỘT PHỤ (4 COLS TRÊN DESKTOP) */}
              <div className="lg:col-span-4 order-1 lg:order-2 space-y-6 min-w-0">
                {/* TRẠNG THÁI 1: CHƯA NỘP */}
                {isNotSubmitted && (
                  <>
                    <section className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs border-2 border-[#E2E8F0] dark:border-slate-800 flex flex-col gap-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {tDetail('submissionStatusTitle')}
                        </h3>
                      </div>

                      <div className="space-y-5">
                        <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col items-center justify-center text-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                              isPastDue
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-400'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[24px]">
                              {isPastDue ? 'event_busy' : 'pending_actions'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {tDetail('notSubmittedYetTitle')}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                              {dueInfo.isNoDeadline
                                ? tDetail('notSubmittedNoDeadlineDesc')
                                : isPastDue
                                  ? tDetail('notSubmittedPastDueDesc')
                                  : tDetail('notSubmittedYetDescStitch')}
                            </p>
                          </div>
                        </div>

                        {/* Primary CTA: Nộp bài ngay */}
                        {canSubmit ? (
                          <button
                            type="button"
                            onClick={() => {
                              router.push(`/classes/${classId}/assignments/${assignmentId}/submit`);
                            }}
                            className="w-full py-3 px-4 rounded-xl bg-[#0059BB] hover:bg-[#004899] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                          >
                            <span>{tDetail('submitNowBtn')}</span>
                            <span className="material-symbols-outlined text-[18px]">
                              arrow_forward
                            </span>
                          </button>
                        ) : (
                          <div className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs text-center border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">block</span>
                            <span>
                              {canSubmitEvaluation.reason === 'DEADLINE_PASSED'
                                ? tDetail('cannotSubmitPastDue')
                                : canSubmitEvaluation.reason === 'CLASS_READ_ONLY'
                                  ? tDetail('cannotSubmitClassReadOnly')
                                  : canSubmitEvaluation.reason === 'NOT_ACTIVE_STUDENT'
                                    ? tDetail('cannotSubmitNotStudent')
                                    : tDetail('cannotSubmitGeneric')}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Hướng dẫn nộp bài */}
                    <section className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs border-2 border-[#E2E8F0] dark:border-slate-800 flex flex-col gap-3.5">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-[#E2E8F0] dark:border-slate-800">
                        <span className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 text-[20px]">
                          help_outline
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {tDetail('submissionGuidelinesTitle')}
                        </h3>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400 shrink-0 mt-0.5">
                            link
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {tDetail('accessRightsCheck')}
                            </span>
                            <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                              {tDetail('accessRightsDesc')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {/* TRẠNG THÁI 2: ĐÃ NỘP - CHỜ CHẤM */}
                {isSubmittedPending && (
                  <>
                    <section className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs border-2 border-[#E2E8F0] dark:border-slate-800 flex flex-col gap-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {tDetail('submissionInfoTitle')}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-700/80 p-4 flex flex-col gap-3">
                          {/* Row 1: Thời gian nộp (vị trí chính duy nhất) */}
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 whitespace-nowrap pt-0.5">
                              <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400">
                                schedule
                              </span>
                              {tDetail('submissionTime')}
                            </span>
                            <div className="flex flex-col items-end gap-1 min-w-0">
                              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                {submissionTime.formatted || tDetail('noSubmissionTimeInfo')}
                              </span>
                              {shouldShowTimelinessBadge && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap border ${
                                    submission?.isLate
                                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  }`}
                                >
                                  {submission?.isLate
                                    ? tDetail('lateBadge')
                                    : tDetail('onTimeBadge')}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="h-px w-full bg-[#E2E8F0] dark:bg-slate-700/60" />

                          {/* Row 2: Trạng thái chấm (tách bạch với isLate) */}
                          <div
                            data-grading-status-row="true"
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                              <span
                                id="pending-grading-hourglass-frame"
                                aria-hidden="true"
                                className="inline-flex items-center justify-center w-6 h-6 shrink-0"
                              >
                                <Hourglass
                                  id="pending-grading-hourglass-icon"
                                  aria-hidden="true"
                                  strokeWidth={2}
                                  className={`block w-5 h-5 shrink-0 origin-center text-amber-600 dark:text-amber-400 ${
                                    isSubmittedPending
                                      ? 'animate-[spin_2s_linear_infinite] motion-reduce:animate-none'
                                      : ''
                                  }`}
                                />
                              </span>
                              <span data-grading-status-label="true">
                                {tDetail('gradingStatus')}
                              </span>
                            </span>
                            <span
                              data-pending-grading-badge="true"
                              className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 whitespace-nowrap"
                            >
                              {tDetail('pendingGradingBadge')}
                            </span>
                          </div>

                          <div className="h-px w-full bg-[#E2E8F0] dark:bg-slate-700/60" />

                          {/* Row 3: Điểm số (Chưa có điểm, không hiện 0) */}
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                              <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400">
                                grade
                              </span>
                              {tDetail('scoreLabel')}:
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {tDetail('notGradedYetScore')}
                            </span>
                          </div>
                        </div>

                        {/* Cụm hành động: Chỉnh sửa bài nộp & Hủy bài nộp */}
                        <div className="flex flex-col gap-2.5 pt-1">
                          {canEdit ? (
                            <button
                              id="btn-edit-submission"
                              type="button"
                              onClick={handleNavigateToEditSubmission}
                              className="w-full py-2.5 px-4 rounded-xl bg-[#0059BB] hover:bg-[#004493] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit_note</span>
                              <span>{tDetail('editSubmissionBtn')}</span>
                            </button>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              <button
                                id="btn-edit-submission-disabled"
                                type="button"
                                disabled
                                aria-describedby={editLockedReasonText ? 'edit-locked-reason' : undefined}
                                title={editLockedReasonText || tDetail('cannotEditGeneric')}
                                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                <span>{tDetail('editSubmissionBtn')}</span>
                              </button>
                              {editLockedReasonText && (
                                <p
                                  id="edit-locked-reason"
                                  className="text-xs text-slate-500 dark:text-slate-400 text-center leading-snug"
                                >
                                  {editLockedReasonText}
                                </p>
                              )}
                            </div>
                          )}

                          {canCancel ? (
                            <button
                              id="btn-cancel-submission"
                              type="button"
                              onClick={() => {
                                setCancelErrorMessage(null);
                                setIsCancelModalOpen(true);
                              }}
                              disabled={deleteMutation.isPending}
                              className="w-full py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[18px]">undo</span>
                              <span>{tDetail('cancelSubmission')}</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </section>

                    {/* Lưu ý bài nộp */}
                    <section className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs border-2 border-[#E2E8F0] dark:border-slate-800 flex flex-col gap-3.5">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-[#E2E8F0] dark:border-slate-800">
                        <span className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 text-[20px]">
                          info
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {tDetail('submissionNoticeTitle')}
                        </h3>
                      </div>

                      <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        <li className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-[17px] text-[#0059BB] dark:text-blue-400 shrink-0 mt-0.5">
                            rule
                          </span>
                          <p>{tDetail('submissionNoticeRule')}</p>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-[17px] text-[#0059BB] dark:text-blue-400 shrink-0 mt-0.5">
                            lock_open
                          </span>
                          <p>{tDetail('submissionNoticeAccess')}</p>
                        </li>
                      </ul>
                    </section>
                  </>
                )}

                {/* TRẠNG THÁI 3: ĐÃ CHẤM */}
                {isGraded && (
                  <>
                    <section className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#E2E8F0] dark:border-slate-800 p-6 shadow-xs flex flex-col items-center text-center gap-4">
                      <div className="w-full flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {tDetail('gradingResultTitle')}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400">
                            verified
                          </span>
                          {tDetail('officialScoreBadge')}
                        </span>
                      </div>

                      {hasInconsistentScore ? (
                        <div className="w-full p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex flex-col items-center justify-center gap-2">
                          <span>{tDetail('inconsistentScoreError')}</span>
                          <button
                            type="button"
                            onClick={() => refetch()}
                            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition cursor-pointer"
                          >
                            {tDetail('retryBtn')}
                          </button>
                        </div>
                      ) : (
                        <div className="w-full p-5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                            {tDetail('assignmentScoreLabel')}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[36px] font-bold text-slate-900 dark:text-slate-100 leading-none">
                              {formattedScore}
                            </span>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              / {formattedMaxScore} {t('points')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Detail metadata list (clean wrapping, no break-all on names/dates, no overflowing badges) */}
                      <div className="w-full text-left flex flex-col gap-3 pt-1 text-xs">
                        <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                            <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400">
                              person
                            </span>
                            {tDetail('gradedByTeacher')}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right break-words min-w-0">
                            {teacherGradedName || tDetail('noGradedByInfo')}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                            <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400">
                              event_available
                            </span>
                            {tDetail('gradedAtTime')}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right whitespace-nowrap">
                            {gradedTime.formatted || tDetail('noGradedAtInfo')}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 whitespace-nowrap pt-0.5">
                            <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400">
                              schedule
                            </span>
                            {tDetail('submittedAtTime')}
                          </span>
                          <div className="flex flex-col items-end gap-1 min-w-0">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {submissionTime.formatted || tDetail('noSubmissionTimeInfo')}
                            </span>
                            {shouldShowTimelinessBadge && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap border ${
                                  submission?.isLate
                                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                }`}
                              >
                                {submission?.isLate
                                  ? tDetail('lateBadge')
                                  : tDetail('onTimeBadge')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">
                              lock
                            </span>
                            {tDetail('submissionStatusLabel')}
                          </span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-[11px] text-right">
                            {tDetail('readOnlyOfficialResult')}
                          </span>
                        </div>
                      </div>
                    </section>

                    {/* Lưu ý & Trao đổi học tập */}
                    <section className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#E2E8F0] dark:border-slate-800 p-6 shadow-xs space-y-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 text-[18px]">
                          info
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {tDetail('studyTipsTitle')}
                        </h3>
                      </div>
                      <ul className="space-y-2.5 leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400 shrink-0 mt-0.5">
                            rate_review
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {tDetail('compareFeedbackTitle')}
                            </span>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                              {tDetail('compareFeedbackDesc')}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400 shrink-0 mt-0.5">
                            forum
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {tDetail('studyDiscussionTitle')}
                            </span>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                              {tDetail('studyDiscussionDesc')}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODAL XÁC NHẬN HỦY BÀI NỘP */}
      {isCancelModalOpen && (
        <div
          id="cancel-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-all duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border-2 border-[#E2E8F0] dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <span className="material-symbols-outlined text-[24px]">warning</span>
                <h3
                  id="cancel-modal-title"
                  className="text-base font-bold text-slate-900 dark:text-slate-100"
                >
                  {tDetail('cancelModalTitle')}
                </h3>
              </div>
              <button
                id="btn-close-modal"
                type="button"
                aria-label={tDetail('closeModalAria')}
                onClick={() => {
                  if (!deleteMutation.isPending) {
                    setCancelErrorMessage(null);
                    setIsCancelModalOpen(false);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>{tDetail('cancelSubmissionConfirmDesc')}</p>

              {/* Cảnh báo nộp lại phản ánh đúng điều kiện thực tế (kể cả khi dueDate=null) */}
              {!dueInfo.isNoDeadline && isPastDue && !allowLate ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">
                    warning
                  </span>
                  <span>{tDetail('cancelWarningPastDueNoLate')}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {dueInfo.isNoDeadline
                    ? tDetail('resubmitNoDeadlineNotice')
                    : tDetail('resubmitPermittedNotice')}
                </p>
              )}
            </div>

            {cancelErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                <span>{cancelErrorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                id="btn-keep-submission"
                type="button"
                onClick={() => {
                  setCancelErrorMessage(null);
                  setIsCancelModalOpen(false);
                }}
                disabled={deleteMutation.isPending}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {tDetail('keepSubmission')}
              </button>
              <button
                id="btn-confirm-cancel"
                type="button"
                onClick={handleConfirmCancel}
                disabled={deleteMutation.isPending}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {deleteMutation.isPending ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    <span>{tDetail('cancelling')}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                    <span>{tDetail('confirmCancel')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
