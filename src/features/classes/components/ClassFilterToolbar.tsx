'use client';

import React, { useRef, useEffect } from 'react';
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
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  activeCount = 12,
  enrolledCount = 4,
  archivedCount = 3,
  onClearKpi,
}: ClassFilterToolbarProps) {
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

  const isFiltered = Boolean(
    filters.search || (filters.role && filters.role !== 'ALL') || filters.major
  );

  return (
    <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 shadow-sm dark:shadow-none border-none space-y-4">
      {/* 1. Top row: Tabs & View switcher (Zero borders, Pill MD3 styling) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Pill tabs: Đang hoạt động & Đã lưu trữ */}
        <div className="inline-flex p-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C]" role="tablist">
          {/* Tab: Đang hoạt động */}
          <button
            type="button"
            role="tab"
            aria-selected={filters.status === 'ACTIVE'}
            onClick={() => {
              onFilterChange({ status: 'ACTIVE', page: 0 });
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border-none ${
              filters.status === 'ACTIVE'
                ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] font-bold shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <span>Đang hoạt động</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                filters.status === 'ACTIVE'
                  ? 'bg-blue-100 dark:bg-[#A8C7FA]/20 text-[#0B57D0] dark:text-[#A8C7FA]'
                  : 'bg-gray-200 dark:bg-[#383A3C] text-gray-600 dark:text-[#C4C7C5]'
              }`}
            >
              {workspaceMode === 'student' ? enrolledCount : activeCount}
            </span>
          </button>

          {/* Tab: Đã lưu trữ */}
          <button
            type="button"
            role="tab"
            aria-selected={filters.status === 'ARCHIVED'}
            onClick={() => onFilterChange({ status: 'ARCHIVED', page: 0 })}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border-none ${
              filters.status === 'ARCHIVED'
                ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] font-bold shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <span>Đã lưu trữ</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                filters.status === 'ARCHIVED'
                  ? 'bg-blue-100 dark:bg-[#A8C7FA]/20 text-[#0B57D0] dark:text-[#A8C7FA]'
                  : 'bg-gray-200 dark:bg-[#383A3C] text-gray-600 dark:text-[#C4C7C5]'
              }`}
            >
              {archivedCount}
            </span>
          </button>
        </div>

        {/* View Mode Toggle (Grid / List) */}
        <div className="flex items-center gap-1 p-1 bg-[#E1E5EA] dark:bg-[#282A2C] rounded-full">
          <button
            type="button"
            aria-label="Xem dạng danh sách"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-full transition-all cursor-pointer border-none ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#1E1F20] shadow-xs text-[#0B57D0] dark:text-[#A8C7FA]'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">view_list</span>
          </button>
          <button
            type="button"
            aria-label="Xem dạng lưới"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-full transition-all cursor-pointer border-none ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#1E1F20] shadow-xs text-[#0B57D0] dark:text-[#A8C7FA]'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
        </div>
      </div>

      {/* 2. DECLUTTER THE SEARCH & FILTER BAR: Single sleek flex row (gap-3) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input - Pill shaped with flat tonal styling */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#8E918F] text-[18px] pointer-events-none">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
            placeholder="Tìm kiếm theo tên hoặc mã lớp..."
            className="w-full pl-10 pr-12 py-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] placeholder-gray-500 dark:placeholder-[#8E918F] text-xs sm:text-sm border-none outline-none transition-colors"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '', page: 0 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white border-none bg-transparent cursor-pointer p-0.5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Role Filter Select - Pill shaped */}
        <div className="relative shrink-0">
          <select
            value={filters.role || 'ALL'}
            onChange={(e) =>
              onFilterChange({
                role: e.target.value as 'ALL' | 'PRIMARY_INSTRUCTOR' | 'TA' | 'STUDENT',
                page: 0,
              })
            }
            className="appearance-none pl-4 pr-9 py-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] text-xs sm:text-sm font-medium border-none outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="PRIMARY_INSTRUCTOR">Chủ lớp</option>
            <option value="TA">Giảng viên</option>
            <option value="STUDENT">Học viên</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 dark:text-[#8E918F] text-[18px]">
            expand_more
          </span>
        </div>

        {/* Sort Filter Select - Pill shaped */}
        <div className="relative shrink-0">
          <select
            value={filters.sort || 'updated_desc'}
            onChange={(e) =>
              onFilterChange({
                sort: e.target.value as 'updated_desc' | 'name_asc' | 'students_desc',
                page: 0,
              })
            }
            className="appearance-none pl-4 pr-9 py-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] text-xs sm:text-sm font-medium border-none outline-none cursor-pointer"
          >
            <option value="updated_desc">Mới cập nhật</option>
            <option value="name_asc">Tên lớp A–Z</option>
            <option value="students_desc">Sĩ số giảm dần</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 dark:text-[#8E918F] text-[18px]">
            expand_more
          </span>
        </div>

        {/* Clear Filters Button (if active) */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-[#0B57D0] dark:text-[#A8C7FA] hover:underline font-medium cursor-pointer border-none bg-transparent whitespace-nowrap"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </section>
  );
}
