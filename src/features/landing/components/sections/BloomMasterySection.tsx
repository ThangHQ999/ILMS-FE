'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Award, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import type { BloomLevelItem } from '../../types';
import { useSceneScrollVars } from '../../hooks/useSceneScrollVars';
import { FloatingSocraticMascot } from '../mascot/FloatingSocraticMascot';
import { TiltCard } from '../shared/TiltCard';

const BLOOM_LEVELS: readonly BloomLevelItem[] = [
  {
    level: 6,
    code: 'L6 • CREATE',
    nameKey: 'bloom.levels.l6.name',
    badgeKey: 'bloom.levels.l6.badge',
    descKey: 'bloom.levels.l6.desc',
    sampleQuestionKey: 'bloom.levels.l6.sample',
    colorClass: 'from-amber-400 to-orange-500 text-slate-950',
    glowColor: '#F59E0B',
    radarScores: [96, 94, 92, 95, 90, 98],
  },
  {
    level: 5,
    code: 'L5 • EVALUATE',
    nameKey: 'bloom.levels.l5.name',
    badgeKey: 'bloom.levels.l5.badge',
    descKey: 'bloom.levels.l5.desc',
    sampleQuestionKey: 'bloom.levels.l5.sample',
    colorClass: 'from-indigo-500 to-purple-600 text-white',
    glowColor: '#6366F1',
    radarScores: [90, 88, 86, 92, 94, 82],
  },
  {
    level: 4,
    code: 'L4 • ANALYZE',
    nameKey: 'bloom.levels.l4.name',
    badgeKey: 'bloom.levels.l4.badge',
    descKey: 'bloom.levels.l4.desc',
    sampleQuestionKey: 'bloom.levels.l4.sample',
    colorClass: 'from-blue-600 to-indigo-600 text-white',
    glowColor: '#3B82F6',
    radarScores: [85, 86, 84, 90, 80, 74],
  },
  {
    level: 3,
    code: 'L3 • APPLY',
    nameKey: 'bloom.levels.l3.name',
    badgeKey: 'bloom.levels.l3.badge',
    descKey: 'bloom.levels.l3.desc',
    sampleQuestionKey: 'bloom.levels.l3.sample',
    colorClass: 'from-sky-500 to-blue-600 text-white',
    glowColor: '#0EA5E9',
    radarScores: [82, 84, 88, 76, 70, 65],
  },
  {
    level: 2,
    code: 'L2 • UNDERSTAND',
    nameKey: 'bloom.levels.l2.name',
    badgeKey: 'bloom.levels.l2.badge',
    descKey: 'bloom.levels.l2.desc',
    sampleQuestionKey: 'bloom.levels.l2.sample',
    colorClass: 'from-teal-500 to-sky-500 text-white',
    glowColor: '#14B8A6',
    radarScores: [80, 85, 72, 65, 60, 55],
  },
  {
    level: 1,
    code: 'L1 • REMEMBER',
    nameKey: 'bloom.levels.l1.name',
    badgeKey: 'bloom.levels.l1.badge',
    descKey: 'bloom.levels.l1.desc',
    sampleQuestionKey: 'bloom.levels.l1.sample',
    colorClass: 'from-emerald-500 to-teal-600 text-white',
    glowColor: '#10B981',
    radarScores: [88, 70, 60, 52, 48, 45],
  },
] as const;

