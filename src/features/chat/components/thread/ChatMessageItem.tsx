'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import {
  QUICK_REACTION_EMOJIS,
  resolveChatTheme,
} from '../../constants/chat-themes';
import type { ChatConversation, ChatMessage } from '../../schemas/chat.schema';
import { chatStore } from '../../store/useChatStore';
import {
  formatChatHoverTooltip,
  getMessageSenderDisplayName,
  resolveIsMine,
  type ChatTimestampLabels,
  type DisplayGroupedMessage,
} from '../../utils/chat-message.utils';
import { AiReplyBubble } from './cards/AiReplyBubble';
import { CodeSnippetCard } from './cards/CodeSnippetCard';
import { PollMessageCard } from './cards/PollMessageCard';
import { ResourceShareCard } from './cards/ResourceShareCard';

interface ChatMessageItemProps {
  grouped: DisplayGroupedMessage;
  conversation: ChatConversation;
  currentUserId?: string;
  isInstructor?: boolean;
  isHighlighted?: boolean;
  isLockedForMe: boolean;
  inThreadView?: boolean;
  timestampLabels?: ChatTimestampLabels;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: ChatMessage) => void;
  onOpenThread: (messageId: string) => void;
  onAskAiAbout: (message: ChatMessage) => void;
  onGenerateAiDraft?: (messageId: string) => void;
  onBookmark: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => void;
  onReport: (message: ChatMessage) => void;
  onVotePoll: (pollId: string, optionIds: string[]) => void;
  onPreviewImage: (url: string) => void;
}

