'use client';

import { useQuery } from '@tanstack/react-query';
import { getClassAssignmentsPaged } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { AssignmentListResponse } from '../types';

export interface UseClassAssignmentsPagedOptions {
  search?: string;
  page?: number;
  size?: number;
  status?: string;
}

export function useClassAssignmentsPaged(
  classId: string,
  options: UseClassAssignmentsPagedOptions = {}
) {
  return useQuery<AssignmentListResponse>({
    queryKey: [...assignmentKeys.list(classId, options as Record<string, unknown>), 'paged'],
    queryFn: () => getClassAssignmentsPaged(classId, options),
    staleTime: 30_000,
  });
}
