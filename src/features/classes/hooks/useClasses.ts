'use client';

import { useQuery } from '@tanstack/react-query';
import { classKeys } from '../constants';
import { getClasses } from '../services/class.service';
import type { ClassFilters, ClassListResponse } from '../types';

export function useClasses(filters: Partial<ClassFilters> = {}) {
  return useQuery<ClassListResponse>({
    queryKey: classKeys.list(filters),
    queryFn: () => getClasses(filters),
    staleTime: 30_000,
  });
}

