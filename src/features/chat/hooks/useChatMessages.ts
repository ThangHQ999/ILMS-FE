'use client';

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/sonner';
import { useCurrentUser } from '@/features/auth';
import { getUserFriendlyErrorMessage } from '@/lib/error-utils';
import { ApiError } from '@/types/common';
import { chatKeys } from '../constants/chat-query-keys';
import type {
  ChatConversation,
  ChatMessage,
  ChatMessagePage,
  CreatePollInput,
  SendMessageInput,
} from '../schemas/chat.schema';
import {
  askChatAi,
  createPoll,
  deleteMessage,
  editMessage,
  getConversationAttachments,
  getMessages,
  getPinnedMessages,
  getShareableResources,
  markConversationRead,
  searchMessages,
  sendMessage,
  togglePinMessage,
  toggleReaction,
  votePoll,
} from '../services/chat.service';
import { chatStore } from '../store/useChatStore';
import {
  isAiTriggerContent,
  upsertMessageInPages,
} from '../utils/chat-message.utils';

export function clearConversationUnreadInCache(
  queryClient: QueryClient,
  conversationId: string,
  latestMessage?: ChatMessage
): void {
  queryClient.setQueriesData<ChatConversation[]>(
    { queryKey: [...chatKeys.all, 'conversations'] },
    (old) => {
      if (!Array.isArray(old)) return old;
      return old.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              unreadCount: 0,
              ...(latestMessage
                ? {
                    lastMessage: latestMessage,
                    lastMessageAt: latestMessage.createdAt,
                  }
                : {}),
            }
          : conv
      );
    }
  );
  queryClient.setQueryData<ChatConversation>(
    chatKeys.conversation(conversationId),
    (old) => {
      if (!old) return old;
      return {
        ...old,
        unreadCount: 0,
        ...(latestMessage
          ? {
              lastMessage: latestMessage,
              lastMessageAt: latestMessage.createdAt,
            }
          : {}),
      };
    }
  );
}

export function useChatMessages(conversationId?: string | null) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId ?? ''),
    queryFn: ({ pageParam }) =>
      getMessages(conversationId!, {
        beforeCreatedAt: pageParam?.beforeCreatedAt ?? null,
        beforeId: pageParam?.beforeId ?? null,
        limit: 30,
      }),
    initialPageParam: {
      beforeCreatedAt: null as string | null,
      beforeId: null as string | null,
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursorCreatedAt
        ? {
            beforeCreatedAt: lastPage.nextCursorCreatedAt,
            beforeId: lastPage.nextCursorId ?? null,
          }
        : undefined,
    enabled: Boolean(conversationId),
    staleTime: 10_000,
  });
}

export function useSearchMessages(conversationId: string | null, q: string) {
  const hasQuery = q.trim().length >= 2;
  return useQuery({
    queryKey: chatKeys.searchMessages(conversationId ?? '', q),
    queryFn: () => searchMessages(conversationId!, q),
    enabled: Boolean(conversationId && hasQuery),
    placeholderData: hasQuery ? keepPreviousData : undefined,
    staleTime: 10_000,
  });
}

export function usePinnedMessages(conversationId?: string | null, enabled = true) {
  return useQuery({
    queryKey: chatKeys.pinnedMessages(conversationId ?? ''),
    queryFn: () => getPinnedMessages(conversationId!),
    enabled: Boolean(conversationId && enabled),
    staleTime: 20_000,
  });
}

export function useConversationAttachments(
  conversationId?: string | null,
  type = 'ALL',
  enabled = true
) {
  return useQuery({
    queryKey: chatKeys.attachments(conversationId ?? '', type),
    queryFn: () => getConversationAttachments(conversationId!, type),
    enabled: Boolean(conversationId && enabled),
    staleTime: 20_000,
  });
}

