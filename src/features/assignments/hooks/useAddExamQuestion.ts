'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addExamQuestion } from '../services/exam.service';
import { examKeys } from '../constants';
import type { AddExamQuestionInput, ExamQuestionItem } from '../schemas/exam.schema';

export function useAddExamQuestion(examId: string) {
  const queryClient = useQueryClient();

  return useMutation<ExamQuestionItem, Error, AddExamQuestionInput>({
    mutationFn: (input: AddExamQuestionInput) => addExamQuestion(examId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.questions(examId) });
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}
