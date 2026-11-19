'use client';

import { useQuery } from '@tanstack/react-query';
import { getExamQuestions } from '../services/exam.service';
import { examKeys } from '../constants';
import type { ExamQuestionItem } from '../schemas/exam.schema';

function getErrorHttpStatus(error: unknown): number {
  if (!error || typeof error !== 'object') return 0;
  const errObj = error as {
    httpStatus?: number;
    status?: number;
    response?: { status?: number };
  };
  return errObj.httpStatus || errObj.response?.status || errObj.status || 0;
}

export function useExamQuestions(
  examId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ExamQuestionItem[]>({
    queryKey: examKeys.questions(examId),
    queryFn: () => getExamQuestions(examId),
    enabled: Boolean(examId) && (options?.enabled ?? true),
    retry: (failureCount, error) => {
      const status = getErrorHttpStatus(error);
      if (status === 401 || status === 403 || status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
