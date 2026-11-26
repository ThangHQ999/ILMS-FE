'use client';

import React, { useEffect, useCallback } from 'react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Keyboard navigation: Escape to cancel, Enter to confirm
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || isLoading) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    },
    [isOpen, isLoading, onCancel, onConfirm]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const iconName = isDanger ? 'delete_forever' : isWarning ? 'warning' : 'help_outline';

  const iconContainerClass = isDanger
    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
    : isWarning
      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50';

  const confirmBtnClass = isDanger
    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs'
    : isWarning
      ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs'
      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={isLoading ? undefined : onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#1E1F20] text-slate-900 dark:text-slate-100 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-[#3C4043] animate-in zoom-in-95 duration-150 space-y-5 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Google Material 3 Tonal Icon */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${iconContainerClass}`}
          >
            <span className="material-symbols-outlined text-[26px]">{iconName}</span>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0 pt-0.5">
            <h3
              id="confirm-dialog-title"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug"
            >
              {title || (isDanger ? 'Xác nhận xóa' : isWarning ? 'Cảnh báo' : 'Xác nhận')}
            </h3>

            <div
              id="confirm-dialog-message"
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words"
            >
              {message}
            </div>
          </div>
        </div>

        {/* Action Buttons: Google M3 Pill Style */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold active:scale-98 transition-all cursor-pointer disabled:opacity-50 ${confirmBtnClass}`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
