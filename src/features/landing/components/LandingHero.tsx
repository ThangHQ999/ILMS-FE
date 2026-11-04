'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, PlayCircle, CheckCircle2 } from 'lucide-react';
import { LandingKnowledgeGraph } from './LandingKnowledgeGraph';
import { LandingHeatmapCard } from './LandingHeatmapCard';

export function LandingHero() {
  const t = useTranslations('landing.hero');

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 lg:pb-24">
      {/* Ambient Glow Backdrop Layer */}
      <div className="absolute -top-16 left-1/4 w-[32rem] sm:w-[36rem] h-[32rem] sm:h-[36rem] rounded-full bg-blue-200/40 dark:bg-[#38BDF8]/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[28rem] sm:w-[32rem] h-[28rem] sm:h-[32rem] rounded-full bg-sky-200/35 dark:bg-[#2563EB]/15 blur-[140px] pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* LEFT COLUMN: Content & High-Impact Copy */}
        <div className="lg:col-span-6 flex flex-col items-start z-10">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900/90 border border-blue-200 dark:border-[#38BDF8]/40 hover:border-blue-400 dark:hover:border-[#38BDF8] text-blue-700 dark:text-[#38BDF8] px-3.5 py-1.5 rounded-full shadow-xs dark:shadow-lg dark:shadow-cyan-500/10 transition-all mb-6 cursor-default">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-[#38BDF8] animate-pulse" />
            <span className="text-xs tracking-wide text-slate-700 dark:text-slate-200 font-medium">
              {t('badge')}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-[1.15]">
            {t('headlinePart1')}{' '}
            <br className="hidden sm:inline" />
            {t('headlinePart2')}{' '}
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 dark:from-[#38BDF8] dark:via-[#60A5FA] dark:to-[#A855F7] bg-clip-text text-transparent">
              {t('headlineGradient')}
            </span>
          </h1>

          {/* Sub-description */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-4 max-w-xl leading-relaxed">
            {t('description')}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#38BDF8] dark:to-[#2563EB] text-white dark:text-slate-950 px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 dark:shadow-cyan-500/20 hover:shadow-blue-600/35 dark:hover:shadow-cyan-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-sm sm:text-base"
            >
              <span>{t('demoCta')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#xem-video"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-[#161B26]/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-[#38BDF8] hover:border-blue-300 dark:hover:border-[#38BDF8]/50 hover:bg-slate-50 dark:hover:bg-[#262A35] px-6 py-3.5 rounded-xl shadow-xs transition-all font-semibold text-sm sm:text-base backdrop-blur-md"
            >
              <PlayCircle className="w-5 h-5 text-blue-600 dark:text-[#38BDF8]" />
              <span>{t('videoCta')}</span>
            </a>
          </div>

          {/* Guarantee */}
          <div className="mt-4 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-[#38BDF8] shrink-0" />
            <span>{t('guarantee')}</span>
          </div>

          {/* Trust Metrics */}
          <div className="mt-12 pt-6 w-full grid grid-cols-3 gap-3 bg-white dark:bg-[#161B26]/70 border border-slate-200 dark:border-slate-800/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xs dark:shadow-xl">
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('stats.studentsCount')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('stats.studentsLabel')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('stats.schoolsCount')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('stats.schoolsLabel')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-[#38BDF8] tracking-tight">
                {t('stats.satisfactionCount')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('stats.satisfactionLabel')}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Multi-layer Isometric & Floating UI */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center pt-6 lg:pt-0">
          <LandingKnowledgeGraph />
          <LandingHeatmapCard />
        </div>
      </div>
    </div>
  );
}
