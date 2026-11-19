'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { publishExam } from '../services/exam.service';
import { examKeys } from '../constants';
import type { ExamItem } from '../schemas/exam.schema';

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
      const targetId = typeof overrideExamId === 'string' ? overrideExamId : defaultExamId || updatedExam.id;
      queryClient.setQueryData(examKeys.detail(targetId, classId, userId), updatedExam);
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}
