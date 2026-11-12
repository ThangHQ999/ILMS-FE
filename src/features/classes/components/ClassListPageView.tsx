'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
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

// 4 Student Classes from the user's template
const DEFAULT_STUDENT_CLASSES: ClassItem[] = [
  {
    id: 'ctdl-k22-02',
    name: 'CTDL-K22-02',
    title: 'Cấu trúc dữ liệu và giải thuật nâng cao — Nhóm 02',
    description: 'ADVANCED DSA • TREE & GRAPH',
    academicYear: '2024-2025',
    semester: 'Học kỳ 1 • 2024-2025',
    major: 'Khoa học máy tính',
    maxStudents: 60,
    enrolledCount: 38,
    enrollmentKey: 'CTDL-K22-02',
    isCodeClosed: false,
    status: 'ACTIVE',
    teachingRole: 'STUDENT',
    instructor: {
      fullName: 'TS. Lê Hoàng Nam (Chủ nhiệm môn) • ThS. Trần Phương Thảo',
    },
    schedule: {
      room: 'H6-302',
      dayOfWeek: 'Thứ 5',
      timeSlot: 'Tiết 4-6',
    },
    stats: {
      pendingRequestsCount: 0,
      ungradedAssignmentsCount: 1,
      attendanceRate: 95,
    },
  },
  {
    id: 'thtt-k22-01',
    name: 'THTT-K22-01',
    title: 'Thiết kế Thuật toán & Đồ thị thông minh — Nhóm 01',
    description: 'ALGORITHMS • GRAPH THEORY',
    academicYear: '2024-2025',
    semester: 'Học kỳ 1 • 2024-2025',
    major: 'Khoa học máy tính',
    maxStudents: 60,
    enrolledCount: 42,
    enrollmentKey: 'THTT-K22-01',
    isCodeClosed: false,
    status: 'ACTIVE',
    teachingRole: 'STUDENT',
    instructor: {
      fullName: 'PGS.TS. Vũ Đình Thành',
    },
    schedule: {
      room: 'Online MS Teams',
      dayOfWeek: 'Thứ 3',
      timeSlot: 'Tiết 1-3',
    },
    stats: {
      pendingRequestsCount: 0,
      ungradedAssignmentsCount: 1,
      attendanceRate: 98,
    },
  },
  {
    id: 'oop-k23-03',
    name: 'OOP-K23-03',
    title: 'Lập trình hướng đối tượng — Nhóm 03',
    description: 'JAVA • OOP ARCHITECTURE',
    academicYear: '2024-2025',
    semester: 'Học kỳ 1 • 2024-2025',
    major: 'Công nghệ phần mềm',
    maxStudents: 60,
    enrolledCount: 45,
    enrollmentKey: 'OOP-K23-03',
    isCodeClosed: false,
    status: 'ACTIVE',
    teachingRole: 'STUDENT',
    instructor: {
      fullName: 'ThS. Hoàng Minh Tuấn',
    },
    schedule: {
      room: 'Lab B2-104',
      dayOfWeek: 'Thứ 2',
      timeSlot: 'Tiết 7-9',
    },
    stats: {
      pendingRequestsCount: 0,
      ungradedAssignmentsCount: 0,
      attendanceRate: 100,
    },
  },
  {
    id: 'ai-k22-01',
    name: 'AI-K22-01',
    title: 'Nhập môn Trí tuệ nhân tạo & Khai phá dữ liệu — Nhóm 01',
    description: 'AI • KNOWLEDGE GRAPH & MINING',
    academicYear: '2024-2025',
    semester: 'Học kỳ 1 • 2024-2025',
    major: 'Trí tuệ nhân tạo',
    maxStudents: 60,
    enrolledCount: 50,
    enrollmentKey: 'AI-K22-01',
    isCodeClosed: false,
    status: 'ACTIVE',
    teachingRole: 'STUDENT',
    instructor: {
      fullName: 'TS. Nguyễn Bảo Anh • Trợ giảng AI Socratic 24/7',
    },
    schedule: {
      room: 'Hội trường C1',
      dayOfWeek: 'Thứ 7',
      timeSlot: 'Tiết 4-6',
    },
    stats: {
      pendingRequestsCount: 0,
      ungradedAssignmentsCount: 0,
      attendanceRate: 90,
    },
  },
];

