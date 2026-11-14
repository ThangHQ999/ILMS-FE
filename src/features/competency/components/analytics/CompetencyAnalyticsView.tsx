'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import {
  CompetencyRadarData,
  MasteryTopic,
  MasteryTrendPoint,
  SocraticRecommendation,
  QuickMetric,
  SkillTreeStage,
  ClassHeatmapData,
} from '../../types';
import { CompetencyHeaderDock, MainTabType } from './CompetencyHeaderDock';
import { StudentProfileTab } from './StudentProfileTab';
import { SkillTreeTab } from './SkillTreeTab';
import { StudentCompetencyMapView } from '../StudentCompetencyMapView';
import { ClassHeatmapTab } from './ClassHeatmapTab';
import { SocraticAICoach } from '@/features/dashboard';

interface CompetencyAnalyticsViewProps {
  userFullName?: string;
  radarData: CompetencyRadarData;
  masteryTopics: MasteryTopic[];
  trendPoints: MasteryTrendPoint[];
  socraticRecommendation: SocraticRecommendation;
  quickMetrics: QuickMetric[];
  skillTreeStages: SkillTreeStage[];
  heatmapData: ClassHeatmapData;
  onSwitchToFocus: () => void;
}

export function CompetencyAnalyticsView({
  userFullName = 'Trần Nhật Minh',
  radarData,
  masteryTopics,
  trendPoints,
  socraticRecommendation,
  quickMetrics,
  skillTreeStages,
  heatmapData,
  onSwitchToFocus,
}: CompetencyAnalyticsViewProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTabType>('profile');

  // Benchmark toggle states
  const [showClassAvg, setShowClassAvg] = useState(true);
  const [showPloTarget, setShowPloTarget] = useState(true);
  const [showPersonalTarget, setShowPersonalTarget] = useState(false);

  // Socratic AI Coach state (resizable width and minimized toggle)
  const [aiWidth, setAiWidth] = useState(380);
  const [isAiMinimized, setIsAiMinimized] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleOpenAICoachWithTopic = () => {
    setIsAiMinimized(false);
  };

  return (
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] antialiased font-sans selection:bg-[#D3E3FD] selection:text-[#041E49]">
      {/* Existing Dashboard Sidebar in Analytics mode */}
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-[260px]'
        }`}
      >
        {/* Existing Dashboard Header */}
        <DashboardHeader
          isFocus={false}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleMode={onSwitchToFocus}
          userFullName={userFullName}
        />

        <main className="w-full min-h-screen pt-16">
          {/* Header & Benchmark Dock */}
          <CompetencyHeaderDock
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSwitchToFocus={onSwitchToFocus}
            showClassAvg={showClassAvg}
            onToggleClassAvg={setShowClassAvg}
            showPloTarget={showPloTarget}
            onTogglePloTarget={setShowPloTarget}
            showPersonalTarget={showPersonalTarget}
            onTogglePersonalTarget={setShowPersonalTarget}
          />

          {/* Dynamic Content Body based on tab */}
          <div className="p-6 lg:p-10">
            {activeTab === 'profile' && (
              <StudentProfileTab
                radarData={radarData}
                masteryTopics={masteryTopics}
                trendPoints={trendPoints}
                socraticRecommendation={socraticRecommendation}
                quickMetrics={quickMetrics}
                showClassAvg={showClassAvg}
                showPloTarget={showPloTarget}
                showPersonalTarget={showPersonalTarget}
                onOpenAICoach={handleOpenAICoachWithTopic}
                onSwitchToFocus={onSwitchToFocus}
              />
            )}

            {activeTab === 'tree' && (
              <StudentCompetencyMapView
                userFullName={userFullName}
                onToast={() => {}}
                onSwitchToFocus={onSwitchToFocus}
                onOpenRadarView={() => setActiveTab('profile')}
                onOpenHeatmap={() => setActiveTab('heatmap')}
              />
            )}

            {activeTab === 'heatmap' && <ClassHeatmapTab data={heatmapData} />}
          </div>
        </main>
      </div>

      {/* Embedded Socratic AI Coach (Mini / Dockable) */}
      <SocraticAICoach
        userFullName={userFullName}
        width={aiWidth}
        onWidthChange={setAiWidth}
        isMinimized={isAiMinimized}
        onToggleMinimize={() => setIsAiMinimized((prev) => !prev)}
        floatingDock={true}
      />
    </div>
  );
}
