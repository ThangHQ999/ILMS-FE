'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ZenHeaderBanner } from './ZenHeaderBanner';
import { HeroLearningCard } from './HeroLearningCard';
import { AITaskChecklist } from './AITaskChecklist';
import { AITaskItem } from '../../types';

interface FocusViewProps {
  userFullName?: string;
  aiTasks: AITaskItem[];
}

export function FocusView({ userFullName = '', aiTasks }: FocusViewProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <div className="flex flex-col gap-6 items-start">
        {/* CỘT CHÍNH */}
        <section className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          {/* Zen Header Status Banner */}
          <ZenHeaderBanner />

          {/* Heading & Slogan */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight">
              {t('zenTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-[#747775] dark:text-[#C4C7C5] max-w-2xl leading-relaxed">
              {t('zenSubtitle')}
            </p>
          </div>

          {/* Hero Learning Card */}
          <HeroLearningCard />

          {/* Checklist Nhiệm vụ do AI đề xuất hôm nay */}
          <AITaskChecklist initialTasks={aiTasks} />
        </section>
      </div>
    </div>
  );
}
