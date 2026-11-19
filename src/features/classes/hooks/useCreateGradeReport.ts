'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGradeReport } from '../services/grade-report.service';
import { classGradeReportKeys } from './useClassGradeReports';
import type { CreateGradeReportInput } from '../schemas/grade-report.schema';

export function useCreateGradeReport(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGradeReportInput) => createGradeReport(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classGradeReportKeys.all });
    },
  });
}
