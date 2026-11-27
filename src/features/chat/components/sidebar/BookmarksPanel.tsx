'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ErrorState } from '@/components/shared';
import { useBookmarks, useToggleBookmark } from '../../hooks/useChatPhase2';
import { chatStore } from '../../store/useChatStore';
import {
  formatRelativeChatTime,
  getMessageSenderDisplayName,
} from '../../utils/chat-message.utils';

export function BookmarksPanel() {
  const router = useRouter();
  const locale = useLocale();
  const tSidebar = useTranslations('chat.sidebar');
  const tCommon = useTranslations('chat.common');
  const { data: bookmarks = [], isLoading, isError, refetch } = useBookmarks(undefined, true);
  const { removeMutation } = useToggleBookmark();

  if (isLoading) {
    return (
      <div className="p-3 space-y-2.5" role="status">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <ErrorState title={tSidebar('loadError')} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="p-6 text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA]">
          <span className="material-symbols-outlined text-[24px]">bookmark</span>
        </div>
        <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
          {tSidebar('bookmarksHeader')}
        </p>
        <p className="text-xs text-[#444746] dark:text-[#8E918F]">
          {tSidebar('bookmarksEmpty')}
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
      {bookmarks.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 space-y-1.5 group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
              {getMessageSenderDisplayName(item.message, {
                aiSenderName: tCommon('aiSenderName'),
                fallbackUser: tCommon('user'),
              })}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] text-[#747775] dark:text-[#8E918F]">
                {formatRelativeChatTime(item.message.createdAt, {
                  locale,
                  labels: {
                    justNow: tCommon('justNow'),
                    minutesAgo: (count) => tCommon('minutesAgo', { count }),
                    hoursAgo: (count) => tCommon('hoursAgo', { count }),
                    daysAgo: (count) => tCommon('daysAgo', { count }),
                  },
                })}
              </span>
              <button
                type="button"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate(item.message.id)}
                title={tSidebar('bookmarksRemoveTooltip')}
                className="w-6 h-6 rounded-full hover:bg-white dark:hover:bg-[#1E1F20] flex items-center justify-center text-[#747775] hover:text-[#B3261E] dark:hover:text-[#F28B82] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">bookmark_remove</span>
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              chatStore.setActiveConversation(item.message.conversationId);
              chatStore.setState({ highlightedMessageId: item.message.id });
              router.replace(
                `/chat?conversationId=${encodeURIComponent(item.message.conversationId)}&messageId=${encodeURIComponent(item.message.id)}`,
                { scroll: false }
              );
            }}
            className="w-full text-left cursor-pointer"
          >
            <p className="text-xs text-[#444746] dark:text-[#C4C7C5] line-clamp-2">
              {item.message.content ||
                item.message.sharedResource?.title ||
                tCommon('attachment')}
            </p>
            {item.note && (
              <p className="mt-1 text-[11px] italic text-[#0B57D0] dark:text-[#A8C7FA]">
                {tSidebar('bookmarksNotePrefix', { note: item.note })}
              </p>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
