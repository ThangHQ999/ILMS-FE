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
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] antialiased transition-colors">
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
