'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CustomSelect } from '@/components/shared';

interface CodeSnippetModalProps {
  isOpen: boolean;
  initialLanguage?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: { content: string; codeLanguage: string }) => Promise<void>;
}

const CODE_LANGUAGES = [
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'sql', label: 'SQL' },
  { value: 'cpp', label: 'C / C++' },
];

export function CodeSnippetModal({
  isOpen,
  initialLanguage = 'java',
  isSubmitting = false,
  onClose,
  onSubmit,
}: CodeSnippetModalProps) {
  const t = useTranslations('chat.modals.code');
  const tCommon = useTranslations('chat.common');
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState('');

  useEffect(() => {
    setLanguage(initialLanguage || 'java');
  }, [initialLanguage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await onSubmit({ content: code.trimEnd(), codeLanguage: language });
    setCode('');
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
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-2xl space-y-4"
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

        <CustomSelect
          label={t('languageLabel')}
          value={language}
          onChange={setLanguage}
          options={CODE_LANGUAGES}
        />

        <textarea
          rows={8}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('codePlaceholder')}
          className="w-full p-4 rounded-2xl bg-[#131314] text-[#E3E3E3] font-mono text-xs outline-none resize-y"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="submit"
            disabled={!code.trim() || isSubmitting}
            className="px-5 py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? tCommon('processing') : t('submitBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
