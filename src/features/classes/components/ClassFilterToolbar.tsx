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
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onFilterChange({ status: 'ACTIVE', page: 0 })}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filters.status === 'ACTIVE'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('tabActive')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filters.status === 'ACTIVE'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ status: 'ARCHIVED', page: 0 })}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filters.status === 'ARCHIVED'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('tabArchived')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filters.status === 'ARCHIVED'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {archivedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ status: 'ALL', page: 0 })}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filters.status === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('tabAll')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filters.status === 'ALL'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {allCount}
            </span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title={t('viewGrid')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            title={t('viewList')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
            placeholder={t('searchPlaceholder')}
            className="w-full h-10 pl-9 pr-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '', page: 0 })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
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
            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
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
            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
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

