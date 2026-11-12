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
    <div className="mx-auto max-w-3xl mb-6 p-4 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] whitespace-nowrap border-none">
            <span className="material-symbols-outlined text-[17px]">alt_route</span>
          </span>
          <div>
            <h4 className="text-[13px] font-semibold text-slate-900 dark:text-[#E3E3E3]">
              {t('stepperTitle')}
            </h4>
            {progress.activeCanonicalCode && (
              <span className="text-[11px] font-mono text-[#0B57D0] dark:text-[#A8C7FA]">
                {progress.activeCanonicalCode}
              </span>
            )}
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[11px] font-medium border-none ${
            progress.isCompleted
              ? 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]'
              : 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
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
                  ? 'bg-[#0D652D] dark:bg-[#81C995]'
                  : isCurrent
                  ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse'
                  : 'bg-[#F0F4F9] dark:bg-[#282A2C]'
              }`}
            />
          );
        })}
      </div>

      {/* Hành động hiện tại */}
      {progress.currentStepAction && (
        <div className="mt-2 text-xs text-slate-700 dark:text-[#C4C7C5] flex items-start gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA] shrink-0 mt-0.5">
            arrow_right_alt
          </span>
          <span className="font-medium">{progress.currentStepAction}</span>
        </div>
      )}
    </div>
  );
}
