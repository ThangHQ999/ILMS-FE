'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ErrorState } from '@/components/shared';
import { useDebounce } from '@/hooks/useDebounce';
import { useCurrentUser } from '@/features/auth';
import { useConversations, useCreateDirectConversation } from '../../hooks/useConversations';
import {
  chatStore,
  useChatStore,
  type SidebarFilterTab,
} from '../../store/useChatStore';
import { filterConversations } from '../../utils/chat-message.utils';
import { ActiveUsersStrip } from './ActiveUsersStrip';
import { BookmarksPanel } from './BookmarksPanel';
import { ConversationListItem } from './ConversationListItem';

interface ConversationSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  onOpenNewModal: () => void;
  onOpenMatchingModal: () => void;
}

const FILTER_TABS: Array<{
  key: SidebarFilterTab;
  labelKey: 'tabAll' | 'tabUnread' | 'tabGroups' | 'tabClasses' | 'tabBookmarks';
}> = [
  { key: 'ALL', labelKey: 'tabAll' },
  { key: 'UNREAD', labelKey: 'tabUnread' },
  { key: 'STUDY_GROUP', labelKey: 'tabGroups' },
  { key: 'CLASS_CHANNEL', labelKey: 'tabClasses' },
  { key: 'BOOKMARKS', labelKey: 'tabBookmarks' },
];

export function ConversationSidebar({
  onSelectConversation,
  onOpenNewModal,
  onOpenMatchingModal,
}: ConversationSidebarProps) {
  const tChat = useTranslations('chat');
  const tSidebar = useTranslations('chat.sidebar');
  const { data: currentUser } = useCurrentUser();
  const [searchText, setSearchText] = useState('');

  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const sidebarTab = useChatStore((s) => s.sidebarTab);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const debouncedSearch = useDebounce(searchText, 800);
  const isDebouncing = searchText.trim() !== debouncedSearch.trim();

  const queryParams =
    sidebarTab === 'BOOKMARKS'
      ? undefined
      : {
          type:
            sidebarTab === 'STUDY_GROUP' || sidebarTab === 'CLASS_CHANNEL'
              ? sidebarTab
              : undefined,
          unreadOnly: sidebarTab === 'UNREAD' ? true : undefined,
          q: debouncedSearch.trim() || undefined,
        };

  const { data: conversations = [], isLoading, isFetching, isError, refetch } =
    useConversations(queryParams, sidebarTab !== 'BOOKMARKS');
  const createDirect = useCreateDirectConversation();

  const visibleConversations = useMemo(
    () =>
      filterConversations(conversations, {
        tab: sidebarTab,
        query: searchText,
      }),
    [conversations, sidebarTab, searchText]
  );

  const onlineList = Object.values(onlineUsers);
  const hasFilters = Boolean(searchText.trim()) || sidebarTab !== 'ALL';

  const handleOpenPeerChat = async (targetUserId: string) => {
    try {
      const conv = await createDirect.mutateAsync({ targetUserId });
      onSelectConversation(conv.id);
    } catch {
      // Handled by useCreateDirectConversation.onError
    }
  };

  return (
    <aside className="w-full md:w-80 shrink-0 bg-white dark:bg-[#1E1F20] rounded-3xl flex flex-col overflow-hidden shadow-xs dark:shadow-none">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight">
          {tChat('title')}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenMatchingModal}
            title={tSidebar('studyMatchingTitle')}
            className="h-9 px-3 rounded-full bg-[#D3E3FD]/70 dark:bg-[#162B4D] hover:brightness-95 text-[#041E49] dark:text-[#A8C7FA] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">diversity_3</span>
            <span className="hidden sm:inline">{tSidebar('studyMatchingShort')}</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewModal}
            aria-label={tChat('newChat')}
            title={tSidebar('newChatTitle')}
            className="w-9 h-9 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">edit_square</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#747775] dark:text-[#8E918F]">
            search
          </span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={tChat('searchPlaceholder')}
            aria-label={tChat('searchPlaceholder')}
            className="w-full h-9 pl-10 pr-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] outline-none focus:ring-2 focus:ring-[#0B57D0]/30 dark:focus:ring-[#A8C7FA]/30"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText('')}
              aria-label={tSidebar('resetFilters')}
              className="absolute right-2.5 text-[#747775] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-3 pb-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const active = sidebarTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => chatStore.setState({ sidebarTab: tab.key })}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#A8C7FA] dark:text-[#062E6F] font-semibold'
                  : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
              }`}
            >
              {tSidebar(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Active Now Strip */}
      {sidebarTab !== 'BOOKMARKS' && (
        <ActiveUsersStrip
          users={onlineList}
          currentUserId={currentUser?.id}
          isLoading={createDirect.isPending}
          onSelectUser={(id) => void handleOpenPeerChat(id)}
        />
      )}

      {/* List Body (7-State Matrix) */}
      <div
        className={`flex-1 overflow-y-auto px-2 pb-3 ${
          isFetching && !isLoading ? 'opacity-75 transition-opacity' : ''
        }`}
      >
        {sidebarTab === 'BOOKMARKS' ? (
          <BookmarksPanel />
        ) : isLoading || ((isDebouncing || isFetching) && visibleConversations.length === 0) ? (
          <div className="space-y-2 p-2" role="status">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2">
                <div className="w-12 h-12 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
                  <div className="h-3 w-4/5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-3">
            <ErrorState
              title={tSidebar('loadError')}
              onRetry={() => void refetch()}
            />
          </div>
        ) : visibleConversations.length === 0 && hasFilters ? (
          <div className="p-6 text-center space-y-3">
            <span className="material-symbols-outlined text-[36px] text-[#747775] dark:text-[#8E918F]">
              search_off
            </span>
            <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
              {tSidebar('noMatchingChats')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchText('');
                chatStore.setState({ sidebarTab: 'ALL' });
              }}
              className="px-4 py-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer"
            >
              {tSidebar('resetFilters')}
            </button>
          </div>
        ) : visibleConversations.length === 0 ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
            </div>
            <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {tSidebar('emptyListTitle')}
            </p>
            <p className="text-xs text-[#444746] dark:text-[#8E918F]">
              {tSidebar('emptyListSubtitle')}
            </p>
            <button
              type="button"
              onClick={onOpenNewModal}
              className="px-4 py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-xs font-semibold cursor-pointer"
            >
              {tSidebar('createNewBtn')}
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {visibleConversations.map((conv) => {
              const peerOnline =
                conv.type === 'DIRECT' && conv.peerUser?.id
                  ? Boolean(onlineUsers[conv.peerUser.id]) || conv.peerUser.isOnline
                  : false;
              return (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  isPeerOnline={peerOnline}
                  onSelect={onSelectConversation}
                />
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
