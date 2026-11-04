'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ErrorPageHeader } from './ErrorPageHeader';
import { ErrorPageFooter } from './ErrorPageFooter';

export function NotFoundView() {
  const t = useTranslations('errors');
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global shortcut for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      searchInputRef.current?.focus();
      return;
    }
    setIsSearching(true);
    setSearchFeedback(t('searchingNodes'));

    setTimeout(() => {
      setIsSearching(false);
      setSearchFeedback(t('foundMatches', { query: searchQuery.trim() }));
      setTimeout(() => {
        router.push(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
      }, 1200);
    }, 800);
  };

  const handleCubeClick = () => {
    setIsAiModalOpen(true);
  };

  return (
    <div className="bg-[#f6fafe] dark:bg-[#070A10] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col justify-between font-sans transition-colors">
      {/* 1. Header with Adaptive Auth state */}
      <ErrorPageHeader currentPage="404" />

      {/* 2. Main 404 Stage */}
      <main className="w-full flex-1 pt-16 relative overflow-hidden">
        {/* Dynamic Ambient Glow & Grid Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-500/15 dark:bg-blue-600/10 rounded-full blur-[130px]" />
          <div className="absolute bottom-10 right-1/4 w-[420px] h-[420px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[110px]" />

          {/* Circuit grid lines watermark SVG */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.035] dark:opacity-[0.05] text-slate-900 dark:text-white"
            height="100%"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern height="64" id="circuit-grid" patternUnits="userSpaceOnUse" width="64">
                <path d="M64 0H0v64" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="64" cy="0" fill="currentColor" r="2.5" />
                <circle cx="0" cy="64" fill="currentColor" r="2.5" />
                <path
                  d="M0 32h16l8-8h16l8 8h16"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="2 3"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect fill="url(#circuit-grid)" height="100%" width="100%" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-12 py-12 flex flex-col items-center">
          {/* Top System Diagnostic Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-sm border border-slate-200/80 dark:border-slate-800 mb-6 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400 font-medium">
              Node 404: Disconnected
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              {t('diagnosticLabel')}
            </span>
          </div>

          {/* Centerpiece Hero: 404 Futuristic Kinetic Typography */}
          <div className="w-full flex flex-col items-center justify-center my-4 select-none">
            <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-14">
              {/* Digit 4 Left */}
              <span className="text-[96px] sm:text-[140px] md:text-[180px] lg:text-[210px] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-blue-600 dark:from-white dark:via-slate-200 dark:to-blue-400 drop-shadow-[0_4px_16px_rgba(0,89,187,0.12)]">
                4
              </span>

              {/* Digit '0' Transformed into Isometric Knowledge Cube / Graph Hub */}
              <div
                onClick={handleCubeClick}
                className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 flex items-center justify-center group cursor-pointer"
                title="Nhấp để dò tín hiệu đồ thị AI"
              >
                {/* Outer Pulsing Orbit Ring */}
                <div
                  className="absolute inset-0 rounded-full border border-blue-500/20 dark:border-blue-400/20 animate-spin pointer-events-none"
                  style={{ animationDuration: '26s' }}
                />
                <div
                  className="absolute inset-2 sm:inset-4 rounded-full border border-dashed border-blue-500/30 dark:border-blue-400/30 animate-spin pointer-events-none"
                  style={{ animationDuration: '18s', animationDirection: 'reverse' }}
                />

                {/* Orbital Break Dots */}
                <div className="absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(0,112,234,0.8)] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div className="absolute bottom-2 -left-2 w-3 h-3 rounded-full bg-indigo-900 shadow-[0_0_10px_rgba(22,0,102,0.4)]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

                {/* Isometric 3D Knowledge Cube Visual */}
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 transition-transform duration-500 ease-out group-hover:scale-110">
                  <svg
                    className="w-full h-full drop-shadow-[0_12px_28px_rgba(0,89,187,0.22)]"
                    fill="none"
                    viewBox="0 0 200 220"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Top Face */}
                    <polygon fill="#0070ea" opacity="0.92" points="100,15 180,62 100,108 20,62" />
                    {/* Right Face */}
                    <polygon fill="#004493" points="100,108 180,62 180,155 100,202" />
                    {/* Left Face */}
                    <polygon fill="#160066" points="20,62 100,108 100,202 20,155" />

                    {/* Knowledge Graph Network Overlays */}
                    <line
                      opacity="0.8"
                      stroke="#ffffff"
                      strokeDasharray="4 3"
                      strokeWidth="1.8"
                      x1="100"
                      x2="100"
                      y1="15"
                      y2="108"
                    />
                    <line opacity="0.65" stroke="#ffffff" strokeWidth="1.8" x1="20" x2="180" y1="62" y2="62" />
                    <line opacity="0.5" stroke="#ffffff" strokeWidth="1.4" x1="60" x2="140" y1="38.5" y2="85" />
                    <line opacity="0.4" stroke="#ffffff" strokeWidth="1.4" x1="20" x2="100" y1="62" y2="202" />
                    <line opacity="0.4" stroke="#ffffff" strokeWidth="1.4" x1="20" x2="100" y1="155" y2="108" />
                    <line opacity="0.4" stroke="#ffffff" strokeWidth="1.4" x1="100" x2="180" y1="108" y2="155" />
                    <line
                      opacity="0.55"
                      stroke="#ffffff"
                      strokeDasharray="3 3"
                      strokeWidth="1.4"
                      x1="180"
                      x2="100"
                      y1="62"
                      y2="202"
                    />

                    {/* Central Node Sensor */}
                    <circle
                      cx="100"
                      cy="108"
                      fill="#ffffff"
                      filter="drop-shadow(0 0 6px rgba(255,255,255,0.9))"
                      r="9"
                    />
                    <circle cx="100" cy="108" fill="#0070ea" r="4.5" />

                    {/* Peripheral Vertices */}
                    <circle cx="100" cy="15" fill="#ffffff" r="5" />
                    <circle cx="180" cy="62" fill="#ffffff" r="5" />
                    <circle cx="20" cy="62" fill="#ffffff" r="5" />
                    <circle cx="100" cy="202" fill="#7f70fb" r="6" />
                    <circle cx="180" cy="155" fill="#ffffff" opacity="0.9" r="4.5" />
                    <circle cx="20" cy="155" fill="#ffffff" opacity="0.9" r="4.5" />

                    {/* Satellite Break Lines */}
                    <line stroke="#0070ea" strokeLinecap="round" strokeWidth="2" x1="180" x2="205" y1="62" y2="48" />
                    <circle cx="208" cy="46" fill="#0070ea" r="3.5" />
                    <line stroke="#7f70fb" strokeLinecap="round" strokeWidth="2" x1="20" x2="-2" y1="62" y2="48" />
                    <circle cx="-5" cy="46" fill="#7f70fb" r="3.5" />
                  </svg>
                </div>

                {/* Pulsing Radar Ping tooltip label */}
                <div className="absolute -bottom-6 font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full shadow-sm">
                  DISCONNECTED
                </div>
              </div>

              {/* Digit 4 Right */}
              <span className="text-[96px] sm:text-[140px] md:text-[180px] lg:text-[210px] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-bl from-slate-900 via-slate-800 to-blue-600 dark:from-white dark:via-slate-200 dark:to-blue-400 drop-shadow-[0_4px_16px_rgba(0,89,187,0.12)]">
                4
              </span>
            </div>
          </div>

          {/* Editorial Narrative */}
          <div className="max-w-2xl text-center mt-3 mb-8 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              {t('lostFromGraphTitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              {t('lostFromGraphDesc')}
            </p>
          </div>

          {/* Smart Interactive Search Bar */}
          <div className="w-full max-w-xl mb-10">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-12 pr-28 py-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 font-mono text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  ⌘K
                </kbd>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                  {t('searchBtn')}
                </button>
              </div>
            </form>

            {searchFeedback && (
              <div className="mt-2 px-3 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 animate-fade-in font-medium">
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  sync
                </span>
                <span>{searchFeedback}</span>
              </div>
            )}
          </div>

          {/* Essential Actions CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {/* Primary CTA: Back to Home */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>{t('backToHome')}</span>
            </Link>

            {/* Secondary CTA: Ask Socratic AI */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm hover:shadow-md hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                psychology
              </span>
              <span>{t('askSocraticAi')}</span>
            </button>

            {/* Tertiary CTA: Open Workspace */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>{t('openDashboard')}</span>
            </Link>
          </div>

          {/* Smart Discovery Bento Cards */}
          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  {t('alternativePathsTag')}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {t('continueLearningTitle')}
                </h3>
              </div>
              <span className="hidden sm:inline-flex font-mono text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
                STATUS: READY_NODES (4)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Skill Map */}
              <Link
                href="/competency"
                className="group flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">account_tree</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                  {t('cardSkillMapTitle')}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                  {t('cardSkillMapDesc')}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>{t('cardSkillMapAction')}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Card 2: Knowledge Graph */}
              <Link
                href="/knowledge-graph"
                className="group flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">hub</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                  {t('cardGraphTitle')}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                  {t('cardGraphDesc')}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <span>{t('cardGraphAction')}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Card 3: Interactive Sandbox */}
              <Link
                href="/dashboard"
                className="group flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">terminal</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                  {t('cardSandboxTitle')}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                  {t('cardSandboxDesc')}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>{t('cardSandboxAction')}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Card 4: Help Desk / Broken Node Report */}
              <Link
                href="/settings"
                className="group flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">support_agent</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1">
                  {t('cardHelpDeskTitle')}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                  {t('cardHelpDeskDesc')}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <span>{t('cardHelpDeskAction')}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating AI Guidance Modal */}
        {isAiModalOpen && (
          <div className="fixed bottom-8 right-8 max-w-sm p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 backdrop-blur-xl animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Socratic AI Tutor
                  </span>
                  <button
                    onClick={() => setIsAiModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {t('aiModalMessage')}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    {t('aiModalTakeMeThere')}
                  </Link>
                  <button
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    type="button"
                  >
                    {t('aiModalDismiss')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <ErrorPageFooter />
    </div>
  );
}
