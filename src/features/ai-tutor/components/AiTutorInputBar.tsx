'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { useVoiceInput } from '../hooks/useVoiceInput';
import { LatexFormulaPicker } from './LatexFormulaPicker';
import { AiTutorInputBanners } from './AiTutorInputBanners';

interface AiTutorInputBarProps {
  inputText: string;
  onChangeInput: (text: string) => void;
  onSend: () => void;
  isTyping: boolean;
}

export function AiTutorInputBar({
  inputText,
  onChangeInput,
  onSend,
  isTyping,
}: AiTutorInputBarProps) {
  const t = useTranslations('aiTutor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFormulaPickerOpen, setIsFormulaPickerOpen] = useState(false);

  const {
    isListening,
    isSupported,
    errorMessage,
    toggleListening,
    stopListening,
    clearError,
  } = useVoiceInput({
    currentText: inputText,
    onTranscript: onChangeInput,
    lang: 'vi-VN',
  });

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSelectFormula = (formulaLatex: string) => {
    const snippet = `$${formulaLatex}$`;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart ?? inputText.length;
      const end = textarea.selectionEnd ?? inputText.length;

      const before = inputText.substring(0, start);
      const after = inputText.substring(end);

      const padLeft = before.length > 0 && !before.endsWith(' ') ? ' ' : '';
      const padRight = after.length > 0 && !after.startsWith(' ') ? ' ' : ' ';
      const insertText = `${padLeft}${snippet}${padRight}`;

      const updated = before + insertText + after;
      onChangeInput(updated);

      setTimeout(() => {
        textarea.focus();
        const cursorPosition = start + insertText.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    } else {
      const pad = inputText.length > 0 && !inputText.endsWith(' ') ? ' ' : '';
      onChangeInput(`${inputText}${pad}${snippet} `);
    }

    setIsFormulaPickerOpen(false);
  };

  return (
    <footer className="shrink-0 p-4 bg-[#F0F4F9]/90 dark:bg-[#131314]/90 backdrop-blur-md border-none">
      <div className="max-w-[780px] mx-auto w-full">
        {/* Banner trạng thái Voice & lỗi micro */}
        <AiTutorInputBanners
          isListening={isListening}
          errorMessage={errorMessage}
          onStopListening={stopListening}
          onClearError={clearError}
        />

        {/* Khung nhập tin nhắn chính */}
        <div className="relative bg-white dark:bg-[#1E1F20] rounded-3xl border-none shadow-none transition-all">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => onChangeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pt-3.5 pb-12 px-5 bg-transparent border-0 outline-none focus:ring-0 resize-none text-[15px] text-slate-800 dark:text-[#E3E3E3] placeholder:text-slate-400 dark:placeholder:text-[#8E918F] leading-relaxed max-h-40 min-h-[52px]"
            placeholder={t('chatInputPlaceholder')}
            rows={1}
          />

          {/* Thanh công cụ ở dưới góc trong ô input */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Trái: Đính kèm, Bảng công thức LaTeX & Voice */}
            <div className="flex items-center gap-1 pointer-events-auto">
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors"
                title={t('attachTooltip')}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>

              {/* Nút & Bảng chọn công thức LaTeX */}
              <div className="relative">
                <button
                  onClick={() => setIsFormulaPickerOpen((prev) => !prev)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isFormulaPickerOpen
                      ? 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                  }`}
                  title={t('formulaTooltip')}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[19px]">functions</span>
                </button>

                <LatexFormulaPicker
                  isOpen={isFormulaPickerOpen}
                  onClose={() => setIsFormulaPickerOpen(false)}
                  onSelectFormula={handleSelectFormula}
                />
              </div>

              {/* Nút Micro Voice-to-Text */}
              <button
                onClick={toggleListening}
                disabled={!isSupported}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  !isSupported
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isListening
                    ? 'bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] animate-pulse'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                }`}
                title={
                  !isSupported
                    ? 'Trình duyệt không hỗ trợ Web Speech API'
                    : isListening
                    ? 'Đang nghe... Nhấn để dừng'
                    : t('voiceTooltip')
                }
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {!isSupported ? 'mic_off' : 'mic'}
                </span>
              </button>
            </div>

            {/* Phải: Nút Gửi câu hỏi */}
            <div className="pointer-events-auto">
              <button
                onClick={() => onSend()}
                disabled={!inputText.trim() || isTyping}
                className="w-8 h-8 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] active:scale-95 disabled:opacity-40 flex items-center justify-center border-none shadow-none transition-all"
                title={t('sendTooltip')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-slate-400 dark:text-[#8E918F] text-center mt-2.5">
          {t('disclaimer')}
        </p>
      </div>
    </footer>
  );
}
