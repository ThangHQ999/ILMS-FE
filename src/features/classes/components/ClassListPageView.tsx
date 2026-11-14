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
import {
  ClassLoadingSkeleton,
  ClassEmptyState,
  ClassSearchNotFoundState,
} from './ClassStateViews';
import { MobileFilterBottomSheet } from './MobileFilterBottomSheet';
import { CreateClassModal } from './CreateClassModal';
import { ArchiveClassModal } from './ArchiveClassModal';
import { JoinClassModal } from './JoinClassModal';
import { useClasses } from '../hooks/useClasses';
import { useArchiveClass } from '../hooks/useArchiveClass';
import type {
  ClassFilters,
  ClassViewMode,
  ClassItem,
  ClassKpiStats,
  StudentClassKpiStats,
  WorkspaceRoleMode,
} from '../types';

import {
  DEFAULT_FACULTY_CLASSES,
  DEFAULT_STUDENT_CLASSES,
} from '../constants';
import { getLocalCreatedClasses } from '../services/class.service';

type StatePreviewMode = 'normal' | 'skeleton' | 'empty' | 'notfound' | 'archived';

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

  // Filters & View State (in Faculty mode, default view is list / 1-column bento)
  const [filters, setFilters] = useState<ClassFilters>({
    search: '',
    status: 'ACTIVE',
    role: 'ALL',
    sort: 'updated_desc',
    page: 0,
    size: 12,
  });
  const [viewMode, setViewMode] = useState<ClassViewMode>('list');

  // Active page state for pagination demo
  const [currentPage, setCurrentPage] = useState(1);

  // Interactive KPI State
  const [activeKpi, setActiveKpi] = useState<string | null>(null);

  // State Previews sandbox
  const [previewState, setPreviewState] = useState<StatePreviewMode>('normal');
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
  const { data: responseData, isLoading, refetch } = useClasses(filters);
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
        showToast('Hiển thị tất cả 12 lớp học đang giảng dạy!');
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
    setViewMode(nextRole === 'TEACHER' ? 'list' : 'grid');
    showToast(nextRole === 'TEACHER' ? 'Đã chuyển sang Chế độ Giảng dạy' : 'Đã chuyển sang Chế độ Học tập');
  }, [isTeacher, switchRole, showToast]);

  const handleViewModeChange = useCallback((mode: ClassViewMode) => {
    setViewMode(mode);
    showToast(mode === 'list' ? 'Đã chuyển sang chế độ hiển thị Danh sách' : 'Đã chuyển sang chế độ hiển thị Dạng lưới thẻ');
  }, [showToast]);

  // Filtered Items Computation
  const items = useMemo(() => {
    let list: ClassItem[] = [];

    if (workspaceMode === 'student') {
      const studentApiItems = responseData?.items?.filter((x) => x.teachingRole === 'STUDENT');
      list =
        studentApiItems && studentApiItems.length > 0
          ? studentApiItems
          : [...DEFAULT_STUDENT_CLASSES];
    } else {
      const baseList =
        responseData?.items && responseData.items.length > 0
          ? responseData.items
          : [...DEFAULT_FACULTY_CLASSES];

      // Merge locally created classes at top (guarantees newly created classes persist across F5 refresh)
      const localCreated = isClient ? getLocalCreatedClasses() : [];
      const baseIds = new Set(baseList.map((c) => String(c.id)));
      const baseNames = new Set(baseList.map((c) => c.name?.toLowerCase()));
      const newCreated = localCreated.filter(
        (c) => !baseIds.has(String(c.id)) && (!c.name || !baseNames.has(c.name.toLowerCase()))
      );

      list = [...newCreated, ...baseList];
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

  // Compute Faculty KPI Stats
  const facultyKpiStats: ClassKpiStats = useMemo(() => {
    return {
      activeClassesCount: 12,
      totalStudentsCount: 368,
      needsAttentionCount: 7,
    };
  }, []);

  // Compute Student KPI Stats
  const studentKpiStats: StudentClassKpiStats = useMemo(() => {
    return {
      enrolledClassesCount: 4,
      upcomingAssignmentsCount: 2,
      avgProgressPercent: 88,
    };
  }, []);

  const activeCount = 12;
  const enrolledCount = 4;
  const archivedCount = 3;
  const allCount = workspaceMode === 'student' ? 4 : 12;
  const displayedCount = workspaceMode === 'student' ? items.length : (previewState === 'normal' ? 6 : items.length);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. App Shell Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        workspaceMode={workspaceMode}
      />

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
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-8 max-w-[1600px] w-full mx-auto ${
          isFocusMode
            ? 'pl-24'
            : isSidebarCollapsed
            ? 'pl-24'
            : 'lg:pl-[280px]'
        }`}
      >
        <div className="space-y-6">
          {/* Hero Section */}
          <ClassHeroSection
            workspaceMode={workspaceMode}
            onToggleWorkspaceMode={(mode) => {
              switchRole(mode === 'faculty' ? 'TEACHER' : 'STUDENT');
              setViewMode(mode === 'faculty' ? 'list' : 'grid');
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
              setViewMode(mode === 'faculty' ? 'list' : 'grid');
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

          {/* Dynamic Content Display based on State Preview Sandbox or Normal View */}
          {previewState === 'skeleton' ? (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3">
                    <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-850" />
                    <div className="h-9 rounded-xl bg-slate-100 dark:bg-slate-850 mt-2" />
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">
                Đang đồng bộ dữ liệu các lớp học từ máy chủ...
              </p>
            </div>
          ) : previewState === 'empty' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[32px]">
                  {workspaceMode === 'student' ? 'school' : 'menu_book'}
                </span>
              </div>
              <h4 className="font-display font-bold text-slate-900 dark:text-white text-base mb-1">
                {workspaceMode === 'student' ? 'Chưa tham gia lớp học nào' : 'Chưa có lớp giảng dạy'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                {workspaceMode === 'student'
                  ? 'Bạn chưa ghi danh vào lớp học nào trong học kỳ này. Hãy nhập mã mời từ giảng viên để bắt đầu hành trình học tập.'
                  : 'Bạn chưa được phân công hoặc tạo lớp học nào trong học kỳ này. Hãy bắt đầu bằng cách tạo lớp học mới hoặc liên hệ phòng đào tạo.'}
              </p>
              {workspaceMode === 'student' ? (
                <button
                  type="button"
                  onClick={() => setIsJoinOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>Tham gia lớp học ngay</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Tạo lớp học đầu tiên</span>
                </button>
              )}
            </div>
          ) : previewState === 'notfound' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[32px]">search_off</span>
              </div>
              <h4 className="font-display font-bold text-slate-900 dark:text-white text-base mb-1">
                Không tìm thấy kết quả phù hợp
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Không tìm thấy lớp học nào khớp với từ khóa tìm kiếm hoặc các tiêu chí bộ lọc đã chọn.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPreviewState('normal');
                  handleFilterUpdate({ search: '', major: undefined, role: 'ALL' });
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Xóa bộ lọc & Tải lại</span>
              </button>
            </div>
          ) : previewState === 'archived' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-display font-bold text-slate-900 dark:text-white text-sm">
                  Lớp học đã lưu trữ (Học kỳ trước)
                </span>
                <span className="text-xs text-slate-500">Chế độ chỉ đọc • 3 lớp học</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { code: 'CSDL-K21-01', title: 'Cơ sở dữ liệu (HK2 23-24)', students: 44 },
                  { code: 'WEB-K22-03', title: 'Phát triển ứng dụng Web', students: 50 },
                  { code: 'DSA-K21-02', title: 'Thuật toán nâng cao', students: 35 },
                ].map((c) => (
                  <div key={c.code} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold">
                          {c.code}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                          Đã lưu trữ
                        </span>
                      </div>
                      <h5 className="font-display font-bold text-slate-900 dark:text-white text-sm">
                        {c.title}
                      </h5>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{c.students} học viên</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Xem lớp
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Khôi phục lớp thành công!')}
                        className="py-1.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                        title="Khôi phục lớp"
                      >
                        Khôi phục
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Khung chữ: Các lớp học hiện đang mở */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900 shadow-2xs">
                    <span className="material-symbols-outlined text-[24px]">school</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        Các lớp học hiện đang mở
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>
                          {workspaceMode === 'student'
                            ? `${displayedCount} lớp đang theo học`
                            : `${displayedCount} lớp đang giảng dạy`}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {workspaceMode === 'student'
                        ? 'Danh sách các lớp học phần bạn đã tham gia trong học kỳ 1 (2024 - 2025). Chọn lớp để vào không gian học tập.'
                        : 'Danh sách các lớp học phần đang hoạt động do bạn phụ trách hoặc đồng giảng dạy.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                    event_available
                  </span>
                  <span>Học kỳ 1 (2024–2025)</span>
                </div>
              </div>

              {/* Class Card Grid */}
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

          {/* 4. Pagination */}
          <nav aria-label="Phân trang danh sách lớp" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {workspaceMode === 'student' ? (
                <>Hiển thị <strong className="font-semibold text-slate-900 dark:text-white">1 - 4</strong> trên <strong className="font-semibold text-slate-900 dark:text-white">4</strong> lớp học</>
              ) : (
                <>Hiển thị trang <strong className="font-semibold text-slate-900 dark:text-white">{currentPage}</strong> trên <strong className="font-semibold text-slate-900 dark:text-white">2</strong> (tổng 12 lớp)</>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                <span>Trước</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === 1
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200'
                }`}
              >
                1
              </button>
              {workspaceMode !== 'student' && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === 2
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  2
                </button>
              )}
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                disabled={currentPage === 2 || workspaceMode === 'student'}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <span>Tiếp theo</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </nav>

          {/* 5. STATE PREVIEWS & SANDBOX (Matches user's template) */}
          <section className="mt-4 p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                  developer_mode
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Chế độ kiểm thử trạng thái giao diện (State Previews)
                </h4>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Nhấp để thử nghiệm các kịch bản thực tế
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPreviewState('normal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  previewState === 'normal'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                Danh sách hiện tại
              </button>
              <button
                type="button"
                onClick={() => setPreviewState('skeleton')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  previewState === 'skeleton'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                Skeleton Loading
              </button>
              <button
                type="button"
                onClick={() => setPreviewState('empty')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  previewState === 'empty'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                Trống (Chưa có lớp)
              </button>
              <button
                type="button"
                onClick={() => setPreviewState('notfound')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  previewState === 'notfound'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                Không tìm thấy theo lọc
              </button>
              <button
                type="button"
                onClick={() => setPreviewState('archived')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  previewState === 'archived'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                Tab Đã lưu trữ (3 lớp)
              </button>
            </div>
          </section>
        </div>
      </main>

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
