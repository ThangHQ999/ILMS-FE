'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSubmission } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { MySubmission } from '../types';

export function useDeleteSubmission(
  assignmentId: string,
  studentId?: string,
  classId?: string
) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { submissionId: string; currentSubmission?: MySubmission | null }
  >({
    mutationFn: ({ submissionId, currentSubmission }) =>
      deleteSubmission(submissionId, assignmentId, studentId, currentSubmission),
    onSuccess: () => {
      const notSubmittedData: MySubmission = {
        assignmentId,
        status: 'NOT_SUBMITTED',
        score: null,
        feedback: null,
        attachmentUrls: [],
        content: null,
        submittedAt: null,
        isLate: false,
      };

      // 1. Cập nhật cache mySubmission về NOT_SUBMITTED ngay lập tức
      queryClient.setQueryData(
        assignmentKeys.mySubmission(assignmentId, studentId, classId),
        notSubmittedData
      );
      queryClient.invalidateQueries({
        queryKey: [...assignmentKeys.all, 'my-submission', assignmentId],
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });

      // 2. Cập nhật tức thì cache batch-submissions của danh sách bài tập
      queryClient.setQueriesData<Record<string, MySubmission>>(
        { queryKey: [...assignmentKeys.all, 'batch-submissions'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            [assignmentId]: notSubmittedData,
          };
        }
      );

      // 3. Làm mới danh sách bài tập, batch submissions, chip bộ lọc và thẻ KPI số đếm
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...assignmentKeys.all, 'batch-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-grading-progress', assignmentId] });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}
