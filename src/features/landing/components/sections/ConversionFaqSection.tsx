'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ChevronDown,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Rocket,
} from 'lucide-react';
import type { LandingFaqItem } from '../../types';
import { useSceneScrollVars } from '../../hooks/useSceneScrollVars';
import { TiltCard } from '../shared/TiltCard';

const FAQ_ITEMS: readonly LandingFaqItem[] = [
  {
    id: 'q1',
    questionKey: 'conversion.faqs.q1.q',
    answerKey: 'conversion.faqs.q1.a',
    categoryKey: 'conversion.faqs.q1.tag',
  },
  {
    id: 'q2',
    questionKey: 'conversion.faqs.q2.q',
    answerKey: 'conversion.faqs.q2.a',
    categoryKey: 'conversion.faqs.q2.tag',
  },
  {
    id: 'q3',
    questionKey: 'conversion.faqs.q3.q',
    answerKey: 'conversion.faqs.q3.a',
    categoryKey: 'conversion.faqs.q3.tag',
  },
  {
    id: 'q4',
    questionKey: 'conversion.faqs.q4.q',
    answerKey: 'conversion.faqs.q4.a',
    categoryKey: 'conversion.faqs.q4.tag',
  },
] as const;

export function ConversionFaqSection() {
  const t = useTranslations('landing.story');
  const [openFaqId, setOpenFaqId] = useState<string>('q1');
  const sectionRef = useRef<HTMLElement>(null);
  useSceneScrollVars(sectionRef);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? '' : id));
  };

  return (
    <section
      ref={sectionRef}
      id="ve-chung-toi"
      className="ilms-scroll-scene relative w-full py-20 lg:py-28 overflow-visible"
    >
      <div className="relative z-10 w-full max-w-[1560px] mx-auto px-5 sm:px-8 lg:px-14 xl:px-20">
        {/* Open Horizon Impact Ribbon (no boxy cards, floats directly in the horizon glow) */}
        <div className="ilms-world-glass rounded-3xl px-6 py-8 sm:px-10 sm:py-10 mb-20 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-300/40 dark:divide-sky-300/15">
          {[
            { value: '120K+', labelKey: 'conversion.stats.s1' },
            { value: '2.4M+', labelKey: 'conversion.stats.s2' },
            { value: '450+', labelKey: 'conversion.stats.s3' },
            { value: '99.4%', labelKey: 'conversion.stats.s4' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center pt-4 sm:pt-0 first:pt-0"
            >
              <div className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 dark:from-sky-200 dark:via-cyan-200 dark:to-indigo-200 bg-clip-text text-transparent tracking-tight">
                {stat.value}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-sky-100/85 mt-2">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive FAQ + Horizon Observatory VIP CTA Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT COLUMN: Interactive FAQ Accordion */}
          <div className="lg:col-span-7 space-y-4">
            <div className="ilms-world-glass inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-blue-900 dark:text-sky-200 text-xs font-bold">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-sky-300" />
              <span>{t('conversion.faqBadge')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {t('conversion.faqTitle')}
            </h2>

            <div className="space-y-3.5 pt-2">
              {FAQ_ITEMS.map((item) => {
                const isOpen = openFaqId === item.id;
                return (
                  <div
                    key={item.id}
                    className="ilms-world-glass rounded-3xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(item.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer focus:outline-none"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                        <span className="self-start px-3 py-0.5 rounded-full bg-blue-600/12 dark:bg-sky-400/20 text-blue-800 dark:text-sky-200 text-[11px] font-bold whitespace-nowrap">
                          {t(item.categoryKey)}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                          {t(item.questionKey)}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 dark:text-sky-200 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-blue-600 dark:text-sky-300' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-xs sm:text-sm text-slate-700 dark:text-sky-100/90 leading-relaxed font-medium">
                        {t(item.answerKey)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Horizon Launchpad Conversion Card with Cosmic Companion */}
          <div className="lg:col-span-5 relative">
            <TiltCard
              maxTilt={5}
              glowColor="rgba(56, 189, 248, 0.28)"
              className="ilms-world-glass-radiant p-7 sm:p-9"
            >
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-600/15 dark:bg-sky-400/20 text-blue-900 dark:text-sky-200 text-xs font-bold">
                  <Rocket className="w-3.5 h-3.5 text-blue-600 dark:text-sky-300" />
                  <span>{t('conversion.ctaBadge')}</span>
                </div>

                <img
                  src="/images/landing/companion-astro-owl.png"
                  alt=""
                  draggable={false}
                  className="ilms-zero-g-float w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_10px_20px_rgba(14,165,233,0.35)]"
                />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white leading-tight">
                {t('conversion.ctaTitle')}
              </h3>

              <p className="text-sm text-slate-700 dark:text-sky-100/90 mt-3 leading-relaxed font-medium">
                {t('conversion.ctaSub')}
              </p>

              <div className="mt-7 flex flex-col gap-3.5">
                <Link
                  href="/register"
                  prefetch={true}
                  className="group inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-200 dark:via-cyan-200 dark:to-indigo-200 text-white dark:text-slate-950 font-extrabold text-sm sm:text-base shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('conversion.ctaPrimaryBtn')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/pricing"
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-white/75 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs sm:text-sm transition-all active:scale-95 whitespace-nowrap"
                >
                  <span>{t('conversion.ctaSecondaryBtn')}</span>
                </Link>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-300/50 dark:border-sky-300/15 flex items-center gap-2 text-xs text-slate-700 dark:text-sky-200/85 font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-sky-300 shrink-0" />
                <span>{t('conversion.ctaGuarantee')}</span>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
