'use client';

import React, { useState } from 'react';
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

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? '' : id));
  };

  return (
    <section
      id="ve-chung-toi"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
    >
      {/* Top 4 Impact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
        {[
          { value: '120K+', labelKey: 'conversion.stats.s1' },
          { value: '2.4M+', labelKey: 'conversion.stats.s2' },
          { value: '450+', labelKey: 'conversion.stats.s3' },
          { value: '99.4%', labelKey: 'conversion.stats.s4' },
        ].map((stat, idx) => (
          <TiltCard
            key={idx}
            maxTilt={7}
            className="bg-white/95 dark:bg-[#1E1F20]/95 p-6 text-center shadow-lg shadow-blue-950/5 dark:shadow-black/25"
          >
            <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1.5">
              {t(stat.labelKey)}
            </p>
          </TiltCard>
        ))}
      </div>

      {/* Interactive FAQ + VIP CTA Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* LEFT COLUMN: Interactive FAQ Accordion */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 text-xs font-bold">
            <HelpCircle className="w-4 h-4" />
            <span>{t('conversion.faqBadge')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('conversion.faqTitle')}
          </h2>

          <div className="space-y-3 pt-2">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white/95 dark:bg-[#1E1F20]/95 overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer focus:outline-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="self-start px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 text-[11px] font-bold whitespace-nowrap">
                        {t(item.categoryKey)}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {t(item.questionKey)}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600 dark:text-sky-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t(item.answerKey)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Cyber-Academic VIP Conversion Card */}
        <div className="lg:col-span-5">
          <TiltCard
            maxTilt={6}
            glowColor="rgba(56, 189, 248, 0.25)"
            className="bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white p-7 sm:p-9 shadow-2xl shadow-blue-600/20"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-200 text-xs font-bold mb-5">
              <Rocket className="w-3.5 h-3.5" />
              <span>{t('conversion.ctaBadge')}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              {t('conversion.ctaTitle')}
            </h3>

            <p className="text-sm text-blue-100/90 mt-3 leading-relaxed">
              {t('conversion.ctaSub')}
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <Link
                href="/register"
                prefetch={true}
                className="group inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-white hover:bg-sky-50 text-blue-900 font-extrabold text-sm sm:text-base transition-all active:scale-95 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>{t('conversion.ctaPrimaryBtn')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/pricing"
                prefetch={true}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 whitespace-nowrap"
              >
                <span>{t('conversion.ctaSecondaryBtn')}</span>
              </Link>
            </div>

            <div className="mt-6 pt-5 border-t border-white/15 flex items-center gap-2 text-xs text-blue-100/80">
              <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
              <span>{t('conversion.ctaGuarantee')}</span>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
