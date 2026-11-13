'use client';

import { useQuery } from '@tanstack/react-query';
import { getAiRecommendation } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { AiRecommendation } from '../types';

export function useAiRecommendation(classId: string) {
  return useQuery<AiRecommendation>({
    queryKey: assignmentKeys.aiRecommendation(classId),
    queryFn: () => getAiRecommendation(classId),
    staleTime: 60_000,
  });
}

