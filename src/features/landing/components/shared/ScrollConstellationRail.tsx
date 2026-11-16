'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LANDING_SCENES } from '../../hooks/useScrollSectionProgress';

export interface ScrollConstellationRailProps {
  activeSceneIndex: number;
  scrollProgress: number;
  onSelectScene: (sceneId: string) => void;
}

export function ScrollConstellationRail({
  activeSceneIndex,
  scrollProgress,
  onSelectScene,
}: ScrollConstellationRailProps) {
  const t = useTranslations('landing.story');

  return (
    <>
      {/* Top Laser Progress Bar (visible on both Mobile & Desktop) */}
      <div
        className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-slate-200/40 dark:bg-slate-800/50 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(2, scrollProgress * 100))}%` }}
        />
      </div>

      {/* Desktop Right-side Constellation Station Rail */}
      <nav
        aria-label={t('stationNavLabel')}
        className="hidden xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3.5"
      >
        {LANDING_SCENES.map((scene) => {
          const isActive = activeSceneIndex === scene.index;
          const isPassed = activeSceneIndex > scene.index;

          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSelectScene(scene.id)}
              aria-label={t(scene.labelKey)}
              className="group flex items-center gap-2.5 focus:outline-none cursor-pointer"
            >
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'opacity-100 translate-x-0 bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-sm'
                    : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-white/90 dark:bg-[#1E1F20]/95 text-slate-700 dark:text-slate-200'
                }`}
              >
                {t(scene.labelKey)}
              </span>

              <span
                className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-4 h-4 bg-blue-600 dark:bg-sky-400 ring-4 ring-blue-500/25 dark:ring-sky-400/25 scale-110'
                    : isPassed
                    ? 'w-2.5 h-2.5 bg-blue-500/70 dark:bg-sky-400/70 hover:scale-125'
                    : 'w-2.5 h-2.5 bg-slate-400/50 dark:bg-slate-600 hover:bg-blue-500 dark:hover:bg-sky-400 hover:scale-125'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </>
  );
}
