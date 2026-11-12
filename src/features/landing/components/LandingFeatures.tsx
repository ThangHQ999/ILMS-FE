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
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-none transition-colors"
      id="tinh-nang-noi-bat"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 scroll-reveal reveal-delay-0 reveal-visible">
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs font-medium border-none shadow-none">
            <Sparkles className="w-4 h-4" />
            <span>{t('badge')}</span>
          </div>

          <button
            type="button"
            id="replay-reveal-btn"
            onClick={handleReplayScroll}
            title={t('replayReveal')}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#1E1F20] dark:hover:bg-[#282A2C] px-3 py-1.5 rounded-full border-none shadow-none transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('replayReveal')}</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight mb-4">
          {t('title')}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-[#C4C7C5] leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: Bản đồ nhiệt tri thức (Span 2) */}
        <div className="group lg:col-span-2 bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 border-none shadow-none transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-1 reveal-visible">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[#0B57D0] dark:text-[#A8C7FA] font-semibold mb-1">
                <LayoutGrid className="w-5 h-5" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('card1.title')}
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-[#C4C7C5]">
                {t('card1.desc')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-1.5 rounded-full border-none text-xs">
              <span className="text-slate-600 dark:text-[#C4C7C5] font-medium">
                {t('card1.coverage')}
              </span>
              <span className="text-slate-300 dark:text-[#8E918F]">•</span>
              <span className="text-rose-600 dark:text-[#F28B82] font-medium">
                {t('card1.gaps')}
              </span>
            </div>
          </div>

          <div className="bg-[#F0F4F9] dark:bg-[#131314] rounded-2xl p-4 sm:p-5 border-none">
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-[#C4C7C5] font-medium mb-3">
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
                    'bg-rose-400 border-none',
                    'bg-orange-400 border-none',
                    'bg-amber-400 border-none',
                    'bg-emerald-400 border-none',
                    'bg-emerald-500 border-none',
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
                      className={`w-4 h-4 rounded-xs transition-transform duration-150 hover:scale-125 cursor-pointer ${pick}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: AI Socratic Tutor */}
        <div className="group bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 border-none shadow-none transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-2 reveal-visible">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 text-[#0B57D0] dark:text-[#A8C7FA] font-semibold mb-1">
              <Bot className="w-5 h-5" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3]">
                {t('card2.title')}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-[#C4C7C5]">
              {t('card2.desc')}
            </p>
          </div>

          <div className="bg-[#F0F4F9] dark:bg-[#131314] rounded-2xl p-4 border-none flex flex-col gap-3">
            <div className="self-end bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] px-4 py-2.5 rounded-3xl text-xs max-w-[85%] border-none shadow-none leading-relaxed">
              <p>{t('card2.studentQuestion')}</p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center shrink-0 border-none text-xs font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-[#1E1F20] p-3.5 rounded-3xl border-none text-xs text-slate-700 dark:text-[#E3E3E3] leading-relaxed shadow-none">
                <div className="flex items-center gap-1.5 text-[#0B57D0] dark:text-[#A8C7FA] font-semibold text-[11px] mb-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t('card2.tutorRole')}</span>
                </div>
                <p>{t('card2.tutorAnswer')}</p>
                <div className="flex items-center gap-1 text-[#0B57D0] dark:text-[#A8C7FA] mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-400 ml-1 font-medium">
                    {t('card2.analyzing')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Tổ chức CMS/LMS */}
        <div className="group bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 border-none shadow-none transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-3 reveal-visible">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 text-[#0B57D0] dark:text-[#A8C7FA] font-semibold mb-1">
              <GripVertical className="w-5 h-5" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3]">
                {t('card3.title')}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-[#C4C7C5]">
              {t('card3.desc')}
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none hover:bg-[#E1E5EA] dark:hover:bg-[#333537] transition-all cursor-grab hover:translate-x-1">
              <div className="flex items-center gap-2.5">
                <GripVertical className="w-4 h-4 text-slate-400 dark:text-[#8E918F]" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-[#E3E3E3] line-clamp-1">
                    {t('card3.course1')}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                    {t('card3.course1Sub')}
                  </span>
                </div>
              </div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0D652D] dark:bg-[#81C995]" />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none hover:bg-[#E1E5EA] dark:hover:bg-[#333537] transition-all cursor-grab hover:translate-x-1">
              <div className="flex items-center gap-2.5">
                <GripVertical className="w-4 h-4 text-slate-400 dark:text-[#8E918F]" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-[#E3E3E3] line-clamp-1">
                    {t('card3.course2')}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                    {t('card3.course2Sub')}
                  </span>
                </div>
              </div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none hover:bg-[#E1E5EA] dark:hover:bg-[#333537] transition-all cursor-grab hover:translate-x-1">
              <div className="flex items-center gap-2.5">
                <GripVertical className="w-4 h-4 text-slate-400 dark:text-[#8E918F]" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-[#E3E3E3] line-clamp-1">
                    {t('card3.course3')}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                    {t('card3.course3Sub')}
                  </span>
                </div>
              </div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </div>
        </div>

        {/* CARD 4: Phân tích file & Bóc tách thực thể */}
        <div className="group bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 border-none shadow-none transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-4 reveal-visible">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('card4.title')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-[#C4C7C5] mt-1">
                  {t('card4.desc')}
                </p>
              </div>
            </div>

            <div className="bg-[#F0F4F9] dark:bg-[#282A2C] rounded-2xl p-3.5 border-none flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-[#E3E3E3]">
                    {t('card4.fileName')}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                    {t('card4.fileStatus')}
                  </span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-[#E3E3E3] font-medium">
                  <Network className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                  <span>{t('card4.extractedHeading')}</span>
                </div>
                <span className="text-[#0D652D] dark:text-[#81C995] font-semibold">
                  {t('card4.extractedAccuracy')}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-[11px] font-medium text-slate-700 dark:text-[#E3E3E3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
                  {t('card4.tagRoot')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-[11px] font-medium text-slate-700 dark:text-[#E3E3E3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D652D] dark:bg-[#81C995]" />
                  {t('card4.tagFenwick')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-[11px] font-medium text-slate-700 dark:text-[#E3E3E3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B58500] dark:bg-[#FFB784]" />
                  {t('card4.tagLazy')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-[11px] font-medium text-slate-700 dark:text-[#E3E3E3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
                  {t('card4.tagQuery')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-none flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-[#0D652D] dark:text-[#81C995] font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t('card4.matrixConnected')}</span>
            </div>
            <a href="#" className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline font-medium">
              {t('card4.changeDoc')}
            </a>
          </div>
        </div>

        {/* CARD 5: Auto-Quiz tự động hóa */}
        <div className="group bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-8 border-none shadow-none transition-all duration-300 ease-out flex flex-col justify-between scroll-reveal reveal-delay-4 reveal-visible">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3]">
                  {t('card5.title')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-[#C4C7C5] mt-1">
                  {t('card5.desc')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-700 dark:text-[#E3E3E3] text-[11px] font-medium">
                {t('card5.bloomRemember')}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-700 dark:text-[#E3E3E3] text-[11px] font-medium">
                {t('card5.bloomUnderstand')}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-700 dark:text-[#E3E3E3] text-[11px] font-medium">
                {t('card5.bloomApply')}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] border-none text-[11px] font-medium">
                {t('card5.bloomStandard')}
              </span>
            </div>

            <div className="bg-[#F0F4F9] dark:bg-[#282A2C] rounded-2xl p-3.5 border-none flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-[#E3E3E3]">
                  {t('card5.quizMetric')}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-[#C4C7C5]">
                  {t('card5.quizSub')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              className="w-full px-6 py-3.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium text-sm sm:text-base border-none shadow-none transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-5 h-5" />
              <span>{t('card5.btnGenerate')}</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-[#C4C7C5] text-xs font-medium">
              <Timer className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
              <span>{t('card5.btnGenerateSub')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
