'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  resolveChatTheme,
  type ChatThemePalette,
} from '../../../constants/chat-themes';

interface AiReplyBubbleProps {
  content: string;
  citedSources?: string[];
  theme?: ChatThemePalette;
}

export function AiReplyBubble({
  content,
  citedSources = [],
  theme = resolveChatTheme('DEFAULT'),
}: AiReplyBubbleProps) {
  const tMsg = useTranslations('chat.messages');

  return (
    <div
      className={`rounded-2xl px-4 py-3 space-y-2.5 max-w-full transition-colors ${theme.peerBubbleClass}`}
    >
      <div className={`flex items-center gap-1.5 text-[11px] font-bold ${theme.accentTextClass}`}>
        <img
          src="/socratic_mascot.png"
          alt={tMsg('aiBadge')}
          className="w-4 h-4 object-contain shrink-0"
        />
        <span>{tMsg('aiBadge')}</span>
      </div>

      <div className="text-xs sm:text-sm leading-relaxed space-y-2 break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <p className="leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[12px]">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {citedSources.length > 0 && (
        <div className="pt-1.5 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-1.5">
          {citedSources.map((src, idx) => (
            <span
              key={`${src}-${idx}`}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${theme.aiSourceChipClass}`}
            >
              <span className="material-symbols-outlined text-[12px]">menu_book</span>
              <span className="truncate max-w-[180px]">{src}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
