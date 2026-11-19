'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyGradeReport } from '../services/grade-report.service';

export const gradeReportKeys = {
  all: ['grade-reports'] as const,
  my: (classId: string) => [...gradeReportKeys.all, 'me', classId] as const,
};

export function useMyGradeReport(classId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gradeReportKeys.my(classId),
    queryFn: () => getMyGradeReport(classId),
    enabled: options?.enabled ?? Boolean(classId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Do not retry on 404 or 403
      const status =
        (error as { status?: number; httpStatus?: number })?.status ||
        (error as { status?: number; httpStatus?: number })?.httpStatus;
      if (status === 404 || status === 403) return false;
      return failureCount < 2;
    },
  });
}
