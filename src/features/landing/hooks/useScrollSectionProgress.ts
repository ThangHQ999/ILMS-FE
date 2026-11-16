'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LandingSceneMeta } from '../types';

export const LANDING_SCENES: readonly LandingSceneMeta[] = [
  { id: 'hero-station', index: 0, labelKey: 'scenes.hero', pose: 'hero' },
  { id: 'tinh-nang-noi-bat', index: 1, labelKey: 'scenes.socratic', pose: 'socratic' },
  { id: 'khong-gian-lop-hoc', index: 2, labelKey: 'scenes.classroom', pose: 'graph' },
  { id: 'quy-trinh-hoat-dong', index: 3, labelKey: 'scenes.bloom', pose: 'mastery' },
  { id: 've-chung-toi', index: 4, labelKey: 'scenes.action', pose: 'mastery' },
] as const;

export interface ScrollSectionProgressState {
  scrollProgress: number;
  activeSceneIndex: number;
  pointerNormalized: { x: number; y: number };
  scrollToScene: (sceneId: string) => void;
}

export function useScrollSectionProgress(): ScrollSectionProgressState {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [pointerNormalized, setPointerNormalized] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const scrollTop = window.scrollY;
        const docHeight = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const progress = Math.max(0, Math.min(1, scrollTop / docHeight));
        setScrollProgress(Number(progress.toFixed(3)));

        const viewportCenter = scrollTop + window.innerHeight * 0.42;
        let currentIdx = 0;

        for (let i = 0; i < LANDING_SCENES.length; i++) {
          const el = document.getElementById(LANDING_SCENES[i].id);
          if (el && el.offsetTop <= viewportCenter) {
            currentIdx = i;
          }
        }
        setActiveSceneIndex(currentIdx);
      });
    };

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
      setPointerNormalized({
        x: Number(nx.toFixed(3)),
        y: Number(ny.toFixed(3)),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const nx = (touch.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = -((touch.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
      setPointerNormalized({
        x: Number(nx.toFixed(3)),
        y: Number(ny.toFixed(3)),
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const scrollToScene = useCallback((sceneId: string) => {
    const el = document.getElementById(sceneId);
    if (!el) return;
    const headerOffset = 72;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return {
    scrollProgress,
    activeSceneIndex,
    pointerNormalized,
    scrollToScene,
  };
}
