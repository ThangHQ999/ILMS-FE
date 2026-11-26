'use client';

import React, { useState } from 'react';
import type { BankQuestionItem, QuestionConcept } from '../../schemas/question-bank.schema';

const DIFFICULTY_META: Record<string, { label: string; cls: string }> = {
  EASY: {
    label: 'Dễ',
    cls: 'bg-[#C4EED0] text-[#072711] dark:bg-[#0F5223] dark:text-[#C4EED0]',
  },
  MEDIUM: {
    label: 'Trung bình',
    cls: 'bg-[#FEEFC3] text-[#4D3800] dark:bg-[#5C4300] dark:text-[#FEEFC3]',
  },
  HARD: {
    label: 'Khó',
    cls: 'bg-[#F9DEDC] text-[#410E0B] dark:bg-[#8C1D18] dark:text-[#F9DEDC]',
  },
};

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: '1 đáp án',
  MULTIPLE_CHOICE: 'Nhiều đáp án',
  TRUE_FALSE: 'Đúng / Sai',
  ESSAY: 'Tự luận',
};

const BLOOM_LABELS: Record<string, string> = {
  REMEMBER: 'Nhớ',
  UNDERSTAND: 'Hiểu',
  APPLY: 'Vận dụng',
  ANALYZE: 'Phân tích',
  EVALUATE: 'Đánh giá',
  CREATE: 'Sáng tạo',
};

interface QuestionBankCardProps {
  question: BankQuestionItem;
  conceptMap: Map<string, QuestionConcept>;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (question: BankQuestionItem) => void;
  onDelete: (question: BankQuestionItem) => void;
  onPushSingle: (question: BankQuestionItem) => void;
}

export function QuestionBankCard({
  question,
  conceptMap,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onPushSingle,
}: QuestionBankCardProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  const diff = DIFFICULTY_META[question.difficultyLevel] ?? DIFFICULTY_META.MEDIUM;
  const typeLabel = TYPE_LABELS[question.questionType] ?? question.questionType;
  const bloomLabel = question.bloomLevel ? BLOOM_LABELS[question.bloomLevel] : null;
  const correctRate = question.stats?.correctRate ?? question.correctRate;
  const discriminationIndex =
    question.stats?.discriminationIndex ?? question.discriminationIndex;

  const conceptNames =
    question.concepts && question.concepts.length > 0
      ? question.concepts.map((c) => c.name)
      : question.conceptIds
          .map((id) => conceptMap.get(id)?.name)
          .filter((name): name is string => Boolean(name));

  return (
    <article
      className={`rounded-3xl p-5 transition-colors border-none ${
        isSelected
          ? 'bg-[#D3E3FD]/45 dark:bg-[#004A77]/35 ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA]'
          : 'bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(question.id)}
          aria-label="Chọn câu hỏi"
          className="mt-1 h-4 w-4 rounded accent-[#0B57D0] dark:accent-[#A8C7FA] cursor-pointer"
        />

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${diff.cls}`}>
                {diff.label}
              </span>
              <span className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1 text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                {typeLabel}
              </span>
              {bloomLabel && (
                <span className="rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-3 py-1 text-xs font-medium text-[#041E49] dark:text-[#C2E7FF]">
                  Bloom: {bloomLabel}
                </span>
              )}
              {question.sourceType === 'AI_GENERATED' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E8DEF8] dark:bg-[#4A4458] px-3 py-1 text-xs font-medium text-[#1D192B] dark:text-[#E8DEF8]">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  AI
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPushSingle(question)}
                title="Đưa vào Quiz / Bài kiểm tra"
                className="rounded-full p-2 text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">playlist_add</span>
              </button>
              <button
                type="button"
                onClick={() => onEdit(question)}
                title="Chỉnh sửa câu hỏi"
                className="rounded-full p-2 text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(question)}
                title="Xóa câu hỏi"
                className="rounded-full p-2 text-[#B3261E] dark:text-[#F2B8B5] hover:bg-[#F9DEDC]/60 dark:hover:bg-[#8C1D18]/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">delete</span>
              </button>
            </div>
          </div>

          <p className="text-sm sm:text-base font-medium leading-relaxed text-[#1F1F1F] dark:text-[#E3E3E3] whitespace-pre-line">
            {question.content}
          </p>

          {question.codeSnippet && (
            <pre className="rounded-2xl bg-[#F0F4F9] dark:bg-[#131314] p-3.5 text-xs font-mono text-[#1F1F1F] dark:text-[#E3E3E3] overflow-x-auto">
              <code>{question.codeSnippet}</code>
            </pre>
          )}

          {(conceptNames.length > 0 || question.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {conceptNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 rounded-full bg-[#E9EEF6] dark:bg-[#282A2C] px-2.5 py-0.5 text-xs text-[#444746] dark:text-[#C4C7C5]"
                >
                  <span className="material-symbols-outlined text-[13px]">hub</span>
                  {name}
                </span>
              ))}
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-2.5 py-0.5 text-xs text-[#444746] dark:text-[#C4C7C5]"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          {showAnswers && (
            <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#131314] p-4 space-y-2.5">
              {question.answers.length > 0 ? (
                <ul className="space-y-1.5">
                  {question.answers.map((ans, idx) => (
                    <li
                      key={ans.id ?? idx}
                      className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${
                        ans.isCorrect
                          ? 'bg-[#C4EED0]/70 text-[#072711] dark:bg-[#0F5223]/60 dark:text-[#C4EED0] font-medium'
                          : 'text-[#444746] dark:text-[#C4C7C5]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">
                        {ans.isCorrect ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>{ans.content}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                  Câu hỏi tự luận (không có phương án trắc nghiệm).
                </p>
              )}

              {question.explanation && (
                <div className="pt-2 text-xs text-[#444746] dark:text-[#C4C7C5]">
                  <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                    Giải thích:{' '}
                  </span>
                  {question.explanation}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#444746] dark:text-[#C4C7C5]">
            <button
              type="button"
              onClick={() => setShowAnswers((prev) => !prev)}
              className="inline-flex items-center gap-1 font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">
                {showAnswers ? 'visibility_off' : 'visibility'}
              </span>
              {showAnswers ? 'Ẩn đáp án & giải thích' : `Xem đáp án (${question.answers.length})`}
            </button>

            <div className="flex items-center gap-4">
              <span>
                Tỷ lệ đúng:{' '}
                <strong className="text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {typeof correctRate === 'number' ? `${Math.round(correctRate)}%` : '--'}
                </strong>
              </span>
              <span>
                Độ phân biệt:{' '}
                <strong className="text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {typeof discriminationIndex === 'number'
                    ? discriminationIndex.toFixed(2)
                    : '--'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
