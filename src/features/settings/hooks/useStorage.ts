'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStorageSummary,
  getStorageBreakdown,
  getStorageFiles,
  deleteStorageFile,
} from '../services/storage.service';
import type { StorageFilesFilter } from '../schemas/storage.schema';

export const storageKeys = {
  all: ['storage'] as const,
  summary: () => [...storageKeys.all, 'summary'] as const,
  breakdown: () => [...storageKeys.all, 'breakdown'] as const,
  files: (filters?: StorageFilesFilter) => [...storageKeys.all, 'files', filters] as const,
};

export function useStorageSummary() {
  return useQuery({
    queryKey: storageKeys.summary(),
    queryFn: getStorageSummary,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useStorageBreakdown() {
  return useQuery({
    queryKey: storageKeys.breakdown(),
    queryFn: getStorageBreakdown,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useStorageFiles(filters?: StorageFilesFilter) {
  return useQuery({
    queryKey: storageKeys.files(filters),
    queryFn: () => getStorageFiles(filters),
  });
}

export function useDeleteStorageFile(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (materialId: string) => deleteStorageFile(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageKeys.all });
      onSuccessCallback?.();
    },
  });
}
