'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import {
  ChevronDown,
  LayoutGrid,
  Bot,
  Network,
  Kanban,
  FileSearch,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';

export function LandingHeader() {
  const t = useTranslations('landing.nav');
  const tCommon = useTranslations('common');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark') || resolvedTheme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', nextTheme);
      localStorage.setItem('ilms_theme_mode', nextTheme);
    } catch {
      // storage write safe ignore
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-colors">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Nav */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" prefetch={true} className="flex items-center gap-2 group focus:outline-none">
            <div className="relative py-1 px-2 rounded-lg bg-slate-50 dark:bg-[#161B26]/60 border border-slate-200 dark:border-slate-800/80 group-hover:border-blue-400 dark:group-hover:border-[#38BDF8]/40 transition-colors flex items-center">
              <img
                src="/logo-dark.png"
                alt="ILMS Logo"
                className="h-8 sm:h-9 w-auto object-contain hidden dark:block brightness-110 contrast-125 transition-transform group-hover:scale-105"
              />
              <img
                src="/logo-light.png"
                alt="ILMS Logo"
                className="h-8 sm:h-9 w-auto object-contain block dark:hidden transition-transform group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-blue-600 dark:text-[#38BDF8] transition-colors py-2"
            >
              {t('home')}
            </Link>

            {/* Features Dropdown */}
            <div className="relative group inline-block">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] hover:text-blue-700 dark:hover:text-white transition-colors py-2 cursor-pointer"
              >
                <span>{t('features')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute left-0 top-full pt-2 w-96 hidden group-hover:block transition-all duration-200 z-50">
                <div className="bg-white/95 dark:bg-[#161B26]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl dark:shadow-2xl p-3 flex flex-col gap-1">
                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('featuresDropdown.heatmapTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('featuresDropdown.heatmapDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('featuresDropdown.socraticTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('featuresDropdown.socraticDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Network className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('featuresDropdown.graphTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('featuresDropdown.graphDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Kanban className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('featuresDropdown.lmsTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('featuresDropdown.lmsDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <FileSearch className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('featuresDropdown.entityTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('featuresDropdown.entityDesc')}
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Solutions Dropdown */}
            <div className="relative group inline-block">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] hover:text-blue-700 dark:hover:text-white transition-colors py-2 cursor-pointer"
              >
                <span>{t('solutions')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute left-0 top-full pt-2 w-96 hidden group-hover:block transition-all duration-200 z-50">
                <div className="bg-white/95 dark:bg-[#161B26]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl dark:shadow-2xl p-3 flex flex-col gap-1">
                  <a
                    href="#quy-trinh-hoat-dong"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('solutionsDropdown.studentTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('solutionsDropdown.studentDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#quy-trinh-hoat-dong"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('solutionsDropdown.teacherTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('solutionsDropdown.teacherDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#quy-trinh-hoat-dong"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('solutionsDropdown.schoolTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('solutionsDropdown.schoolDesc')}
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <a
              href="#bang-gia"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-[#38BDF8] transition-colors py-2"
            >
              {t('pricing')}
            </a>

            {/* Resources Dropdown */}
            <div className="relative group inline-block">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] hover:text-blue-700 dark:hover:text-white transition-colors py-2 cursor-pointer"
              >
                <span>{t('resources')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute left-0 top-full pt-2 w-80 hidden group-hover:block transition-all duration-200 z-50">
                <div className="bg-white/95 dark:bg-[#161B26]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl dark:shadow-2xl p-3 flex flex-col gap-1">
                  <a
                    href="#blog"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('resourcesDropdown.blogTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('resourcesDropdown.blogDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#docs"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('resourcesDropdown.docsTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('resourcesDropdown.docsDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#community"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#262A35] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/15 border border-blue-200 dark:border-[#38BDF8]/20 flex items-center justify-center text-blue-600 dark:text-[#38BDF8] shrink-0 group-hover/item:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-[#38BDF8] transition-colors">
                        {t('resourcesDropdown.communityTitle')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {t('resourcesDropdown.communityDesc')}
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <a
              href="#ve-chung-toi"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-[#38BDF8] transition-colors py-2"
            >
              {t('about')}
            </a>
          </nav>
        </div>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <button
            id="landing-theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={tCommon('toggleTheme')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-[#161B26] dark:text-[#38BDF8] dark:hover:bg-[#262A35]"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#38BDF8]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <Link
            href="/login"
            prefetch={true}
            className="hidden sm:inline-flex text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 px-3.5 py-2 rounded-lg transition-all"
          >
            {t('login')}
          </Link>

          <Link
            href="/register"
            prefetch={true}
            className="inline-flex items-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 dark:text-slate-950 dark:bg-[#38BDF8] dark:hover:bg-[#60A5FA] dark:hover:shadow-cyan-500/25 px-4 py-2 rounded-lg shadow-md shadow-blue-500/20 dark:shadow-cyan-500/20 transition-all font-semibold"
          >
            {t('getStarted')}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161B26] text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-2xl px-4 py-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-semibold text-blue-600 dark:text-[#38BDF8] bg-blue-50/60 dark:bg-[#38BDF8]/10 text-sm"
          >
            {t('home')}
          </Link>
          <a
            href="#tinh-nang-noi-bat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
          >
            {t('features')}
          </a>
          <a
            href="#quy-trinh-hoat-dong"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
          >
            {t('solutions')}
          </a>
          <a
            href="#bang-gia"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
          >
            {t('pricing')}
          </a>
          <a
            href="#ve-chung-toi"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
          >
            {t('about')}
          </a>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
            >
              {t('login')}
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white dark:bg-[#38BDF8] dark:text-slate-950"
            >
              {t('getStarted')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
