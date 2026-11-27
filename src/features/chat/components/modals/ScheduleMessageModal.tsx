'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  useCancelScheduledMessage,
  useCreateScheduledMessage,
  useScheduledMessages,
} from '../../hooks/useChatPhase2';

interface ScheduleMessageModalProps {
  isOpen: boolean;
  conversationId: string | null;
  onClose: () => void;
}

export function ScheduleMessageModal({
  isOpen,
  conversationId,
  onClose,
}: ScheduleMessageModalProps) {
  const t = useTranslations('chat.modals.schedule');
  const tCommon = useTranslations('chat.common');
  const locale = useLocale();
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const { data: scheduledList = [], isLoading } = useScheduledMessages(
    conversationId,
    isOpen
  );
  const createMutation = useCreateScheduledMessage(conversationId);
  const cancelMutation = useCancelScheduledMessage(conversationId);

  if (!isOpen || !conversationId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !scheduledAt) return;
    await createMutation.mutateAsync({
      messageType: 'TEXT',
      content: content.trim(),
      scheduledAt: scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt,
    });
    setContent('');
    setScheduledAt('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaLabel')}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <textarea
            rows={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('contentPlaceholder')}
            className="w-full p-3.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs outline-none resize-none"
          />
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full h-10 px-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs outline-none"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-xs font-semibold cursor-pointer"
          >
            {createMutation.isPending ? t('submittingBtn') : t('submitBtn')}
          </button>
        </form>

        <div className="space-y-2 pt-2 border-t border-[#F0F4F9] dark:border-[#282A2C]">
          <p className="text-xs font-bold text-[#444746] dark:text-[#C4C7C5]">
            {t('listTitle', { count: scheduledList.length })}
          </p>
          {isLoading ? (
            <div className="h-10 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
          ) : scheduledList.length === 0 ? (
            <p className="text-[11px] text-[#747775]">{t('emptyList')}</p>
          ) : (
            <div className="max-h-36 overflow-y-auto space-y-1.5">
              {scheduledList.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.content}</p>
                    <p className="text-[10px] text-[#747775]">
                      {new Date(item.scheduledAt).toLocaleString(
                        locale === 'en' ? 'en-US' : 'vi-VN'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => cancelMutation.mutate(item.id)}
                    className="text-[11px] font-semibold text-[#B3261E] dark:text-[#F28B82] shrink-0 cursor-pointer"
                  >
                    {tCommon('cancel')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
