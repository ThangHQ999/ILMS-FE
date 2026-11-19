'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe } from '../services/auth.service';
import { authKeys } from '../constants';
import { UserProfile } from '../types';
import {
  isPreviewModeEnabled,
  getDemoUser,
  PREVIEW_STORAGE_KEY,
  PREVIEW_CHANGE_EVENT,
} from '@/lib/preview';
import { globalRoleStore, ROLE_STORAGE_KEY, ROLE_CHANGE_EVENT } from '@/lib/role-store';
import type { ActiveRole } from '@/constants/roles';

export function useCurrentUser() {
  const [isMounted, setIsMounted] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [roleOverride, setRoleOverride] = useState<ActiveRole | null>(null);

  // Initialize and synchronize preview and role state across components and tabs
  useEffect(() => {
    setIsMounted(true);
    setIsPreview(isPreviewModeEnabled());
    setRoleOverride(globalRoleStore.getSnapshot());

    const onPreviewChange = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setIsPreview(custom.detail ?? isPreviewModeEnabled());
    };

    const onRoleChange = (e: Event) => {
      const custom = e as CustomEvent<ActiveRole | null>;
      setRoleOverride(custom.detail);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === PREVIEW_STORAGE_KEY) {
        setIsPreview(e.newValue === 'true');
      }
      if (e.key === ROLE_STORAGE_KEY) {
        setRoleOverride((e.newValue as ActiveRole | null) || null);
      }
    };

    window.addEventListener(PREVIEW_CHANGE_EVENT, onPreviewChange);
    window.addEventListener(ROLE_CHANGE_EVENT, onRoleChange);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(PREVIEW_CHANGE_EVENT, onPreviewChange);
      window.removeEventListener(ROLE_CHANGE_EVENT, onRoleChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // When preview mode is active, do NOT call real getMe API
  const query = useQuery<UserProfile, Error>({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled: isMounted ? !isPreview : false,
    retry: false,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const queryClient = useQueryClient();

  // Populate client-stored user after mount (for real mode)
  useEffect(() => {
    if (isMounted && !isPreview && !query.data && typeof window !== 'undefined') {
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
  }, [isMounted, isPreview, query.data, queryClient]);

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

  // Preview Mode: return virtual demo identity synchronously
  if (isPreview) {
    const demoUser = getDemoUser(roleOverride) as unknown as UserProfile;
    return {
      ...query,
      data: demoUser,
      isLoading: false,
      isPending: false,
      isError: false,
      isSuccess: true,
      status: 'success' as const,
      error: null,
      refetch: async () => ({
        data: demoUser,
        isLoading: false,
        isError: false,
        isSuccess: true,
        status: 'success' as const,
      }),
    };
  }

  return query;
}
