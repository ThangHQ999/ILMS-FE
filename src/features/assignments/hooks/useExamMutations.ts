'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import {
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  unpublishExam,
} from '../services/exam.service';
import { examKeys } from '../constants';
import type { CreateExamInput, ExamItem } from '../schemas/exam.schema';

// ==========================================
// 1. useCreateExam
// ==========================================

export function useCreateExam(classId: string) {
  const queryClient = useQueryClient();

  return useMutation<ExamItem, Error, CreateExamInput>({
    mutationFn: (input: CreateExamInput) => createExam(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

// ==========================================
// 2. useUpdateExam
// ==========================================

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

// ==========================================
// 3. useDeleteExam
// ==========================================

export function useDeleteExam(classId: string) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id || '';

  return useMutation<void, Error, string>({
    mutationFn: (examId: string) => deleteExam(examId, classId),
    onSuccess: (_data, examId) => {
      queryClient.removeQueries({
        queryKey: examKeys.detail(examId, classId, userId),
      });
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

// ==========================================
// 4. usePublishExam
// ==========================================

export function usePublishExam(classId: string, defaultExamId?: string) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id || '';

  return useMutation<ExamItem, Error, string | void>({
    mutationFn: (overrideExamId?: string | void) => {
      const targetId = typeof overrideExamId === 'string' ? overrideExamId : defaultExamId;
      if (!targetId) {
        return Promise.reject(new Error('Missing examId for publish'));
      }
      return publishExam(targetId, classId);
    },
    onSuccess: (updatedExam, overrideExamId) => {
      const targetId =
        typeof overrideExamId === 'string' ? overrideExamId : defaultExamId || updatedExam.id;
      queryClient.setQueryData(examKeys.detail(targetId, classId, userId), updatedExam);
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

// ==========================================
// 5. useUnpublishExam
// ==========================================

export function useUnpublishExam(classId: string, defaultExamId?: string) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id || '';

  return useMutation<ExamItem, Error, string | void>({
    mutationFn: (overrideExamId?: string | void) => {
      const targetId = typeof overrideExamId === 'string' ? overrideExamId : defaultExamId;
      if (!targetId) {
        return Promise.reject(new Error('Missing examId for unpublish'));
      }
      return unpublishExam(targetId, classId);
    },
    onSuccess: (updatedExam, overrideExamId) => {
      const targetId =
        typeof overrideExamId === 'string' ? overrideExamId : defaultExamId || updatedExam.id;
      queryClient.setQueryData(examKeys.detail(targetId, classId, userId), updatedExam);
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}
