'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/sonner';
import { getUserFriendlyErrorMessage } from '@/lib/error-utils';
import { uploadImage } from '@/lib/upload';
import {
  resolveChatTheme,
  type ChatThemeKey,
} from '../../constants/chat-themes';
import type { ChatConversation } from '../../schemas/chat.schema';
import { useChatRoomActions } from '../../hooks/useChatRoomActions';
import { ChatEmojiPickerModal } from '../modals/ChatEmojiPickerModal';
import { ChatThemePreviewModal } from '../modals/ChatThemePreviewModal';

interface AppearanceSettingsPanelProps {
  conversation: ChatConversation;
}

export function AppearanceSettingsPanel({
  conversation,
}: AppearanceSettingsPanelProps) {
  const t = useTranslations('chat.drawer.appearance');
  const tThemes = useTranslations('chat.themes');
  const tCommon = useTranslations('chat.common');
  const tToasts = useTranslations('chat.toasts');
  const { appearanceMutation, settingsMutation } = useChatRoomActions(conversation.id);
  const [groupName, setGroupName] = useState(conversation.name || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);

  const isAdmin = conversation.myRole === 'ADMIN';
  const canEditAppearance =
    conversation.type !== 'CLASS_CHANNEL' || isAdmin;
  const canEditSettings =
    conversation.type !== 'DIRECT' && isAdmin;

  const activeThemeKey = ((conversation.themeKey || 'DEFAULT').toUpperCase() as ChatThemeKey);
  const activeTheme = resolveChatTheme(activeThemeKey);
  const activeEmoji = conversation.defaultEmoji || '👍';

  const handleUploadGroupAvatar = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadImage(file, 'ilms/chat-groups');
      await settingsMutation.mutateAsync({ avatarUrl: uploaded.url });
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err, tToasts('uploadGroupAvatarError')));
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Messenger-style compact actions: Change Theme & Change Emoji */}
      {canEditAppearance && (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="w-full px-3 py-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              {activeTheme.wallpaperUrl ? (
                <img
                  src={activeTheme.wallpaperUrl}
                  alt={tThemes(`items.${activeTheme.key}.label`)}
                  className="w-7 h-7 rounded-full object-cover shrink-0 shadow-xs"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0B57D0] to-[#6366F1] dark:from-[#4C8DF6] dark:to-[#818CF8] flex items-center justify-center shrink-0 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#1E1F20]" />
                </span>
              )}
              <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                {t('changeThemeBtn')}
              </span>
            </div>
            <span className="text-[11px] text-[#747775] dark:text-[#8E918F] truncate shrink-0 max-w-[96px]">
              {tThemes(`items.${activeTheme.key}.label`)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsEmojiModalOpen(true)}
            className="w-full px-3 py-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center gap-3 text-left transition-colors cursor-pointer"
          >
            <span className="w-7 h-7 flex items-center justify-center text-xl leading-none shrink-0">
              {activeEmoji}
            </span>
            <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
              {t('changeEmojiBtn')}
            </span>
          </button>
        </div>
      )}

      {/* Admin Group / Channel Settings */}
      {canEditSettings && (
        <div className="space-y-3 pt-2 border-t border-[#F0F4F9] dark:border-[#282A2C]">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] block">
              {t('groupNameLabel')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="flex-1 h-9 px-3 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none"
              />
              <button
                type="button"
                disabled={!groupName.trim() || settingsMutation.isPending}
                onClick={() => settingsMutation.mutate({ name: groupName.trim() })}
                className="px-3 h-9 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {tCommon('save')}
              </button>
            </div>
          </div>

          {conversation.avatarUrl && (
            <div className="relative h-20 w-full rounded-2xl overflow-hidden bg-[#F0F4F9] dark:bg-[#282A2C]">
              <img
                src={conversation.avatarUrl}
                alt={conversation.name || tCommon('groupFallback')}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer">
            <span>{t('changeGroupCover')}</span>
            <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-semibold">
              {isUploadingAvatar ? tCommon('uploading') : t('choosePhoto')}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleUploadGroupAvatar(e)}
            />
          </label>

          <label className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer">
            <div>
              <p className="font-semibold">{t('readOnlyTitle')}</p>
              <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">
                {t('readOnlyDesc')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={conversation.isReadOnly}
              onChange={(e) =>
                settingsMutation.mutate({ isReadOnly: e.target.checked })
              }
              className="w-4 h-4 accent-[#0B57D0]"
            />
          </label>
        </div>
      )}

      {/* Messenger Theme Preview Modal */}
      <ChatThemePreviewModal
        isOpen={isThemeModalOpen}
        initialThemeKey={activeThemeKey}
        activeThemeKey={activeThemeKey}
        isApplying={appearanceMutation.isPending}
        onClose={() => setIsThemeModalOpen(false)}
        onConfirm={(chosenKey) => {
          appearanceMutation.mutate(
            { themeKey: chosenKey },
            {
              onSuccess: () => {
                setIsThemeModalOpen(false);
              },
            }
          );
        }}
      />

      {/* Messenger Emoji Picker Modal */}
      <ChatEmojiPickerModal
        isOpen={isEmojiModalOpen}
        activeEmoji={activeEmoji}
        isApplying={appearanceMutation.isPending}
        onClose={() => setIsEmojiModalOpen(false)}
        onSelect={(chosenEmoji) => {
          appearanceMutation.mutate(
            { defaultEmoji: chosenEmoji },
            {
              onSuccess: () => {
                setIsEmojiModalOpen(false);
              },
            }
          );
        }}
      />
    </div>
  );
}
