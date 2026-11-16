'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Users,
  Send,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import type { LandingRolePerspective } from '../../types';
import { useInteractivePromptDemo } from '../../hooks/useInteractivePromptDemo';
import { FloatingSocraticMascot } from '../mascot/FloatingSocraticMascot';
import { TiltCard } from '../shared/TiltCard';

export interface LandingHeroSectionProps {
  role: LandingRolePerspective;
  onChangeRole: (role: LandingRolePerspective) => void;
  onExploreScene: (sceneId: string) => void;
}

export function LandingHeroSection({
  role,
  onChangeRole,
  onExploreScene,
}: LandingHeroSectionProps) {
  const t = useTranslations('landing.story');
  const tHero = useTranslations('landing.hero');
  const demo = useInteractivePromptDemo();

  const activeQuotes = demo.submittedCustomQuestion
    ? [
        t('hero.customReply', { query: demo.submittedCustomQuestion }),
        t(demo.activeSample.socraticHintKey),
      ]
    : [
        t(demo.activeSample.socraticHintKey),
        t(demo.activeSample.followUpKey),
        t('hero.mascotDefaultQuote'),
      ];

  return (
    <section
      id="hero-station"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pt-10 lg:pb-28"
    >
      {/* Top Role Perspective Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 text-xs font-bold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 animate-ping" />
          <span>{tHero('badge')}</span>
        </div>

        <div
          role="tablist"
          aria-label={t('roleSwitcher.label')}
          className="inline-flex items-center p-1 rounded-full bg-white/90 dark:bg-[#1E1F20]/90 backdrop-blur-md shadow-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={role === 'student'}
            onClick={() => onChangeRole('student')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              role === 'student'
                ? 'bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-sm scale-102'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-300'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{t('roleSwitcher.student')}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={role === 'teacher'}
            onClick={() => onChangeRole('teacher')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              role === 'teacher'
                ? 'bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-sm scale-102'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('roleSwitcher.teacher')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* LEFT COLUMN: Headline + Interactive Socratic Playground + CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start z-10">
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            {role === 'student' ? t('hero.studentTitle1') : t('hero.teacherTitle1')}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent">
              {role === 'student' ? t('hero.studentTitleHighlight') : t('hero.teacherTitleHighlight')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-4 max-w-2xl leading-relaxed">
            {role === 'student' ? t('hero.studentSub') : t('hero.teacherSub')}
          </p>

          {/* Interactive Socratic Prompt Tryout Box */}
          <TiltCard
            maxTilt={4}
            scaleOnHover={1.005}
            className="w-full mt-7 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-xl p-4 sm:p-5 shadow-xl shadow-blue-950/5 dark:shadow-black/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-sky-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>{t('hero.playgroundTitle')}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('hero.playgroundHint')}
              </span>
            </div>

            {/* Clickable Preset Topic Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-3.5">
              {demo.samples.map((sample) => {
                const isSelected =
                  demo.selectedSampleId === sample.id && !demo.submittedCustomQuestion;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => demo.handleSelectSample(sample.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                      isSelected
                        ? 'bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-sm'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-700 dark:bg-[#282A2C] dark:hover:bg-sky-500/20 dark:text-slate-200'
                    }`}
                  >
                    {t(sample.subjectKey)}
                  </button>
                );
              })}
            </div>

            {/* Live Input Bar */}
            <form onSubmit={demo.handleSubmitCustom} className="flex items-center gap-2">
              <input
                type="text"
                value={demo.customInput}
                onChange={(e) => demo.setCustomInput(e.target.value)}
                placeholder={t(demo.activeSample.questionKey)}
                aria-label={t('hero.playgroundTitle')}
                className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-[#131314] text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-sky-400 dark:hover:bg-sky-300 text-white dark:text-slate-950 text-xs sm:text-sm font-bold transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('hero.askOwlBtn')}</span>
              </button>
            </form>
          </TiltCard>

          {/* Primary & Secondary CTAs */}
          <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/register"
              prefetch={true}
              className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition-all active:scale-95 whitespace-nowrap"
            >
              <span>{tHero('demoCta')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              type="button"
              onClick={() => onExploreScene('tinh-nang-noi-bat')}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 dark:bg-[#1E1F20] dark:hover:bg-[#282A2C] dark:text-slate-100 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-5 h-5 text-blue-600 dark:text-sky-400" />
              <span>{t('hero.explore3DBtn')}</span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
            <span>{tHero('guarantee')}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: 2.5D Interactive Socratic Owl Mascot Stage */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <FloatingSocraticMascot
            pose="hero"
            altText="ILMS Socratic Owl Hero Mascot"
            badgeText={t('hero.mascotBadge')}
            quotes={activeQuotes}
            formula={demo.activeSample.formula}
            nextTipLabel={t('hero.nextHintBtn')}
            floatingTagTop={t('hero.tagTop')}
            floatingTagBottom={t('hero.tagBottom')}
            externalPulse={demo.pulseTrigger}
          />
        </div>
      </div>
    </section>
  );
}
