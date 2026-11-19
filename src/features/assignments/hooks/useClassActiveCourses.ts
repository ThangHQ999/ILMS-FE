'use client';

import { useQuery } from '@tanstack/react-query';
import { getClassActiveCourses } from '../services/assignment.service';
import type { ActiveCourseItem } from '../schemas/assignment.schema';

export function useClassActiveCourses(classId: string) {
  return useQuery<ActiveCourseItem[]>({
    queryKey: ['classes', classId, 'courses', 'active'],
    queryFn: () => getClassActiveCourses(classId),
    enabled: Boolean(classId),
    staleTime: 5 * 60 * 1000,
  });
}
