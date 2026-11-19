'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BatchGradeResult } from '../schemas/assignment.schema';

export interface BulkGradeTargetItem {
  id: string;
  studentName: string;
  studentCode?: string | null;
}

export interface TeacherBulkGradeModalProps {
  isOpen: boolean;
  items: BulkGradeTargetItem[];
  maxScore: number;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (
    grades: Array<{ submissionId: string; score: number; feedback?: string }>
  ) => Promise<BatchGradeResult>;
  onSuccessIds: (ids: string[]) => void;
}

const STRICT_NUMBER_REGEX = /^\d+(?:[.,]\d+)?$/;

export function validateBatchGradeScore(
  rawScore: string,
  maxAllowedScore: number
):
  | { valid: true; numericValue: number }
  | { valid: false; errorCode: 'required' | 'invalid' | 'range' | 'decimals' } {
  const trimmed = rawScore.trim();
  if (trimmed === '') {
    return { valid: false, errorCode: 'required' };
  }
  if (!STRICT_NUMBER_REGEX.test(trimmed)) {
    return { valid: false, errorCode: 'invalid' };
  }
  const normalized = trimmed.replace(',', '.');
  const parts = normalized.split('.');
  if (parts.length > 1) {
    const significantDecimals = parts[1].replace(/0+$/, '');
    if (significantDecimals.length > 2) {
      return { valid: false, errorCode: 'decimals' };
    }
  }
  const num = Number(normalized);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, errorCode: 'invalid' };
  }
  const effectiveMax = Math.min(maxAllowedScore, 100);
  if (num < 0 || num > effectiveMax) {
    return { valid: false, errorCode: 'range' };
  }
  return { valid: true, numericValue: num };
}

function isUncertainBatchError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as {
    code?: string;
    httpStatus?: number;
    status?: number;
    response?: { status?: number };
    message?: string;
  };
  const status = e.httpStatus || e.response?.status || e.status || 0;
  const code = (e.code || '').toUpperCase();
  const msg = (e.message || '').toLowerCase();
  return (
    code === 'SCHEMA_ERROR' ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ERR_NETWORK' ||
    status === 0 ||
    status === 408 ||
    status === 504 ||
    msg.includes('network error') ||
    msg.includes('timeout')
  );
}

