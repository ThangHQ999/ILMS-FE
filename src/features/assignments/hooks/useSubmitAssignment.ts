'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitAssignment } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { MySubmission } from '../types';

export function useSubmitAssignment(
  assignmentId: string,
  classId?: string,
  studentId?: string
) {
  const queryClient = useQueryClient();

  return useMutation<MySubmission, Error, { content: string }>({
    mutationFn: (payload: { content: string }) =>
      submitAssignment(assignmentId, payload, classId, studentId),
    onSuccess: (data) => {
      // 1. Update partitioned my-submission cache immediately with server response
      queryClient.setQueryData(
        assignmentKeys.mySubmission(assignmentId, studentId, classId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.mySubmission(assignmentId, studentId, classId),
      });
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.mySubmission(assignmentId),
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });

      // 2. Invalidate assignment list, batch submissions & teacher grading progress caches
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...assignmentKeys.all, 'batch-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-grading-progress', assignmentId] });
      queryClient.invalidateQueries({
        queryKey: [...assignmentKeys.all, 'teacher-submissions', assignmentId],
      });
    },
  });
}
