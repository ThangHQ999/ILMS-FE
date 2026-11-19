'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ZodError } from 'zod';
import {
  getAssignmentById,
  getMySubmission,
  getCurrentStudentId,
  getClassAssignmentsPaged,
  getAllClassAssignments,
  getMySubmissionsBatch,
  getClassActiveCourses,
  getCourseLessons,
  getAssignmentGradingProgress,
  type AssignmentGradingProgress,
} from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { AssignmentItem, MySubmission } from '../types';
import type {
  AssignmentListResponse,
  ActiveCourseItem,
  CourseLessonItem,
} from '../schemas/assignment.schema';
import type { ApiError } from '@/types/common';

// ==========================================
// 1. Error extraction helpers
// ==========================================

type DetailedError = (Error | ApiError) & {
  httpStatus?: number;
  code?: string;
  response?: { status?: number };
};

function extractHttpStatus(err: unknown): number {
  if (!err || typeof err !== 'object') return 0;
  const e = err as DetailedError;
  return e.httpStatus || e.response?.status || 0;
}

function extractErrorCode(err: unknown): string {
  if (!err || typeof err !== 'object') return '';
  return (err as DetailedError).code || '';
}

function isZodOrSchemaError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof ZodError) return true;
  if (typeof err === 'object' && (err as { name?: string }).name === 'ZodError') return true;
  return extractErrorCode(err) === 'SCHEMA_ERROR';
}

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  const status = extractHttpStatus(error);
  const code = extractErrorCode(error);
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 409 ||
    code === 'LOCAL_DEMO_NOT_FOUND' ||
    isZodOrSchemaError(error)
  ) {
    return false;
  }
  return true;
}

// ==========================================
// 2. useAssignmentDetail
// ==========================================

export function useAssignmentDetail(
  assignmentId: string,
  classId?: string,
  currentStudentId?: string
) {
  const resolvedStudentId =
    currentStudentId || (typeof window !== 'undefined' ? getCurrentStudentId() : '');

  const assignmentQuery = useQuery<AssignmentItem, Error | ApiError>({
    queryKey: [...assignmentKeys.detail(assignmentId), classId ?? ''],
    queryFn: () => getAssignmentById(assignmentId, classId),
    enabled: Boolean(assignmentId),
    staleTime: 60_000,
    retry: shouldRetryQuery,
  });

  // Only query my-submission after assignment detail has been verified and loaded
  const submissionQuery = useQuery<MySubmission, Error | ApiError>({
    queryKey: assignmentKeys.mySubmission(assignmentId, resolvedStudentId, classId),
    queryFn: () => getMySubmission(assignmentId, resolvedStudentId, classId),
    enabled: Boolean(assignmentId) && assignmentQuery.isSuccess,
    staleTime: 30_000,
    retry: shouldRetryQuery,
  });

  const assignment = assignmentQuery.data;
  const submission = submissionQuery.data;

  const assignmentHttpStatus = extractHttpStatus(assignmentQuery.error);
  const submissionHttpStatus = extractHttpStatus(submissionQuery.error);
  const assignmentErrorCode = extractErrorCode(assignmentQuery.error);

  const isLocalDemoNotFound = assignmentErrorCode === 'LOCAL_DEMO_NOT_FOUND';
  const isAssignmentNotFound =
    !isLocalDemoNotFound &&
    (assignmentHttpStatus === 404 || assignmentErrorCode === 'ASSIGNMENT_NOT_FOUND');

  const isUnauthorized =
    assignmentHttpStatus === 401 || submissionHttpStatus === 401;

  const isForbidden =
    assignmentHttpStatus === 403 || submissionHttpStatus === 403;

  const isConflict =
    assignmentHttpStatus === 409 || submissionHttpStatus === 409;

  const isSchemaError =
    isZodOrSchemaError(assignmentQuery.error) || isZodOrSchemaError(submissionQuery.error);

  // Server/network load error (excluding typed domain/client errors)
  const isLoadError =
    (assignmentQuery.isError &&
      !isLocalDemoNotFound &&
      !isAssignmentNotFound &&
      !isUnauthorized &&
      !isForbidden &&
      !isConflict &&
      !isSchemaError) ||
    (submissionQuery.isError &&
      !isUnauthorized &&
      !isForbidden &&
      !isConflict &&
      !isSchemaError &&
      submissionHttpStatus !== 404);

  const isSubmissionLoadError = Boolean(
    assignmentQuery.isSuccess &&
      submissionQuery.isError &&
      !isUnauthorized &&
      !isForbidden &&
      !isConflict &&
      !isSchemaError &&
      submissionHttpStatus !== 404
  );

  // Only conclude NOT_SUBMITTED after assignment loaded successfully AND submission confirmed NOT_SUBMITTED
  const isNotSubmitted = Boolean(
    assignmentQuery.isSuccess &&
      assignment &&
      submissionQuery.isSuccess &&
      submission &&
      submission.status === 'NOT_SUBMITTED'
  );

  const isLoading =
    assignmentQuery.isLoading ||
    (assignmentQuery.isSuccess && submissionQuery.isLoading);

  const isError =
    assignmentQuery.isError ||
    (assignmentQuery.isSuccess && submissionQuery.isError && !isNotSubmitted);

  return {
    assignment,
    submission,
    isNotSubmitted,
    isAssignmentNotFound,
    isLocalDemoNotFound,
    isUnauthorized,
    isForbidden,
    isConflict,
    isSchemaError,
    isLoadError,
    isSubmissionLoadError,
    errorDetails:
      (assignmentQuery.error as DetailedError)?.message ||
      (submissionQuery.error as DetailedError)?.message ||
      null,
    isLoading,
    isError,
    refetch: () => {
      assignmentQuery.refetch();
      if (assignmentQuery.isSuccess) {
        submissionQuery.refetch();
      }
    },
    refetchSubmission: () => submissionQuery.refetch(),
  };
}

