'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface AiTutorInputBannersProps {
  isListening: boolean;
  errorMessage: string | null;
  onStopListening: () => void;
  onClearError: () => void;
}

export function AiTutorInputBanners({
  isListening,
  errorMessage,
  onStopListening,
  onClearError,
}: AiTutorInputBannersProps) {
  const t = useTranslations('aiTutor');

  return (
    <>
      {/* Banner trạng thái đang nghe Voice */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-xl bg-red-50 dark:bg-[#3C1919] border border-red-200/80 dark:border-red-900/50 text-red-600 dark:text-[#F28B82] text-xs shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="font-medium truncate">{t('voiceListening')}</span>
          <button
            type="button"
            onClick={onStopListening}
            className="ml-auto shrink-0 font-semibold text-[11px] px-2 py-0.5 rounded bg-red-100 dark:bg-[#3C1919] hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            Dừng lại
          </button>
        </div>
      )}

      {/* Thông báo lỗi micro */}
      {errorMessage && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-xl bg-amber-50 dark:bg-[#3C2A1E] border border-amber-200/80 dark:border-amber-900/50 text-amber-700 dark:text-[#FFB784] text-xs shadow-sm">
          <span className="material-symbols-outlined text-[16px] shrink-0 text-amber-500">warning</span>
          <span className="truncate">{errorMessage}</span>
          <button
            type="button"
            onClick={onClearError}
            className="ml-auto shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
