'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import { uploadImage } from '@/lib/upload';
import { toast } from '@/components/ui/sonner';
import { getUserFriendlyErrorMessage } from '@/lib/error-utils';
import type { ChatUserSummary } from '../../schemas/chat.schema';
import {
  useChatUserSearch,
  useCreateDirectConversation,
  useCreateStudyGroup,
} from '../../hooks/useConversations';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onCreated,
}: NewConversationModalProps) {
  const tSidebar = useTranslations('chat.sidebar');
  const tCommon = useTranslations('chat.common');
  const tToast = useTranslations('chat.toasts');
  const [mode, setMode] = useState<'direct' | 'group'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupAvatarUrl, setGroupAvatarUrl] = useState('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<ChatUserSummary[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 800);
  const isDebouncing = searchQuery.trim() !== debouncedSearch.trim();

  const { data: users = [], isLoading: isSearching } = useChatUserSearch(
    debouncedSearch,
    isOpen
  );
  const createDirect = useCreateDirectConversation();
  const createGroup = useCreateStudyGroup();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  if (!isOpen) return null;

  const displayAvatarUrl = groupAvatarUrl || localPreviewUrl;

  const handleClearGroupAvatar = () => {
    setGroupAvatarUrl('');
    setLocalPreviewUrl('');
  };

  const handleToggleMember = (user: ChatUserSummary) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === user.id)
        ? prev.filter((m) => m.id !== user.id)
        : [...prev, user]
    );
  };

  const handleUploadGroupAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setIsUploadingAvatar(true);
    try {
      const res = await uploadImage(file, 'ilms/chat-groups');
      setGroupAvatarUrl(res.url);
    } catch (err) {
      setLocalPreviewUrl('');
      toast.error(getUserFriendlyErrorMessage(err, tToast('uploadNewGroupAvatarError')));
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handlePickDirectUser = async (userId: string) => {
    try {
      const conv = await createDirect.mutateAsync({ targetUserId: userId });
      onCreated(conv.id);
      onClose();
    } catch {
      // Handled by useCreateDirectConversation.onError
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0 || isUploadingAvatar) return;
    try {
      const conv = await createGroup.mutateAsync({
        name: groupName.trim(),
        avatarUrl: groupAvatarUrl || undefined,
        memberIds: selectedMembers.map((m) => m.id),
      });
      setGroupName('');
      handleClearGroupAvatar();
      setSelectedMembers([]);
      onCreated(conv.id);
      onClose();
    } catch {
      // Handled by useCreateStudyGroup.onError
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tSidebar('newModalAria')}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {tSidebar('newModalTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon('close')}
            className="w-8 h-8 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]">
          <button
            type="button"
            onClick={() => setMode('direct')}
            className={`py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              mode === 'direct'
                ? 'bg-white dark:bg-[#1E1F20] text-[#041E49] dark:text-[#A8C7FA] shadow-xs'
                : 'text-[#444746] dark:text-[#C4C7C5]'
            }`}
          >
            {tSidebar('modeDirect')}
          </button>
          <button
            type="button"
            onClick={() => setMode('group')}
            className={`py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              mode === 'group'
                ? 'bg-white dark:bg-[#1E1F20] text-[#041E49] dark:text-[#A8C7FA] shadow-xs'
                : 'text-[#444746] dark:text-[#C4C7C5]'
            }`}
          >
            {tSidebar('modeGroup')}
          </button>
        </div>

        {mode === 'group' && (
          <div className="space-y-3">
            {/* Group Cover & Avatar Preview */}
            <div className="relative h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#D3E3FD] to-[#E8F0FE] dark:from-[#162B4D] dark:to-[#1E293B]">
              {displayAvatarUrl ? (
                <>
                  <img
                    src={displayAvatarUrl}
                    alt={tSidebar('coverAlt')}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2.5">
                    <img
                      src={displayAvatarUrl}
                      alt={tSidebar('avatarAlt')}
                      className="w-11 h-11 rounded-full ring-2 ring-white object-cover shrink-0"
                    />
                    <span className="text-xs font-bold text-white truncate">
                      {groupName.trim() || tSidebar('newGroupPlaceholder')}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <label className="px-2.5 py-1 rounded-full bg-black/55 hover:bg-black/75 text-white text-[11px] font-semibold cursor-pointer backdrop-blur-xs">
                      {tSidebar('changePhoto')}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handleUploadGroupAvatar(e)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleClearGroupAvatar}
                      aria-label={tSidebar('removePhotoAria')}
                      className="w-6 h-6 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer backdrop-blur-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-[24px] text-[#0B57D0] dark:text-[#A8C7FA]">
                    add_photo_alternate
                  </span>
                  <span className="text-xs font-semibold text-[#041E49] dark:text-[#A8C7FA]">
                    {tSidebar('addGroupPhoto')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleUploadGroupAvatar(e)}
                  />
                </label>
              )}

              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center gap-2 text-white text-xs font-semibold">
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    sync
                  </span>
                  <span>{tSidebar('uploadingPhoto')}</span>
                </div>
              )}
            </div>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={tSidebar('groupNamePlaceholder')}
              className="w-full h-10 px-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none"
            />

            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedMembers.map((member) => (
                  <span
                    key={member.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-xs font-medium"
                  >
                    <span>{member.fullName || tCommon('member')}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleMember(member)}
                      className="hover:opacity-70 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-[#747775]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tSidebar('searchUserPlaceholder')}
            className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none"
          />
        </div>

        <div className="max-h-56 overflow-y-auto space-y-1">
          {searchQuery.trim().length === 0 ? (
            <p className="text-xs text-center text-[#747775] dark:text-[#8E918F] py-6">
              {tSidebar('searchUserHint')}
            </p>
          ) : isSearching || isDebouncing ? (
            <div className="py-6 text-center text-xs text-[#747775]">
              {tSidebar('searchingUsers')}
            </div>
          ) : users.length === 0 ? (
            <p className="text-xs text-center text-[#747775] py-6">
              {tSidebar('noUsersFound')}
            </p>
          ) : (
            users.map((user) => {
              const isPicked = selectedMembers.some((m) => m.id === user.id);
              const name = user.fullName || tCommon('user');
              return (
                <button
                  key={user.id}
                  type="button"
                  disabled={createDirect.isPending}
                  onClick={() =>
                    mode === 'direct'
                      ? void handlePickDirectUser(user.id)
                      : handleToggleMember(user)
                  }
                  className="w-full px-3 py-2 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center text-xs font-bold shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                        {name}
                      </p>
                      {user.email && (
                        <p className="text-[11px] text-[#747775] dark:text-[#8E918F] truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {mode === 'group' && (
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isPicked
                          ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          : 'text-[#8E918F]'
                      }`}
                    >
                      {isPicked ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {mode === 'group' && (
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] cursor-pointer"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="button"
              disabled={
                !groupName.trim() ||
                selectedMembers.length === 0 ||
                createGroup.isPending ||
                isUploadingAvatar
              }
              onClick={(e) => void handleCreateGroup(e)}
              className="px-5 py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {isUploadingAvatar
                ? tSidebar('uploadingPhoto')
                : createGroup.isPending
                  ? tSidebar('creating')
                  : tSidebar('createGroupBtn', { count: selectedMembers.length })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
