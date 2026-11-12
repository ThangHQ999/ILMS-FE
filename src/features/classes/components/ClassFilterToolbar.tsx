'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AVAILABLE_MAJORS } from '../constants';
import type { ClassFilters, ClassViewMode } from '../types';

interface ClassFilterToolbarProps {
  filters: ClassFilters;
  onFilterChange: (updates: Partial<ClassFilters>) => void;
  viewMode: ClassViewMode;
  onViewModeChange: (mode: ClassViewMode) => void;
  activeCount?: number;
  archivedCount?: number;
  allCount?: number;
}

export function ClassFilterToolbar({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  activeCount = 0,
  archivedCount = 0,
  allCount = 0,
}: ClassFilterToolbarProps) {
  const t = useTranslations('classes');

  return (
    <div className="space-y-4 pt-2">
      {/* Row 1: Status Tab Pills + View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white dark:bg-[#1E1F20] self-start sm:self-auto border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
          <button
            type="button"
            onClick={() => onFilterChange({ status: 'ACTIVE', page: 0 })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-none cursor-pointer ${
              filters.status === 'ACTIVE'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                : 'text-[#444746] hover:text-[#1F1F1F] hover:bg-[#E1E5EA] dark:text-[#C4C7C5] dark:hover:text-[#E3E3E3] dark:hover:bg-[#282A2C]'
            }`}
          >
            <span>{t('tabActive')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                filters.status === 'ACTIVE'
                  ? 'bg-white/70 text-[#041E49] dark:bg-[#282A2C] dark:text-[#A8C7FA]'
                  : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ status: 'ARCHIVED', page: 0 })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-none cursor-pointer ${
              filters.status === 'ARCHIVED'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                : 'text-[#444746] hover:text-[#1F1F1F] hover:bg-[#E1E5EA] dark:text-[#C4C7C5] dark:hover:text-[#E3E3E3] dark:hover:bg-[#282A2C]'
            }`}
          >
            <span>{t('tabArchived')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                filters.status === 'ARCHIVED'
                  ? 'bg-white/70 text-[#041E49] dark:bg-[#282A2C] dark:text-[#A8C7FA]'
                  : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
              }`}
            >
              {archivedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ status: 'ALL', page: 0 })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-none cursor-pointer ${
              filters.status === 'ALL'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                : 'text-[#444746] hover:text-[#1F1F1F] hover:bg-[#E1E5EA] dark:text-[#C4C7C5] dark:hover:text-[#E3E3E3] dark:hover:bg-[#282A2C]'
            }`}
          >
            <span>{t('tabAll')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                filters.status === 'ALL'
                  ? 'bg-white/70 text-[#041E49] dark:bg-[#282A2C] dark:text-[#A8C7FA]'
                  : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
              }`}
            >
              {allCount}
            </span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] self-end sm:self-auto border-none">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title={t('viewGrid')}
            className={`p-2 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3]'
                : 'text-[#747775] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            title={t('viewList')}
            className={`p-2 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3]'
                : 'text-[#747775] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">view_list</span>
          </button>
        </div>
      </div>

      {/* Row 2: Search Input & Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-5 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#747775] dark:text-[#8E918F]">
            search
          </span>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
            placeholder={t('searchPlaceholder')}
            className="w-full h-11 pl-10 pr-9 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] focus:bg-[#F0F4F9] dark:focus:bg-[#282A2C] text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] border-none shadow-none outline-none transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '', page: 0 })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#747775] dark:text-[#8E918F] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Major / Department Filter */}
        <div className="sm:col-span-3">
          <select
            value={filters.major || ''}
            onChange={(e) => onFilterChange({ major: e.target.value || undefined, page: 0 })}
            className="w-full h-11 px-4 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#C4C7C5] border-none shadow-none outline-none transition-all cursor-pointer"
          >
            <option value="">{t('filterMajorAll')}</option>
            {AVAILABLE_MAJORS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Teaching Role Filter */}
        <div className="sm:col-span-2">
          <select
            value={filters.role || 'ALL'}
            onChange={(e) =>
              onFilterChange({
                role: e.target.value as 'ALL' | 'PRIMARY_INSTRUCTOR' | 'TA',
                page: 0,
              })
            }
            className="w-full h-11 px-4 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#C4C7C5] border-none shadow-none outline-none transition-all cursor-pointer"
          >
            <option value="ALL">{t('filterRoleAll')}</option>
            <option value="PRIMARY_INSTRUCTOR">{t('filterRoleInstructor')}</option>
            <option value="TA">{t('filterRoleTA')}</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="sm:col-span-2">
          <select
            value={filters.sort || 'updated_desc'}
            onChange={(e) =>
              onFilterChange({
                sort: e.target.value as 'updated_desc' | 'name_asc' | 'students_desc',
              })
            }
            className="w-full h-11 px-4 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#C4C7C5] border-none shadow-none outline-none transition-all cursor-pointer"
          >
            <option value="updated_desc">{t('sortUpdated')}</option>
            <option value="name_asc">{t('sortName')}</option>
            <option value="students_desc">{t('sortStudents')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
