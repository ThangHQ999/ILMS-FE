'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssignmentById } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { AssignmentItem } from '../schemas/assignment.schema';

export function useAssignmentItem(assignmentId: string, classId?: string) {
  return useQuery<AssignmentItem>({
    queryKey: assignmentKeys.detail(assignmentId),
    queryFn: () => getAssignmentById(assignmentId, classId),
    enabled: Boolean(assignmentId),
    staleTime: 60_000,
  });
}
