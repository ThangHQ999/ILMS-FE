'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePromoteFaq } from '../../hooks/useChatPhase2';
import type { ChatMessage } from '../../schemas/chat.schema';

interface PromoteFaqModalProps {
  conversationId: string | null;
  target: { rootMessage: ChatMessage; answerText: string } | null;
  onClose: () => void;
}

export function PromoteFaqModal({
  conversationId,
  target,
  onClose,
}: PromoteFaqModalProps) {
  const t = useTranslations('chat.modals.promoteFaq');
  const tCommon = useTranslations('chat.common');
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [conceptCode, setConceptCode] = useState('');
  const promoteMutation = usePromoteFaq(conversationId);

  useEffect(() => {
    if (target) {
      setQuestionText(target.rootMessage.content || '');
      setAnswerText(target.answerText || '');
      setConceptCode('');
    }
  }, [target]);

  if (!target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !answerText.trim()) return;
    await promoteMutation.mutateAsync({
      rootId: target.rootMessage.id,
      questionText: questionText.trim(),
      answerText: answerText.trim(),
      conceptCode: conceptCode.trim() || undefined,
    });
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

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
            {t('questionLabel')}
          </label>
          <textarea
            rows={2}
            required
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs outline-none resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#444746] dark:text-[#C4C7C5]">
            {t('answerLabel')}
          </label>
          <textarea
            rows={4}
            required
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs outline-none resize-none"
          />
        </div>

        <input
          type="text"
          value={conceptCode}
          onChange={(e) => setConceptCode(e.target.value)}
          placeholder={t('conceptCodePlaceholder')}
          className="w-full h-9 px-3.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs outline-none"
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
            disabled={promoteMutation.isPending}
            className="px-5 py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-xs font-semibold cursor-pointer"
          >
            {promoteMutation.isPending ? t('submittingBtn') : t('submitBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
