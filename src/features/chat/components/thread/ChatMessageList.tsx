'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useInView } from 'react-intersection-observer';
import { ErrorState } from '@/components/shared';
import { resolveChatTheme } from '../../constants/chat-themes';
import type { ChatConversation, ChatMessage } from '../../schemas/chat.schema';
import { useChatStore, chatStore } from '../../store/useChatStore';
import {
  getConversationDisplayAvatar,
  getConversationDisplayName,
  groupMessagesForDisplay,
  isAiMessage,
  resolveIsMine,
  type ChatTimestampLabels,
} from '../../utils/chat-message.utils';
import { AiThinkingBubble } from './cards/AiThinkingBubble';
import { ChatMessageItem } from './ChatMessageItem';

const EMPTY_ARRAY: never[] = [];

interface ChatMessageListProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  currentUserId?: string;
  isInstructor?: boolean;
  isLockedForMe: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onFetchNextPage: () => Promise<unknown>;
  onRetry: () => void;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: ChatMessage) => void;
  onOpenThread: (messageId: string) => void;
  onAskAiAbout: (message: ChatMessage) => void;
  onGenerateAiDraft: (messageId: string) => void;
  onBookmark: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => void;
  onReport: (message: ChatMessage) => void;
  onVotePoll: (pollId: string, optionIds: string[]) => void;
}

