'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ChatConversation } from '../../schemas/chat.schema';
import {
  useConversationReports,
  useExamLock,
  useReviewReport,
} from '../../hooks/useChatPhase2';

interface ModerationPanelProps {
  conversation: ChatConversation;
}

export function ModerationPanel({ conversation }: ModerationPanelProps) {
  const t = useTranslations('chat.drawer.moderation');
  const tCommon = useTranslations('chat.common');
  const { data: reports = [], isLoading } = useConversationReports(
    conversation.id,
    true
  );
  const reviewMutation = useReviewReport(conversation.id);
  const examLockMutation = useExamLock(conversation.id);

  const isLocked = Boolean(
    conversation.lockedUntil && Date.parse(conversation.lockedUntil) > Date.now()
  );
  const [lockDurationMinutes, setLockDurationMinutes] = useState(60);

  const handleToggleExamLock = () => {
    if (isLocked) {
      examLockMutation.mutate({ locked: false, lockedUntil: null });
      return;
    }
    const until = new Date(Date.now() + lockDurationMinutes * 60_000).toISOString();
    examLockMutation.mutate({
      locked: true,
      lockedUntil: until,
      reason: 'EXAM_IN_PROGRESS',
    });
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Exam Lock Control */}
      <div className="rounded-2xl bg-[#FCEBA4]/60 dark:bg-[#3C2A1E]/70 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-[#725200] dark:text-[#FFB784]">
            {t('examLockTitle')}
          </span>
          <button
            type="button"
            disabled={examLockMutation.isPending}
            onClick={handleToggleExamLock}
            className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
              isLocked
                ? 'bg-white dark:bg-[#1E1F20] text-[#B3261E] dark:text-[#F28B82]'
                : 'bg-[#725200] text-white dark:bg-[#FFB784] dark:text-[#3C2A1E]'
            }`}
          >
            {isLocked ? t('disableExamLock') : t('enableExamLock')}
          </button>
        </div>
        {!isLocked && (
          <div className="flex items-center gap-2 text-[11px] text-[#725200] dark:text-[#FFB784]">
            <span>{t('examLockDurationLabel')}</span>
            <input
              type="number"
              min={5}
              max={300}
              value={lockDurationMinutes}
              onChange={(e) => setLockDurationMinutes(Number(e.target.value) || 60)}
              className="w-16 h-7 px-2 rounded-full bg-white/80 dark:bg-[#1E1F20] text-center font-semibold outline-none"
            />
          </div>
        )}
      </div>

      {/* Pending Reports */}
      <div className="space-y-2">
        <p className="font-semibold text-[#444746] dark:text-[#C4C7C5]">
          {t('reportsTitle', { count: reports.length })}
        </p>
        {isLoading ? (
          <div className="h-12 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
        ) : reports.length === 0 ? (
          <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">
            {t('reportsEmpty')}
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#F9DEDC] dark:bg-[#3C1919] text-[#410E0B] dark:text-[#F28B82] text-[10px] font-bold">
                    {rep.reason}
                  </span>
                  <span className="text-[10px] text-[#747775]">
                    {t('byReporter', {
                      name: rep.reporter?.fullName || tCommon('member'),
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-[#1F1F1F] dark:text-[#E3E3E3] line-clamp-2">
                  &ldquo;{rep.message.content || `[${tCommon('attachment')}]`}&rdquo;
                </p>
                {rep.description && (
                  <p className="text-[10px] text-[#747775] dark:text-[#8E918F]">
                    {t('reasonLabel', { reason: rep.description })}
                  </p>
                )}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={reviewMutation.isPending}
                    onClick={() =>
                      reviewMutation.mutate({
                        reportId: rep.id,
                        status: 'RESOLVED',
                        deleteMessage: true,
                        restrictSenderMinutes: 60,
                      })
                    }
                    className="flex-1 py-1.5 rounded-full bg-[#B3261E] text-white text-[10px] font-semibold cursor-pointer"
                  >
                    {t('approveAndDelete')}
                  </button>
                  <button
                    type="button"
                    disabled={reviewMutation.isPending}
                    onClick={() =>
                      reviewMutation.mutate({
                        reportId: rep.id,
                        status: 'DISMISSED',
                      })
                    }
                    className="px-3 py-1.5 rounded-full bg-white dark:bg-[#1E1F20] text-[#444746] dark:text-[#C4C7C5] text-[10px] font-semibold cursor-pointer"
                  >
                    {t('dismissReport')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
