'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { StudentPerformance } from '../types';

interface PersonalPerformancePanelProps {
  performance?: StudentPerformance;
}

export function PersonalPerformancePanel({ performance }: PersonalPerformancePanelProps) {
  const t = useTranslations('assignments');

  if (!performance) return null;

  return (
    <div className="w-full bg-card text-card-foreground rounded-2xl p-5 sm:p-6 shadow-sm border border-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[20px] text-secondary">trending_up</span>
        <h3 className="text-base font-bold text-foreground">
          {t('panels.performanceTitle')}
        </h3>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
          <span className="text-2xl font-bold text-secondary">
            {performance.averageQuizScore}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            {t('panels.avgQuizScore')}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
          <span className="text-2xl font-bold text-foreground">
            {performance.onTimeRate}%
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            {t('panels.onTimeRate')}
          </p>
        </div>

        {/* Streak row */}
        <div className="col-span-2 p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px] text-secondary">
              local_fire_department
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">{t('panels.streakTitle')}</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {t('panels.streakDescription', { count: performance.streakCount })}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold font-mono">
            +{performance.streakXp} XP
          </span>
        </div>
      </div>

      {/* PLO Badge Level Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-medium">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="material-symbols-outlined text-[17px] text-secondary">
            workspace_premium
          </span>
          {t('panels.ploBadgeTitle')}
        </span>
        <span className="font-bold text-foreground">{performance.ploBadgeLevel}</span>
      </div>
    </div>
  );
}

