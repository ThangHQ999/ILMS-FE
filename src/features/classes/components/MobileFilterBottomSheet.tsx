'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AVAILABLE_MAJORS } from '../constants';
import type { ClassFilters } from '../types';

interface MobileFilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ClassFilters;
  onApply: (updates: Partial<ClassFilters>) => void;
  onReset: () => void;
  workspaceMode?: 'faculty' | 'student';
}

export function MobileFilterBottomSheet({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  workspaceMode = 'faculty',
}: MobileFilterBottomSheetProps) {
  const t = useTranslations('classes');

  const [localFilters, setLocalFilters] = useState<Partial<ClassFilters>>({
    status: filters.status,
    role: filters.role,
    major: filters.major,
    sort: filters.sort,
  });

  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        status: filters.status,
        role: filters.role,
        major: filters.major,
        sort: filters.sort,
      });
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({ ...localFilters, page: 0 });
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-title"
        className="relative z-50 w-full rounded-t-3xl bg-surface border-t border-border/80 shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto animate-slide-up"
      >
        {/* Handle */}
        <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto -mt-2 mb-2" />

        {/* Title */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
            <h3 id="mobile-filter-title" className="text-base font-bold text-foreground">
              {t('mobileFilterTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Status Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            {t('tabActive')} / {t('tabArchived')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['ACTIVE', 'ARCHIVED', 'ALL'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setLocalFilters((prev) => ({ ...prev, status: st }))}
                className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                  localFilters.status === st
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {st === 'ACTIVE'
                  ? t('tabActive')
                  : st === 'ARCHIVED'
                  ? t('tabArchived')
                  : t('tabAll')}
              </button>
            ))}
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            {t('filterRoleAll')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              workspaceMode === 'student'
                ? [
                    { id: 'ALL' as const, label: t('filterRoleAll') },
                    { id: 'STUDENT' as const, label: t('roleStudentBadge') },
                  ]
                : [
                    { id: 'ALL' as const, label: t('filterRoleAll') },
                    { id: 'PRIMARY_INSTRUCTOR' as const, label: t('roleOwnerBadge') },
                    { id: 'TA' as const, label: t('roleTeacherBadge') },
                  ]
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setLocalFilters((prev) => ({ ...prev, role: r.id }))}
                className={`py-2 px-2 rounded-xl text-xs font-semibold text-center truncate transition-all ${
                  localFilters.role === r.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Major Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            {t('fieldMajor')}
          </label>
          <select
            value={localFilters.major || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, major: e.target.value || undefined }))
            }
            className="w-full h-11 px-4 rounded-xl bg-muted/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary border border-border/40 transition-all"
          >
            <option value="">{t('filterMajorAll')}</option>
            {AVAILABLE_MAJORS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            {t('sortUpdated')} / {t('sortName')}
          </label>
          <select
            value={localFilters.sort || 'updated_desc'}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                sort: e.target.value as 'updated_desc' | 'name_asc' | 'students_desc',
              }))
            }
            className="w-full h-11 px-4 rounded-xl bg-muted/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary border border-border/40 transition-all"
          >
            <option value="updated_desc">{t('sortUpdated')}</option>
            <option value="name_asc">{t('sortName')}</option>
            <option value="students_desc">{t('sortStudents')}</option>
          </select>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
          >
            {t('mobileFilterReset')}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:opacity-90 transition-all text-center"
          >
            {t('mobileFilterApply')}
          </button>
        </div>
      </div>
    </div>
  );
}

