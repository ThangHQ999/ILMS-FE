'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe } from '../services/auth.service';
import { authKeys } from '../constants';
import { UserProfile } from '../types';

export function useCurrentUser() {
  return useQuery<UserProfile, Error>({
    queryKey: authKeys.me(),
    queryFn: getMe,
    initialData: () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('ilms_user');
        if (stored) {
          try {
            return JSON.parse(stored) as UserProfile;
          } catch {
            return undefined;
          }
        }
      }
      return undefined;
    },
    retry: false,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
