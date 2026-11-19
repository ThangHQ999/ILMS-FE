'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAssignmentSubmissionsPaged,
  bulkGradeSubmissions,
} from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type {
  BatchGradeResult,
  TeacherSubmissionListResponse,
} from '../schemas/assignment.schema';

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

function getHttpStatus(error: unknown): number {
  if (!error || typeof error !== 'object') return 0;
  const e = error as { httpStatus?: number; status?: number; response?: { status?: number } };
  return e.httpStatus || e.response?.status || e.status || 0;
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
