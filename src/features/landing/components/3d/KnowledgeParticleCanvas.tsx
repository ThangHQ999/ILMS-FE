'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import { KnowledgeParticleField } from './KnowledgeParticleField';

export interface KnowledgeParticleCanvasProps {
  scrollProgress: number;
  pointerNormalized: { x: number; y: number };
}

export function KnowledgeParticleCanvas({
  scrollProgress,
  pointerNormalized,
}: KnowledgeParticleCanvasProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [particleCount, setParticleCount] = useState(720);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const updateSize = () => {
      setParticleCount(window.innerWidth < 768 ? 400 : 960);
    };
    updateSize();
    window.addEventListener('resize', updateSize, { passive: true });
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (!mounted || reducedMotion) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <KnowledgeParticleField
          scrollProgress={scrollProgress}
          pointerNormalized={pointerNormalized}
          isDark={isDark}
          particleCount={particleCount}
        />
      </Canvas>
    </div>
  );
}