export function BloomMasterySection() {
  const t = useTranslations('landing.story');
  const [selectedLevel, setSelectedLevel] = useState<number>(6);
  const [pulseCount, setPulseCount] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);
  useSceneScrollVars(sectionRef);

  const activeBloom =
    BLOOM_LEVELS.find((b) => b.level === selectedLevel) ?? BLOOM_LEVELS[0];

  const handleSelectLevel = (lvl: number) => {
    setSelectedLevel(lvl);
    setPulseCount((c) => c + 1);
  };

  const radarPoints = activeBloom.radarScores
    .map((score, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const r = (score / 100) * 66;
      const x = 90 + r * Math.cos(angle);
      const y = 90 + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <section
      ref={sectionRef}
      id="quy-trinh-hoat-dong"
      className="ilms-scroll-scene relative w-full py-20 lg:py-32 overflow-visible"
    >
      <div className="relative z-10 w-full max-w-[1560px] mx-auto px-5 sm:px-8 lg:px-14 xl:px-20">
        {/* Section Header */}
        <div className="ilms-scroll-rise flex flex-col items-center text-center max-w-3xl mx-auto mb-12 lg:mb-14">
          <div className="ilms-world-glass inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-blue-900 dark:text-sky-200 text-xs font-bold mb-4">
            <Layers className="w-4 h-4 text-amber-500 dark:text-amber-300" />
            <span>{t('bloom.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight text-balance">
            {t('bloom.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-sky-100/85 mt-3.5 leading-relaxed">
            {t('bloom.subtitle')}
          </p>
        </div>

        {/* Orbital Glossy Porthole Selector Row (inspired by englishcoach.io.vn `.dive_porthole` arc) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mb-12">
          {BLOOM_LEVELS.map((tier, idx) => {
            const isSelected = tier.level === selectedLevel;
            const curveOffset = Math.abs(idx - 2.5);
            return (
              <button
                key={tier.level}
                type="button"
                onClick={() => handleSelectLevel(tier.level)}
                aria-pressed={isSelected}
                style={{
                  transform: `translate3d(0, ${(curveOffset * curveOffset * 2.2).toFixed(1)}px, 0)`,
                }}
                className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none transition-transform duration-300"
              >
                <span
                  className={`ilms-porthole w-13 h-13 sm:w-15 sm:h-15 rounded-full flex items-center justify-center font-mono text-xs sm:text-sm font-extrabold transition-all duration-300 ${
                    isSelected
                      ? 'scale-115 text-white ring-2 ring-amber-300 dark:ring-sky-200 shadow-[0_0_28px_rgba(56,189,248,0.85)]'
                      : 'text-blue-950 dark:text-sky-100 group-hover:scale-105 opacity-85 group-hover:opacity-100'
                  }`}
                >
                  L{tier.level}
                </span>
                <span
                  className={`text-[11px] font-bold tracking-wide transition-colors ${
                    isSelected
                      ? 'text-blue-700 dark:text-sky-200'
                      : 'text-slate-600 dark:text-sky-200/70'
                  }`}
                >
                  {t(tier.nameKey)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT COLUMN: Unboxed Mascot Mastery Pose */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex items-center justify-center">
            <FloatingSocraticMascot
              pose="mastery"
              altText="ILMS Graduation Mastery Owl Mascot"
              badgeText={t(activeBloom.badgeKey)}
              quotes={[
                t(activeBloom.sampleQuestionKey),
                t(activeBloom.descKey),
                t('bloom.mascotQuoteDefault'),
              ]}
              formula={`Bloom Taxonomy [${activeBloom.code}] • Score: ${activeBloom.radarScores[0]}%`}
              nextTipLabel={t('hero.nextHintBtn')}
              floatingTagTop={t('bloom.tagTop')}
              floatingTagBottom={t('bloom.tagBottom')}
              externalPulse={pulseCount}
            />
          </div>

          {/* RIGHT COLUMN: Interactive 6-Tier Bloom Sanctuary + Live Radar SVG */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-6">
            <TiltCard
              maxTilt={5}
              className="ilms-world-glass-radiant p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500 dark:text-amber-300" />
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white">
                    {t('bloom.towerTitle')}
                  </h3>
                </div>
                <span className="text-xs font-bold text-blue-700 dark:text-sky-300">
                  {t('bloom.clickTierHint')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* 6-Tier Isometric Stack */}
                <div className="md:col-span-7 flex flex-col items-center gap-2">
                  {BLOOM_LEVELS.map((tier, idx) => {
                    const isSelected = tier.level === selectedLevel;
                    const widthPercent = 66 + idx * 6.5;

                    return (
                      <button
                        key={tier.level}
                        type="button"
                        onClick={() => handleSelectLevel(tier.level)}
                        style={{ width: `${widthPercent}%` }}
                        className={`group relative flex items-center justify-between px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-250 cursor-pointer ${
                          isSelected
                            ? `bg-gradient-to-r ${tier.colorClass} scale-105 -translate-x-1.5 shadow-lg`
                            : 'bg-white/75 hover:bg-white text-slate-800 dark:bg-slate-950/45 dark:hover:bg-sky-400/15 dark:text-sky-100'
                        }`}
                      >
                        <span className="font-mono text-[11px] opacity-85">
                          {tier.code}
                        </span>
                        <span className="truncate ml-2">{t(tier.nameKey)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic 6-Axis Competency Radar SVG */}
                <div className="md:col-span-5 flex flex-col items-center justify-center bg-white/75 dark:bg-slate-950/55 rounded-2xl p-4">
                  <svg viewBox="0 0 180 180" className="w-44 h-44">
                    {[22, 44, 66].map((r) => (
                      <circle
                        key={r}
                        cx="90"
                        cy="90"
                        r={r}
                        fill="none"
                        stroke="currentColor"
                        className="text-slate-300 dark:text-sky-300/25"
                        strokeDasharray="2 3"
                      />
                    ))}
                    <polygon
                      points={radarPoints}
                      fill={activeBloom.glowColor}
                      fillOpacity={0.32}
                      stroke={activeBloom.glowColor}
                      strokeWidth="2.5"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <span className="text-xs font-bold text-slate-800 dark:text-sky-100 mt-1">
                    {t(activeBloom.badgeKey)}
                  </span>
                </div>
              </div>

              {/* Active Tier Sample Challenge Box */}
              <div className="mt-6 p-4 rounded-2xl bg-white/80 dark:bg-slate-950/55 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-sky-300 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-sky-300">
                      {activeBloom.code} — {t(activeBloom.nameKey)}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-sky-50 font-medium leading-relaxed">
                    {t(activeBloom.sampleQuestionKey)}
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
