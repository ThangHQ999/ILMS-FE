'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { ClassHeroSection } from './ClassHeroSection';
import { ClassKpiStatsBar } from './ClassKpiStatsBar';
import { ClassFilterToolbar } from './ClassFilterToolbar';
import { ClassCardGrid } from './ClassCardGrid';
import { ClassListView } from './ClassListView';
import {
  ClassLoadingSkeleton,
  ClassEmptyState,
  ClassSearchNotFoundState,
} from './ClassStateViews';
import { CreateClassModal } from './CreateClassModal';
import { ArchiveClassModal } from './ArchiveClassModal';
import { useClasses } from '../hooks/useClasses';
import { useArchiveClass } from '../hooks/useArchiveClass';
import type { ClassFilters, ClassViewMode, ClassItem, ClassKpiStats } from '../types';

interface ClassListPageViewProps {
  userFullName?: string;
}

export function ClassListPageView({
  userFullName = 'TS. Lê Hoàng Nam',
}: ClassListPageViewProps) {
  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Filters & View State
  const [filters, setFilters] = useState<ClassFilters>({
    search: '',
    status: 'ACTIVE',
    role: 'ALL',
    sort: 'updated_desc',
    page: 0,
    size: 12,
  });
  const [viewMode, setViewMode] = useState<ClassViewMode>('grid');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<ClassItem | null>(null);

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Data Query
  const { data: responseData, isLoading, isError, refetch } = useClasses(filters);
  const { restoreClass } = useArchiveClass();

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  }, []);

  const handleFilterUpdate = useCallback((updates: Partial<ClassFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const items = useMemo(() => {
    let list = responseData?.items || [];

    // Client-side filtering when backend returns general list
    if (filters.major) {
      list = list.filter((i) => i.major === filters.major);
    }
    if (filters.role && filters.role !== 'ALL') {
      list = list.filter((i) => i.teachingRole === filters.role);
    }
    if (filters.sort === 'name_asc') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sort === 'students_desc') {
      list = [...list].sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
    }

    return list;
  }, [responseData?.items, filters.major, filters.role, filters.sort]);

  // Compute KPI Stats dynamically from returned items
  const kpiStats: ClassKpiStats = useMemo(() => {
    const rawItems = responseData?.items || [];
    const activeClasses = rawItems.filter((i) => i.status === 'ACTIVE');
    const activeCount = activeClasses.length;
    const totalStudents = rawItems.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0);
    const needsAttention = rawItems.filter(
      (i) =>
        (i.stats?.pendingRequestsCount ?? 0) > 0 ||
        (i.stats?.ungradedAssignmentsCount ?? 0) > 0
    ).length;

    return {
      activeClassesCount: activeCount,
      totalStudentsCount: totalStudents,
      needsAttentionCount: needsAttention,
    };
  }, [responseData?.items]);

  const activeCount = useMemo(
    () => (responseData?.items || []).filter((i) => i.status === 'ACTIVE').length,
    [responseData?.items]
  );
  const archivedCount = useMemo(
    () => (responseData?.items || []).filter((i) => i.status === 'ARCHIVED').length,
    [responseData?.items]
  );
  const allCount = responseData?.totalElements || (responseData?.items || []).length;

  const hasSearchOrFilters = Boolean(filters.search || filters.major || filters.role !== 'ALL');
  const isListEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070A10] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. App Shell Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Top Header */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
        userFullName={userFullName}
      />

      {/* 3. Main Workspace Content */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-8 max-w-7xl w-full mx-auto ${
          isFocusMode
            ? 'pl-24'
            : isSidebarCollapsed
            ? 'pl-24'
            : 'lg:pl-[284px]'
        }`}
      >
        <div className="space-y-6">
          {/* Hero Section */}
          <ClassHeroSection
            onCreateClick={() => setIsCreateOpen(true)}
            onExportClick={() => {
              // Trigger CSV / Report export
              window.print();
            }}
          />

          {/* KPI Stats Bar */}
          <ClassKpiStatsBar stats={kpiStats} />

          {/* Filter Toolbar */}
          <ClassFilterToolbar
            filters={filters}
            onFilterChange={handleFilterUpdate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            activeCount={activeCount}
            archivedCount={archivedCount}
            allCount={allCount}
          />

          {/* Class List View Content */}
          {isLoading ? (
            <ClassLoadingSkeleton />
          ) : isError ? (
            <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 text-center space-y-3">
              <span className="material-symbols-outlined text-[32px] text-red-500">
                error_outline
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Không thể tải danh sách lớp học
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : isListEmpty ? (
            hasSearchOrFilters ? (
              <ClassSearchNotFoundState
                onClearFilters={() =>
                  handleFilterUpdate({ search: '', major: undefined, role: 'ALL' })
                }
              />
            ) : (
              <ClassEmptyState onCreateClick={() => setIsCreateOpen(true)} />
            )
          ) : viewMode === 'grid' ? (
            <ClassCardGrid
              items={items}
              onArchiveClick={(item) => setArchiveTarget(item)}
              onRestoreClick={(item) => restoreClass(item.id)}
              copiedCode={copiedCode}
              onCopyCode={handleCopyCode}
            />
          ) : (
            <ClassListView
              items={items}
              onArchiveClick={(item) => setArchiveTarget(item)}
              onRestoreClick={(item) => restoreClass(item.id)}
              copiedCode={copiedCode}
              onCopyCode={handleCopyCode}
            />
          )}
        </div>
      </main>

      {/* 4. Modals */}
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ArchiveClassModal
        item={archiveTarget}
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
      />
    </div>
  );
}

