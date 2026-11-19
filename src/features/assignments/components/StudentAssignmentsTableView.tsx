'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useClassAssignmentsWithSubmissions,
  isAssignmentUnsubmitted,
  isAssignmentPendingGrading,
  isAssignmentGraded,
  type EnrichedAssignment,
} from '../hooks/useClassAssignmentsWithSubmissions';
import {
  formatAssignmentDueDate,
  formatSubmissionTime,
  formatScore,
} from '../services/assignment.service';
import { StudentExamsTableView } from './StudentExamsTableView';
import {
  ASSESSMENT_UI,
  AssessmentAsidePanel,
  AssessmentBadge,
  AssessmentCardHeader,
  AssessmentListHeader,
  AssessmentSubtabToggle,
  AssessmentTwoColumnLayout,
} from './AssessmentListPrimitives';

export interface StudentAssignmentsTableViewProps {
  classId: string;
  routeClassId?: string;
  className?: string;
  onViewAssignment?: (assignmentId: string) => void;
  onViewExam?: (examId: string) => void;
}

type AssignmentFilterTab = 'ALL' | 'UNSUBMITTED' | 'OVERDUE' | 'PENDING_GRADING' | 'GRADED';
type SortOption = 'newest' | 'az' | 'deadline';

function isAssignmentOverdue(item: EnrichedAssignment): boolean {
  if (!isAssignmentUnsubmitted(item)) return false;
  if (!item.dueDate) return false;
  const dueMs = new Date(item.dueDate).getTime();
  return !isNaN(dueMs) && dueMs < Date.now();
}

function getAttachmentFileName(url?: string | null): string {
  if (!url) return '';
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      return decodeURIComponent(lastPart.split('?')[0]);
    }
  } catch {
    // ignore parsing failure
  }
  return 'Tai_lieu_dinh_kem.pdf';
}

