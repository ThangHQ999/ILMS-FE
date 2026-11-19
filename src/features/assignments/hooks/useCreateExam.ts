'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExam } from '../services/exam.service';
import { examKeys } from '../constants';
import type { CreateExamInput, ExamItem } from '../schemas/exam.schema';

export function useCreateExam(classId: string) {
  const queryClient = useQueryClient();

  return useMutation<ExamItem, Error, CreateExamInput>({
    mutationFn: (input: CreateExamInput) => createExam(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}
