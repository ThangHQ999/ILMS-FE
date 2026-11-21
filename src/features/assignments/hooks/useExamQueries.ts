'use client';

import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { ZodError } from 'zod';
import { useCurrentUser } from '@/features/auth';
import {
  getClassExamsPaged,
  fetchAllClassExams,
  getExamById,
  type GetClassExamsOptions,
} from '../services/exam.service';
import { examKeys } from '../constants';
import type { ExamListResponse } from '../types';
import type { ExamItem } from '../schemas/exam.schema';

// ==========================================
// 1. Retry helper
// ==========================================

function shouldRetryExamQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  if (error instanceof ZodError) return false;
  if (error && typeof error === 'object') {
    const e = error as {
      httpStatus?: number;
      code?: string;
      response?: { status?: number };
      name?: string;
    };
    const status = e.httpStatus || e.response?.status || 0;
    if (
      status === 400 ||
      status === 401 ||
      status === 403 ||
      status === 404 ||
      e.code === 'SCHEMA_ERROR' ||
      e.name === 'ZodError'
    ) {
      return false;
    }
  }
  return true;
}

// ==========================================
// 2. useClassExamsPaged
// ==========================================

export function useClassExamsPaged(
  classId: string,
  options: GetClassExamsOptions = {},
  enabled: boolean = true
) {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id ? String(currentUser.id) : '';

  return useQuery<ExamListResponse>({
    queryKey: [...examKeys.list(classId, options as Record<string, unknown>, userId), 'paged'],
    queryFn: () => getClassExamsPaged(classId, options),
    enabled: Boolean(classId) && enabled,
    staleTime: 30_000,
    retry: shouldRetryExamQuery,
  });
}

// ==========================================
// 3. useAllClassExams
// ==========================================

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
    retry: shouldRetryExamQuery,
  });
}

// ==========================================
// 4. useExamDetail
// ==========================================

export function useExamDetail(examId: string, classId?: string) {
  return useQuery<ExamItem>({
    queryKey: examKeys.detail(examId, classId),
    queryFn: () => getExamById(examId, classId),
    enabled: Boolean(examId),
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 5. useVisibleExamDetails
// ==========================================

// Bounded concurrency queue (max 3 concurrent GET /api/v1/exams/{id} requests)
const MAX_CONCURRENT_DETAIL_REQUESTS = 3;
let activeDetailRequests = 0;
const detailWaitQueue: Array<() => void> = [];

async function fetchExamDetailThrottled(examId: string, classId?: string): Promise<ExamItem> {
  if (activeDetailRequests >= MAX_CONCURRENT_DETAIL_REQUESTS) {
    await new Promise<void>((resolve) => {
      detailWaitQueue.push(resolve);
    });
  }
  activeDetailRequests++;
  try {
    return await getExamById(examId, classId);
  } finally {
    activeDetailRequests--;
    const next = detailWaitQueue.shift();
    if (next) next();
  }
}

export interface VisibleExamDetailEntry {
  data?: ExamItem;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Fetches GET /api/v1/exams/{examId} ONLY for visible exams on the current page (max 5),
 * using per-exam TanStack Query cache partitioned by userId + classId + examId,
 * with bounded concurrency (max 3 concurrent requests).
 */
export function useVisibleExamDetails(
  examIds: string[],
  classId: string
): Record<string, VisibleExamDetailEntry> {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id ? String(currentUser.id) : '';

  const uniqueIds = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const id of examIds) {
      if (id && !seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
    return out;
  }, [examIds]);

  const results = useQueries({
    queries: uniqueIds.map((examId) => ({
      queryKey: examKeys.detail(examId, classId, userId),
      queryFn: () => fetchExamDetailThrottled(examId, classId),
      enabled: Boolean(examId && classId),
      staleTime: 60_000,
      retry: shouldRetryExamQuery,
    })),
  });

  return useMemo(() => {
    const map: Record<string, VisibleExamDetailEntry> = {};
    uniqueIds.forEach((id, idx) => {
      const q = results[idx];
      map[id] = {
        data: q?.data,
        isLoading: Boolean(q?.isLoading),
        isError: Boolean(q?.isError),
        refetch: () => {
          q?.refetch();
        },
      };
    });
    return map;
  }, [uniqueIds, results]);
}