export function useShareableResources(
  params: { type?: string; classId?: string; courseId?: string; q?: string },
  enabled = true
) {
  return useQuery({
    queryKey: chatKeys.shareableResources(params),
    queryFn: () => getShareableResources(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useSendMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  const tCommon = useTranslations('chat.common');
  const { data: user } = useCurrentUser();
  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : tCommon('you');

  return useMutation({
    mutationFn: async (payload: SendMessageInput) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return sendMessage(conversationId, payload);
    },
    onMutate: async (payload) => {
      if (!conversationId) return undefined;
      const clientTempId =
        payload.clientTempId ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `temp-${Date.now()}`);
      payload.clientTempId = clientTempId;

      const replyTarget = chatStore.getState().replyToMessage;
      const optimisticMsg: ChatMessage = {
        id: clientTempId,
        conversationId,
        clientTempId,
        senderType: 'USER',
        sender: user
          ? {
              id: user.id,
              fullName: userFullName,
              avatarUrl: null,
              isOnline: true,
            }
          : null,
        senderDisplayName: payload.isAnonymous ? tToast('youAnonymous') : userFullName,
        isMine: true,
        isAnonymous: Boolean(payload.isAnonymous),
        messageType: payload.messageType,
        content: payload.content ?? null,
        codeLanguage: payload.codeLanguage ?? null,
        replyTo: replyTarget
          ? {
              id: replyTarget.id,
              senderType: replyTarget.senderType,
              senderDisplayName: replyTarget.senderDisplayName,
              messageType: replyTarget.messageType,
              contentPreview: replyTarget.content?.slice(0, 120) || tCommon('attachment'),
              isDeleted: replyTarget.isDeleted,
              isAnonymous: replyTarget.isAnonymous,
            }
          : null,
        attachment: payload.attachment ?? null,
        sharedResource: null,
        poll: null,
        mentionedUserIds: payload.mentionedUserIds ?? [],
        reactions: [],
        isPinned: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        threadReplyCount: 0,
        citedSources: [],
        optimisticStatus: 'sending',
      };

      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(conversationId),
        (old) => {
          const base = old ?? {
            pages: [{ items: [], hasMore: false }],
            pageParams: [{ beforeCreatedAt: null, beforeId: null }],
          };
          return {
            ...base,
            pages: upsertMessageInPages(base.pages, optimisticMsg, user?.id),
          };
        }
      );

      const triggeredAi = isAiTriggerContent(payload.content);
      if (triggeredAi) {
        chatStore.startAiThinking(conversationId);
      }

      return { clientTempId, triggeredAi };
    },
    onSuccess: (saved) => {
      if (!conversationId) return;
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: upsertMessageInPages(old.pages, saved, user?.id),
          };
        }
      );
      void queryClient.invalidateQueries({
        queryKey: [...chatKeys.all, 'conversations'],
      });
    },
    onError: (err, _vars, ctx) => {
      if (conversationId && ctx?.triggeredAi) {
        chatStore.clearAiThinking(conversationId);
      }
      if (conversationId && ctx?.clientTempId) {
        queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
          chatKeys.messages(conversationId),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((p) => ({
                ...p,
                items: p.items.map((m) =>
                  m.clientTempId === ctx.clientTempId
                    ? { ...m, optimisticStatus: 'failed' as const }
                    : m
                ),
              })),
            };
          }
        );
      }
      if (err instanceof ApiError && err.httpStatus === 429) {
        toast.warning(tToast('rateLimitFast'));
        return;
      }
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotSendMessage')));
    },
  });
}

export function useEditMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: (params: { messageId: string; content: string; codeLanguage?: string }) =>
      editMessage(params.messageId, {
        content: params.content,
        codeLanguage: params.codeLanguage,
      }),
    onSuccess: (updated) => {
      if (!conversationId) return;
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(conversationId),
        (old) =>
          old
            ? {
                ...old,
                pages: upsertMessageInPages(old.pages, updated, user?.id),
              }
            : old
      );
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotEditMessage')));
    },
  });
}

export function useDeleteMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: (_res, messageId) => {
      if (!conversationId) return;
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(conversationId),
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items.map((m) =>
                    m.id === messageId ? { ...m, isDeleted: true, content: null } : m
                  ),
                })),
              }
            : old
      );
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotDeleteMessage')));
    },
  });
}

