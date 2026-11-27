'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { toast } from '@/components/ui/sonner';
import { getUserFriendlyErrorMessage } from '@/lib/error-utils';
import { uploadImage } from '@/lib/upload';
import type { ChatConversation, ChatConversationMember } from '../../schemas/chat.schema';
import { useChatRoomActions } from '../../hooks/useChatRoomActions';
import {
  getConversationDisplayAvatar,
  getConversationDisplayName,
} from '../../utils/chat-message.utils';
import { AppearanceSettingsPanel } from './AppearanceSettingsPanel';
import { ChannelFaqPanel } from './ChannelFaqPanel';
import { MemberListPanel } from './MemberListPanel';
import { ModerationPanel } from './ModerationPanel';
import { SharedAttachmentsPanel } from './SharedAttachmentsPanel';
import { StudySessionPanel } from './StudySessionPanel';

export type InfoAccordionKey =
  | 'appearance'
  | 'members'
  | 'attachments'
  | 'faqs'
  | 'sessions'
  | 'moderation';

interface ConversationInfoDrawerProps {
  conversation: ChatConversation;
  members: ChatConversationMember[];
  currentUserId?: string;
  initialOpenSection?: InfoAccordionKey;
  onClose: () => void;
}

export function ConversationInfoDrawer({
  conversation,
  members,
  currentUserId,
  initialOpenSection = 'appearance',
  onClose,
}: ConversationInfoDrawerProps) {
  const t = useTranslations('chat.drawer');
  const tToasts = useTranslations('chat.toasts');
  const [openSection, setOpenSection] = useState<InfoAccordionKey | null>(
    initialOpenSection
  );
  const [showMuteOptions, setShowMuteOptions] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const { muteMutation, settingsMutation } = useChatRoomActions(conversation.id);
  const displayName = getConversationDisplayName(conversation);
  const rawAvatarUrl = getConversationDisplayAvatar(conversation);
  const avatarUrl = rawAvatarUrl && rawAvatarUrl !== failedAvatarUrl ? rawAvatarUrl : null;
  const isMuted = Boolean(
    conversation.mutedUntil && Date.parse(conversation.mutedUntil) > Date.now()
  );
  const isAdmin = conversation.myRole === 'ADMIN';

  const handleUploadGroupCover = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const uploaded = await uploadImage(file, 'ilms/chat-groups');
      await settingsMutation.mutateAsync({ avatarUrl: uploaded.url });
      setFailedAvatarUrl(null);
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err, tToasts('uploadGroupAvatarError')));
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const toggleSection = (key: InfoAccordionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const handleMute = (hours: number | null) => {
    if (hours === null) {
      muteMutation.mutate(null);
    } else {
      const until = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      muteMutation.mutate(until);
    }
    setShowMuteOptions(false);
  };

  return (
    <aside className="w-full xl:w-80 shrink-0 bg-white dark:bg-[#1E1F20] rounded-3xl flex flex-col overflow-hidden shadow-xs dark:shadow-none h-full">
      <div className="px-4 h-16 flex items-center justify-between border-b border-[#F0F4F9] dark:border-[#282A2C] shrink-0">
        <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
          {t('infoTitle')}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('closeInfoAria')}
          className="w-8 h-8 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Profile Header (with Group Cover Banner for Group/Channel) */}
        <div className="flex flex-col items-center text-center">
          {conversation.type !== 'DIRECT' ? (
            <>
              <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#D3E3FD] via-[#E8F0FE] to-[#C4EED0] dark:from-[#162B4D] dark:via-[#1E293B] dark:to-[#142E20]">
                {avatarUrl && (
                  <>
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      onError={() => setFailedAvatarUrl(rawAvatarUrl)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  </>
                )}
                {isAdmin && (
                  <label
                    title={t('changeCoverTitle')}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/55 hover:bg-black/75 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer backdrop-blur-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isUploadingCover ? 'sync' : 'photo_camera'}
                    </span>
                    <span>{isUploadingCover ? t('uploadingCover') : t('changeCoverBtn')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handleUploadGroupCover(e)}
                    />
                  </label>
                )}
              </div>

              <div className="-mt-9 relative z-10 mb-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    onError={() => setFailedAvatarUrl(rawAvatarUrl)}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-[#1E1F20] shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center text-xl font-bold ring-4 ring-white dark:ring-[#1E1F20] shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mb-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  onError={() => setFailedAvatarUrl(rawAvatarUrl)}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center text-xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          <div className="space-y-0.5 mb-2">
            <h4 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {displayName}
            </h4>
            {conversation.courseTitle && (
              <p className="text-xs text-[#444746] dark:text-[#8E918F]">
                {conversation.courseTitle}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  isMuted ? handleMute(null) : setShowMuteOptions((p) => !p)
                }
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-[#1F1F1F] dark:text-[#E3E3E3]">
                  <span className="material-symbols-outlined text-[18px]">
                    {isMuted ? 'notifications_off' : 'notifications'}
                  </span>
                </span>
                <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">
                  {isMuted ? t('turnOnNotif') : t('muteNotif')}
                </span>
              </button>
              {showMuteOptions && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-40 rounded-2xl bg-white dark:bg-[#282A2C] shadow-xl py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => handleMute(1)}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#F0F4F9] dark:hover:bg-[#333537] cursor-pointer"
                  >
                    {t('mute1h')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMute(8)}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#F0F4F9] dark:hover:bg-[#333537] cursor-pointer"
                  >
                    {t('mute8h')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMute(24 * 365)}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#F0F4F9] dark:hover:bg-[#333537] cursor-pointer"
                  >
                    {t('muteForever')}
                  </button>
                </div>
              )}
            </div>

            {conversation.classId && (
              <Link
                href={`/classes/${encodeURIComponent(conversation.classId)}`}
                className="flex flex-col items-center gap-1"
              >
                <span className="w-9 h-9 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA]">
                  <span className="material-symbols-outlined text-[18px]">school</span>
                </span>
                <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">
                  {t('goToClass')}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-2">
          {/* 1. Appearance */}
          <AccordionBlock
            title={t('secAppearance')}
            icon="palette"
            isOpen={openSection === 'appearance'}
            onToggle={() => toggleSection('appearance')}
          >
            <AppearanceSettingsPanel conversation={conversation} />
          </AccordionBlock>

          {/* 2. Members */}
          <AccordionBlock
            title={t('secMembers', {
              count: members.length || conversation.memberCount,
            })}
            icon="group"
            isOpen={openSection === 'members'}
            onToggle={() => toggleSection('members')}
          >
            <MemberListPanel
              conversation={conversation}
              members={members}
              currentUserId={currentUserId}
            />
          </AccordionBlock>

          {/* 3. Shared Attachments */}
          <AccordionBlock
            title={t('secAttachments')}
            icon="folder_open"
            isOpen={openSection === 'attachments'}
            onToggle={() => toggleSection('attachments')}
          >
            <SharedAttachmentsPanel conversationId={conversation.id} />
          </AccordionBlock>

          {/* 4. Channel FAQs (Phase 2.3) */}
          {conversation.type !== 'DIRECT' && (
            <AccordionBlock
              title={t('secFaqs')}
              icon="quiz"
              isOpen={openSection === 'faqs'}
              onToggle={() => toggleSection('faqs')}
            >
              <ChannelFaqPanel conversationId={conversation.id} />
            </AccordionBlock>
          )}

          {/* 5. Study Sessions & Pomodoro (Phase 2.4) */}
          {conversation.type !== 'DIRECT' && (
            <AccordionBlock
              title={t('secSessions')}
              icon="calendar_clock"
              isOpen={openSection === 'sessions'}
              onToggle={() => toggleSection('sessions')}
            >
              <StudySessionPanel conversationId={conversation.id} />
            </AccordionBlock>
          )}

          {/* 6. Moderation & Exam Lock (Phase 2.6 - Admin only) */}
          {isAdmin && conversation.type !== 'DIRECT' && (
            <AccordionBlock
              title={t('secModeration')}
              icon="shield_person"
              isOpen={openSection === 'moderation'}
              onToggle={() => toggleSection('moderation')}
            >
              <ModerationPanel conversation={conversation} />
            </AccordionBlock>
          )}
        </div>
      </div>
    </aside>
  );
}

function AccordionBlock({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3 py-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-between gap-2 text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[17px] text-[#0B57D0] dark:text-[#A8C7FA]">
            {icon}
          </span>
          <span>{title}</span>
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#747775]">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {isOpen && <div className="px-1 pt-2 pb-1">{children}</div>}
    </div>
  );
}
