'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socraticKeys } from '../constants';
import {
  getSessions,
  getSessionDetail,
  updateSession,
  deleteSession,
} from '../services/socratic-chat.service';
import {
  PaginatedSessions,
  SocraticSessionDetail,
  SocraticSessionSidebarItem,
  SessionUpdateRequest,
  SessionDeleteResult,
} from '../types';

export function useSocraticSessions(params?: {
  pageNumber?: number;
  pageSize?: number;
  subject?: string;
}) {
  return useQuery<PaginatedSessions, Error>({
    queryKey: socraticKeys.sessions(params),
    queryFn: () => getSessions(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useSocraticSessionDetail(sessionId: string | null) {
  return useQuery<SocraticSessionDetail, Error>({
    queryKey: socraticKeys.detail(sessionId || ''),
    queryFn: () => getSessionDetail(sessionId!),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache for instant switching
  });
}

export function useUpdateSocraticSession() {
  const queryClient = useQueryClient();

  return useMutation<
    SocraticSessionSidebarItem,
    Error,
    { sessionId: string; payload: SessionUpdateRequest }
  >({
    mutationFn: ({ sessionId, payload }) => updateSession(sessionId, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: socraticKeys.all });
      queryClient.setQueryData(
        socraticKeys.detail(updated.id),
        (prev: SocraticSessionDetail | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            title: updated.title,
            is_completed: updated.is_completed,
            current_step_number: updated.current_step_number,
            updated_at: updated.updated_at,
          };
        }
      );
    },
  });
}

export function useDeleteSocraticSession() {
  const queryClient = useQueryClient();

  return useMutation<SessionDeleteResult, Error, string>({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: socraticKeys.all });
      queryClient.removeQueries({ queryKey: socraticKeys.detail(sessionId) });
    },
  });
}
