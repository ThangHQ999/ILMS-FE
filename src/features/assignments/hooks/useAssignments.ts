'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssignments } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { AssignmentFilters, AssignmentItem } from '../types';

export function useAssignments(classId: string, filters: Partial<AssignmentFilters> = {}) {
  return useQuery<AssignmentItem[]>({
    queryKey: assignmentKeys.list(classId, filters),
    queryFn: () => getAssignments(classId, filters),
    staleTime: 60_000,
  });
}

