'use client';

import { useQuery } from '@tanstack/react-query';
import { getExamById } from '../services/exam.service';
import { examKeys } from '../constants';
import type { ExamItem } from '../schemas/exam.schema';

export function useExamDetail(examId: string, classId?: string) {
  return useQuery<ExamItem>({
    queryKey: examKeys.detail(examId, classId),
    queryFn: () => getExamById(examId, classId),
    enabled: Boolean(examId),
    refetchOnWindowFocus: true,
  });
}
