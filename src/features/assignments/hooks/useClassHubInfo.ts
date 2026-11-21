'use client';

import { useQuery } from '@tanstack/react-query';
import { getClassHubInfo } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { ClassHubInfo } from '../types';

export function useClassHubInfo(classId: string) {
  return useQuery<ClassHubInfo>({
    queryKey: assignmentKeys.classHubInfo(classId),
    queryFn: () => getClassHubInfo(classId),
    staleTime: 60_000,
  });
}

