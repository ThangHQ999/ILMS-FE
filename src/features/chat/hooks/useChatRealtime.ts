'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { Members } from 'pusher-js';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/sonner';
import { useCurrentUser } from '@/features/auth';
import { chatKeys } from '../constants/chat-query-keys';
import {
  CHAT_WS_EVENTS,
  PRESENCE_CHAT_CHANNEL,
  conversationChannel,
  threadChannel,
  userChannel,
} from '../constants/chat-realtime';
import {
  chatConversationSchema,
  chatMessageSchema,
  chatUnreadSummarySchema,
  chatWsEventEnvelopeSchema,
  pollBroadcastPayloadSchema,
  reactionBroadcastPayloadSchema,
  type ChatConversation,
  type ChatMessagePage,
} from '../schemas/chat.schema';
import {
  readReceiptEventSchema,
  studyTimerEventSchema,
  threadSummaryEventSchema,
  type ThreadPageResponse,
} from '../schemas/chat-phase2.schema';
import { markConversationRead } from '../services/chat.service';
import { chatRealtimeService } from '../services/chat-realtime.service';
import { chatStore, type OnlinePresenceUser, useChatStore } from '../store/useChatStore';
import {
  isAiMessage,
  mergePollBroadcast,
  mergeReactionBroadcast,
  resolveIsMine,
  upsertMessageInPages,
} from '../utils/chat-message.utils';
import { clearConversationUnreadInCache } from './useChatMessages';

interface PresenceMemberInfo {
  fullName?: string;
  name?: string;
  avatarUrl?: string | null;
}

function toPresenceUser(
  id: string,
  info: PresenceMemberInfo | undefined,
  fallbackName: string
): OnlinePresenceUser {
  return {
    id,
    fullName: info?.fullName || info?.name || fallbackName,
    avatarUrl: info?.avatarUrl ?? null,
  };
}

