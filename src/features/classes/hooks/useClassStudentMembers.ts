'use client';

import { useQuery } from '@tanstack/react-query';
import { getClassStudentMembers } from '../services/grade-report.service';
import { classGradeReportKeys } from './useClassGradeReports';

export function useClassStudentMembers(classId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: classGradeReportKeys.members(classId),
    queryFn: () => getClassStudentMembers(classId),
    enabled: options?.enabled ?? Boolean(classId),
    staleTime: 1000 * 60 * 5,
  });
}
