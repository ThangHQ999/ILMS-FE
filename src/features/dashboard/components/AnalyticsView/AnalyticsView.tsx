'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MetricStatCards } from './MetricStatCards';
import { CompetencyHeatmap } from './CompetencyHeatmap';
import { AIInsightCard } from './AIInsightCard';
import { CourseProgressTable } from './CourseProgressTable';
import { StatOverview, HeatmapCell, CompetencyPillar, AIInsight, CourseProgress } from '../../types';

interface AnalyticsViewProps {
  userFullName: string;
  onSwitchToFocus: () => void;
  stats: StatOverview;
  heatmap: HeatmapCell[];
  pillars: CompetencyPillar[];
  insight: AIInsight;
  courses: CourseProgress[];
}

export function AnalyticsView({
  userFullName,
  onSwitchToFocus,
  stats,
  heatmap,
  pillars,
  insight,
  courses,
}: AnalyticsViewProps) {
  const t = useTranslations('dashboard');
  const [activeTimeRange, setActiveTimeRange] = useState<'7days' | 'month' | 'all'>('7days');

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 flex flex-col gap-8">
      {/* 1. Header & Quick Controls */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight">
              {t('welcome', { name: userFullName })}
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] border-none whitespace-nowrap">
              {t('proLearner')}
            </span>
          </div>
          <p className="text-sm text-[#747775] dark:text-[#C4C7C5]">
            {t('analyticsSubtitle')}
          </p>
        </div>

        {/* Quick Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#F0F4F9] dark:bg-[#1E1F20] p-1.5 rounded-full inline-flex items-center gap-1">
            <button
              onClick={() => setActiveTimeRange('7days')}
              className={`px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap border-none cursor-pointer ${
                activeTimeRange === '7days'
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3] font-semibold'
                  : 'text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
              }`}
              type="button"
            >
              {t('filter7Days')}
            </button>
            <button
              onClick={() => setActiveTimeRange('month')}
              className={`px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap border-none cursor-pointer ${
                activeTimeRange === 'month'
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3] font-semibold'
                  : 'text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
              }`}
              type="button"
            >
              {t('filterMonth')}
            </button>
            <button
              onClick={() => setActiveTimeRange('all')}
              className={`px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap border-none cursor-pointer ${
                activeTimeRange === 'all'
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3] font-semibold'
                  : 'text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
              }`}
              type="button"
            >
              {t('filterAll')}
            </button>
          </div>

          <button
            onClick={onSwitchToFocus}
            className="inline-flex items-center gap-1.5 bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] rounded-full px-6 py-2.5 font-medium transition-colors text-xs whitespace-nowrap cursor-pointer border-none"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">fit_screen</span>
            <span>{t('focusModeBtn')}</span>
          </button>
        </div>
      </header>

      {/* 2. Metrics - 4 Bento Stat Cards */}
      <MetricStatCards stats={stats} />

      {/* 3. Main Data Row (65% Heatmap / 35% AI Insights) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <CompetencyHeatmap heatmap={heatmap} pillars={pillars} />
        <AIInsightCard insight={insight} />
      </section>

      {/* 4. Progress - Full Width Data Table */}
      <CourseProgressTable courses={courses} />
    </div>
  );
}
