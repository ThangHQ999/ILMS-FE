'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { LandingRolePerspective } from '../types';
import { useScrollSectionProgress } from '../hooks/useScrollSectionProgress';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { ScrollConstellationRail } from './shared/ScrollConstellationRail';
import { AtmosphericHorizonBackdrop } from './shared/AtmosphericHorizonBackdrop';
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
    <div className="relative min-h-screen w-full text-slate-900 dark:text-[#EEF6FF] antialiased selection:bg-sky-400/30 selection:text-blue-950 dark:selection:text-white overflow-x-hidden">
      {/* Layer 0: Full-Bleed (100vw x 100vh) Living Horizon, Volumetric Light Rays & Drifting Nebulae */}
      <AtmosphericHorizonBackdrop scrollProgress={scrollProgress} />

      {/* Layer 1: Three.js WebGL Interactive Synaptic & Starlight Field */}
      <KnowledgeParticleCanvas
        scrollProgress={scrollProgress}
        pointerNormalized={pointerNormalized}
      />

      {/* Layer 2: Translucent Full-Bleed Horizon Header */}
      <LandingHeader />

      {/* Layer 3: Left-Edge Whisper Constellation Gauge */}
      <ScrollConstellationRail
        activeSceneIndex={activeSceneIndex}
        scrollProgress={scrollProgress}
        onSelectScene={scrollToScene}
      />

      {/* Layer 4: Continuous Full-Bleed 5-Scene Spatial Journey */}
      <main className="relative z-10 w-full pt-16">
        <LandingHeroSection
          role={role}
          onChangeRole={setRole}
          onExploreScene={scrollToScene}
        />

        <SocraticDialecticSection />

        <SmartClassroomSection role={role} />

        <BloomMasterySection />

        <ConversionFaqSection />
      </main>

      <div className="relative z-10">
        <LandingFooter />
      </div>
    </div>
  );
}
