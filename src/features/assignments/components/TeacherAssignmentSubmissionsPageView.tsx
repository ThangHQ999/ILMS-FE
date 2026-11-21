'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClassDetail } from '@/features/classes/hooks/useClassDetail';
import { useCurrentUser } from '@/features/auth';
import { useUserRole } from '@/hooks/useUserRole';
import { useAssignmentItem } from '../hooks/useAssignmentQueries';
import {
  useAssignmentSubmissions,
  useBulkGradeSubmissions,
} from '../hooks/useTeacherSubmissions';
import {
  evaluateCanManageClassSubmissions,
  formatAssignmentDueDate,
  formatSubmissionTime,
  formatScore,
  isDemoAssignment,
} from '../services/assignment.service';
import type { TeacherSubmissionItem } from '../schemas/assignment.schema';
import {
  TeacherBulkGradeModal,
  type BulkGradeTargetItem,
} from './TeacherBulkGradeModal';

export interface TeacherAssignmentSubmissionsPageViewProps {
  classId: string;
  assignmentId: string;
  userFullName?: string;
}

type StatusFilterValue = 'ALL' | 'SUBMITTED' | 'LATE' | 'GRADED';
type SortOptionValue = 'submittedAt,desc' | 'submittedAt,asc';

const VALID_STATUS_FILTERS: StatusFilterValue[] = ['ALL', 'SUBMITTED', 'LATE', 'GRADED'];
const PAGE_SIZE = 5;

function parseStatusParam(raw: string | null): StatusFilterValue {
  if (raw && VALID_STATUS_FILTERS.includes(raw as StatusFilterValue)) {
    return raw as StatusFilterValue;
  }
  return 'ALL';
}

function parseSortParam(raw: string | null): SortOptionValue {
  return raw === 'submittedAt,asc' ? 'submittedAt,asc' : 'submittedAt,desc';
}

function parsePageParam(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function extractHttpStatus(err: unknown): number {
  if (!err || typeof err !== 'object') return 0;
  const e = err as { httpStatus?: number; status?: number; response?: { status?: number } };
  return e.httpStatus || e.response?.status || e.status || 0;
}

function getInitialLetter(name?: string | null): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const lastWord = parts[parts.length - 1] || trimmed;
  return lastWord.charAt(0).toUpperCase();
}

function isRowGraded(item: TeacherSubmissionItem): boolean {
  return (
    item.status === 'GRADED' ||
    (typeof item.score === 'number' && !Number.isNaN(item.score))
  );
}

