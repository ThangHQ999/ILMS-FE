'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export function PricingFaq() {
  const t = useTranslations('pricing.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // We have 4 FAQ questions in the translation dictionary
  const items = [0, 1, 2, 3].map((idx) => ({
    q: t(`items.${idx}.q`),
    a: t(`items.${idx}.a`),
  }));

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="flex flex-col gap-4 pt-4 max-w-3xl mx-auto w-full">
      <div className="text-center flex flex-col items-center gap-1">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#e3e3e3]">
          {t('title')}
        </h2>
        <p className="text-xs text-slate-600 dark:text-[#c4c7c5]">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 w-full mt-2">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] overflow-hidden transition-colors"
            >
              <button
                onClick={() => handleToggle(index)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                type="button"
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-[#e3e3e3]">
                  {item.q}
                </span>
                <span
                  className={`material-symbols-outlined text-slate-400 dark:text-[#8e918f] transition-transform duration-200 text-[20px] shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-slate-600 dark:text-[#c4c7c5] text-xs leading-relaxed border-t border-slate-200 dark:border-[#3c4043] pt-3 animate-fadeIn">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
