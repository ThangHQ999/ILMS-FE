'use client';

import { useQuery } from '@tanstack/react-query';
import { getMySubmission } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { MySubmission } from '../types';

export function useMySubmission(assignmentId?: string) {
  return useQuery<MySubmission>({
    queryKey: assignmentKeys.mySubmission(assignmentId || ''),
    queryFn: () => getMySubmission(assignmentId || ''),
    enabled: Boolean(assignmentId),
    staleTime: 30_000,
  });
}
