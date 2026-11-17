'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, BrainCircuit, Compass, GraduationCap, Mail, Network, ShieldCheck, Sparkles } from 'lucide-react';
import { PublicHeader, PublicMinimalFooter } from '@/components/shared';

export function AboutPageView() {
  const t = useTranslations('about');

  const pillars = [
    {
      key: 'socratic',
      icon: BrainCircuit,
    },
    {
      key: 'graph',
      icon: Network,
    },
    {
      key: 'bloom',
      icon: GraduationCap,
    },
  ] as const;

  const valueKeys = ['active', 'clarity', 'privacy', 'simplicity'] as const;

  return (
    <div className="bg-[#f8fafd] dark:bg-[#131314] text-slate-900 dark:text-[#e3e3e3] antialiased min-h-screen flex flex-col transition-colors">
      <PublicHeader />

      <main className="w-full pt-28 pb-20 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16">
          {/* Hero Mission */}
          <section className="flex flex-col items-center text-center gap-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] text-xs font-medium text-blue-700 dark:text-[#a8c7fa]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('hero.chip')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl text-slate-900 dark:text-[#e3e3e3] leading-tight">
              {t('hero.title')}
            </h1>

            <p className="text-slate-600 dark:text-[#c4c7c5] text-sm sm:text-base max-w-2xl leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                prefetch={true}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#a8c7fa] dark:hover:bg-[#b9d5fb] dark:text-[#00325b] text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>{t('hero.primaryCta')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                prefetch={true}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-100 dark:bg-[#1e1f20] dark:hover:bg-[#282a2c] text-slate-800 dark:text-[#e3e3e3] border border-slate-200 dark:border-[#3c4043] text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>{t('hero.secondaryCta')}</span>
              </Link>
            </div>
          </section>

          {/* 3 Core Pillars */}
          <section className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#e3e3e3]">
                {t('pillars.title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#c4c7c5] mt-1.5">
                {t('pillars.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pillars.map(({ key, icon: Icon }) => (
                <div
                  key={key}
                  className="rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] p-6 flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#a8c7fa]/15 text-blue-600 dark:text-[#a8c7fa] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-[#e3e3e3]">
                    {t(`pillars.items.${key}.title`)}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#c4c7c5] leading-relaxed">
                    {t(`pillars.items.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Story & Core Values */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] p-6 sm:p-8 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-[#a8c7fa]">
                  <Compass className="w-4 h-4" />
                  <span>{t('story.badge')}</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#e3e3e3]">
                  {t('story.title')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-[#c4c7c5] leading-relaxed">
                  {t('story.paragraph1')}
                </p>
                <p className="text-sm text-slate-600 dark:text-[#c4c7c5] leading-relaxed">
                  {t('story.paragraph2')}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] p-6 sm:p-8 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#e3e3e3]">
                {t('values.title')}
              </h2>
              <ul className="flex flex-col gap-3.5">
                {valueKeys.map((key) => (
                  <li key={key} className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-[#e3e3e3]">
                      {t(`values.items.${key}.title`)}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-[#c4c7c5] leading-relaxed">
                      {t(`values.items.${key}.description`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Team & Contact */}
          <section className="rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-[#a8c7fa]">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('contact.badge')}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#e3e3e3]">
                {t('contact.title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#c4c7c5] leading-relaxed">
                {t('contact.description')}
              </p>
            </div>

            <a
              href="mailto:support@ilms.page"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#282a2c] dark:hover:bg-[#323639] text-slate-900 dark:text-[#e3e3e3] border border-slate-200 dark:border-[#3c4043] text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
            >
              <Mail className="w-4 h-4 text-blue-600 dark:text-[#a8c7fa]" />
              <span>support@ilms.page</span>
            </a>
          </section>
        </div>
      </main>

      {/* Minimal Footer */}
      <PublicMinimalFooter />
    </div>
  );
}
