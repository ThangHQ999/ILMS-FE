'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { deleteExam } from '../services/exam.service';
import { examKeys } from '../constants';

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
