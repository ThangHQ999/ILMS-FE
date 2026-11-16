'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, Compass, Lightbulb, Award } from 'lucide-react';
import type { MascotPoseVariant } from '../../types';
import { useMouse3DTilt } from '../../hooks/useMouse3DTilt';
import { SocraticSpeechBubble } from './SocraticSpeechBubble';

const MASCOT_IMAGE_MAP: Record<MascotPoseVariant, string> = {
  hero: '/images/landing/mascot-hero.png?v=2',
  socratic: '/images/landing/mascot-socratic.png?v=2',
  graph: '/images/landing/mascot-graph.png?v=2',
  mastery: '/images/landing/mascot-mastery.png?v=2',
};

export interface FloatingSocraticMascotProps {
  pose: MascotPoseVariant;
  altText: string;
  badgeText: string;
  quotes: string[];
  formula?: string;
  nextTipLabel: string;
  floatingTagTop: string;
  floatingTagBottom: string;
  externalPulse?: number;
}

export function FloatingSocraticMascot({
  pose,
  altText,
  badgeText,
  quotes,
  formula,
  nextTipLabel,
  floatingTagTop,
  floatingTagBottom,
  externalPulse = 0,
}: FloatingSocraticMascotProps) {
  const { elementRef, state, transformStyle, handlers } = useMouse3DTilt({
    maxTilt: 14,
    scaleOnHover: 1.03,
  });

  const [quoteIdx, setQuoteIdx] = useState(0);
  const [clickPulseId, setClickPulseId] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  const cycleQuote = useCallback(() => {
    setIsBouncing(true);
    setClickPulseId((c) => c + 1);
    setQuoteIdx((prev) => (prev + 1) % Math.max(1, quotes.length));
    setTimeout(() => {
      setIsBouncing(false);
    }, 320);
  }, [quotes.length]);

  const currentQuote = quotes[quoteIdx % Math.max(1, quotes.length)] ?? '';
  const PoseIcon =
    pose === 'hero'
      ? Sparkles
      : pose === 'socratic'
      ? Lightbulb
      : pose === 'graph'
      ? Compass
      : Award;

  const shiftX = state.rotateY * 1.1;
  const shiftY = -state.rotateX * 1.1;

  return (
    <div className="relative flex flex-col items-center justify-center w-full select-none">
      {/* Interactive 2.5D Multi-Plane Stage */}
      <div
        ref={elementRef}
        style={transformStyle}
        onClick={cycleQuote}
        {...handlers}
        role="button"
        tabIndex={0}
        aria-label={altText}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cycleQuote();
          }
        }}
        className="relative flex items-center justify-center w-72 h-72 sm:w-88 sm:h-88 lg:w-96 lg:h-96 cursor-pointer focus:outline-none group"
      >
        {/* Plane -1: Ambient Cyber-Academic Aura & Rotating Halo */}
        <div
          aria-hidden="true"
          className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-600/20 via-sky-400/25 to-indigo-500/20 dark:from-blue-500/25 dark:via-sky-400/30 dark:to-indigo-500/25 blur-2xl transition-transform duration-500 group-hover:scale-110"
          style={{
            transform: `translate3d(${-shiftX * 0.6}px, ${-shiftY * 0.6}px, -30px)`,
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-6 rounded-full border-2 border-dashed border-sky-400/35 dark:border-sky-400/30 animate-spin"
          style={{ animationDuration: '28s' }}
        />

        {/* Click / External Trigger Expanding Energy Ring */}
        {(clickPulseId > 0 || externalPulse > 0) && (
          <div
            key={`${clickPulseId}-${externalPulse}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-10 rounded-full border-2 border-sky-400/60 dark:border-sky-300/60 animate-ping"
            style={{ animationDuration: '750ms' }}
          />
        )}

        {/* Plane +1: Main 3D Pixar Socratic Owl Mascot */}
        <img
          src={MASCOT_IMAGE_MAP[pose]}
          alt={altText}
          draggable={false}
          className={`relative z-20 w-64 h-64 sm:w-80 sm:h-80 lg:w-88 lg:h-88 object-contain drop-shadow-[0_20px_35px_rgba(14,165,233,0.28)] transition-transform duration-300 ${
            isBouncing ? 'scale-108 -translate-y-2' : 'scale-100'
          }`}
          style={{
            transform: `translate3d(${shiftX * 0.5}px, ${shiftY * 0.5}px, 25px)`,
          }}
        />

        {/* Plane +2: Foreground Floating Parallax Props */}
        <div
          className="absolute top-3 left-0 sm:-left-2 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#1E1F20]/95 text-blue-700 dark:text-sky-300 text-xs font-bold shadow-md shadow-blue-950/10 whitespace-nowrap"
          style={{
            transform: `translate3d(${shiftX * 1.2}px, ${shiftY * 1.2}px, 50px)`,
          }}
        >
          <PoseIcon className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          <span>{floatingTagTop}</span>
        </div>

        <div
          className="absolute bottom-4 right-0 sm:-right-2 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 text-xs font-bold shadow-md shadow-blue-600/25 whitespace-nowrap"
          style={{
            transform: `translate3d(${-shiftX * 1.1}px, ${-shiftY * 1.1}px, 55px)`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-950 animate-ping" />
          <span>{floatingTagBottom}</span>
        </div>
      </div>

      {/* Interactive Socratic Speech Bubble Below Mascot */}
      <div className="mt-2 w-full flex justify-center px-2">
        <SocraticSpeechBubble
          badgeText={badgeText}
          message={currentQuote}
          formula={formula}
          nextTipLabel={nextTipLabel}
          onNextTip={cycleQuote}
          isAnimating={isBouncing}
        />
      </div>
    </div>
  );
}
