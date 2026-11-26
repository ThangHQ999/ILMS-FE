'use client';

import React from 'react';
import type { DifficultyLevel } from '../../schemas/quiz.schema';
import type { AzotaParsedQuestion } from '../../utils/azota-question-parser';

interface AzotaPreviewCardProps {
  question: AzotaParsedQuestion;
  onToggleOption: (questionIndex: number, letter: string) => void;
  onChangeDifficulty: (questionIndex: number, difficulty: DifficultyLevel) => void;
}

const TYPE_LABEL: Record<string, string> = {
  SINGLE_CHOICE: '1 đáp án',
  MULTIPLE_CHOICE: 'Nhiều đáp án',
  TRUE_FALSE: 'Đúng / Sai',
  ESSAY: 'Tự luận',
};

export function AzotaPreviewCard({
  question,
  onToggleOption,
  onChangeDifficulty,
}: AzotaPreviewCardProps) {
  return (
    <article
      className={`rounded-3xl p-4 sm:p-5 space-y-3 transition-colors ${
        question.isValid
          ? 'bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none'
          : 'bg-white dark:bg-[#1E1F20] ring-2 ring-[#B3261E]/60 dark:ring-[#F2B8B5]/60'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-3 py-1 text-xs font-medium text-[#041E49] dark:text-[#C2E7FF]">
            Câu {question.index}
          </span>
          <span className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1 text-xs text-[#444746] dark:text-[#C4C7C5]">
            {TYPE_LABEL[question.questionType] ?? question.questionType}
          </span>
          {question.isValid ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#C4EED0] dark:bg-[#0F5223] px-2.5 py-1 text-xs font-medium text-[#072711] dark:text-[#C4EED0]">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Hợp lệ
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F9DEDC] dark:bg-[#8C1D18] px-2.5 py-1 text-xs font-medium text-[#410E0B] dark:text-[#F9DEDC]">
              <span className="material-symbols-outlined text-[14px]">error</span>
              Cần sửa
            </span>
          )}
        </div>

        <select
          value={question.difficultyLevel}
          onChange={(e) =>
            onChangeDifficulty(question.index, e.target.value as DifficultyLevel)
          }
          aria-label="Độ khó câu hỏi"
          className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1 text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
        >
          <option value="EASY">Dễ</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HARD">Khó</option>
        </select>
      </div>

      <p className="text-sm font-medium leading-relaxed text-[#1F1F1F] dark:text-[#E3E3E3] whitespace-pre-line">
        {question.content || '(Chưa có nội dung câu hỏi)'}
      </p>

      {question.options.length > 0 && (
        <div className="space-y-1.5">
          {question.options.map((opt) => (
            <button
              key={opt.letter}
              type="button"
              onClick={() => onToggleOption(question.index, opt.letter)}
              className={`w-full flex items-start gap-2.5 rounded-2xl px-3.5 py-2 text-left text-sm transition-colors ${
                opt.isCorrect
                  ? 'bg-[#C4EED0]/75 text-[#072711] dark:bg-[#0F5223]/70 dark:text-[#C4EED0] font-medium'
                  : 'bg-[#F0F4F9] text-[#444746] dark:bg-[#282A2C] dark:text-[#C4C7C5] hover:bg-[#E9EEF6] dark:hover:bg-[#333537]'
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  opt.isCorrect
                    ? 'bg-[#146C2E] text-white dark:bg-[#6DD58C] dark:text-[#072711]'
                    : 'bg-white dark:bg-[#1E1F20] text-[#444746] dark:text-[#C4C7C5]'
                }`}
              >
                {opt.letter}
              </span>
              <span className="flex-1">{opt.content || '(Trống)'}</span>
              {opt.isCorrect && (
                <span className="material-symbols-outlined text-[18px] shrink-0">
                  check
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {question.explanation && (
        <p className="rounded-2xl bg-[#F0F4F9] dark:bg-[#131314] px-3.5 py-2 text-xs text-[#444746] dark:text-[#C4C7C5]">
          <strong className="text-[#1F1F1F] dark:text-[#E3E3E3]">Giải thích: </strong>
          {question.explanation}
        </p>
      )}

      {question.issues.length > 0 && (
        <div className="space-y-1 pt-1">
          {question.issues.map((issue) => (
            <p
              key={issue}
              className="text-xs font-medium text-[#B3261E] dark:text-[#F2B8B5]"
            >
              • {issue}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}
