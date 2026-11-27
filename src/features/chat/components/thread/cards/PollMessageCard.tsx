'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ChatPoll } from '../../../schemas/chat.schema';

interface PollMessageCardProps {
  poll: ChatPoll;
  isVoting?: boolean;
  onVote: (pollId: string, optionIds: string[]) => void;
}

export function PollMessageCard({
  poll,
  isVoting = false,
  onVote,
}: PollMessageCardProps) {
  const tMsg = useTranslations('chat.messages');

  const handleSelectOption = (optionId: string) => {
    if (poll.isClosed || isVoting) return;
    if (!poll.allowMultiple) {
      onVote(poll.id, [optionId]);
      return;
    }
    const currentSelected = poll.options
      .filter((o) => o.votedByMe)
      .map((o) => o.optionId);
    const nextSelected = currentSelected.includes(optionId)
      ? currentSelected.filter((id) => id !== optionId)
      : [...currentSelected, optionId];
    if (nextSelected.length > 0) {
      onVote(poll.id, nextSelected);
    }
  };

  return (
    <div className="w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#1E1F20] p-4 space-y-3 text-[#1F1F1F] dark:text-[#E3E3E3] shadow-xs dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
          <span className="material-symbols-outlined text-[15px]">poll</span>
          <span>{poll.allowMultiple ? tMsg('pollMultiHint') : 'Poll'}</span>
        </div>
        {poll.isClosed && (
          <span className="px-2 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-[10px] font-semibold text-[#444746] dark:text-[#8E918F]">
            {tMsg('pollClosed')}
          </span>
        )}
      </div>

      <p className="text-sm font-semibold leading-snug">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((opt) => {
          const pct = Math.min(100, Math.max(0, Math.round(opt.percentage)));
          return (
            <button
              key={opt.optionId}
              type="button"
              disabled={poll.isClosed || isVoting}
              onClick={() => handleSelectOption(opt.optionId)}
              className={`relative w-full text-left rounded-xl overflow-hidden bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-2 transition-all cursor-pointer disabled:cursor-default ${
                opt.votedByMe
                  ? 'ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA]'
                  : 'hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-[#D3E3FD]/80 dark:bg-[#004A77]/70 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  {opt.votedByMe && (
                    <span className="material-symbols-outlined text-[15px] text-[#0B57D0] dark:text-[#A8C7FA]">
                      check_circle
                    </span>
                  )}
                  <span className="truncate">{opt.text}</span>
                </span>
                <span className="text-[11px] font-bold tabular-nums shrink-0 text-[#444746] dark:text-[#C4C7C5]">
                  {opt.voteCount} ({pct}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">
        {tMsg('pollTotalVotes', { count: poll.totalVotes })}
      </p>
    </div>
  );
}
