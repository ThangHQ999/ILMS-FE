'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  RotateCcw,
  LayoutGrid,
  Bot,
  GripVertical,
  FileText,
  FileCode,
  Zap,
  Timer,
  CheckCircle,
  Network,
} from 'lucide-react';

export function LandingFeatures() {
  const t = useTranslations('landing.features');

  const handleReplayScroll = () => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach((el) => {
      el.classList.remove('reveal-visible');
    });
    setTimeout(() => {
      revealElements.forEach((el) => {
        el.classList.add('reveal-visible');
      });
    }, 100);
  };

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-800/80 transition-colors"
      id="tinh-nang-noi-bat"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 scroll-reveal reveal-delay-0 reveal-visible">
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/30 text-blue-700 dark:text-[#38BDF8] text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4" />
            <span>{t('badge')}</span>
          </div>

          <button
            type="button"
            id="replay-reveal-btn"
            onClick={handleReplayScroll}
            title={t('replayReveal')}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-[#38BDF8] bg-white dark:bg-[#161B26] px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-[#38BDF8] transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('replayReveal')}</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
          {t('title')}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: Bản đồ nhiệt tri thức (Span 2) */}
        <div className="group lg:col-span-2 bg-white dark:bg-[#131826] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-[#38BDF8]/50 shadow-sm dark:shadow-lg dark:shadow-black/40 hover:shadow-lg dark:hover:shadow-cyan-950/20 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-1 reveal-visible">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 dark:text-[#38BDF8] font-semibold mb-1">
                <LayoutGrid className="w-5 h-5" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('card1.title')}
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('card1.desc')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 dark:bg-[#161B26] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {t('card1.coverage')}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                {t('card1.gaps')}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/80 dark:bg-[#0A0E18]/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800/80">
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3">
              <span>{t('card1.timeline')}</span>
              <div className="flex items-center gap-1.5">
                <span>{t('card1.needSupport')}</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-400 dark:bg-rose-600" />
                <span className="w-2.5 h-2.5 rounded-xs bg-orange-400 dark:bg-orange-500" />
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 dark:bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-500" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-400" />
                <span>{t('card1.mastered')}</span>
              </div>
            </div>

            {/* Matrix Cells */}
            <div className="overflow-x-auto pb-1">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[540px]">
                {Array.from({ length: 112 }).map((_, idx) => {
                  const colors = [
                    'bg-rose-400 border-rose-300 dark:bg-rose-700/80 dark:border-rose-500/40',
                    'bg-orange-400 border-orange-300 dark:bg-orange-600/80 dark:border-orange-500/40',
                    'bg-amber-400 border-amber-300 dark:bg-amber-600/80 dark:border-amber-500/40',
                    'bg-emerald-400 border-emerald-300 dark:bg-emerald-600/80 dark:border-emerald-500/40',
                    'bg-emerald-500 border-emerald-400 dark:bg-emerald-500 dark:border-emerald-400/50',
                  ];
                  const pick =
                    idx % 7 === 0 || idx % 11 === 0
                      ? colors[0]
                      : idx % 5 === 0
                      ? colors[1]
                      : idx % 3 === 0
                      ? colors[2]
                      : idx % 2 === 0
                      ? colors[3]
                      : colors[4];

                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-xs border transition-transform duration-150 hover:scale-125 cursor-pointer ${pick}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: AI Socratic Tutor */}
        <div className="group bg-white dark:bg-[#131826] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-[#38BDF8]/50 shadow-sm dark:shadow-lg dark:shadow-black/40 hover:shadow-lg dark:hover:shadow-cyan-950/20 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-2 reveal-visible">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 text-blue-600 dark:text-[#38BDF8] font-semibold mb-1">
              <Bot className="w-5 h-5" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('card2.title')}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('card2.desc')}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#0A0E18]/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 transition-transform duration-300 ease-out group-hover:scale-[1.01]">
            <div className="self-end bg-blue-600 dark:bg-[#2563EB] text-white px-3.5 py-2 rounded-2xl rounded-tr-xs text-xs max-w-[85%] shadow-sm leading-relaxed border dark:border-blue-400/30">
              <p>{t('card2.studentQuestion')}</p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-[#38BDF8] text-blue-700 dark:text-slate-950 flex items-center justify-center shrink-0 shadow-xs text-xs font-bold transition-all duration-300 group-hover:ring-4 group-hover:ring-blue-100 dark:group-hover:ring-[#38BDF8]/30">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-[#161B26] p-3 rounded-2xl rounded-tl-xs border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 leading-relaxed shadow-xs">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-[#38BDF8] font-semibold text-[11px] mb-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t('card2.tutorRole')}</span>
                </div>
                <p>{t('card2.tutorAnswer')}</p>
                <div className="flex items-center gap-1 text-blue-600 dark:text-[#38BDF8] mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#38BDF8] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#38BDF8] animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#38BDF8] animate-pulse [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-400 ml-1 font-medium">
                    {t('card2.analyzing')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Tổ chức CMS/LMS */}
        <div className="group bg-white dark:bg-[#131826] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-[#38BDF8]/50 shadow-sm dark:shadow-lg dark:shadow-black/40 hover:shadow-lg dark:hover:shadow-cyan-950/20 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-3 reveal-visible">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 text-blue-600 dark:text-[#38BDF8] font-semibold mb-1">
              <GripVertical className="w-5 h-5" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('card3.title')}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('card3.desc')}
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-[#38BDF8]/60 hover:bg-blue-50/50 dark:hover:bg-[#262A35] transition-all cursor-grab hover:translate-x-1">
              <div className="flex items-center gap-2.5">
                <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {t('card3.course1')}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('card3.course1Sub')}
                  </span>
                </div>
              </div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-xs" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-[#38BDF8]/60 hover:bg-blue-50/50 dark:hover:bg-[#262A35] transition-all cursor-grab hover:translate-x-1">
              <div className="flex items-center gap-2.5">
                <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {t('card3.course2')}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('card3.course2Sub')}
                  </span>
                </div>
              </div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-[#38BDF8] shadow-xs" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-[#38BDF8]/60 hover:bg-blue-50/50 dark:hover:bg-[#262A35] transition-all cursor-grab hover:translate-x-1">
              <div className="flex items-center gap-2.5">
                <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {t('card3.course3')}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('card3.course3Sub')}
                  </span>
                </div>
              </div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </div>
        </div>

        {/* CARD 4: Phân tích file & Bóc tách thực thể */}
        <div className="group bg-white dark:bg-[#131826] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-[#38BDF8]/50 shadow-sm dark:shadow-lg dark:shadow-black/40 hover:shadow-lg dark:hover:shadow-cyan-950/20 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-4 reveal-visible">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/30 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('card4.title')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t('card4.desc')}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#161B26] rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t('card4.fileName')}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('card4.fileStatus')}
                  </span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                  <Network className="w-4 h-4 text-blue-600 dark:text-[#38BDF8]" />
                  <span>{t('card4.extractedHeading')}</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {t('card4.extractedAccuracy')}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#38BDF8]" />
                  {t('card4.tagRoot')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  {t('card4.tagFenwick')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-orange-400" />
                  {t('card4.tagLazy')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
                  {t('card4.tagQuery')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t('card4.matrixConnected')}</span>
            </div>
            <a href="#" className="text-blue-600 dark:text-[#38BDF8] hover:underline font-medium">
              {t('card4.changeDoc')}
            </a>
          </div>
        </div>

        {/* CARD 5: Auto-Quiz tự động hóa */}
        <div className="group bg-white dark:bg-[#131826] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-[#38BDF8]/50 shadow-sm dark:shadow-lg dark:shadow-black/40 hover:shadow-lg dark:hover:shadow-cyan-950/20 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-4 reveal-visible">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/30 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('card5.title')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t('card5.desc')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold">
                {t('card5.bloomRemember')}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold">
                {t('card5.bloomUnderstand')}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold">
                {t('card5.bloomApply')}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/40 text-blue-700 dark:text-[#38BDF8] text-[11px] font-semibold">
                {t('card5.bloomStandard')}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-[#161B26] rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-[#38BDF8]/20 border border-blue-200 dark:border-[#38BDF8]/30 flex items-center justify-center text-blue-700 dark:text-[#38BDF8] shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t('card5.quizMetric')}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('card5.quizSub')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-[#38BDF8] dark:to-[#2563EB] text-white dark:text-slate-950 font-bold text-sm sm:text-base shadow-md dark:shadow-lg shadow-blue-600/20 dark:shadow-cyan-500/20 hover:shadow-blue-600/35 dark:hover:shadow-cyan-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5" />
              <span>{t('card5.btnGenerate')}</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
              <Timer className="w-4 h-4 text-blue-600 dark:text-[#38BDF8]" />
              <span>{t('card5.btnGenerateSub')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
