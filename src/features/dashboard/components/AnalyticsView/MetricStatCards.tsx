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
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Stat 1: Streak */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between gap-4 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#444746] dark:text-[#C4C7C5]">
            {t('streakTitle')}
          </span>
          <div className="w-11 h-11 rounded-full bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] flex items-center justify-center shrink-0 border-none">
            <span className="material-symbols-outlined text-[22px]">local_fire_department</span>
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] my-1">
            {t('streakDays', { days: stats.streakDays })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#725200] dark:text-[#FFB784] font-medium">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>{stats.streakChangeText}</span>
          </div>
        </div>
      </div>

      {/* Stat 2: Study Time */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between gap-4 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#444746] dark:text-[#C4C7C5]">
            {t('studyHoursTitle')}
          </span>
          <div className="w-11 h-11 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center shrink-0 border-none">
            <span className="material-symbols-outlined text-[22px]">timer</span>
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] my-1">
            {t('studyHoursUnit', { hours: stats.studyHoursThisWeek })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#0B57D0] dark:text-[#A8C7FA] font-medium">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{t('studyHoursExceed', { percent: stats.studyHoursGoalPercent, goal: stats.studyHoursGoal })}</span>
          </div>
        </div>
      </div>

      {/* Stat 3: Knowledge Nodes */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between gap-4 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#444746] dark:text-[#C4C7C5]">
            {t('nodesTitle')}
          </span>
          <div className="w-11 h-11 rounded-full bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] flex items-center justify-center shrink-0 border-none">
            <span className="material-symbols-outlined text-[22px]">account_tree</span>
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] my-1">
            {stats.knowledgeNodesUnlocked} / {stats.knowledgeNodesTotal}{' '}
            <span className="text-sm font-normal text-[#444746] dark:text-[#C4C7C5]">{t('nodesUnit')}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#444746] dark:text-[#C4C7C5]">
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
              insights
            </span>
            <span>
              {t('nodesAchieved', { percent: stats.knowledgeGraphPercent, topic: stats.knowledgeGraphTopic })}
            </span>
          </div>
        </div>
      </div>

      {/* Stat 4: Approaching Deadlines */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between gap-4 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#444746] dark:text-[#C4C7C5]">
            {t('deadlinesTitle')}
          </span>
          <div className="w-11 h-11 rounded-full bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] flex items-center justify-center shrink-0 border-none">
            <span className="material-symbols-outlined text-[22px]">event_busy</span>
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-[#B3261E] dark:text-[#F28B82] my-1">
            {t('deadlinesUnit', { count: stats.approachingDeadlinesCount })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#B3261E] dark:text-[#F28B82] font-medium truncate">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span className="truncate">{stats.nearestDeadlineDescription}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
