'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCompetencyRadar,
  getSkillTreeStages,
  getClassHeatmap,
  getFocusGoals,
} from '../services/competency.service';

export const competencyKeys = {
  all: ['competency'] as const,
  radar: () => [...competencyKeys.all, 'radar'] as const,
  skillTree: () => [...competencyKeys.all, 'skillTree'] as const,
  heatmap: () => [...competencyKeys.all, 'heatmap'] as const,
  focusGoals: () => [...competencyKeys.all, 'focusGoals'] as const,
};

export function useCompetencyData() {
  const radarQuery = useQuery({
    queryKey: competencyKeys.radar(),
    queryFn: getCompetencyRadar,
    staleTime: 5 * 60 * 1000,
  });

  const skillTreeQuery = useQuery({
    queryKey: competencyKeys.skillTree(),
    queryFn: getSkillTreeStages,
    staleTime: 5 * 60 * 1000,
  });

  const heatmapQuery = useQuery({
    queryKey: competencyKeys.heatmap(),
    queryFn: getClassHeatmap,
    staleTime: 5 * 60 * 1000,
  });

  const focusGoalsQuery = useQuery({
    queryKey: competencyKeys.focusGoals(),
    queryFn: getFocusGoals,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    radarQuery.isLoading ||
    skillTreeQuery.isLoading ||
    heatmapQuery.isLoading ||
    focusGoalsQuery.isLoading;

  return {
    radarData: radarQuery.data,
    skillTreeStages: skillTreeQuery.data,
    heatmapData: heatmapQuery.data,
    focusGoals: focusGoalsQuery.data,
    isLoading,
    refetchAll: () => {
      radarQuery.refetch();
      skillTreeQuery.refetch();
      heatmapQuery.refetch();
      focusGoalsQuery.refetch();
    },
  };
}
