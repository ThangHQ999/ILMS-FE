'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AIInsight } from '../../types';

interface AIInsightCardProps {
  insight: AIInsight;
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="lg:col-span-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white dark:from-slate-900/90 dark:via-blue-950/20 dark:to-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-blue-100/60 dark:border-blue-900/30">
      <div>
        {/* AI Badge & Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('aiInsightsTitle')}</h2>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/15 text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            {t('accuracy', { percent: insight.accuracyPercent })}
          </span>
        </div>

        <div className="inline-block px-2.5 py-1 rounded-lg bg-red-100/80 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold mb-3">
          {insight.gapDetectedTitle}
        </div>

        {/* Warning Narrative */}
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-3">
          {t('aiInsightDetected')}{' '}
          <strong className="text-slate-900 dark:text-slate-100 font-semibold underline decoration-red-400 decoration-2">
            Quy hoạch động (Dynamic Programming - Knapsack &amp; Bitmask)
          </strong>
          .
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          {insight.subNarrative}
        </p>

        {/* Test Summary Card */}
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-3.5 space-y-2 mb-6 shadow-sm border border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                pace
              </span>
              {t('duration', { minutes: insight.durationMinutes })}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                quiz
              </span>
              {t('questions', { count: insight.questionCount })}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-amber-500">
                network_intelligence
              </span>
              {t('difficulty', { difficulty: insight.difficultyText })}
            </span>
            <span className="flex items-center gap-1 font-semibold text-secondary">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              +{insight.xpReward} XP
            </span>
          </div>

          <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 border-t border-slate-100 dark:border-slate-700/60">
            <span className="material-symbols-outlined text-[14px]">upgrade</span>
            {t('recoverPlo', { percent: insight.ploRecoveryPercent })}
          </div>
        </div>
      </div>

      {/* Main CTA Button */}
      <button
        className="w-full py-3 px-4 rounded-xl bg-secondary hover:opacity-90 text-white font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group text-sm"
        type="button"
      >
        <span>{t('startTestNow')}</span>
        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </button>
    </div>
  );
}
