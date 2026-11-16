'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';
import type { SocraticStepItem } from '../../types';
import { FloatingSocraticMascot } from '../mascot/FloatingSocraticMascot';
import { TiltCard } from '../shared/TiltCard';

const SOCRATIC_STEPS: readonly SocraticStepItem[] = [
  {
    stepNumber: 1,
    titleKey: 'socratic.steps.s1.title',
    studentThoughtKey: 'socratic.steps.s1.student',
    owlQuestionKey: 'socratic.steps.s1.owl',
    formula: 'v_top = 0 m/s  ⇒  E_k(max_height) = ½ · m · 0² = 0 J',
    insightBadgeKey: 'socratic.steps.s1.badge',
  },
  {
    stepNumber: 2,
    titleKey: 'socratic.steps.s2.title',
    studentThoughtKey: 'socratic.steps.s2.student',
    owlQuestionKey: 'socratic.steps.s2.owl',
    formula: 'E_p(top) = m · g · h_max  ⇔  ΔE_p → ΔE_k',
    insightBadgeKey: 'socratic.steps.s2.badge',
  },
  {
    stepNumber: 3,
    titleKey: 'socratic.steps.s3.title',
    studentThoughtKey: 'socratic.steps.s3.student',
    owlQuestionKey: 'socratic.steps.s3.owl',
    formula: 'v_ground = √(2 · g · h_max)  [100% Mastered]',
    insightBadgeKey: 'socratic.steps.s3.badge',
  },
] as const;

export function SocraticDialecticSection() {
  const t = useTranslations('landing.story');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [pulseCount, setPulseCount] = useState<number>(0);

  const currentStep =
    SOCRATIC_STEPS.find((s) => s.stepNumber === activeStep) ?? SOCRATIC_STEPS[0];

  const handleSelectStep = (stepNumber: number) => {
    setActiveStep(stepNumber);
    setPulseCount((c) => c + 1);
  };

  return (
    <section
      id="tinh-nang-noi-bat"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 text-xs font-bold mb-4">
          <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>{t('socratic.badge')}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('socratic.title')}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          {t('socratic.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* LEFT COLUMN: Mascot Socratic Pose */}
        <div className="lg:col-span-5 order-2 lg:order-1 flex items-center justify-center">
          <FloatingSocraticMascot
            pose="socratic"
            altText="ILMS Socratic Thinking Owl Mascot"
            badgeText={t(currentStep.insightBadgeKey)}
            quotes={[
              t(currentStep.owlQuestionKey),
              t('socratic.mascotQuote2'),
              t('socratic.mascotQuote3'),
            ]}
            formula={currentStep.formula}
            nextTipLabel={t('hero.nextHintBtn')}
            floatingTagTop={t('socratic.tagTop')}
            floatingTagBottom={t('socratic.tagBottom')}
            externalPulse={pulseCount}
          />
        </div>

        {/* RIGHT COLUMN: Interactive 3-Step Dialectic Solver & Comparison */}
        <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-6">
          {/* Before vs After Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TiltCard
              maxTilt={6}
              glowColor="rgba(244, 63, 94, 0.14)"
              className="bg-white/90 dark:bg-[#1E1F20]/90 p-5"
            >
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm mb-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{t('socratic.traditionalTitle')}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('socratic.traditionalDesc')}
              </p>
            </TiltCard>

            <TiltCard
              maxTilt={6}
              glowColor="rgba(16, 185, 129, 0.18)"
              className="bg-gradient-to-br from-blue-50/95 via-white to-sky-50/90 dark:from-[#162B4D]/80 dark:via-[#1E1F20] dark:to-[#13283c]/80 p-5"
            >
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t('socratic.ilmsTitle')}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {t('socratic.ilmsDesc')}
              </p>
            </TiltCard>
          </div>

          {/* Interactive 3-Step Socratic Exercise Lab */}
          <TiltCard
            maxTilt={5}
            className="bg-white/95 dark:bg-[#1E1F20]/95 p-6 sm:p-7 shadow-xl shadow-blue-950/5 dark:shadow-black/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {t('socratic.labTitle')}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 text-xs font-semibold">
                {t('socratic.clickStepHint')}
              </span>
            </div>

            {/* Step Selector Pills */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {SOCRATIC_STEPS.map((step) => {
                const isSelected = step.stepNumber === activeStep;
                return (
                  <button
                    key={step.stepNumber}
                    type="button"
                    onClick={() => handleSelectStep(step.stepNumber)}
                    className={`flex flex-col items-start p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-700 dark:bg-[#282A2C] dark:hover:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                      {t('socratic.stepLabel', { num: step.stepNumber })}
                    </span>
                    <span className="text-xs sm:text-sm font-bold mt-0.5 line-clamp-1">
                      {t(step.titleKey)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Dialogue Simulation */}
            <div className="space-y-3.5 bg-slate-50 dark:bg-[#131314] rounded-2xl p-4 sm:p-5">
              {/* Student Bubble */}
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-[#282A2C] text-slate-700 dark:text-slate-300 text-[11px] font-bold shrink-0">
                  {t('socratic.studentTag')}
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                  {t(currentStep.studentThoughtKey)}
                </p>
              </div>

              {/* Owl Socratic Guide Bubble */}
              <div className="flex items-start gap-3 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 text-[11px] font-bold shrink-0">
                  <Sparkles className="w-3 h-3" />
                  <span>Cú Socrate</span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {t(currentStep.owlQuestionKey)}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <code className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-[#1E1F20] text-blue-700 dark:text-sky-300 text-xs font-mono font-bold">
                      {currentStep.formula}
                    </code>

                    <button
                      type="button"
                      onClick={() => handleSelectStep((activeStep % 3) + 1)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      <span>{t('socratic.nextStepBtn')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
