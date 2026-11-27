'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { ChatConversation } from '../../schemas/chat.schema';
import {
  formatRelativeChatTime,
  getConversationDisplayAvatar,
  getConversationDisplayName,
  getMessageSenderDisplayName,
} from '../../utils/chat-message.utils';

interface ConversationListItemProps {
  conversation: ChatConversation;
  isActive: boolean;
  isPeerOnline: boolean;
  onSelect: (id: string) => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  isPeerOnline,
  onSelect,
}: ConversationListItemProps) {
  const locale = useLocale();
  const tSidebar = useTranslations('chat.sidebar');
  const tCommon = useTranslations('chat.common');
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const displayName = getConversationDisplayName(conversation, {
    directFallback: tCommon('conversationFallback'),
    groupFallback: tCommon('groupFallback'),
  });
  const rawAvatarUrl = getConversationDisplayAvatar(conversation);
  const avatarUrl =
    rawAvatarUrl && rawAvatarUrl !== failedAvatarUrl ? rawAvatarUrl : null;
  const isMuted = Boolean(
    conversation.mutedUntil && Date.parse(conversation.mutedUntil) > Date.now()
  );
  const isLocked = Boolean(
    conversation.lockedUntil && Date.parse(conversation.lockedUntil) > Date.now()
  );
  const unread = !isActive && conversation.unreadCount > 0;
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  const formatPreviewText = (): string => {
    const last = conversation.lastMessage;
    if (!last) return tSidebar('previewNoMessages');
    if (last.isDeleted) return tSidebar('previewRecalled');
    const senderName = getMessageSenderDisplayName(last, {
      aiSenderName: tCommon('aiSenderName'),
      fallbackUser: tCommon('user'),
    });
    switch (last.messageType) {
      case 'IMAGE':
        return tSidebar('previewImage', { name: senderName });
      case 'FILE':
        return tSidebar('previewFile', { name: senderName });
      case 'RESOURCE_SHARE':
        return tSidebar('previewResource', {
          name: senderName,
          title: last.sharedResource?.title || tSidebar('previewResourceFallback'),
        });
      case 'POLL':
        return tSidebar('previewPoll', {
          name: senderName,
          question: last.poll?.question || '',
        });
      case 'CODE':
        return tSidebar('previewCode', {
          name: senderName,
          lang: last.codeLanguage || '',
        });
      case 'SYSTEM':
        return last.content || tSidebar('previewSystemFallback');
      default:
        return conversation.type === 'DIRECT'
          ? last.content || ''
          : `${senderName}: ${last.content || ''}`;
    }
  };

  const relativeTime = formatRelativeChatTime(
    conversation.lastMessageAt || conversation.createdAt,
    {
      locale,
      labels: {
        justNow: tCommon('justNow'),
        minutesAgo: (count) => tCommon('minutesAgo', { count }),
        hoursAgo: (count) => tCommon('hoursAgo', { count }),
        daysAgo: (count) => tCommon('daysAgo', { count }),
      },
    }
  );

  const typeBadge =
    conversation.type === 'CLASS_CHANNEL'
      ? {
          icon: 'school',
          color: 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]',
        }
      : conversation.type === 'STUDY_GROUP'
        ? {
            icon: 'groups',
            color: 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]',
          }
        : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`w-full text-left px-3 py-2.5 rounded-2xl flex items-center gap-3 transition-colors cursor-pointer ${
        isActive
          ? 'bg-[#D3E3FD]/70 dark:bg-[#004A77]/70'
          : 'hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
      }`}
    >
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            onError={() => setFailedAvatarUrl(rawAvatarUrl)}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold ${
              typeBadge?.color ??
              'bg-[#E1E5EA] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3]'
            }`}
          >
            {typeBadge ? (
              <span className="material-symbols-outlined text-[22px]">{typeBadge.icon}</span>
            ) : (
              initial
            )}
          </div>
        )}
        {conversation.type === 'DIRECT' && isPeerOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E1F20]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-sm truncate ${
                unread
                  ? 'font-bold text-[#1F1F1F] dark:text-[#E3E3E3]'
                  : 'font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]'
              }`}
            >
              {displayName}
            </span>
            {isMuted && (
              <span
                className="material-symbols-outlined text-[14px] text-[#747775] dark:text-[#8E918F] shrink-0"
                title={tSidebar('mutedTooltip')}
              >
                notifications_off
              </span>
            )}
            {isLocked && (
              <span
                className="material-symbols-outlined text-[14px] text-amber-600 dark:text-amber-400 shrink-0"
                title={tSidebar('examLockTooltip')}
              >
                lock
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#747775] dark:text-[#8E918F] shrink-0 tabular-nums">
            {relativeTime}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-xs truncate ${
              unread
                ? 'font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]'
                : 'text-[#444746] dark:text-[#8E918F]'
            }`}
          >
            {formatPreviewText()}
          </p>
          {unread && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-[10px] font-bold flex items-center justify-center shrink-0 tabular-nums">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