export function StudentAssignmentsTableView({
  classId,
  routeClassId,
  className,
  onViewAssignment,
  onViewExam,
}: StudentAssignmentsTableViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('assignments.student');
  const tExams = useTranslations('assignments.exams.student');

  // Local interactive controls state with subtab URL synchronization
  const subtabParam = searchParams.get('subtab');
  const [activeTypeTab, setActiveTypeTab] = useState<'assignments' | 'exams'>(
    subtabParam === 'exams' ? 'exams' : 'assignments'
  );

  useEffect(() => {
    if (subtabParam === 'exams') {
      setActiveTypeTab('exams');
    } else if (!subtabParam) {
      setActiveTypeTab('assignments');
    }
  }, [subtabParam]);

  const handleTabToggle = (tab: 'assignments' | 'exams') => {
    setActiveTypeTab(tab);
    setPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'assignments');
    if (tab === 'exams') {
      params.set('subtab', 'exams');
    } else {
      params.delete('subtab');
    }
    router.replace(`/classes/${routeClassId || classId}?${params.toString()}`, { scroll: false });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<AssignmentFilterTab>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [page, setPage] = useState(0);
  const pageSize = 5;

  // Reset page to 0 when switching classes
  useEffect(() => {
    setPage(0);
  }, [classId]);

  // Query all assignments of class and their individual my-submission statuses in one synchronized pipeline
  const {
    assignments,
    isLoading,
    isError,
    refetch,
  } = useClassAssignmentsWithSubmissions(classId, { search: searchTerm });

  // 1. Filter by toggle [Bài tập] vs [Bài thi]
  const currentScopeAssignments = useMemo(() => {
    if (activeTypeTab === 'exams') {
      return assignments.filter((item) => item.type === 'EXAM' || item.type === 'QUIZ');
    }
    // 'assignments' shows course practice items, labs, homework
    return assignments;
  }, [assignments, activeTypeTab]);

  // 2. Compute dynamic counts from the exact same class dataset
  const kpiStats = useMemo(() => {
    const total = currentScopeAssignments.length;
    const unsubmitted = currentScopeAssignments.filter(isAssignmentUnsubmitted).length;
    const overdue = currentScopeAssignments.filter(isAssignmentOverdue).length;
    const pendingGrading = currentScopeAssignments.filter(isAssignmentPendingGrading).length;
    const graded = currentScopeAssignments.filter(isAssignmentGraded).length;

    return { total, unsubmitted, overdue, pendingGrading, graded };
  }, [currentScopeAssignments]);

  // 3. Apply status filters BEFORE pagination
  const filteredByStatus = useMemo(() => {
    switch (activeFilter) {
      case 'UNSUBMITTED':
        return currentScopeAssignments.filter(isAssignmentUnsubmitted);
      case 'OVERDUE':
        return currentScopeAssignments.filter(isAssignmentOverdue);
      case 'PENDING_GRADING':
        return currentScopeAssignments.filter(isAssignmentPendingGrading);
      case 'GRADED':
        return currentScopeAssignments.filter(isAssignmentGraded);
      case 'ALL':
      default:
        return currentScopeAssignments;
    }
  }, [currentScopeAssignments, activeFilter]);

  // 4. Sort filtered items
  const sortedAndFilteredItems = useMemo(() => {
    const list = [...filteredByStatus];

    if (sortBy === 'az') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'deadline') {
      list.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }

    return list;
  }, [filteredByStatus, sortBy]);

  // 5. Featured Navy Card Candidate Selection Rules:
  // - Must be on page 0
  // - Filter tab must be 'ALL'
  // - No active search text
  // - Must be an unsubmitted assignment that can still be submitted (not past due OR late allowed)
  // - Prioritized by earliest upcoming deadline
  const isDefaultOverview = page === 0 && activeFilter === 'ALL' && !searchTerm.trim();

  const featuredCandidate = useMemo(() => {
    if (!isDefaultOverview) return null;
    const firstPageItems = sortedAndFilteredItems.slice(0, pageSize);
    const unsubmittedCandidates = firstPageItems.filter((item) => {
      if (!isAssignmentUnsubmitted(item)) return false;
      if (!item.dueDate) return true;
      const isPastDue = new Date(item.dueDate).getTime() < Date.now();
      return !isPastDue || item.allowLateSubmission;
    });

    if (unsubmittedCandidates.length === 0) return null;

    // Prioritize earliest deadline
    unsubmittedCandidates.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return unsubmittedCandidates[0];
  }, [isDefaultOverview, sortedAndFilteredItems, pageSize]);

  // 6. Pagination applied on filtered result (strictly 5 items per page total)
  const totalFiltered = sortedAndFilteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // The white cards to render on the current page:
  // When featuredCandidate is shown on page 0, it takes 1 slot, so white cards show the other 4 items.
  const pagedItems = useMemo(() => {
    if (featuredCandidate && isDefaultOverview) {
      const pageSlice = sortedAndFilteredItems.slice(0, pageSize);
      return pageSlice.filter((item) => item.id !== featuredCandidate.id);
    }
    const startIndex = page * pageSize;
    return sortedAndFilteredItems.slice(startIndex, startIndex + pageSize);
  }, [sortedAndFilteredItems, page, pageSize, featuredCandidate, isDefaultOverview]);

  // Event handlers
  const handleFilterChange = (filter: AssignmentFilterTab) => {
    setActiveFilter(filter);
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const startIndex = totalFiltered > 0 ? page * pageSize + 1 : 0;
  const endIndex = Math.min((page + 1) * pageSize, totalFiltered);

  // Helper for assignment navigation
  const handleAssignmentClick = (assignmentId: string) => {
    if (onViewAssignment) {
      onViewAssignment(assignmentId);
    } else {
      router.push(`/classes/${classId}/assignments/${assignmentId}`);
    }
  };

  if (activeTypeTab === 'exams') {
    return (
      <div className={ASSESSMENT_UI.wrapper}>
        <AssessmentListHeader
          title={tExams('pageTitle')}
          subtitle={className}
          actions={
            <AssessmentSubtabToggle
              activeTab="exams"
              assignmentsLabel={t('toggleAssignments')}
              examsLabel={t('toggleExams')}
              onChange={handleTabToggle}
            />
          }
        />

        <StudentExamsTableView
          classId={classId}
          routeClassId={routeClassId || classId}
          className={className}
          hideHeader
          onViewExam={onViewExam}
        />
      </div>
    );
  }

  return (
    <div className={ASSESSMENT_UI.wrapper}>
      {/* 1. Unified Page Header with Title, Class Info, and [Bài tập | Bài thi] Toggle */}
      <AssessmentListHeader
        title="Bài tập & Đánh giá"
        subtitle={className || undefined}
        actions={
          <AssessmentSubtabToggle
            activeTab="assignments"
            assignmentsLabel="Bài tập"
            examsLabel="Bài thi"
            onChange={handleTabToggle}
          />
        }
      />

      {/* 2. Unified 2-Column Desktop Grid: Main minmax(0, 1fr) + Aside 320px, gap 24px */}
      <AssessmentTwoColumnLayout
        main={
          <>
          {/* A. Featured Navy Card (Shown only on page 0, filter ALL, no search, max 1 item) */}
          {featuredCandidate && (() => {
            const isFeaturedPastDue = featuredCandidate.dueDate ? new Date(featuredCandidate.dueDate).getTime() < Date.now() : false;
            const isFeaturedPastDueWithLate = isFeaturedPastDue && Boolean(featuredCandidate.allowLateSubmission);
            const hasFeaturedDueDate = Boolean(featuredCandidate.dueDate);

            return (
              <div
                data-assignment-featured="true"
                className={`${ASSESSMENT_UI.featuredCard} relative overflow-hidden`}
              >
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
                        description
                      </span>
                    </div>
                  }
                  title={
                    <h2
                      onClick={() => handleAssignmentClick(featuredCandidate.id)}
                      className={`${ASSESSMENT_UI.cardTitle} text-white hover:text-sky-300 transition-colors cursor-pointer`}
                    >
                      {featuredCandidate.title}
                    </h2>
                  }
                  badges={
                    <>
                      {featuredCandidate.chapter && featuredCandidate.chapter.trim() && (
                        <AssessmentBadge variant="neutral" surface="navy">
                          {featuredCandidate.chapter.trim()}
                        </AssessmentBadge>
                      )}
                      {isFeaturedPastDue && (
                        <AssessmentBadge variant="overdue" surface="navy" icon="alarm">
                          Quá hạn
                        </AssessmentBadge>
                      )}
                      <AssessmentBadge variant="unsubmitted" surface="navy" icon="schedule">
                        Chưa nộp
                      </AssessmentBadge>
                    </>
                  }
                />

                {/* Description */}
                {featuredCandidate.description && (
                  <p className="text-sm text-slate-300/85 mt-4 leading-relaxed line-clamp-2 break-words [overflow-wrap:anywhere]">
                    {featuredCandidate.description}
                  </p>
                )}

                {/* Seamless Metadata Row */}
                <div
                  className={`grid grid-cols-1 ${
                    hasFeaturedDueDate ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                  } gap-3 pt-4 border-t border-slate-700/50 mt-4 text-xs`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-base">schedule</span>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Hạn nộp</span>
                      <span
                        className={
                          !hasFeaturedDueDate
                            ? 'text-slate-400 font-medium'
                            : isFeaturedPastDueWithLate
                            ? 'text-amber-400 font-semibold'
                            : 'text-white font-medium'
                        }
                      >
                        {!hasFeaturedDueDate
                          ? 'Không có hạn nộp'
                          : isFeaturedPastDueWithLate
                          ? 'Quá hạn · Cho nộp muộn'
                          : formatAssignmentDueDate(featuredCandidate.dueDate).label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-base">star</span>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Điểm tối đa</span>
                      <span className="text-white font-medium">
                        {featuredCandidate.maxScore || 10} điểm
                      </span>
                    </div>
                  </div>

                  {hasFeaturedDueDate && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-base">event_available</span>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nộp muộn</span>
                        <span
                          className={`font-semibold ${
                            featuredCandidate.allowLateSubmission
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {featuredCandidate.allowLateSubmission ? 'Cho phép' : 'Không cho phép'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Document link and Action Button */}
                <div
                  className={`flex flex-col sm:flex-row sm:items-center ${
                    featuredCandidate.fileAttachmentUrl ? 'justify-between' : 'justify-end'
                  } gap-3 pt-4 mt-3 border-t border-slate-700/50`}
                >
                  {featuredCandidate.fileAttachmentUrl && (
                    <div className="min-w-0">
                      <a
                        href={featuredCandidate.fileAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 hover:underline transition-colors truncate max-w-full"
                      >
                        <span className="material-symbols-outlined text-base">attach_file</span>
                        <span className="truncate">
                          Xem tài liệu đề bài: {getAttachmentFileName(featuredCandidate.fileAttachmentUrl)}
                        </span>
                      </a>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAssignmentClick(featuredCandidate.id)}
                    className={ASSESSMENT_UI.featuredPrimaryBtn}
                  >
                    Xem bài tập
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
            </div>
          );
        })()}

          {/* B. Search & Filter Toolbar (Unified 44px controls, single outer 2px card border) */}
          <div className={`${ASSESSMENT_UI.toolbarCard} flex flex-col gap-3.5`}>
            {/* Row 1: Search input on left, Sort selector on right */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative flex-1 min-w-0">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                  search
                </span>
                <input
                  id="inputSearchStudentAssignment"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Tìm theo tên bài tập…"
                  className={ASSESSMENT_UI.inputControl}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                  Sắp xếp:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className={ASSESSMENT_UI.selectControl}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="deadline">Hạn nộp gần nhất</option>
                  <option value="az">Tên A–Z</option>
                </select>
              </div>
            </div>

            {/* Row 2: 4 Dynamic Filter Chips with live counter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleFilterChange('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'ALL'
                    ? 'bg-[#0059BB] text-white shadow-xs'
                    : 'bg-[#F0F4F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {/* filterChipAll */}
                Tất cả ({kpiStats.total})
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('UNSUBMITTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'UNSUBMITTED'
                    ? 'bg-[#0059BB] text-white shadow-xs'
                    : 'bg-[#F0F4F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {/* filterChipUnsubmitted */}
                Chưa nộp ({kpiStats.unsubmitted})
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('OVERDUE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'OVERDUE'
                    ? 'bg-[#0059BB] text-white shadow-xs'
                    : 'bg-[#F0F4F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {/* filterChipOverdue */}
                Quá hạn ({kpiStats.overdue})
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('PENDING_GRADING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'PENDING_GRADING'
                    ? 'bg-[#0059BB] text-white shadow-xs'
                    : 'bg-[#F0F4F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {/* filterChipPendingGrading */}
                Chờ chấm ({kpiStats.pendingGrading})
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('GRADED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'GRADED'
                    ? 'bg-[#0059BB] text-white shadow-xs'
                    : 'bg-[#F0F4F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {/* filterChipGraded */}
                Đã chấm ({kpiStats.graded})
              </button>
            </div>
          </div>

          {/* C. Loading and Empty States */}
          {isLoading ? (
            <div className={ASSESSMENT_UI.cardList}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border-2 border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className={ASSESSMENT_UI.errorCard}>
              <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">
                error_outline
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Không thể tải danh sách bài tập
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại sau.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className={`mt-4 ${ASSESSMENT_UI.primaryBtn}`}
              >
                Thử lại
              </button>
            </div>
          ) : pagedItems.length === 0 && !featuredCandidate ? (
            <div className={ASSESSMENT_UI.emptyCard}>
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                assignment_late
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {searchTerm
                  ? 'Không tìm thấy bài tập phù hợp'
                  : activeFilter === 'OVERDUE'
                  ? 'Không có bài tập quá hạn'
                  : activeFilter === 'UNSUBMITTED'
                  ? 'Không có bài tập chờ hoàn thành'
                  : activeFilter === 'PENDING_GRADING'
                  ? 'Chưa có bài tập nào đang chờ chấm'
                  : activeFilter === 'GRADED'
                  ? 'Chưa có bài tập nào được chấm điểm'
                  : 'Chưa có bài tập nào'}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                {searchTerm
                  ? `Không có kết quả nào khớp với từ khóa "${searchTerm}". Hãy thử đổi từ khóa hoặc bộ lọc.`
                  : activeFilter === 'UNSUBMITTED'
                  ? 'Tuyệt vời! Bạn đã nộp hoặc hoàn thành toàn bộ bài tập trong mục này.'
                  : 'Hiện tại lớp chưa có bài tập nào được giao.'}
              </p>
              {(searchTerm || activeFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilter('ALL');
                    setPage(0);
                  }}
                  className={`mt-4 ${ASSESSMENT_UI.primaryBtn}`}
                >
                  Xem tất cả bài tập
                </button>
              )}
            </div>
          ) : (
            /* D. List of White Cards (Unified 24px gap) */
            <div className={ASSESSMENT_UI.cardList}>
              {pagedItems.map((item) => {
                const isUnsubmitted = isAssignmentUnsubmitted(item);
                const isPendingGrading = isAssignmentPendingGrading(item);
                const isGraded = isAssignmentGraded(item);

                // Specific icon color and background per assignment topic
                const isSql = item.chapter === 'SQL' || item.title.includes('SQL');
                const isQuiz = item.type === 'QUIZ' || item.chapter === 'QUIZ';
                const isBcnf = item.title.includes('BCNF') || item.chapter === 'TUẦN 8';
                const isErd = item.title.includes('ERD') || item.title.includes('lược đồ');

                const iconBgClass = isSql
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  : isQuiz
                  ? 'bg-teal-50 text-teal-600 border border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800'
                  : isBcnf
                  ? 'bg-purple-50 text-purple-600 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800'
                  : isErd
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800'
                  : 'bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';

                const iconName = isSql
                  ? 'code'
                  : isQuiz
                  ? 'help'
                  : isBcnf
                  ? 'hub'
                  : isErd
                  ? 'schema'
                  : 'assignment';

                // Format dates and deadline alerts
                const dueInfo = item.dueDate
                  ? formatAssignmentDueDate(item.dueDate)
                  : { label: 'Không có hạn nộp', isPastDue: false, isDueSoon: false };

                const formattedSub = formatSubmissionTime(
                  item.submission?.submittedAt || item.submissionDate
                );

                const isOverdue = isAssignmentOverdue(item);
                const isSubmittedLate = Boolean(item.submission?.isLate);

                return (
                  <div
                    key={item.id}
                    className={`${ASSESSMENT_UI.surfaceCard} flex flex-col gap-4`}
                  >
                    {/* Header: Left Icon + Title, Right Unified Badge Group */}
                    <AssessmentCardHeader
                      icon={
                        <div
                          data-card-icon-box="true"
                          className={`${ASSESSMENT_UI.cardIconBox} ${iconBgClass}`}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '22px', lineHeight: 1 }}
                          >
                            {iconName}
                          </span>
                        </div>
                      }
                      title={
                        <h3
                          onClick={() => handleAssignmentClick(item.id)}
                          className={`${ASSESSMENT_UI.cardTitle} text-slate-900 dark:text-slate-100 hover:text-[#0059BB] dark:hover:text-blue-400 transition-colors cursor-pointer`}
                        >
                          {item.title}
                        </h3>
                      }
                      badges={
                        <>
                          {item.chapter && item.chapter.trim() && (
                            <AssessmentBadge variant="neutral">
                              {item.chapter.trim()}
                            </AssessmentBadge>
                          )}

                          {isOverdue && (
                            <AssessmentBadge variant="overdue" icon="alarm">
                              Quá hạn
                            </AssessmentBadge>
                          )}

                          {isUnsubmitted && (
                            <AssessmentBadge variant="unsubmitted" icon="schedule">
                              Chưa nộp
                            </AssessmentBadge>
                          )}

                          {isPendingGrading && (
                            <AssessmentBadge
                              variant="pendingGrading"
                              icon="hourglass_top"
                              spinIcon
                            >
                              Đang chờ chấm
                            </AssessmentBadge>
                          )}

                          {isGraded && (
                            <AssessmentBadge variant="graded" icon="check_circle">
                              Đã chấm
                            </AssessmentBadge>
                          )}

                          {!isUnsubmitted && isSubmittedLate && (
                            <AssessmentBadge variant="late" icon="schedule">
                              Nộp muộn
                            </AssessmentBadge>
                          )}
                        </>
                      }
                    />

                    {/* Short Description */}
                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 break-words [overflow-wrap:anywhere]">
                        {item.description}
                      </p>
                    )}

                    {/* Metadata Row */}
                    {!isGraded && (() => {
                      const isPastDue = item.dueDate
                        ? new Date(item.dueDate).getTime() < Date.now()
                        : false;
                      const isPastDueWithLate = isPastDue && Boolean(item.allowLateSubmission);
                      const hasDueDate = Boolean(item.dueDate);

                      return (
                        <div
                          className={`grid grid-cols-1 ${
                            hasDueDate ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                          } gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-base">
                              schedule
                            </span>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Hạn nộp</span>
                              <span
                                className={`font-medium ${
                                  !hasDueDate
                                    ? 'text-slate-500 dark:text-slate-400'
                                    : isPastDueWithLate
                                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                    : isUnsubmitted && isPastDue
                                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                    : isUnsubmitted && dueInfo.isDueSoon
                                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {!hasDueDate
                                  ? 'Không có hạn nộp'
                                  : isPastDueWithLate
                                  ? 'Quá hạn · Cho nộp muộn'
                                  : dueInfo.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-base">star</span>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Điểm tối đa</span>
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {item.maxScore ?? 10} điểm
                              </span>
                            </div>
                          </div>

                          {hasDueDate && (
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-slate-400 text-base">
                                event_available
                              </span>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Nộp muộn</span>
                                <span
                                  className={`font-medium ${
                                    item.allowLateSubmission
                                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                      : 'text-slate-500 dark:text-slate-400'
                                  }`}
                                >
                                  {item.allowLateSubmission ? 'Cho phép' : 'Không cho phép'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Condition A: Pending Grading info strip */}
                    {isPendingGrading && (
                      <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-base">
                          check_circle
                        </span>
                        <span>
                          Đã nộp: {formattedSub.formatted} • Lần{' '}
                          {item.submission?.submissionAttempt || 1}{' '}
                          ({item.submission?.isLate ? 'Nộp muộn' : 'Đúng hạn'})
                        </span>
                      </div>
                    )}

                    {/* Condition B: Graded result card box */}
                    {isGraded && (() => {
                      const teacherComment = (
                        item.submission?.feedback ||
                        item.teacherFeedback ||
                        ''
                      ).trim();
                      const graderName = item.submission?.gradedByTeacherName?.trim();
                      const gradedTimeFormatted = item.submission?.gradedAt
                        ? formatSubmissionTime(item.submission.gradedAt).formatted
                        : null;

                      if (!teacherComment) {
                        return (
                          <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Score Section */}
                            <div className="flex flex-col justify-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                ĐIỂM ĐẠT
                              </span>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 dark:text-emerald-200">
                                  {formatScore(item.effectiveScore, 'vi')}
                                </span>
                                <span className="text-sm font-semibold text-emerald-600/80 dark:text-emerald-400/80">
                                  /10
                                </span>
                              </div>
                            </div>

                            {/* Grader Info Section */}
                            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 flex flex-col justify-center">
                              <div>
                                Người chấm:{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {graderName || 'Giảng viên'}
                                </span>
                              </div>
                              {gradedTimeFormatted && (
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Lúc {gradedTimeFormatted}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/70 p-4 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                          {/* Score Column */}
                          <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-emerald-200/60 dark:border-emerald-800/60 pb-2.5 md:pb-0 md:pr-4 flex flex-col justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                              ĐIỂM ĐẠT
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 dark:text-emerald-200">
                                {formatScore(item.effectiveScore, 'vi')}
                              </span>
                              <span className="text-sm font-semibold text-emerald-600/80 dark:text-emerald-400/80">
                                /10
                              </span>
                            </div>
                          </div>

                          {/* Feedback Column - Widest */}
                          <div className="md:col-span-6 flex flex-col gap-1 pr-0 md:pr-2">
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-400">
                                chat_bubble_outline
                              </span>
                              Nhận xét của giảng viên:
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                              &ldquo;{teacherComment}&rdquo;
                            </p>
                          </div>

                          {/* Grader info column */}
                          <div className="md:col-span-3 text-left md:text-right text-xs text-slate-500 dark:text-slate-400 flex flex-col justify-center">
                            <div>
                              Người chấm:{' '}
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {graderName || 'Giảng viên'}
                              </span>
                            </div>
                            {gradedTimeFormatted && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Lúc {gradedTimeFormatted}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* White Card Footer: Attachment link & Action button */}
                    <div
                      className={`flex flex-col sm:flex-row sm:items-center ${
                        item.fileAttachmentUrl ? 'justify-between' : 'justify-end'
                      } gap-3 pt-3 border-t border-slate-100 dark:border-slate-800`}
                    >
                      {item.fileAttachmentUrl && (
                        <div className="min-w-0">
                          <a
                            href={item.fileAttachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium truncate max-w-full"
                          >
                            <span className="material-symbols-outlined text-base">attach_file</span>
                            <span className="truncate">
                              Xem tài liệu đề bài: {getAttachmentFileName(item.fileAttachmentUrl)}
                            </span>
                          </a>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAssignmentClick(item.id)}
                        className={`${ASSESSMENT_UI.primaryBtn} self-end sm:self-auto`}
                      >
                        {/* viewResult / viewSubmission */}
                        {isGraded ? 'Xem kết quả / Bài làm' : isPendingGrading ? 'Xem bài nộp' : 'Xem bài tập'}
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* E. Pagination row */}
          {totalFiltered > 0 && (
            <div className={ASSESSMENT_UI.paginationCard}>
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Hiển thị {startIndex}–{endIndex} trên tổng số {totalFiltered} bài tập
              </span>

              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Trang trước"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePageChange(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      page === i
                        ? 'bg-[#0059BB] text-white shadow-xs'
                        : 'border border-[#E2E8F0] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Trang sau"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
          </>
        }
        aside={
          <>
            {/* Panel 1: Quy định nộp bài */}
            <AssessmentAsidePanel icon="verified_user" title="Quy định nộp bài">
              {/* Rule 1 */}
              <div className="p-3.5 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/50 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400 shrink-0 mt-0.5">
                  tune
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Thiết lập theo từng bài
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    Điểm tối đa, thời hạn nộp và chính sách nộp muộn được áp dụng chi tiết cho từng bài tập cụ thể.
                  </p>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="p-3.5 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/50 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[16px] text-[#0059BB] dark:text-blue-400 shrink-0 mt-0.5">
                  link
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Quyền truy cập đường dẫn
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    Với bài làm nộp bằng liên kết trực tuyến, hãy đảm bảo người chấm được cấp quyền xem hoặc nhận xét.
                  </p>
                </div>
              </div>
            </AssessmentAsidePanel>

            {/* Panel 2: Hướng dẫn nộp bài */}
            <AssessmentAsidePanel icon="help" title="Hướng dẫn nộp bài">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Mở chi tiết bài tập
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    Nhấn &apos;Xem bài tập&apos; để đọc kỹ yêu cầu, đề bài và tiêu chí đánh giá chi tiết.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Nhập bài làm trực tuyến
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    Điền nội dung câu trả lời trực tiếp hoặc dán đường dẫn tài liệu đính kèm.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Kiểm tra &amp; Xác nhận nộp
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    Rà soát lại toàn bộ câu trả lời và nhấn nút nộp bài để hoàn tất quy trình.
                  </p>
                </div>
              </div>
            </AssessmentAsidePanel>
          </>
        }
      />
    </div>
  );
}
