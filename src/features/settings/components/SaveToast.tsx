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
      className="fixed bottom-6 right-8 z-50 flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
        <span className="material-symbols-outlined text-[20px]">check_circle</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {t('toastAutoSaved')}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {t('toastSyncCloud')}
        </span>
      </div>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        type="button"
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
