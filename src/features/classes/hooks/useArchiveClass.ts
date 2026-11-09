'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classKeys } from '../constants';
import { archiveClass, restoreClass } from '../services/class.service';

export function useArchiveClass() {
  const queryClient = useQueryClient();

  const archiveMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => archiveClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });

  const restoreMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => restoreClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });

  return {
    archiveClass: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,
    restoreClass: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
  };
}

