'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getAssignmentGradingProgress,
  type AssignmentGradingProgress,
} from '../services/assignment.service';

export function useAssignmentGradingProgress(
  assignmentId?: string,
  classId?: string,
  options: { enabled?: boolean } = {}
) {
  const isEnabled = Boolean(assignmentId) && (options.enabled ?? true);

  return useQuery<AssignmentGradingProgress>({
    queryKey: ['assignment-grading-progress', assignmentId, classId],
    queryFn: () => {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }
      return getAssignmentGradingProgress(assignmentId, classId);
    },
    enabled: isEnabled,
    staleTime: 30_000,
    retry: 1,
  });
}
