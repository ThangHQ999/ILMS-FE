'use client';

import React from 'react';

export interface AtmosphericHorizonBackdropProps {
  scrollProgress: number;
}

/**
 * Full-bleed (100vw x 100vh) fixed atmospheric canvas inspired by spatial storytelling worlds,
 * crafted in ILMS's own "Luminous Socratic Observatory & Knowledge Cosmos" identity.
 * Adapts seamlessly between Daylight Academic Sky (Light Mode) and Starlit Observatory (Dark Mode).
 */
export function AtmosphericHorizonBackdrop({
  scrollProgress,
}: AtmosphericHorizonBackdropProps) {
  const depth = Math.max(0, Math.min(1, scrollProgress));

  return (
    <div
      aria-hidden="true"
      className="ilms-horizon-atmosphere"
      style={{ '--horizon-depth': depth.toFixed(3) } as React.CSSProperties}
    >
      {/* 1. Continuous Full-Viewport Sky / Cosmos Depth Gradient */}
      <div className="ilms-horizon-deep" />

      {/* 2. Upper Sunlit / Starlight Canopy (fades gently as user dives deeper) */}
      <div className="ilms-horizon-canopy" />

      {/* 3. Volumetric Light Rays streaming diagonally across 100vw */}
      <div className="ilms-horizon-rays">
        <span className="ilms-ray-1" />
        <span className="ilms-ray-2" />
        <span className="ilms-ray-3" />
        <span className="ilms-ray-4" />
        <span className="ilms-ray-5" />
      </div>

      {/* 4. Edge-Bleed Drifting Color Nebulae (eliminates empty side margins on wide screens) */}
      <div className="ilms-horizon-orb ilms-horizon-orb-cyan" />
      <div className="ilms-horizon-orb ilms-horizon-orb-indigo" />
      <div className="ilms-horizon-orb ilms-horizon-orb-gold" />

      {/* 5. Subtle Orbital Horizon Rings on Far Left & Far Right Edges */}
      <svg
        className="pointer-events-none absolute -left-36 top-[18vh] w-[420px] h-[420px] opacity-30 dark:opacity-25 text-sky-500 dark:text-sky-300"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle
          cx="200"
          cy="200"
          r="155"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="6 10"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="190"
          ry="72"
          transform="rotate(-24 200 200)"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
        <circle cx="322" cy="142" r="5" fill="currentColor" />
        <circle cx="95" cy="268" r="3.5" fill="currentColor" />
      </svg>

      <svg
        className="pointer-events-none absolute -right-40 top-[56vh] w-[460px] h-[460px] opacity-30 dark:opacity-25 text-indigo-500 dark:text-cyan-300"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle
          cx="200"
          cy="200"
          r="165"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 12"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="185"
          ry="64"
          transform="rotate(28 200 200)"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.55"
        />
        <circle cx="88" cy="148" r="4.5" fill="currentColor" />
      </svg>

      {/* 6. Deep Abyssal / Evening Transition & Bottom Horizon Dawn Glow */}
      <div className="ilms-horizon-abyss" />
      <div className="ilms-horizon-dawn" />
    </div>
  );
}
