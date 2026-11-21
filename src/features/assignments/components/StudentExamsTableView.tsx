'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ZodError } from 'zod';
import { useClassDetail } from '@/features/classes/hooks/useClassDetail';
import {
  useClassExamsPaged,
  useAllClassExams,
  useVisibleExamDetails,
  type VisibleExamDetailEntry,
} from '../hooks/useExamQueries';
import {
  normalizeExamStatus,
  normalizeExamType,
  type ExamItem,
} from '../schemas/exam.schema';
import { formatExamLocalDateTime } from '../services/exam.service';
import { formatScore } from '../services/assignment.service';
import {
  ASSESSMENT_UI,
  AssessmentAsidePanel,
  AssessmentBadge,
  AssessmentCardHeader,
  AssessmentListHeader,
  AssessmentTwoColumnLayout,
} from './AssessmentListPrimitives';

export type StudentExamFilterType = 'ALL' | 'QUIZ' | 'MIDTERM' | 'FINAL' | 'CONTEST';
export type StudentExamFilterStatus = 'ALL' | 'UPCOMING' | 'OPEN' | 'CLOSED';

export interface StudentExamsTableViewProps {
  classId: string;
  routeClassId?: string;
  className?: string;
  hideHeader?: boolean;
  onViewExam?: (examId: string) => void;
}

