'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardKeys } from '../constants';
import {
  getDashboardAnalytics,
  getCompetencyData,
  getAIInsight,
  getEnrolledCourses,
  getAITasks,
  MOCK_STAT_OVERVIEW,
  MOCK_HEATMAP_CELLS,
  MOCK_COMPETENCY_PILLARS,
  MOCK_AI_INSIGHT,
  MOCK_COURSES,
  MOCK_AI_TASKS,
} from '../services/dashboard.service';

export function useDashboardData() {
  const analyticsQuery = useQuery({
    queryKey: dashboardKeys.analytics(),
    queryFn: getDashboardAnalytics,
    staleTime: 5 * 60 * 1000,
    initialData: MOCK_STAT_OVERVIEW,
  });

  const competencyQuery = useQuery({
    queryKey: dashboardKeys.competency(),
    queryFn: getCompetencyData,
    staleTime: 5 * 60 * 1000,
    initialData: {
      heatmap: MOCK_HEATMAP_CELLS,
      pillars: MOCK_COMPETENCY_PILLARS,
    },
  });

  const aiInsightQuery = useQuery({
    queryKey: dashboardKeys.aiInsight(),
    queryFn: getAIInsight,
    staleTime: 5 * 60 * 1000,
    initialData: MOCK_AI_INSIGHT,
  });

  const coursesQuery = useQuery({
    queryKey: dashboardKeys.courses(),
    queryFn: getEnrolledCourses,
    staleTime: 5 * 60 * 1000,
    initialData: MOCK_COURSES,
  });

  const aiTasksQuery = useQuery({
    queryKey: dashboardKeys.aiTasks(),
    queryFn: getAITasks,
    staleTime: 5 * 60 * 1000,
    initialData: MOCK_AI_TASKS,
  });

  return {
    analytics: analyticsQuery.data,
    competency: competencyQuery.data,
    aiInsight: aiInsightQuery.data,
    courses: coursesQuery.data,
    aiTasks: aiTasksQuery.data,
    isLoading:
      analyticsQuery.isLoading ||
      competencyQuery.isLoading ||
      aiInsightQuery.isLoading ||
      coursesQuery.isLoading,
  };
}
