'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ChatMessage, SocraticProgressState, SocraticKnowledgeContext } from '../types';
import { AiTutorMessageItem } from './AiTutorMessageItem';
import { SocraticStepperCard } from './SocraticStepperCard';

interface AiTutorChatCanvasProps {
  messages: ChatMessage[];
  userFullName?: string;
  isTyping: boolean;
  onCopyCode: (code: string, id: string) => void;
  copiedCodeId: string | null;
  onRegenerateLast?: () => void;
  threadEndRef: React.RefObject<HTMLDivElement | null>;
  progressState?: SocraticProgressState | null;
  knowledgeContext?: SocraticKnowledgeContext | null;
  onFeedback?: (messageId: string, rating: 'LIKE' | 'DISLIKE', comment?: string) => void;
  isSubmittingFeedback?: boolean;
  isLoadingDetail?: boolean;
}

export const AiTutorChatCanvas = React.memo(function AiTutorChatCanvas({
  messages,
  userFullName = 'Trần Nhật Minh',
  isTyping,
  onCopyCode,
  copiedCodeId,
  onRegenerateLast,
  threadEndRef,
  progressState,
  onFeedback,
  isSubmittingFeedback,
  isLoadingDetail = false,
}: AiTutorChatCanvasProps) {
  const t = useTranslations('aiTutor');

  return (
    <div
      className="flex-1 overflow-y-auto px-4 md:px-8 py-8 scroll-smooth scrollbar-thin bg-white dark:bg-[#0B0F19]"
      id="message-thread"
    >
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Socratic Stepper Card nếu đang có tiến trình */}
        {progressState && <SocraticStepperCard progress={progressState} />}

        {/* Loading Skeleton khi đang tải chi tiết phiên */}
        {isLoadingDetail && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* User message skeleton */}
            <div className="flex justify-end gap-3.5 items-start">
              <div className="flex flex-col items-end gap-2 max-w-xl w-full">
                <div className="h-14 w-3/4 rounded-2xl rounded-tr-sm bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
            </div>

            {/* AI message skeleton */}
            <div className="flex justify-start gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3 max-w-2xl w-full">
                <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isLastAi = msg.sender === 'ai' && idx === messages.length - 1;
          return (
            <AiTutorMessageItem
              key={msg.id}
              message={msg}
              userFullName={userFullName}
              onCopyCode={onCopyCode}
              copiedCodeId={copiedCodeId}
              onRegenerate={isLastAi ? onRegenerateLast : undefined}
              onFeedback={onFeedback}
              isSubmittingFeedback={isSubmittingFeedback}
            />
          );
        })}

        {/* Typing / Reasoning indicator */}
        {isTyping && !messages.some((message) => message.isStreaming) && (
          <div className="flex justify-start gap-4 items-start animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-1 shadow-xs">
              <span className="material-symbols-outlined text-[19px]">psychology</span>
            </div>
            <div className="flex-1 space-y-3 max-w-2xl text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-2 font-medium text-blue-600 dark:text-cyan-400 text-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400" />
                  {t('analyzingResponse')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={threadEndRef as any} />
      </div>
    </div>
  );
});
