'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface PricingAuthPromptModalProps {
  isOpen: boolean;
  planName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function PricingAuthPromptModal({
  isOpen,
  planName,
  onConfirm,
  onClose,
}: PricingAuthPromptModalProps) {
  const t = useTranslations('pricing.authPrompt');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-auth-prompt-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] p-6 shadow-xl text-slate-900 dark:text-[#e3e3e3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-[#a8c7fa]/15 text-blue-600 dark:text-[#a8c7fa] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">lock_person</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('cancelBtn')}
            className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-[#8e918f] dark:hover:text-[#e3e3e3] dark:hover:bg-[#282a2c] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <h3
          id="pricing-auth-prompt-title"
          className="text-lg font-bold text-slate-900 dark:text-[#e3e3e3] mb-2"
        >
          {t('title')}
        </h3>
        <p className="text-sm text-slate-600 dark:text-[#c4c7c5] leading-relaxed mb-6">
          {t('description', { planName })}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#282a2c] dark:hover:bg-[#323639] dark:text-[#e3e3e3] transition-colors cursor-pointer"
          >
            {t('cancelBtn')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#a8c7fa] dark:hover:bg-[#b9d5fb] dark:text-[#00325b] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t('confirmBtn')}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
