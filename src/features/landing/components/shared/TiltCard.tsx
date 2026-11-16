'use client';

import React from 'react';
import { useMouse3DTilt } from '../../hooks/useMouse3DTilt';

export interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scaleOnHover?: number;
  glowColor?: string;
  onClick?: () => void;
  id?: string;
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  scaleOnHover = 1.015,
  glowColor = 'rgba(56, 189, 248, 0.16)',
  onClick,
  id,
}: TiltCardProps) {
  const { elementRef, state, transformStyle, handlers } = useMouse3DTilt({
    maxTilt,
    scaleOnHover,
  });

  return (
    <div
      id={id}
      ref={elementRef}
      style={transformStyle}
      onClick={onClick}
      {...handlers}
      className={`relative overflow-hidden rounded-3xl transition-shadow duration-300 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Dynamic Cursor / Touch Spotlight Reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: state.isHovered ? 1 : 0,
          background: `radial-gradient(480px circle at ${state.spotlightX}% ${state.spotlightY}%, ${glowColor}, transparent 68%)`,
        }}
      />

      {/* Tactile Click / Tap Ripple Effect */}
      {state.ripple && (
        <span
          key={state.ripple.id}
          aria-hidden="true"
          className="pointer-events-none absolute z-20 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/25 dark:bg-sky-300/20 animate-ping"
          style={{
            left: state.ripple.x,
            top: state.ripple.y,
            animationDuration: '650ms',
          }}
        />
      )}

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
