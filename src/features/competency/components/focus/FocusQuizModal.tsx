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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E1F20] border-none rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-none relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] border-none px-3 py-1 rounded-full">
              CÂU {quizData.questionNumber} / {quizData.totalQuestions}
            </span>
            <h3 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">{quizData.title}</h3>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] p-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Question Text */}
        <div className="py-4">
          <p className="text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] mb-4 font-medium leading-relaxed">
            Trong bài toán Knapsack 0/1 (mỗi đồ vật chỉ được chọn tối đa 1 lần), tại sao khi tối ưu không gian sang mảng 1 chiều{' '}
            <code className="text-[#041E49] dark:text-[#A8C7FA] bg-[#D3E3FD] dark:bg-[#162B4D] border-none px-2 py-0.5 rounded font-mono">
              dp[w]
            </code>
            , vòng lặp khối lượng{' '}
            <code className="text-[#725200] dark:text-[#FFB784] font-mono bg-[#FCEBA4] dark:bg-[#3C2A1E] px-2 py-0.5 rounded border-none">
              w
            </code>{' '}
            lại bắt buộc phải duyệt từ <strong>W giảm dần về weight[i]</strong>?
          </p>

          {/* Options */}
          <div className="space-y-2.5">
            {quizData.options.map((opt) => {
              const isSelected = selectedKey === opt.key;
              let btnClass =
                'w-full text-left p-3.5 rounded-2xl border-none text-xs transition flex items-center justify-between shadow-none ';

              if (!isAnswered) {
                btnClass +=
                  'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer';
              } else if (isSelected && opt.isCorrect) {
                btnClass +=
                  'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995] font-semibold';
              } else if (isSelected && !opt.isCorrect) {
                btnClass +=
                  'bg-[#FAD2CF] dark:bg-[#3C1919] text-[#B3261E] dark:text-[#F28B82] font-semibold';
              } else {
                btnClass +=
                  'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#747775] dark:text-[#8E918F] opacity-50';
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
              className={`mt-4 p-3.5 rounded-2xl text-xs leading-relaxed border-none ${
                isCorrect
                  ? 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]'
                  : 'bg-[#FAD2CF] dark:bg-[#3C1919] text-[#B3261E] dark:text-[#F28B82]'
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
        <div className="flex items-center justify-between pt-3 border-none text-xs">
          <span className="text-[#747775] dark:text-[#8E918F]">Chỉ 3 phút • Không lưu lịch sử điểm so sánh</span>

          {isAnswered && isCorrect ? (
            <button
              type="button"
              onClick={() => {
                handleResetAndClose();
                onFinishQuiz();
              }}
              className="px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap font-medium text-xs flex items-center gap-1.5 border-none shadow-none transition-colors cursor-pointer"
            >
              <span>Hoàn tất &amp; Nâng vạch năng lực (+15%)</span>
              <span className="material-symbols-outlined text-[16px]">celebration</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium text-xs border-none shadow-none transition-colors cursor-pointer"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
