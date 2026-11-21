'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  getPipelineStepIndex,
  isCompletedIngestionJobStatus,
  type IngestionJobStatus,
} from '../../schemas/ingestion.schema';

interface PipelineStepperProps {
  status: IngestionJobStatus;
  stage?: string | null;
  errorCode?: string | null;
}

const STEP_KEYS = [
  { key: 'queued', labelKey: 'queued', subKey: 'queuedSub', icon: 'schedule' },
  { key: 'ai_draft', labelKey: 'aiDraft', subKey: 'aiDraftSub', icon: 'psychology' },
  { key: 'draft_ready', labelKey: 'draftReady', subKey: 'draftReadySub', icon: 'schema' },
  { key: 'review', labelKey: 'review', subKey: 'reviewSub', icon: 'fact_check' },
  { key: 'publish', labelKey: 'publish', subKey: 'publishSub', icon: 'rocket_launch' },
] as const;

export function PipelineStepper({ status, stage, errorCode }: PipelineStepperProps) {
  const t = useTranslations('materialsHub.steps');
  const activeIdx = getPipelineStepIndex(status, stage);
  const isCompleted = isCompletedIngestionJobStatus(status);
  const isFailed = status === 'FAILED';
  const isAwaiting = status === 'AWAITING_REVIEW';
  const isPublishing = status === 'PUBLISHING';

  return (
    <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t('header')}
        </span>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {stage || status}
          {errorCode ? ` · ${errorCode}` : ''}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {STEP_KEYS.map((step, index) => {
          const isDone = isCompleted || index < activeIdx;
          const isCurrent = !isCompleted && index === activeIdx;

          let circleClass =
            'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400';
          let textClass = 'text-slate-400 dark:text-slate-500';

          if (isDone) {
            circleClass =
              'bg-emerald-500 border-emerald-500 text-white shadow-xs shadow-emerald-500/20';
            textClass = 'text-emerald-700 dark:text-emerald-400';
          } else if (isCurrent && isFailed) {
            circleClass = 'bg-rose-500 border-rose-500 text-white';
            textClass = 'text-rose-600 dark:text-rose-400';
          } else if (isCurrent && isAwaiting) {
            circleClass =
              'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-500/20';
            textClass = 'text-amber-700 dark:text-amber-300';
          } else if (isCurrent) {
            circleClass =
              'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-500/20';
            textClass = 'text-blue-700 dark:text-blue-300';
          }

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${circleClass}`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isCurrent && !isAwaiting && !isFailed && (status === 'PROCESSING' || isPublishing)
                      ? 'animate-spin'
                      : ''
                  }`}
                >
                  {isDone
                    ? 'check'
                    : isCurrent && isFailed
                      ? 'close'
                      : isCurrent && (status === 'PROCESSING' || isPublishing)
                        ? 'sync'
                        : step.icon}
                </span>
              </div>
              <span className={`text-[11px] font-bold mt-1.5 leading-tight ${textClass}`}>
                {t(step.labelKey)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block leading-tight">
                {t(step.subKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