export function ChatMessageList({
  conversation,
  messages,
  currentUserId,
  isInstructor = false,
  isLockedForMe,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  onFetchNextPage,
  onRetry,
  onReaction,
  onReply,
  onOpenThread,
  onAskAiAbout,
  onGenerateAiDraft,
  onBookmark,
  onPin,
  onEdit,
  onDelete,
  onReport,
  onVotePoll,
}: ChatMessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const prevCountRef = useRef<number>(0);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const highlightedMessageId = useChatStore((s) => s.highlightedMessageId);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const theme = resolveChatTheme(conversation.themeKey);
  const typingUsers =
    useChatStore((s) => s.typingByConversation[conversation.id]) ?? EMPTY_ARRAY;
  const readReceipts =
    useChatStore((s) => s.readReceiptsByConversation[conversation.id]) ??
    EMPTY_ARRAY;
  const aiThinkingStartedAt = useChatStore(
    (s) => s.aiThinkingByConversation[conversation.id] ?? null
  );

  const locale = useLocale();
  const tTimestamp = useTranslations('chat.timestamp');
  const tEmptyConv = useTranslations('chat.emptyConversation');
  const tMsg = useTranslations('chat.messages');
  const tCommon = useTranslations('chat.common');

  const timestampLabels = useMemo<ChatTimestampLabels>(
    () => ({
      weekdaysShort: {
        0: tTimestamp('weekdaysShort.0'),
        1: tTimestamp('weekdaysShort.1'),
        2: tTimestamp('weekdaysShort.2'),
        3: tTimestamp('weekdaysShort.3'),
        4: tTimestamp('weekdaysShort.4'),
        5: tTimestamp('weekdaysShort.5'),
        6: tTimestamp('weekdaysShort.6'),
      },
      weekdaysFull: {
        0: tTimestamp('weekdaysFull.0'),
        1: tTimestamp('weekdaysFull.1'),
        2: tTimestamp('weekdaysFull.2'),
        3: tTimestamp('weekdaysFull.3'),
        4: tTimestamp('weekdaysFull.4'),
        5: tTimestamp('weekdaysFull.5'),
        6: tTimestamp('weekdaysFull.6'),
      },
      months: {
        1: tTimestamp('months.1'),
        2: tTimestamp('months.2'),
        3: tTimestamp('months.3'),
        4: tTimestamp('months.4'),
        5: tTimestamp('months.5'),
        6: tTimestamp('months.6'),
        7: tTimestamp('months.7'),
        8: tTimestamp('months.8'),
        9: tTimestamp('months.9'),
        10: tTimestamp('months.10'),
        11: tTimestamp('months.11'),
        12: tTimestamp('months.12'),
      },
      formatWeekday: (time, weekday) =>
        tTimestamp('weekdayFormat', { time, weekday }),
      formatTooltipWeekday: (weekday, time) =>
        tTimestamp('tooltipWeekdayFormat', { weekday, time }),
      formatFullDate: ({ time, day, month, year }) =>
        tTimestamp('fullDateFormat', { time, day, month, year }),
    }),
    [tTimestamp]
  );

  const { ref: topSentinelRef, inView } = useInView({ threshold: 0.1 });

  const groupedMessages = useMemo(
    () => groupMessagesForDisplay(messages, { locale, labels: timestampLabels }),
    [messages, locale, timestampLabels]
  );

  // Trigger cursor pagination when scrolling to the top sentinel
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isLoading) {
      const container = scrollContainerRef.current;
      if (container) {
        prevScrollHeightRef.current = container.scrollHeight;
      }
      void onFetchNextPage().then(() => {
        requestAnimationFrame(() => {
          const el = scrollContainerRef.current;
          if (el && prevScrollHeightRef.current > 0) {
            const delta = el.scrollHeight - prevScrollHeightRef.current;
            el.scrollTop += delta;
            prevScrollHeightRef.current = 0;
          }
        });
      });
    }
  }, [inView, hasNextPage, isFetchingNextPage, isLoading, onFetchNextPage]);

  // Auto-scroll to bottom on initial load, new incoming message near bottom, or own outgoing message
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isInitial = prevCountRef.current === 0 && messages.length > 0;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 180;
    const latest = messages[messages.length - 1];
    const isLatestMine = Boolean(latest && resolveIsMine(latest, currentUserId));
    if (isInitial || (messages.length > prevCountRef.current && (isNearBottom || isLatestMine))) {
      container.scrollTop = container.scrollHeight;
    }
    prevCountRef.current = messages.length;
  }, [messages, conversation.id, currentUserId]);

  // Scroll to highlighted message when jumping from search, pin, bookmark, or deep link
  useEffect(() => {
    if (!highlightedMessageId) return;
    const targetEl = document.getElementById(`chat-msg-${highlightedMessageId}`);
    if (!targetEl) return;
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = window.setTimeout(() => {
      if (chatStore.getState().highlightedMessageId === highlightedMessageId) {
        chatStore.setState({ highlightedMessageId: null });
      }
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [highlightedMessageId, messages.length, conversation.id]);

  // Reset count ref on conversation switch
  useEffect(() => {
    prevCountRef.current = 0;
  }, [conversation.id]);

  // Clear AI thinking state when an AI reply arrives or after a 45s safety timeout
  useEffect(() => {
    if (aiThinkingStartedAt === null) return;
    const hasRecentAiReply = messages.some(
      (msg) =>
        isAiMessage(msg) &&
        Date.parse(msg.createdAt) >= aiThinkingStartedAt - 10_000
    );
    if (hasRecentAiReply) {
      chatStore.clearAiThinking(conversation.id);
      return;
    }
    const remainingMs = Math.max(
      1000,
      45_000 - (Date.now() - aiThinkingStartedAt)
    );
    const timer = window.setTimeout(() => {
      chatStore.clearAiThinking(conversation.id);
    }, remainingMs);
    return () => window.clearTimeout(timer);
  }, [aiThinkingStartedAt, conversation.id, messages]);

  // Smoothly scroll to bottom when the AI thinking bubble appears
  useEffect(() => {
    if (aiThinkingStartedAt === null) return;
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [aiThinkingStartedAt]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distFromBottom > 260);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-5 space-y-4 overflow-y-auto" role="status">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className={`flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div className="h-12 w-56 sm:w-72 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <ErrorState title={tMsg('loadError')} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4"
      >
        {hasNextPage && (
          <div ref={topSentinelRef} className="py-2 text-center text-[11px]">
            <span
              className={
                theme.wallpaperUrl
                  ? `inline-block px-3 py-1 rounded-full font-medium ${theme.dateDividerClass}`
                  : 'text-[#747775] dark:text-[#8E918F]'
              }
            >
              {isFetchingNextPage ? tMsg('loadingOlder') : tMsg('loadOlder')}
            </span>
          </div>
        )}

        {groupedMessages.length === 0 ? (
          (() => {
            const displayName = getConversationDisplayName(conversation, {
              directFallback: tCommon('conversationFallback'),
              groupFallback: tCommon('groupFallback'),
            });
            const avatarUrl = getConversationDisplayAvatar(conversation);
            const initial = displayName.trim().charAt(0).toUpperCase() || '?';
            const isPeerOnline =
              conversation.type === 'DIRECT' &&
              Boolean(
                conversation.peerUser?.id &&
                  (onlineUsers[conversation.peerUser.id] ||
                    conversation.peerUser.isOnline)
              );

            const contextSubtitle =
              conversation.type === 'DIRECT'
                ? conversation.peerUser?.email
                  ? `${tEmptyConv('directConnected')} • ${conversation.peerUser.email}`
                  : tEmptyConv('directConnected')
                : conversation.type === 'STUDY_GROUP'
                  ? tEmptyConv('groupMembers', { count: conversation.memberCount })
                  : conversation.className
                    ? `${tEmptyConv('classMembers', {
                        count: conversation.memberCount,
                      })} • ${conversation.className}`
                    : tEmptyConv('classMembers', {
                        count: conversation.memberCount,
                      });

            const introHint =
              conversation.type === 'DIRECT'
                ? tEmptyConv('directHint')
                : conversation.type === 'STUDY_GROUP'
                  ? tEmptyConv('groupHint')
                  : tEmptyConv('classHint');

            const hasGroupCover = conversation.type !== 'DIRECT' && Boolean(avatarUrl);

            return (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div
                  className={`flex flex-col items-center w-full max-w-sm overflow-hidden ${
                    hasGroupCover || theme.wallpaperUrl
                      ? 'rounded-3xl bg-white/88 dark:bg-[#1E1F20]/88 backdrop-blur-md shadow-sm'
                      : ''
                  } ${hasGroupCover ? 'pb-6' : 'px-6 py-6'}`}
                >
                  {hasGroupCover && avatarUrl && (
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    </div>
                  )}

                  <div
                    className={`relative ${
                      hasGroupCover ? '-mt-10 z-10 mb-3 px-6' : 'mb-3.5'
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className={`w-20 h-20 rounded-full object-cover shadow-sm ${
                          hasGroupCover
                            ? 'ring-4 ring-white dark:ring-[#1E1F20]'
                            : ''
                        }`}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center text-2xl font-bold shadow-sm">
                        {initial}
                      </div>
                    )}
                    {isPeerOnline && (
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-3 ring-white dark:ring-[#1E1F20]" />
                    )}
                  </div>

                  <div className="px-6">
                    <h3 className="text-xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {displayName}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                      {contextSubtitle}
                    </p>
                    <p className="mt-2 text-xs text-[#747775] dark:text-[#8E918F] leading-relaxed">
                      {introHint}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          groupedMessages.map((grouped) => (
            <ChatMessageItem
              key={grouped.message.id}
              grouped={grouped}
              conversation={conversation}
              currentUserId={currentUserId}
              isInstructor={isInstructor}
              isHighlighted={highlightedMessageId === grouped.message.id}
              isLockedForMe={isLockedForMe}
              timestampLabels={timestampLabels}
              onReaction={onReaction}
              onReply={onReply}
              onOpenThread={onOpenThread}
              onAskAiAbout={onAskAiAbout}
              onGenerateAiDraft={onGenerateAiDraft}
              onBookmark={onBookmark}
              onPin={onPin}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
              onVotePoll={onVotePoll}
              onPreviewImage={setPreviewImageUrl}
            />
          ))
        )}

        {/* Tiered Read Receipts */}
        {readReceipts.length > 0 && (
          <div className="px-5 pt-1 flex justify-end items-center gap-1.5">
            {conversation.memberCount > 20 ? (
              <span
                className={
                  theme.wallpaperUrl
                    ? `px-2.5 py-0.5 rounded-full text-[11px] font-medium ${theme.dateDividerClass}`
                    : 'text-[11px] text-[#747775] dark:text-[#8E918F]'
                }
              >
                {tMsg('seenCount', {
                  count: readReceipts[readReceipts.length - 1]?.seenCount ?? readReceipts.length,
                })}
              </span>
            ) : (
              readReceipts.slice(0, 6).map((r, i) => (
                <span
                  key={`${r.userId ?? i}`}
                  title={tMsg('seenByTitle', { name: r.fullName || tCommon('member') })}
                  className="w-4 h-4 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-[9px] font-bold flex items-center justify-center overflow-hidden"
                >
                  {r.avatarUrl ? (
                    <img src={r.avatarUrl} alt={r.fullName || ''} className="w-full h-full object-cover" />
                  ) : (
                    (r.fullName || 'U').charAt(0).toUpperCase()
                  )}
                </span>
              ))
            )}
          </div>
        )}

        {/* AI Thinking Indicator */}
        {aiThinkingStartedAt !== null && <AiThinkingBubble theme={theme} />}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-5 py-1.5 flex items-center gap-2 text-xs">
            <span className="inline-flex gap-1 px-2.5 py-1.5 rounded-full bg-white/85 dark:bg-[#282A2C]/90 backdrop-blur-xs shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#747775] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#747775] animate-bounce [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#747775] animate-bounce [animation-delay:240ms]" />
            </span>
            <span
              className={
                theme.wallpaperUrl
                  ? `px-2.5 py-0.5 rounded-full text-[11px] font-medium ${theme.dateDividerClass}`
                  : 'text-[#444746] dark:text-[#8E918F]'
              }
            >
              {tMsg('typingIndicator', {
                names: typingUsers.map((u) => u.fullName).slice(0, 2).join(', '),
              })}
            </span>
          </div>
        )}
      </div>

      {showScrollBottom && (
        <button
          type="button"
          onClick={() => {
            const el = scrollContainerRef.current;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
          }}
          aria-label={tMsg('scrollToBottomAria')}
          className={`absolute bottom-4 right-5 w-9 h-9 rounded-full bg-white/95 dark:bg-[#282A2C]/95 backdrop-blur-xs shadow-md flex items-center justify-center cursor-pointer ${theme.accentTextClass}`}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
        </button>
      )}

      {/* Image Lightbox Modal */}
      {previewImageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            aria-label={tMsg('closeLightboxAria')}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
          <img
            src={previewImageUrl}
            alt={tMsg('zoomedImageAlt')}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] rounded-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
