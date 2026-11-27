'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ChatMessage } from '../../schemas/chat.schema';
import type { ChatReportReason } from '../../schemas/chat-phase2.schema';
import { useReportMessage } from '../../hooks/useChatPhase2';

interface ReportMessageModalProps {
  message: ChatMessage | null;
  onClose: () => void;
}

const REPORT_REASONS: ChatReportReason[] = [
  'SPAM',
  'CHEATING',
  'HARASSMENT',
  'INAPPROPRIATE',
  'OTHER',
];

export function ReportMessageModal({ message, onClose }: ReportMessageModalProps) {
  const t = useTranslations('chat.modals.report');
  const tCommon = useTranslations('chat.common');
  const [reason, setReason] = useState<ChatReportReason>('SPAM');
  const [description, setDescription] = useState('');
  const reportMutation = useReportMessage();

  if (!message) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await reportMutation.mutateAsync({
      messageId: message.id,
      reason,
      description: description.trim() || undefined,
    });
    setDescription('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaLabel')}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => void handleSubmit(e)}
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

        <div className="p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#444746] dark:text-[#C4C7C5] line-clamp-2">
          &ldquo;{message.content || `[${tCommon('attachment')}]`}&rdquo;
        </div>

        <div className="space-y-1.5">
          {REPORT_REASONS.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/60 text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer"
            >
              <input
                type="radio"
                name="reportReason"
                checked={reason === item}
                onChange={() => setReason(item)}
                className="accent-[#0B57D0]"
              />
              <span>{t(`reasons.${item}`)}</span>
            </label>
          ))}
        </div>

        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          className="w-full p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none resize-none"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="submit"
            disabled={reportMutation.isPending}
            className="px-5 py-2 rounded-full bg-[#B3261E] text-white text-xs font-semibold cursor-pointer"
          >
            {reportMutation.isPending ? t('submittingBtn') : t('submitBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
