'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardKeys } from '../constants';
import {
  getDashboardAnalytics,
  getCompetencyData,
  getAIInsight,
  getEnrolledCourses,
  getAITasks,
} from '../services/dashboard.service';

export function useDashboardData() {
  const analyticsQuery = useQuery({
    queryKey: dashboardKeys.analytics(),
    queryFn: getDashboardAnalytics,
    staleTime: 60 * 1000,
  });

  const competencyQuery = useQuery({
    queryKey: dashboardKeys.competency(),
    queryFn: getCompetencyData,
    staleTime: 60 * 1000,
  });

  const aiInsightQuery = useQuery({
    queryKey: dashboardKeys.aiInsight(),
    queryFn: getAIInsight,
    staleTime: 60 * 1000,
  });

  const coursesQuery = useQuery({
    queryKey: dashboardKeys.courses(),
    queryFn: getEnrolledCourses,
    staleTime: 60 * 1000,
  });

  const aiTasksQuery = useQuery({
    queryKey: dashboardKeys.aiTasks(),
    queryFn: getAITasks,
    staleTime: 60 * 1000,
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
