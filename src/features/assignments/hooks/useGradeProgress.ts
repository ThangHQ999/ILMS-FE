'use client';

import { useQuery } from '@tanstack/react-query';
import { getGradeProgress } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { GradeProgress } from '../types';

export function useGradeProgress(classId: string) {
  return useQuery<GradeProgress>({
    queryKey: assignmentKeys.gradeProgress(classId),
    queryFn: () => getGradeProgress(classId),
    staleTime: 60_000,
  });
}

