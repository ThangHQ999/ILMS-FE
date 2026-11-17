'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, FileText, Mail, ShieldCheck } from 'lucide-react';
import { PublicHeader, PublicMinimalFooter } from '@/components/shared';

export type LegalDocumentVariant = 'terms' | 'privacy';

interface LegalDocumentViewProps {
  variant: LegalDocumentVariant;
}

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export function LegalDocumentView({ variant }: LegalDocumentViewProps) {
  const t = useTranslations(`legal.${variant}`);
  const tCommon = useTranslations('legal.common');

  const isTerms = variant === 'terms';
  const Icon = isTerms ? FileText : ShieldCheck;

  return (
    <div className="bg-[#f8fafd] dark:bg-[#131314] text-slate-900 dark:text-[#e3e3e3] antialiased min-h-screen flex flex-col transition-colors">
      <PublicHeader />

      <main className="w-full pt-28 pb-20 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          {/* Top Breadcrumb & Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-[#c4c7c5] dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{tCommon('backHome')}</span>
            </Link>

            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] text-xs font-medium">
              <Link
                href="/terms"
                className={`px-3.5 py-1.5 rounded-full transition-colors ${
                  isTerms
                    ? 'bg-white dark:bg-[#282a2c] text-slate-900 dark:text-[#e3e3e3] font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3]'
                }`}
              >
                {tCommon('termsTab')}
              </Link>
              <Link
                href="/privacy"
                className={`px-3.5 py-1.5 rounded-full transition-colors ${
                  !isTerms
                    ? 'bg-white dark:bg-[#282a2c] text-slate-900 dark:text-[#e3e3e3] font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-[#c4c7c5] hover:text-slate-900 dark:hover:text-[#e3e3e3]'
                }`}
              >
                {tCommon('privacyTab')}
              </Link>
            </div>
          </div>

          {/* Document Header */}
          <section className="rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] p-6 sm:p-8 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-slate-100 dark:bg-[#282a2c] border border-slate-200 dark:border-[#3c4043] text-xs font-medium text-blue-700 dark:text-[#a8c7fa]">
              <Icon className="w-3.5 h-3.5" />
              <span>{t('badge')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#e3e3e3]">
              {t('title')}
            </h1>

            <p className="text-sm text-slate-600 dark:text-[#c4c7c5] leading-relaxed">
              {t('summary')}
            </p>

            <div className="pt-2 border-t border-slate-200 dark:border-[#3c4043] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#8e918f]">
              <span>{t('updatedAt')}</span>
              <span>{tCommon('organization')}</span>
            </div>
          </section>

          {/* Quick Jump Nav */}
          <nav
            aria-label={tCommon('tocLabel')}
            className="flex flex-wrap items-center gap-2"
          >
            {SECTION_KEYS.map((key, index) => (
              <a
                key={key}
                href={`#${key}`}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 dark:bg-[#1e1f20] dark:hover:bg-[#282a2c] border border-slate-200 dark:border-[#3c4043] text-xs font-medium text-slate-700 dark:text-[#c4c7c5] transition-colors"
              >
                {index + 1}. {t(`sections.${key}.title`)}
              </a>
            ))}
          </nav>

          {/* Document Sections */}
          <div className="flex flex-col gap-4">
            {SECTION_KEYS.map((key, index) => (
              <section
                key={key}
                id={key}
                className="scroll-mt-24 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] p-6 sm:p-7 flex flex-col gap-2.5"
              >
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#e3e3e3]">
                  {index + 1}. {t(`sections.${key}.title`)}
                </h2>
                <p className="text-sm text-slate-600 dark:text-[#c4c7c5] leading-relaxed">
                  {t(`sections.${key}.body`)}
                </p>
              </section>
            ))}
          </div>

          {/* Contact Card */}
          <section className="rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#e3e3e3]">
                {tCommon('contactTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#c4c7c5]">
                {tCommon('contactDescription')}
              </p>
            </div>
            <a
              href="mailto:support@ilms.page"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#282a2c] dark:hover:bg-[#323639] text-slate-900 dark:text-[#e3e3e3] border border-slate-200 dark:border-[#3c4043] text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
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
