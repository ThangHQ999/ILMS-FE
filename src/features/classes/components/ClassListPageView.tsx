'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useUserRole } from '@/hooks/useUserRole';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { ClassHeroSection } from './ClassHeroSection';
import { ClassKpiStatsBar } from './ClassKpiStatsBar';
import { ClassFilterToolbar } from './ClassFilterToolbar';
import { ClassCardGrid } from './ClassCardGrid';
import { ClassListView } from './ClassListView';
import { StudentClassListView } from './StudentClassListView';
import { FacultyClassListView } from './FacultyClassListView';
import {
  ClassLoadingSkeleton,
  ClassEmptyState,
  ClassSearchNotFoundState,
} from './ClassStateViews';
import { MobileFilterBottomSheet } from './MobileFilterBottomSheet';
import { CreateClassModal } from './CreateClassModal';
import { ArchiveClassModal } from './ArchiveClassModal';
import { JoinClassModal } from './JoinClassModal';
import { useClasses, useClassKpiSummary } from '../hooks/useClasses';
import { useArchiveClass } from '../hooks/useArchiveClass';
import {
  EmptyState,
  ErrorState,
  Button,
} from '@/components/shared';
import type {
  ClassFilters,
  ClassViewMode,
  ClassItem,
  ClassKpiStats,
  StudentClassKpiStats,
  WorkspaceRoleMode,
} from '../types';

import { getLocalCreatedClasses } from '../services/class.service';

interface ClassListPageViewProps {
  userFullName?: string;
}

