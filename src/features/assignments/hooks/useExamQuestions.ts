'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExamQuestions,
  getBankQuestions,
  addExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
} from '../services/exam.service';
import { examKeys } from '../constants';
import type {
  ExamQuestionItem,
  BankQuestionItem,
  AddExamQuestionInput,
  UpdateExamQuestionInput,
} from '../schemas/exam.schema';

// ==========================================
// 1. Error helper
// ==========================================

function getErrorHttpStatus(error: unknown): number {
  if (!error || typeof error !== 'object') return 0;
  const errObj = error as {
    httpStatus?: number;
    status?: number;
    response?: { status?: number };
  };
  return errObj.httpStatus || errObj.response?.status || errObj.status || 0;
}

// ==========================================
// 2. useExamQuestions
// ==========================================

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

// ==========================================
// 3. useBankQuestions
// ==========================================

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

// ==========================================
// 4. useAddExamQuestion
// ==========================================

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

// ==========================================
// 5. useUpdateExamQuestion
// ==========================================

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

// ==========================================
// 6. useDeleteExamQuestion
// ==========================================

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
