'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classKeys } from '../constants';
import { joinClassByCode } from '../services/class.service';

export function useJoinClass() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (classCode: string) => joinClassByCode(classCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