export function TeacherAssignmentSubmissionsPageView({
  classId,
  assignmentId,
  userFullName = 'TS. Lê Hoàng Nam',
}: TeacherAssignmentSubmissionsPageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('assignments.teacher.submissions');
  const tClass = useTranslations('classes.detail');
  const locale = useLocale();

  // Shell layout state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Filter / Search / Sort / Page synced with URL query params
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(() =>
    parseStatusParam(searchParams.get('status'))
  );
  const [searchInput, setSearchInput] = useState<string>(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState<string>(() =>
    (searchParams.get('search') || '').trim()
  );
  const [sortOption, setSortOption] = useState<SortOptionValue>(() =>
    parseSortParam(searchParams.get('sort'))
  );
  const [currentPage, setCurrentPage] = useState<number>(() =>
    parsePageParam(searchParams.get('page'))
  );

  // Selection & Bulk Grading Modal state
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkModalTargets, setBulkModalTargets] = useState<BulkGradeTargetItem[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Auth & Class details for real permission verification
  const { data: currentUser, isLoading: isAuthLoading } = useCurrentUser();
  const { isTeacher: isDemoTeacherView } = useUserRole();
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
        isDemoTeacherView,
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
      isDemoTeacherView,
      isAuthLoading,
      isClassLoading,
      isClassError,
      classDetailData,
      currentUser,
    ]
  );

  // Debounce search input cleanly
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(trimmed);
      setCurrentPage(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput, debouncedSearch]);

  // Sync URL searchParams whenever filter/search/sort/page changes
  const buildQueryString = useCallback(
    (
      nextStatus: StatusFilterValue,
      nextSearch: string,
      nextSort: SortOptionValue,
      nextPage: number
    ) => {
      const params = new URLSearchParams();
      if (nextStatus !== 'ALL') params.set('status', nextStatus);
      if (nextSearch) params.set('search', nextSearch);
      if (nextSort !== 'submittedAt,desc') params.set('sort', nextSort);
      if (nextPage > 0) params.set('page', String(nextPage));
      const str = params.toString();
      return str ? `?${str}` : '';
    },
    []
  );

  useEffect(() => {
    const qs = buildQueryString(statusFilter, debouncedSearch, sortOption, currentPage);
    const targetUrl = `/classes/${classId}/assignments/${assignmentId}${qs}`;
    router.replace(targetUrl, { scroll: false });
  }, [
    classId,
    assignmentId,
    statusFilter,
    debouncedSearch,
    sortOption,
    currentPage,
    buildQueryString,
    router,
  ]);

  // Clear selection whenever assignment, filter, search, sort, or page changes (prevent grading wrong rows)
  useEffect(() => {
    setSelectedSubmissionIds([]);
  }, [assignmentId, statusFilter, debouncedSearch, sortOption, currentPage]);

  // Assignment Detail Query (GET /api/v1/assignments/{assignmentId} only — never calls student /my-submission)
  const {
    data: assignment,
    isLoading: isLoadingAssignment,
    isError: isAssignmentError,
    error: assignmentError,
    refetch: refetchAssignment,
  } = useAssignmentItem(assignmentId, resolvedClassId);

  // Submissions Query (partitioned by userId, classId, assignmentId, filters, page)
  const {
    data: submissionsData,
    isLoading: isLoadingSubmissions,
    isError: isSubmissionsError,
    error: submissionsError,
    refetch: refetchSubmissions,
  } = useAssignmentSubmissions(assignmentId, {
    classId: resolvedClassId,
    userId: currentUser?.id || '',
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    sort: sortOption,
    page: currentPage,
    size: PAGE_SIZE,
    enabled: !isVerifyingPermission && canManageSubmissions,
  });

  const bulkGradeMutation = useBulkGradeSubmissions(assignmentId, resolvedClassId);

  // Clamp page if filtered dataset shrank after grading
  useEffect(() => {
    if (
      submissionsData &&
      submissionsData.totalPages > 0 &&
      currentPage >= submissionsData.totalPages
    ) {
      setCurrentPage(Math.max(0, submissionsData.totalPages - 1));
    }
  }, [submissionsData, currentPage]);

  // Real Class, Course & Assignment metadata (zero Stitch fake fallbacks)
  const classTitle =
    classInfo?.title?.trim() || classInfo?.name?.trim() || classId;

  const courseList = Array.isArray(classDetailData?.courses) ? classDetailData.courses : [];
  const matchedCourse = assignment?.courseId
    ? courseList.find((c) => c.id === assignment.courseId)
    : courseList.length === 1
      ? courseList[0]
      : undefined;

  const courseCode = matchedCourse?.code?.trim() || null;
  const rawChapter = typeof assignment?.chapter === 'string' ? assignment.chapter.trim() : '';
  const validChapter =
    rawChapter && rawChapter.toLowerCase() !== 'chương mới' ? rawChapter : null;
  const heroContextParts = [courseCode, t('eyebrowAssignment'), validChapter].filter(
    (part): part is string => Boolean(part)
  );

  const assignmentTitle = assignment?.title?.trim() || '';
  const hasValidMaxScore =
    typeof assignment?.maxScore === 'number' && !Number.isNaN(assignment.maxScore);
  const maxScoreVal = hasValidMaxScore ? assignment.maxScore! : 10;
  const allowLatePolicy: boolean | null =
    typeof assignment?.allowLateSubmission === 'boolean'
      ? assignment.allowLateSubmission
      : null;

  const dueInfo = formatAssignmentDueDate(assignment?.dueDate);

  const items = submissionsData?.items ?? [];
  const totalElements = submissionsData?.totalElements ?? 0;
  const totalPages = Math.max(1, submissionsData?.totalPages ?? 1);

  // Selectable ungraded rows on the CURRENT page only
  const selectableItems = useMemo(
    () => (canManageSubmissions ? items.filter((item) => !isRowGraded(item)) : []),
    [items, canManageSubmissions]
  );

  const isAllSelectableChecked =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selectedSubmissionIds.includes(item.id));

  const isSomeSelectableChecked =
    selectableItems.some((item) => selectedSubmissionIds.includes(item.id)) &&
    !isAllSelectableChecked;

  const handleToggleSelectAll = () => {
    if (!canManageSubmissions || selectableItems.length === 0) return;
    if (isAllSelectableChecked) {
      setSelectedSubmissionIds([]);
    } else {
      setSelectedSubmissionIds(selectableItems.map((item) => item.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    if (!canManageSubmissions) return;
    setSelectedSubmissionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStatusFilterChange = (nextStatus: StatusFilterValue) => {
    setStatusFilter(nextStatus);
    setCurrentPage(0);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOptionValue);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCurrentPage(0);
  };

  const handleOpenBulkModal = () => {
    if (!canManageSubmissions || selectedSubmissionIds.length === 0) return;
    const targets: BulkGradeTargetItem[] = selectedSubmissionIds
      .map((id) => items.find((it) => it.id === id))
      .filter((it): it is TeacherSubmissionItem => Boolean(it && !isRowGraded(it)))
      .map((it) => ({
        id: it.id,
        studentName: it.studentName || t('unavailable'),
        studentCode: it.studentCode || it.studentId || null,
      }));
    if (targets.length === 0) return;
    setBulkModalTargets(targets);
    setIsBulkModalOpen(true);
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
    setBulkModalTargets([]);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId((prev) => (prev === id ? null : prev));
    }, 1500);
  };

  // Preserve current list filters/page when opening a submission detail
  const currentListQuery = buildQueryString(
    statusFilter,
    debouncedSearch,
    sortOption,
    currentPage
  );
  const returnQueryParam = currentListQuery
    ? `?returnQuery=${encodeURIComponent(currentListQuery)}`
    : '';

  const startIndex = totalElements === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const endIndex = totalElements === 0 ? 0 : Math.min((currentPage + 1) * PAGE_SIZE, totalElements);

  const submissionsHttpStatus = extractHttpStatus(submissionsError);
  const assignmentHttpStatus = extractHttpStatus(assignmentError);
  const isForbidden =
    (!isVerifyingPermission && !canManageSubmissions) ||
    submissionsHttpStatus === 403 ||
    assignmentHttpStatus === 403;

  const hasActiveFilterOrSearch = Boolean(debouncedSearch) || statusFilter !== 'ALL';

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

      {/* 3. Main Workspace Area */}
      <main
        className={`flex-1 min-w-0 transition-all duration-300 pt-20 pb-20 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 ${
          isFocusMode || isSidebarCollapsed ? 'pl-24' : 'lg:pl-[284px]'
        }`}
      >
        <div className="w-full max-w-[1040px] mx-auto space-y-6 min-w-0">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 min-w-0">
              <Link
                href="/classes"
                className="hover:text-[#0059BB] dark:hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                <span>{tClass('backToClasses')}</span>
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <Link
                href={`/classes/${classId}?tab=assignments`}
                className="hover:text-[#0059BB] dark:hover:text-blue-400 font-semibold truncate flex items-center gap-1.5 transition-colors min-w-0"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{classTitle}</span>
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">
                {t('title')}
              </span>
            </div>
          </nav>

          {/* Verifying Permission / Initial Loading Skeleton */}
          {isVerifyingPermission ? (
            <div
              data-submissions-verifying="true"
              className="space-y-6 animate-pulse"
            >
              <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-80 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <p className="sr-only">{t('verifyingPermission')}</p>
            </div>
          ) : isForbidden ? (
            /* 403 / Unauthorized State inside App Shell */
            <section
              data-submissions-forbidden="true"
              className="bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200 dark:border-amber-900/60 p-10 text-center space-y-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">lock</span>
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
          ) : (
            <>
              {/* HERO NAVY BANNER */}
              <section
                data-submissions-hero="navy"
                className="rounded-2xl p-6 text-white border-2 border-slate-800 shadow-sm min-w-0"
                style={{ background: 'linear-gradient(to right, #0D1C32, #122C54)' }}
              >
                {heroContextParts.length > 0 && (
                  <div className="text-xs font-semibold tracking-wider text-[#7DD3FC] uppercase truncate">
                    {heroContextParts.join(' • ')}
                  </div>
                )}
                <h1 className="font-display text-3xl sm:text-[36px] sm:leading-[44px] font-bold text-white tracking-tight mt-2">
                  {t('title')}
                </h1>
                {isLoadingAssignment ? (
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
                        {t('dueDatePrefix')}
                      </div>
                      <div
                        data-hero-due-date="true"
                        className="text-sm font-semibold text-white mt-0.5 whitespace-nowrap"
                      >
                        {isLoadingAssignment
                          ? t('unavailable')
                          : dueInfo.isNoDeadline
                            ? t('noDeadline')
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
                        {t('maxScorePrefix')}
                      </div>
                      <div
                        data-hero-max-score="true"
                        className="text-sm font-semibold text-white mt-0.5 whitespace-nowrap"
                      >
                        {isLoadingAssignment || !hasValidMaxScore
                          ? t('unavailable')
                          : `${formatScore(maxScoreVal, locale)} ${t('pointsUnit')}`}
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
                        {t('latePolicyPrefix')}
                      </div>
                      <div className="mt-0.5">
                        {isLoadingAssignment ? (
                          <span className="text-sm font-semibold text-slate-300">
                            {t('unavailable')}
                          </span>
                        ) : dueInfo.isNoDeadline ? (
                          <span
                            data-hero-late-policy="not-applicable"
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-slate-200 border border-white/15 whitespace-nowrap"
                          >
                            {t('lateNotApplicable')}
                          </span>
                        ) : allowLatePolicy === true ? (
                          <span
                            data-hero-late-policy="allowed"
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 whitespace-nowrap"
                          >
                            {t('lateAllowedShort')}
                          </span>
                        ) : allowLatePolicy === false ? (
                          <span
                            data-hero-late-policy="not-allowed"
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/30 whitespace-nowrap"
                          >
                            {t('lateNotAllowedShort')}
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

              {/* UNIFIED CARD: TOOLBAR (2 ROWS) + TABLE + PAGINATION (24px below hero via space-y-6) */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#D9E2E8] dark:border-slate-800 p-6 shadow-sm space-y-4 min-w-0">
                {/* Toolbar Row 1: Search, Sort, Bulk Grade */}
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                  <div className="relative flex-1 min-w-[220px]">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none"
                    >
                      search
                    </span>
                    <input
                      id="submissions-search-input"
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={t('searchPlaceholder')}
                      aria-label={t('searchPlaceholder')}
                      className="w-full pl-9 pr-9 py-2 text-xs bg-[#F0F4F8] dark:bg-slate-800/70 border-2 border-[#D9E2E8] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0059BB] focus:border-[#0059BB] text-[#171C1F] dark:text-slate-100 placeholder:text-slate-400"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        id="btn-clear-submissions-search"
                        onClick={handleClearSearch}
                        aria-label={t('clearSearchAria')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] block">close</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-[#44474D] dark:text-slate-400">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-base"
                      >
                        sort
                      </span>
                      <select
                        id="submissions-sort-select"
                        value={sortOption}
                        onChange={handleSortChange}
                        aria-label={t('sort.newest')}
                        className="bg-[#F0F4F8] dark:bg-slate-800 border-2 border-[#D9E2E8] dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-[#171C1F] dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-[#0059BB] cursor-pointer"
                      >
                        <option value="submittedAt,desc">{t('sort.newest')}</option>
                        <option value="submittedAt,asc">{t('sort.oldest')}</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      id="btn-bulk-grade"
                      onClick={handleOpenBulkModal}
                      disabled={!canManageSubmissions || selectedSubmissionIds.length === 0}
                      className="px-4 py-2 rounded-lg bg-[#0059BB] hover:bg-[#004493] text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                        edit_note
                      </span>
                      <span>
                        {selectedSubmissionIds.length > 0
                          ? t('bulkGradeWithCount', { count: selectedSubmissionIds.length })
                          : t('bulkGrade')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Toolbar Row 2: Status Filter Buttons & Selection Summary */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div
                    role="group"
                    aria-label={t('columns.status')}
                    className="inline-flex items-center bg-[#E7ECF0] dark:bg-slate-800 p-0.5 rounded-lg border border-[#D9E2E8] dark:border-slate-700 text-xs font-medium"
                  >
                    {(
                      [
                        { value: 'ALL', label: t('filters.all') },
                        { value: 'SUBMITTED', label: t('filters.submitted') },
                        { value: 'LATE', label: t('filters.late') },
                        { value: 'GRADED', label: t('filters.graded') },
                      ] as const
                    ).map((tab) => {
                      const isActive = statusFilter === tab.value;
                      return (
                        <button
                          key={tab.value}
                          type="button"
                          data-status-filter={tab.value}
                          aria-pressed={isActive}
                          onClick={() => handleStatusFilterChange(tab.value)}
                          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                            isActive
                              ? 'bg-[#0059BB] text-white shadow-xs font-semibold'
                              : 'text-[#44474D] dark:text-slate-300 hover:text-[#171C1F] dark:hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    id="selected-submissions-count"
                    className="text-xs text-[#44474D] dark:text-slate-400 font-medium whitespace-nowrap"
                  >
                    {t('selectedCount', { count: selectedSubmissionIds.length })}
                  </div>
                </div>

                {/* Load Error State (never turned into empty list or mock data) */}
                {isSubmissionsError || isAssignmentError ? (
                  <div
                    role="alert"
                    data-submissions-error="true"
                    className="rounded-xl border-2 border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-8 text-center space-y-3"
                  >
                    <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">error_outline</span>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-sm font-bold text-[#171C1F] dark:text-slate-100">
                        {t('errorLoadTitle')}
                      </h2>
                      <p className="text-xs text-[#44474D] dark:text-slate-400 max-w-md mx-auto">
                        {t('errorLoadDesc')}
                      </p>
                    </div>
                    <button
                      type="button"
                      id="btn-retry-submissions"
                      onClick={() => {
                        if (isAssignmentError) void refetchAssignment();
                        void refetchSubmissions();
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0059BB] hover:bg-[#004493] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {t('retryBtn')}
                    </button>
                  </div>
                ) : (
                  /* Table Container */
                  <div className="border-2 border-[#D9E2E8] dark:border-slate-700 rounded-xl overflow-x-auto">
                    <table
                      className="w-full min-w-[820px] border-collapse text-left text-sm"
                      style={{ tableLayout: 'fixed' }}
                    >
                      <colgroup>
                        <col style={{ width: '48px' }} />
                        <col />
                        <col style={{ width: '158px' }} />
                        <col style={{ width: '204px' }} />
                        <col style={{ width: '96px' }} />
                        <col style={{ width: '134px' }} />
                      </colgroup>
                      <thead>
                        <tr className="bg-[#F0F4F8] dark:bg-slate-800/80 border-b border-[#D9E2E8] dark:border-slate-700 text-xs font-semibold text-[#44474D] dark:text-slate-300">
                          <th className="py-3 px-3 text-center whitespace-nowrap">
                            <input
                              id="select-all-submissions-checkbox"
                              type="checkbox"
                              checked={isAllSelectableChecked}
                              ref={(el) => {
                                if (el) el.indeterminate = isSomeSelectableChecked;
                              }}
                              onChange={handleToggleSelectAll}
                              disabled={!canManageSubmissions || selectableItems.length === 0}
                              aria-label={t('checkboxSelectAllAria')}
                              title={t('columns.select')}
                              className="w-4 h-4 rounded border-slate-300 text-[#0059BB] focus:ring-[#0059BB] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                          </th>
                          <th className="py-3 px-3 whitespace-nowrap">{t('columns.student')}</th>
                          <th className="py-3 px-3 whitespace-nowrap">{t('columns.submittedAt')}</th>
                          <th className="py-3 px-3 whitespace-nowrap">{t('columns.status')}</th>
                          <th className="py-3 px-3 text-center whitespace-nowrap">
                            {t('columns.score')}
                          </th>
                          <th className="py-3 px-3 text-right whitespace-nowrap">
                            {t('columns.actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D9E2E8] dark:divide-slate-800 text-[#171C1F] dark:text-slate-200 text-xs">
                        {isLoadingSubmissions ? (
                          Array.from({ length: 5 }, (_, idx) => (
                            <tr key={`skeleton-${idx}`} className="animate-pulse">
                              <td className="py-4 px-3 text-center">
                                <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 mx-auto" />
                              </td>
                              <td className="py-4 px-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                                  <div className="space-y-1.5 flex-1">
                                    <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-2.5 w-44 bg-slate-100 dark:bg-slate-800 rounded" />
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-3">
                                <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                              </td>
                              <td className="py-4 px-3">
                                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                              </td>
                              <td className="py-4 px-3 text-center">
                                <div className="h-3.5 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                              </td>
                              <td className="py-4 px-3 text-right">
                                <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-md ml-auto" />
                              </td>
                            </tr>
                          ))
                        ) : items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 px-4 text-center text-[#44474D] dark:text-slate-400">
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2 block"
                              >
                                {hasActiveFilterOrSearch ? 'search_off' : 'inbox'}
                              </span>
                              <p
                                data-submissions-empty={hasActiveFilterOrSearch ? 'filtered' : 'all'}
                                className="text-sm font-semibold text-[#171C1F] dark:text-slate-200"
                              >
                                {hasActiveFilterOrSearch ? t('emptyFiltered') : t('empty')}
                              </p>
                              <p className="text-xs text-[#44474D] dark:text-slate-400 mt-1">
                                {hasActiveFilterOrSearch ? t('emptyFilteredDesc') : t('emptyDesc')}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          items.map((item) => {
                            const graded = isRowGraded(item);
                            const isLate = Boolean(item.isLate || item.status === 'LATE');
                            const isResubmitted = item.status === 'RESUBMITTED';
                            const isChecked = selectedSubmissionIds.includes(item.id);
                            const displayName = item.studentName || t('unavailable');
                            const identifier = item.studentCode || item.studentId || '';
                            const submittedFormatted =
                              formatSubmissionTime(item.submittedAt).formatted || t('unavailable');

                            const hasNumericScore =
                              typeof item.score === 'number' && !Number.isNaN(item.score);
                            const maxScoreLabel = hasValidMaxScore
                              ? formatScore(maxScoreVal, locale)
                              : t('unavailable');
                            const scoreDisplay = hasNumericScore
                              ? `${item.score === 0 ? '0' : formatScore(item.score, locale)} / ${maxScoreLabel}`
                              : t('unavailable');

                            return (
                              <tr
                                key={item.id}
                                data-submission-row-id={item.id}
                                data-submission-graded={graded ? 'true' : 'false'}
                                data-submission-late={isLate ? 'true' : 'false'}
                                className="hover:bg-[#F6FAFE] dark:hover:bg-slate-800/40 transition-colors"
                              >
                                {/* 1. Checkbox */}
                                <td className="py-3.5 px-3 text-center">
                                  {graded ? (
                                    <input
                                      type="checkbox"
                                      disabled
                                      aria-label={t('checkboxGradedDisabledTitle')}
                                      title={t('checkboxGradedDisabledTitle')}
                                      className="w-4 h-4 rounded border-slate-300 text-[#0059BB] opacity-30 cursor-not-allowed"
                                    />
                                  ) : (
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={!canManageSubmissions}
                                      onChange={() => handleToggleSelectItem(item.id)}
                                      aria-label={t('checkboxSelectRowAria', { name: displayName })}
                                      className="w-4 h-4 rounded border-slate-300 text-[#0059BB] focus:ring-[#0059BB] cursor-pointer disabled:opacity-40"
                                    />
                                  )}
                                </td>

                                {/* 2. Học viên (Avatar / Initial + Name + Code/UUID) */}
                                <td className="py-3.5 px-3 min-w-0">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {item.studentAvatar ? (
                                      <img
                                        src={item.studentAvatar}
                                        alt={displayName}
                                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                      />
                                    ) : (
                                      <div
                                        aria-hidden="true"
                                        className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                                          graded
                                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                            : 'bg-blue-100 dark:bg-blue-950/70 text-[#0059BB] dark:text-blue-300'
                                        }`}
                                      >
                                        {getInitialLetter(displayName)}
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div
                                        title={displayName}
                                        className="font-semibold text-[#171C1F] dark:text-slate-100 text-[13px] truncate"
                                      >
                                        {displayName}
                                      </div>
                                      {identifier && (
                                        <button
                                          type="button"
                                          onClick={() => handleCopyCode(item.id, identifier)}
                                          title={`${identifier} — ${t('copyCodeTitle')}`}
                                          className="mt-0.5 max-w-full inline-flex items-center gap-1 text-[11px] font-mono text-[#44474D] dark:text-slate-400 hover:text-[#0059BB] dark:hover:text-blue-400 cursor-pointer text-left"
                                        >
                                          <span className="truncate">{identifier}</span>
                                          {copiedCodeId === item.id && (
                                            <span className="text-[10px] font-sans font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                                              {t('codeCopied')}
                                            </span>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* 3. Thời gian nộp */}
                                <td className="py-3.5 px-3 text-[#44474D] dark:text-slate-400 whitespace-nowrap tabular-nums">
                                  {submittedFormatted}
                                </td>

                                {/* 4. Trạng thái (Tách bạch Chấm điểm & Tình trạng nộp) */}
                                <td className="py-3.5 px-3">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* Nhóm 1: Trạng thái chấm điểm */}
                                    {graded ? (
                                      <span
                                        data-badge="graded"
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0FDF4] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-300 border border-[#BBF7D0] dark:border-emerald-800 whitespace-nowrap"
                                      >
                                        {t('statuses.graded')}
                                      </span>
                                    ) : (
                                      <span
                                        data-badge="pending"
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F8FAFC] dark:bg-slate-800 text-[#475569] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700 whitespace-nowrap"
                                      >
                                        {t('statuses.pending')}
                                      </span>
                                    )}

                                    {/* Nhóm 2: Tình trạng nộp (độc lập với đã chấm) */}
                                    {isLate ? (
                                      <span
                                        data-badge="late"
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF2F2] dark:bg-rose-950/50 text-[#B91C1C] dark:text-rose-300 border border-[#FECACA] dark:border-rose-800 whitespace-nowrap"
                                      >
                                        {t('statuses.late')}
                                      </span>
                                    ) : isResubmitted ? (
                                      <span
                                        data-badge="resubmitted"
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EFF6FF] dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border border-[#BFDBFE] dark:border-blue-800 whitespace-nowrap"
                                      >
                                        {t('statuses.resubmitted')}
                                      </span>
                                    ) : !dueInfo.isNoDeadline ? (
                                      <span
                                        data-badge="on-time"
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0FDF4] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-300 border border-[#BBF7D0] dark:border-emerald-800 whitespace-nowrap"
                                      >
                                        {t('statuses.onTime')}
                                      </span>
                                    ) : null}
                                  </div>
                                </td>

                                {/* 5. Điểm */}
                                <td
                                  data-submission-score-cell={item.id}
                                  className={`py-3.5 px-3 text-center whitespace-nowrap tabular-nums ${
                                    hasNumericScore
                                      ? 'font-semibold text-[#171C1F] dark:text-slate-100'
                                      : 'font-medium text-[#44474D] dark:text-slate-400'
                                  }`}
                                >
                                  {scoreDisplay}
                                </td>

                                {/* 6. Thao tác */}
                                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                  {graded ? (
                                    <Link
                                      href={`/classes/${classId}/assignments/${assignmentId}/submissions/${item.id}${returnQueryParam}`}
                                      data-row-action="view-result"
                                      className="inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-semibold text-[#0059BB] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors whitespace-nowrap"
                                    >
                                      {t('actions.viewResult')}
                                    </Link>
                                  ) : (
                                    <Link
                                      href={`/classes/${classId}/assignments/${assignmentId}/submissions/${item.id}${returnQueryParam}`}
                                      data-row-action="grade"
                                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-white bg-[#0059BB] hover:bg-[#004493] rounded-md shadow-xs transition-colors whitespace-nowrap"
                                    >
                                      {t('actions.gradeNow')}
                                    </Link>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>

                    {/* Table Footer with Pagination */}
                    <div className="py-3 px-4 bg-[#F0F4F8] dark:bg-slate-800/80 border-t border-[#D9E2E8] dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-[#44474D] dark:text-slate-400">
                      <div id="submissions-pagination-counter">
                        {t('pagination.showing')} {startIndex}–{endIndex}{' '}
                        {t('pagination.of')} {totalElements} {t('pagination.items')}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          id="btn-submissions-prev-page"
                          disabled={currentPage === 0 || isLoadingSubmissions}
                          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                          className="px-2.5 py-1 rounded-md border border-[#D9E2E8] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#44474D] dark:text-slate-300 disabled:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {t('pagination.prev')}
                        </button>

                        {Array.from({ length: totalPages }, (_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            data-page-number={idx + 1}
                            aria-current={currentPage === idx ? 'page' : undefined}
                            onClick={() => setCurrentPage(idx)}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                              currentPage === idx
                                ? 'bg-[#0059BB] text-white shadow-xs'
                                : 'border border-[#D9E2E8] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#44474D] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}

                        <button
                          type="button"
                          id="btn-submissions-next-page"
                          disabled={currentPage >= totalPages - 1 || isLoadingSubmissions}
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                          }
                          className="px-2.5 py-1 rounded-md border border-[#D9E2E8] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#44474D] dark:text-slate-300 disabled:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {t('pagination.next')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* Bulk Grading Modal */}
      <TeacherBulkGradeModal
        isOpen={isBulkModalOpen}
        items={bulkModalTargets}
        maxScore={maxScoreVal}
        isPending={bulkGradeMutation.isPending}
        onClose={handleCloseBulkModal}
        onSubmit={(grades) => bulkGradeMutation.mutateAsync(grades)}
        onSuccessIds={(ids) => {
          setSelectedSubmissionIds((prev) => prev.filter((id) => !ids.includes(id)));
          void refetchSubmissions();
        }}
      />
    </div>
  );
}
