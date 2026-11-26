'use client';

import React from 'react';
import type { SelectedClassworkQuestion } from './QuizQuestionPickerPanel';

interface AzotaQuizQuestionListProps {
  questions: SelectedClassworkQuestion[];
  autoDistributePoints: boolean;
  onPointChange: (id: string, point: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AzotaQuizQuestionList({
  questions,
  autoDistributePoints,
  onPointChange,
  onMove,
  onRemove,
}: AzotaQuizQuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-3xl bg-[#F0F4F9] dark:bg-[#131314] p-10 text-center space-y-2">
        <span className="material-symbols-outlined text-[36px] text-[#747775] dark:text-[#8E918F]">
          quiz
        </span>
        <p className="text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
          Chưa có câu hỏi nào trong đề
        </p>
        <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
          Chọn từ Ngân hàng câu hỏi, dán hàng loạt kiểu Azota hoặc soạn lẻ câu mới ở các tab phía trên.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {questions.map((q, index) => (
        <article
          id={`quiz-builder-q-${q.id}`}
          key={q.id}
          className="rounded-2xl bg-[#F0F4F9]/75 dark:bg-[#131314] p-4 sm:p-5 border border-black/5 dark:border-white/5 space-y-3"
        >
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-3 py-1 text-xs font-bold text-[#041E49] dark:text-[#C2E7FF]">
                Câu {index + 1}
              </span>
              <span className="rounded-full bg-white dark:bg-[#1E1F20] px-2.5 py-0.5 text-[11px] font-medium text-[#444746] dark:text-[#C4C7C5]">
                {q.type === 'TRUE_FALSE'
                  ? 'Đúng / Sai'
                  : q.type === 'MULTIPLE_CHOICE'
                    ? 'Nhiều đáp án'
                    : q.type === 'ESSAY'
                      ? 'Tự luận'
                      : '1 đáp án'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Point Input */}
              <div className="flex items-center gap-1 rounded-full bg-white dark:bg-[#1E1F20] px-2.5 py-1">
                <input
                  type="number"
                  min={0.1}
                  step={0.25}
                  disabled={autoDistributePoints}
                  value={q.point}
                  onChange={(e) =>
                    onPointChange(q.id, Math.max(0.1, Number(e.target.value) || 0.25))
                  }
                  aria-label={`Điểm câu ${index + 1}`}
                  className="w-14 bg-transparent text-center text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none disabled:opacity-70"
                />
                <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">đ</span>
              </div>

              {/* Move up / down */}
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMove(index, -1)}
                title="Đưa lên trên"
                className="h-8 w-8 rounded-full bg-white dark:bg-[#1E1F20] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] disabled:opacity-35 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              </button>
              <button
                type="button"
                disabled={index === questions.length - 1}
                onClick={() => onMove(index, 1)}
                title="Đưa xuống dưới"
                className="h-8 w-8 rounded-full bg-white dark:bg-[#1E1F20] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] disabled:opacity-35 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              </button>

              {/* Remove */}
              <button
                type="button"
                onClick={() => onRemove(q.id)}
                title="Xóa khỏi đề"
                className="h-8 w-8 rounded-full bg-white dark:bg-[#1E1F20] flex items-center justify-center text-[#B3261E] dark:text-[#F2B8B5] hover:bg-[#F9DEDC]/60 dark:hover:bg-[#8C1D18]/40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">close</span>
              </button>
            </div>
          </div>

          {/* Question Content */}
          <p className="text-sm font-medium leading-relaxed text-[#1F1F1F] dark:text-[#E3E3E3] whitespace-pre-line">
            {q.content}
          </p>

          {/* Azota-style Answer Preview */}
          {q.answers && q.answers.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">
                  Đáp án
                </span>
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.answers.map((ans, optIdx) => {
                  const letter = OPTION_LETTERS[optIdx] ?? String(optIdx + 1);
                  const isCorrect = Boolean(ans.isCorrect);
                  return (
                    <div
                      key={`${q.id}-opt-${optIdx}`}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs border ${
                        isCorrect
                          ? 'bg-[#C4EED0]/60 border-[#146C2E]/40 text-[#072711] dark:bg-[#0F5223]/60 dark:border-[#6DD58C]/40 dark:text-[#C4EED0] font-semibold'
                          : 'bg-white dark:bg-[#1E1F20] border-black/5 dark:border-white/5 text-[#444746] dark:text-[#C4C7C5]'
                      }`}
                    >
                      <span
                        className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          isCorrect
                            ? 'bg-[#146C2E] text-white dark:bg-[#6DD58C] dark:text-[#072711]'
                            : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1 break-words">{ans.content}</span>
                      {isCorrect && (
                        <span className="material-symbols-outlined text-[15px] shrink-0">
                          check_circle
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
