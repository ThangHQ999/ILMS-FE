'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CreatePollInput } from '../../schemas/chat.schema';

interface CreatePollModalProps {
  isOpen: boolean;
  prefill?: { question: string; options: string[] } | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePollInput) => Promise<void>;
}

export function CreatePollModal({
  isOpen,
  prefill,
  isSubmitting = false,
  onClose,
  onSubmit,
}: CreatePollModalProps) {
  const t = useTranslations('chat.modals.poll');
  const tCommon = useTranslations('chat.common');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);

  useEffect(() => {
    if (prefill) {
      setQuestion(prefill.question || '');
      setOptions(prefill.options.length >= 2 ? prefill.options : ['', '']);
    }
  }, [prefill]);

  if (!isOpen) return null;

  const validOptions = options.map((o) => o.trim()).filter(Boolean);
  const canSubmit = Boolean(question.trim()) && validOptions.length >= 2;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit({
      question: question.trim(),
      options: validOptions,
      allowMultiple,
    });
    setQuestion('');
    setOptions(['', '']);
    setAllowMultiple(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaLabel')}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => void handleCreate(e)}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <input
          type="text"
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('questionPlaceholder')}
          className="w-full h-10 px-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] outline-none"
        />

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[idx] = e.target.value;
                  setOptions(next);
                }}
                placeholder={t('optionPlaceholder', { index: idx + 1 })}
                className="flex-1 h-9 px-3.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] outline-none"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                  className="w-8 h-8 rounded-full text-[#747775] hover:text-[#B3261E] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {options.length < 10 && (
          <button
            type="button"
            onClick={() => setOptions([...options, ''])}
            className="text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>{t('addOptionBtn')}</span>
          </button>
        )}

        <label className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer">
          <span>{t('allowMultipleLabel')}</span>
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={(e) => setAllowMultiple(e.target.checked)}
            className="w-4 h-4 accent-[#0B57D0]"
          />
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="px-5 py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? t('submittingBtn') : t('submitBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
