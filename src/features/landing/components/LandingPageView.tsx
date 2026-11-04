'use client';

import React, { useEffect } from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingTechStack } from './LandingTechStack';
import { LandingFooter } from './LandingFooter';

export function LandingPageView() {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          threshold: 0.15,
          rootMargin: '0px 0px -40px 0px',
        }
      );

      revealElements.forEach((el) => observer.observe(el));

      return () => {
        observer.disconnect();
      };
    } else {
      revealElements.forEach((el) => el.classList.add('reveal-visible'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f6fafe] dark:bg-[#0B0F19] text-slate-800 dark:text-[#F1F5F9] antialiased selection:bg-blue-600/15 selection:text-blue-700 dark:selection:bg-[#38BDF8]/20 dark:selection:text-[#38BDF8] transition-colors">
      <LandingHeader />
      <main className="w-full pt-16">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTechStack />
      </main>
      <LandingFooter />
    </div>
  );
}
