'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classKeys } from '../constants';
import {
  getClasses,
  getClassKpiSummary,
  joinClassByCode,
} from '../services/class.service';
import type {
  ClassFilters,
  ClassListResponse,
  ClassKpiSummary,
} from '../types';

export function useClasses(filters: Partial<ClassFilters> = {}) {
  return useQuery<ClassListResponse>({
    queryKey: classKeys.list(filters),
    queryFn: () => getClasses(filters),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useClassKpiSummary() {
  return useQuery<ClassKpiSummary>({
    queryKey: classKeys.kpiSummary(),
    queryFn: () => getClassKpiSummary(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

export function useJoinClassByCode(options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classCode: string) => joinClassByCode(classCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      options?.onSuccess?.();
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
