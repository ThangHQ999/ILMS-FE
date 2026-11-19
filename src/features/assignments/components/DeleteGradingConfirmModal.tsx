'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

export interface DeleteGradingConfirmModalProps {
  isOpen: boolean;
  studentName: string;
  assignmentTitle: string;
  currentScoreDisplay: string;
  isPending: boolean;
  errorTitle: string | null;
  errorMessage: string | null;
  needsReloadBeforeRetry: boolean;
  isReloadingStatus: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onReloadStatus: () => void;
}

export function DeleteGradingConfirmModal({
  isOpen,
  studentName,
  assignmentTitle,
  currentScoreDisplay,
  isPending,
  errorTitle,
  errorMessage,
  needsReloadBeforeRetry,
  isReloadingStatus,
  onCancel,
  onConfirm,
  onReloadStatus,
}: DeleteGradingConfirmModalProps) {
  const t = useTranslations('assignments.teacher.submissionDetail.cards.grading.deleteModal');
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isOpen, isPending, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      id="delete-grade-modal"
      data-delete-grade-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-grade-modal-title"
        aria-describedby="delete-grade-modal-desc"
        className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
            <span aria-hidden="true" className="material-symbols-outlined text-[22px]">
              delete_forever
            </span>
          </div>
          <div className="space-y-1 min-w-0">
            <h3
              id="delete-grade-modal-title"
              className="text-[18px] font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight"
            >
              {t('title')}
            </h3>
            <p
              id="delete-grade-modal-desc"
              className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed"
            >
              {t('description')}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3.5 space-y-2 text-[12.5px]">
          <div className="flex justify-between items-start gap-3">
            <span className="text-slate-500 dark:text-slate-400 shrink-0">{t('studentLabel')}</span>
            <span
              data-delete-modal-student="true"
              className="font-semibold text-slate-800 dark:text-slate-100 text-right break-words"
            >
              {studentName}
            </span>
          </div>
          <div className="flex justify-between items-start gap-3">
            <span className="text-slate-500 dark:text-slate-400 shrink-0">{t('assignmentLabel')}</span>
            <span
              data-delete-modal-assignment="true"
              className="font-medium text-slate-800 dark:text-slate-200 text-right break-words"
            >
              {assignmentTitle}
            </span>
          </div>
          <div className="flex justify-between items-center gap-3 border-t border-slate-200/60 dark:border-slate-700 pt-2">
            <span className="text-slate-500 dark:text-slate-400 shrink-0">{t('currentScoreLabel')}</span>
            <span
              data-delete-modal-score="true"
              className="font-bold text-[#0059BB] dark:text-blue-400 font-mono text-[13.5px] whitespace-nowrap"
            >
              {currentScoreDisplay}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div
            id="delete-grade-error-banner"
            role="alert"
            className={`p-3 rounded-xl border text-xs space-y-2 ${
              needsReloadBeforeRetry
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] shrink-0">
                {needsReloadBeforeRetry ? 'sync_problem' : 'warning'}
              </span>
              <span>{errorTitle || t('errorTitle')}</span>
            </div>
            <p className="leading-normal">{errorMessage}</p>
            {needsReloadBeforeRetry && (
              <button
                id="btn-delete-reload-status"
                type="button"
                disabled={isReloadingStatus}
                onClick={onReloadStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
              >
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined text-[15px] ${
                    isReloadingStatus ? 'animate-spin' : ''
                  }`}
                >
                  refresh
                </span>
                <span>{t('reloadStatusBtn')}</span>
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            ref={cancelBtnRef}
            id="btn-cancel-delete-modal"
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 font-semibold text-[13.5px] rounded-xl transition-colors whitespace-nowrap"
          >
            {t('cancelButton')}
          </button>
          <button
            id="btn-confirm-delete-grade"
            type="button"
            disabled={isPending || needsReloadBeforeRetry}
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[13.5px] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {isPending ? (
              <>
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[17px] animate-spin shrink-0"
                >
                  progress_activity
                </span>
                <span id="btn-confirm-delete-text">{t('deletingButton')}</span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="material-symbols-outlined text-[17px] shrink-0">
                  delete
                </span>
                <span id="btn-confirm-delete-text">{t('confirmButton')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
