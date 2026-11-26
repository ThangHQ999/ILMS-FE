'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getClassworkContexts, getClassworkPage, getCourseClassGradebook,
} from '../services/classwork.service';

export const classworkKeys = {
  all: ['classwork'] as const,
  contexts: (courseId: string) => ['classwork', 'contexts', courseId] as const,
  scope: (classId: string, courseId: string) => ['classwork', classId, courseId] as const,
  gradebooks: ['classwork-gradebook'] as const,
  gradebook: (classId: string, courseId: string, canManage: boolean, page: number) =>
    ['classwork-gradebook', classId, courseId, canManage, page] as const,
};

export function useClassworkContexts(courseId: string) {
  return useQuery({
    queryKey: classworkKeys.contexts(courseId),
    queryFn: () => getClassworkContexts(courseId),
    enabled: Boolean(courseId),
  });
}

export function useScopedClasswork(
  classId: string, courseId: string, canManage: boolean, page: number,
) {
  return useQuery({
    queryKey: [...classworkKeys.scope(classId, courseId), canManage, page],
    queryFn: () => getClassworkPage(classId, courseId, page),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useCourseClassGradebook(
  classId: string, courseId: string, canManage: boolean, page: number,
) {
  return useQuery({
    queryKey: classworkKeys.gradebook(classId, courseId, canManage, page),
    queryFn: () => getCourseClassGradebook(classId, courseId, page, canManage),
    staleTime: 0,
    refetchOnMount: true,
  });
}
