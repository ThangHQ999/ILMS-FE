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
    <div className="flex flex-col w-full p-4 lg:p-8 space-y-6">
      {/* 1. Header & Quick Controls */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('welcome', { name: userFullName })}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/15 text-secondary border border-secondary/20">
              {t('proLearner')}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('analyticsSubtitle')}
          </p>
        </div>

        {/* Quick Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTimeRange('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activeTimeRange === '7days'
                  ? 'bg-white dark:bg-slate-900 text-secondary font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              type="button"
            >
              {t('filter7Days')}
            </button>
            <button
              onClick={() => setActiveTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activeTimeRange === 'month'
                  ? 'bg-white dark:bg-slate-900 text-secondary font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              type="button"
            >
              {t('filterMonth')}
            </button>
            <button
              onClick={() => setActiveTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activeTimeRange === 'all'
                  ? 'bg-white dark:bg-slate-900 text-secondary font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              type="button"
            >
              {t('filterAll')}
            </button>
          </div>

          <button
            onClick={onSwitchToFocus}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-white hover:opacity-90 transition-all shadow-sm text-xs font-semibold"
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
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <CompetencyHeatmap heatmap={heatmap} pillars={pillars} />
        <AIInsightCard insight={insight} />
      </section>

      {/* 4. Progress - Full Width Data Table */}
      <CourseProgressTable courses={courses} />
    </div>
  );
}
