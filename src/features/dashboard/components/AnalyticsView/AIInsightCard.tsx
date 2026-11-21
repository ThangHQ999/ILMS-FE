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
    <div className="lg:col-span-4 bg-white dark:bg-[#1E1F20] rounded-3xl p-7 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between h-full gap-6 font-sans">
      {/* 1. Top Zone (Header & Topic) */}
      <div className="flex flex-col">
        {/* Header: Title + Accuracy Pill */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#0B57D0] dark:text-[#A8C7FA]">
              track_changes
            </span>
            <h2 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {t('aiInsightsTitle')}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] whitespace-nowrap border-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#041E49] dark:bg-[#A8C7FA] animate-pulse" />
            {t('accuracy', { percent: insight.accuracyPercent })}
          </span>
        </div>

        {/* Warning Tonal Pill */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] text-xs font-medium w-fit whitespace-nowrap border-none">
            <span className="material-symbols-outlined text-[15px]">warning</span>
            <span>{t('needReinforce')}</span>
          </span>
        </div>

        {/* Topic Title */}
        <h3 className="text-xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3] leading-snug mb-2">
          Quy hoạch động (Knapsack &amp; Bitmask)
        </h3>

        {/* Description */}
        <p className="text-sm text-[#444746] dark:text-[#C4C7C5] leading-relaxed">
          {t('topicStruggleDesc')}
        </p>
      </div>

      {/* 2. Middle Zone (Unified Bar) */}
      <div className="bg-[#F0F4F9] dark:bg-[#282A2C] rounded-2xl p-4 text-sm text-[#444746] dark:text-[#C4C7C5] flex flex-wrap items-center gap-x-3 gap-y-2 border-none">
        <span className="inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
            schedule
          </span>
          <span>{insight.durationMinutes} phút</span>
        </span>
        <span className="text-slate-300 dark:text-[#8E918F] select-none">•</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#B06000] dark:text-[#FFB784]">
            bar_chart
          </span>
          <span>{insight.difficultyText}</span>
        </span>
        <span className="text-slate-300 dark:text-[#8E918F] select-none">•</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
            quiz
          </span>
          <span>{insight.questionCount} câu</span>
        </span>
        <span className="text-slate-300 dark:text-[#8E918F] select-none">•</span>
        <span className="inline-flex items-center gap-1.5 text-[#0B57D0] dark:text-[#A8C7FA] font-semibold">
          <span className="material-symbols-outlined text-[16px] text-[#B06000] dark:text-[#FFB784]">
            stars
          </span>
          <span>+{insight.xpReward} XP</span>
        </span>
      </div>

      {/* 3. Bottom Zone (Impact & CTA Action) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0D652D] dark:text-[#81C995]">
          <span className="material-symbols-outlined text-[18px]">trending_up</span>
          <span>{t('recoverPlo', { percent: insight.ploRecoveryPercent })}</span>
        </div>

        <button
          className="bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] rounded-full px-6 py-2.5 font-medium transition-colors text-sm inline-flex items-center justify-center gap-2 cursor-pointer group shrink-0 whitespace-nowrap border-none shadow-none"
          type="button"
        >
          <span>{t('startTestNow')}</span>
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}
