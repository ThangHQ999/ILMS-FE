'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAssignmentSubmissionsPaged,
  bulkGradeSubmissions,
  getSubmissionById,
  getSubmissionGrading,
  gradeSubmission,
  deleteGrading,
} from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type {
  BatchGradeResult,
  TeacherSubmissionListResponse,
  SubmissionDetail,
  SubmissionGrading,
  GradeSubmissionPayload,
} from '../schemas/assignment.schema';

// ==========================================
// 1. Error extraction helpers
// ==========================================

function getHttpStatus(error: unknown): number {
  if (!error || typeof error !== 'object') return 0;
  const e = error as { httpStatus?: number; status?: number; response?: { status?: number } };
  return e.httpStatus || e.response?.status || e.status || 0;
}

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

// ==========================================
// 2. useAssignmentSubmissions & useBulkGradeSubmissions
// ==========================================

export interface UseAssignmentSubmissionsOptions {
  classId?: string;
  userId?: string;
  status?: 'SUBMITTED' | 'LATE' | 'GRADED';
  search?: string;
  sort?: 'submittedAt,desc' | 'submittedAt,asc';
  page?: number;
  size?: number;
  enabled?: boolean;
}

export function useAssignmentSubmissions(
  assignmentId: string,
  options: UseAssignmentSubmissionsOptions = {}
) {
  const { enabled = true, userId, classId, status, search, sort, page, size } = options;

  const filterKey = {
    status: status || 'ALL',
    search: search || '',
    sort: sort || 'submittedAt,desc',
    page: page ?? 0,
    size: size ?? 5,
  };

  return useQuery<TeacherSubmissionListResponse>({
    queryKey: assignmentKeys.teacherSubmissions(assignmentId, filterKey, userId, classId),
    queryFn: () =>
      getAssignmentSubmissionsPaged(assignmentId, {
        classId,
        status,
        search,
        sort,
        page,
        size,
      }),
    enabled: Boolean(assignmentId) && enabled,
    staleTime: 15_000,
    retry: (failureCount, error) => {
      const httpStatus = getHttpStatus(error);
      const code = (error as { code?: string })?.code;
      if (
        httpStatus === 400 ||
        httpStatus === 401 ||
        httpStatus === 403 ||
        httpStatus === 404 ||
        code === 'SCHEMA_ERROR'
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useBulkGradeSubmissions(assignmentId: string, classId?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    BatchGradeResult,
    Error,
    Array<{ submissionId: string; score: number; feedback?: string }>
  >({
    mutationFn: (grades) => bulkGradeSubmissions(assignmentId, grades, classId),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...assignmentKeys.all, 'teacher-submissions', assignmentId],
      });
      queryClient.invalidateQueries({
        queryKey: [...assignmentKeys.all, 'my-submission', assignmentId],
      });
      queryClient.invalidateQueries({ queryKey: [...assignmentKeys.all, 'batch-submissions'] });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['assignment-grading-progress', assignmentId] });
    },
  });
}

// ==========================================
// 3. useSubmissionDetail & useSubmissionGrading
// ==========================================

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
