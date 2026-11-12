'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
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
    <div className="w-full bg-card text-card-foreground rounded-2xl p-4 shadow-sm border border-border mb-6 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
      {/* Search Input Box */}
      <div className="relative flex-1 min-w-[260px]">
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
        <div className="relative">
          <select
            value={filters.chapter}
            onChange={(e) => onFilterChange({ chapter: e.target.value })}
            className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-muted/40 text-foreground text-xs sm:text-sm font-medium border border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
          >
            <option value="ALL">{t('filters.allChapters')}</option>
            <option value="CH1">{t('filters.ch1')}</option>
            <option value="CH2">{t('filters.ch2')}</option>
            <option value="CH3">{t('filters.ch3')}</option>
            <option value="CH4">{t('filters.ch4')}</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Topic Dropdown */}
        <div className="relative">
          <select
            value={filters.topic}
            onChange={(e) => onFilterChange({ topic: e.target.value })}
            className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-muted/40 text-foreground text-xs sm:text-sm font-medium border border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
          >
            <option value="ALL">{t('filters.allTopics')}</option>
            <option value="TRANSPORT">{t('filters.topicTransport')}</option>
            <option value="NETWORK">{t('filters.topicNetwork')}</option>
            <option value="APPLICATION">{t('filters.topicApp')}</option>
            <option value="WIRESHARK">{t('filters.topicWireshark')}</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Difficulty / Bloom Dropdown */}
        <div className="relative">
          <select
            value={filters.difficulty}
            onChange={(e) => onFilterChange({ difficulty: e.target.value })}
            className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-muted/40 text-foreground text-xs sm:text-sm font-medium border border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
          >
            <option value="ALL">{t('filters.allDifficulties')}</option>
            <option value="BLOOM1">{t('filters.bloom1')}</option>
            <option value="BLOOM2">{t('filters.bloom2')}</option>
            <option value="BLOOM3">{t('filters.bloom3')}</option>
            <option value="BLOOM4">{t('filters.bloom4')}</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground pointer-events-none">
            expand_more
          </span>
        </div>
      </div>
    </div>
  );
}

