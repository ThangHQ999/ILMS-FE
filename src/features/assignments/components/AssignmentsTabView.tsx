'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { ClassHubHeader } from './ClassHubHeader';
import { AssignmentFilterToolbar } from './AssignmentFilterToolbar';
import { AssignmentActiveCluster } from './AssignmentActiveCluster';
import { AssignmentCompletedCluster } from './AssignmentCompletedCluster';
import { AssignmentUpcomingCluster } from './AssignmentUpcomingCluster';
import { GradeWeightsPanel } from './GradeWeightsPanel';
import { SocraticAiMentorPanel } from './SocraticAiMentorPanel';
import { PersonalPerformancePanel } from './PersonalPerformancePanel';
import { useAssignments } from '../hooks/useAssignments';
import { useGradeProgress } from '../hooks/useGradeProgress';
import { useAiRecommendation } from '../hooks/useAiRecommendation';
import { useStudentPerformance } from '../hooks/useStudentPerformance';
import { useClassHubInfo } from '../hooks/useClassHubInfo';
import type { AssignmentFilters } from '../types';

interface AssignmentsTabViewProps {
  classId?: string;
  userFullName?: string;
}

export function AssignmentsTabView({
  classId = 'cs-202',
  userFullName = 'Kỹ sư Vũ Minh',
}: AssignmentsTabViewProps) {
  const router = useRouter();
  const t = useTranslations('assignments');

  // Shell Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Filter States
  const [filters, setFilters] = useState<AssignmentFilters>({
    search: '',
    chapter: 'ALL',
    topic: 'ALL',
    difficulty: 'ALL',
  });

  // Queries
  const { data: hubInfo } = useClassHubInfo(classId);
  const { data: assignments = [], isLoading, isError, refetch } = useAssignments(classId, filters);
  const { data: gradeProgress } = useGradeProgress(classId);
  const { data: aiRecommendation } = useAiRecommendation(classId);
  const { data: performance } = useStudentPerformance(classId);

  const handleFilterUpdate = useCallback((updates: Partial<AssignmentFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  // Filter assignments client-side if needed
  const filteredAssignments = useMemo(() => {
    let list = assignments;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.chapter?.toLowerCase().includes(q) ||
          item.plos?.some(
            (p) => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
          )
      );
    }

    if (filters.chapter !== 'ALL') {
      const chMap: Record<string, string> = {
        CH1: 'Chương 1',
        CH2: 'Chương 2',
        CH3: 'Chương 3',
        CH4: 'Chương 4',
      };
      const match = chMap[filters.chapter];
      if (match) {
        list = list.filter((i) => i.chapter?.includes(match));
      }
    }

    if (filters.topic !== 'ALL') {
      const topicMap: Record<string, string> = {
        TRANSPORT: 'Giao vận',
        NETWORK: 'Mạng',
        APPLICATION: 'Ứng dụng',
        WIRESHARK: 'Wireshark',
      };
      const match = topicMap[filters.topic];
      if (match) {
        list = list.filter((i) => i.topic?.includes(match));
      }
    }

    return list;
  }, [assignments, filters]);

  // Split into 3 clusters
  const activeItems = useMemo(
    () => filteredAssignments.filter((i) => i.status === 'OPEN' || i.status === 'DUE_SOON'),
    [filteredAssignments]
  );

  const completedItems = useMemo(
    () => filteredAssignments.filter((i) => i.status === 'GRADED' || i.status === 'SUBMITTED'),
    [filteredAssignments]
  );

  const upcomingItems = useMemo(
    () => filteredAssignments.filter((i) => i.status === 'UPCOMING' || i.status === 'LOCKED'),
    [filteredAssignments]
  );

  // Action handlers
  const handleTakeQuiz = (quizId: string) => {
    // Navigate or alert
    alert(`Bắt đầu làm bài: ${quizId}`);
  };

  const handleSubmitLab = (labId: string) => {
    alert(`Mở hộp thoại nộp báo cáo Lab: ${labId}`);
  };

  const handleExportReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* 1. App Shell Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Top Header */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
        userFullName={userFullName}
      />

      {/* 3. Main Workspace Content */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-8 max-w-7xl w-full mx-auto ${
          isFocusMode ? 'pl-24' : isSidebarCollapsed ? 'pl-24' : 'lg:pl-[284px]'
        }`}
      >
        <div className="flex flex-col w-full">
          {/* Course Hub Header Banner */}
          {hubInfo && (
            <ClassHubHeader
              info={hubInfo}
              onCreateQuizAI={() => alert('Khởi tạo Quiz thông minh với Socratic AI')}
              onCreateAssignment={() => alert('Mở form giao bài tập / quiz mới')}
            />
          )}

          {/* Search & Filter Toolbar */}
          <AssignmentFilterToolbar filters={filters} onFilterChange={handleFilterUpdate} />

          {/* Main 2-Column Split */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="h-44 rounded-2xl bg-muted/50 animate-pulse border border-border" />
                <div className="h-44 rounded-2xl bg-muted/50 animate-pulse border border-border" />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="h-64 rounded-2xl bg-muted/50 animate-pulse border border-border" />
                <div className="h-44 rounded-2xl bg-muted/50 animate-pulse border border-border" />
              </div>
            </div>
          ) : isError ? (
            <div className="my-8 p-10 rounded-2xl bg-card border border-border text-center space-y-3">
              <span className="material-symbols-outlined text-[32px] text-destructive">
                error_outline
              </span>
              <p className="text-sm font-semibold text-foreground">
                {t('errors.loadFailed')}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-5 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold cursor-pointer"
              >
                {t('actions.retry')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Clusters (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                {/* Cluster 1: Active & Upcoming Due */}
                <AssignmentActiveCluster
                  items={activeItems}
                  onTakeQuiz={handleTakeQuiz}
                  onSubmitLab={handleSubmitLab}
                  onViewClassScores={(id) => alert(`Bảng điểm lớp cho bài ${id}`)}
                  onGradeSubmissions={(id) => alert(`Chấm bài tập ${id}`)}
                />

                {/* Cluster 2: Completed & Graded */}
                <AssignmentCompletedCluster
                  items={completedItems}
                  onExportReport={handleExportReport}
                  onReviewQuiz={(id) => alert(`Xem lại đề và giải thích chi tiết ${id}`)}
                  onPracticeMistakes={(id) => alert(`Luyện lại các câu làm sai của bài ${id}`)}
                  onViewSubmission={(id) => alert(`Xem phản hồi bài nộp ${id}`)}
                />

                {/* Cluster 3: Upcoming in Next Sprint */}
                <AssignmentUpcomingCluster
                  items={upcomingItems}
                  onViewOutline={(id) => alert(`Xem đề cương chi tiết bài ${id}`)}
                />
              </div>

              {/* RIGHT COLUMN: Grade weights & AI Mentor (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Panel 1: Grade Weights & Progress */}
                <GradeWeightsPanel gradeProgress={gradeProgress} />

                {/* Panel 2: Socratic AI Mentor */}
                <SocraticAiMentorPanel
                  recommendation={aiRecommendation}
                  onTakeAdaptiveQuiz={() =>
                    alert('Bắt đầu bài tập luyện tập 5 câu củng cố TCP Tahoe vs Reno')
                  }
                />

                {/* Panel 3: Personal Performance */}
                <PersonalPerformancePanel performance={performance} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

