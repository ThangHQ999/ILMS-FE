'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useClassAssignmentsPaged } from '../hooks/useClassAssignmentsPaged';
import { useDeleteAssignment } from '../hooks/useDeleteAssignment';
import { useAssignmentGradingProgress } from '../hooks/useAssignmentGradingProgress';
import { getAssignmentById } from '../services/assignment.service';
import { TeacherExamsTableView } from './TeacherExamsTableView';
import {
  ASSESSMENT_UI,
  AssessmentAsidePanel,
  AssessmentBadge,
  AssessmentCardHeader,
  AssessmentListHeader,
  AssessmentSubtabToggle,
  AssessmentTwoColumnLayout,
} from './AssessmentListPrimitives';
import type { AssignmentItem } from '../types';

export interface TeacherAssignmentsTableViewProps {
  classId: string;
  routeClassId?: string;
  className?: string;
  canManageExams?: boolean;
  onToast?: (message: string) => void;
  onCreateAssignment?: () => void;
  onEditAssignment?: (item: AssignmentItem) => void;
  onCreateExam?: () => void;
  onEditExam?: (examId: string) => void;
  onViewExam?: (examId: string) => void;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

type StatusFilterType = 'ALL' | 'ACTIVE' | 'PAST_DUE' | 'NO_DEADLINE';

function formatTeacherDueDate(dueDate?: string | null): string {
  if (!dueDate) return '';
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return dueDate;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} – ${day}/${month}/${year}`;
}

function formatCreatedDate(createdDate?: string | null, fallbackIndex = 0): string {
  if (createdDate) {
    const d = new Date(createdDate);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
  // Mẫu ngày mặc định cho demo data khớp Stitch
  const mockDates = ['01/11/2024', '20/10/2024', '25/10/2024', '27/10/2024', '30/10/2024'];
  return mockDates[fallbackIndex % mockDates.length];
}

function getAssignmentVisuals(item: AssignmentItem, index: number) {
  const title = (item.title || '').toLowerCase();
  if (title.includes('chuẩn hóa') || title.includes('tuần 6')) {
    return {
      icon: 'terminal',
      courseCode: 'HỌC PHẦN CS-202',
      colorBg: 'bg-blue-50 dark:bg-blue-950/60',
      colorText: 'text-blue-600 dark:text-blue-400',
    };
  }
  if (title.includes('lược đồ') || title.includes('erd') || title.includes('tuần 7')) {
    return {
      icon: 'schema',
      courseCode: 'HỌC PHẦN CS-202',
      colorBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      colorText: 'text-indigo-600 dark:text-indigo-400',
    };
  }
  if (title.includes('sql') || title.includes('truy vấn')) {
    return {
      icon: 'database',
      courseCode: 'HỌC PHẦN CS-202',
      colorBg: 'bg-purple-50 dark:bg-purple-950/60',
      colorText: 'text-purple-600 dark:text-purple-400',
    };
  }
  if (title.includes('bcnf') || title.includes('phụ thuộc hàm') || title.includes('tuần 8')) {
    return {
      icon: 'account_tree',
      courseCode: 'HỌC PHẦN CS-202',
      colorBg: 'bg-sky-50 dark:bg-sky-950/60',
      colorText: 'text-sky-600 dark:text-sky-400',
    };
  }
  if (item.type === 'QUIZ' || title.includes('trắc nghiệm') || title.includes('quiz')) {
    return {
      icon: 'quiz',
      courseCode: 'HỌC PHẦN CS-202',
      colorBg: 'bg-slate-800 dark:bg-slate-700',
      colorText: 'text-white',
    };
  }

  // Fallback palette cycling
  const palettes = [
    { icon: 'assignment', courseCode: 'HỌC PHẦN CS-202', colorBg: 'bg-blue-50 dark:bg-blue-950/60', colorText: 'text-blue-600 dark:text-blue-400' },
    { icon: 'terminal', courseCode: 'HỌC PHẦN CS-202', colorBg: 'bg-indigo-50 dark:bg-indigo-950/60', colorText: 'text-indigo-600 dark:text-indigo-400' },
    { icon: 'code', courseCode: 'HỌC PHẦN CS-202', colorBg: 'bg-purple-50 dark:bg-purple-950/60', colorText: 'text-purple-600 dark:text-purple-400' },
  ];
  return palettes[index % palettes.length];
}

function getAttachmentFileName(url?: string | null): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split('/');
    const last = parts[parts.length - 1];
    return last || url;
  } catch {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }
}

/**
 * Subcomponent for Rendering Unified Right-Aligned Status Badges on Teacher Assignment Cards.
 * Separates deadline-passed status ("Quá hạn") from real aggregated grading progress
 * ("Đã chấm" when total > 0 && graded === total; "Chờ chấm" with spinning hourglass when pending > 0).
 */
function TeacherAssignmentHeaderBadges({
  assignmentId,
  classId,
  dueDate,
  allowLateSubmission,
  chapter,
  surface,
}: {
  assignmentId: string;
  classId: string;
  dueDate?: string | null;
  allowLateSubmission?: boolean | null;
  chapter?: string | null;
  surface: 'navy' | 'light';
}) {
  const t = useTranslations('assignments.teacher');
  const { data: progress, isError } = useAssignmentGradingProgress(assignmentId, classId);

  const hasDueDate = Boolean(dueDate);
  const dueMs = dueDate ? new Date(dueDate).getTime() : NaN;
  const isPastDue = hasDueDate && !isNaN(dueMs) && dueMs < Date.now();

  const total = progress?.totalSubmissions ?? 0;
  const graded = progress?.gradedSubmissions ?? 0;
  const pending = progress?.pendingSubmissions ?? 0;
  const isAllGraded = !isError && total > 0 && graded === total;
  const hasPendingGrading = !isError && total > 0 && pending > 0;

  return (
    <>
      {chapter && chapter.trim() && (
        <AssessmentBadge variant="neutral" surface={surface}>
          {chapter.trim()}
        </AssessmentBadge>
      )}
      {hasDueDate && (
        <AssessmentBadge
          variant={allowLateSubmission ? 'lateAllowed' : 'neutral'}
          surface={surface}
        >
          {allowLateSubmission
            ? surface === 'navy'
              ? t('featured.lateAllowed')
              : t('card.lateAllowed')
            : surface === 'navy'
              ? t('featured.lateForbidden')
              : t('card.lateForbidden')}
        </AssessmentBadge>
      )}
      {isPastDue && (
        <AssessmentBadge variant="overdue" surface={surface} icon="alarm">
          {t('card.badgeOverdue')}
        </AssessmentBadge>
      )}
      {isAllGraded && (
        <AssessmentBadge variant="graded" surface={surface} icon="check_circle">
          {t('card.badgeGraded')}
        </AssessmentBadge>
      )}
      {hasPendingGrading && (
        <AssessmentBadge
          variant="pendingGrading"
          surface={surface}
          icon="hourglass_top"
          spinIcon
        >
          {t('card.badgePendingGrading', { count: pending })}
        </AssessmentBadge>
      )}
    </>
  );
}

/**
 * Subcomponent for Rendering Grading Progress Bar
 */
function AssignmentGradingDisplay({
  assignmentId,
  classId,
  variant,
}: {
  assignmentId: string;
  classId: string;
  variant: 'featured' | 'standard';
}) {
  const t = useTranslations('assignments.teacher');
  const { data: progress, isError } = useAssignmentGradingProgress(assignmentId, classId);

  const total = progress?.totalSubmissions ?? 0;
  const graded = progress?.gradedSubmissions ?? 0;
  const pending = progress?.pendingSubmissions ?? 0;
  const rate = progress?.completionRate ?? 0;

  if (variant === 'featured') {
    if (isError) {
      return (
        <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-amber-400">warning</span>
          <span>{t('featured.loadError')}</span>
        </div>
      );
    }

    if (total === 0) {
      return (
        <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-slate-400">help_outline</span>
          <span>{t('card.noSubmissions')}</span>
        </div>
      );
    }

    return (
      <div className="mt-5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-1.5">
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="material-symbols-outlined text-[16px] text-blue-400 shrink-0">
              assignment_turned_in
            </span>
            <span>
              {t('featured.gradingProgress')}{' '}
              <strong className="text-white">
                {t('featured.gradedCount', { graded, total })}
              </strong>
              {pending > 0 ? (
                <>
                  {' • '}
                  <span className="text-slate-300">
                    {t('featured.pendingCount', { count: pending })}
                  </span>
                </>
              ) : (
                <>
                  {' • '}
                  <span className="text-emerald-300 font-medium">
                    {t('card.allGraded')}
                  </span>
                </>
              )}
            </span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium shrink-0">
            {t('featured.completionRate')}{' '}
            <strong className="text-white">{rate}%</strong>
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
          />
        </div>
      </div>
    );
  }

  // Standard White Card Progress
  if (isError) {
    return (
      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
        <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-amber-400 shrink-0">
          warning
        </span>
        <span>{t('card.loadError')}</span>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">
          help_outline
        </span>
        <span>{t('card.noSubmissions')}</span>
      </div>
    );
  }

  if (total > 0 && graded === total) {
    return (
      <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
          <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400 shrink-0">
            check_circle
          </span>
          <span>
            {t('card.gradingProgress')}{' '}
            <strong>{t('featured.gradedCount', { graded, total })}</strong>
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
          {t('card.allGraded')}
        </span>
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
        <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400 shrink-0">
          assignment_turned_in
        </span>
        <span>
          {t('card.gradingProgress')}{' '}
          <strong className="text-blue-600 dark:text-blue-400">
            {t('featured.gradedCount', { graded, total })}
          </strong>
          {' • '}
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {t('featured.pendingCount', { count: pending })}
          </span>
        </span>
      </div>
      <span className="text-[11px] text-slate-400 shrink-0">
        {t('card.totalSubmissions', { count: total })}
      </span>
    </div>
  );
}

export function TeacherAssignmentsTableView({
  classId,
  routeClassId,
  className = '',
  canManageExams,
  onToast,
  onCreateAssignment,
  onEditAssignment,
  onCreateExam,
  onEditExam,
  onViewExam,
}: TeacherAssignmentsTableViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('assignments.teacher');
  const tExams = useTranslations('assignments.exams.teacher');
  const targetRouteClass = routeClassId || classId;

  const querySearch = searchParams.get('search') || '';
  const queryPage = searchParams.get('page');
  const initialPage = queryPage ? Math.max(0, parseInt(queryPage, 10) - 1) : 0;
  const queryStatus = (searchParams.get('status') as StatusFilterType) || 'ALL';

  const querySubtab = searchParams.get('subtab') || searchParams.get('type');
  const initialTypeTab: 'assignments' | 'exams' =
    querySubtab === 'exams' ? 'exams' : 'assignments';

  const [activeTypeTab, setActiveTypeTab] = useState<'assignments' | 'exams'>(initialTypeTab);
  const [examsTotalCount, setExamsTotalCount] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(querySearch);

  // Keep activeTypeTab synchronized with URL changes (Back/Forward/F5)
  useEffect(() => {
    setActiveTypeTab(querySubtab === 'exams' ? 'exams' : 'assignments');
  }, [querySubtab]);
  const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>(queryStatus);
  const [page, setPage] = useState(initialPage);
  const pageSize = 5;

  const [assignmentToDelete, setAssignmentToDelete] = useState<AssignmentItem | null>(null);
  const [assignmentToView, setAssignmentToView] = useState<AssignmentItem | null>(null);
  const [loadingViewId, setLoadingViewId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Synchronize URL with search, page, status
  const syncUrl = useCallback(
    (newPage: number, newSearch: string, newStatus: StatusFilterType) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'assignments');

      if (newSearch.trim()) {
        params.set('search', newSearch.trim());
      } else {
        params.delete('search');
      }

      if (newStatus !== 'ALL') {
        params.set('status', newStatus);
      } else {
        params.delete('status');
      }

      if (newPage > 0) {
        params.set('page', String(newPage + 1));
      } else {
        params.delete('page');
      }

      router.replace(`/classes/${targetRouteClass}?${params.toString()}`, { scroll: false });
    },
    [targetRouteClass, router, searchParams]
  );

  // Reset pagination to page 0 when classId changes
  useEffect(() => {
    setPage(0);
  }, [classId]);

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      const currentUrlSearch = searchParams.get('search') || '';
      const currentUrlPage = searchParams.get('page');
      const currentUrlStatus = searchParams.get('status') || 'ALL';
      const expectedPageStr = page > 0 ? String(page + 1) : null;

      if (
        currentUrlSearch !== searchQuery.trim() ||
        currentUrlPage !== expectedPageStr ||
        currentUrlStatus !== statusFilter
      ) {
        syncUrl(page, searchQuery, statusFilter);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, page, statusFilter, searchParams, syncUrl]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(0);
    syncUrl(0, '', statusFilter);
  };

  const handleStatusChange = (newStatus: StatusFilterType) => {
    setStatusFilter(newStatus);
    setPage(0);
    syncUrl(0, searchQuery, newStatus);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    syncUrl(newPage, searchQuery, statusFilter);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    if (onToast) onToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Query paged assignments (size=5)
  const { data, isLoading, isError, refetch } = useClassAssignmentsPaged(classId, {
    page,
    size: pageSize,
    search: debouncedSearch,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const deleteMutation = useDeleteAssignment(classId);

  const rawItems = useMemo(() => data?.items ?? [], [data?.items]);
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const fromRecord = totalElements === 0 ? 0 : page * pageSize + 1;
  const toRecord = Math.min((page + 1) * pageSize, totalElements);

  // Featured card condition: Page 0, no active search text, and filter is ALL
  const isDefaultOverview = page === 0 && !debouncedSearch.trim() && statusFilter === 'ALL';
  const hasFeaturedCard = isDefaultOverview && rawItems.length > 0;
  const featuredItem = hasFeaturedCard ? rawItems[0] : null;

  // Items to render as standard white cards
  const standardCardItems = useMemo(() => {
    if (hasFeaturedCard) {
      return rawItems.slice(1);
    }
    return rawItems;
  }, [hasFeaturedCard, rawItems]);

  const handleCreateClick = () => {
    if (onCreateAssignment) {
      onCreateAssignment();
    } else {
      router.push(`/classes/${classId}?tab=assignments&action=create`);
    }
  };

  const handleEditClick = (item: AssignmentItem) => {
    if (onEditAssignment) {
      onEditAssignment(item);
    } else {
      router.push(`/classes/${classId}?tab=assignments&action=edit&assignmentId=${item.id}`);
    }
  };

  const handleOpenViewModal = async (item: AssignmentItem) => {
    setLoadingViewId(item.id);
    try {
      const fullItem = await getAssignmentById(item.id, classId);
      setAssignmentToView(fullItem || item);
    } catch {
      setAssignmentToView(item);
    } finally {
      setLoadingViewId(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (!assignmentToDelete) return;
    deleteMutation.mutate(
      { assignmentId: assignmentToDelete.id, classId },
      {
        onSuccess: () => {
          showNotification(t('toasts.deleteSuccess'), 'success');
          setAssignmentToDelete(null);
          // If current page is empty after deleting the only item, go back one page
          if (page > 0 && rawItems.length <= 1) {
            handlePageChange(page - 1);
          } else {
            refetch();
          }
        },
        onError: (err: unknown) => {
          const status =
            (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
            (err as { response?: { status?: number } })?.response?.status;
          let errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (err as Error)?.message;

          if (status === 403) {
            errorMsg = errorMsg || t('toasts.deleteForbidden');
          } else if (status === 409) {
            const backendMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            errorMsg = backendMsg || (err as Error)?.message || t('toasts.deleteError');

            const responseData =
              (err as { responseData?: unknown })?.responseData ??
              (err as { response?: { data?: unknown } })?.response?.data;
            const targetAssignmentId =
              (err as { assignmentId?: string })?.assignmentId ?? assignmentToDelete.id;

            if (typeof window !== 'undefined') {
              (window as unknown as { __lastAssignmentDeleteConflict?: unknown }).__lastAssignmentDeleteConflict = {
                assignmentId: targetAssignmentId,
                httpStatus: 409,
                responseData,
                timestamp: new Date().toISOString(),
              };
            }
          } else if (!errorMsg) {
            errorMsg = t('toasts.deleteError');
          }
          showNotification(errorMsg, 'error');
          setAssignmentToDelete(null);
        },
      }
    );
  };

  const handleSubtabChange = (nextTab: 'assignments' | 'exams') => {
    setActiveTypeTab(nextTab);
    setPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'assignments');
    params.delete('page');
    if (nextTab === 'exams') {
      params.set('subtab', 'exams');
    } else {
      params.delete('subtab');
      params.delete('type');
    }
    router.replace(`/classes/${targetRouteClass}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={ASSESSMENT_UI.wrapper}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-medium border ${
              toast.type === 'error'
                ? 'bg-red-900/95 text-white border-red-700'
                : toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-blue-900/95 text-white border-blue-700'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                toast.type === 'error'
                  ? 'text-red-400'
                  : toast.type === 'success'
                  ? 'text-emerald-400'
                  : 'text-blue-300'
              }`}
            >
              {toast.type === 'error'
                ? 'error'
                : toast.type === 'success'
                ? 'check_circle'
                : 'info'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Unified Top Header Row */}
      <AssessmentListHeader
        title={activeTypeTab === 'exams' ? tExams('pageTitle') : t('title')}
        subtitle={className || undefined}
        countBadgeId={activeTypeTab === 'exams' ? 'totalExamsCountBadge' : undefined}
        countBadgeText={
          activeTypeTab === 'exams' && examsTotalCount !== null
            ? tExams('countBadge', { count: examsTotalCount })
            : null
        }
        actions={
          <>
            <AssessmentSubtabToggle
              activeTab={activeTypeTab}
              assignmentsLabel={t('toggleAssignments')}
              examsLabel={t('toggleExams')}
              onChange={handleSubtabChange}
            />

            {activeTypeTab === 'assignments' ? (
              <button
                id="btnCreateAssignment"
                type="button"
                onClick={handleCreateClick}
                className={ASSESSMENT_UI.createCtaBtn}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>{t('createAssignment')}</span>
              </button>
            ) : canManageExams ? (
              <button
                id="btnCreateExam"
                type="button"
                onClick={() => {
                  if (onCreateExam) {
                    onCreateExam();
                  } else {
                    router.push(`/classes/${targetRouteClass}?tab=assignments&subtab=exams&action=create`);
                  }
                }}
                className={ASSESSMENT_UI.createCtaBtn}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>{tExams('createExamBtn')}</span>
              </button>
            ) : null}
          </>
        }
      />

      {/* Main Content Area */}
      {activeTypeTab === 'assignments' ? (
        <AssessmentTwoColumnLayout
          main={
            <>
              {/* Featured Navy Card (only on Page 0, no search, filter ALL) */}
              {hasFeaturedCard && featuredItem && (
                <div
                  data-assignment-featured="true"
                  className={`${ASSESSMENT_UI.featuredCard} relative overflow-hidden`}
                >
                  {/* Unified Header: Left Icon + Title + Course/Date, Right Badge Group */}
                  <AssessmentCardHeader
                    icon={
                      <div
                        data-card-icon-box="true"
                        className={`${ASSESSMENT_UI.cardIconBox} bg-blue-500/20 border border-blue-400/30 text-sky-300`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '22px', lineHeight: 1 }}
                        >
                          {getAssignmentVisuals(featuredItem, 0).icon}
                        </span>
                      </div>
                    }
                    title={
                      <h2
                        onClick={() => router.push(`/classes/${targetRouteClass}/assignments/${featuredItem.id}`)}
                        className={`${ASSESSMENT_UI.cardTitle} text-white hover:text-sky-300 transition-colors cursor-pointer`}
                      >
                        {featuredItem.title}
                      </h2>
                    }
                    subtitle={
                      <div className="flex items-center flex-wrap gap-x-2 mt-1">
                        <span className="text-xs font-bold tracking-wider uppercase text-blue-300">
                          {getAssignmentVisuals(featuredItem, 0).courseCode}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {t('featured.createdPrefix')} {formatCreatedDate(featuredItem.createdAt, 0)}
                        </span>
                      </div>
                    }
                    badges={
                      <TeacherAssignmentHeaderBadges
                        assignmentId={featuredItem.id}
                        classId={classId}
                        dueDate={featuredItem.dueDate}
                        allowLateSubmission={featuredItem.allowLateSubmission}
                        chapter={featuredItem.chapter}
                        surface="navy"
                      />
                    }
                  />
                  {featuredItem.description && (
                    <p className="text-sm text-slate-300/90 line-clamp-2 mt-4 leading-relaxed break-words [overflow-wrap:anywhere]">
                      {featuredItem.description}
                    </p>
                  )}

                  {/* Metadata Row: Due Date & Max Score */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">
                        event
                      </span>
                      <span>
                        {t('featured.dueDate')}{' '}
                        <strong className="text-white">
                          {featuredItem.dueDate ? formatTeacherDueDate(featuredItem.dueDate) : t('noDueDate')}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-400">
                        star
                      </span>
                      <span>
                        {t('featured.maxScore')}{' '}
                        <strong className="text-white">
                          {featuredItem.maxScore ?? 10} {t('points')}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Attachment File Link (if any) */}
                  {featuredItem.fileAttachmentUrl && (
                    <div className="mt-3 min-w-0">
                      <a
                        href={featuredItem.fileAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 underline underline-offset-2 max-w-full"
                      >
                        <span className="material-symbols-outlined text-[15px] shrink-0">description</span>
                        <span className="truncate">{getAttachmentFileName(featuredItem.fileAttachmentUrl)}</span>
                      </a>
                    </div>
                  )}

                  {/* Grading Progress Bar Component */}
                  <AssignmentGradingDisplay
                    assignmentId={featuredItem.id}
                    classId={classId}
                    variant="featured"
                  />

                  {/* Bottom Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-xs">
                      <button
                        type="button"
                        onClick={() => handleEditClick(featuredItem)}
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>{t('featured.edit')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignmentToDelete(featuredItem)}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>{t('featured.delete')}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenViewModal(featuredItem)}
                        disabled={loadingViewId === featuredItem.id}
                        className={ASSESSMENT_UI.featuredSecondaryBtn}
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        <span>{t('featured.viewAssignment')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/classes/${targetRouteClass}/assignments/${featuredItem.id}`)}
                        className={ASSESSMENT_UI.featuredPrimaryBtn}
                      >
                        <span>{t('featured.viewSubmissions')}</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Unified Toolbar Card: Search input + Status Filter Dropdown (44px controls) */}
              <div className={`${ASSESSMENT_UI.toolbarCard} flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3`}>
                {/* Search Bar */}
                <div className="relative flex-1 min-w-0">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(0);
                    }}
                    placeholder={t('searchPlaceholder')}
                    className={ASSESSMENT_UI.inputControl}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>

                {/* Status Filter Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    filter_list
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value as StatusFilterType)}
                    className={ASSESSMENT_UI.selectControl}
                  >
                    <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {t('statusFilter.all')}
                    </option>
                    <option value="ACTIVE" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {t('statusFilter.active')}
                    </option>
                    <option value="PAST_DUE" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {t('statusFilter.pastDue')}
                    </option>
                    <option value="NO_DEADLINE" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {t('statusFilter.noDeadline')}
                    </option>
                  </select>
                </div>
              </div>

              {/* Async UI States */}
              {isLoading && (
                <div className={ASSESSMENT_UI.cardList}>
                  {[1, 2, 3, 4].map((idx) => (
                    <div
                      key={idx}
                      className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border-2 border-[#E2E8F0] dark:border-slate-800"
                    />
                  ))}
                </div>
              )}

              {isError && !isLoading && (
                <div className={ASSESSMENT_UI.errorCard}>
                  <span className="material-symbols-outlined text-red-500 text-[40px] mb-2">
                    cloud_off
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t('errorTitle')}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    {t('errorDesc')}
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className={`mt-4 ${ASSESSMENT_UI.primaryBtn}`}
                  >
                    {t('retry')}
                  </button>
                </div>
              )}

              {!isLoading && !isError && rawItems.length === 0 && (
                <div className={ASSESSMENT_UI.emptyCard}>
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[48px] mb-2">
                    assignment_late
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t('emptyTitle')}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    {t('emptyDesc')}
                  </p>
                </div>
              )}

              {/* List of Standard White Cards */}
              {!isLoading && !isError && standardCardItems.length > 0 && (
                <div className={ASSESSMENT_UI.cardList}>
                  {standardCardItems.map((item, idx) => {
                    const cardIndex = hasFeaturedCard ? idx + 1 : idx;
                    const visuals = getAssignmentVisuals(item, cardIndex);
                    const formattedDue = formatTeacherDueDate(item.dueDate);
                    const maxScoreVal = item.maxScore ?? item.studentMaxScore ?? 10;

                    return (
                      <div
                        key={item.id}
                        className={`${ASSESSMENT_UI.surfaceCard} space-y-4`}
                      >
                        {/* Unified Header: Left Icon + Title + Course/Date, Right Badge Group */}
                        <AssessmentCardHeader
                          icon={
                            <div
                              data-card-icon-box="true"
                              className={`${ASSESSMENT_UI.cardIconBox} ${visuals.colorBg} ${visuals.colorText}`}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '22px', lineHeight: 1 }}
                              >
                                {visuals.icon}
                              </span>
                            </div>
                          }
                          title={
                            <h3
                              onClick={() => router.push(`/classes/${targetRouteClass}/assignments/${item.id}`)}
                              className={`${ASSESSMENT_UI.cardTitle} text-slate-900 dark:text-white hover:text-[#0059BB] dark:hover:text-blue-400 transition-colors cursor-pointer`}
                            >
                              {item.title}
                            </h3>
                          }
                          subtitle={
                            <div className="flex items-center flex-wrap gap-x-2 mt-1">
                              <span className="text-xs font-bold tracking-wider uppercase text-slate-600 dark:text-slate-300">
                                {visuals.courseCode}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                • {t('card.createdPrefix')} {formatCreatedDate(item.createdAt, cardIndex)}
                              </span>
                            </div>
                          }
                          badges={
                            <TeacherAssignmentHeaderBadges
                              assignmentId={item.id}
                              classId={classId}
                              dueDate={item.dueDate}
                              allowLateSubmission={item.allowLateSubmission}
                              chapter={item.chapter}
                              surface="light"
                            />
                          }
                        />

                        {item.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere]">
                            {item.description}
                          </p>
                        )}

                        {/* Metadata Row: Due Date & Max Score */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">
                              event
                            </span>
                            <span>
                              {t('card.dueDate')}{' '}
                              <strong className="text-slate-700 dark:text-slate-200">
                                {item.dueDate ? formattedDue : t('noDueDate')}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-amber-500">
                              star
                            </span>
                            <span>
                              {t('card.maxScore')}{' '}
                              <strong className="text-slate-700 dark:text-slate-200">
                                {maxScoreVal} {t('points')}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Attachment Link (if any) */}
                        {item.fileAttachmentUrl && (
                          <div className="min-w-0">
                            <a
                              href={item.fileAttachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[#0059BB] dark:text-blue-400 hover:underline max-w-full"
                            >
                              <span className="material-symbols-outlined text-[15px] shrink-0">
                                description
                              </span>
                              <span className="truncate">{getAttachmentFileName(item.fileAttachmentUrl)}</span>
                            </a>
                          </div>
                        )}

                        {/* Grading Progress Bar */}
                        <AssignmentGradingDisplay
                          assignmentId={item.id}
                          classId={classId}
                          variant="standard"
                        />

                        {/* Bottom Actions Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-4 text-xs">
                            <button
                              type="button"
                              onClick={() => handleEditClick(item)}
                              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-[#0059BB] dark:hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              <span>{t('card.edit')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAssignmentToDelete(item)}
                              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>{t('card.delete')}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleOpenViewModal(item)}
                              disabled={loadingViewId === item.id}
                              className={ASSESSMENT_UI.secondaryBtn}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                visibility
                              </span>
                              <span>{t('card.viewAssignment')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(`/classes/${targetRouteClass}/assignments/${item.id}`)}
                              className={ASSESSMENT_UI.primaryBtn}
                            >
                              <span>{t('card.viewSubmissions')}</span>
                              <span className="material-symbols-outlined text-[18px]">
                                arrow_forward
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Footer */}
              {!isLoading && !isError && totalElements > 0 && (
                <div className={`${ASSESSMENT_UI.paginationCard} text-xs sm:text-sm text-slate-600 dark:text-slate-400`}>
                  <div className="font-medium">
                    {t('pagination.showing')}{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {fromRecord}–{toRecord}
                    </span>{' '}
                    {t('pagination.of')}{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {totalElements}
                    </span>{' '}
                    {t('pagination.items')}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => handlePageChange(Math.max(0, page - 1))}
                      className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center justify-center"
                      aria-label={t('pagination.prev')}
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePageChange(idx)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition cursor-pointer ${
                            page === idx
                              ? 'bg-[#0059BB] text-white shadow-xs'
                              : 'border border-[#E2E8F0] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={page >= totalPages - 1}
                      onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                      className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center justify-center"
                      aria-label={t('pagination.next')}
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          }
          aside={
            <AssessmentAsidePanel icon="help_outline" title={t('sidebar.title')}>
              {/* Note item 1 */}
              <div className="p-3.5 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/50 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400 shrink-0">
                    tune
                  </span>
                  <span>{t('sidebar.item1Title')}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {t('sidebar.item1Desc')}
                </p>
              </div>

              {/* Note item 2 */}
              <div className="p-3.5 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/50 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400 shrink-0">
                    rate_review
                  </span>
                  <span>{t('sidebar.item2Title')}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {t('sidebar.item2Desc')}
                </p>
              </div>
            </AssessmentAsidePanel>
          }
        />
      ) : (
        <TeacherExamsTableView
          classId={classId}
          routeClassId={targetRouteClass}
          className={className}
          hideHeader
          canManageExams={canManageExams}
          onTotalCountChange={setExamsTotalCount}
          onToast={showNotification}
          onCreateExam={onCreateExam}
          onEditExam={onEditExam}
          onViewExam={onViewExam}
        />
      )}

      {/* View Assignment Modal ("Xem bài tập") */}
      {assignmentToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase block">
                  {t('viewModal.title')}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {assignmentToView.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignmentToView(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="space-y-4 text-xs max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Lớp</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-xs">
                    {className}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{t('columns.maxScore')}</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-xs">
                    {assignmentToView.maxScore ?? 10} {t('points')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{t('columns.dueDate')}</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-xs">
                    {assignmentToView.dueDate
                      ? formatTeacherDueDate(assignmentToView.dueDate)
                      : 'Không có hạn nộp'}
                  </strong>
                </div>
                {assignmentToView.dueDate && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">{t('columns.lateSubmission')}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                        assignmentToView.allowLateSubmission
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {assignmentToView.allowLateSubmission
                        ? t('lateStatus.allowed')
                        : t('lateStatus.notAllowed')}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('viewModal.instructions')}
                </span>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {assignmentToView.description || t('viewModal.noInstructions')}
                </div>
              </div>

              {assignmentToView.fileAttachmentUrl && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('viewModal.attachment')}
                  </span>
                  <a
                    href={assignmentToView.fileAttachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">description</span>
                    <span>{getAttachmentFileName(assignmentToView.fileAttachmentUrl)}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Actions - Right aligned: [Đóng] -> [Chỉnh sửa bài tập] */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAssignmentToView(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                {t('viewModal.close')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = assignmentToView;
                  setAssignmentToView(null);
                  handleEditClick(target);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-98"
              >
                {t('viewModal.editBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">delete_forever</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('deleteModal.title')}
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t('deleteModal.message', { title: assignmentToDelete.title })}
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
                warning
              </span>
              <span>{t('deleteModal.warning')}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setAssignmentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {t('deleteModal.cancel')}
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteMutation.isPending && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>
                  {deleteMutation.isPending
                    ? t('deleteModal.deleting')
                    : t('deleteModal.confirm')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
