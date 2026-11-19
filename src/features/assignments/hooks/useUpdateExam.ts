'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExam } from '../services/exam.service';
import { examKeys } from '../constants';
import type { CreateExamInput, ExamItem } from '../schemas/exam.schema';

export function useUpdateExam(classId: string, examId: string) {
  const queryClient = useQueryClient();

  return useMutation<ExamItem, Error, Partial<CreateExamInput>>({
    mutationFn: (dirtyPayload: Partial<CreateExamInput>) =>
      updateExam(examId, dirtyPayload, classId),
    onSuccess: (updatedExam) => {
      queryClient.setQueryData(examKeys.detail(examId), updatedExam);
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}
