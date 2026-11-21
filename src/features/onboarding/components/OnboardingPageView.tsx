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
    <div className="bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] min-h-screen relative flex flex-col justify-between">
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="flex flex-col w-full items-center justify-center py-6 px-2 sm:px-4 relative">
          {/* Main Onboarding Card Container */}
          <section className="w-full max-w-[960px] bg-white dark:bg-[#1E1F20] rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-none overflow-hidden flex flex-col p-6 sm:p-8 md:p-10 transition-all">
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
