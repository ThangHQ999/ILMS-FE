'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CustomSelect } from '@/components/shared';
import type { AssignmentFilters } from '../types';

interface AssignmentFilterToolbarProps {
  filters: AssignmentFilters;
  onFilterChange: (newFilters: Partial<AssignmentFilters>) => void;
}

export function AssignmentFilterToolbar({
  filters,
  onFilterChange,
}: AssignmentFilterToolbarProps) {
  const t = useTranslations('assignments');

  return (
    <div className="w-full bg-card text-card-foreground rounded-2xl p-4 shadow-sm border border-border mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
      {/* Search Input Box */}
      <div className="relative flex-1 min-w-0">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[19px] text-muted-foreground pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder={t('filters.searchPlaceholder')}
          className="w-full h-10 pl-10 pr-10 rounded-xl bg-muted/40 text-foreground placeholder:text-muted-foreground text-xs sm:text-sm border border-border focus:outline-none focus:bg-card focus:ring-2 focus:ring-secondary/40 transition-all"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onFilterChange({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            title={t('filters.clearSearch')}
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Filter Dropdowns Group */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {/* Chapter Dropdown */}
        <CustomSelect<string>
          value={filters.chapter}
          onChange={(val) => onFilterChange({ chapter: val })}
          options={[
            { value: 'ALL', label: t('filters.allChapters') },
            { value: 'CH1', label: t('filters.ch1') },
            { value: 'CH2', label: t('filters.ch2') },
            { value: 'CH3', label: t('filters.ch3') },
            { value: 'CH4', label: t('filters.ch4') },
          ]}
          className="min-w-[140px]"
        />

        {/* Topic Dropdown */}
        <CustomSelect<string>
          value={filters.topic}
          onChange={(val) => onFilterChange({ topic: val })}
          options={[
            { value: 'ALL', label: t('filters.allTopics') },
            { value: 'TRANSPORT', label: t('filters.topicTransport') },
            { value: 'NETWORK', label: t('filters.topicNetwork') },
            { value: 'APPLICATION', label: t('filters.topicApp') },
            { value: 'WIRESHARK', label: t('filters.topicWireshark') },
          ]}
          className="min-w-[150px]"
        />

        {/* Difficulty / Bloom Dropdown */}
        <CustomSelect<string>
          value={filters.difficulty}
          onChange={(val) => onFilterChange({ difficulty: val })}
          options={[
            { value: 'ALL', label: t('filters.allDifficulties') },
            { value: 'BLOOM1', label: t('filters.bloom1') },
            { value: 'BLOOM2', label: t('filters.bloom2') },
            { value: 'BLOOM3', label: t('filters.bloom3') },
            { value: 'BLOOM4', label: t('filters.bloom4') },
          ]}
          className="min-w-[150px]"
        />
      </div>
    </div>
  );
}

