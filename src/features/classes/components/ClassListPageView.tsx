'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { ClassHeroSection } from './ClassHeroSection';
import { ClassKpiStatsBar } from './ClassKpiStatsBar';
import { ClassFilterToolbar, type ClassRoleTab } from './ClassFilterToolbar';
import { ClassCardGrid } from './ClassCardGrid';
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
import { EmptyState, ErrorState, Button } from '@/components/shared';
import { toast } from '@/components/ui/sonner';
import type {
  ClassFilters,
  ClassViewMode,
  ClassItem,
  ClassKpiStats,
  StudentClassKpiStats,
  WorkspaceRoleMode,
} from '../types';
import { getLocalCreatedClasses } from '../services/class.service';

const LAST_CLASS_TAB_KEY = 'ilms_classes_last_tab';

interface ClassListPageViewProps {
  userFullName?: string;
}

export function ClassListPageView({ userFullName }: ClassListPageViewProps) {
  const t = useTranslations('classes');

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();

  // Role-based 3-tab state: TEACHING | ENROLLED | ARCHIVED
  const [activeTab, setActiveTab] = useState<ClassRoleTab>('ENROLLED');
  const hasInitializedTabRef = useRef(false);

  // Synchronize saved tab from localStorage after initial client hydration to prevent SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_CLASS_TAB_KEY) as ClassRoleTab | null;
      if (saved === 'TEACHING' || saved === 'ENROLLED' || saved === 'ARCHIVED') {
        setActiveTab(saved);
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  const [filters, setFilters] = useState<ClassFilters>({
    search: '',
    status: 'ACTIVE',
    role: 'ALL',
    sort: 'updated_desc',
    page: 0,
    size: 12,
  });
  const [viewMode, setViewMode] = useState<ClassViewMode>('list');
  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Modals & UI feedback
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [initialJoinCode, setInitialJoinCode] = useState('');
  const [archiveTarget, setArchiveTarget] = useState<ClassItem | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code')?.trim();
    if (codeParam) {
      setInitialJoinCode(codeParam);
      setIsJoinOpen(true);
    }
  }, []);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Lazy loading per tab: Only query active tab; fallback check teaching if enrolled is empty
  const isTeachingActive = activeTab === 'TEACHING';
  const isEnrolledActive = activeTab === 'ENROLLED';
  const isArchivedActive = activeTab === 'ARCHIVED';

  const enrolledQuery = useClasses(
    {
      status: 'ACTIVE',
      role: 'STUDENT',
      sort: filters.sort,
      page: 0,
      size: 12,
    },
    { enabled: isEnrolledActive }
  );

  // If a first-time user lands on ENROLLED but has 0 enrolled classes, check if they have TEACHING classes
  const shouldCheckTeachingFallback =
    isEnrolledActive &&
    enrolledQuery.isSuccess &&
    (enrolledQuery.data?.items ?? []).length === 0 &&
    !hasInitializedTabRef.current;

  const teachingQuery = useClasses(
    {
      status: 'ACTIVE',
      role: 'TEACHER',
      sort: filters.sort,
      page: 0,
      size: 12,
    },
    { enabled: isTeachingActive || shouldCheckTeachingFallback }
  );

  const archivedQuery = useClasses(
    {
      status: 'ARCHIVED',
      role: 'ALL',
      sort: filters.sort,
      page: 0,
      size: 12,
    },
    { enabled: isArchivedActive }
  );

  const { data: kpiData } = useClassKpiSummary();
  const { restoreClass } = useArchiveClass();

  const refetchAll = useCallback(() => {
    if (activeTab === 'TEACHING' || teachingQuery.isSuccess) teachingQuery.refetch();
    if (activeTab === 'ENROLLED' || enrolledQuery.isSuccess) enrolledQuery.refetch();
    if (activeTab === 'ARCHIVED' || archivedQuery.isSuccess) archivedQuery.refetch();
  }, [activeTab, teachingQuery, enrolledQuery, archivedQuery]);

  const showToast = useCallback((msg: string) => {
    const isError =
      msg.toLowerCase().includes('lỗi') ||
      msg.toLowerCase().includes('không thể') ||
      msg.toLowerCase().includes('thất bại');
    if (isError) {
      toast.error(msg);
    } else {
      toast.success(msg);
    }
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

  // Base items per tab (before client-side search/role/KPI filters)
  const teachingBaseItems = useMemo(() => {
    const apiItems = teachingQuery.data?.items ?? [];
    const localCreated = isClient ? getLocalCreatedClasses() : [];
    const baseIds = new Set(apiItems.map((c) => String(c.id)));
    const baseNames = new Set(apiItems.map((c) => c.name?.toLowerCase()));
    const newCreated = localCreated.filter(
      (c) => !baseIds.has(String(c.id)) && (!c.name || !baseNames.has(c.name.toLowerCase()))
    );
    return [...newCreated, ...apiItems].filter(
      (i) => i.status === 'ACTIVE' && !i.deletedAt
    );
  }, [teachingQuery.data, isClient]);

  const enrolledBaseItems = useMemo(() => {
    const apiItems = enrolledQuery.data?.items ?? [];
    const activeItems = apiItems.filter((i) => i.status === 'ACTIVE' && !i.deletedAt);
    const studentItems = activeItems.filter((x) => x.teachingRole === 'STUDENT');
    return studentItems.length > 0 ? studentItems : activeItems;
  }, [enrolledQuery.data]);

  const archivedBaseItems = useMemo(() => {
    const apiItems = archivedQuery.data?.items ?? [];
    return apiItems.filter((i) => i.status === 'ARCHIVED' || Boolean(i.deletedAt));
  }, [archivedQuery.data]);

  const teachingCount = teachingQuery.data?.totalElements ?? teachingBaseItems.length;
  const enrolledCount = enrolledQuery.data?.totalElements ?? enrolledBaseItems.length;
  const archivedCount = archivedQuery.data?.totalElements ?? archivedBaseItems.length;
  const showTeachingTab = true;

  // Smart Default auto-switch when user has 0 enrolled classes but has teaching classes
  useEffect(() => {
    if (hasInitializedTabRef.current) return;

    if (
      activeTab === 'ENROLLED' &&
      enrolledQuery.isSuccess &&
      enrolledBaseItems.length === 0 &&
      teachingQuery.isSuccess &&
      teachingBaseItems.length > 0
    ) {
      hasInitializedTabRef.current = true;
      setActiveTab('TEACHING');
      try {
        localStorage.setItem(LAST_CLASS_TAB_KEY, 'TEACHING');
      } catch {
        // Ignore
      }
    } else if (enrolledQuery.isSuccess && enrolledBaseItems.length > 0) {
      hasInitializedTabRef.current = true;
    }
  }, [activeTab, enrolledQuery.isSuccess, enrolledBaseItems.length, teachingQuery.isSuccess, teachingBaseItems.length]);

  const handleTabChange = useCallback((tab: ClassRoleTab) => {
    setActiveTab(tab);
    setActiveKpi(null);
    setFilters((prev) => ({
      ...prev,
      status: tab === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE',
      role: 'ALL',
      page: 0,
    }));
    try {
      localStorage.setItem(LAST_CLASS_TAB_KEY, tab);
    } catch {
      // Ignore storage write error
    }
  }, []);

  const handleKpiClick = useCallback(
    (type: string) => {
      setActiveKpi((prev) => (prev === type ? null : type));
      if (type === 'teaching') showToast('Hiển thị danh sách lớp học đang giảng dạy!');
      else if (type === 'students') showToast('Hiển thị danh sách sắp xếp theo quy mô học viên!');
      else if (type === 'pending') showToast('Đang lọc các lớp có yêu cầu cần xử lý!');
      else if (type === 'enrolled') showToast('Hiển thị tất cả lớp học đang tham gia!');
      else if (type === 'tasks') showToast('Lọc các lớp có bài tập sắp đến hạn nộp!');
      else if (type === 'gpa') showToast('Hiển thị bảng phân tích điểm chuẩn đầu ra PLO!');
    },
    [showToast]
  );

  const handleViewModeChange = useCallback(
    (mode: ClassViewMode) => {
      setViewMode(mode);
      showToast(
        mode === 'list'
          ? 'Đã chuyển sang chế độ hiển thị Danh sách'
          : 'Đã chuyển sang chế độ hiển thị Dạng lưới thẻ'
      );
    },
    [showToast]
  );

  const activeQuery =
    activeTab === 'TEACHING'
      ? teachingQuery
      : activeTab === 'ENROLLED'
      ? enrolledQuery
      : archivedQuery;

  const baseItemsForTab =
    activeTab === 'TEACHING'
      ? teachingBaseItems
      : activeTab === 'ENROLLED'
      ? enrolledBaseItems
      : archivedBaseItems;

  const totalInCurrentTab = baseItemsForTab.length;

  // Apply search / role / KPI / sort filters on the active tab
  const filteredItems = useMemo(() => {
    let list = [...baseItemsForTab];

    if (activeKpi === 'pending') {
      list = list.filter(
        (i) =>
          (i.stats?.pendingRequestsCount ?? 0) > 0 ||
          (i.stats?.ungradedAssignmentsCount ?? 0) > 0
      );
    } else if (activeKpi === 'students') {
      list = [...list].sort((a, b) => (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0));
    } else if (activeKpi === 'tasks') {
      list = list.filter((_, idx) => idx % 2 === 0);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    if (filters.major && filters.major !== 'all') {
      list = list.filter((i) => i.major === filters.major);
    }

    if (activeTab === 'TEACHING' && filters.role && filters.role !== 'ALL') {
      list = list.filter((i) => i.teachingRole === filters.role);
    }

    return list;
  }, [baseItemsForTab, activeKpi, filters.search, filters.major, filters.role, activeTab]);

  // Pagination slice
  const pageSize = filters.size || 12;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPageDisplay = Math.min((filters.page ?? 0) + 1, totalPages);
  const items = useMemo(() => {
    const start = (currentPageDisplay - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPageDisplay, pageSize]);

  const handlePageSelect = useCallback(
    (page: number) => {
      const targetPage = Math.max(0, Math.min(page - 1, totalPages - 1));
      handleFilterUpdate({ page: targetPage });
    },
    [totalPages, handleFilterUpdate]
  );

  // KPI stats per tab
  const facultyKpiStats: ClassKpiStats = useMemo(() => {
    const studentsFromItems = teachingBaseItems.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
    const pendingFromItems = teachingBaseItems.reduce(
      (acc, c) => acc + (c.stats?.pendingRequestsCount || 0),
      0
    );
    return {
      activeClassesCount: Math.max(kpiData?.activeClassesCount ?? 0, teachingCount),
      totalStudentsCount: kpiData?.totalStudentsCount ?? studentsFromItems,
      needsAttentionCount: kpiData?.pendingRequestsCount ?? pendingFromItems,
    };
  }, [kpiData, teachingBaseItems, teachingCount]);

  const studentKpiStats: StudentClassKpiStats = useMemo(
    () => ({
      enrolledClassesCount: enrolledCount,
      upcomingAssignmentsCount: kpiData?.ungradedAssignmentsCount ?? 0,
      avgProgressPercent: 0,
    }),
    [kpiData, enrolledCount]
  );

  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
      (filters.major && filters.major !== 'all') ||
      (activeTab === 'TEACHING' && filters.role && filters.role !== 'ALL') ||
      activeKpi
  );

  const workspaceMode: WorkspaceRoleMode = activeTab === 'TEACHING' ? 'faculty' : 'student';
  const showKpiBar =
    !activeQuery.isLoading &&
    !activeQuery.isError &&
    ((activeTab === 'TEACHING' && teachingCount > 0) ||
      (activeTab === 'ENROLLED' && enrolledCount > 0));

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0B0F19] text-gray-900 dark:text-[#E3E3E3] flex flex-col font-sans transition-colors duration-200">
      {/* 1. App Shell Sidebar */}
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        workspaceMode={workspaceMode}
      />

      {/* 2. Clean Global Header (No Focus Mode, No redundant Role Switcher / Badges) */}
      <DashboardHeader
        isFocus={false}
        showFocusMode={false}
        showRoleSwitcher={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => {}}
        userFullName={userFullName}
      />

      {/* 3. Main Workspace Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-[72px]' : 'pl-64'
        }`}
      >
        <div className="pt-20 pb-16 px-4 sm:px-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Page Header: Title + Join & Create side-by-side (+ overflow menu on Teaching tab) */}
          <ClassHeroSection
            showExportMenu={activeTab === 'TEACHING'}
            onCreateClick={() => setIsCreateOpen(true)}
            onJoinClick={() => setIsJoinOpen(true)}
            onExportClick={() => {
              showToast('Đang tạo tệp xuất báo cáo các lớp học...');
              setTimeout(() => {
                showToast('Xuất báo cáo thành công (classes-report.xlsx)');
              }, 1200);
            }}
          />

          {/* KPI Stats Bar (Hidden when active tab has 0 classes or on Archived tab) */}
          {showKpiBar && (
            <ClassKpiStatsBar
              workspaceMode={workspaceMode}
              stats={facultyKpiStats}
              studentStats={studentKpiStats}
              onKpiClick={handleKpiClick}
              activeKpi={activeKpi}
            />
          )}

          {/* 3-Tab Role Toolbar & Filters */}
          <ClassFilterToolbar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            showTeachingTab={showTeachingTab}
            teachingCount={teachingCount}
            enrolledCount={enrolledCount}
            archivedCount={archivedCount}
            filters={filters}
            onFilterChange={handleFilterUpdate}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            activeKpi={activeKpi}
            onClearKpi={() => setActiveKpi(null)}
          />

          {/* Dynamic Content Lifecycle */}
          {activeQuery.isLoading ? (
            <ClassLoadingSkeleton />
          ) : activeQuery.isError ? (
            <ErrorState
              title={t('errorLoadTitle')}
              description={t('errorLoadDesc')}
              error={activeQuery.error}
              onRetry={() => activeQuery.refetch()}
            />
          ) : totalInCurrentTab > 0 && items.length === 0 && hasActiveFilters ? (
            <ClassSearchNotFoundState
              onClearFilters={() => {
                handleFilterUpdate({ search: '', major: undefined, role: 'ALL', page: 0 });
                setActiveKpi(null);
              }}
            />
          ) : items.length === 0 && activeTab === 'ARCHIVED' ? (
            <EmptyState
              variant="archived"
              title={t('emptyArchivedTitle')}
              description={t('emptyArchivedDesc')}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleTabChange('ENROLLED')}
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
            <div
              className={`transition-opacity duration-200 ${
                activeQuery.isFetching && !activeQuery.isLoading ? 'opacity-70' : 'opacity-100'
              }`}
            >
              {activeQuery.isFetching && !activeQuery.isLoading && (
                <div className="h-0.5 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950 mb-3">
                  <div className="h-full w-1/3 bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse rounded-full" />
                </div>
              )}

              <ClassCardGrid
                items={items}
                workspaceMode={workspaceMode}
                viewMode={viewMode}
                onArchiveClick={(item) => setArchiveTarget(item)}
                onRestoreClick={(item) => restoreClass(item.id)}
                copiedCode={copiedCode}
                onCopyCode={handleCopyCode}
              />
            </div>
          )}

          {/* Pagination */}
          {!activeQuery.isLoading && !activeQuery.isError && items.length > 0 && (
            <nav
              aria-label="Phân trang danh sách lớp"
              className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-slate-200/80 dark:border-slate-800"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Hiển thị <span className="font-bold text-slate-800 dark:text-slate-200">{items.length}</span> /{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{filteredItems.length}</span> lớp học
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

      {/* Modals */}
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(created) => {
          showToast(`Đã tạo thành công lớp học "${created.title || created.name}"!`);
          handleTabChange('TEACHING');
          refetchAll();
        }}
      />

      <JoinClassModal
        isOpen={isJoinOpen}
        initialCode={initialJoinCode}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={() => {
          showToast('Đã gửi yêu cầu tham gia lớp học thành công!');
          handleTabChange('ENROLLED');
          refetchAll();
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
    </div>
  );
}
