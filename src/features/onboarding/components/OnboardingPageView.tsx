'use client';

import React from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingLayoutSection } from './OnboardingLayoutSection';
import { OnboardingPersonaSection } from './OnboardingPersonaSection';
import { OnboardingColorSection } from './OnboardingColorSection';
import { OnboardingFontSection } from './OnboardingFontSection';
import { OnboardingFooter } from './OnboardingFooter';

export function OnboardingPageView() {
  const {
    layout,
    setLayout,
    persona,
    setPersona,
    themeMode,
    selectTheme,
    primaryColor,
    secondaryColor,
    tertiaryColor,
    neutralColor,
    selectColor,
    fontFamily,
    selectFont,
    toastMessage,
    isSubmitting,
    submitPreferences,
  } = useOnboarding();

  return (
    <div className="bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-[#F1F5F9] min-h-screen relative flex flex-col justify-between selection:bg-blue-600/20 selection:text-blue-600 dark:selection:bg-cyan-400/20 dark:selection:text-cyan-400">
      {/* Background Dots Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-15" />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="flex flex-col w-full items-center justify-center py-6 px-2 sm:px-4 relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-blue-500/10 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Main Onboarding Card Container */}
          <section className="w-full max-w-[960px] bg-white dark:bg-[#161D2F] rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-[0_24px_50px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col p-6 sm:p-8 md:p-10 transition-all">
            <OnboardingHeader />

            <div className="flex flex-col gap-8">
              <OnboardingLayoutSection
                layout={layout}
                onSelectLayout={setLayout}
              />

              <OnboardingPersonaSection
                persona={persona}
                onSelectPersona={setPersona}
              />

              <OnboardingColorSection
                themeMode={themeMode}
                onSelectTheme={selectTheme}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                tertiaryColor={tertiaryColor}
                neutralColor={neutralColor}
                onSelectColor={selectColor}
                fontFamily={fontFamily}
                persona={persona}
              />

              <OnboardingFontSection
                fontFamily={fontFamily}
                onSelectFont={selectFont}
              />
            </div>

            <OnboardingFooter
              isSubmitting={isSubmitting}
              onSubmit={submitPreferences}
              toastMessage={toastMessage}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
