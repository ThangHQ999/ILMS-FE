'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChatMessage } from '../types';
import { AiTutorMarkdownRenderer } from './AiTutorMarkdownRenderer';
import { SocraticContextAccordion } from './SocraticContextAccordion';
import styles from './AiTutorMessageItem.module.css';

interface AiTutorMessageItemProps {
  message: ChatMessage;
  userFullName?: string;
  onCopyCode: (code: string, id: string) => void;
  copiedCodeId: string | null;
  onRegenerate?: () => void;
  onFeedback?: (messageId: string, rating: 'LIKE' | 'DISLIKE', comment?: string) => void;
  isSubmittingFeedback?: boolean;
}

export const AiTutorMessageItem = React.memo(function AiTutorMessageItem({
  message,
  userFullName = 'Trần Nhật Minh',
  onCopyCode,
  copiedCodeId,
  onRegenerate,
  onFeedback,
  isSubmittingFeedback = false,
}: AiTutorMessageItemProps) {
  const t = useTranslations('aiTutor');
  const [localFeedback, setLocalFeedback] = useState<'LIKE' | 'DISLIKE' | null>(
    (message.feedback_rating === 'LIKE' || message.feedback_rating === 'DISLIKE')
      ? message.feedback_rating
      : null
  );
  const [copiedAll, setCopiedAll] = useState(false);

  const isUser = message.sender === 'user';
  const initials =
    userFullName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'NM';

  const handleCopyAll = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const handleRate = (rating: 'LIKE' | 'DISLIKE') => {
    const next = localFeedback === rating ? null : rating;
    setLocalFeedback(next);
    if (next && onFeedback) {
      onFeedback(message.id, next);
    }
  };

  // User Message
  if (isUser) {
    return (
      <div className="flex justify-end gap-3.5 items-start">
        <div className="flex flex-col items-end gap-1.5 max-w-xl">
          <div className="bg-white dark:bg-[#1E1F20] text-slate-900 dark:text-[#E3E3E3] rounded-3xl rounded-tr-md px-5 py-3 text-[15px] leading-relaxed font-normal shadow-none border-none">
            <AiTutorMarkdownRenderer
              content={message.content}
              className="!space-y-1 !text-slate-900 dark:!text-slate-100 [&_p]:!mb-1 [&_p:last-child]:!mb-0"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 pr-1">
            {message.timestamp} • {t('sentAt')}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#041E49] dark:bg-[#282A2C] text-white flex items-center justify-center font-semibold text-[12px] shrink-0 mt-0.5 shadow-none">
          {initials}
        </div>
      </div>
    );
  }

  // Socratic AI Message
  return (
    <div className="flex justify-start gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] border-none text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center shrink-0 mt-1 shadow-none">
        <span className="material-symbols-outlined text-[19px]">psychology</span>
      </div>

      <div className="flex-1 space-y-4 max-w-2xl text-[15px] text-slate-800 dark:text-[#E3E3E3] leading-relaxed min-w-0">
        {/* Step Badge nếu có */}
        {message.step_progress && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] border-none text-[#041E49] dark:text-[#A8C7FA] font-mono text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
            <span>{t('stepBadge', { step: message.step_progress.number })}</span>
          </div>
        )}

        {message.isStreaming && (!message.content || message.streamStatus) && (
          <div role="status" aria-atomic="true" className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span aria-hidden="true" className={styles.dots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </span>
            <span className={styles.label}>
              {message.streamStatus && t.has(`streamStages.${message.streamStatus.stage}`)
                ? t(`streamStages.${message.streamStatus.stage}`) : t('streamWorking')}
            </span>
          </div>
        )}
        {message.isIncomplete && (
          <p role="status" className="text-sm text-muted-foreground">{t('streamIncomplete')}</p>
        )}

        {/* Nội dung Markdown chính có KaTeX, Mermaid và Vis-3D */}
        <AiTutorMarkdownRenderer content={message.content} isStreaming={message.isStreaming} />

        {/* Bảng biểu kỹ thuật (nếu có) */}
        {message.complexityTable && (
          <div className="border-none rounded-2xl overflow-hidden shadow-none my-3 bg-white dark:bg-[#1E1F20]">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-700 dark:text-[#C4C7C5] font-semibold border-none">
                <tr>
                  {message.complexityTable.headers.map((h, idx) => (
                    <th key={idx} className="py-3 px-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F9] dark:divide-[#282A2C]/50 text-slate-600 dark:text-[#C4C7C5]">
                {message.complexityTable.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C] transition-colors"
                  >
                    <td
                      className={`py-3 px-4 font-semibold ${
                        row.isWorst
                          ? 'text-[#725200] dark:text-[#FFB784]'
                          : 'text-slate-900 dark:text-[#E3E3E3]'
                      }`}
                    >
                      {row.caseName}
                    </td>
                    <td
                      className={`py-3 px-4 font-mono font-medium ${
                        row.isWorst
                          ? 'text-[#725200] dark:text-[#FFB784] font-semibold'
                          : 'text-slate-900 dark:text-[#E3E3E3]'
                      }`}
                    >
                      {row.time}
                    </td>
                    <td
                      className={`py-3 px-4 font-mono ${
                        row.isWorst
                          ? 'text-[#725200] dark:text-[#FFB784]'
                          : 'text-slate-600 dark:text-[#C4C7C5]'
                      }`}
                    >
                      {row.space}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-[#C4C7C5]">{row.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Khối mã code */}
        {message.codeSnippet && (
          <div className="rounded-2xl overflow-hidden bg-[#1E1F20] dark:bg-[#131314] shadow-none border-none font-mono text-[13px] my-4">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#282A2C] dark:bg-[#1E1F20] border-none text-slate-300">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                </div>
                <span className="ml-2 text-xs font-sans text-slate-300 font-medium tracking-wide">
                  {message.codeSnippet.filename}
                </span>
              </div>
              <button
                onClick={() =>
                  onCopyCode(message.codeSnippet!.code, `snippet-${message.id}`)
                }
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#333537] hover:bg-[#3E4042] text-slate-200 transition-colors cursor-pointer border-none"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedCodeId === `snippet-${message.id}` ? 'check' : 'content_copy'}
                </span>
                <span>
                  {copiedCodeId === `snippet-${message.id}` ? t('codeCopied') : t('copyCode')}
                </span>
              </button>
            </div>
            <pre className="p-4 text-slate-200 overflow-x-auto leading-relaxed">
              <code>{message.codeSnippet.code}</code>
            </pre>
          </div>
        )}

        {/* Thẻ câu hỏi tư duy Socratic */}
        {message.socraticQuestion && (
          <div className="p-4 rounded-3xl bg-[#D3E3FD]/50 dark:bg-[#162B4D] border-none text-slate-800 dark:text-[#E3E3E3] space-y-1.5">
            <div className="flex items-center gap-2 text-[#041E49] dark:text-[#A8C7FA] font-semibold text-[14px]">
              <span className="material-symbols-outlined text-[19px]">lightbulb</span>
              <span>{t('socraticQuestionTitle')}</span>
            </div>
            <div className="text-[14px] text-slate-700 dark:text-[#C4C7C5] leading-relaxed">
              <AiTutorMarkdownRenderer content={message.socraticQuestion} />
            </div>
          </div>
        )}

        {/* Accordion nguồn tài liệu tham chiếu */}
        {((message.referenced_chunk_ids && message.referenced_chunk_ids.length > 0) ||
          (message.referenced_node_ids && message.referenced_node_ids.length > 0)) && (
          <SocraticContextAccordion
            chunkIds={message.referenced_chunk_ids}
            nodeIds={message.referenced_node_ids}
          />
        )}

        {/* Action Toolbar */}
        {!message.isStreaming && !message.isIncomplete && (
          <div className="flex items-center gap-1 pt-1 text-slate-400">
            <button
              onClick={handleCopyAll}
              className="p-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border-none"
              title={t('copyAll')}
              type="button"
            >
              <span className="material-symbols-outlined text-[17px]">
                {copiedAll ? 'check' : 'content_copy'}
              </span>
            </button>
            <button
              onClick={() => handleRate('LIKE')}
              disabled={isSubmittingFeedback}
              className={`p-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none ${
                localFeedback === 'LIKE'
                  ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                  : 'hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={t('helpful')}
              type="button"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: localFeedback === 'LIKE' ? "'FILL' 1" : "'FILL' 0" }}
              >
                thumb_up
              </span>
            </button>
            <button
              onClick={() => handleRate('DISLIKE')}
              disabled={isSubmittingFeedback}
              className={`p-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none ${
                localFeedback === 'DISLIKE'
                  ? 'text-red-500'
                  : 'hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={t('notHelpful')}
              type="button"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: localFeedback === 'DISLIKE' ? "'FILL' 1" : "'FILL' 0" }}
              >
                thumb_down
              </span>
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border-none"
                title={t('regenerate')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
