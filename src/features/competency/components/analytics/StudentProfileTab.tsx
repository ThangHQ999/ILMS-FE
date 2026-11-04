'use client';

import React from 'react';
import {
  CompetencyRadarData,
  MasteryTopic,
  MasteryTrendPoint,
  SocraticRecommendation,
  QuickMetric,
} from '../../types';
import { CompetencyRadarCard } from './CompetencyRadarCard';
import { MasteryProgressCard } from './MasteryProgressCard';
import { SocraticActionCard } from './SocraticActionCard';

interface StudentProfileTabProps {
  radarData: CompetencyRadarData;
  masteryTopics: MasteryTopic[];
  trendPoints: MasteryTrendPoint[];
  socraticRecommendation: SocraticRecommendation;
  quickMetrics: QuickMetric[];
  showClassAvg: boolean;
  showPloTarget: boolean;
  showPersonalTarget: boolean;
  onOpenAICoach: () => void;
  onSwitchToFocus: () => void;
}

export function StudentProfileTab({
  radarData,
  masteryTopics,
  trendPoints,
  socraticRecommendation,
  quickMetrics,
  showClassAvg,
  showPloTarget,
  showPersonalTarget,
  onOpenAICoach,
  onSwitchToFocus,
}: StudentProfileTabProps) {
  return (
    <section className="flex flex-col gap-6">
      {/* Top Row: Radar Chart + Mastery Progress + AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <CompetencyRadarCard
            data={radarData}
            showClassAvg={showClassAvg}
            showPloTarget={showPloTarget}
            showPersonalTarget={showPersonalTarget}
          />
        </div>

        <div className="lg:col-span-4">
          <MasteryProgressCard topics={masteryTopics} trendPoints={trendPoints} />
        </div>

        <div className="lg:col-span-3">
          <SocraticActionCard
            recommendation={socraticRecommendation}
            onOpenAICoach={onOpenAICoach}
            onStartQuizAction={onSwitchToFocus}
          />
        </div>
      </div>

      {/* Quick Metrics Ribbon: ICPC Submissions & Skill Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickMetrics.map((qm) => (
          <div
            key={qm.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${qm.colorClass}`}
            >
              <span className="material-symbols-outlined text-[26px]">{qm.icon}</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight block">
                {qm.value}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {qm.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
