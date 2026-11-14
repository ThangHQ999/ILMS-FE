'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
  addQuestionToQuiz,
  addQuestionsBatchToQuiz,
  generateQuizByAi,
  getProctorSessions,
  logProctorEvent,
  getQuizComplaints,
  resolveComplaint,
  getQuizAnalytics,
  getQuizStatsSummary,
  searchQuestionBank,
  QuizQueryParams,
  QuestionBankQueryParams,
} from '../services/quiz.service';
import { quizKeys } from '../constants';
import type {
  QuizItem,
  QuizStatsSummary,
  QuizRequestDTO,
  QuestionResponseDTO,
  BatchQuizQuestionRequestDTO,
  QuizGenerateAiRequestDTO,
  ProctorSessionDTO,
  ProctorViolationEventDTO,
  QuizComplaintDTO,
  ResolveComplaintRequestDTO,
  QuizAnalyticsDTO,
} from '../schemas/quiz.schema';

export function useQuizzes(params: QuizQueryParams = {}) {
  return useQuery<QuizItem[]>({
    queryKey: quizKeys.list(params.classId, params as Record<string, unknown>),
    queryFn: () => getQuizzes(params),
    staleTime: 60_000,
  });
}

export function useQuizDetail(id: string) {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => getQuizById(id),
    enabled: !!id,
  });
}

export function useQuizStats(classId: string = 'cs-202') {
  return useQuery<QuizStatsSummary>({
    queryKey: quizKeys.stats(classId),
    queryFn: () => getQuizStatsSummary(classId),
    staleTime: 60_000,
  });
}

export function useQuestionBank(params: QuestionBankQueryParams = {}) {
  return useQuery<QuestionResponseDTO[]>({
    queryKey: quizKeys.questionBank(params as Record<string, unknown>),
    queryFn: () => searchQuestionBank(params),
    staleTime: 120_000,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuizRequestDTO) => createQuiz(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
    },
  });
}

export function usePublishQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
    },
  });
}

export function useUnpublishQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unpublishQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
    },
  });
}

export function useBatchAddQuestions(quizId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BatchQuizQuestionRequestDTO) => addQuestionsBatchToQuiz(quizId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
}

export function useGenerateQuizAi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuizGenerateAiRequestDTO) => generateQuizByAi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
    },
  });
}

export function useProctorSessions(quizId: string) {
  return useQuery<ProctorSessionDTO[]>({
    queryKey: quizKeys.proctor(quizId),
    queryFn: () => getProctorSessions(quizId),
    refetchInterval: 5_000, // Live poll every 5s for room monitoring
  });
}

export function useLogProctorEvent(quizId: string) {
  return useMutation({
    mutationFn: (payload: ProctorViolationEventDTO) => logProctorEvent(quizId, payload),
  });
}

export function useQuizComplaints(quizId: string = 'all') {
  return useQuery<QuizComplaintDTO[]>({
    queryKey: quizKeys.complaints(quizId),
    queryFn: () => getQuizComplaints(quizId),
    staleTime: 30_000,
  });
}

export function useResolveComplaint(quizId: string = 'all') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      complaintId,
      payload,
    }: {
      complaintId: string;
      payload: ResolveComplaintRequestDTO;
    }) => resolveComplaint(complaintId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.complaints(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
    },
  });
}

export function useQuizAnalytics(quizId: string) {
  return useQuery<QuizAnalyticsDTO>({
    queryKey: quizKeys.analytics(quizId),
    queryFn: () => getQuizAnalytics(quizId),
    staleTime: 60_000,
  });
}
