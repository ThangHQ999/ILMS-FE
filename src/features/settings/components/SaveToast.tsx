'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface SaveToastProps {
  show: boolean;
  onClose: () => void;
}

export function SaveToast({ show, onClose }: SaveToastProps) {
  const t = useTranslations('settings');

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-8 z-50 flex items-center gap-3 bg-white dark:bg-[#1E1F20] border-none px-5 py-3 rounded-full shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="w-8 h-8 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[20px]">check_circle</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
          {t('toastAutoSaved')}
        </span>
        <span className="text-[11px] text-[#747775] dark:text-[#8E918F] font-mono">
          {t('toastSyncCloud')}
        </span>
      </div>
      <button
        onClick={onClose}
        className="ml-2 text-[#747775] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] p-1 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors border-none cursor-pointer"
        type="button"
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
