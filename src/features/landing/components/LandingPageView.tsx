'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { LandingRolePerspective } from '../types';
import { useScrollSectionProgress } from '../hooks/useScrollSectionProgress';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { LandingTechStack } from './LandingTechStack';
import { ScrollConstellationRail } from './shared/ScrollConstellationRail';
import { LandingHeroSection } from './sections/LandingHeroSection';
import { SocraticDialecticSection } from './sections/SocraticDialecticSection';
import { SmartClassroomSection } from './sections/SmartClassroomSection';
import { BloomMasterySection } from './sections/BloomMasterySection';
import { ConversionFaqSection } from './sections/ConversionFaqSection';

const KnowledgeParticleCanvas = dynamic(
  () =>
    import('./3d/KnowledgeParticleCanvas').then(
      (mod) => mod.KnowledgeParticleCanvas
    ),
  { ssr: false }
);

export function LandingPageView() {
  const [role, setRole] = useState<LandingRolePerspective>('student');
  const {
    scrollProgress,
    activeSceneIndex,
    pointerNormalized,
    scrollToScene,
  } = useScrollSectionProgress();

  return (
    <div className="relative min-h-screen bg-[#E8EEF5] dark:bg-[#0D1117] text-slate-900 dark:text-[#E3E3E3] antialiased transition-colors overflow-x-hidden">
      {/* Ambient Cyber-Academic Background Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 w-[520px] h-[520px] rounded-full bg-blue-500/10 dark:bg-sky-500/12 blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-[460px] h-[460px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/12 blur-[120px]" />
      </div>

      {/* Layer 1: Three.js WebGL Interactive Particle Universe */}
      <KnowledgeParticleCanvas
        scrollProgress={scrollProgress}
        pointerNormalized={pointerNormalized}
      />

      {/* Sticky Glassmorphic Navigation Header */}
      <LandingHeader />

      {/* Constellation Station Progress Rail */}
      <ScrollConstellationRail
        activeSceneIndex={activeSceneIndex}
        scrollProgress={scrollProgress}
        onSelectScene={scrollToScene}
      />

      {/* Main 5-Scene Interactive Storytelling Journey */}
      <main className="relative z-10 w-full pt-16">
        <LandingHeroSection
          role={role}
          onChangeRole={setRole}
          onExploreScene={scrollToScene}
        />

        <SocraticDialecticSection />

        <SmartClassroomSection role={role} />

        <BloomMasterySection />

        {/* <LandingTechStack /> */}

        <ConversionFaqSection />
      </main>

      <div className="relative z-10">
        <LandingFooter />
      </div>
    </div>
  );
}