// 4 Faculty Classes
const DEFAULT_FACULTY_CLASSES: ClassItem[] = [
  {
    id: 'csdl-k22-01',
    name: 'CSDL-K22-01',
    title: 'Cơ sở dữ liệu — Nhóm 01',
    description: 'DATABASE • SQL / NOSQL',
    academicYear: '2024-2025',
    semester: 'Học kỳ 1 • 2024-2025',
    major: 'Khoa học máy tính',
    maxStudents: 60,
    enrolledCount: 42,
    enrollmentKey: 'CSDL22K',
    isCodeClosed: false,
    status: 'ACTIVE',
    teachingRole: 'PRIMARY_INSTRUCTOR',
    schedule: {
      room: 'A2-301',
      dayOfWeek: 'Thứ 3',
      timeSlot: 'Tiết 1-3',
    },
    stats: {
      pendingRequestsCount: 3,
      ungradedAssignmentsCount: 0,
      attendanceRate: 98,
    },
  },
  {
    id: 'ctdl-k22-02',
    name: 'CTDL-K22-02',
    title: 'Cấu trúc dữ liệu và giải thuật — Nhóm 02',
    description: 'ALGORITHMS • TREE / GRAPH',
    academicYear: '2024-2025',
    semester: 'Học kỳ 1 • 2024-2025',
    major: 'Khoa học máy tính',
    maxStudents: 60,
    enrolledCount: 38,
    enrollmentKey: 'CTDL22K',
    isCodeClosed: false,
    status: 'ACTIVE',
    teachingRole: 'TA',
    schedule: {
      room: 'A2-205',
      dayOfWeek: 'Thứ 5',
      timeSlot: 'Tiết 4-6',
    },
    stats: {
      pendingRequestsCount: 0,
      ungradedAssignmentsCount: 0,
      attendanceRate: 95,
    },
  },
  {
    id: 'oop-k22-03',
    name: 'OOP-K22-03',
    title: 'Lập trình hướng đối tượng — Nhóm 03',
    description: 'JAVA • OOP ARCHITECTURE',
    academicYear: '2024-2025',
    semester: 'Học kỳ 1 • 2024-2025',
    major: 'Công nghệ phần mềm',
    maxStudents: 60,
    enrolledCount: 45,
    enrollmentKey: 'OOP22K',
    isCodeClosed: false,
    status: 'ACTIVE',
    teachingRole: 'PRIMARY_INSTRUCTOR',
    schedule: {
      room: 'B1-102',
      dayOfWeek: 'Thứ 2',
      timeSlot: 'Tiết 7-9',
    },
    stats: {
      pendingRequestsCount: 1,
      ungradedAssignmentsCount: 0,
      attendanceRate: 100,
    },
  },
  {
    id: 'mmt-k22-01',
    name: 'MMT-K22-01',
    title: 'Mạng máy tính — Nhóm 01',
    description: 'NETWORKING • TCP / IP',
    academicYear: '2024-2025',
    semester: 'Học kỳ 1 • 2024-2025',
    major: 'Mạng & An toàn thông tin',
    maxStudents: 60,
    enrolledCount: 36,
    enrollmentKey: 'MMT22K',
    isCodeClosed: false,
    status: 'ACTIVE',
    teachingRole: 'TA',
    schedule: {
      room: 'Lab-Net-01',
      dayOfWeek: 'Thứ 6',
      timeSlot: 'Tiết 1-3',
    },
    stats: {
      pendingRequestsCount: 0,
      ungradedAssignmentsCount: 2,
      attendanceRate: 92,
    },
  },
];

type StatePreviewMode = 'normal' | 'skeleton' | 'empty' | 'notfound' | 'archived';

interface ClassListPageViewProps {
  userFullName?: string;
}

