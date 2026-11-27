'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ErrorState } from '@/components/shared';
import type { ChatConversation, ChatMessage } from '../../schemas/chat.schema';
import {
  useChatThread,
  useSendThreadReply,
} from '../../hooks/useChatPhase2';
import { getMessageSenderDisplayName } from '../../utils/chat-message.utils';

interface ThreadDrawerProps {
  rootMessageId: string;
  conversation: ChatConversation;
  isLockedForMe: boolean;
  onSummarizeThread: (rootId: string) => void;
  isSummarizing: boolean;
  onOpenPromoteFaq: (rootMessage: ChatMessage, answerText: string) => void;
  onClose: () => void;
}

export function ThreadDrawer({
  rootMessageId,
  conversation,
  isLockedForMe,
  onSummarizeThread,
  isSummarizing,
  onOpenPromoteFaq,
  onClose,
}: ThreadDrawerProps) {
  const t = useTranslations('chat.drawer.thread');
  const tMsg = useTranslations('chat.messages');
  const tCommon = useTranslations('chat.common');
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useChatThread(rootMessageId);
  const sendReply = useSendThreadReply(rootMessageId, conversation.id);

  const [replyText, setReplyText] = useState('');
  const [alsoSendToChannel, setAlsoSendToChannel] = useState(false);

  const isAdmin = conversation.myRole === 'ADMIN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isLockedForMe) return;
    await sendReply.mutateAsync({
      messageType: 'TEXT',
      content: replyText.trim(),
      alsoSendToChannel,
    });
    setReplyText('');
  };

  return (
    <aside className="w-full xl:w-96 shrink-0 bg-white dark:bg-[#1E1F20] rounded-3xl flex flex-col overflow-hidden shadow-xs dark:shadow-none h-full">
      <div className="px-4 h-16 flex items-center justify-between gap-2 border-b border-[#F0F4F9] dark:border-[#282A2C] shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[19px] text-[#0B57D0] dark:text-[#A8C7FA]">
            forum
          </span>
          <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('title')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isSummarizing}
            onClick={() => onSummarizeThread(rootMessageId)}
            title={t('summarizeTooltip')}
            className="h-8 px-2.5 rounded-full bg-[#EDE7F6] dark:bg-[#231F33] text-[#5E35B1] dark:text-[#D1C4E9] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            <span>{isSummarizing ? t('summarizingBtn') : t('summarizeBtn')}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon('close')}
            className="w-8 h-8 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3" role="status">
            <div className="h-20 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
            <div className="h-14 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
          </div>
        ) : isError || !data ? (
          <ErrorState title={t('loadError')} onRetry={() => void refetch()} />
        ) : (
          <>
            {/* Root Message */}
            <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <strong className="text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {getMessageSenderDisplayName(data.rootMessage, {
                    aiSenderName: tCommon('aiSenderName'),
                    fallbackUser: tCommon('user'),
                  })}
                </strong>
                <span className="text-[10px] text-[#747775]">
                  {new Date(data.rootMessage.createdAt).toLocaleTimeString(
                    locale === 'en' ? 'en-US' : 'vi-VN',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] whitespace-pre-wrap">
                {data.rootMessage.content || `[${tCommon('attachment')}]`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#747775] dark:text-[#8E918F]">
              <span>{t('repliesCount', { count: data.replies.length })}</span>
              <div className="h-px flex-1 bg-[#E1E5EA] dark:bg-[#282A2C]" />
            </div>

            {/* Replies */}
            {data.replies.length === 0 ? (
              <p className="text-xs text-center text-[#747775] dark:text-[#8E918F] py-4">
                {t('noRepliesYet')}
              </p>
            ) : (
            <div className="space-y-2.5">
              {data.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/60 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {getMessageSenderDisplayName(reply, {
                        aiSenderName: tCommon('aiSenderName'),
                        fallbackUser: tCommon('user'),
                      })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isAdmin && reply.content && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenPromoteFaq(data.rootMessage, reply.content || '')
                          }
                          title={t('promoteFaqTitle')}
                          className="text-[10px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer"
                        >
                          {t('promoteFaqBtn')}
                        </button>
                      )}
                      <span className="text-[10px] text-[#747775]">
                        {new Date(reply.createdAt).toLocaleTimeString(
                          locale === 'en' ? 'en-US' : 'vi-VN',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#1F1F1F] dark:text-[#E3E3E3] whitespace-pre-wrap">
                    {reply.isDeleted ? tMsg('deletedReply') : reply.content}
                  </p>
                </div>
              ))}
            </div>
            )}
          </>
        )}
      </div>

      {/* Thread Reply Composer */}
      {!isLockedForMe && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="p-3 border-t border-[#F0F4F9] dark:border-[#282A2C] space-y-2"
        >
          <label className="flex items-center gap-2 text-[11px] text-[#444746] dark:text-[#C4C7C5] cursor-pointer">
            <input
              type="checkbox"
              checked={alsoSendToChannel}
              onChange={(e) => setAlsoSendToChannel(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#0B57D0]"
            />
            <span>{t('alsoSendToChannel')}</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t('replyPlaceholder')}
              className="flex-1 h-9 px-3.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || sendReply.isPending}
              className="w-9 h-9 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </form>
      )}
    </aside>
  );
}
