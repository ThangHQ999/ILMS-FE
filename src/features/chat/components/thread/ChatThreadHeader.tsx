'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import { resolveChatTheme } from '../../constants/chat-themes';
import type { ChatConversation, ChatMessage } from '../../schemas/chat.schema';
import {
  usePinnedMessages,
  useSearchMessages,
} from '../../hooks/useChatMessages';
import {
  getConversationDisplayAvatar,
  getConversationDisplayName,
  getMessageSenderDisplayName,
} from '../../utils/chat-message.utils';
import { chatStore, useChatStore } from '../../store/useChatStore';

interface ChatThreadHeaderProps {
  conversation: ChatConversation;
  isPeerOnline: boolean;
  onMobileBack: () => void;
  onSummarize: () => void;
  isSummarizing: boolean;
  onOpenSessions: () => void;
}

export function ChatThreadHeader({
  conversation,
  isPeerOnline,
  onMobileBack,
  onSummarize,
  isSummarizing,
  onOpenSessions,
}: ChatThreadHeaderProps) {
  const locale = useLocale();
  const tHeader = useTranslations('chat.header');
  const tCommon = useTranslations('chat.common');
  const dateLocale = locale.toLowerCase().startsWith('en') ? 'en-US' : 'vi-VN';

  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const isDebouncing = searchTerm.trim() !== debouncedSearchTerm.trim();
  const [showAllPinned, setShowAllPinned] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const rightPanelMode = useChatStore((s) => s.rightPanelMode);
  const theme = resolveChatTheme(conversation.themeKey);
  const displayName = getConversationDisplayName(conversation, {
    directFallback: tCommon('conversationFallback'),
    groupFallback: tCommon('groupFallback'),
  });
  const rawAvatarUrl = getConversationDisplayAvatar(conversation);
  const avatarUrl =
    rawAvatarUrl && rawAvatarUrl !== failedAvatarUrl ? rawAvatarUrl : null;
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  const { data: searchResults = [], isFetching: isSearching } = useSearchMessages(
    showSearch ? conversation.id : null,
    debouncedSearchTerm
  );
  const { data: pinnedList = [] } = usePinnedMessages(
    conversation.id,
    conversation.pinnedCount > 0 || showAllPinned
  );

  const subtitle =
    conversation.type === 'DIRECT'
      ? isPeerOnline
        ? tHeader('online')
        : tHeader('offline')
      : `${tHeader('membersCount', { count: conversation.memberCount })}${
          conversation.className ? ` • ${conversation.className}` : ''
        }`;

  const handleJumpToMessage = (messageId: string) => {
    chatStore.setState({ highlightedMessageId: messageId });
    const el = document.getElementById(`chat-msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setShowAllPinned(false);
  };

  return (
    <div className={`shrink-0 ${theme.headerClass}`}>
      <div className="px-3 sm:px-5 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onMobileBack}
            aria-label={tHeader('backToList')}
            className={`md:hidden w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors ${theme.headerIconBtnClass}`}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                onError={() => setFailedAvatarUrl(rawAvatarUrl)}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center text-sm font-bold">
                {initial}
              </div>
            )}
            {conversation.type === 'DIRECT' && isPeerOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E1F20]" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className={`text-sm sm:text-base font-bold truncate ${theme.headerTitleClass}`}>
              {displayName}
            </h3>
            <p className={`text-[11px] truncate flex items-center gap-1.5 ${theme.headerSubtitleClass}`}>
              {conversation.type === 'DIRECT' && isPeerOnline && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              )}
              <span>{subtitle}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={isSummarizing}
            onClick={onSummarize}
            title={tHeader('summarizeAiTooltip')}
            className={`hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 ${theme.headerIconBtnClass}`}
          >
            <span className="material-symbols-outlined text-[17px]">
              {isSummarizing ? 'sync' : 'auto_awesome'}
            </span>
            <span className="hidden xl:inline">{tHeader('summarizeAi')}</span>
          </button>

          {conversation.type !== 'DIRECT' && (
            <button
              type="button"
              onClick={onOpenSessions}
              title={tHeader('studySessionsTooltip')}
              aria-label={tHeader('studySessionsAria')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${theme.headerIconBtnClass}`}
            >
              <span className="material-symbols-outlined text-[19px]">calendar_clock</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            title={tHeader('searchTooltip')}
            aria-label={tHeader('searchAria')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              showSearch ? theme.accentBtnClass : theme.headerIconBtnClass
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">search</span>
          </button>

          <button
            type="button"
            onClick={() => chatStore.toggleInfoDrawer()}
            title={tHeader('infoTooltip')}
            aria-label={tHeader('infoAria')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              rightPanelMode === 'info' ? theme.accentBtnClass : theme.headerIconBtnClass
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">info</span>
          </button>
        </div>
      </div>

      {/* Inline Search Bar */}
      {showSearch && (
        <div className="px-4 py-2.5 bg-[#F0F4F9]/70 dark:bg-[#282A2C]/60 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={tHeader('searchInputPlaceholder')}
              className="flex-1 h-9 px-4 rounded-full bg-white dark:bg-[#1E1F20] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchTerm('');
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-[#444746] dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#1E1F20] cursor-pointer"
            >
              {tHeader('closeSearch')}
            </button>
          </div>
          {searchTerm.trim().length >= 2 && (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {isSearching || isDebouncing ? (
                <p className="text-[11px] text-[#747775] px-2">{tHeader('searching')}</p>
              ) : searchResults.length === 0 ? (
                <p className="text-[11px] text-[#747775] px-2">{tHeader('noSearchResults')}</p>
              ) : (
                searchResults.map((msg: ChatMessage) => (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => handleJumpToMessage(msg.id)}
                    className="w-full text-left px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1F20] hover:bg-[#D3E3FD]/40 text-xs flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="truncate">
                      <strong>
                        {getMessageSenderDisplayName(msg, {
                          aiSenderName: tCommon('aiSenderName'),
                          fallbackUser: tCommon('user'),
                        })}
                        :
                      </strong>{' '}
                      {msg.content}
                    </span>
                    <span className="text-[10px] text-[#747775] shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString(dateLocale)}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Pinned Message Bar */}
      {(conversation.latestPinnedMessage || pinnedList.length > 0) && (
        <div className="px-4 py-2 bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              const targetId =
                conversation.latestPinnedMessage?.id || pinnedList[0]?.id;
              if (targetId) handleJumpToMessage(targetId);
            }}
            className="flex items-center gap-2 min-w-0 text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">
              push_pin
            </span>
            <span className="truncate text-[#1F1F1F] dark:text-[#E3E3E3]">
              <strong>
                {conversation.latestPinnedMessage
                  ? getMessageSenderDisplayName(conversation.latestPinnedMessage, {
                      aiSenderName: tCommon('aiSenderName'),
                      fallbackUser: tCommon('user'),
                    })
                  : getMessageSenderDisplayName(pinnedList[0], {
                      aiSenderName: tCommon('aiSenderName'),
                      fallbackUser: tCommon('user'),
                    })}
                :
              </strong>{' '}
              {conversation.latestPinnedMessage?.contentPreview ||
                pinnedList[0]?.content ||
                tHeader('pinnedFallback')}
            </span>
          </button>
          {(conversation.pinnedCount > 1 || pinnedList.length > 1) && (
            <button
              type="button"
              onClick={() => setShowAllPinned((prev) => !prev)}
              className="text-[11px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA] shrink-0 cursor-pointer"
            >
              {showAllPinned
                ? tHeader('collapsePinned')
                : tHeader('showAllPinned', {
                    count: conversation.pinnedCount || pinnedList.length,
                  })}
            </button>
          )}
        </div>
      )}

      {showAllPinned && pinnedList.length > 0 && (
        <div className="px-4 py-2 bg-[#F0F4F9]/90 dark:bg-[#282A2C] max-h-44 overflow-y-auto space-y-1.5">
          {pinnedList.map((pinned) => (
            <button
              key={pinned.id}
              type="button"
              onClick={() => handleJumpToMessage(pinned.id)}
              className="w-full text-left px-3 py-2 rounded-xl bg-white dark:bg-[#1E1F20] text-xs flex items-center justify-between gap-2 cursor-pointer"
            >
              <span className="truncate">
                <strong>
                  {getMessageSenderDisplayName(pinned, {
                    aiSenderName: tCommon('aiSenderName'),
                    fallbackUser: tCommon('user'),
                  })}
                  :
                </strong>{' '}
                {pinned.content || tCommon('attachment')}
              </span>
              <span className="text-[10px] text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">
                {tHeader('jumpToMessage')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
