'use client';

import { useQuery } from '@tanstack/react-query';
import { getCourseLessons } from '../services/assignment.service';
import type { CourseLessonItem } from '../schemas/assignment.schema';

export function useCourseLessons(courseId?: string | null) {
  return useQuery<CourseLessonItem[]>({
    queryKey: ['courses', courseId, 'lessons'],
    queryFn: () => (courseId ? getCourseLessons(courseId) : Promise.resolve([])),
    enabled: Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
}
