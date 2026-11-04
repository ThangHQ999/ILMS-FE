'use client';

import React, { useState } from 'react';
import { FocusGoal } from '../../types';
import {
  mockTheoryKnapsack,
  mockDiagnosticQuiz,
} from '../../services/competency.service';
import { FocusZenHeader } from './FocusZenHeader';
import { FocusHeroQuestCard } from './FocusHeroQuestCard';
import { FocusTheoryModal } from './FocusTheoryModal';
import { FocusQuizModal } from './FocusQuizModal';
import { SocraticAICoach } from '@/features/dashboard';

interface CompetencyFocusViewProps {
  userFullName?: string;
  goals: FocusGoal[];
  onExitFocus: () => void;
}

export function CompetencyFocusView({
  userFullName = 'Trần Nhật Minh',
  goals,
  onExitFocus,
}: CompetencyFocusViewProps) {
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(goals[0]?.currentScore || 45);

  // Modals state
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Toast state
  const [toastText, setToastText] = useState<string | null>(null);

  // Socratic AI Coach state (resizable width and minimized toggle)
  const [aiWidth, setAiWidth] = useState(380);
  const [isAiMinimized, setIsAiMinimized] = useState(true);

  const currentGoal = goals[currentGoalIndex] || goals[0];

  const handleCycleGoal = () => {
    const nextIdx = (currentGoalIndex + 1) % goals.length;
    setCurrentGoalIndex(nextIdx);
    setCurrentScore(goals[nextIdx].currentScore);
  };

  const handleSelectGoal = (index: number) => {
    setCurrentGoalIndex(index);
    setCurrentScore(goals[index].currentScore);
  };

  const handleFinishQuiz = () => {
    // Boost currentScore to 60%
    setCurrentScore(60);

    // Show celebratory toast
    setToastText('Tuyệt vời! Bạn vừa kéo thanh năng lực Quy hoạch động từ 45% lên 60% (+15%) 🔥');
    setTimeout(() => {
      setToastText(null);
    }, 3500);

    // Open AI Coach to congratulate
    setIsAiMinimized(false);
  };

  const handleTriggerSocraticHint = () => {
    // Open Socratic AI Coach dock to support user on bottleneck
    setIsAiMinimized(false);
  };

  return (
    <div className="bg-[#f0f4f8] dark:bg-[#080c14] text-[#171c1f] dark:text-slate-100 min-h-screen flex flex-col justify-between selection:bg-blue-500/20 selection:text-blue-700 relative overflow-x-hidden font-sans">
      {/* Background Subtle Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[300px] bg-indigo-100/50 dark:bg-indigo-950/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Minimal Zen Header */}
      <FocusZenHeader
        goals={goals}
        currentGoalIndex={currentGoalIndex}
        onSelectGoal={handleSelectGoal}
        onExitFocus={onExitFocus}
      />

      {/* Main Focus Content Body */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
        <FocusHeroQuestCard
          goal={currentGoal}
          allGoals={goals}
          currentScore={currentScore}
          onCycleGoal={handleCycleGoal}
          onSelectGoal={handleSelectGoal}
          onOpenTheory={() => setIsTheoryOpen(true)}
          onOpenQuiz={() => setIsQuizOpen(true)}
        />
      </main>

      {/* Modals */}
      <FocusTheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
        onProceedToQuiz={() => {
          setIsTheoryOpen(false);
          setIsQuizOpen(true);
        }}
        data={mockTheoryKnapsack}
      />

      <FocusQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onFinishQuiz={handleFinishQuiz}
        onTriggerSocraticHint={handleTriggerSocraticHint}
        quizData={mockDiagnosticQuiz}
      />

      {/* Toast Notification */}
      {toastText && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-semibold backdrop-blur-md animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-cyan-400">verified</span>
          <span>{toastText}</span>
        </div>
      )}

      {/* Embedded Socratic AI Coach (Mini / Dockable) */}
      <SocraticAICoach
        userFullName={userFullName}
        width={aiWidth}
        onWidthChange={setAiWidth}
        isMinimized={isAiMinimized}
        onToggleMinimize={() => setIsAiMinimized((prev) => !prev)}
        floatingDock={true}
      />
    </div>
  );
}
