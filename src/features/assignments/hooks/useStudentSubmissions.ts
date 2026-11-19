'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMySubmission,
  submitAssignment,
  updateMySubmission,
  deleteSubmission,
} from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { MySubmission } from '../types';

// ==========================================
// 1. useMySubmission
// ==========================================

export function useMySubmission(assignmentId?: string) {
  return useQuery<MySubmission>({
    queryKey: assignmentKeys.mySubmission(assignmentId || ''),
    queryFn: () => getMySubmission(assignmentId || ''),
    enabled: Boolean(assignmentId),
    staleTime: 30_000,
  });
}

// ==========================================
// 2. useSubmitAssignment
// ==========================================

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

// ==========================================
// 3. useUpdateSubmission
// ==========================================

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

// ==========================================
// 4. useDeleteSubmission
// ==========================================

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
