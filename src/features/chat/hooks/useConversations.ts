'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/sonner';
import { useCurrentUser } from '@/features/auth';
import { getUserFriendlyErrorMessage } from '@/lib/error-utils';
import { chatKeys } from '../constants/chat-query-keys';
import type {
  CreateDirectConversationInput,
  CreateStudyGroupInput,
} from '../schemas/chat.schema';
import {
  createDirectConversation,
  createStudyGroup,
  getClassChannel,
  getConversationById,
  getConversationMembers,
  getConversations,
  getUnreadSummary,
  searchChatUsers,
} from '../services/chat.service';

export function useChatUnreadCount() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: async () => {
      try {
        return await getUnreadSummary();
      } catch {
        return { totalUnreadMessages: 0, unreadConversationCount: 0 };
      }
    },
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    retry: false,
  });
}

export function useConversations(
  params?: {
    type?: string;
    unreadOnly?: boolean;
    q?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: chatKeys.conversations(params),
    queryFn: () => getConversations(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });
}

export function useConversationDetail(id?: string | null) {
  return useQuery({
    queryKey: chatKeys.conversation(id ?? ''),
    queryFn: () => getConversationById(id!),
    enabled: Boolean(id),
    staleTime: 20_000,
  });
}

export function useConversationMembers(conversationId?: string | null) {
  return useQuery({
    queryKey: chatKeys.members(conversationId ?? ''),
    queryFn: () => getConversationMembers(conversationId!),
    enabled: Boolean(conversationId),
    staleTime: 30_000,
  });
}

export function useClassChannel(classId?: string | null) {
  return useQuery({
    queryKey: [...chatKeys.all, 'class-channel', classId ?? ''],
    queryFn: () => getClassChannel(classId!),
    enabled: Boolean(classId),
    staleTime: 10_000,
    retry: false,
  });
}

export function useChatUserSearch(q: string, enabled = true) {
  const hasQuery = q.trim().length >= 1;
  return useQuery({
    queryKey: chatKeys.userSearch(q),
    queryFn: () => searchChatUsers(q),
    enabled: enabled && hasQuery,
    placeholderData: hasQuery ? keepPreviousData : undefined,
    staleTime: 15_000,
  });
}

export function useCreateDirectConversation() {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (payload: CreateDirectConversationInput) =>
      createDirectConversation(payload),
    onSuccess: (conv) => {
      queryClient.setQueryData(chatKeys.conversation(conv.id), conv);
      void queryClient.invalidateQueries({
        queryKey: [...chatKeys.all, 'conversations'],
      });
    },
    onError: (err) => {
      toast.error(
        getUserFriendlyErrorMessage(err, tToast('cannotStartConversation'))
      );
    },
  });
}

export function useCreateStudyGroup() {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (payload: CreateStudyGroupInput) => createStudyGroup(payload),
    onSuccess: (conv) => {
      queryClient.setQueryData(chatKeys.conversation(conv.id), conv);
      void queryClient.invalidateQueries({
        queryKey: [...chatKeys.all, 'conversations'],
      });
      toast.success(tToast('groupCreated'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotCreateGroup')));
    },
  });
}
