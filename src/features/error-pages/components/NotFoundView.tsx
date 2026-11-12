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
    <div className="bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] min-h-screen flex flex-col justify-between font-sans transition-colors">
      {/* 1. Header with Adaptive Auth state */}
      <ErrorPageHeader currentPage="404" />

      {/* 2. Main 404 Stage */}
      <main className="w-full flex-1 pt-16 relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-6 lg:px-12 py-12 flex flex-col items-center">
          {/* Top System Diagnostic Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#1E1F20] shadow-none border-none mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B57D0] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0B57D0] dark:bg-[#A8C7FA]" />
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-[#C4C7C5] font-medium">
              Node 404: Disconnected
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-[#282A2C]" />
            <span className="text-xs text-[#0B57D0] dark:text-[#A8C7FA] font-semibold">
              {t('diagnosticLabel')}
            </span>
          </div>

          {/* Centerpiece Hero: 404 Futuristic Kinetic Typography */}
          <div className="w-full flex flex-col items-center justify-center my-4 select-none">
            <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-14">
              {/* Digit 4 Left */}
              <span className="text-[96px] sm:text-[140px] md:text-[180px] lg:text-[210px] font-extrabold leading-none tracking-tighter text-slate-900 dark:text-[#E3E3E3]">
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
                <div className="absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#0B57D0] shadow-none flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div className="absolute bottom-2 -left-2 w-3 h-3 rounded-full bg-indigo-900 shadow-none" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#0B57D0] animate-pulse" />

                {/* Isometric 3D Knowledge Cube Visual */}
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 transition-transform duration-500 ease-out group-hover:scale-110">
                  <svg
                    className="w-full h-full drop-shadow-none"
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
                <div className="absolute -bottom-6 font-mono text-[10px] text-[#0B57D0] dark:text-[#A8C7FA] font-bold bg-white dark:bg-[#1E1F20] border-none px-3 py-0.5 rounded-full shadow-none">
                  DISCONNECTED
                </div>
              </div>

              {/* Digit 4 Right */}
              <span className="text-[96px] sm:text-[140px] md:text-[180px] lg:text-[210px] font-extrabold leading-none tracking-tighter text-slate-900 dark:text-[#E3E3E3]">
                4
              </span>
            </div>
          </div>

          {/* Editorial Narrative */}
          <div className="max-w-2xl text-center mt-3 mb-8 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight mb-2">
              {t('lostFromGraphTitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#C4C7C5] leading-relaxed max-w-xl">
              {t('lostFromGraphDesc')}
            </p>
          </div>

          {/* Smart Interactive Search Bar */}
          <div className="w-full max-w-xl mb-10">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0B57D0] transition-colors">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-12 pr-28 py-3.5 bg-white dark:bg-[#1E1F20] border-none rounded-full text-sm text-slate-900 dark:text-[#E3E3E3] placeholder:text-slate-400 dark:placeholder:text-[#8E918F] shadow-none focus:outline-none transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 font-mono text-[11px] text-slate-400 bg-[#F0F4F9] dark:bg-[#282A2C] rounded-full border-none">
                  ⌘K
                </kbd>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap text-xs font-medium border-none shadow-none transition-colors cursor-pointer"
                >
                  {t('searchBtn')}
                </button>
              </div>
            </form>

            {searchFeedback && (
              <div className="mt-2 px-3 text-xs text-[#0B57D0] dark:text-[#A8C7FA] flex items-center gap-1.5 animate-fade-in font-medium">
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium text-xs border-none shadow-none transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>{t('backToHome')}</span>
            </Link>

            {/* Secondary CTA: Ask Socratic AI */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium text-xs border-none shadow-none transition-all cursor-pointer whitespace-nowrap"
              type="button"
            >
              <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[18px]">
                psychology
              </span>
              <span>{t('askSocraticAi')}</span>
            </button>

            {/* Tertiary CTA: Open Workspace */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-transparent hover:bg-[#F0F4F9] text-[#0B57D0] dark:hover:bg-[#282A2C] dark:text-[#A8C7FA] font-medium text-xs border-none shadow-none transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>{t('openDashboard')}</span>
            </Link>
          </div>

          {/* Smart Discovery Bento Cards */}
          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-[#0B57D0] dark:text-[#A8C7FA] uppercase tracking-wider block">
                  {t('alternativePathsTag')}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#E3E3E3] mt-0.5">
                  {t('continueLearningTitle')}
                </h3>
              </div>
              <span className="hidden sm:inline-flex font-mono text-xs text-slate-500 dark:text-[#C4C7C5] bg-white dark:bg-[#1E1F20] border-none px-3 py-1 rounded-full shadow-none">
                STATUS: READY_NODES (4)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Skill Map */}
              <Link
                href="/competency"
                className="group flex flex-col p-5 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none hover:bg-white/80 dark:hover:bg-[#282A2C] transition-all relative overflow-hidden"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] mb-4 group-hover:scale-105 transition-transform border-none">
                  <span className="material-symbols-outlined text-[24px]">account_tree</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3] group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors mb-1">
                  {t('cardSkillMapTitle')}
                </span>
                <p className="text-xs text-slate-500 dark:text-[#C4C7C5] leading-relaxed mb-4 flex-1">
                  {t('cardSkillMapDesc')}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
                  <span>{t('cardSkillMapAction')}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Card 2: Knowledge Graph */}
              <Link
                href="/knowledge-graph"
                className="group flex flex-col p-5 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none hover:bg-white/80 dark:hover:bg-[#282A2C] transition-all relative overflow-hidden"
              >
                <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-700 dark:text-purple-300 mb-4 group-hover:scale-105 transition-transform border-none">
                  <span className="material-symbols-outlined text-[24px]">hub</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                  {t('cardGraphTitle')}
                </span>
                <p className="text-xs text-slate-500 dark:text-[#C4C7C5] leading-relaxed mb-4 flex-1">
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
                className="group flex flex-col p-5 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none hover:bg-white/80 dark:hover:bg-[#282A2C] transition-all relative overflow-hidden"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#C4EED0] dark:bg-[#142E20] flex items-center justify-center text-[#0D652D] dark:text-[#81C995] mb-4 group-hover:scale-105 transition-transform border-none">
                  <span className="material-symbols-outlined text-[24px]">terminal</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                  {t('cardSandboxTitle')}
                </span>
                <p className="text-xs text-slate-500 dark:text-[#C4C7C5] leading-relaxed mb-4 flex-1">
                  {t('cardSandboxDesc')}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#0D652D] dark:text-[#81C995]">
                  <span>{t('cardSandboxAction')}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>

              {/* Card 4: Help Desk / Broken Node Report */}
              <Link
                href="/settings"
                className="group flex flex-col p-5 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none hover:bg-white/80 dark:hover:bg-[#282A2C] transition-all relative overflow-hidden"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#FCEBA4] dark:bg-[#3C2A1E] flex items-center justify-center text-[#725200] dark:text-[#FFB784] mb-4 group-hover:scale-105 transition-transform border-none">
                  <span className="material-symbols-outlined text-[24px]">support_agent</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1">
                  {t('cardHelpDeskTitle')}
                </span>
                <p className="text-xs text-slate-500 dark:text-[#C4C7C5] leading-relaxed mb-4 flex-1">
                  {t('cardHelpDeskDesc')}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#725200] dark:text-[#FFB784]">
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
          <div className="fixed bottom-8 right-8 max-w-sm p-5 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-2xl border-none z-50 animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 border-none">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-[#E3E3E3]">
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
                <p className="text-xs text-slate-600 dark:text-[#C4C7C5] mt-1.5 leading-relaxed">
                  {t('aiModalMessage')}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap text-xs font-medium border-none shadow-none transition-colors"
                  >
                    {t('aiModalTakeMeThere')}
                  </Link>
                  <button
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-4 py-2 rounded-full text-[#1F1F1F] dark:text-[#C4C7C5] text-xs font-medium bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] border-none shadow-none transition-colors"
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