export function TeacherBulkGradeModal({
  isOpen,
  items,
  maxScore,
  isPending,
  onClose,
  onSubmit,
  onSuccessIds,
}: TeacherBulkGradeModalProps) {
  const t = useTranslations('assignments.teacher.submissions.modal');
  const effectiveMaxScore = Math.min(Math.max(maxScore, 0), 100);

  const [entries, setEntries] = useState<
    Record<string, { score: string; feedback: string; touched: boolean }>
  >({});
  const [succeededIds, setSucceededIds] = useState<string[]>([]);
  const [failedReasons, setFailedReasons] = useState<Record<string, string>>({});
  const [resultBanner, setResultBanner] = useState<{
    kind: 'success' | 'partial' | 'error';
    message: string;
  } | null>(null);

  const isSubmittingRef = useRef(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize fresh blank entries whenever modal opens (never prefill sample score/feedback)
  useEffect(() => {
    if (!isOpen) return;
    const initial: Record<string, { score: string; feedback: string; touched: boolean }> = {};
    items.forEach((item) => {
      initial[item.id] = { score: '', feedback: '', touched: false };
    });
    setEntries(initial);
    setSucceededIds([]);
    setFailedReasons({});
    setResultBanner(null);
    isSubmittingRef.current = false;

    const frameId = requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, items]);

  // Escape key to close modal when not submitting
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending && !isSubmittingRef.current) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const remainingItems = items.filter((item) => !succeededIds.includes(item.id));

  const getRowValidationMessage = (id: string): string | null => {
    const entry = entries[id];
    if (!entry) return t('scoreRequiredError');
    const check = validateBatchGradeScore(entry.score, effectiveMaxScore);
    if (check.valid) return null;
    if (check.errorCode === 'required') return t('scoreRequiredError');
    if (check.errorCode === 'range') return t('scoreRangeError', { maxScore: effectiveMaxScore });
    if (check.errorCode === 'decimals') return t('scoreDecimalsError');
    return t('scoreInvalidError');
  };

  const isFormValid =
    remainingItems.length > 0 &&
    remainingItems.every((item) => {
      const entry = entries[item.id];
      return entry ? validateBatchGradeScore(entry.score, effectiveMaxScore).valid : false;
    });

  const handleScoreChange = (id: string, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { score: '', feedback: '', touched: false }), score: value, touched: true },
    }));
    if (failedReasons[id]) {
      setFailedReasons((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleFeedbackChange = (id: string, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { score: '', feedback: '', touched: false }), feedback: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || isSubmittingRef.current || remainingItems.length === 0) return;

    // Mark all remaining rows touched so inline errors show if invalid
    setEntries((prev) => {
      const next = { ...prev };
      remainingItems.forEach((item) => {
        next[item.id] = {
          ...(next[item.id] || { score: '', feedback: '', touched: true }),
          touched: true,
        };
      });
      return next;
    });

    const payloadGrades: Array<{ submissionId: string; score: number; feedback?: string }> = [];
    for (const item of remainingItems) {
      const entry = entries[item.id];
      const check = validateBatchGradeScore(entry?.score ?? '', effectiveMaxScore);
      if (!check.valid) return;
      const trimmedFeedback = entry?.feedback.trim() || '';
      payloadGrades.push({
        submissionId: item.id,
        score: check.numericValue,
        ...(trimmedFeedback ? { feedback: trimmedFeedback } : {}),
      });
    }

    setResultBanner(null);
    isSubmittingRef.current = true;

    try {
      const result = await onSubmit(payloadGrades);

      if (result.successIds.length > 0) {
        setSucceededIds((prev) => Array.from(new Set([...prev, ...result.successIds])));
        onSuccessIds(result.successIds);
      }

      if (result.failedCount > 0 || result.failedItems.length > 0) {
        const nextReasons: Record<string, string> = {};
        result.failedItems.forEach((fi) => {
          nextReasons[fi.id] = fi.reason || t('errorSummary');
        });
        setFailedReasons(nextReasons);
        setResultBanner({
          kind: 'partial',
          message: t('partialSummary', {
            successCount: result.successCount,
            totalRequested: result.totalRequested,
            failedCount: result.failedCount,
          }),
        });
      } else if (result.successCount === result.totalRequested && result.totalRequested > 0) {
        setFailedReasons({});
        setResultBanner({
          kind: 'success',
          message: t('fullSuccessSummary', {
            successCount: result.successCount,
            totalRequested: result.totalRequested,
          }),
        });
      } else {
        setResultBanner({
          kind: 'error',
          message: t('uncertainError'),
        });
      }
    } catch (err: unknown) {
      setResultBanner({
        kind: 'error',
        message: isUncertainBatchError(err) ? t('uncertainError') : t('errorSummary'),
      });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const hasPartialFailures = remainingItems.length > 0 && succeededIds.length > 0;
  const allCompleted = remainingItems.length === 0 && succeededIds.length > 0;

  return (
    <div
      id="bulk-grading-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-grade-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border-2 border-[#D9E2E8] dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D9E2E8] dark:border-slate-800 flex items-center justify-between bg-[#F0F4F8] dark:bg-slate-800/70">
          <div className="flex items-center gap-2 min-w-0">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 text-xl shrink-0"
            >
              edit_note
            </span>
            <h3
              id="bulk-grade-modal-title"
              className="font-display font-bold text-lg text-[#171C1F] dark:text-slate-100 truncate"
            >
              {t('title')}
            </h3>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            aria-label={t('closeBtn')}
            className="p-1.5 rounded-lg text-[#44474D] dark:text-slate-400 hover:text-[#171C1F] dark:hover:text-slate-100 hover:bg-[#E7ECF0] dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-lg block">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-[#44474D] dark:text-slate-400 leading-relaxed">
            {t('instructionDynamic', { maxScore: effectiveMaxScore })}
          </p>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const entry = entries[item.id] || { score: '', feedback: '', touched: false };
              const isRowSucceeded = succeededIds.includes(item.id);
              const validationMsg = !isRowSucceeded && entry.touched ? getRowValidationMessage(item.id) : null;
              const serverReason = !isRowSucceeded ? failedReasons[item.id] : undefined;
              const rowError = serverReason || validationMsg;
              const scoreInputId = `bulk-score-${item.id}`;
              const feedbackInputId = `bulk-feedback-${item.id}`;
              const errorId = `bulk-error-${item.id}`;

              return (
                <div
                  key={item.id}
                  data-bulk-row-id={item.id}
                  data-bulk-row-state={
                    isRowSucceeded ? 'succeeded' : serverReason ? 'failed' : 'pending'
                  }
                  className={`p-3.5 rounded-xl border-2 space-y-2 transition-colors ${
                    isRowSucceeded
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : serverReason
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
                        : 'border-[#D9E2E8] dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#171C1F] dark:text-slate-100 text-xs truncate">
                        {item.studentName}
                      </span>
                      {item.studentCode ? (
                        <span
                          title={item.studentCode}
                          className="text-[11px] text-[#44474D] dark:text-slate-400 font-mono truncate max-w-[200px]"
                        >
                          ({item.studentCode})
                        </span>
                      ) : null}
                    </div>
                    {isRowSucceeded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {t('rowSucceeded')}
                      </span>
                    ) : (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium shrink-0">
                        {t('scoreRequired')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-4">
                      <label htmlFor={scoreInputId} className="sr-only">
                        {t('scoreLabel', { name: item.studentName })}
                      </label>
                      <div className="relative">
                        <input
                          ref={idx === 0 ? firstInputRef : undefined}
                          id={scoreInputId}
                          type="text"
                          inputMode="decimal"
                          value={entry.score}
                          disabled={isRowSucceeded || isPending}
                          onChange={(e) => handleScoreChange(item.id, e.target.value)}
                          onBlur={() =>
                            setEntries((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...(prev[item.id] || { score: '', feedback: '', touched: true }),
                                touched: true,
                              },
                            }))
                          }
                          aria-invalid={Boolean(rowError)}
                          aria-describedby={rowError ? errorId : undefined}
                          placeholder={t('scorePlaceholder', { maxScore: effectiveMaxScore })}
                          className={`w-full px-3 py-1.5 text-xs rounded-lg border-2 focus:outline-none focus:ring-1 pr-12 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-white dark:bg-slate-950 text-[#171C1F] dark:text-slate-100 ${
                            rowError
                              ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-500 focus:border-rose-500'
                              : 'border-[#D9E2E8] dark:border-slate-700 focus:ring-[#0059BB] focus:border-[#0059BB]'
                          }`}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#44474D] dark:text-slate-400 font-medium pointer-events-none">
                          / {effectiveMaxScore}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-8">
                      <label htmlFor={feedbackInputId} className="sr-only">
                        {t('feedbackLabel', { name: item.studentName })}
                      </label>
                      <input
                        id={feedbackInputId}
                        type="text"
                        value={entry.feedback}
                        disabled={isRowSucceeded || isPending}
                        onChange={(e) => handleFeedbackChange(item.id, e.target.value)}
                        placeholder={t('feedbackPlaceholder')}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border-2 border-[#D9E2E8] dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0059BB] focus:border-[#0059BB] bg-white dark:bg-slate-950 text-[#171C1F] dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {rowError && (
                    <p
                      id={errorId}
                      role="alert"
                      data-bulk-row-error={item.id}
                      className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px] shrink-0">error</span>
                      <span className="break-words">{rowError}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {resultBanner && (
            <div
              role={resultBanner.kind === 'error' ? 'alert' : 'status'}
              data-bulk-result-banner={resultBanner.kind}
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                resultBanner.kind === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : resultBanner.kind === 'partial'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                {resultBanner.kind === 'success'
                  ? 'check_circle'
                  : resultBanner.kind === 'partial'
                    ? 'warning'
                    : 'error'}
              </span>
              <span className="font-medium leading-relaxed">{resultBanner.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D9E2E8] dark:border-slate-800 bg-[#F0F4F8] dark:bg-slate-800/70 flex items-center justify-end gap-3">
          <button
            type="button"
            id="btn-cancel-bulk-grade"
            disabled={isPending}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#44474D] dark:text-slate-300 hover:text-[#171C1F] dark:hover:text-white rounded-lg border-2 border-[#D9E2E8] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
          >
            {allCompleted ? t('closeBtn') : t('cancel')}
          </button>

          {!allCompleted && (
            <button
              type="submit"
              id="btn-save-bulk-grades"
              disabled={!isFormValid || isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0059BB] hover:bg-[#004493] rounded-lg shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1.5"
            >
              {isPending && (
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[15px] animate-spin motion-reduce:animate-none"
                >
                  progress_activity
                </span>
              )}
              <span>
                {isPending
                  ? t('saving')
                  : hasPartialFailures
                    ? t('retryFailedBtn', { count: remainingItems.length })
                    : t('save')}
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
