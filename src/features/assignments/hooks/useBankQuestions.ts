'use client';

import { useQuery } from '@tanstack/react-query';
import { getBankQuestions } from '../services/exam.service';
import { examKeys } from '../constants';
import type { BankQuestionItem } from '../schemas/exam.schema';

export interface UseBankQuestionsParams {
  courseId?: string;
  search?: string;
  page?: number;
  size?: number;
}

export function useBankQuestions(params: UseBankQuestionsParams = {}) {
  return useQuery<{
    items: BankQuestionItem[];
    totalElements: number;
    totalPages: number;
  }>({
    queryKey: examKeys.bankQuestions(params as Record<string, unknown>),
    queryFn: () => getBankQuestions(params),
  });
}
