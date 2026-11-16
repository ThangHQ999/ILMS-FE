'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LANDING_SCENES } from '../../hooks/useScrollSectionProgress';

export interface ScrollConstellationRailProps {
  activeSceneIndex: number;
  scrollProgress: number;
  onSelectScene: (sceneId: string) => void;
}

/**
 * Whisper-quiet Left-Edge Depth Gauge (inspired by englishcoach.io.vn's `.dive_gauge`):
 * A 1px vertical filament with glowing constellation nodes on the far-left edge,
 * freeing the right viewport edge so the world feels completely unboxed.
 */
export function ScrollConstellationRail({
  activeSceneIndex,
  scrollProgress,
  onSelectScene,
}: ScrollConstellationRailProps) {
  const t = useTranslations('landing.story');
  const clampedProgress = Math.min(1, Math.max(0.02, scrollProgress));

  return (
    <>
      {/* Top 2px Horizon Progress Filament */}
      <div
        className="fixed top-16 left-0 right-0 z-40 h-[2px] bg-slate-300/25 dark:bg-sky-950/40 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-400 shadow-[0_0_12px_rgba(56,189,248,0.75)] transition-all duration-150"
          style={{ width: `${clampedProgress * 100}%` }}
        />
      </div>

      {/* Left-Edge Whisper Depth Gauge (Desktop xl+) */}
      <nav
        aria-label={t('stationNavLabel')}
        className="hidden xl:block fixed left-5 top-1/2 -translate-y-1/2 z-40 select-none"
      >
        <ol className="relative grid gap-5 pl-0">
          {/* Background 1px Track */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-[5px] top-1.5 bottom-1.5 w-px bg-slate-400/35 dark:bg-sky-200/20"
          />
          {/* Active Scroll Fill Filament */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-[5px] top-1.5 bottom-1.5 w-px bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-400 origin-top transition-transform duration-200"
            style={{ transform: `scaleY(${clampedProgress})` }}
          />

          {LANDING_SCENES.map((scene) => {
            const isActive = activeSceneIndex === scene.index;
            const isPassed = activeSceneIndex > scene.index;

            return (
              <li key={scene.id} className="relative">
                <button
                  type="button"
                  onClick={() => onSelectScene(scene.id)}
                  aria-label={t(scene.labelKey)}
                  aria-current={isActive ? 'step' : undefined}
                  className="group relative flex items-center gap-3 text-left focus:outline-none cursor-pointer"
                >
                  <span
                    className={`relative z-10 w-[11px] h-[11px] rounded-full border transition-all duration-300 ${
                      isActive
                        ? 'bg-sky-400 border-white dark:border-sky-200 scale-125 shadow-[0_0_14px_rgba(56,189,248,0.95)]'
                        : isPassed
                        ? 'bg-blue-600/80 dark:bg-sky-400/75 border-blue-300/60 dark:border-sky-300/50 group-hover:scale-110'
                        : 'bg-white/80 dark:bg-[#0b2f78] border-slate-400/60 dark:border-sky-200/45 group-hover:border-sky-400 group-hover:scale-110'
                    }`}
                  />

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? 'opacity-100 translate-x-0 text-blue-950 dark:text-white bg-white/80 dark:bg-sky-400/20 backdrop-blur-md shadow-xs'
                        : 'opacity-0 -translate-x-1.5 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 text-slate-700 dark:text-sky-100 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md'
                    }`}
                  >
                    {t(scene.labelKey)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
