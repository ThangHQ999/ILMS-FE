'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classKeys } from '../constants';
import {
  getClasses,
  getClassKpiSummary,
  joinClassByCode,
  leaveClass,
} from '../services/class.service';
import type {
  ClassFilters,
  ClassListResponse,
  ClassKpiSummary,
} from '../types';

export function useClasses(
  filters: Partial<ClassFilters> = {},
  options?: { enabled?: boolean }
) {
  return useQuery<ClassListResponse>({
    queryKey: classKeys.list(filters),
    queryFn: () => getClasses(filters),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}

export function useClassKpiSummary(options?: { enabled?: boolean }) {
  return useQuery<ClassKpiSummary>({
    queryKey: classKeys.kpiSummary(),
    queryFn: () => getClassKpiSummary(),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
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

export function useLeaveClass(options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => leaveClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      options?.onSuccess?.();
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
