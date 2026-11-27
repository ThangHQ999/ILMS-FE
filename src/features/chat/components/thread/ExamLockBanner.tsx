'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { ChatConversation } from '../../schemas/chat.schema';

interface ExamLockBannerProps {
  conversation: ChatConversation;
  isUnlocking?: boolean;
  onUnlock?: () => void;
}

export function ExamLockBanner({
  conversation,
  isUnlocking = false,
  onUnlock,
}: ExamLockBannerProps) {
  const locale = useLocale();
  const tHeader = useTranslations('chat.header');
  const tComposer = useTranslations('chat.composer');
  const dateLocale = locale.toLowerCase().startsWith('en') ? 'en-US' : 'vi-VN';

  const isExamLocked = Boolean(
    conversation.lockedUntil && Date.parse(conversation.lockedUntil) > Date.now()
  );
  const isRestricted = Boolean(
    conversation.myRestrictedUntil &&
      Date.parse(conversation.myRestrictedUntil) > Date.now()
  );

  if (!isExamLocked && !conversation.isReadOnly && !isRestricted) return null;

  const message = isRestricted
    ? `${tComposer('lockRestricted')} (${new Date(
        conversation.myRestrictedUntil!
      ).toLocaleString(dateLocale)})`
    : isExamLocked
      ? `${tHeader('examLockTitle', {
          reason: conversation.lockedReason || tHeader('examLockDefaultReason'),
        })} • ${tHeader('examLockUntil', {
          time: new Date(conversation.lockedUntil!).toLocaleString(dateLocale),
        })}`
      : tComposer('lockReadOnly');

  return (
    <div className="px-4 py-2 bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784] flex items-center justify-between gap-3 text-xs font-medium">
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-outlined text-[17px] shrink-0">lock</span>
        <span className="truncate">{message}</span>
      </div>
      {isExamLocked && conversation.myRole === 'ADMIN' && onUnlock && (
        <button
          type="button"
          disabled={isUnlocking}
          onClick={onUnlock}
          className="px-3 py-1 rounded-full bg-white/80 dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#E3E3E3] text-[11px] font-semibold shrink-0 cursor-pointer"
        >
          {isUnlocking ? tHeader('examLockUnlocking') : tHeader('examLockUnlock')}
        </button>
      )}
    </div>
  );
}
