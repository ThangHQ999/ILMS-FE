'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/features/auth';
import { buildLoginRedirectUrl } from '@/lib/auth-redirect';
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
import { useSceneScrollVars } from '../../hooks/useSceneScrollVars';
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
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const t = useTranslations('landing.story');
  const tHero = useTranslations('landing.hero');
  const demo = useInteractivePromptDemo();
  const sectionRef = useRef<HTMLElement>(null);
  useSceneScrollVars(sectionRef);

  const handleAskOwlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = demo.customInput.trim();
    const targetUrl = trimmed
      ? `/ai-tutor?prompt=${encodeURIComponent(trimmed)}`
      : '/ai-tutor';
    if (!user) {
      router.push(buildLoginRedirectUrl(targetUrl));
      return;
    }
    router.push(targetUrl);
  };

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
      ref={sectionRef}
      id="hero-station"
      className="ilms-scroll-scene relative w-full min-h-[calc(100vh-4rem)] flex items-center pt-6 pb-20 lg:pt-10 lg:pb-28 overflow-visible"
    >
      {/* Wide Full-Bleed Fluid Stage (frees content from cramped max-w-7xl box) */}
      <div className="relative z-10 w-full max-w-[1560px] mx-auto px-5 sm:px-8 lg:px-14 xl:px-20">
        {/* Top Horizon Bar: Live Status Pill + Role Perspective Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 lg:mb-10">
          <div className="ilms-world-glass inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-blue-900 dark:text-sky-200 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-300 animate-ping" />
            <span>{tHero('badge')}</span>
          </div>

          <div
            role="tablist"
            aria-label={t('roleSwitcher.label')}
            className="ilms-world-glass inline-flex items-center p-1 rounded-full"
          >
            <button
              type="button"
              role="tab"
              aria-selected={role === 'student'}
              onClick={() => onChangeRole('student')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${role === 'student'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-sky-300 dark:to-cyan-200 dark:text-slate-950 shadow-sm'
                : 'text-slate-700 dark:text-sky-100/80 hover:text-blue-700 dark:hover:text-white'
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
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${role === 'teacher'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-sky-300 dark:to-cyan-200 dark:text-slate-950 shadow-sm'
                : 'text-slate-700 dark:text-sky-100/80 hover:text-blue-700 dark:hover:text-white'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('roleSwitcher.teacher')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT COLUMN: Open Spatial Headline + Socratic Playground + CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            <h1 className="text-[clamp(2.25rem,min(5vw,8.5vh),4.65rem)] font-extrabold text-slate-950 dark:text-white tracking-[-0.022em] leading-[1.1] text-balance drop-shadow-[0_2px_20px_rgba(255,255,255,0.55)] dark:drop-shadow-[0_4px_26px_rgba(3,10,38,0.65)]">
              {role === 'student'
                ? t('hero.studentTitle1')
                : t('hero.teacherTitle1')}{' '}
              <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 dark:from-sky-200 dark:via-cyan-200 dark:to-indigo-200 bg-clip-text text-transparent">
                {role === 'student'
                  ? t('hero.studentTitleHighlight')
                  : t('hero.teacherTitleHighlight')}
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-[19px] text-slate-700 dark:text-sky-100/90 mt-5 max-w-2xl leading-relaxed font-medium">
              {role === 'student' ? t('hero.studentSub') : t('hero.teacherSub')}
            </p>

            {/* Interactive Socratic Prompt Tryout Box Floating in the World */}
            <TiltCard
              maxTilt={4}
              scaleOnHover={1.005}
              className="ilms-world-glass-radiant w-full mt-8 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-sky-200 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-300" />
                  <span>{t('hero.playgroundTitle')}</span>
                </span>
                <span className="text-[11px] font-medium text-slate-600 dark:text-sky-200/75">
                  {t('hero.playgroundHint')}
                </span>
              </div>

              {/* Clickable Preset Topic Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {demo.samples.map((sample) => {
                  const isSelected =
                    demo.selectedSampleId === sample.id &&
                    !demo.submittedCustomQuestion;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => demo.handleSelectSample(sample.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${isSelected
                        ? 'bg-blue-600 text-white dark:bg-sky-300 dark:text-slate-950 shadow-sm'
                        : 'bg-white/75 hover:bg-white text-slate-800 dark:bg-slate-950/45 dark:hover:bg-sky-400/20 dark:text-sky-100'
                        }`}
                    >
                      {t(sample.subjectKey)}
                    </button>
                  );
                })}
              </div>

              {/* Live Input Bar */}
              <form
                onSubmit={handleAskOwlSubmit}
                className="flex items-center gap-2.5"
              >
                <input
                  type="text"
                  value={demo.customInput}
                  onChange={(e) => demo.setCustomInput(e.target.value)}
                  placeholder={t(demo.activeSample.questionKey)}
                  aria-label={t('hero.playgroundTitle')}
                  className="flex-1 min-w-0 px-4 py-3 rounded-full bg-white/90 dark:bg-slate-950/65 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-sky-200/55 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-sky-300"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-sky-300 dark:to-cyan-200 text-white dark:text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('hero.askOwlBtn')}</span>
                </button>
              </form>
            </TiltCard>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="/register"
                prefetch={true}
                className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-200 dark:via-cyan-200 dark:to-indigo-200 text-white dark:text-slate-950 px-8 py-4 rounded-full font-extrabold text-sm sm:text-base shadow-[0_14px_34px_-10px_rgba(37,99,235,0.65)] dark:shadow-[0_14px_34px_-10px_rgba(125,211,252,0.55)] hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
              >
                <span>{tHero('demoCta')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() => onExploreScene('tinh-nang-noi-bat')}
                className="ilms-world-glass inline-flex items-center justify-center gap-2 text-slate-900 dark:text-white px-7 py-4 rounded-full font-bold text-sm sm:text-base hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-5 h-5 text-blue-600 dark:text-sky-300" />
                <span>{t('hero.explore3DBtn')}</span>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-slate-700 dark:text-sky-200/80 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-sky-300 shrink-0" />
              <span>{tHero('guarantee')}</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Unboxed 3D Socratic Owl Stage */}
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
      </div>
    </section>
  );
}
