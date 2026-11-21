'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe } from '../services/auth.service';
import { authKeys } from '../constants';
import { UserProfile } from '../types';
import { globalRoleStore, ROLE_STORAGE_KEY, ROLE_CHANGE_EVENT } from '@/lib/role-store';
import type { ActiveRole } from '@/constants/roles';

export function useCurrentUser() {
  const [isMounted, setIsMounted] = useState(false);
  const [roleOverride, setRoleOverride] = useState<ActiveRole | null>(null);

  // Initialize and synchronize role state across components and tabs
  useEffect(() => {
    setIsMounted(true);
    setRoleOverride(globalRoleStore.getSnapshot());

    // Permanently remove any legacy preview mode flag from localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ilms_preview_mode');
      }
    } catch {
      // ignore
    }

    const onRoleChange = (e: Event) => {
      const custom = e as CustomEvent<ActiveRole | null>;
      setRoleOverride(custom.detail);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === ROLE_STORAGE_KEY) {
        setRoleOverride((e.newValue as ActiveRole | null) || null);
      }
    };

    window.addEventListener(ROLE_CHANGE_EVENT, onRoleChange);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(ROLE_CHANGE_EVENT, onRoleChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const query = useQuery<UserProfile, Error>({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled: isMounted,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const queryClient = useQueryClient();

  // Populate client-stored user after mount
  useEffect(() => {
    if (isMounted && !query.data && typeof window !== 'undefined') {
      const stored = localStorage.getItem('ilms_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as UserProfile;
          queryClient.setQueryData(authKeys.me(), parsed);
        } catch {
          // ignore
        }
      }
    }
  }, [isMounted, query.data, queryClient]);

  // Before mount: return loading state to preserve SSR & client hydration match
  if (!isMounted) {
    return {
      ...query,
      data: undefined,
      isLoading: true,
      isPending: true,
      isError: false,
      error: null,
      status: 'pending' as const,
    };
  }

  return query;
}
