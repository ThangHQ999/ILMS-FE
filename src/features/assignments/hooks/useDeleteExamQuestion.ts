'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExamQuestion } from '../services/exam.service';
import { examKeys } from '../constants';

export function useDeleteExamQuestion(examId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (questionRelationId: string) =>
      deleteExamQuestion(examId, questionRelationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.questions(examId) });
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}
