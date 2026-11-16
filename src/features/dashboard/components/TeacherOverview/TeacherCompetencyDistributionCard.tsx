'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function TeacherCompetencyDistributionCard() {
  const t = useTranslations('dashboard.teacher');

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-surface shadow-md3-1 dark:shadow-none border-none flex flex-col gap-6">
      {/* Header with Bloom Tag and Last Updated Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-1">
        <div>
          {/* Overline text: sentence case, subtle muted color, anti-template */}
          <span className="text-sm text-[#444746] dark:text-[#C4C7C5] font-medium">
            {t('competencyDistTag')}
          </span>

          {/* Main Title: modern MD3 heading, enlarged */}
          <h2 className="text-2xl font-medium text-[#1F1F1F] dark:text-[#E3E3E3] mt-2 mb-6 tracking-tight">
            {t('competencyDistTitle')}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium self-start sm:self-auto mt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#137333] dark:bg-[#81C995] animate-pulse" />
          <span>{t('updatedHoursAgo', { hours: 2 })}</span>
        </div>
      </div>

      {/* Segmented Bloom Distribution Bar */}
      <div className="flex flex-col gap-6">
        <div className="w-full h-8 rounded-full overflow-hidden flex bg-surface-variant p-1 border-none">
          {/* Level 1: Mastery 45% */}
          <div
            className="h-full rounded-full bg-success-container text-on-success-container flex items-center justify-center text-xs sm:text-sm font-bold font-mono transition-all duration-500"
            style={{ width: '45%' }}
            title="Thấu suốt (Mastery): 45%"
          >
            45%
          </div>

          {/* Level 2: Proficient 35% */}
          <div
            className="h-full rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs sm:text-sm font-bold font-mono transition-all duration-500 mx-1"
            style={{ width: '35%' }}
            title="Đang hoàn thiện (Proficient): 35%"
          >
            35%
          </div>

          {/* Level 3: Needs Help 20% */}
          <div
            className="h-full rounded-full bg-warning-container text-on-warning-container flex items-center justify-center text-xs sm:text-sm font-bold font-mono transition-all duration-500"
            style={{ width: '20%' }}
            title="Cần củng cố (Needs Help): 20%"
          >
            20%
          </div>
        </div>

        {/* 3 Detailed Cohort Metric Breakdown Cards with subtle borders and clear typography */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Thấu suốt */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] hover:border-[#C5C6CD] dark:hover:border-[#3C4043] transition-all flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-bold text-foreground">
                {t('mastery')}
              </span>
              <span className="w-3 h-3 rounded-full bg-[#137333] dark:bg-[#81C995]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-foreground">19</span>
              <span className="text-sm text-muted-foreground font-medium">sinh viên (45%)</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              {t('masteryDesc')}
            </p>
          </div>

          {/* Card 2: Đang hoàn thiện */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] hover:border-[#C5C6CD] dark:hover:border-[#3C4043] transition-all flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-bold text-foreground">
                {t('proficient')}
              </span>
              <span className="w-3 h-3 rounded-full bg-[#0B57D0] dark:text-[#A8C7FA]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-foreground">15</span>
              <span className="text-sm text-muted-foreground font-medium">sinh viên (35%)</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              {t('proficientDesc')}
            </p>
          </div>

          {/* Card 3: Cần củng cố */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] hover:border-[#C5C6CD] dark:hover:border-[#3C4043] transition-all flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-bold text-foreground">
                {t('needsHelp')}
              </span>
              <span className="w-3 h-3 rounded-full bg-[#B06000] dark:bg-[#FFB784]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-foreground">08</span>
              <span className="text-sm text-muted-foreground font-medium">sinh viên (20%)</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              {t('needsHelpDesc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
