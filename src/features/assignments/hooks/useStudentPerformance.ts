'use client';

import { useQuery } from '@tanstack/react-query';
import { getStudentPerformance } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { StudentPerformance } from '../types';

export function useStudentPerformance(classId: string) {
  return useQuery<StudentPerformance>({
    queryKey: assignmentKeys.studentPerformance(classId),
    queryFn: () => getStudentPerformance(classId),
    staleTime: 60_000,
  });
}

