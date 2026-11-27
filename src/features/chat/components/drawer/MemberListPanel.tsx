'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ConfirmDialog } from '@/components/shared';
import { useDebounce } from '@/hooks/useDebounce';
import type { ChatConversation, ChatConversationMember } from '../../schemas/chat.schema';
import { useChatUserSearch, useCreateDirectConversation } from '../../hooks/useConversations';
import { useChatRoomActions } from '../../hooks/useChatRoomActions';
import { useRestrictMember } from '../../hooks/useChatPhase2';
import { chatStore, useChatStore } from '../../store/useChatStore';

interface MemberListPanelProps {
  conversation: ChatConversation;
  members: ChatConversationMember[];
  currentUserId?: string;
}

export function MemberListPanel({
  conversation,
  members,
  currentUserId,
}: MemberListPanelProps) {
  const router = useRouter();
  const t = useTranslations('chat.drawer.members');
  const tCommon = useTranslations('chat.common');
  const [editingNicknameId, setEditingNicknameId] = useState<string | null>(null);
  const [nicknameText, setNicknameText] = useState('');
  const [showAddSearch, setShowAddSearch] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const debouncedUserQuery = useDebounce(userQuery, 800);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const createDirect = useCreateDirectConversation();
  const { data: searchedUsers = [] } = useChatUserSearch(debouncedUserQuery, showAddSearch);
  const {
    nicknameMutation,
    addMembersMutation,
    removeMemberMutation,
    leaveMutation,
  } = useChatRoomActions(conversation.id);
  const restrictMutation = useRestrictMember(conversation.id);

  const isAdmin = conversation.myRole === 'ADMIN';
  const existingIds = new Set(members.map((m) => m.userId));

  const handleSaveNickname = async (userId: string) => {
    await nicknameMutation.mutateAsync({
      targetUserId: userId,
      nickname: nicknameText.trim() || null,
    });
    setEditingNicknameId(null);
  };

  return (
    <div className="space-y-3">
      {isAdmin && conversation.type === 'STUDY_GROUP' && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowAddSearch((p) => !p)}
            className="w-full py-2 px-3 rounded-full bg-[#D3E3FD]/70 dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>{showAddSearch ? t('cancelAddBtn') : t('addMemberBtn')}</span>
          </button>

          {showAddSearch && (
            <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-2.5 space-y-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder={t('searchToAddPlaceholder')}
                className="w-full h-8 px-3 rounded-full bg-white dark:bg-[#1E1F20] text-xs outline-none"
              />
              <div className="max-h-32 overflow-y-auto space-y-1">
                {searchedUsers
                  .filter((u) => !existingIds.has(u.id))
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        void addMembersMutation.mutateAsync([u.id]);
                        setUserQuery('');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-white dark:hover:bg-[#1E1F20] flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="truncate">{u.fullName}</span>
                      <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-semibold">
                        {t('addShort')}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {members.map((m) => {
          const isOnline = Boolean(onlineUsers[m.userId]) || m.isOnline;
          const isSelf = m.userId === currentUserId;
          const isRestricted = Boolean(
            m.restrictedUntil && Date.parse(m.restrictedUntil) > Date.now()
          );

          return (
            <div
              key={m.userId}
              className="p-2 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center text-xs font-bold">
                      {m.fullName.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E1F20]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                      {m.nickname || m.fullName}
                    </p>
                    <p className="text-[10px] text-[#747775] dark:text-[#8E918F] truncate">
                      {m.role === 'ADMIN' ? t('adminBadge') : tCommon('member')}
                      {m.nickname ? ` • ${m.fullName}` : ''}
                      {isRestricted ? ` • ${t('restrictedBadge')}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNicknameId(m.userId);
                      setNicknameText(m.nickname || '');
                    }}
                    title={t('editNicknameTooltip')}
                    className="w-7 h-7 rounded-full hover:bg-white dark:hover:bg-[#1E1F20] flex items-center justify-center text-[#747775] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">badge</span>
                  </button>

                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => {
                        void createDirect
                          .mutateAsync({ targetUserId: m.userId })
                          .then((conv) => {
                            chatStore.setActiveConversation(conv.id);
                            router.replace(`/chat?conversationId=${encodeURIComponent(conv.id)}`, {
                              scroll: false,
                            });
                          });
                      }}
                      title={t('directMsgTooltip')}
                      className="w-7 h-7 rounded-full hover:bg-white dark:hover:bg-[#1E1F20] flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">chat</span>
                    </button>
                  )}

                  {isAdmin && !isSelf && m.role !== 'ADMIN' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          restrictMutation.mutate({
                            userId: m.userId,
                            restrictedUntil: isRestricted
                              ? null
                              : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                            reason: isRestricted ? undefined : t('restrict1hTooltip'),
                          })
                        }
                        title={
                          isRestricted
                            ? t('unrestrictTooltip')
                            : t('restrict1hTooltip')
                        }
                        className="w-7 h-7 rounded-full hover:bg-white dark:hover:bg-[#1E1F20] flex items-center justify-center text-amber-600 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isRestricted ? 'lock_open' : 'block'}
                        </span>
                      </button>
                      {conversation.type === 'STUDY_GROUP' && (
                        <button
                          type="button"
                          onClick={() => removeMemberMutation.mutate(m.userId)}
                          title={t('removeMemberTooltip')}
                          className="w-7 h-7 rounded-full hover:bg-[#F9DEDC]/60 flex items-center justify-center text-[#B3261E] dark:text-[#F28B82] cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            person_remove
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {editingNicknameId === m.userId && (
                <div className="flex items-center gap-1.5 pl-10">
                  <input
                    type="text"
                    value={nicknameText}
                    onChange={(e) => setNicknameText(e.target.value)}
                    placeholder={t('nicknamePlaceholder')}
                    className="flex-1 h-7 px-3 rounded-full bg-[#F0F4F9] dark:bg-[#131314] text-[11px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveNickname(m.userId)}
                    className="px-2.5 h-7 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-[11px] font-semibold cursor-pointer"
                  >
                    {tCommon('save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingNicknameId(null)}
                    className="px-2 h-7 text-[11px] text-[#747775] cursor-pointer"
                  >
                    {tCommon('cancel')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {conversation.type === 'STUDY_GROUP' && (
        <>
          <button
            type="button"
            onClick={() => setConfirmLeave(true)}
            className="w-full py-2 rounded-full bg-[#F9DEDC]/60 dark:bg-[#3C1919] text-[#B3261E] dark:text-[#F28B82] text-xs font-semibold cursor-pointer"
          >
            {t('leaveGroupBtn')}
          </button>

          <ConfirmDialog
            isOpen={confirmLeave}
            title={t('leaveGroupConfirmTitle')}
            message={t('leaveGroupConfirmMsg')}
            confirmText={t('leaveGroupConfirmBtn')}
            variant="danger"
            isLoading={leaveMutation.isPending}
            onConfirm={() => {
              void leaveMutation
                .mutateAsync()
                .then(() => {
                  setConfirmLeave(false);
                  router.replace('/chat', { scroll: false });
                })
                .catch(() => {});
            }}
            onCancel={() => setConfirmLeave(false)}
          />
        </>
      )}
    </div>
  );
}
