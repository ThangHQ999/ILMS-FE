'use client';

import { useQuery } from '@tanstack/react-query';
import { ZodError } from 'zod';
import {
  getAssignmentById,
  getMySubmission,
  getCurrentStudentId,
} from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { AssignmentItem, MySubmission } from '../types';
import type { ApiError } from '@/types/common';

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
    isLocalDemoNotFound,
    isAssignmentNotFound,
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
