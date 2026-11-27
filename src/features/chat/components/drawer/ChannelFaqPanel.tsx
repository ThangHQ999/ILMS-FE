'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useChannelFaqs } from '../../hooks/useChatPhase2';
import { chatStore } from '../../store/useChatStore';

interface ChannelFaqPanelProps {
  conversationId: string;
}

export function ChannelFaqPanel({ conversationId }: ChannelFaqPanelProps) {
  const t = useTranslations('chat.drawer.faqs');
  const { data: faqs = [], isLoading } = useChannelFaqs(conversationId, true);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-14 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <p className="text-xs text-center text-[#747775] dark:text-[#8E918F] py-3">
        {t('empty')}
      </p>
    );
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 space-y-1.5 text-xs"
        >
          <p className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('questionLabel', { text: faq.questionText })}
          </p>
          <p className="text-[#444746] dark:text-[#C4C7C5] leading-relaxed">
            {t('answerLabel', { text: faq.answerText })}
          </p>
          {faq.sourceThreadRootId && (
            <button
              type="button"
              onClick={() => chatStore.openThreadDrawer(faq.sourceThreadRootId!)}
              className="text-[11px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer"
            >
              {t('viewOriginalThread')}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
