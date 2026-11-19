'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMySubmission } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { MySubmission } from '../types';

export function useUpdateSubmission(
  assignmentId: string,
  studentId?: string,
  classId?: string
) {
  const queryClient = useQueryClient();

  return useMutation<MySubmission, Error, { content: string }>({
    mutationFn: (payload) =>
      updateMySubmission(assignmentId, payload, studentId, classId),
    // Never auto-retry PATCH because each successful update increments submissionAttempt
    retry: false,
    onSuccess: (updatedData) => {
      // 1. Update all partitioned mySubmission caches for this assignment immediately with server response
      queryClient.setQueryData(
        assignmentKeys.mySubmission(assignmentId, studentId, classId),
        updatedData
      );
      queryClient.setQueriesData<MySubmission>(
        { queryKey: [...assignmentKeys.all, 'my-submission', assignmentId] },
        updatedData
      );
      queryClient.invalidateQueries({
        queryKey: [...assignmentKeys.all, 'my-submission', assignmentId],
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });

      // 2. Sync assignment list batch-submissions cache
      queryClient.setQueriesData<Record<string, MySubmission>>(
        { queryKey: [...assignmentKeys.all, 'batch-submissions'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            [assignmentId]: updatedData,
          };
        }
      );

      // 3. Invalidate related lists and teacher grading progress
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...assignmentKeys.all, 'batch-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-grading-progress', assignmentId] });
      queryClient.invalidateQueries({
        queryKey: [...assignmentKeys.all, 'teacher-submissions', assignmentId],
      });
    },
  });
}