// ==========================================
// 3. useAssignmentItem
// ==========================================

export function useAssignmentItem(assignmentId: string, classId?: string) {
  return useQuery<AssignmentItem>({
    queryKey: assignmentKeys.detail(assignmentId),
    queryFn: () => getAssignmentById(assignmentId, classId),
    enabled: Boolean(assignmentId),
    staleTime: 60_000,
  });
}

// ==========================================
// 4. useClassAssignmentsPaged
// ==========================================

export interface UseClassAssignmentsPagedOptions {
  search?: string;
  page?: number;
  size?: number;
  status?: string;
  sort?: string;
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

// ==========================================
// 5. useClassAssignmentsWithSubmissions & KPI
// ==========================================

export interface EnrichedAssignment extends AssignmentItem {
  submission?: MySubmission;
  effectiveStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'RESUBMITTED' | 'LATE' | 'GRADED';
  effectiveScore: number | null;
}

export interface AssignmentKpiStats {
  total: number;
  unsubmitted: number;
  pendingGrading: number;
  graded: number;
  // Aliases for backwards compatibility
  pending: number;
  submitted: number;
  avgScore: number;
}

/**
 * Filter predicate rules:
 * 1. Chưa nộp (unsubmitted): bài chưa nộp
 * 2. Chờ chấm (pendingGrading): bài đã gửi và chưa có điểm
 * 3. Đã chấm (graded): bài đã chấm điểm, kể cả bài được 0 điểm
 * -> 3 nhóm trạng thái hoàn toàn loại trừ nhau (Mutually Exclusive).
 */
export function isAssignmentUnsubmitted(item: EnrichedAssignment): boolean {
  return item.effectiveStatus === 'NOT_SUBMITTED' && item.effectiveScore === null;
}

export function isAssignmentPending(item: EnrichedAssignment): boolean {
  return isAssignmentUnsubmitted(item);
}

export function isAssignmentPendingGrading(item: EnrichedAssignment): boolean {
  return (
    item.effectiveStatus !== 'NOT_SUBMITTED' &&
    item.effectiveStatus !== 'GRADED' &&
    (item.effectiveScore === null || item.effectiveScore === undefined)
  );
}

export function isAssignmentSubmitted(item: EnrichedAssignment): boolean {
  return isAssignmentPendingGrading(item);
}

export function isAssignmentGraded(item: EnrichedAssignment): boolean {
  return (
    item.effectiveStatus === 'GRADED' ||
    (typeof item.effectiveScore === 'number' && item.effectiveScore !== null)
  );
}

export function useClassAssignmentsWithSubmissions(
  classId: string,
  options: { search?: string } = {}
) {
  // 1. Fetch all assignments of this class (size 100 for comprehensive client filtering)
  const assignmentsQuery = useQuery<AssignmentItem[]>({
    queryKey: [...assignmentKeys.lists(), classId, 'all-assignments', options.search || ''],
    queryFn: () => getAllClassAssignments(classId, options),
    staleTime: 30_000,
  });

  const rawAssignments = assignmentsQuery.data || [];
  const assignmentIds = useMemo(() => rawAssignments.map((a) => a.id), [rawAssignments]);

  // 2. Fetch submissions for each assignment
  const submissionsQuery = useQuery<Record<string, MySubmission>>({
    queryKey: [...assignmentKeys.all, 'batch-submissions', classId, assignmentIds.join(',')],
    queryFn: () => getMySubmissionsBatch(assignmentIds),
    enabled: assignmentIds.length > 0,
    staleTime: 30_000,
  });

  const submissionsMap = submissionsQuery.data || {};

  // 3. Combine assignment with my-submission and determine effective status
  const enrichedAssignments: EnrichedAssignment[] = useMemo(() => {
    return rawAssignments.map((a) => {
      const sub = submissionsMap[a.id];

      let effectiveStatus: EnrichedAssignment['effectiveStatus'] = 'NOT_SUBMITTED';
      let effectiveScore: number | null = null;

      if (sub) {
        if (sub.status === 'GRADED' || typeof sub.score === 'number') {
          effectiveStatus = 'GRADED';
          effectiveScore = typeof sub.score === 'number' ? sub.score : null;
        } else if (
          sub.status === 'SUBMITTED' ||
          sub.status === 'RESUBMITTED' ||
          sub.status === 'LATE'
        ) {
          effectiveStatus = sub.status;
        } else {
          effectiveStatus = 'NOT_SUBMITTED';
        }
      } else {
        // Fallback for mock assignments or direct attributes
        if (a.status === 'GRADED') {
          effectiveStatus = 'GRADED';
          effectiveScore = typeof a.studentScore === 'number' ? a.studentScore : null;
        } else if (a.status === 'SUBMITTED') {
          effectiveStatus = 'SUBMITTED';
        } else {
          effectiveStatus = 'NOT_SUBMITTED';
        }
      }

      if (effectiveScore === null && typeof a.studentScore === 'number') {
        effectiveScore = a.studentScore;
      }

      return {
        ...a,
        submission: sub,
        effectiveStatus,
        effectiveScore,
      };
    });
  }, [rawAssignments, submissionsMap]);

  // 4. Calculate synchronized counts & KPI statistics from the EXACT SAME dataset
  const kpiStats: AssignmentKpiStats = useMemo(() => {
    const total = enrichedAssignments.length;
    const unsubmitted = enrichedAssignments.filter(isAssignmentUnsubmitted).length;
    const pendingGrading = enrichedAssignments.filter(isAssignmentPendingGrading).length;
    const graded = enrichedAssignments.filter(isAssignmentGraded).length;

    const scoredItems = enrichedAssignments.filter(
      (a) => isAssignmentGraded(a) && a.effectiveScore !== null
    );

    const avgScore =
      scoredItems.length > 0
        ? Number(
            (
              scoredItems.reduce((acc, curr) => acc + (curr.effectiveScore ?? 0), 0) /
              scoredItems.length
            ).toFixed(1)
          )
        : 0;

    return {
      total,
      unsubmitted,
      pendingGrading,
      graded,
      pending: unsubmitted,
      submitted: pendingGrading,
      avgScore,
    };
  }, [enrichedAssignments]);

  const refetchAll = () => {
    assignmentsQuery.refetch();
    if (assignmentIds.length > 0) {
      submissionsQuery.refetch();
    }
  };

  return {
    assignments: enrichedAssignments,
    kpi: kpiStats,
    isLoading: assignmentsQuery.isLoading,
    isSubmissionsLoading: submissionsQuery.isLoading,
    isError: assignmentsQuery.isError,
    refetch: refetchAll,
  };
}

// ==========================================
// 6. useAssignmentGradingProgress
// ==========================================

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

// ==========================================
// 7. useClassActiveCourses
// ==========================================

export function useClassActiveCourses(classId: string) {
  return useQuery<ActiveCourseItem[]>({
    queryKey: ['classes', classId, 'courses', 'active'],
    queryFn: () => getClassActiveCourses(classId),
    enabled: Boolean(classId),
    staleTime: 5 * 60 * 1000,
  });
}

// ==========================================
// 8. useCourseLessons
// ==========================================

export function useCourseLessons(courseId?: string | null) {
  return useQuery<CourseLessonItem[]>({
    queryKey: ['courses', courseId, 'lessons'],
    queryFn: () => (courseId ? getCourseLessons(courseId) : Promise.resolve([])),
    enabled: Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
}
