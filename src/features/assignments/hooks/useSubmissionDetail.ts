'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubmissionById,
  getSubmissionGrading,
  gradeSubmission,
  deleteGrading,
} from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type {
  SubmissionDetail,
  SubmissionGrading,
  GradeSubmissionPayload,
} from '../schemas/assignment.schema';

function extractErrorCodeAndStatus(error: unknown): { status: number; code: string } {
  if (!error || typeof error !== 'object') return { status: 0, code: '' };
  const err = error as {
    httpStatus?: number;
    status?: number;
    code?: string;
    response?: { status?: number };
  };
  return {
    status: err.httpStatus || err.response?.status || err.status || 0,
    code: (err.code || '').toUpperCase(),
  };
}

export function useSubmissionDetail(
  submissionId: string,
  assignmentId?: string,
  classId?: string,
  options?: { userId?: string; enabled?: boolean }
) {
  const userId = options?.userId;
  const isEnabled = options?.enabled ?? true;

  return useQuery<SubmissionDetail>({
    queryKey: assignmentKeys.submissionDetail(submissionId, assignmentId, classId, userId),
    queryFn: () => getSubmissionById(submissionId, assignmentId, classId),
    enabled: Boolean(submissionId) && isEnabled,
    staleTime: 10_000,
    retry: (failureCount, error) => {
      const { status, code } = extractErrorCodeAndStatus(error);
      if (
        status === 400 ||
        status === 401 ||
        status === 403 ||
        status === 404 ||
        status === 409 ||
        code === 'SCHEMA_ERROR' ||
        code === 'ASSIGNMENT_MISMATCH'
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useSubmissionGrading(
  submissionId: string,
  assignmentId?: string,
  classId?: string,
  options?: { userId?: string; enabled?: boolean }
) {
  const userId = options?.userId;
  const isEnabled = options?.enabled ?? true;

  return useQuery<SubmissionGrading | null>({
    queryKey: assignmentKeys.submissionGrading(submissionId, assignmentId, classId, userId),
    queryFn: () => getSubmissionGrading(submissionId, assignmentId, classId),
    enabled: Boolean(submissionId) && isEnabled,
    staleTime: 10_000,
    retry: (failureCount, error) => {
      const { status, code } = extractErrorCodeAndStatus(error);
      if (
        status === 400 ||
        status === 401 ||
        status === 403 ||
        status === 404 ||
        status === 409 ||
        code === 'SCHEMA_ERROR'
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

function invalidateGradingRelatedQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  submissionId: string,
  assignmentId?: string,
  classId?: string,
  userId?: string
): void {
  queryClient.invalidateQueries({
    queryKey: assignmentKeys.submissionDetail(submissionId, assignmentId, classId, userId),
  });
  queryClient.invalidateQueries({
    queryKey: [...assignmentKeys.all, 'submission-detail'],
  });
  queryClient.invalidateQueries({
    queryKey: assignmentKeys.submissionGrading(submissionId, assignmentId, classId, userId),
  });
  queryClient.invalidateQueries({
    queryKey: [...assignmentKeys.all, 'submission-grading'],
  });

  if (assignmentId) {
    queryClient.invalidateQueries({
      queryKey: [...assignmentKeys.all, 'teacher-submissions', assignmentId],
    });
    queryClient.invalidateQueries({
      queryKey: [...assignmentKeys.all, 'my-submission', assignmentId],
    });
    queryClient.invalidateQueries({
      queryKey: assignmentKeys.detail(assignmentId),
    });
    queryClient.invalidateQueries({
      queryKey: ['assignment-grading-progress', assignmentId],
    });
  }

  queryClient.invalidateQueries({
    queryKey: assignmentKeys.lists(),
  });
  queryClient.invalidateQueries({
    queryKey: [...assignmentKeys.all, 'batch-submissions'],
  });
}

export function useGradeSubmission(
  assignmentId?: string,
  classId?: string,
  userId?: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: GradeSubmissionPayload;
    }) => gradeSubmission(submissionId, payload, assignmentId, classId),
    onSuccess: (_data, variables) => {
      invalidateGradingRelatedQueries(
        queryClient,
        variables.submissionId,
        assignmentId,
        classId,
        userId
      );
    },
  });
}

export function useDeleteGrading(
  assignmentId?: string,
  classId?: string,
  userId?: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: ({
      gradingId,
      submissionId,
    }: {
      gradingId: string;
      submissionId: string;
    }) => deleteGrading(gradingId, submissionId, assignmentId, classId),
    onSuccess: (_data, variables) => {
      invalidateGradingRelatedQueries(
        queryClient,
        variables.submissionId,
        assignmentId,
        classId,
        userId
      );
    },
  });
}
