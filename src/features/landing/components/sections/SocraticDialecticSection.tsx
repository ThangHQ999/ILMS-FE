'use client';

import React, { useState, useRef } from 'react';
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
import { useSceneScrollVars } from '../../hooks/useSceneScrollVars';
import { FloatingSocraticMascot } from '../mascot/FloatingSocraticMascot';

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
  const sectionRef = useRef<HTMLElement>(null);
  useSceneScrollVars(sectionRef);

  const currentStep =
    SOCRATIC_STEPS.find((s) => s.stepNumber === activeStep) ?? SOCRATIC_STEPS[0];

  const handleSelectStep = (stepNumber: number) => {
    setActiveStep(stepNumber);
    setPulseCount((c) => c + 1);
  };

  return (
    <section
      ref={sectionRef}
      id="tinh-nang-noi-bat"
      className="ilms-scroll-scene relative w-full py-20 lg:py-32 overflow-visible"
    >
      {/* Floating Space Explorer Astronaut + AI Drone Companion on Outer Right Edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute right-[2%] xl:right-[4%] -top-8 z-20"
        style={{
          transform:
            'translate3d(0, calc((0.5 - var(--s, 0.5)) * 70px), 0)',
        }}
      >
        <img
          src="/images/landing/companion-astronaut-explorer.png"
          alt=""
          draggable={false}
          className="ilms-zero-g-float-delayed w-36 h-36 xl:w-48 xl:h-48 object-contain drop-shadow-[0_22px_40px_rgba(37,99,235,0.34)]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1560px] mx-auto px-5 sm:px-8 lg:px-14 xl:px-20">
        {/* Open Spatial Section Header */}
        <div className="ilms-scroll-rise flex flex-col items-center text-center max-w-3xl mx-auto mb-14 lg:mb-16">
          <div className="ilms-world-glass inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-blue-900 dark:text-sky-200 text-xs font-bold mb-4">
            <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-300" />
            <span>{t('socratic.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight text-balance">
            {t('socratic.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-sky-100/85 mt-3.5 leading-relaxed">
            {t('socratic.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT COLUMN: Unboxed Socratic Thinking Owl */}
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

          {/* RIGHT COLUMN: 3D Perspective Unfolding Socratic Open Book */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-6">
            {/* 3D Two-Page Open Book Stage (unfolds smoothly with scroll `--e`) */}
            <div className="ilms-book-stage grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-0">
              {/* Left Page: Traditional Rote / Spoon-fed Answer */}
              <div className="ilms-pearl-page ilms-book-page-left rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/12 text-rose-700 dark:text-rose-300 font-bold text-xs mb-3">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>{t('socratic.traditionalTitle')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-sky-100/85 leading-relaxed">
                    {t('socratic.traditionalDesc')}
                  </p>
                </div>

                <div className="mt-5 p-3.5 rounded-2xl bg-rose-500/8 dark:bg-rose-950/35 border border-rose-500/20 text-xs font-mono text-rose-800 dark:text-rose-200 line-through decoration-rose-500/70">
                  {t('socratic.traditionalFormulaNote')}
                </div>
              </div>

              {/* Right Page: Socratic Guided Discovery */}
              <div className="ilms-pearl-page ilms-book-page-right rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t('socratic.ilmsTitle')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-sky-50 leading-relaxed font-medium">
                    {t('socratic.ilmsDesc')}
                  </p>
                </div>

                <div className="mt-5 p-3.5 rounded-2xl bg-emerald-500/12 dark:bg-emerald-950/40 border border-emerald-500/25 text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200">
                  {t('socratic.ilmsFormulaNote')}
                </div>
              </div>
            </div>

            {/* Interactive 3-Step Socratic Dialectic Workbench */}
            <div className="ilms-world-glass-radiant rounded-3xl p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-600 dark:text-sky-300" />
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white">
                    {t('socratic.labTitle')}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-600/12 dark:bg-sky-400/20 text-blue-800 dark:text-sky-200 text-xs font-bold">
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
                      className={`flex flex-col items-start p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-sky-300 dark:to-cyan-200 dark:text-slate-950 shadow-md'
                          : 'bg-white/70 hover:bg-white text-slate-800 dark:bg-slate-950/45 dark:hover:bg-sky-400/15 dark:text-sky-100'
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
              <div className="space-y-3.5 bg-white/80 dark:bg-slate-950/55 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-sky-950 text-slate-800 dark:text-sky-200 text-[11px] font-bold shrink-0">
                    {t('socratic.studentTag')}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-sky-100/90 italic">
                    {t(currentStep.studentThoughtKey)}
                  </p>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-slate-300/50 dark:border-sky-300/15">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white dark:bg-sky-300 dark:text-slate-950 text-[11px] font-bold shrink-0">
                    <Sparkles className="w-3 h-3" />
                    <span>{t('socratic.owlSpeakerName')}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-950 dark:text-white leading-relaxed">
                      {t(currentStep.owlQuestionKey)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <code className="px-3 py-1.5 rounded-xl bg-blue-600/10 dark:bg-sky-950/80 text-blue-800 dark:text-sky-300 text-xs font-mono font-bold">
                        {currentStep.formula}
                      </code>

                      <button
                        type="button"
                        onClick={() => handleSelectStep((activeStep % 3) + 1)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-sky-300 hover:underline cursor-pointer"
                      >
                        <span>{t('socratic.nextStepBtn')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
