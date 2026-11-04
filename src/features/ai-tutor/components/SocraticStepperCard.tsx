'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SocraticProgressState } from '../types';

interface SocraticStepperCardProps {
  progress: SocraticProgressState;
}

export function SocraticStepperCard({ progress }: SocraticStepperCardProps) {
  const t = useTranslations('aiTutor');
  const current = progress.currentStepNumber;
  const total = progress.totalSteps;
  if (!progress.stepId || !progress.exerciseId || !total || current < 1 || current > total) return null;

  return (
    <div className="mx-auto max-w-3xl mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50/90 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900/40 border border-blue-200/80 dark:border-blue-900/50 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <span className="material-symbols-outlined text-[17px]">alt_route</span>
          </span>
          <div>
            <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
              {t('stepperTitle')}
            </h4>
            {progress.activeCanonicalCode && (
              <span className="text-[11px] font-mono text-blue-600 dark:text-cyan-400">
                {progress.activeCanonicalCode}
              </span>
            )}
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
            progress.isCompleted
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-300'
          }`}
        >
          {progress.isCompleted
            ? t('stepperCompleted')
            : t('stepperStepFraction', { current, total })}
        </span>
      </div>

      {/* Thanh tiến trình phân đoạn */}
      <div className="flex gap-1.5 my-2.5">
        {Array.from({ length: total }).map((_, idx) => {
          const stepIndex = idx + 1;
          const isDone = stepIndex < current || progress.isCompleted;
          const isCurrent = stepIndex === current && !progress.isCompleted;

          return (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                isDone
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : isCurrent
                  ? 'bg-blue-600 dark:bg-cyan-400 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          );
        })}
      </div>

      {/* Hành động hiện tại */}
      {progress.currentStepAction && (
        <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5">
            arrow_right_alt
          </span>
          <span className="font-medium">{progress.currentStepAction}</span>
        </div>
      )}
    </div>
  );
}
