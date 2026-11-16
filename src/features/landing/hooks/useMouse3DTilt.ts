'use client';

import { useState, useRef, useCallback } from 'react';
import type React from 'react';

export interface Tilt3DState {
  rotateX: number;
  rotateY: number;
  spotlightX: number;
  spotlightY: number;
  isHovered: boolean;
  isPressed: boolean;
  ripple: { x: number; y: number; id: number } | null;
}

export interface UseMouse3DTiltOptions {
  maxTilt?: number;
  scaleOnHover?: number;
}

export function useMouse3DTilt(options: UseMouse3DTiltOptions = {}) {
  const { maxTilt = 10, scaleOnHover = 1.015 } = options;
  const elementRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState<Tilt3DState>({
    rotateX: 0,
    rotateY: 0,
    spotlightX: 50,
    spotlightY: 50,
    isHovered: false,
    isPressed: false,
    ripple: null,
  });

  const updateFromClientCoords = useCallback(
    (clientX: number, clientY: number) => {
      const el = elementRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const relX = (clientX - rect.left) / rect.width;
      const relY = (clientY - rect.top) / rect.height;

      const clampedX = Math.max(0, Math.min(1, relX));
      const clampedY = Math.max(0, Math.min(1, relY));

      const rotateY = (clampedX - 0.5) * 2 * maxTilt;
      const rotateX = (0.5 - clampedY) * 2 * maxTilt;

      setState((prev) => ({
        ...prev,
        rotateX: Number(rotateX.toFixed(2)),
        rotateY: Number(rotateY.toFixed(2)),
        spotlightX: Math.round(clampedX * 100),
        spotlightY: Math.round(clampedY * 100),
        isHovered: true,
      }));
    },
    [maxTilt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateFromClientCoords(e.clientX, e.clientY);
    },
    [updateFromClientCoords]
  );

  const handleMouseLeave = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rotateX: 0,
      rotateY: 0,
      isHovered: false,
      isPressed: false,
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = elementRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setState((prev) => ({
      ...prev,
      isPressed: true,
      ripple: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        id: Date.now(),
      },
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setState((prev) => ({ ...prev, isPressed: false }));
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      if (!touch) return;
      const el = elementRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        setState((prev) => ({
          ...prev,
          isPressed: true,
          ripple: {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
            id: Date.now(),
          },
        }));
      }
      updateFromClientCoords(touch.clientX, touch.clientY);
    },
    [updateFromClientCoords]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      if (!touch) return;
      updateFromClientCoords(touch.clientX, touch.clientY);
    },
    [updateFromClientCoords]
  );

  const handleTouchEnd = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rotateX: 0,
      rotateY: 0,
      isHovered: false,
      isPressed: false,
    }));
  }, []);

  const currentScale = state.isPressed ? 0.985 : state.isHovered ? scaleOnHover : 1;

  const transformStyle: React.CSSProperties = {
    transform: `perspective(1100px) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg) scale3d(${currentScale}, ${currentScale}, 1)`,
    transition: state.isHovered
      ? 'transform 120ms cubic-bezier(0.22, 1, 0.36, 1)'
      : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
    transformStyle: 'preserve-3d',
  };

  return {
    elementRef,
    state,
    transformStyle,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
