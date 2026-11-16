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
    scaleOnHover: 1.035,
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

  const shiftX = state.rotateY * 1.15;
  const shiftY = -state.rotateX * 1.15;

  return (
    <div className="relative flex flex-col items-center justify-center w-full select-none">
      {/* Unboxed Free-Floating 3D Character Stage (no dashed border cage) */}
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
        className="relative flex items-center justify-center w-76 h-76 sm:w-92 sm:h-92 lg:w-[410px] lg:h-[410px] cursor-pointer focus:outline-none group"
      >
        {/* Soft Volumetric Light Pool Behind Mascot */}
        <div
          aria-hidden="true"
          className="absolute inset-2 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.32)_0%,rgba(59,130,246,0.14)_48%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(56,189,248,0.38)_0%,rgba(99,102,241,0.18)_48%,transparent_72%)] blur-2xl transition-transform duration-500 group-hover:scale-110"
          style={{
            transform: `translate3d(${-shiftX * 0.6}px, ${-shiftY * 0.6}px, -30px)`,
          }}
        />

        {/* Click / Step Change Expanding Sonic Ripple */}
        {(clickPulseId > 0 || externalPulse > 0) && (
          <div
            key={`${clickPulseId}-${externalPulse}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-10 rounded-full border border-sky-400/60 dark:border-sky-300/60 animate-ping"
            style={{ animationDuration: '750ms' }}
          />
        )}

        {/* Main 3D Pixar Socratic Owl Mascot Floating in Open Space */}
        <img
          src={MASCOT_IMAGE_MAP[pose]}
          alt={altText}
          draggable={false}
          className={`ilms-zero-g-float relative z-20 w-68 h-68 sm:w-84 sm:h-84 lg:w-96 lg:h-96 object-contain drop-shadow-[0_24px_44px_rgba(8,47,114,0.28)] dark:drop-shadow-[0_28px_52px_rgba(2,12,42,0.75)] transition-transform duration-300 ${
            isBouncing ? 'scale-108 -translate-y-2' : 'scale-100'
          }`}
          style={{
            transform: `translate3d(${shiftX * 0.55}px, ${shiftY * 0.55}px, 28px)`,
          }}
        />

        {/* Floating Parallax World Glass Chips */}
        <div
          className="ilms-world-glass absolute top-4 left-0 sm:-left-3 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-blue-900 dark:text-sky-200 text-xs font-bold whitespace-nowrap"
          style={{
            transform: `translate3d(${shiftX * 1.2}px, ${shiftY * 1.2}px, 50px)`,
          }}
        >
          <PoseIcon className="w-3.5 h-3.5 text-blue-600 dark:text-sky-300" />
          <span>{floatingTagTop}</span>
        </div>

        <div
          className="absolute bottom-5 right-0 sm:-right-3 z-30 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-sky-300 dark:to-cyan-200 text-white dark:text-slate-950 text-xs font-bold shadow-[0_12px_28px_-8px_rgba(37,99,235,0.7)] dark:shadow-[0_12px_28px_-8px_rgba(56,189,248,0.65)] whitespace-nowrap"
          style={{
            transform: `translate3d(${-shiftX * 1.1}px, ${-shiftY * 1.1}px, 55px)`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-900 animate-ping" />
          <span>{floatingTagBottom}</span>
        </div>
      </div>

      {/* Interactive Socratic Speech Bubble Below Mascot */}
      <div className="mt-1 w-full flex justify-center px-2">
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
