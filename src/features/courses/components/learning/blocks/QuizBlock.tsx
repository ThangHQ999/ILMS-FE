'use client';

import React, { useState } from 'react';
import type { LessonBlock } from '../../../schemas/lesson-block.schema';

interface QuizBlockProps {
  block: LessonBlock;
  isEditorMode: boolean;
  onChange: (nextContent: Record<string, unknown>) => void;
  onSubmitAttempt: (selectedIndex: number) => void;
  isSubmitting?: boolean;
}

export function QuizBlock({
  block,
  isEditorMode,
  onChange,
  onSubmitAttempt,
  isSubmitting = false,
}: QuizBlockProps) {
  const c = block.content as Record<string, unknown>;
  const question = String(c.question ?? '');
  const options: string[] = Array.isArray(c.options)
    ? c.options.map((o) => String(o))
    : ['', ''];
  const correctIndex =
    typeof c.correctIndex === 'number' ? c.correctIndex : null;
  const explanation = c.explanation ? String(c.explanation) : '';
  const allowRetry = c.allowRetry !== false;

  const interaction = (block.studentState?.interactionState ?? {}) as Record<
    string,
    unknown
  >;
  const serverSelectedIndex =
    typeof interaction.selectedIndex === 'number'
      ? interaction.selectedIndex
      : null;
  const serverIsCorrect =
    typeof interaction.isCorrect === 'boolean' ? interaction.isCorrect : null;

  const [pickedIndex, setPickedIndex] = useState<number | null>(
    serverSelectedIndex
  );

  if (isEditorMode) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span className="material-symbols-outlined text-[18px]">quiz</span>
            <span>Câu hỏi trắc nghiệm nhanh (Inline Quiz)</span>
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={allowRetry}
              onChange={(e) =>
                onChange({ ...c, allowRetry: e.target.checked })
              }
            />
            <span>Cho phép làm lại</span>
          </label>
        </div>

        <input
          type="text"
          value={question}
          onChange={(e) => onChange({ ...c, question: e.target.value })}
          placeholder="Nhập nội dung câu hỏi..."
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 border-none outline-none"
        />

        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`quiz-correct-${block.id}`}
                checked={(correctIndex ?? 0) === idx}
                onChange={() => onChange({ ...c, correctIndex: idx })}
                title="Đánh dấu là đáp án đúng"
                className="cursor-pointer"
              />
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const nextOpts = [...options];
                  nextOpts[idx] = e.target.value;
                  onChange({ ...c, options: nextOpts });
                }}
                placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border-none outline-none"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextOpts = options.filter((_, i) => i !== idx);
                    const nextCorrect =
                      correctIndex === idx
                        ? 0
                        : correctIndex !== null && correctIndex > idx
                          ? correctIndex - 1
                          : correctIndex;
                    onChange({
                      ...c,
                      options: nextOpts,
                      correctIndex: nextCorrect,
                    });
                  }}
                  className="text-xs text-slate-400 hover:text-rose-500 border-none bg-transparent cursor-pointer px-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...c,
                options: [...options, `Đáp án ${String.fromCharCode(65 + options.length)}`],
              })
            }
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline border-none bg-transparent cursor-pointer"
          >
            + Thêm lựa chọn
          </button>
        </div>

        <input
          type="text"
          value={explanation}
          onChange={(e) => onChange({ ...c, explanation: e.target.value })}
          placeholder="Giải thích đáp án (hiện sau khi sinh viên trả lời đúng)..."
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 border-none outline-none"
        />
      </div>
    );
  }

  const effectiveSelected = pickedIndex ?? serverSelectedIndex;
  const hasAttempted = serverIsCorrect !== null;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
          <span className="material-symbols-outlined text-[18px]">quiz</span>
          <span>Kiểm tra nhanh tại chỗ</span>
        </span>
        {block.studentState?.isCompleted && (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
            Đã hoàn thành
          </span>
        )}
      </div>

      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
        {question}
      </h4>

      <div className="space-y-2">
        {options.map((opt, idx) => {
          const isPicked = effectiveSelected === idx;
          const isCorrectChoice =
            hasAttempted && correctIndex !== null && correctIndex === idx;
          const isWrongChoice =
            hasAttempted && serverSelectedIndex === idx && serverIsCorrect === false;

          return (
            <button
              key={idx}
              type="button"
              disabled={isSubmitting || (hasAttempted && !allowRetry)}
              onClick={() => setPickedIndex(idx)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm transition-all cursor-pointer border ${
                isCorrectChoice
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold'
                  : isWrongChoice
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200'
                    : isPicked
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-100 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[11px] font-bold shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          disabled={pickedIndex === null || isSubmitting}
          onClick={() => pickedIndex !== null && onSubmitAttempt(pickedIndex)}
          className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold border-none cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Đang kiểm tra...' : 'Kiểm tra đáp án'}
        </button>

        {hasAttempted && (
          <span
            className={`text-xs font-bold ${
              serverIsCorrect
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {serverIsCorrect ? 'Chính xác!' : 'Chưa đúng, hãy thử lại.'}
          </span>
        )}
      </div>

      {hasAttempted && explanation && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>Giải thích:</strong> {explanation}
        </div>
      )}
    </div>
  );
}
