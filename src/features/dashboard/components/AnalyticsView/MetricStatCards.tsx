'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { StatOverview } from '../../types';

interface MetricStatCardsProps {
  stats: StatOverview;
}

export function MetricStatCards({ stats }: MetricStatCardsProps) {
  const t = useTranslations('dashboard');

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Stat 1: Streak */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-slate-100 dark:border-slate-800">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('streakTitle')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">local_fire_department</span>
          </div>
        </div>
        <div className="mt-4 mb-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t('streakDays', { days: stats.streakDays })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          <span>{stats.streakChangeText}</span>
        </div>
      </div>

      {/* Stat 2: Study Time */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-slate-100 dark:border-slate-800">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('studyHoursTitle')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">timer</span>
          </div>
        </div>
        <div className="mt-4 mb-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t('studyHoursUnit', { hours: stats.studyHoursThisWeek })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{t('studyHoursExceed', { percent: stats.studyHoursGoalPercent, goal: stats.studyHoursGoal })}</span>
        </div>
      </div>

      {/* Stat 3: Knowledge Nodes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-slate-100 dark:border-slate-800">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('nodesTitle')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">account_tree</span>
          </div>
        </div>
        <div className="mt-4 mb-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {stats.knowledgeNodesUnlocked} / {stats.knowledgeNodesTotal}{' '}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{t('nodesUnit')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            insights
          </span>
          <span>
            {t('nodesAchieved', { percent: stats.knowledgeGraphPercent, topic: stats.knowledgeGraphTopic })}
          </span>
        </div>
      </div>

      {/* Stat 4: Approaching Deadlines */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-slate-100 dark:border-slate-800">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('deadlinesTitle')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">event_busy</span>
          </div>
        </div>
        <div className="mt-4 mb-1">
          <div className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
            {t('deadlinesUnit', { count: stats.approachingDeadlinesCount })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 truncate">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span className="truncate">{stats.nearestDeadlineDescription}</span>
        </div>
      </div>
    </section>
  );
}