export function ChatMessageItem({
  grouped,
  conversation,
  currentUserId,
  isInstructor = false,
  isHighlighted = false,
  isLockedForMe,
  inThreadView = false,
  timestampLabels,
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
  onPreviewImage,
}: ChatMessageItemProps) {
  const t = useTranslations('chat.messages');
  const tCommon = useTranslations('chat.common');
  const { message, isFirstInGroup, isLastInGroup, showDateDivider, dateDividerLabel } =
    grouped;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } | null>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const bubbleWrapRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoverTooltipPos, setHoverTooltipPos] = useState<{
    top: number;
    left?: number;
    right?: number;
    placement: 'side' | 'above';
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content ?? '');

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const isMine = resolveIsMine(message, currentUserId);
  const isAdmin = conversation.myRole === 'ADMIN';
  const theme = resolveChatTheme(conversation.themeKey);
  const senderLabels = {
    aiSenderName: tCommon('aiSenderName'),
    fallbackUser: tCommon('user'),
  };
  const resolvedSenderName = getMessageSenderDisplayName(message, senderLabels);
  const resolvedReplySenderName = message.replyTo
    ? getMessageSenderDisplayName(message.replyTo, senderLabels)
    : '';

  const canPin =
    conversation.type !== 'CLASS_CHANNEL' || isAdmin;
  const canDelete = (isMine || isAdmin) && !message.isDeleted;
  const canEdit =
    isMine &&
    !message.isDeleted &&
    (message.messageType === 'TEXT' || message.messageType === 'CODE');
  const canAiDraft =
    isInstructor &&
    !isMine &&
    !message.isDeleted &&
    message.senderType === 'USER' &&
    Boolean(onGenerateAiDraft);

  const hoverTimestamp = formatChatHoverTooltip(message.createdAt, {
    labels: timestampLabels,
  });

  const handleBubbleMouseEnter = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    if (isEditing || message.isDeleted || !hoverTimestamp) return;
    hoverTimerRef.current = setTimeout(() => {
      const el = bubbleWrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!isMine) {
        if (rect.left >= 140) {
          setHoverTooltipPos({
            top: rect.top + rect.height / 2,
            right: Math.max(8, window.innerWidth - rect.left + 10),
            placement: 'side',
          });
        } else {
          setHoverTooltipPos({
            top: Math.max(12, rect.top - 8),
            left: Math.max(8, rect.left),
            placement: 'above',
          });
        }
      } else if (window.innerWidth - rect.right >= 160) {
        setHoverTooltipPos({
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
          placement: 'side',
        });
      } else {
        setHoverTooltipPos({
          top: Math.max(12, rect.top - 8),
          right: Math.max(8, window.innerWidth - rect.right),
          placement: 'above',
        });
      }
    }, 200);
  };

  const handleBubbleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoverTooltipPos(null);
  };

  const dateDividerEl = showDateDivider ? (
    <div className="py-3 flex justify-center">
      <span
        className={`px-3 py-1 rounded-full text-[11px] font-medium ${theme.dateDividerClass}`}
      >
        {dateDividerLabel}
      </span>
    </div>
  ) : null;

  if (message.senderType === 'SYSTEM' || message.messageType === 'SYSTEM') {
    return (
      <>
        {dateDividerEl}
        <div
          id={`chat-msg-${message.id}`}
          className="py-1.5 px-4 flex justify-center text-center text-[11px]"
        >
          <span
            className={`inline-block px-3 py-1 rounded-full font-medium ${theme.systemMessageClass}`}
          >
            {message.content}
          </span>
        </div>
      </>
    );
  }

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    await onEdit(message.id, editText.trim());
    setIsEditing(false);
  };

  const bubbleRadius = isMine
    ? `${isFirstInGroup ? 'rounded-tr-2xl' : 'rounded-tr-[6px]'} ${
        isLastInGroup ? 'rounded-br-2xl' : 'rounded-br-[6px]'
      } rounded-l-2xl`
    : `${isFirstInGroup ? 'rounded-tl-2xl' : 'rounded-tl-[6px]'} ${
        isLastInGroup ? 'rounded-bl-2xl' : 'rounded-bl-[6px]'
      } rounded-r-2xl`;

  const renderContent = () => {
    if (message.isDeleted) {
      return (
        <div className="px-3.5 py-2 rounded-2xl border border-[#E1E5EA] dark:border-[#333537] text-xs italic text-[#747775] dark:text-[#8E918F]">
          {t('recalled')}
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="w-72 sm:w-96 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 space-y-2">
          <textarea
            rows={2}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1F20] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none resize-none"
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 rounded-full text-[11px] font-medium text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="button"
              onClick={() => void handleSaveEdit()}
              className="px-3 py-1 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-[11px] font-semibold cursor-pointer"
            >
              {tCommon('save')}
            </button>
          </div>
        </div>
      );
    }

    if (message.messageType === 'AI_REPLY' || message.senderType === 'AI') {
      return (
        <AiReplyBubble
          content={message.content || ''}
          citedSources={message.citedSources}
          theme={theme}
        />
      );
    }

    if (message.messageType === 'POLL' && message.poll) {
      return <PollMessageCard poll={message.poll} onVote={onVotePoll} />;
    }

    if (message.messageType === 'CODE') {
      return (
        <CodeSnippetCard
          code={message.content || ''}
          language={message.codeLanguage}
        />
      );
    }

    if (message.messageType === 'RESOURCE_SHARE' && message.sharedResource) {
      return (
        <ResourceShareCard resource={message.sharedResource} isMine={isMine} />
      );
    }

    if (message.messageType === 'IMAGE' && message.attachment) {
      const imgUrl = message.attachment.directUrl || message.attachment.fileUrl;
      return (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onPreviewImage(imgUrl)}
            className="block rounded-2xl overflow-hidden max-w-[260px] cursor-pointer"
          >
            <img
              src={imgUrl}
              alt={message.attachment.fileName}
              className="max-h-64 w-auto object-cover"
            />
          </button>
          {message.content && (
            <div
              className={`px-3.5 py-2 text-xs sm:text-sm ${bubbleRadius} ${
                isMine
                  ? theme.myBubbleClass
                  : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3]'
              }`}
            >
              {message.content}
            </div>
          )}
        </div>
      );
    }

    if (message.messageType === 'FILE' && message.attachment) {
      return (
        <a
          href={message.attachment.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2.5 px-3.5 py-2.5 ${bubbleRadius} ${
            isMine
              ? theme.myBubbleClass
              : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">
            description
          </span>
          <div className="min-w-0 text-left">
            <p className="text-xs font-semibold truncate max-w-[220px]">
              {message.attachment.fileName}
            </p>
            {message.attachment.fileSizeBytes && (
              <p className="text-[10px] opacity-80">
                {(message.attachment.fileSizeBytes / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
          <span className="material-symbols-outlined text-[18px] shrink-0">
            download
          </span>
        </a>
      );
    }

    return (
      <div
        className={`px-3.5 py-2 text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed ${bubbleRadius} ${
          isMine ? theme.myBubbleClass : theme.peerBubbleClass
        } ${message.optimisticStatus === 'sending' ? 'opacity-70' : ''}`}
      >
        {message.content}
        {message.editedAt && (
          <span className="ml-1.5 text-[10px] opacity-70">{t('edited')}</span>
        )}
      </div>
    );
  };

  return (
    <>
      {dateDividerEl}
      <div
        id={`chat-msg-${message.id}`}
        className={`group flex items-end gap-2 px-3 sm:px-5 ${
          isLastInGroup ? 'mb-2.5' : 'mb-0.5'
        } ${isMine ? 'flex-row-reverse' : 'flex-row'} ${
          isHighlighted
            ? 'bg-black/5 dark:bg-white/5 py-1 rounded-2xl transition-colors'
            : ''
        }`}
      >
        {/* Avatar slot on left for others */}
        {!isMine && (
          <div className="w-8 shrink-0">
            {isLastInGroup &&
              (message.senderType === 'AI' ? (
                <div
                  className={`w-8 h-8 rounded-full p-0.5 overflow-hidden flex items-center justify-center ${theme.aiAvatarClass}`}
                >
                  <img
                    src="/socratic_mascot.png"
                    alt={resolvedSenderName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : message.sender?.avatarUrl && !message.isAnonymous ? (
                <img
                  src={message.sender.avatarUrl}
                  alt={resolvedSenderName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center justify-center text-xs font-bold">
                  {message.isAnonymous
                    ? '?'
                    : resolvedSenderName.charAt(0).toUpperCase()}
                </div>
              ))}
          </div>
        )}

        {/* Bubble column */}
        <div
          className={`max-w-[78%] sm:max-w-[68%] flex flex-col ${
            isMine ? 'items-end' : 'items-start'
          }`}
        >
          {/* Sender name above first message of group in Group/Class rooms */}
          {!isMine &&
            isFirstInGroup &&
            (conversation.type !== 'DIRECT' || message.senderType === 'AI') && (
              <span
                className={`text-[11px] font-medium mb-1 ${
                  theme.wallpaperUrl
                    ? `px-2 py-0.5 rounded-full ${theme.dateDividerClass}`
                    : 'text-[#444746] dark:text-[#8E918F] px-1'
                }`}
              >
                {resolvedSenderName}
              </span>
            )}

          {/* Quote reply preview */}
          {message.replyTo && !message.isDeleted && (
            <button
              type="button"
              onClick={() => {
                const targetId = message.replyTo!.id;
                const el = document.getElementById(`chat-msg-${targetId}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (chatStore.getState().highlightedMessageId === targetId) {
                  chatStore.setState({ highlightedMessageId: null });
                  window.requestAnimationFrame(() => {
                    chatStore.setState({ highlightedMessageId: targetId });
                  });
                } else {
                  chatStore.setState({ highlightedMessageId: targetId });
                }
              }}
              className="mb-1 px-3 py-1.5 rounded-xl bg-[#F0F4F9]/80 dark:bg-[#282A2C]/80 text-[11px] text-[#444746] dark:text-[#C4C7C5] max-w-full truncate text-left cursor-pointer hover:bg-[#F0F4F9] dark:hover:bg-[#333537] transition-colors"
            >
              <span className="font-semibold">
                {resolvedReplySenderName}:{' '}
              </span>
              {message.replyTo.isDeleted
                ? t('deletedReply')
                : message.replyTo.contentPreview}
            </button>
          )}

          <div className="relative flex items-center gap-1.5">
            <div
              ref={bubbleWrapRef}
              onMouseEnter={handleBubbleMouseEnter}
              onMouseLeave={handleBubbleMouseLeave}
              className={`min-w-0 max-w-full rounded-2xl transition-all duration-300 ${
                isHighlighted
                  ? `${theme.highlightRingClass} shadow-lg scale-[1.01]`
                  : ''
              }`}
            >
              {renderContent()}
            </div>
            {hoverTooltipPos &&
              hoverTimestamp &&
              !isEditing &&
              typeof document !== 'undefined' &&
              createPortal(
                <div
                  role="tooltip"
                  style={{
                    top: hoverTooltipPos.top,
                    left: hoverTooltipPos.left,
                    right: hoverTooltipPos.right,
                  }}
                  className={`fixed z-50 pointer-events-none px-3 py-1.5 rounded-xl bg-[#242526]/95 dark:bg-[#3A3B3C]/95 text-white text-xs font-medium shadow-lg whitespace-nowrap ${
                    hoverTooltipPos.placement === 'side'
                      ? '-translate-y-1/2'
                      : '-translate-y-full'
                  }`}
                >
                  {hoverTimestamp}
                </div>,
                document.body
              )}

            {/* Hover Action Bar */}
            {!message.isDeleted && !isEditing && (
              <div
                className={`${
                  showMoreActions || showEmojiPicker
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
                } transition-opacity flex items-center gap-0.5 bg-white dark:bg-[#1E1F20] rounded-full px-1.5 py-0.5 shadow-sm dark:shadow-none ${
                  isMine ? 'order-first mr-1' : 'ml-1'
                }`}
              >
                <div className="relative">
                  <button
                    ref={emojiBtnRef}
                    type="button"
                    onClick={() => {
                      const next = !showEmojiPicker;
                      if (next && emojiBtnRef.current) {
                        const rect = emojiBtnRef.current.getBoundingClientRect();
                        const openBelow = rect.top < 72;
                        setPopoverPos({
                          top: openBelow ? rect.bottom + 6 : undefined,
                          bottom: openBelow ? undefined : window.innerHeight - rect.top + 6,
                          left: Math.max(8, Math.min(rect.left, window.innerWidth - 256)),
                        });
                      }
                      setShowEmojiPicker(next);
                      setShowMoreActions(false);
                    }}
                    title={t('hoverReactTooltip')}
                    className="w-7 h-7 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add_reaction
                    </span>
                  </button>
                  {showEmojiPicker &&
                    popoverPos &&
                    typeof document !== 'undefined' &&
                    createPortal(
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowEmojiPicker(false)}
                        />
                        <div
                          style={{
                            top: popoverPos.top,
                            bottom: popoverPos.bottom,
                            left: popoverPos.left,
                          }}
                          className="fixed z-50 flex items-center gap-1 px-2 py-1.5 rounded-full bg-white dark:bg-[#282A2C] shadow-lg"
                        >
                          {QUICK_REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                onReaction(message.id, emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="w-7 h-7 rounded-full hover:scale-125 transition-transform text-sm cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </>,
                      document.body
                    )}
                </div>

                {!isLockedForMe && (
                  <button
                    type="button"
                    onClick={() => onReply(message)}
                    title={t('hoverReplyTooltip')}
                    className="w-7 h-7 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">reply</span>
                  </button>
                )}

                {!inThreadView && !message.threadRootId && (
                  <button
                    type="button"
                    onClick={() => onOpenThread(message.id)}
                    title={t('hoverThreadTooltip')}
                    className="w-7 h-7 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">forum</span>
                  </button>
                )}

                <div className="relative">
                  <button
                    ref={moreBtnRef}
                    type="button"
                    onClick={() => {
                      const next = !showMoreActions;
                      if (next && moreBtnRef.current) {
                        const rect = moreBtnRef.current.getBoundingClientRect();
                        const openBelow = rect.top < 260;
                        setPopoverPos({
                          top: openBelow ? rect.bottom + 6 : undefined,
                          bottom: openBelow ? undefined : window.innerHeight - rect.top + 6,
                          right: isMine
                            ? Math.max(8, window.innerWidth - rect.right)
                            : undefined,
                          left: isMine
                            ? undefined
                            : Math.max(8, Math.min(rect.left, window.innerWidth - 200)),
                        });
                      }
                      setShowMoreActions(next);
                      setShowEmojiPicker(false);
                    }}
                    title={t('hoverMoreTooltip')}
                    className="w-7 h-7 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      more_horiz
                    </span>
                  </button>

                  {showMoreActions &&
                    popoverPos &&
                    typeof document !== 'undefined' &&
                    createPortal(
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowMoreActions(false)}
                        />
                        <div
                          style={{
                            top: popoverPos.top,
                            bottom: popoverPos.bottom,
                            left: popoverPos.left,
                            right: popoverPos.right,
                          }}
                          className="fixed z-50 w-48 rounded-2xl bg-white dark:bg-[#282A2C] shadow-xl py-1.5 text-xs text-[#1F1F1F] dark:text-[#E3E3E3]"
                        >
                        {!isLockedForMe && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreActions(false);
                              onAskAiAbout(message);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-[#F0F4F9] dark:hover:bg-[#333537] flex items-center gap-2 cursor-pointer"
                          >
                            <img
                              src="/socratic_mascot.png"
                              alt=""
                              aria-hidden="true"
                              className="w-4 h-4 object-contain shrink-0"
                            />
                            <span>{t('actionAskAi')}</span>
                          </button>
                        )}
                        {canAiDraft && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreActions(false);
                              onGenerateAiDraft?.(message.id);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-[#F0F4F9] dark:hover:bg-[#333537] flex items-center gap-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                              edit_note
                            </span>
                            <span>{t('actionAiDraft')}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowMoreActions(false);
                            onBookmark(message.id);
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#F0F4F9] dark:hover:bg-[#333537] flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            bookmark_add
                          </span>
                          <span>{t('actionBookmark')}</span>
                        </button>
                        {canPin && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreActions(false);
                              onPin(message.id);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-[#F0F4F9] dark:hover:bg-[#333537] flex items-center gap-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              push_pin
                            </span>
                            <span>{message.isPinned ? t('actionUnpin') : t('actionPin')}</span>
                          </button>
                        )}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreActions(false);
                              setEditText(message.content ?? '');
                              setIsEditing(true);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-[#F0F4F9] dark:hover:bg-[#333537] flex items-center gap-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            <span>{t('actionEdit')}</span>
                          </button>
                        )}
                        {!isMine && message.senderType === 'USER' && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreActions(false);
                              onReport(message);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-[#F0F4F9] dark:hover:bg-[#333537] flex items-center gap-2 text-amber-700 dark:text-amber-300 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">flag</span>
                            <span>{t('actionReport')}</span>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreActions(false);
                              onDelete(message.id);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-[#F9DEDC]/60 dark:hover:bg-[#3C1919] flex items-center gap-2 text-[#B3261E] dark:text-[#F28B82] cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              delete
                            </span>
                            <span>{t('actionDelete')}</span>
                          </button>
                        )}
                      </div>
                    </>,
                    document.body
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reactions row */}
          {message.reactions.length > 0 && !message.isDeleted && (
            <div className="flex flex-wrap gap-1 mt-1 px-1">
              {message.reactions.map((react) => (
                <button
                  key={react.emoji}
                  type="button"
                  onClick={() => onReaction(message.id, react.emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                    react.reactedByMe
                      ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF] shadow-xs'
                      : theme.wallpaperUrl
                        ? 'bg-white/85 dark:bg-[#282A2C]/90 text-[#1F1F1F] dark:text-[#E3E3E3] backdrop-blur-xs shadow-xs'
                        : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
                  }`}
                >
                  <span>{react.emoji}</span>
                  <span className="tabular-nums">{react.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Thread reply pill */}
          {!inThreadView && message.threadReplyCount > 0 && !message.isDeleted && (
            <button
              type="button"
              onClick={() => onOpenThread(message.id)}
              className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                theme.wallpaperUrl
                  ? 'bg-white/85 dark:bg-[#282A2C]/90 hover:bg-white backdrop-blur-xs shadow-xs'
                  : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#D3E3FD]/60'
              } ${theme.accentTextClass}`}
            >
              <span className="material-symbols-outlined text-[14px]">forum</span>
              <span>{t('threadRepliesCount', { count: message.threadReplyCount })}</span>
            </button>
          )}

          {message.optimisticStatus === 'failed' && (
            <span className="text-[10px] text-[#B3261E] dark:text-[#F28B82] mt-0.5 px-1">
              {t('sendFailed')}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
