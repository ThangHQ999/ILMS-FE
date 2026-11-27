'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/sonner';
import { getUserFriendlyErrorMessage } from '@/lib/error-utils';
import { CHAT_SLASH_COMMANDS } from '../../constants/chat-slash-commands';
import { resolveChatTheme } from '../../constants/chat-themes';
import type {
  ChatAttachmentMeta,
  ChatConversation,
  ChatConversationMember,
  SendMessageInput,
} from '../../schemas/chat.schema';
import { uploadChatAttachment } from '../../services/chat.service';
import { chatStore, useChatStore } from '../../store/useChatStore';
import {
  filterActiveMentionIds,
  getMessageSenderDisplayName,
  parseSlashCommand,
} from '../../utils/chat-message.utils';

interface ChatComposerProps {
  conversation: ChatConversation;
  members: ChatConversationMember[];
  currentUserId?: string;
  isLockedForMe: boolean;
  lockReason: 'RESTRICTED' | 'EXAM_LOCK' | 'READ_ONLY' | null;
  isSending: boolean;
  droppedFileRequest?: { id: number; file: File } | null;
  onDroppedFileConsumed?: () => void;
  onSend: (payload: SendMessageInput) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  onOpenSharePicker: () => void;
  onOpenPollModal: (prefill?: { question: string; options: string[] }) => void;
  onOpenCodeModal: (language?: string) => void;
  onOpenScheduleModal: () => void;
  onSlashPomodoro: (minutes: number) => void;
}

