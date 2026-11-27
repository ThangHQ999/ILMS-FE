'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ChatSummary } from '../../schemas/chat-phase2.schema';
import { resolveSharedResourceHref } from '../../utils/chat-message.utils';

interface ChatSummaryModalProps {
  summary: ChatSummary | null;
  onClose: () => void;
}

export function ChatSummaryModal({ summary, onClose }: ChatSummaryModalProps) {
  const t = useTranslations('chat.modals.summary');
  if (!summary) return null;

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
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#5E35B1] dark:text-[#D1C4E9]">
              auto_awesome
            </span>
            <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {t('title')}
            </h3>
            {summary.cached && (
              <span className="px-2 py-0.5 rounded-full bg-[#EDE7F6] dark:bg-[#231F33] text-[#5E35B1] dark:text-[#D1C4E9] text-[10px] font-semibold">
                {t('cachedBadge')}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">
          {t('analyzedCount', { count: summary.summarizedMessageCount })}
        </p>

        <SummaryBlock
          title={t('topicsTitle')}
          icon="topic"
          items={summary.mainTopics}
          emptyText={t('noData')}
        />
        <SummaryBlock
          title={t('conclusionsTitle')}
          icon="task_alt"
          items={summary.keyConclusions}
          emptyText={t('noData')}
        />
        <SummaryBlock
          title={t('openQuestionsTitle')}
          icon="help_outline"
          items={summary.openQuestions}
          emptyText={t('noData')}
        />

        {summary.sharedResources.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                folder_shared
              </span>
              <span>{t('sharedResourcesTitle')}</span>
            </h4>
            <div className="space-y-1.5">
              {summary.sharedResources.map((res, i) => (
                <Link
                  key={`${res.resourceId}-${i}`}
                  href={resolveSharedResourceHref(res)}
                  onClick={onClose}
                  className="block p-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#D3E3FD]/50 text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA]"
                >
                  {res.title} ({res.resourceType})
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryBlock({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3.5 space-y-1.5">
      <h4 className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
          {icon}
        </span>
        <span>{title}</span>
      </h4>
      {items.length === 0 ? (
        <p className="text-xs text-[#747775] dark:text-[#8E918F]">{emptyText}</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1 text-xs text-[#444746] dark:text-[#C4C7C5]">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
