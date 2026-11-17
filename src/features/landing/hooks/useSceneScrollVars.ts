'use client';

import { useEffect, RefObject } from 'react';

/**
 * Updates CSS custom properties `--e` (entrance progress 0..1) and `--s` (scroll progress 0..1)
 * directly on a section DOM element via requestAnimationFrame without triggering React re-renders.
 */
export function useSceneScrollVars(sectionRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      el.style.setProperty('--e', '1');
      el.style.setProperty('--s', '0.5');
      return;
    }

    let rafId: number | null = null;

    const updateVars = () => {
      rafId = null;
      const target = sectionRef.current;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const vh = Math.max(1, window.innerHeight);

      // --e: 0 when top of section is at 92% viewport height, 1 when top reaches 28% viewport height
      const enterRaw = (vh * 0.92 - rect.top) / (vh * 0.64);
      const e = Math.max(0, Math.min(1, enterRaw));

      // --s: 0 when top enters bottom of viewport, 1 when bottom leaves top of viewport
      const totalTravel = Math.max(1, vh + rect.height);
      const sRaw = (vh - rect.top) / totalTravel;
      const s = Math.max(0, Math.min(1, sRaw));

      target.style.setProperty('--e', e.toFixed(3));
      target.style.setProperty('--s', s.toFixed(3));
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateVars);
      }
    };

    updateVars();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [sectionRef]);
}