function formatAttachmentSize(bytes?: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatComposer({
  conversation,
  members,
  currentUserId,
  isLockedForMe,
  lockReason,
  isSending,
  droppedFileRequest,
  onDroppedFileConsumed,
  onSend,
  onTyping,
  onOpenSharePicker,
  onOpenPollModal,
  onOpenCodeModal,
  onOpenScheduleModal,
  onSlashPomodoro,
}: ChatComposerProps) {
  const tComposer = useTranslations('chat.composer');
  const tCommon = useTranslations('chat.common');
  const tToast = useTranslations('chat.toasts');
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mentionedEntries, setMentionedEntries] = useState<
    Array<{ userId: string; label: string }>
  >([]);
  const [pendingAttachment, setPendingAttachment] = useState<{
    messageType: 'IMAGE' | 'FILE';
    attachment: ChatAttachmentMeta;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionActiveIdx, setMentionActiveIdx] = useState(0);
  const [showSlashPopover, setShowSlashPopover] = useState(false);
  const [slashActiveIdx, setSlashActiveIdx] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUploadingRef = useRef(false);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const lastHandledDropIdRef = useRef<number | null>(null);
  const replyToMessage = useChatStore((s) => s.replyToMessage);
  const aiDraft = useChatStore((s) => s.aiDraft);
  const theme = resolveChatTheme(conversation.themeKey);

  useEffect(() => {
    return () => {
      uploadAbortRef.current?.abort();
    };
  }, []);

  const handleCancelUpload = useCallback(() => {
    uploadAbortRef.current?.abort();
    uploadAbortRef.current = null;
    isUploadingRef.current = false;
    setIsUploading(false);
    setUploadingFileName(null);
  }, []);

  const uploadSingleFile = useCallback(
    async (file: File) => {
      if (isLockedForMe || isUploadingRef.current) return;
      const controller = new AbortController();
      uploadAbortRef.current = controller;
      isUploadingRef.current = true;
      setIsUploading(true);
      setUploadingFileName(file.name);
      try {
        const res = await uploadChatAttachment(file, controller.signal);
        if (controller.signal.aborted) return;
        setPendingAttachment(res);
        requestAnimationFrame(() => textareaRef.current?.focus());
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error(getUserFriendlyErrorMessage(err, tToast('uploadAttachmentError')));
      } finally {
        if (uploadAbortRef.current === controller) {
          uploadAbortRef.current = null;
          isUploadingRef.current = false;
          setIsUploading(false);
          setUploadingFileName(null);
        }
      }
    },
    [isLockedForMe, tToast]
  );

  useEffect(() => {
    if (
      !droppedFileRequest ||
      droppedFileRequest.id === lastHandledDropIdRef.current
    ) {
      return;
    }
    lastHandledDropIdRef.current = droppedFileRequest.id;
    onDroppedFileConsumed?.();
    void uploadSingleFile(droppedFileRequest.file);
  }, [droppedFileRequest, onDroppedFileConsumed, uploadSingleFile]);

  if (isLockedForMe) {
    const label =
      lockReason === 'RESTRICTED'
        ? tComposer('lockRestricted')
        : lockReason === 'EXAM_LOCK'
          ? tComposer('lockExam')
          : tComposer('lockReadOnly');
    return (
      <div className="px-4 py-3.5 bg-[#F0F4F9] dark:bg-[#282A2C] text-center text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
        {label}
      </div>
    );
  }

  const handleTextChange = (val: string) => {
    setText(val);
    onTyping(val.trim().length > 0);

    // Check trailing @mention trigger
    const atMatch = val.match(/@([^\s@]*)$/);
    if (atMatch) {
      setShowMentionPopover(true);
      setMentionFilter(atMatch[1].toLowerCase());
      setMentionActiveIdx(0);
      setShowSlashPopover(false);
      return;
    }
    setShowMentionPopover(false);

    // Check leading /slash command trigger
    if (val.startsWith('/') && !val.includes(' ')) {
      setShowSlashPopover(true);
      setSlashActiveIdx(0);
    } else {
      setShowSlashPopover(false);
    }
  };

  const handlePickMention = (userId: string | 'AI', label: string) => {
    const replaced = text.replace(/@([^\s@]*)$/, `@${label} `);
    setText(replaced);
    if (userId !== 'AI') {
      setMentionedEntries((prev) =>
        prev.some((e) => e.userId === userId && e.label === label)
          ? prev
          : [...prev, { userId, label }]
      );
    }
    setShowMentionPopover(false);
    setMentionActiveIdx(0);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handlePickSlashCommand = (cmd: string) => {
    setShowSlashPopover(false);
    if (cmd === '/share') {
      setText('');
      onOpenSharePicker();
      return;
    }
    if (cmd === '/poll') {
      setText('');
      onOpenPollModal();
      return;
    }
    if (cmd === '/code') {
      setText('');
      onOpenCodeModal('java');
      return;
    }
    setText(`${cmd} `);
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadSingleFile(file);
  };

  const submitCurrent = async () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingAttachment) {
      // Quick emoji tap (Messenger signature)
      await onSend({
        messageType: 'TEXT',
        content: conversation.defaultEmoji || '👍',
        replyToMessageId: replyToMessage?.id,
        isAnonymous: conversation.type === 'CLASS_CHANNEL' ? isAnonymous : undefined,
      });
      chatStore.setState({ replyToMessage: null });
      return;
    }

    // Parse slash command if typed manually
    if (trimmed.startsWith('/') && !pendingAttachment) {
      const cmd = parseSlashCommand(trimmed);
      if (cmd?.kind === 'share') {
        setText('');
        onOpenSharePicker();
        return;
      }
      if (cmd?.kind === 'code') {
        setText('');
        onOpenCodeModal(cmd.language);
        return;
      }
      if (cmd?.kind === 'poll') {
        setText('');
        onOpenPollModal({ question: cmd.question, options: cmd.options });
        return;
      }
      if (cmd?.kind === 'pomodoro') {
        setText('');
        onSlashPomodoro(cmd.minutes);
        return;
      }
      if (cmd?.kind === 'ai') {
        const aiText = cmd.prompt ? `@AI ${cmd.prompt}` : '@AI';
        await onSend({
          messageType: 'TEXT',
          content: aiText,
          replyToMessageId: replyToMessage?.id,
          isAnonymous: conversation.type === 'CLASS_CHANNEL' ? isAnonymous : undefined,
        });
        setText('');
        onTyping(false);
        chatStore.setState({ replyToMessage: null });
        return;
      }
    }

    const activeMentionedIds = filterActiveMentionIds(trimmed, mentionedEntries);
    const payload: SendMessageInput = pendingAttachment
      ? {
          messageType: pendingAttachment.messageType,
          attachment: pendingAttachment.attachment,
          content: trimmed || undefined,
          replyToMessageId: replyToMessage?.id,
          mentionedUserIds: activeMentionedIds.length > 0 ? activeMentionedIds : undefined,
          isAnonymous: conversation.type === 'CLASS_CHANNEL' ? isAnonymous : undefined,
        }
      : {
          messageType: 'TEXT',
          content: trimmed,
          replyToMessageId: replyToMessage?.id,
          mentionedUserIds: activeMentionedIds.length > 0 ? activeMentionedIds : undefined,
          isAnonymous: conversation.type === 'CLASS_CHANNEL' ? isAnonymous : undefined,
        };

    setText('');
    setPendingAttachment(null);
    setMentionedEntries([]);
    onTyping(false);
    chatStore.setState({ replyToMessage: null, aiDraft: null });
    await onSend(payload);
  };

  const filteredMembers = members
    .filter(
      (m) =>
        (!currentUserId || m.userId !== currentUserId) &&
        (m.fullName.toLowerCase().includes(mentionFilter) ||
          (m.nickname && m.nickname.toLowerCase().includes(mentionFilter)))
    )
    .slice(0, 6);

  const filteredSlash = CHAT_SLASH_COMMANDS.filter((c) =>
    c.command.startsWith(text.trim().toLowerCase())
  );

  const mentionTotalCount = 1 + filteredMembers.length;
  const safeMentionIdx = Math.min(mentionActiveIdx, mentionTotalCount - 1);
  const safeSlashIdx =
    filteredSlash.length > 0 ? Math.min(slashActiveIdx, filteredSlash.length - 1) : 0;

  const hasContent = text.trim().length > 0 || Boolean(pendingAttachment);

  return (
    <div className={`relative px-3 sm:px-4 py-3 space-y-2 ${theme.composerBarClass}`}>
      {/* Private Instructor AI Draft Banner */}
      {aiDraft && (
        <div className="rounded-2xl bg-[#EDE7F6] dark:bg-[#231F33] p-3 text-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-[#5E35B1] dark:text-[#D1C4E9] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              {tComposer('aiDraftTitle')}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setText(aiDraft.draftContent);
                  chatStore.setState({ aiDraft: null });
                }}
                className="px-3 py-1 rounded-full bg-[#5E35B1] text-white font-semibold cursor-pointer"
              >
                {tComposer('useDraft')}
              </button>
              <button
                type="button"
                onClick={() => chatStore.setState({ aiDraft: null })}
                className="px-2.5 py-1 rounded-full text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
              >
                {tComposer('discardDraft')}
              </button>
            </div>
          </div>
          <p className="text-[#1F1F1F] dark:text-[#E3E3E3] line-clamp-3">
            {aiDraft.draftContent}
          </p>
        </div>
      )}

      {/* Reply Preview Banner */}
      {replyToMessage && (
        <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <span className="font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
              {tComposer('replyingTo', {
                name: getMessageSenderDisplayName(replyToMessage, {
                  aiSenderName: tCommon('aiSenderName'),
                  fallbackUser: tCommon('user'),
                }),
              })}
            </span>
            <p className="text-[#444746] dark:text-[#C4C7C5] truncate">
              {replyToMessage.content || tCommon('attachment')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => chatStore.setState({ replyToMessage: null })}
            className="w-6 h-6 rounded-full hover:bg-white dark:hover:bg-[#1E1F20] flex items-center justify-center cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      {/* Uploading / Pending Attachment Preview */}
      {isUploading && (
        <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA] animate-spin shrink-0">
              sync
            </span>
            <span className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
              {tComposer('uploadingAttachment')}
              {uploadingFileName ? ` (${uploadingFileName})` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancelUpload}
            aria-label={tComposer('cancelUploadAria')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-[#1E1F20] hover:bg-[#F9DEDC] dark:hover:bg-[#3C1919] text-[#B3261E] dark:text-[#F28B82] text-[11px] font-semibold shrink-0 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            <span>{tCommon('cancel')}</span>
          </button>
        </div>
      )}

      {!isUploading && pendingAttachment && (
        <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {pendingAttachment.messageType === 'IMAGE' &&
            pendingAttachment.attachment.fileUrl ? (
              <img
                src={pendingAttachment.attachment.fileUrl}
                alt={pendingAttachment.attachment.fileName}
                className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  attach_file
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                {pendingAttachment.attachment.fileName}
              </p>
              {formatAttachmentSize(pendingAttachment.attachment.fileSizeBytes) && (
                <p className="text-[10px] text-[#747775] dark:text-[#8E918F]">
                  {formatAttachmentSize(pendingAttachment.attachment.fileSizeBytes)}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPendingAttachment(null)}
            aria-label={tComposer('removeAttachmentAria')}
            className="w-6 h-6 rounded-full hover:bg-white dark:hover:bg-[#1E1F20] flex items-center justify-center cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      {/* @Mention Popover */}
      {showMentionPopover && (
        <div
          role="listbox"
          aria-label={tComposer('mentionListLabel')}
          className="absolute bottom-16 left-4 z-30 w-72 rounded-2xl overflow-hidden bg-white dark:bg-[#282A2C] shadow-xl py-1.5 text-xs"
        >
          <button
            type="button"
            role="option"
            aria-selected={safeMentionIdx === 0}
            onMouseEnter={() => setMentionActiveIdx(0)}
            onClick={() => handlePickMention('AI', 'AI')}
            className={`w-full px-3.5 py-2 text-left flex items-center gap-2.5 cursor-pointer transition-colors ${
              safeMentionIdx === 0
                ? 'bg-[#EDE7F6] dark:bg-[#311B92]/40'
                : 'hover:bg-[#EDE7F6] dark:hover:bg-[#311B92]/40'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-white dark:bg-[#1E1F20] ring-1 ring-black/10 dark:ring-white/15 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/socratic_mascot.png"
                alt={tComposer('socraticAiName')}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-[#5E35B1] dark:text-[#D1C4E9]">
                {tComposer('socraticAiName')}
              </p>
              <p className="text-[10px] text-[#444746] dark:text-[#C4C7C5]">
                {tComposer('socraticAiDesc')}
              </p>
            </div>
          </button>
          {filteredMembers.map((m, idx) => {
            const optionIdx = idx + 1;
            const isSelected = safeMentionIdx === optionIdx;
            const label = m.nickname || m.fullName || tCommon('member');
            return (
              <button
                key={m.userId}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setMentionActiveIdx(optionIdx)}
                onClick={() => handlePickMention(m.userId, label)}
                className={`w-full px-3.5 py-2 text-left flex items-center gap-2.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#F0F4F9] dark:bg-[#333537]'
                    : 'hover:bg-[#F0F4F9] dark:hover:bg-[#333537]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center text-[10px] font-bold">
                  {label.charAt(0).toUpperCase()}
                </div>
                <span className="truncate font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Slash Command Popover */}
      {showSlashPopover && filteredSlash.length > 0 && (
        <div
          role="listbox"
          aria-label={tComposer('slashListLabel')}
          className="absolute bottom-16 left-4 z-30 w-80 rounded-2xl overflow-hidden bg-white dark:bg-[#282A2C] shadow-xl py-1.5 text-xs"
        >
          {filteredSlash.map((cmd, idx) => {
            const isSelected = safeSlashIdx === idx;
            return (
              <button
                key={cmd.command}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setSlashActiveIdx(idx)}
                onClick={() => handlePickSlashCommand(cmd.command)}
                className={`w-full px-3.5 py-2 text-left flex items-center gap-2.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#F0F4F9] dark:bg-[#333537]'
                    : 'hover:bg-[#F0F4F9] dark:hover:bg-[#333537]'
                }`}
              >
                {cmd.command === '/ai' ? (
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-[#1E1F20] ring-1 ring-black/10 dark:ring-white/15 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/socratic_mascot.png"
                      alt={tComposer('socraticAiName')}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                    {cmd.icon}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-mono font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                    {tComposer(cmd.usageKey)}
                  </p>
                  <p className="text-[11px] text-[#747775] dark:text-[#8E918F] truncate">
                    {tComposer(cmd.descriptionKey)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Composer Row */}
      <div className="flex items-end gap-1.5 sm:gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => void handleFilePicked(e)}
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          title={tComposer('attachTooltip')}
          aria-label={tComposer('attachAria')}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors ${theme.composerIconBtnClass}`}
        >
          <span className="material-symbols-outlined text-[19px]">
            {isUploading ? 'sync' : 'attach_file'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenSharePicker}
          title={tComposer('shareTooltip')}
          aria-label={tComposer('shareAria')}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors ${theme.composerIconBtnClass}`}
        >
          <span className="material-symbols-outlined text-[19px]">folder_shared</span>
        </button>

        {conversation.type !== 'DIRECT' && (
          <button
            type="button"
            onClick={() => onOpenPollModal()}
            title={tComposer('pollTooltip')}
            aria-label={tComposer('pollAria')}
            className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center shrink-0 cursor-pointer transition-colors ${theme.composerIconBtnClass}`}
          >
            <span className="material-symbols-outlined text-[19px]">poll</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onOpenCodeModal('java')}
          title={tComposer('codeTooltip')}
          aria-label={tComposer('codeAria')}
          className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center shrink-0 cursor-pointer transition-colors ${theme.composerIconBtnClass}`}
        >
          <span className="material-symbols-outlined text-[19px]">code</span>
        </button>

        {conversation.type === 'CLASS_CHANNEL' && conversation.myRole === 'ADMIN' && (
          <button
            type="button"
            onClick={onOpenScheduleModal}
            title={tComposer('scheduleTooltip')}
            aria-label={tComposer('scheduleAria')}
            className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center shrink-0 cursor-pointer transition-colors ${theme.composerIconBtnClass}`}
          >
            <span className="material-symbols-outlined text-[19px]">schedule_send</span>
          </button>
        )}

        <div className={`flex-1 min-w-0 rounded-3xl px-4 py-2 flex items-center gap-2 ${theme.composerInputClass}`}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onPaste={(e) => {
              const pastedFile = e.clipboardData?.files?.[0];
              if (pastedFile && !isLockedForMe) {
                e.preventDefault();
                void uploadSingleFile(pastedFile);
              }
            }}
            onKeyDown={(e) => {
              if (showMentionPopover) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setMentionActiveIdx((prev) => (prev + 1) % mentionTotalCount);
                  return;
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setMentionActiveIdx(
                    (prev) => (prev - 1 + mentionTotalCount) % mentionTotalCount
                  );
                  return;
                }
                if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
                  e.preventDefault();
                  if (safeMentionIdx === 0) {
                    handlePickMention('AI', 'AI');
                  } else {
                    const picked = filteredMembers[safeMentionIdx - 1];
                    if (picked) {
                      handlePickMention(
                        picked.userId,
                        picked.nickname || picked.fullName
                      );
                    }
                  }
                  return;
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setShowMentionPopover(false);
                  return;
                }
              }

              if (showSlashPopover && filteredSlash.length > 0) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSlashActiveIdx((prev) => (prev + 1) % filteredSlash.length);
                  return;
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSlashActiveIdx(
                    (prev) => (prev - 1 + filteredSlash.length) % filteredSlash.length
                  );
                  return;
                }
                if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
                  e.preventDefault();
                  const picked = filteredSlash[safeSlashIdx];
                  if (picked) handlePickSlashCommand(picked.command);
                  return;
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setShowSlashPopover(false);
                  return;
                }
              }

              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void submitCurrent();
              }
            }}
            placeholder={tComposer('inputPlaceholder')}
            className="w-full bg-transparent text-xs sm:text-sm text-current placeholder:text-current/60 outline-none resize-none max-h-28"
          />

          {conversation.type === 'CLASS_CHANNEL' && conversation.myRole === 'MEMBER' && (
            <button
              type="button"
              onClick={() => setIsAnonymous((p) => !p)}
              title={tComposer('anonymousTooltip')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 cursor-pointer transition-colors ${
                isAnonymous
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#A8C7FA] dark:text-[#062E6F]'
                  : 'text-[#747775] dark:text-[#8E918F] hover:bg-white/60 dark:hover:bg-[#1E1F20]'
              }`}
            >
              {isAnonymous ? tComposer('anonymousOn') : tComposer('anonymousOff')}
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={isSending || isUploading}
          onClick={() => void submitCurrent()}
          aria-label={hasContent ? tComposer('sendAria') : tComposer('quickEmojiAria')}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer disabled:opacity-50 ${
            hasContent
              ? theme.accentBtnClass
              : `${theme.composerIconBtnClass} text-lg`
          }`}
        >
          {hasContent ? (
            <span className="material-symbols-outlined text-[20px]">send</span>
          ) : (
            <span>{conversation.defaultEmoji || '👍'}</span>
          )}
        </button>
      </div>
    </div>
  );
}
