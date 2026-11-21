'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function LandingTechStack() {
  const t = useTranslations('landing.techStack');

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-none transition-colors"
      id="cong-nghe-doi-tac"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#C4C7C5] tracking-wider uppercase font-semibold">
          {t('title')}
        </p>

        <div className="flex items-center justify-center flex-wrap gap-8 sm:gap-12 md:gap-16 lg:gap-20 mt-8 text-slate-600 dark:text-[#C4C7C5] hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
          {/* Neo4j */}
          <div
            className="flex items-center gap-2.5 cursor-default hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors"
            title="Neo4j Graph Database"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm3.66 14.77a2.12 2.12 0 1 1 0-3 2.13 2.13 0 0 1 0 3zm-7.32 0a2.12 2.12 0 1 1 0-3 2.13 2.13 0 0 1 0 3zm3.66-6.35a2.12 2.12 0 1 1 0-3 2.12 2.12 0 0 1 0 3z" />
              <path
                d="m13.2 11.2 1.6 2.3m-4.4 0 1.6-2.3"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
            <span className="font-bold text-base tracking-tight">Neo4j</span>
          </div>

          {/* OpenAI */}
          <div
            className="flex items-center gap-2.5 cursor-default hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors"
            title="OpenAI"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.28 9.94a5.96 5.96 0 0 0-.52-4.91 6.04 6.04 0 0 0-6.52-2.82 5.95 5.95 0 0 0-4.49-2 6.02 6.02 0 0 0-5.74 4.18 5.96 5.96 0 0 0-4.04 2.92 6.04 6.04 0 0 0 .78 7.1 5.96 5.96 0 0 0 .52 4.91 6.04 6.04 0 0 0 6.52 2.82 5.97 5.97 0 0 0 4.49 2 6.02 6.02 0 0 0 5.74-4.18 5.96 5.96 0 0 0 4.04-2.92 6.04 6.04 0 0 0-.78-7.1zm-8.87 11.83a4.49 4.49 0 0 1-2.92-1.07l.15-.08 4.83-2.79a.78.78 0 0 0 .39-.68v-6.8l2.04 1.18v6.79a4.52 4.52 0 0 1-4.49 3.45zm-8.48-4.03a4.5 4.5 0 0 1-.54-3.07l.15.09 4.83 2.79a.77.77 0 0 0 .78 0l5.89-3.4v2.36l-5.88 3.4a4.52 4.52 0 0 1-5.23-2.17zm-1.5-9.35a4.49 4.49 0 0 1 2.38-1.99v.18l4.83 2.79a.78.78 0 0 0 .78 0l5.89-3.4-2.04-1.18-5.88 3.4a4.52 4.52 0 0 1-5.96.2zm15.14 5.37-5.89-3.4 2.04-1.18 5.88 3.4a4.52 4.52 0 0 1 .74 6.32l-.15-.09-4.83-2.79a.78.78 0 0 0-.79 0v-2.26zm2.04-3.87-.15-.09-4.83-2.79a.78.78 0 0 0-.78 0l-5.89 3.4v-2.36l5.88-3.4a4.52 4.52 0 0 1 5.77 5.24zm-10.42 2.6 2.35-1.36 2.35 1.36v2.72l-2.35 1.36-2.35-1.36z" />
            </svg>
            <span className="font-bold text-base tracking-tight">OpenAI</span>
          </div>

          {/* Spring Boot */}
          <div
            className="flex items-center gap-2.5 cursor-default hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors"
            title="Spring Boot"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.93 10.12C20.45 4.7 15.65 1.05 10.05 2.13 4.54 3.2 0.7 7.95 1.77 13.56c.86 4.49 4.42 7.9 8.97 8.36 5.61.57 10.64-3.32 11.45-8.87.13-.9-.63-1.63-1.53-1.46-2.12.39-3.95-.53-5.06-2.26-1.07-1.66-1-3.66.19-5.3.52-.72.03-1.74-.83-1.79-2.34-.14-4.52 1.25-5.32 3.39-.83 2.22-.05 4.73 1.95 6.07 1.48.99 3.41 1.08 4.96.23.46-.25 1.03-.02 1.23.46.2.48-.03 1.03-.49 1.29-2.16 1.18-4.85 1.06-6.9-.31-2.77-1.85-3.85-5.33-2.7-8.41 1.1-2.95 4.12-4.87 7.35-4.68-.88 2.05-.72 4.42.43 6.22 1.39 2.18 3.73 3.35 6.45 2.85.91-.17 1.67.57 1.54 1.46-.72 4.92-5.18 8.38-10.15 7.88-4.04-.41-7.2-3.44-7.97-7.43-.95-4.98 2.47-9.21 7.36-10.16 4.98-.96 9.25 2.28 10.57 7.08.24.87 1.2 1.19 1.83.6z" />
            </svg>
            <span className="font-bold text-base tracking-tight">Spring Boot</span>
          </div>

          {/* Next.js */}
          <div
            className="flex items-center gap-2.5 cursor-default hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors"
            title="Next.js"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10zm4.5 14.25-5.25-6.8v6.8H9.5V7.75h1.75l5.25 6.8v-6.8h1.75v8.7h-1.75z" />
            </svg>
            <span className="font-bold text-base tracking-tight">Next.js</span>
          </div>

          {/* MySQL */}
          <div
            className="flex items-center gap-2.5 cursor-default hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors"
            title="MySQL"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3c-4.97 0-9 1.79-9 4v10c0 2.21 4.03 4 9 4s9-1.79 9-4V7c0-2.21-4.03-4-9-4zm0 2c3.87 0 7 1.34 7 2s-3.13 2-7 2-7-1.34-7-2 3.13-2 7-2zm-7 4.54C6.27 10.3 8.94 11 12 11s5.73-.7 7-1.46V12c0 .66-3.13 2-7 2s-7-1.34-7-2V9.54zm0 5C6.27 15.3 8.94 16 12 16s5.73-.7 7-1.46V17c0 .66-3.13 2-7 2s-7-1.34-7-2v-2.46z" />
            </svg>
            <span className="font-bold text-base tracking-tight">MySQL</span>
          </div>
        </div>
      </div>
    </section>
  );
}
