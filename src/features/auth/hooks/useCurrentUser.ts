'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe } from '../services/auth.service';
import { authKeys } from '../constants';
import { UserProfile } from '../types';

export function useCurrentUser() {
  return useQuery<UserProfile, Error>({
    queryKey: authKeys.me(),
    queryFn: getMe,
    retry: false,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
