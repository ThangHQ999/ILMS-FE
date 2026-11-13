'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function TeacherAiInsightsCard() {
  const t = useTranslations('dashboard.teacher');

  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-6 border-none shadow-sm dark:shadow-none ring-0 outline-none">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-[#282A2C] flex items-center justify-center text-[#7F70FB] dark:text-[#D0BCFF] shrink-0 border-none shadow-none ring-0 outline-none">
            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] tracking-tight font-sans">
              {t('aiInsightsTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] mt-0.5 font-sans">
              {t('aiInsightsSub')}
            </p>
          </div>
        </div>

        {/* Unboxed Alerts List */}
        <div className="flex flex-col">
          {/* Alert 1: Cảnh báo chuyên cần (Destructive Tone) */}
          <div className="flex flex-col gap-1 pb-6 border-b border-gray-100 dark:border-[#282A2C]">
            <div className="flex items-center justify-between">
              <span className="bg-[#FFDAD6] text-[#BA1A1A] dark:bg-[#3C1919] dark:text-[#F28B82] px-3 py-1 rounded-full text-xs font-medium border-none inline-flex items-center gap-1.5 font-sans">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {t('attendanceWarningTag')}
              </span>
              <span className="text-gray-500 dark:text-[#8E918F] text-xs font-mono font-medium">Lớp CS-202</span>
            </div>

            <h3 className="text-lg font-medium text-gray-900 dark:text-[#E3E3E3] leading-snug mt-3 mb-2 font-sans">
              {t('attendanceWarningTitle')}
            </h3>

            <p className="text-sm text-gray-600 dark:text-[#C4C7C5] leading-relaxed font-sans">
              {t('attendanceWarningDesc')}
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                className="bg-[#FFDAD6] hover:bg-[#FFCDD2] text-[#BA1A1A] dark:bg-[#3C1919] dark:hover:bg-[#4D2020] dark:text-[#F28B82] px-4 py-2 rounded-full text-sm font-medium transition-colors border-none cursor-pointer font-sans"
              >
                {t('sendEmailWarning')}
              </button>
              <button
                type="button"
                className="text-[#0B57D0] hover:bg-gray-100 dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-4 py-2 rounded-full text-sm font-medium transition-colors border-none bg-transparent cursor-pointer font-sans"
              >
                {t('viewDetail')}
              </button>
            </div>
          </div>

          {/* Alert 2: Lỗ hổng tri thức (Warning Tone) */}
          <div className="flex flex-col gap-1 pt-6">
            <div className="flex items-center justify-between">
              <span className="bg-[#FFF4E5] text-[#B06000] dark:bg-[#3C2A1E] dark:text-[#FFB784] px-3 py-1 rounded-full text-xs font-medium border-none inline-flex items-center gap-1.5 font-sans">
                <span className="material-symbols-outlined text-[14px]">hub</span>
                {t('knowledgeGapTag')}
              </span>
              <span className="text-gray-500 dark:text-[#8E918F] text-xs font-mono font-medium">Graph RAG</span>
            </div>

            <h3 className="text-lg font-medium text-gray-900 dark:text-[#E3E3E3] leading-snug mt-3 mb-2 font-sans">
              {t('knowledgeGapTitle')}
            </h3>

            <p className="text-sm text-gray-600 dark:text-[#C4C7C5] leading-relaxed font-sans">
              {t('knowledgeGapDesc')}
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                className="bg-[#FFF4E5] hover:bg-[#FFE0B2] text-[#B06000] dark:bg-[#3C2A1E] dark:hover:bg-[#4D3627] dark:text-[#FFB784] px-4 py-2 rounded-full text-sm font-medium transition-colors border-none cursor-pointer font-sans"
              >
                {t('createAiRemedial')}
              </button>
              <Link
                href="/knowledge-graph"
                className="text-[#0B57D0] hover:bg-gray-100 dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-4 py-2 rounded-full text-sm font-medium transition-colors border-none bg-transparent font-sans inline-flex items-center"
              >
                {t('openKnowledgeGraph')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center border-none shadow-none ring-0 outline-none">
        <span className="text-xs text-gray-500 dark:text-[#8E918F] font-medium font-sans">
          {t('geminiSyncNote')}
        </span>
      </div>
    </div>
  );
}
