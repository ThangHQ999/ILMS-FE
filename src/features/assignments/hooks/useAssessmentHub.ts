'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getHubClasses,
  getHubClassCourses,
  getUnifiedAssessments,
  publishHubItem,
} from '../services/assessment-hub.service';
import type {
  AssessmentHubKpi,
  HubClassSummary,
  HubCourseOption,
  UnifiedAssessmentItem,
} from '../schemas/assessment-hub.schema';

export const assessmentHubKeys = {
  all: ['assessment-hub'] as const,
  classes: () => [...assessmentHubKeys.all, 'classes'] as const,
  courses: (classId: string) => [...assessmentHubKeys.all, 'courses', classId] as const,
  list: (mode: 'STUDENT' | 'TEACHER', classIds: string[]) =>
    [...assessmentHubKeys.all, 'list', mode, classIds.join(',')] as const,
};

export function useAssessmentHub(
  mode: 'STUDENT' | 'TEACHER',
  selectedClassId: string = 'ALL'
) {
  const queryClient = useQueryClient();

  const classesQuery = useQuery<HubClassSummary[]>({
    queryKey: assessmentHubKeys.classes(),
    queryFn: () => getHubClasses(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const allClasses = classesQuery.data ?? [];

  const teachingClasses = useMemo(
    () => allClasses.filter((c) => c.teachingRole !== 'STUDENT'),
    [allClasses]
  );

  const enrolledClasses = useMemo(
    () => allClasses.filter((c) => c.teachingRole === 'STUDENT'),
    [allClasses]
  );

  const modeClasses = useMemo(
    () => (mode === 'TEACHER' ? teachingClasses : enrolledClasses),
    [mode, teachingClasses, enrolledClasses]
  );

  const targetClasses = useMemo(() => {
    if (selectedClassId && selectedClassId !== 'ALL') {
      return modeClasses.filter((c) => c.id === selectedClassId);
    }
    return modeClasses;
  }, [modeClasses, selectedClassId]);

  const coursesQuery = useQuery<HubCourseOption[]>({
    queryKey: assessmentHubKeys.courses(selectedClassId),
    queryFn: () => getHubClassCourses(selectedClassId),
    enabled: Boolean(selectedClassId && selectedClassId !== 'ALL'),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const targetClassIds = useMemo(() => targetClasses.map((c) => c.id), [targetClasses]);

  const assessmentsQuery = useQuery<UnifiedAssessmentItem[]>({
    queryKey: assessmentHubKeys.list(mode, targetClassIds),
    queryFn: () => getUnifiedAssessments(targetClasses, mode),
    enabled: classesQuery.isSuccess && targetClasses.length > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const items = assessmentsQuery.data ?? [];

  const kpi = useMemo<AssessmentHubKpi>(() => {
    const todoCount = items.filter((i) => i.status === 'TODO').length;
    const overdueCount = items.filter((i) => i.status === 'OVERDUE').length;
    const submittedCount = items.filter((i) => i.status === 'SUBMITTED').length;
    const gradedItems = items.filter(
      (i) => i.status === 'GRADED' && typeof i.studentScore === 'number'
    );
    const averageScore =
      gradedItems.length > 0
        ? Number(
            (
              gradedItems.reduce((sum, i) => sum + (i.studentScore ?? 0), 0) /
              gradedItems.length
            ).toFixed(1)
          )
        : null;

    const pendingGradingCount = items.filter((i) => i.status === 'NEEDS_GRADING').length;
    const openCount = items.filter((i) => i.status === 'OPEN').length;
    const draftCount = items.filter((i) => i.status === 'DRAFT').length;

    return {
      todoCount,
      overdueCount,
      submittedCount,
      gradedCount: items.filter((i) => i.status === 'GRADED').length,
      averageScore,
      pendingGradingCount,
      openCount,
      draftCount,
      totalCount: items.length,
      assignmentCount: items.filter((i) => i.kind === 'ASSIGNMENT').length,
      quizCount: items.filter((i) => i.kind === 'QUIZ').length,
      examCount: items.filter((i) => i.kind === 'EXAM').length,
    };
  }, [items]);

  const publishMutation = useMutation({
    mutationFn: ({ kind, id }: { kind: 'QUIZ' | 'EXAM'; id: string }) =>
      publishHubItem(kind, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentHubKeys.all });
    },
  });

  return {
    allClasses,
    teachingClasses,
    enrolledClasses,
    modeClasses,
    courses: coursesQuery.data ?? [],
    isLoadingCourses: coursesQuery.isLoading,
    items,
    kpi,
    isLoading: classesQuery.isLoading || (targetClasses.length > 0 && assessmentsQuery.isLoading),
    isFetching: classesQuery.isFetching || assessmentsQuery.isFetching,
    isError: classesQuery.isError || assessmentsQuery.isError,
    error: classesQuery.error || assessmentsQuery.error,
    refetch: () => {
      void classesQuery.refetch();
      void assessmentsQuery.refetch();
    },
    publishMutation,
  };
}