export function useChatRealtime() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  const tCommon = useTranslations('chat.common');
  const memberFallback = tCommon('member');
  const removedMsg = tToast('removedFromConversation');
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? null;

  const memberFallbackRef = useRef(memberFallback);
  const removedMsgRef = useRef(removedMsg);
  const routerRef = useRef(router);
  memberFallbackRef.current = memberFallback;
  removedMsgRef.current = removedMsg;
  routerRef.current = router;

  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const rightPanelMode = useChatStore((s) => s.rightPanelMode);
  const activeThreadRootId = useChatStore((s) => s.activeThreadRootId);

  const prevStatusRef = useRef<string>('disconnected');

  // Connect Soketi & subscribe global presence + private user channel
  useEffect(() => {
    if (!currentUserId) return;

    const client = chatRealtimeService.connect((status) => {
      const prev = prevStatusRef.current;
      prevStatusRef.current = status;
      chatStore.setState({ realtimeStatus: status });
      if (status === 'connected' && prev === 'disconnected') {
        void queryClient.invalidateQueries({ queryKey: chatKeys.all });
      }
    });

    if (!client) return;

    // 1. Global Presence Channel
    const presenceCh = chatRealtimeService.subscribe(PRESENCE_CHAT_CHANNEL);
    if (presenceCh) {
      presenceCh.bind('pusher:subscription_succeeded', (members: Members) => {
        const nextMap: Record<string, OnlinePresenceUser> = {};
        members.each((member: { id: string; info?: PresenceMemberInfo }) => {
          nextMap[String(member.id)] = toPresenceUser(
            String(member.id),
            member.info,
            memberFallbackRef.current
          );
        });
        chatStore.setState({ onlineUsers: nextMap });
      });

      presenceCh.bind(
        'pusher:member_added',
        (member: { id: string; info?: PresenceMemberInfo }) => {
          chatStore.setState((prev) => ({
            onlineUsers: {
              ...prev.onlineUsers,
              [String(member.id)]: toPresenceUser(
                String(member.id),
                member.info,
                memberFallbackRef.current
              ),
            },
          }));
        }
      );

      presenceCh.bind('pusher:member_removed', (member: { id: string }) => {
        chatStore.setState((prev) => {
          const next = { ...prev.onlineUsers };
          delete next[String(member.id)];
          return { onlineUsers: next };
        });
      });
    }

    // 2. Private User Channel
    const myChannelName = userChannel(currentUserId);
    const myCh = chatRealtimeService.subscribe(myChannelName);
    if (myCh) {
      const handleUserEvent = (raw: unknown) => {
        const parsed = chatWsEventEnvelopeSchema.safeParse(raw);
        if (!parsed.success) return;
        const { eventType, payload, conversationId } = parsed.data;

        if (eventType === CHAT_WS_EVENTS.UNREAD_UPDATED) {
          const activeId = chatStore.getState().activeConversationId;
          const summary = chatUnreadSummarySchema.safeParse(payload);
          if (summary.success) {
            queryClient.setQueryData(chatKeys.unreadCount(), summary.data);
          } else {
            void queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
          }
          if (conversationId && conversationId === activeId) {
            clearConversationUnreadInCache(queryClient, activeId);
            return;
          }
          void queryClient.invalidateQueries({
            queryKey: [...chatKeys.all, 'conversations'],
          });
          if (activeId) {
            clearConversationUnreadInCache(queryClient, activeId);
          }
          return;
        }

        if (
          eventType === CHAT_WS_EVENTS.CONVERSATION_CREATED ||
          eventType === CHAT_WS_EVENTS.CONVERSATION_UPDATED ||
          eventType === CHAT_WS_EVENTS.MEMBER_JOINED
        ) {
          void queryClient.invalidateQueries({ queryKey: chatKeys.all });
          return;
        }

        if (eventType === CHAT_WS_EVENTS.REMOVED_FROM_CONVERSATION && conversationId) {
          void queryClient.invalidateQueries({ queryKey: chatKeys.all });
          if (chatStore.getState().activeConversationId === conversationId) {
            chatStore.setActiveConversation(null);
            routerRef.current.replace('/chat', { scroll: false });
            toast.info(removedMsgRef.current);
          }
        }
      };

      Object.values(CHAT_WS_EVENTS).forEach((evtName) => {
        if (evtName !== CHAT_WS_EVENTS.CLIENT_TYPING) {
          myCh.bind(evtName, handleUserEvent);
        }
      });
    }

    return () => {
      chatRealtimeService.unsubscribe(PRESENCE_CHAT_CHANNEL);
      chatRealtimeService.unsubscribe(myChannelName);
    };
  }, [currentUserId, queryClient]);

  // Subscribe active conversation channel
  useEffect(() => {
    if (!currentUserId || !activeConversationId) return;

    const chName = conversationChannel(activeConversationId);
    const ch = chatRealtimeService.subscribe(chName);
    if (!ch) return;

    const patchConversationMessages = (
      updater: (pages: ChatMessagePage[]) => ChatMessagePage[]
    ) => {
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(
        chatKeys.messages(activeConversationId),
        (old) => {
          if (!old) return old;
          return { ...old, pages: updater(old.pages) };
        }
      );
    };

    const handleConvEvent = (raw: unknown) => {
      const envelope = chatWsEventEnvelopeSchema.safeParse(raw);
      if (!envelope.success) return;
      const { eventType, payload } = envelope.data;

      if (
        eventType === CHAT_WS_EVENTS.MESSAGE_CREATED ||
        eventType === CHAT_WS_EVENTS.MESSAGE_UPDATED
      ) {
        const msgParsed = chatMessageSchema.safeParse(payload);
        if (!msgParsed.success) return;
        const incoming = msgParsed.data;
        patchConversationMessages((pages) =>
          upsertMessageInPages(pages, incoming, currentUserId)
        );
        if (eventType === CHAT_WS_EVENTS.MESSAGE_CREATED) {
          if (isAiMessage(incoming)) {
            chatStore.clearAiThinking(activeConversationId);
          }
          const isIncomingFromOther = !resolveIsMine(incoming, currentUserId);
          clearConversationUnreadInCache(queryClient, activeConversationId, incoming);
          if (isIncomingFromOther) {
            void markConversationRead(activeConversationId, incoming.id)
              .then(() => {
                clearConversationUnreadInCache(queryClient, activeConversationId);
                void queryClient.invalidateQueries({
                  queryKey: chatKeys.unreadCount(),
                });
                void queryClient.invalidateQueries({
                  queryKey: [...chatKeys.all, 'conversations'],
                });
              })
              .catch(() => {
                void queryClient.invalidateQueries({
                  queryKey: [...chatKeys.all, 'conversations'],
                });
              });
            return;
          }
        }
        void queryClient.invalidateQueries({
          queryKey: [...chatKeys.all, 'conversations'],
        });
        return;
      }

      if (eventType === CHAT_WS_EVENTS.MESSAGE_DELETED) {
        const p = payload as { id?: string; messageId?: string } | null;
        const targetId = p?.id || p?.messageId;
        if (!targetId) return;
        patchConversationMessages((pages) =>
          pages.map((page) => ({
            ...page,
            items: page.items.map((m) =>
              m.id === targetId ? { ...m, isDeleted: true, content: null } : m
            ),
          }))
        );
        void queryClient.invalidateQueries({
          queryKey: [...chatKeys.all, 'conversations'],
        });
        return;
      }

      if (eventType === CHAT_WS_EVENTS.MESSAGE_PINNED) {
        const p = payload as { messageId?: string; id?: string; isPinned?: boolean } | null;
        const targetId = p?.messageId || p?.id;
        if (targetId) {
          patchConversationMessages((pages) =>
            pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === targetId
                  ? { ...m, isPinned: p?.isPinned ?? !m.isPinned }
                  : m
              ),
            }))
          );
        }
        void queryClient.invalidateQueries({
          queryKey: chatKeys.pinnedMessages(activeConversationId),
        });
        void queryClient.invalidateQueries({
          queryKey: chatKeys.conversation(activeConversationId),
        });
        return;
      }

      if (eventType === CHAT_WS_EVENTS.REACTION_UPDATED) {
        const reactParsed = reactionBroadcastPayloadSchema.safeParse(payload);
        if (!reactParsed.success) return;
        const evt = reactParsed.data;
        patchConversationMessages((pages) =>
          pages.map((page) => ({
            ...page,
            items: page.items.map((m) =>
              m.id === evt.messageId
                ? {
                    ...m,
                    reactions: mergeReactionBroadcast(m.reactions, evt, currentUserId),
                  }
                : m
            ),
          }))
        );
        return;
      }

      if (eventType === CHAT_WS_EVENTS.POLL_UPDATED) {
        const pollParsed = pollBroadcastPayloadSchema.safeParse(payload);
        if (!pollParsed.success) return;
        const evt = pollParsed.data;
        patchConversationMessages((pages) =>
          pages.map((page) => ({
            ...page,
            items: page.items.map((m) =>
              m.id === evt.messageId
                ? {
                    ...m,
                    poll: mergePollBroadcast(m.poll, evt, currentUserId),
                  }
                : m
            ),
          }))
        );
        return;
      }

      if (eventType === CHAT_WS_EVENTS.CONVERSATION_UPDATED) {
        const convParsed = chatConversationSchema.safeParse(payload);
        if (convParsed.success) {
          queryClient.setQueryData<ChatConversation>(
            chatKeys.conversation(activeConversationId),
            convParsed.data
          );
        }
        void queryClient.invalidateQueries({
          queryKey: [...chatKeys.all, 'conversations'],
        });
        return;
      }

      if (
        eventType === CHAT_WS_EVENTS.MEMBER_JOINED ||
        eventType === CHAT_WS_EVENTS.MEMBER_LEFT
      ) {
        void queryClient.invalidateQueries({
          queryKey: chatKeys.members(activeConversationId),
        });
        void queryClient.invalidateQueries({
          queryKey: chatKeys.conversation(activeConversationId),
        });
        return;
      }

      if (eventType === CHAT_WS_EVENTS.THREAD_SUMMARY_UPDATED) {
        const summaryParsed = threadSummaryEventSchema.safeParse(payload);
        if (!summaryParsed.success) return;
        const s = summaryParsed.data;
        patchConversationMessages((pages) =>
          pages.map((page) => ({
            ...page,
            items: page.items.map((m) =>
              m.id === s.rootMessageId
                ? {
                    ...m,
                    threadReplyCount: s.threadReplyCount,
                    threadLastReplyAt: s.threadLastReplyAt ?? m.threadLastReplyAt,
                  }
                : m
            ),
          }))
        );
        return;
      }

      if (eventType === CHAT_WS_EVENTS.STUDY_TIMER_UPDATED) {
        const timerParsed = studyTimerEventSchema.safeParse(payload);
        if (!timerParsed.success) return;
        chatStore.setState((prev) => ({
          activePomodoroByConversation: {
            ...prev.activePomodoroByConversation,
            [activeConversationId]:
              timerParsed.data.phase === 'IDLE' ? null : timerParsed.data,
          },
        }));
        void queryClient.invalidateQueries({
          queryKey: chatKeys.studySessions(activeConversationId),
        });
        return;
      }

      if (eventType === CHAT_WS_EVENTS.READ_RECEIPT) {
        const receiptParsed = readReceiptEventSchema.safeParse(payload);
        if (!receiptParsed.success) return;
        const r = receiptParsed.data;
        if (r.userId === currentUserId) return;
        chatStore.setState((prev) => {
          const existing = prev.readReceiptsByConversation[activeConversationId] ?? [];
          const filtered = existing.filter((item) => item.userId !== r.userId);
          return {
            readReceiptsByConversation: {
              ...prev.readReceiptsByConversation,
              [activeConversationId]: [...filtered, r],
            },
          };
        });
      }
    };

    Object.values(CHAT_WS_EVENTS).forEach((evtName) => {
      if (evtName !== CHAT_WS_EVENTS.CLIENT_TYPING) {
        ch.bind(evtName, handleConvEvent);
      }
    });

    ch.bind(
      CHAT_WS_EVENTS.CLIENT_TYPING,
      (data: { userId?: string; fullName?: string; isTyping?: boolean }) => {
        if (!data?.userId || data.userId === currentUserId) return;
        const expiresAt = Date.now() + 3500;
        chatStore.setState((prev) => {
          const currentList = (prev.typingByConversation[activeConversationId] ?? []).filter(
            (entry) => entry.expiresAt > Date.now() && entry.userId !== data.userId
          );
          if (data.isTyping) {
            currentList.push({
              userId: data.userId!,
              fullName: data.fullName || memberFallback,
              expiresAt,
            });
          }
          return {
            typingByConversation: {
              ...prev.typingByConversation,
              [activeConversationId]: currentList,
            },
          };
        });
      }
    );

    const pruneInterval = window.setInterval(() => {
      const list = chatStore.getState().typingByConversation[activeConversationId] ?? [];
      if (list.some((item) => item.expiresAt <= Date.now())) {
        chatStore.setState((prev) => ({
          typingByConversation: {
            ...prev.typingByConversation,
            [activeConversationId]: (
              prev.typingByConversation[activeConversationId] ?? []
            ).filter((item) => item.expiresAt > Date.now()),
          },
        }));
      }
    }, 1500);

    return () => {
      window.clearInterval(pruneInterval);
      chatRealtimeService.unsubscribe(chName);
    };
  }, [activeConversationId, currentUserId, memberFallback, queryClient]);

  // Subscribe active thread channel when ThreadDrawer is open
  useEffect(() => {
    if (!currentUserId || rightPanelMode !== 'thread' || !activeThreadRootId) {
      return;
    }

    const chName = threadChannel(activeThreadRootId);
    const ch = chatRealtimeService.subscribe(chName);
    if (!ch) return;

    ch.bind(CHAT_WS_EVENTS.THREAD_REPLY_CREATED, (raw: unknown) => {
      const envelope = chatWsEventEnvelopeSchema.safeParse(raw);
      if (!envelope.success) return;
      const msgParsed = chatMessageSchema.safeParse(envelope.data.payload);
      if (!msgParsed.success) return;
      const reply = msgParsed.data;
      queryClient.setQueryData<ThreadPageResponse>(
        chatKeys.thread(activeThreadRootId),
        (old) => {
          if (!old) return old;
          const exists = old.replies.some(
            (r) =>
              r.id === reply.id ||
              (Boolean(reply.clientTempId) && r.clientTempId === reply.clientTempId)
          );
          if (exists) {
            return {
              ...old,
              replies: old.replies.map((r) =>
                r.id === reply.id ||
                (Boolean(reply.clientTempId) && r.clientTempId === reply.clientTempId)
                  ? { ...reply, isMine: r.isMine || reply.sender?.id === currentUserId }
                  : r
              ),
            };
          }
          return {
            ...old,
            rootMessage: {
              ...old.rootMessage,
              threadReplyCount: old.rootMessage.threadReplyCount + 1,
            },
            replies: [
              ...old.replies,
              {
                ...reply,
                isMine: reply.isMine ?? reply.sender?.id === currentUserId,
              },
            ],
          };
        }
      );
    });

    return () => {
      chatRealtimeService.unsubscribe(chName);
    };
  }, [activeThreadRootId, currentUserId, rightPanelMode, queryClient]);
}
