'use client';

import React, { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { ClassFilters, ClassViewMode, WorkspaceRoleMode } from '../types';

interface ClassFilterToolbarProps {
  workspaceMode?: WorkspaceRoleMode;
  onWorkspaceModeChange?: (mode: WorkspaceRoleMode) => void;
  filters: ClassFilters;
  onFilterChange: (updates: Partial<ClassFilters>) => void;
  viewMode: ClassViewMode;
  onViewModeChange: (mode: ClassViewMode) => void;
  activeCount?: number;
  enrolledCount?: number;
  archivedCount?: number;
  allCount?: number;
  displayedCount?: number;
  onOpenMobileFilter?: () => void;
  activeKpi?: string | null;
  onClearKpi?: () => void;
}

export function ClassFilterToolbar({
  workspaceMode = 'faculty',
  onWorkspaceModeChange,
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  activeCount = 12,
  enrolledCount = 4,
  archivedCount = 3,
  allCount = 12,
  displayedCount = 6,
  onOpenMobileFilter,
  activeKpi,
  onClearKpi,
}: ClassFilterToolbarProps) {
  const t = useTranslations('classes');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearAll = () => {
    onFilterChange({
      search: '',
      major: undefined,
      role: 'ALL',
      page: 0,
    });
    if (onClearKpi) onClearKpi();
  };

  return (
    <section className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3.5">
      {/* Top row: Tabs & View switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Modern pill tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60" role="tablist">
          {/* Tab: Đang giảng dạy */}
          <button
            type="button"
            role="tab"
            aria-selected={workspaceMode === 'faculty' && filters.status === 'ACTIVE'}
            onClick={() => {
              if (onWorkspaceModeChange) onWorkspaceModeChange('faculty');
              onFilterChange({ status: 'ACTIVE', page: 0 });
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              workspaceMode === 'faculty' && filters.status === 'ACTIVE'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Đang giảng dạy</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                workspaceMode === 'faculty' && filters.status === 'ACTIVE'
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {activeCount}
            </span>
          </button>

          {/* Tab: Đang theo học */}
          <button
            type="button"
            role="tab"
            aria-selected={workspaceMode === 'student' && filters.status === 'ACTIVE'}
            onClick={() => {
              if (onWorkspaceModeChange) onWorkspaceModeChange('student');
              onFilterChange({ status: 'ACTIVE', page: 0 });
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              workspaceMode === 'student' && filters.status === 'ACTIVE'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Đang theo học</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                workspaceMode === 'student' && filters.status === 'ACTIVE'
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {enrolledCount}
            </span>
          </button>

          {/* Tab: Đã lưu trữ */}
          <button
            type="button"
            role="tab"
            aria-selected={filters.status === 'ARCHIVED'}
            onClick={() => onFilterChange({ status: 'ARCHIVED', page: 0 })}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filters.status === 'ARCHIVED'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{workspaceMode === 'student' ? 'Đã hoàn thành / Lưu trữ' : 'Đã lưu trữ'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                filters.status === 'ARCHIVED'
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {archivedCount}
            </span>
          </button>
        </div>

        {/* View Mode Toggle (Grid / List) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            aria-label="Xem dạng lưới"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 shadow-2xs text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
          <button
            type="button"
            aria-label="Xem dạng danh sách"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 shadow-2xs text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">view_list</span>
          </button>
        </div>
      </div>

      {/* Filter & Search inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="lg:col-span-4 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
            placeholder={
              workspaceMode === 'student'
                ? 'Tìm theo tên lớp, môn học, tên giảng viên...'
                : 'Tìm theo tên lớp, mã lớp (CSDL, CTDL...)'
            }
            className="w-full pl-9 pr-14 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-2xs pointer-events-none">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Dropdown 1: Role or Semester */}
        {workspaceMode === 'student' ? (
          <div className="lg:col-span-3 relative">
            <select
              className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
            >
              <option value="hk1-2425">Học kỳ: Học kỳ 1 2024-2025</option>
              <option value="hk2-2324">Học kỳ: Học kỳ 2 2023-2024</option>
              <option value="all">Học kỳ: Tất cả các kỳ</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>
        ) : (
          <div className="lg:col-span-3 relative">
            <select
              value={filters.role || 'ALL'}
              onChange={(e) =>
                onFilterChange({
                  role: e.target.value as 'ALL' | 'PRIMARY_INSTRUCTOR' | 'TA' | 'STUDENT',
                  page: 0,
                })
              }
              className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Vai trò: Tất cả</option>
              <option value="PRIMARY_INSTRUCTOR">Chủ lớp (Owner)</option>
              <option value="TA">Giảng viên (Teacher)</option>
              <option value="STUDENT">Học viên (Student)</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>
        )}

        {/* Dropdown 2: Subject/Course or Status */}
        {workspaceMode === 'student' ? (
          <div className="lg:col-span-3 relative">
            <select
              value={filters.role || 'ALL'}
              onChange={(e) =>
                onFilterChange({
                  role: e.target.value as 'ALL' | 'PRIMARY_INSTRUCTOR' | 'TA' | 'STUDENT',
                  page: 0,
                })
              }
              className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer truncate"
            >
              <option value="ALL">Trạng thái: Tất cả lớp</option>
              <option value="pending-tasks">Có bài tập cần nộp</option>
              <option value="high-progress">Tiến độ &gt; 80%</option>
              <option value="ai-recommended">Có gợi ý AI Tutor</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>
        ) : (
          <div className="lg:col-span-3 relative">
            <select
              value={filters.major || 'all'}
              onChange={(e) =>
                onFilterChange({
                  major: e.target.value === 'all' ? undefined : e.target.value,
                  page: 0,
                })
              }
              className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer truncate"
            >
              <option value="all">Khóa học: Tất cả các môn</option>
              <option value="Khoa học máy tính">Cơ sở dữ liệu</option>
              <option value="Khoa học máy tính">Cấu trúc dữ liệu &amp; giải thuật</option>
              <option value="Công nghệ phần mềm">Lập trình hướng đối tượng</option>
              <option value="Mạng & An toàn thông tin">Mạng máy tính</option>
              <option value="Khoa học máy tính">Kỹ thuật lập trình</option>
              <option value="Trí tuệ nhân tạo">Trí tuệ nhân tạo</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>
        )}

        {/* Dropdown 3: Sort */}
        <div className="lg:col-span-2 relative">
          <select
            value={filters.sort || 'updated_desc'}
            onChange={(e) =>
              onFilterChange({
                sort: e.target.value as 'updated_desc' | 'name_asc' | 'students_desc',
              })
            }
            className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
          >
            {workspaceMode === 'student' ? (
              <>
                <option value="updated_desc">Hạn bài tập gần nhất</option>
                <option value="students_desc">Tiến độ học tập</option>
                <option value="score">Điểm số cao nhất</option>
                <option value="name_asc">Tên lớp A–Z</option>
              </>
            ) : (
              <>
                <option value="updated_desc">Hoạt động gần nhất</option>
                <option value="created_desc">Mới tạo nhất</option>
                <option value="name_asc">Tên lớp A–Z</option>
              </>
            )}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
            sort
          </span>
        </div>
      </div>

      {/* Filter active chips row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Hiển thị <strong className="text-slate-900 dark:text-white font-semibold">{displayedCount}</strong> / {allCount} lớp
          </span>

          {/* Chip 1: Học kỳ */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-medium">
            <span>Học kỳ: 2024-2025</span>
            <button type="button" className="hover:text-blue-900 dark:hover:text-blue-100 cursor-pointer">
              <span className="material-symbols-outlined text-[13px]">close</span>
            </button>
          </span>

          {/* Chip 2: Vai trò */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            <span>{workspaceMode === 'student' ? 'Vai trò: Học viên' : 'Vai trò: Tất cả'}</span>
            <button type="button" className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
              <span className="material-symbols-outlined text-[13px]">close</span>
            </button>
          </span>

          {/* Chip Search if active */}
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 text-blue-700 font-medium">
              <span>Tìm: {filters.search}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ search: '', page: 0 })}
                className="hover:text-red-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </span>
          )}
        </div>

        {/* Clear filter button on right */}
        <button
          type="button"
          onClick={handleClearAll}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
          <span>Xóa bộ lọc</span>
        </button>
      </div>
    </section>
  );
}