export function ClassListPageView({
  userFullName = 'Trần Nhật Minh',
}: ClassListPageViewProps) {
  const t = useTranslations('classes');

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Workspace Role Mode: Default to 'student' (Chế độ Học viên dạng lưới thẻ)
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceRoleMode>('student');

  // Filters & View State
  const [filters, setFilters] = useState<ClassFilters>({
    search: '',
    status: 'ACTIVE',
    role: 'ALL',
    sort: 'updated_desc',
    page: 0,
    size: 36,
  });
  const [viewMode, setViewMode] = useState<ClassViewMode>('grid');

  // Interactive KPI State
  const [activeKpi, setActiveKpi] = useState<string | null>(null);

  // State Previews sandbox
  const [previewState, setPreviewState] = useState<StatePreviewMode>('normal');

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

      if (type === 'enrolled' || type === 'teaching') {
        handleFilterUpdate({ status: 'ACTIVE', page: 0 });
        showToast('Hiển thị tất cả lớp học đang tham gia!');
      } else if (type === 'tasks') {
        showToast('Lọc các lớp có bài tập sắp đến hạn nộp!');
      } else if (type === 'gpa') {
        showToast('Hiển thị bảng phân tích điểm chuẩn đầu ra PLO!');
      }
    },
    [handleFilterUpdate, showToast]
  );

  // Filtered Items Computation
  const items = useMemo(() => {
    let list: ClassItem[] = [];

    if (workspaceMode === 'student') {
      list = [...DEFAULT_STUDENT_CLASSES];
    } else {
      if (responseData?.items && responseData.items.length > 0) {
        list = [...responseData.items];
      } else {
        list = [...DEFAULT_FACULTY_CLASSES];
      }
    }

    // Filter by status tab
    if (filters.status === 'ACTIVE') {
      list = list.filter((i) => i.status === 'ACTIVE' && !i.deletedAt);
    } else if (filters.status === 'ARCHIVED') {
      list = list.filter((i) => i.status === 'ARCHIVED' || Boolean(i.deletedAt));
    }

    // Filter by KPI
    if (activeKpi === 'tasks') {
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
    if (filters.major) {
      list = list.filter((i) => i.major === filters.major);
    }

    return list;
  }, [workspaceMode, responseData?.items, filters.status, filters.search, filters.major, activeKpi]);

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
  const allCount = 4;

  const hasSearchOrFilters = Boolean(filters.search || filters.major || activeKpi);

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
        onToggleWorkspaceMode={() =>
          setWorkspaceMode((prev) => (prev === 'faculty' ? 'student' : 'faculty'))
        }
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
            onToggleWorkspaceMode={setWorkspaceMode}
            onCreateClick={() => setIsCreateOpen(true)}
            onJoinClick={() => setIsJoinOpen(true)}
            onExportClick={() => window.print()}
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
            onWorkspaceModeChange={setWorkspaceMode}
            filters={filters}
            onFilterChange={handleFilterUpdate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            activeCount={activeCount}
            enrolledCount={enrolledCount}
            archivedCount={archivedCount}
            allCount={allCount}
            displayedCount={items.length}
            onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
            activeKpi={activeKpi}
            onClearKpi={() => setActiveKpi(null)}
          />

          {/* Dynamic Content Display based on State Preview Sandbox or Normal View */}
          {previewState === 'skeleton' ? (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2].map((k) => (
                  <div key={k} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3">
                    <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-850" />
                    <div className="h-9 rounded-xl bg-slate-100 dark:bg-slate-850 mt-2" />
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">
                Đang đồng bộ dữ liệu các lớp đang theo học từ máy chủ...
              </p>
            </div>
          ) : previewState === 'empty' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[32px]">school</span>
              </div>
              <h4 className="font-display font-bold text-slate-900 dark:text-white text-base mb-1">
                Chưa tham gia lớp học nào
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Bạn chưa ghi danh vào lớp học nào trong học kỳ này. Hãy nhập mã mời từ giảng viên để bắt đầu hành trình học tập.
              </p>
              <button
                type="button"
                onClick={() => setIsJoinOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                <span>Tham gia lớp học ngay</span>
              </button>
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
                  Lớp học đã hoàn thành / Lưu trữ
                </span>
                <span className="text-xs text-slate-500">Chế độ xem lại học liệu • 3 môn học</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { code: 'CSDL-K21-01', title: 'Cơ sở dữ liệu căn bản', grade: '9.0/10', teacher: 'TS. Lê Hoàng Nam' },
                  { code: 'WEB-K22-03', title: 'Phát triển ứng dụng Web Front-end', grade: '9.4/10', teacher: 'ThS. Nguyễn Văn Toàn' },
                  { code: 'DSA-K21-02', title: 'Thuật toán cơ bản', grade: '8.7/10', teacher: 'PGS.TS. Vũ Đình Thành' },
                ].map((c) => (
                  <div key={c.code} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold">
                          {c.code}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Điểm tổng kết: {c.grade}
                        </span>
                      </div>
                      <h5 className="font-display font-bold text-slate-900 dark:text-white text-sm">
                        {c.title}
                      </h5>
                      <span className="text-xs text-slate-500 dark:text-slate-400">GV: {c.teacher}</span>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">history_edu</span>
                        <span>Xem lại học liệu & đồ thị</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <ClassCardGrid
              items={items}
              workspaceMode={workspaceMode}
              onArchiveClick={(item) => setArchiveTarget(item)}
              onRestoreClick={(item) => restoreClass(item.id)}
              copiedCode={copiedCode}
              onCopyCode={handleCopyCode}
            />
          ) : (
            <ClassListView
              items={items}
              workspaceMode={workspaceMode}
              onArchiveClick={(item) => setArchiveTarget(item)}
              onRestoreClick={(item) => restoreClass(item.id)}
              copiedCode={copiedCode}
              onCopyCode={handleCopyCode}
            />
          )}

          {/* 4. Pagination */}
          <nav aria-label="Phân trang danh sách lớp" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Hiển thị <strong className="font-semibold text-slate-900 dark:text-white">1 - {items.length}</strong> trên <strong className="font-semibold text-slate-900 dark:text-white">{items.length}</strong> lớp học
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 cursor-not-allowed text-xs font-semibold flex items-center gap-1 opacity-50"
                disabled
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                <span>Trước</span>
              </button>
              <button type="button" className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-2xs">
                1
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 cursor-not-allowed text-xs font-semibold flex items-center gap-1 opacity-50"
                disabled
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
                Danh sách hiện tại (4 lớp)
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