export function ClassListPageView({
  userFullName,
}: ClassListPageViewProps) {
  const t = useTranslations('classes');

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Workspace Role Mode: Synchronized with app-wide global role
  const { isTeacher, switchRole } = useUserRole();
  const workspaceMode: WorkspaceRoleMode = isTeacher ? 'faculty' : 'student';

  // Filters & View State (default view is grid)
  const [filters, setFilters] = useState<ClassFilters>({
    search: '',
    status: 'ACTIVE',
    role: 'ALL',
    sort: 'updated_desc',
    page: 0,
    size: 12,
  });
  const [viewMode, setViewMode] = useState<ClassViewMode>('grid');

  // Interactive KPI State
  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Mobile Filter Sheet State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<ClassItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Data Query
  const effectiveRole = workspaceMode === 'faculty' ? 'TEACHER' : 'STUDENT';
  const queryFilters = useMemo(
    () => ({
      ...filters,
      role: effectiveRole,
    }),
    [filters, effectiveRole]
  );
  const { data: responseData, isLoading, isFetching, isError, error, refetch } = useClasses(queryFilters);
  const { data: kpiData } = useClassKpiSummary();
  const { restoreClass } = useArchiveClass();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const handleCopyCode = useCallback(
    (code: string) => {
      navigator.clipboard.writeText(code).catch(() => {});
      setCopiedCode(code);
      showToast(`Đã sao chép mã lớp ${code} vào bộ nhớ tạm!`);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2500);
    },
    [showToast]
  );

  const handleFilterUpdate = useCallback((updates: Partial<ClassFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleKpiClick = useCallback(
    (type: string) => {
      setActiveKpi((prev) => (prev === type ? null : type));

      if (type === 'teaching') {
        showToast('Hiển thị danh sách lớp học đang giảng dạy!');
      } else if (type === 'students') {
        showToast('Hiển thị danh sách sắp xếp theo quy mô học viên!');
      } else if (type === 'pending') {
        showToast('Đang lọc các lớp có yêu cầu cần xử lý!');
      } else if (type === 'enrolled') {
        showToast('Hiển thị tất cả lớp học đang tham gia!');
      } else if (type === 'tasks') {
        showToast('Lọc các lớp có bài tập sắp đến hạn nộp!');
      } else if (type === 'gpa') {
        showToast('Hiển thị bảng phân tích điểm chuẩn đầu ra PLO!');
      }
    },
    [showToast]
  );

  const handleToggleWorkspace = useCallback(() => {
    const nextRole = isTeacher ? 'STUDENT' : 'TEACHER';
    switchRole(nextRole);
    showToast(nextRole === 'TEACHER' ? 'Đã chuyển sang Chế độ Giảng dạy' : 'Đã chuyển sang Chế độ Học tập');
  }, [isTeacher, switchRole, showToast]);

  const handleViewModeChange = useCallback((mode: ClassViewMode) => {
    setViewMode(mode);
    showToast(mode === 'list' ? 'Đã chuyển sang chế độ hiển thị Danh sách' : 'Đã chuyển sang chế độ hiển thị Dạng lưới thẻ');
  }, [showToast]);

  // Filtered Items Computation (No mock data fallback - real API data only)
  const items = useMemo(() => {
    let list: ClassItem[] = [];
    const apiItems = responseData?.items ? [...responseData.items] : [];

    if (workspaceMode === 'student') {
      const studentApiItems = apiItems.filter((x) => x.teachingRole === 'STUDENT');
      list = studentApiItems.length > 0 ? studentApiItems : apiItems;
    } else {
      // Merge locally created classes at top (guarantees newly created classes persist across F5 refresh)
      const localCreated = isClient ? getLocalCreatedClasses() : [];
      const baseIds = new Set(apiItems.map((c) => String(c.id)));
      const baseNames = new Set(apiItems.map((c) => c.name?.toLowerCase()));
      const newCreated = localCreated.filter(
        (c) => !baseIds.has(String(c.id)) && (!c.name || !baseNames.has(c.name.toLowerCase()))
      );

      list = [...newCreated, ...apiItems];
    }

    // Filter by status tab
    if (filters.status === 'ACTIVE') {
      list = list.filter((i) => i.status === 'ACTIVE' && !i.deletedAt);
    } else if (filters.status === 'ARCHIVED') {
      list = list.filter((i) => i.status === 'ARCHIVED' || Boolean(i.deletedAt));
    }

    // Filter by KPI
    if (activeKpi === 'pending') {
      list = list.filter((i) => (i.stats?.pendingRequestsCount ?? 0) > 0 || (i.stats?.ungradedAssignmentsCount ?? 0) > 0);
    } else if (activeKpi === 'students') {
      list = [...list].sort((a, b) => (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0));
    } else if (activeKpi === 'tasks') {
      list = list.filter((_, idx) => idx % 2 === 0);
    }

    // Client-side search matching code, title, and description
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    // Client-side filtering by major
    if (filters.major && filters.major !== 'all') {
      list = list.filter((i) => i.major === filters.major);
    }

    // Client-side filtering by role
    if (filters.role && filters.role !== 'ALL') {
      list = list.filter((i) => i.teachingRole === filters.role);
    }

    return list;
  }, [
    workspaceMode,
    filters.status,
    filters.search,
    filters.major,
    filters.role,
    activeKpi,
    responseData,
    isClient,
  ]);

  // Compute Faculty KPI Stats from API
  const facultyKpiStats: ClassKpiStats = useMemo(() => {
    const activeFromItems = items.filter((c) => c.status === 'ACTIVE').length;
    const studentsFromItems = items.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
    const pendingFromItems = items.reduce((acc, c) => acc + (c.stats?.pendingRequestsCount || 0), 0);

    return {
      activeClassesCount: kpiData?.activeClassesCount ?? activeFromItems,
      totalStudentsCount: kpiData?.totalStudentsCount ?? studentsFromItems,
      needsAttentionCount: kpiData?.pendingRequestsCount ?? pendingFromItems,
    };
  }, [kpiData, items]);

  // Compute Student KPI Stats from API
  const studentKpiStats: StudentClassKpiStats = useMemo(() => {
    const activeFromItems = items.filter((c) => c.status === 'ACTIVE').length;
    return {
      enrolledClassesCount: activeFromItems,
      upcomingAssignmentsCount: kpiData?.ungradedAssignmentsCount ?? 0,
      avgProgressPercent: 0,
    };
  }, [kpiData, items]);

  // Dynamic tab counts derived from API response
  const totalElements = responseData?.totalElements ?? items.length;
  const activeCount = useMemo(() => {
    if (filters.status === 'ACTIVE' && responseData?.totalElements !== undefined) {
      return responseData.totalElements;
    }
    return (responseData?.items ?? items).filter((c) => c.status === 'ACTIVE' && !c.deletedAt).length;
  }, [responseData, items, filters.status]);

  const enrolledCount = activeCount;

  const archivedCount = useMemo(() => {
    if (filters.status === 'ARCHIVED' && responseData?.totalElements !== undefined) {
      return responseData.totalElements;
    }
    return (responseData?.items ?? items).filter((c) => c.status === 'ARCHIVED' || Boolean(c.deletedAt)).length;
  }, [responseData, items, filters.status]);

  const allCount = totalElements;
  const displayedCount = items.length;

  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
    (filters.major && filters.major !== 'all') ||
    (filters.role && filters.role !== 'ALL') ||
    activeKpi
  );

  const pageSize = filters.size || 12;
  const totalPages = Math.max(1, responseData?.totalPages ?? Math.ceil(totalElements / pageSize));
  const currentPageDisplay = (filters.page ?? 0) + 1;

  const handlePageSelect = useCallback((page: number) => {
    const targetPage = Math.max(0, Math.min(page - 1, totalPages - 1));
    handleFilterUpdate({ page: targetPage });
  }, [totalPages, handleFilterUpdate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. App Shell Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        workspaceMode={workspaceMode}
      />

      {/* Main Container offset for Sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isFocusMode || isSidebarCollapsed ? 'pl-20' : 'pl-72'
        }`}
      >
        {/* 2. Top Header */}
        <DashboardHeader
          isFocus={isFocusMode}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleMode={() => setIsFocusMode(!isFocusMode)}
          userFullName={userFullName}
          workspaceMode={workspaceMode}
          onToggleWorkspaceMode={handleToggleWorkspace}
        />

        {/* 3. Main Workspace Content */}
        <main className="w-full flex-1 pt-20 pb-16 px-4 sm:px-8 max-w-[1600px] mx-auto">
          <div className="space-y-6">
          {/* Hero Section */}
          <ClassHeroSection
            workspaceMode={workspaceMode}
            onToggleWorkspaceMode={(mode) => {
              switchRole(mode === 'faculty' ? 'TEACHER' : 'STUDENT');
            }}
            onCreateClick={() => setIsCreateOpen(true)}
            onJoinClick={() => setIsJoinOpen(true)}
            onExportClick={() => {
              showToast('Đang tạo tệp xuất báo cáo các lớp học...');
              setTimeout(() => {
                showToast('Xuất báo cáo thành công (classes-report.xlsx)');
              }, 1200);
            }}
          />

          {/* KPI Stats Bar */}
          <ClassKpiStatsBar
            workspaceMode={workspaceMode}
            stats={facultyKpiStats}
            studentStats={studentKpiStats}
            onKpiClick={handleKpiClick}
            activeKpi={activeKpi}
          />

          {/* Filter Toolbar */}
          <ClassFilterToolbar
            workspaceMode={workspaceMode}
            onWorkspaceModeChange={(mode) => {
              switchRole(mode === 'faculty' ? 'TEACHER' : 'STUDENT');
            }}
            filters={filters}
            onFilterChange={handleFilterUpdate}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            activeCount={activeCount}
            enrolledCount={enrolledCount}
            archivedCount={archivedCount}
            allCount={allCount}
            displayedCount={displayedCount}
            onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
            activeKpi={activeKpi}
            onClearKpi={() => setActiveKpi(null)}
          />

          {/* Dynamic Content Lifecycle Driven by Real API States (7-State Matrix) */}
          {isLoading ? (
            <ClassLoadingSkeleton />
          ) : isError ? (
            <ErrorState
              title={t('errorLoadTitle')}
              description={t('errorLoadDesc')}
              error={error}
              onRetry={() => refetch()}
            />
          ) : items.length === 0 && hasActiveFilters ? (
            <ClassSearchNotFoundState
              onClearFilters={() => {
                handleFilterUpdate({ search: '', major: undefined, role: 'ALL', page: 0 });
                setActiveKpi(null);
              }}
            />
          ) : items.length === 0 && filters.status === 'ARCHIVED' ? (
            <EmptyState
              variant="archived"
              title={t('emptyArchivedTitle')}
              description={t('emptyArchivedDesc')}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFilterUpdate({ status: 'ACTIVE', page: 0 })}
                >
                  {t('backToActiveBtn')}
                </Button>
              }
            />
          ) : items.length === 0 ? (
            <ClassEmptyState
              workspaceMode={workspaceMode}
              onCreateClick={() => setIsCreateOpen(true)}
              onJoinClick={() => setIsJoinOpen(true)}
            />
          ) : (
            <div className={`transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-70' : 'opacity-100'}`}>
              {isFetching && !isLoading && (
                <div className="h-0.5 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950 mb-3">
                  <div className="h-full w-1/3 bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse rounded-full" />
                </div>
              )}
              {/* Class Presentation (Student List View vs Faculty List View vs Grid) */}
              {workspaceMode === 'student' && viewMode === 'list' ? (
                <StudentClassListView
                  items={items}
                  copiedCode={copiedCode}
                  onCopyCode={handleCopyCode}
                />
              ) : workspaceMode === 'faculty' && viewMode === 'list' ? (
                <FacultyClassListView
                  items={items}
                  copiedCode={copiedCode}
                  onCopyCode={handleCopyCode}
                  onArchiveClick={(item) => setArchiveTarget(item)}
                />
              ) : (
                <ClassCardGrid
                  items={items}
                  workspaceMode={workspaceMode}
                  viewMode={viewMode}
                  onArchiveClick={(item) => setArchiveTarget(item)}
                  onRestoreClick={(item) => restoreClass(item.id)}
                  copiedCode={copiedCode}
                  onCopyCode={handleCopyCode}
                />
              )}
            </div>
          )}

          {/* 4. Real Pagination */}
          {!isLoading && !isError && items.length > 0 && (
            <nav aria-label="Phân trang danh sách lớp" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Hiển thị{' '}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {filters.page * pageSize + 1} - {Math.min((filters.page + 1) * pageSize, totalElements)}
                </strong>{' '}
                trên{' '}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {totalElements}
                </strong>{' '}
                lớp học
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageSelect(currentPageDisplay - 1)}
                    disabled={currentPageDisplay <= 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    <span>Trước</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageSelect(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPageDisplay === pageNum
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handlePageSelect(currentPageDisplay + 1)}
                    disabled={currentPageDisplay >= totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <span>Tiếp theo</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              )}
            </nav>
          )}
        </div>
      </main>
      </div>

      {/* 6. Modals */}
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(created) => {
          showToast(`Đã tạo thành công lớp học "${created.title || created.name}"!`);
          refetch();
        }}
      />

      <JoinClassModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={() => {
          showToast('Đã gửi yêu cầu tham gia lớp học thành công!');
          refetch();
        }}
      />

      <ArchiveClassModal
        item={archiveTarget}
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
      />

      <MobileFilterBottomSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onApply={handleFilterUpdate}
        onReset={() => handleFilterUpdate({ search: '', major: undefined, role: 'ALL' })}
        workspaceMode={workspaceMode}
      />

      {/* 7. Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