export function useToggleReaction(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: { messageId: string; emoji: string }) =>
      toggleReaction(params.messageId, params.emoji),
    onMutate: async ({ messageId, emoji }) => {
      if (!conversationId) return undefined;
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(conversationId) });
      const previousData = queryClient.getQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(conversationId)
      );
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              items: p.items.map((m) => {
                if (m.id !== messageId) return m;
                const existing = m.reactions.find((r) => r.emoji === emoji);
                let nextReactions = m.reactions;
                if (existing) {
                  if (existing.reactedByMe) {
                    nextReactions = m.reactions
                      .map((r) =>
                        r.emoji === emoji
                          ? { ...r, count: Math.max(0, r.count - 1), reactedByMe: false }
                          : r
                      )
                      .filter((r) => r.count > 0);
                  } else {
                    nextReactions = m.reactions.map((r) =>
                      r.emoji === emoji
                        ? { ...r, count: r.count + 1, reactedByMe: true }
                        : r
                    );
                  }
                } else {
                  nextReactions = [...m.reactions, { emoji, count: 1, reactedByMe: true }];
                }
                return { ...m, reactions: nextReactions };
              }),
            })),
          };
        }
      );
      return { previousData };
    },
    onError: (err, _vars, context) => {
      if (conversationId && context?.previousData) {
        queryClient.setQueryData(chatKeys.messages(conversationId), context.previousData);
      }
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotReactMessage')));
    },
  });
}

export function useTogglePinMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (messageId: string) => togglePinMessage(messageId),
    onSuccess: () => {
      if (!conversationId) return;
      void queryClient.invalidateQueries({
        queryKey: chatKeys.pinnedMessages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      });
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotPinMessage')));
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { conversationId: string; lastReadMessageId?: string }) =>
      markConversationRead(params.conversationId, params.lastReadMessageId),
    onMutate: async ({ conversationId }) => {
      clearConversationUnreadInCache(queryClient, conversationId);
    },
    onSuccess: (_res, { conversationId }) => {
      clearConversationUnreadInCache(queryClient, conversationId);
      void queryClient.invalidateQueries({
        queryKey: chatKeys.unreadCount(),
      });
      void queryClient.invalidateQueries({
        queryKey: [...chatKeys.all, 'conversations'],
      });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(conversationId),
      });
    },
  });
}

export function useCreatePoll(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: (payload: CreatePollInput) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return createPoll(conversationId, payload);
    },
    onSuccess: (msg) => {
      if (!conversationId) return;
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(conversationId),
        (old) =>
          old
            ? { ...old, pages: upsertMessageInPages(old.pages, msg, user?.id) }
            : old
      );
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotCreatePoll')));
    },
  });
}

export function useVotePoll(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: { pollId: string; optionIds: string[] }) =>
      votePoll(params.pollId, params.optionIds),
    onSuccess: (updatedPoll) => {
      if (!conversationId) return;
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(conversationId),
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items.map((m) =>
                    m.poll?.id === updatedPoll.id ? { ...m, poll: updatedPoll } : m
                  ),
                })),
              }
            : old
      );
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotVotePoll')));
    },
  });
}

export function useAskChatAi(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: (payload: { prompt: string; replyToMessageId?: string }) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return askChatAi(conversationId, payload);
    },
    onMutate: () => {
      if (conversationId) {
        chatStore.startAiThinking(conversationId);
      }
    },
    onSuccess: (msg) => {
      if (!conversationId) return;
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(conversationId),
        (old) =>
          old
            ? { ...old, pages: upsertMessageInPages(old.pages, msg, user?.id) }
            : old
      );
    },
    onError: (err) => {
      if (err instanceof ApiError && err.httpStatus === 429) {
        toast.warning(tToast('rateLimitAi'));
        return;
      }
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotAskAi')));
    },
    onSettled: () => {
      if (conversationId) {
        chatStore.clearAiThinking(conversationId);
      }
    },
  });
}