function getExamTypeVisuals(examType: string) {
  switch (normalizeExamType(examType)) {
    case 'QUIZ':
      return {
        icon: 'quiz',
        whiteBg: 'bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-400',
        navyBg: 'bg-[#0059BB]/25 text-sky-300 border border-sky-400/30',
        badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-[#004493] dark:text-blue-300',
      };
    case 'MIDTERM':
      return {
        icon: 'assignment_turned_in',
        whiteBg: 'bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-400',
        navyBg: 'bg-[#0059BB]/25 text-sky-300 border border-sky-400/30',
        badgeClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300',
      };
    case 'FINAL':
      return {
        icon: 'fact_check',
        whiteBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
        navyBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
      };
    case 'CONTEST':
      return {
        icon: 'emoji_events',
        whiteBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
        navyBg: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
      };
    default:
      return {
        icon: 'quiz',
        whiteBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
        navyBg: 'bg-white/10 text-sky-300 border border-white/15',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      };
  }
}

function classifyExamError(error: unknown): 'FORBIDDEN' | 'SCHEMA' | 'GENERIC' {
  if (!error) return 'GENERIC';
  if (error instanceof ZodError) return 'SCHEMA';
  if (typeof error === 'object') {
    const e = error as {
      httpStatus?: number;
      code?: string;
      name?: string;
      response?: { status?: number };
    };
    const status = e.httpStatus || e.response?.status || 0;
    if (status === 403 || status === 401) return 'FORBIDDEN';
    if (e.code === 'SCHEMA_ERROR' || e.name === 'ZodError') return 'SCHEMA';
  }
  return 'GENERIC';
}

interface ExamCardProps {
  exam: ExamItem;
  featured: boolean;
  courseCode: string | null;
  courseName: string | null;
  detailEntry?: VisibleExamDetailEntry;
  locale: string;
  onViewExam: (examId: string) => void;
  t: ReturnType<typeof useTranslations<'assignments.exams.student'>>;
}

function StudentExamCard({
  exam,
  featured,
  courseCode,
  courseName,
  detailEntry,
  locale,
  onViewExam,
  t,
}: ExamCardProps) {
  const normalizedType = normalizeExamType(exam.examType);
  const normalizedStatus = normalizeExamStatus(exam.status);
  const visuals = getExamTypeVisuals(normalizedType);

  const typeLabel =
    normalizedType === 'QUIZ'
      ? t('typeQuiz')
      : normalizedType === 'MIDTERM'
        ? t('typeMidterm')
        : normalizedType === 'FINAL'
          ? t('typeFinal')
          : normalizedType === 'CONTEST'
            ? t('typeContest')
            : exam.examType;

  const statusLabel =
    normalizedStatus === 'OPEN'
      ? t('statusOpen')
      : normalizedStatus === 'UPCOMING'
        ? t('statusUpcoming')
        : t('statusClosed');

  // Supplement description & questionCount strictly from GET /api/v1/exams/{examId} (fallback to summary only if present)
  const detailData = detailEntry?.data;
  const isDetailLoading = Boolean(detailEntry?.isLoading);
  const isDetailError = Boolean(detailEntry?.isError);

  const rawDescription =
    typeof detailData?.description === 'string'
      ? detailData.description.trim()
      : typeof exam.description === 'string'
        ? exam.description.trim()
        : '';

  // questionCount=0 is valid; never default to 25/40
  const resolvedQuestionCount =
    typeof detailData?.questionCount === 'number' && !isNaN(detailData.questionCount)
      ? detailData.questionCount
      : typeof exam.questionCount === 'number' && !isNaN(exam.questionCount)
        ? exam.questionCount
        : null;

  // durationMinutes & totalScore strictly from API (never default 60 or 10)
  const resolvedDuration =
    typeof exam.durationMinutes === 'number' && !isNaN(exam.durationMinutes)
      ? exam.durationMinutes
      : typeof detailData?.durationMinutes === 'number' && !isNaN(detailData.durationMinutes)
        ? detailData.durationMinutes
        : null;

  const resolvedMaxScore =
    typeof exam.totalScore === 'number' && !isNaN(exam.totalScore)
      ? exam.totalScore
      : typeof detailData?.totalScore === 'number' && !isNaN(detailData.totalScore)
        ? detailData.totalScore
        : typeof exam.maxScore === 'number' && !isNaN(exam.maxScore)
          ? exam.maxScore
          : null;

  const surface = featured ? 'navy' : 'light';

  const scheduleBadgeVariant =
    normalizedStatus === 'OPEN'
      ? 'scheduleOpen'
      : normalizedStatus === 'UPCOMING'
        ? 'scheduleUpcoming'
        : 'scheduleClosed';

  // Only show student grading/attempt status when real backend attempt data confirms it.
  // Score === 0 is a valid graded score; never treat CLOSED schedule alone as overdue.
  const studentAttempt = exam.studentAttempt ?? null;
  const isAttemptGraded =
    studentAttempt?.status === 'GRADED' ||
    (typeof studentAttempt?.score === 'number' && !isNaN(studentAttempt.score));
  const isAttemptPendingGrading =
    !isAttemptGraded && studentAttempt?.status === 'SUBMITTED';

  const courseSubtitleText =
    courseCode && courseName
      ? `${courseCode} • ${courseName}`
      : courseName || courseCode || null;

  return (
    <article
      data-exam-id={exam.id}
      data-featured={featured ? 'true' : 'false'}
      data-exam-type={normalizedType}
      data-exam-status={normalizedStatus}
      className={
        featured
          ? `${ASSESSMENT_UI.featuredCard} flex flex-col gap-4`
          : `${ASSESSMENT_UI.surfaceCard} flex flex-col gap-4`
      }
    >
      {/* Unified Header: Left (Icon + Title + Course subtitle), Right (All Chips/Badges) */}
      <AssessmentCardHeader
        icon={
          <div
            data-card-icon-box="true"
            className={`${ASSESSMENT_UI.cardIconBox} ${featured ? visuals.navyBg : visuals.whiteBg
              }`}
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
          <h2
            className={`${ASSESSMENT_UI.cardTitle} ${featured
                ? 'text-white'
                : 'text-slate-900 dark:text-slate-100'
              }`}
          >
            {exam.title}
          </h2>
        }
        subtitle={
          courseSubtitleText ? (
            <p
              className={`mt-1 flex items-center gap-1.5 text-xs font-medium min-w-0 ${featured ? 'text-white/75' : 'text-slate-500 dark:text-slate-400'
                }`}
            >
              <span
                aria-hidden="true"
                className={`material-symbols-outlined text-[15px] shrink-0 ${featured ? 'text-sky-300' : 'text-[#0059BB] dark:text-blue-400'
                  }`}
              >
                school
              </span>
              <span className="truncate">{courseSubtitleText}</span>
            </p>
          ) : undefined
        }
        badges={
          <>
            <AssessmentBadge variant="type" surface={surface}>
              {typeLabel}
            </AssessmentBadge>
            <AssessmentBadge
              variant={scheduleBadgeVariant}
              surface={surface}
              dot={featured && normalizedStatus === 'OPEN' ? 'ping' : 'solid'}
            >
              {statusLabel}
            </AssessmentBadge>
            {isAttemptGraded && (
              <AssessmentBadge
                variant="graded"
                surface={surface}
                icon="check_circle"
              >
                {t('resultGraded')}
              </AssessmentBadge>
            )}
            {isAttemptPendingGrading && (
              <AssessmentBadge
                variant="pendingGrading"
                surface={surface}
                icon="hourglass_top"
                spinIcon
              >
                {t('resultPendingGrading')}
              </AssessmentBadge>
            )}
          </>
        }
      />

      {/* Description & Detail Error Notice */}
      {isDetailLoading && !rawDescription ? (
        <div className="space-y-1.5 animate-pulse">
          <div
            className={`h-3.5 w-5/6 rounded ${featured ? 'bg-white/15' : 'bg-slate-200 dark:bg-slate-800'
              }`}
          />
          <div
            className={`h-3.5 w-2/3 rounded ${featured ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800/70'
              }`}
          />
        </div>
      ) : rawDescription ? (
        <p
          className={`text-sm leading-relaxed line-clamp-3 break-words [overflow-wrap:anywhere] ${featured ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          {rawDescription}
        </p>
      ) : null}

      {isDetailError && (
        <div
          className={`inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg border self-start ${featured
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
        >
          <span className="material-symbols-outlined text-[15px]">warning</span>
          <span>{t('detailLoadError')}</span>
          <button
            type="button"
            onClick={() => detailEntry?.refetch()}
            className={`font-semibold underline cursor-pointer ${featured ? 'text-white hover:text-sky-200' : 'text-[#0059BB] dark:text-blue-400'
              }`}
          >
            {t('retryDetailBtn')}
          </button>
        </div>
      )}

      {/* 3 Metadata Metrics (Uniform 18px outline icons: help_outline, schedule, military_tech) */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border text-[13px] ${featured
          ? 'bg-white/5 border-white/10'
          : 'bg-[#F8FAFC] dark:bg-slate-800/40 border-[#E2E8F0] dark:border-slate-700/80'
          }`}
      >
        {/* Số câu hỏi */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 ${featured ? 'text-sky-300' : 'text-[#0059BB] dark:text-blue-400'
              }`}
          >
            help_outline
          </span>
          <span className={featured ? 'text-white/65 shrink-0' : 'text-slate-500 dark:text-slate-400 shrink-0'}>
            {t('questionCountLabel')}
          </span>
          {isDetailLoading && resolvedQuestionCount === null ? (
            <span
              className={`inline-block h-3.5 w-16 rounded animate-pulse ${featured ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                }`}
            />
          ) : resolvedQuestionCount !== null ? (
            <span className={`font-semibold truncate ${featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
              {t('questionCountValue', { count: resolvedQuestionCount })}
            </span>
          ) : (
            <span className={`text-xs font-medium truncate ${featured ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'}`}>
              {t('questionCountUnloaded')}
            </span>
          )}
        </div>

        {/* Thời lượng */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 ${featured ? 'text-sky-300' : 'text-[#0059BB] dark:text-blue-400'
              }`}
          >
            schedule
          </span>
          <span className={featured ? 'text-white/65 shrink-0' : 'text-slate-500 dark:text-slate-400 shrink-0'}>
            {t('durationLabel')}
          </span>
          <span className={`font-semibold truncate ${featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
            {resolvedDuration !== null
              ? t('durationValue', { minutes: resolvedDuration })
              : t('missingMetric')}
          </span>
        </div>

        {/* Điểm tối đa */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 ${featured ? 'text-emerald-300' : 'text-[#0059BB] dark:text-blue-400'
              }`}
          >
            military_tech
          </span>
          <span className={featured ? 'text-white/65 shrink-0' : 'text-slate-500 dark:text-slate-400 shrink-0'}>
            {t('maxScoreLabel')}
          </span>
          <span className={`font-semibold truncate ${featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
            {resolvedMaxScore !== null
              ? t('maxScoreValue', { score: formatScore(resolvedMaxScore, locale) })
              : t('missingMetric')}
          </span>
        </div>
      </div>

      {/* Footer: Schedule (Open / Close) & View Details CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div
          className={`flex items-center gap-3 sm:gap-4 flex-wrap text-[13px] ${featured ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={featured ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'}>
              {t('openTimeLabel')}
            </span>
            <span className={`font-medium ${featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
              {formatExamLocalDateTime(exam.startTime)}
            </span>
          </div>
          <div
            className={`h-3.5 w-px hidden sm:block ${featured ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
              }`}
          />
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={featured ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'}>
              {t('closeTimeLabel')}
            </span>
            <span className={`font-medium ${featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
              {formatExamLocalDateTime(exam.endTime)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onViewExam(exam.id)}
          className={
            featured
              ? `w-full sm:w-auto ${ASSESSMENT_UI.featuredPrimaryBtn}`
              : `w-full sm:w-auto ${ASSESSMENT_UI.primaryBtn}`
          }
        >
          <span>{t('viewDetailBtn')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </article>
  );
}

export function StudentExamsTableView({
  classId,
  routeClassId,
  className,
  hideHeader = false,
  onViewExam,
}: StudentExamsTableViewProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('assignments.exams.student');

  const [selectedType, setSelectedType] = useState<StudentExamFilterType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StudentExamFilterStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<'latest' | 'earliest'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 5;

  // Reset filters and page when switching classes
  useEffect(() => {
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSortOrder('latest');
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(0);
  }, [classId]);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch class metadata for courseCode lookup by exam.courseId
  const { data: classDetailData } = useClassDetail(routeClassId || classId);
  const courseById = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    const list = Array.isArray(classDetailData?.courses) ? classDetailData.courses : [];
    for (const c of list) {
      if (c.id) {
        map.set(c.id, { code: c.code, name: c.name });
      }
    }
    return map;
  }, [classDetailData]);

  const isSearching = Boolean(debouncedSearch.trim());
  const hasActiveFilters =
    isSearching || selectedType !== 'ALL' || selectedStatus !== 'ALL';

  // Normal server-side paginated query (only when not searching by title)
  const {
    data: pagedData,
    isLoading: isPagedLoading,
    isError: isPagedError,
    error: pagedError,
    refetch: refetchPaged,
  } = useClassExamsPaged(
    classId,
    {
      page,
      size: pageSize,
      examType: selectedType,
      status: selectedStatus,
      sort: sortOrder,
      onlyPublished: true,
    },
    !isSearching
  );

  // Full multi-page aggregation query (enabled ONLY when searching by title)
  const {
    data: allExamsData,
    isLoading: isAllLoading,
    isError: isAllError,
    error: allError,
    refetch: refetchAll,
  } = useAllClassExams(
    classId,
    {
      examType: selectedType,
      status: selectedStatus,
      sort: sortOrder,
      onlyPublished: true,
    },
    isSearching
  );

  const searchFilteredItems = useMemo(() => {
    if (!isSearching) return [];
    const q = debouncedSearch.trim().toLowerCase();
    return (allExamsData || []).filter((item) => item.title.toLowerCase().includes(q));
  }, [allExamsData, debouncedSearch, isSearching]);

  const isLoading = isSearching ? isAllLoading : isPagedLoading;
  const isError = isSearching ? isAllError : isPagedError;
  const activeError = isSearching ? allError : pagedError;

  const totalElements = isSearching
    ? searchFilteredItems.length
    : (pagedData?.totalElements ?? 0);

  const totalPages = Math.max(1, isSearching ? Math.ceil(totalElements / pageSize) : (pagedData?.totalPages ?? 1));

  // Ensure current page never exceeds totalPages after filter/result changes
  useEffect(() => {
    if (!isLoading && page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [isLoading, page, totalPages]);

  const items: ExamItem[] = useMemo(() => {
    if (isSearching) {
      return searchFilteredItems.slice(page * pageSize, (page + 1) * pageSize);
    }
    return (pagedData?.items ?? []).slice(0, pageSize);
  }, [isSearching, searchFilteredItems, page, pageSize, pagedData]);

  // Fetch GET /api/v1/exams/{examId} ONLY for visible exams on this page (max 5)
  const visibleExamIds = useMemo(() => items.map((e) => e.id), [items]);
  const detailMap = useVisibleExamDetails(visibleExamIds, classId);

  const featuredExam = items.length > 0 ? items[0] : null;
  const regularExams = items.length > 1 ? items.slice(1) : [];

  const fromRecord = totalElements === 0 ? 0 : page * pageSize + 1;
  const toRecord = totalElements === 0 ? 0 : Math.min(page * pageSize + items.length, totalElements);

  const handleRefetch = () => {
    if (isSearching) {
      refetchAll();
    } else {
      refetchPaged();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(0);
  };

  const handleTypeChange = (type: StudentExamFilterType) => {
    setSelectedType(type);
    setPage(0);
  };

  const handleStatusChange = (status: StudentExamFilterStatus) => {
    setSelectedStatus(status);
    setPage(0);
  };

  const handleSortChange = (order: 'latest' | 'earliest') => {
    setSortOrder(order);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSortOrder('latest');
    setPage(0);
  };

  const handleViewExamClick = (examId: string) => {
    if (onViewExam) {
      onViewExam(examId);
    } else {
      const targetClass = routeClassId || classId;
      router.push(
        `/classes/${targetClass}?tab=assignments&subtab=exams&action=exam-detail&examId=${examId}`
      );
    }
  };

  const resolveCourseMeta = (exam: ExamItem) => {
    const matched = exam.courseId ? courseById.get(exam.courseId) : undefined;
    const courseCode = matched?.code?.trim() || exam.courseCode?.trim() || null;
    const courseName = exam.courseName?.trim() || matched?.name?.trim() || null;
    return { courseCode, courseName };
  };

  const errorKind = classifyExamError(activeError);

  // Only show verified total count in "Tất cả (N)" when status filter is ALL and data loaded cleanly
  const verifiedStatusAllLabel =
    !isLoading && !isError && selectedStatus === 'ALL'
      ? t('statusAllCount', { count: totalElements })
      : t('statusAll');

  const filterControlsBar = (
    <section
      aria-label={t('pageTitle')}
      className={`${ASSESSMENT_UI.toolbarCard} flex flex-col gap-3.5`}
    >
      {/* Row 1: Search input + Sort selector (unified 44px controls) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
            search
          </span>
          <input
            id="inputSearchExam"
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
              id="btnClearSearch"
              type="button"
              aria-label={t('clearSearchAria')}
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="examSortSelect"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap"
          >
            {t('sortLabel')}
          </label>
          <select
            id="examSortSelect"
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value as 'latest' | 'earliest')}
            className={ASSESSMENT_UI.selectControl}
          >
            <option value="latest">{t('sortLatest')}</option>
            <option value="earliest">{t('sortEarliest')}</option>
          </select>
        </div>
      </div>

      {/* Row 2: Type & Status filter chips (single unified control bar matching V2) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {/* Loại */}
        <div id="type-filters" className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            {t('filterTypeLabel')}
          </span>
          {(
            [
              { id: 'ALL', label: t('typeAll') },
              { id: 'QUIZ', label: t('typeQuiz') },
              { id: 'MIDTERM', label: t('typeMidterm') },
              { id: 'FINAL', label: t('typeFinal') },
              { id: 'CONTEST', label: t('typeContest') },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              data-filter-type={opt.id}
              aria-pressed={selectedType === opt.id}
              onClick={() => handleTypeChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${selectedType === opt.id
                ? 'bg-[#0059BB] text-white shadow-xs'
                : 'bg-[#F0F4F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Trạng thái */}
        <div id="status-filters" className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            {t('filterStatusLabel')}
          </span>
          {(
            [
              { id: 'ALL', label: verifiedStatusAllLabel },
              { id: 'UPCOMING', label: t('statusUpcoming') },
              { id: 'OPEN', label: t('statusOpen') },
              { id: 'CLOSED', label: t('statusClosed') },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              data-filter-status={opt.id}
              aria-pressed={selectedStatus === opt.id}
              onClick={() => handleStatusChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${selectedStatus === opt.id
                ? 'bg-[#0059BB] text-white shadow-xs'
                : 'bg-[#F0F4F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  // Build pagination page numbers cleanly
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  return (
    <div className={ASSESSMENT_UI.wrapper}>
      {!hideHeader && (
        <AssessmentListHeader title={t('pageTitle')} subtitle={className} />
      )}

      {/* Unified 2-Column Desktop Grid: Main minmax(0, 1fr) + Aside 320px, gap 24px */}
      <AssessmentTwoColumnLayout
        main={
          <>
            {isLoading ? (
              <>
                <div className="rounded-xl bg-slate-200 dark:bg-slate-800 h-60 animate-pulse" />
                {filterControlsBar}
                <div className="rounded-xl bg-slate-200 dark:bg-slate-800 h-52 animate-pulse" />
                <div className="rounded-xl bg-slate-200 dark:bg-slate-800 h-52 animate-pulse" />
              </>
            ) : isError ? (
              <>
                {filterControlsBar}
                <div className={`${ASSESSMENT_UI.errorCard} flex flex-col items-center gap-3`}>
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[26px]">
                      {errorKind === 'FORBIDDEN'
                        ? 'lock'
                        : errorKind === 'SCHEMA'
                          ? 'data_alert'
                          : 'error_outline'}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {errorKind === 'FORBIDDEN'
                      ? t('errorForbiddenTitle')
                      : errorKind === 'SCHEMA'
                        ? t('errorSchemaTitle')
                        : t('errorGenericTitle')}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                    {errorKind === 'FORBIDDEN'
                      ? t('errorForbiddenDesc')
                      : errorKind === 'SCHEMA'
                        ? t('errorSchemaDesc')
                        : t('errorGenericDesc')}
                  </p>
                  <button
                    type="button"
                    onClick={handleRefetch}
                    className={`mt-1 ${ASSESSMENT_UI.primaryBtn}`}
                  >
                    {t('retryBtn')}
                  </button>
                </div>
              </>
            ) : !featuredExam ? (
              <>
                {filterControlsBar}
                <div
                  id="exam-empty-state"
                  className={`${ASSESSMENT_UI.emptyCard} flex flex-col items-center gap-2.5`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-1">
                    <span className="material-symbols-outlined text-[28px]">
                      {hasActiveFilters ? 'search_off' : 'quiz'}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {hasActiveFilters ? t('emptyNoMatchTitle') : t('emptyNoExamsTitle')}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                    {hasActiveFilters ? t('emptyNoMatchDesc') : t('emptyNoExamsDesc')}
                  </p>
                  {hasActiveFilters && (
                    <button
                      id="reset-filters-btn"
                      type="button"
                      onClick={handleResetFilters}
                      className={`mt-2 ${ASSESSMENT_UI.primaryBtn}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                      <span>{t('resetFiltersBtn')}</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 1. Featured Spotlight Navy Card (first item of current page result) */}
                {(() => {
                  const { courseCode, courseName } = resolveCourseMeta(featuredExam);
                  return (
                    <StudentExamCard
                      exam={featuredExam}
                      featured
                      courseCode={courseCode}
                      courseName={courseName}
                      detailEntry={detailMap[featuredExam.id]}
                      locale={locale}
                      onViewExam={handleViewExamClick}
                      t={t}
                    />
                  );
                })()}

                {/* 2. Unified Filter / Search / Sort Controls Bar */}
                {filterControlsBar}

                {/* 3. Remaining Regular White Cards (never duplicating featuredExam) */}
                {regularExams.length > 0 && (
                  <div id="exam-card-list" className={ASSESSMENT_UI.cardList}>
                    {regularExams.map((exam) => {
                      const { courseCode, courseName } = resolveCourseMeta(exam);
                      return (
                        <StudentExamCard
                          key={exam.id}
                          exam={exam}
                          featured={false}
                          courseCode={courseCode}
                          courseName={courseName}
                          detailEntry={detailMap[exam.id]}
                          locale={locale}
                          onViewExam={handleViewExamClick}
                          t={t}
                        />
                      );
                    })}
                  </div>
                )}

                {/* 4. Pagination Footer */}
                <div className={ASSESSMENT_UI.paginationCard}>
                  <span
                    id="exam-count-text"
                    className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 text-center sm:text-left"
                  >
                    {t('paginationSummary', {
                      from: fromRecord,
                      to: toRecord,
                      total: totalElements,
                    })}
                  </span>

                  <div id="pagination-controls" className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={t('prevPageAria')}
                      disabled={page <= 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    {pageNumbers.map((pageIdx) => (
                      <button
                        key={pageIdx}
                        type="button"
                        aria-current={pageIdx === page ? 'page' : undefined}
                        onClick={() => setPage(pageIdx)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer ${pageIdx === page
                            ? 'bg-[#0059BB] text-white shadow-xs'
                            : 'border border-[#E2E8F0] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        {pageIdx + 1}
                      </button>
                    ))}

                    <button
                      type="button"
                      aria-label={t('nextPageAria')}
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        }
        aside={
          <AssessmentAsidePanel
            icon="info"
            title={t('statusPanelTitle')}
            footer={
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>{t('scheduleClockNote')}</span>
              </p>
            }
          >
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/60">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {t('statusOpenTitle')}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  {t('statusOpenDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/60">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0059BB] shrink-0 mt-1.5" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {t('statusUpcomingTitle')}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  {t('statusUpcomingDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/60">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {t('statusClosedTitle')}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  {t('statusClosedDesc')}
                </p>
              </div>
            </div>
          </AssessmentAsidePanel>
        }
      />
    </div>
  );
}
