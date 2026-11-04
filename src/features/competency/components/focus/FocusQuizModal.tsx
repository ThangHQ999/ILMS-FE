'use client';

import React, { useState } from 'react';
import { DiagnosticQuizData, QuizOption } from '../../types';

interface FocusQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishQuiz: () => void;
  onTriggerSocraticHint: (hint: string) => void;
  quizData: DiagnosticQuizData;
}

export function FocusQuizModal({
  isOpen,
  onClose,
  onFinishQuiz,
  onTriggerSocraticHint,
  quizData,
}: FocusQuizModalProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (opt: QuizOption) => {
    if (isAnswered) return;

    setSelectedKey(opt.key);
    setIsAnswered(true);
    setIsCorrect(opt.isCorrect);

    if (!opt.isCorrect) {
      // Trigger Socratic AI Coach hint
      onTriggerSocraticHint(quizData.socraticHint);
    }
  };

  const handleResetAndClose = () => {
    setSelectedKey(null);
    setIsAnswered(false);
    setIsCorrect(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded">
              CÂU {quizData.questionNumber} / {quizData.totalQuestions}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{quizData.title}</h3>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Question Text */}
        <div className="py-4">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mb-4 font-medium leading-relaxed">
            Trong bài toán Knapsack 0/1 (mỗi đồ vật chỉ được chọn tối đa 1 lần), tại sao khi tối ưu không gian sang mảng 1 chiều{' '}
            <code className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-1 py-0.5 rounded font-mono">
              dp[w]
            </code>
            , vòng lặp khối lượng{' '}
            <code className="text-amber-700 dark:text-amber-400 font-mono bg-amber-50 dark:bg-amber-950/60 px-1 py-0.5 rounded border border-amber-200/60 dark:border-amber-800">
              w
            </code>{' '}
            lại bắt buộc phải duyệt từ <strong>W giảm dần về weight[i]</strong>?
          </p>

          {/* Options */}
          <div className="space-y-2.5">
            {quizData.options.map((opt) => {
              const isSelected = selectedKey === opt.key;
              let btnClass =
                'w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ';

              if (!isAnswered) {
                btnClass +=
                  'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer';
              } else if (isSelected && opt.isCorrect) {
                btnClass +=
                  'bg-emerald-950/70 border-emerald-500 text-emerald-200 dark:text-emerald-300';
              } else if (isSelected && !opt.isCorrect) {
                btnClass +=
                  'bg-rose-950/70 border-rose-500 text-rose-200 dark:text-rose-300';
              } else {
                btnClass +=
                  'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60';
              }

              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={btnClass}
                >
                  <span>{opt.text}</span>
                  <span className="material-symbols-outlined text-[18px] ml-2 shrink-0">
                    {isAnswered && isSelected && opt.isCorrect
                      ? 'check_circle'
                      : isAnswered && isSelected && !opt.isCorrect
                      ? 'cancel'
                      : 'radio_button_unchecked'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback explanation box */}
          {isAnswered && (
            <div
              className={`mt-4 p-3 rounded-xl text-xs leading-relaxed ${
                isCorrect
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">
                  {isCorrect ? 'celebration' : 'psychology'}
                </span>
                <div>
                  <p className="font-semibold mb-1">
                    {isCorrect ? 'Chính xác! 🎉' : 'Chưa chính xác! 💡'}
                  </p>
                  <p>{isCorrect ? quizData.correctExplanation : quizData.wrongExplanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500">Chỉ 3 phút • Không lưu lịch sử điểm so sánh</span>

          {isAnswered && isCorrect ? (
            <button
              type="button"
              onClick={() => {
                handleResetAndClose();
                onFinishQuiz();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <span>Hoàn tất &amp; Nâng vạch năng lực (+15%)</span>
              <span className="material-symbols-outlined text-[16px]">celebration</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 transition"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
