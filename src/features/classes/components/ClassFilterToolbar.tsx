'use client';

import React, { useRef, useEffect } from 'react';
import { CustomSelect } from '@/components/shared';
import type { ClassFilters, ClassViewMode } from '../types';

export type ClassRoleTab = 'TEACHING' | 'ENROLLED' | 'ARCHIVED';

interface ClassFilterToolbarProps {
  activeTab: ClassRoleTab;
  onTabChange: (tab: ClassRoleTab) => void;
  showTeachingTab: boolean;
  teachingCount: number;
  enrolledCount: number;
  archivedCount: number;
  filters: ClassFilters;
  onFilterChange: (updates: Partial<ClassFilters>) => void;
  viewMode: ClassViewMode;
  onViewModeChange: (mode: ClassViewMode) => void;
  activeKpi?: string | null;
  onClearKpi?: () => void;
}

export function ClassFilterToolbar({
  activeTab,
  onTabChange,
  showTeachingTab,
  teachingCount,
  enrolledCount,
  archivedCount,
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  activeKpi,
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
    filters.search ||
      (activeTab === 'TEACHING' && filters.role && filters.role !== 'ALL') ||
      filters.major ||
      activeKpi
  );

  const tabs: Array<{ id: ClassRoleTab; label: string; count: number; visible: boolean }> = [
    { id: 'TEACHING', label: 'Đang giảng dạy', count: teachingCount, visible: showTeachingTab },
    { id: 'ENROLLED', label: 'Đang theo học', count: enrolledCount, visible: true },
    { id: 'ARCHIVED', label: 'Đã lưu trữ', count: archivedCount, visible: true },
  ];

  return (
    <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 shadow-sm dark:shadow-none border-none space-y-4">
      {/* 1. Top row: Role-based Tabs & View switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap p-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C]" role="tablist">
          {tabs
            .filter((tab) => tab.visible)
            .map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border-none ${
                    isSelected
                      ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] font-bold shadow-xs'
                      : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-white bg-transparent'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-[#A8C7FA]/20 text-[#0B57D0] dark:text-[#A8C7FA]'
                        : 'bg-gray-200 dark:bg-[#383A3C] text-gray-600 dark:text-[#C4C7C5]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
        </div>

        {/* View Mode Toggle (List / Grid) */}
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

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
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

        {/* Role Filter Select: ONLY shown on Đang giảng dạy tab */}
        {activeTab === 'TEACHING' && (
          <CustomSelect<string>
            variant="pill"
            value={filters.role || 'ALL'}
            onChange={(val) =>
              onFilterChange({
                role: val as 'ALL' | 'PRIMARY_INSTRUCTOR' | 'TA' | 'STUDENT',
                page: 0,
              })
            }
            options={[
              { value: 'ALL', label: 'Tất cả vai trò' },
              { value: 'PRIMARY_INSTRUCTOR', label: 'Chủ lớp' },
              { value: 'TA', label: 'Giảng viên' },
            ]}
            className="shrink-0 min-w-[150px]"
          />
        )}

        {/* Sort Filter Select */}
        <CustomSelect<'updated_desc' | 'name_asc' | 'students_desc'>
          variant="pill"
          value={filters.sort || 'updated_desc'}
          onChange={(val) => onFilterChange({ sort: val, page: 0 })}
          options={[
            { value: 'updated_desc', label: 'Mới cập nhật' },
            { value: 'name_asc', label: 'Tên lớp A–Z' },
            { value: 'students_desc', label: 'Sĩ số giảm dần' },
          ]}
          className="shrink-0 min-w-[155px]"
        />

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
