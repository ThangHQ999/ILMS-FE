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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* LEFT COLUMN: Content & High-Impact Copy */}
        <div className="lg:col-span-6 flex flex-col items-start z-10">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] px-4 py-1.5 rounded-full border-none shadow-none mb-6 cursor-default">
            <span className="inline-block w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
            <span className="text-xs tracking-wide text-[#041E49] dark:text-[#E3E3E3] font-medium">
              {t('badge')}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight leading-tight sm:leading-[1.15]">
            {t('headlinePart1')}{' '}
            <br className="hidden sm:inline" />
            {t('headlinePart2')}{' '}
            <span className="text-[#0B57D0] dark:text-[#A8C7FA]">
              {t('headlineGradient')}
            </span>
          </h1>

          {/* Sub-description */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-[#C4C7C5] mt-4 max-w-xl leading-relaxed">
            {t('description')}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center gap-2 bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] px-8 py-3.5 rounded-full border-none shadow-none transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
            >
              <span>{t('demoCta')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#xem-video"
              className="inline-flex items-center justify-center gap-2 bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] px-7 py-3.5 rounded-full border-none shadow-none transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
            >
              <PlayCircle className="w-5 h-5 text-[#0B57D0] dark:text-[#A8C7FA]" />
              <span>{t('videoCta')}</span>
            </a>
          </div>

          {/* Guarantee */}
          <div className="mt-4 flex items-center gap-1.5 text-slate-500 dark:text-[#C4C7C5] text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA] shrink-0" />
            <span>{t('guarantee')}</span>
          </div>

          {/* Trust Metrics */}
          <div className="mt-12 pt-6 w-full grid grid-cols-3 gap-3 bg-white dark:bg-[#1E1F20] border-none p-5 sm:p-6 rounded-3xl shadow-none">
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight">
                {t('stats.studentsCount')}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-0.5">
                {t('stats.studentsLabel')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight">
                {t('stats.schoolsCount')}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-0.5">
                {t('stats.schoolsLabel')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-[#A8C7FA] tracking-tight">
                {t('stats.satisfactionCount')}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-0.5">
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
