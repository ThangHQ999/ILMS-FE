'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExamQuestion } from '../services/exam.service';
import { examKeys } from '../constants';
import type { UpdateExamQuestionInput, ExamQuestionItem } from '../schemas/exam.schema';

export interface UpdateQuestionMutationArgs {
  questionRelationId: string;
  input: UpdateExamQuestionInput;
}

export function useUpdateExamQuestion(examId: string) {
  const queryClient = useQueryClient();

  return useMutation<ExamQuestionItem, Error, UpdateQuestionMutationArgs>({
    mutationFn: ({ questionRelationId, input }: UpdateQuestionMutationArgs) =>
      updateExamQuestion(examId, questionRelationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.questions(examId) });
    },
  });
}
