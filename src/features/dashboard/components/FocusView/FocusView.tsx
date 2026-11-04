'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ZenHeaderBanner } from './ZenHeaderBanner';
import { HeroLearningCard } from './HeroLearningCard';
import { AITaskChecklist } from './AITaskChecklist';
import { SocraticAICoach } from './SocraticAICoach';
import { AITaskItem } from '../../types';

interface FocusViewProps {
  userFullName?: string;
  aiTasks: AITaskItem[];
}

export function FocusView({ userFullName = 'Nhật Minh', aiTasks }: FocusViewProps) {
  const t = useTranslations('dashboard');
  // AI Coach Column width (default 380px, resizable up to 40% of window width)
  const [aiWidth, setAiWidth] = useState(380);
  const [isAiMinimized, setIsAiMinimized] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* CỘT CHÍNH (Chiếm toàn bộ không gian còn lại, co giãn mượt mà khi AI Coach resize) */}
        <section className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          {/* Zen Header Status Banner */}
          <ZenHeaderBanner />

          {/* Heading & Slogan */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('zenTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t('zenSubtitle')}
            </p>
          </div>

          {/* Hero Learning Card */}
          <HeroLearningCard />

          {/* Checklist Nhiệm vụ do AI đề xuất hôm nay */}
          <AITaskChecklist initialTasks={aiTasks} />
        </section>

        {/* CỘT PHỤ (Socratic AI Coach - Resizable up to 40% window width) */}
        <SocraticAICoach
          userFullName={userFullName}
          width={aiWidth}
          onWidthChange={setAiWidth}
          isMinimized={isAiMinimized}
          onToggleMinimize={() => setIsAiMinimized((prev) => !prev)}
        />
      </div>
    </div>
  );
}
