'use client';

import React from 'react';
import { useCurrentUser } from '@/features/auth';
import { useCompetencyMode } from '../hooks/useCompetencyMode';
import { useCompetencyData } from '../hooks/useCompetencyData';
import { CompetencyAnalyticsView } from './analytics/CompetencyAnalyticsView';
import { CompetencyFocusView } from './focus/CompetencyFocusView';
import {
  mockMasteryTopics,
  mockTrendPoints,
  mockSocraticRecommendation,
  mockQuickMetrics,
} from '../services/competency.service';

export function CompetencyPageView() {
  const { data: user } = useCurrentUser();
  const { isFocus, switchMode } = useCompetencyMode();
  const { radarData, skillTreeStages, heatmapData, focusGoals, isLoading } = useCompetencyData();

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Trần Nhật Minh';

  if (isLoading || !radarData || !skillTreeStages || !heatmapData || !focusGoals) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6fafe] dark:bg-[#0B0F19] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Đang tải dữ liệu Bản đồ Năng lực...
          </p>
        </div>
      </div>
    );
  }

  if (isFocus) {
    return (
      <CompetencyFocusView
        userFullName={userFullName}
        goals={focusGoals}
        onExitFocus={() => switchMode('analytics')}
      />
    );
  }

  return (
    <CompetencyAnalyticsView
      userFullName={userFullName}
      radarData={radarData}
      masteryTopics={mockMasteryTopics}
      trendPoints={mockTrendPoints}
      socraticRecommendation={mockSocraticRecommendation}
      quickMetrics={mockQuickMetrics}
      skillTreeStages={skillTreeStages}
      heatmapData={heatmapData}
      onSwitchToFocus={() => switchMode('focus')}
    />
  );
}
