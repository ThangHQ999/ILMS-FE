'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { AiRecommendation } from '../types';

interface SocraticAiMentorPanelProps {
  recommendation?: AiRecommendation;
  onTakeAdaptiveQuiz?: () => void;
}

export function SocraticAiMentorPanel({
  recommendation,
  onTakeAdaptiveQuiz,
}: SocraticAiMentorPanelProps) {
  const t = useTranslations('assignments');

  if (!recommendation) return null;

  return (
    <div className="w-full bg-gradient-to-br from-indigo-50/70 via-card to-blue-50/50 dark:from-indigo-950/30 dark:via-card dark:to-blue-950/20 rounded-2xl p-5 sm:p-6 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50 relative overflow-hidden">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[20px] text-indigo-600 dark:text-indigo-400 animate-pulse">
            psychology
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            {t('panels.socraticTitle')}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold tracking-wide">
          {t('panels.realtimeAi')}
        </span>
      </div>

      <h4 className="text-base font-bold text-foreground mt-1">
        {t('panels.weaknessTopicTitle')}
      </h4>

      {/* Suggestion Card */}
      <div className="mt-3 p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {recommendation.reason}
        </p>
        <div className="mt-2.5 p-2 rounded-lg bg-muted text-xs font-semibold text-secondary flex items-center gap-2">
          <span className="material-symbols-outlined text-[17px] text-secondary shrink-0">
            alt_route
          </span>
          <span className="leading-snug">{recommendation.topic}</span>
        </div>
      </div>

      {/* Adaptive practice CTA button */}
      <button
        type="button"
        onClick={onTakeAdaptiveQuiz}
        className="w-full mt-4 py-2.5 px-4 rounded-xl bg-secondary text-secondary-foreground text-xs sm:text-sm font-bold hover:bg-secondary/90 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">bolt</span>
        <span>{recommendation.actionLabel}</span>
      </button>
    </div>
  );
}

