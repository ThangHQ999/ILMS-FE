'use client';

import { useQuery } from '@tanstack/react-query';
import { ZodError } from 'zod';
import { useCurrentUser } from '@/features/auth';
import { fetchAllClassExams, type GetClassExamsOptions } from '../services/exam.service';
import { examKeys } from '../constants';
import type { ExamItem } from '../schemas/exam.schema';

function shouldRetryAllExams(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  if (error instanceof ZodError) return false;
  if (error && typeof error === 'object') {
    const e = error as { httpStatus?: number; code?: string; response?: { status?: number }; name?: string };
    const status = e.httpStatus || e.response?.status || 0;
    if (status === 400 || status === 401 || status === 403 || status === 404 || e.code === 'SCHEMA_ERROR' || e.name === 'ZodError') {
      return false;
    }
  }
  return true;
}

export function useAllClassExams(
  classId: string,
  options: Omit<GetClassExamsOptions, 'page' | 'size' | 'search'> = {},
  enabled: boolean = true
) {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id ? String(currentUser.id) : '';

  return useQuery<ExamItem[]>({
    queryKey: [...examKeys.list(classId, options as Record<string, unknown>, userId), 'all'],
    queryFn: () => fetchAllClassExams(classId, options),
    enabled: Boolean(classId) && enabled,
    staleTime: 60_000,
    retry: shouldRetryAllExams,
  });
}
