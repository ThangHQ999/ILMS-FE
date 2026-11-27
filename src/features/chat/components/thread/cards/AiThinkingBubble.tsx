'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ChatThemePalette } from '../../../constants/chat-themes';

interface AiThinkingBubbleProps {
  theme: ChatThemePalette;
}

export function AiThinkingBubble({ theme }: AiThinkingBubbleProps) {
  const tMsg = useTranslations('chat.messages');
  const tCommon = useTranslations('chat.common');

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-end gap-2 px-3 sm:px-5 mb-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div
        className={`w-8 h-8 rounded-full shrink-0 p-0.5 overflow-hidden flex items-center justify-center ${theme.aiAvatarClass}`}
      >
        <img
          src="/socratic_mascot.png"
          alt={tCommon('aiSenderName')}
          className="w-full h-full object-contain animate-pulse"
        />
      </div>

      <div className="max-w-[78%] sm:max-w-[68%] flex flex-col items-start">
        <span
          className={`text-[11px] font-medium mb-1 ${
            theme.wallpaperUrl
              ? `px-2 py-0.5 rounded-full ${theme.dateDividerClass}`
              : 'text-[#444746] dark:text-[#8E918F] px-1'
          }`}
        >
          {tCommon('aiSenderName')}
        </span>

        <div
          className={`rounded-2xl rounded-bl-md px-4 py-3 space-y-2 ${theme.peerBubbleClass}`}
        >
          <div
            className={`flex items-center gap-1.5 text-[11px] font-bold ${theme.accentTextClass}`}
          >
            <img
              src="/socratic_mascot.png"
              alt={tMsg('aiBadge')}
              className="w-4 h-4 object-contain shrink-0 animate-pulse"
            />
            <span>{tMsg('aiBadge')}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1" aria-hidden="true">
              <span
                className={`w-2 h-2 rounded-full animate-bounce ${theme.aiDotClass}`}
              />
              <span
                className={`w-2 h-2 rounded-full animate-bounce [animation-delay:150ms] ${theme.aiDotClass}`}
              />
              <span
                className={`w-2 h-2 rounded-full animate-bounce [animation-delay:300ms] ${theme.aiDotClass}`}
              />
            </span>
            <span className="text-xs sm:text-sm font-medium opacity-85 animate-pulse">
              {tMsg('aiThinking')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
