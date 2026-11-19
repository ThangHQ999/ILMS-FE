'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStudentGradeReport } from '../services/grade-report.service';
import { classGradeReportKeys } from './useClassGradeReports';
import type { UpdateGradeReportInput } from '../schemas/grade-report.schema';

export function useUpdateStudentGrade(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      dirtyPayload,
    }: {
      studentId: string;
      dirtyPayload: Partial<UpdateGradeReportInput>;
    }) => updateStudentGradeReport(classId, studentId, dirtyPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classGradeReportKeys.all });
    },
  });
}
