'use client';

import { useQuery } from '@tanstack/react-query';
import { getClassGradeReports } from '../services/grade-report.service';

export const classGradeReportKeys = {
  all: ['class-grade-reports'] as const,
  list: (classId: string, params: { search?: string; page?: number; size?: number; sort?: string }) =>
    [...classGradeReportKeys.all, classId, params] as const,
  detail: (classId: string, studentId: string) =>
    [...classGradeReportKeys.all, classId, 'users', studentId] as const,
  members: (classId: string) => [...classGradeReportKeys.all, classId, 'student-members'] as const,
};

export function useClassGradeReports(
  classId: string,
  params: { search?: string; page?: number; size?: number; sort?: string } = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: classGradeReportKeys.list(classId, params),
    queryFn: () => getClassGradeReports(classId, params),
    enabled: options?.enabled ?? Boolean(classId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
