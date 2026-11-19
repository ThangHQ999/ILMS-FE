'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getAllClassAssignments,
  getMySubmissionsBatch,
} from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { AssignmentItem, MySubmission } from '../types';

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
 * Filter predicate rules as requested:
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
