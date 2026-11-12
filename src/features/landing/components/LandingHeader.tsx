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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#131314] backdrop-blur-md border-none shadow-none transition-colors">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Nav */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" prefetch={true} className="flex items-center gap-2 group focus:outline-none">
            <div className="relative py-1 px-2 rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] border-none transition-colors flex items-center">
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
              className="text-sm font-semibold text-blue-600 dark:text-[#A8C7FA] transition-colors py-2"
            >
              {t('home')}
            </Link>

            {/* Features Dropdown */}
            <div className="relative group inline-block">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-[#C4C7C5] group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] hover:text-blue-700 dark:hover:text-white transition-colors py-2 cursor-pointer"
              >
                <span>{t('features')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute left-0 top-full pt-2 w-96 hidden group-hover:block transition-all duration-200 z-50">
                <div className="bg-white dark:bg-[#1E1F20] border-none rounded-3xl shadow-none p-3 flex flex-col gap-1">
                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('featuresDropdown.heatmapTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('featuresDropdown.heatmapDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('featuresDropdown.socraticTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('featuresDropdown.socraticDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Network className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('featuresDropdown.graphTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('featuresDropdown.graphDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Kanban className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('featuresDropdown.lmsTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('featuresDropdown.lmsDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <FileSearch className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('featuresDropdown.entityTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
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
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-[#C4C7C5] group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] hover:text-blue-700 dark:hover:text-white transition-colors py-2 cursor-pointer"
              >
                <span>{t('solutions')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute left-0 top-full pt-2 w-96 hidden group-hover:block transition-all duration-200 z-50">
                <div className="bg-white dark:bg-[#1E1F20] border-none rounded-3xl shadow-none p-3 flex flex-col gap-1">
                  <a
                    href="#quy-trinh-hoat-dong"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('solutionsDropdown.studentTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('solutionsDropdown.studentDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#quy-trinh-hoat-dong"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('solutionsDropdown.teacherTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('solutionsDropdown.teacherDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#quy-trinh-hoat-dong"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('solutionsDropdown.schoolTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('solutionsDropdown.schoolDesc')}
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <a
              href="#bang-gia"
              className="text-sm font-semibold text-[#444746] dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors py-2"
            >
              {t('pricing')}
            </a>

            {/* Resources Dropdown */}
            <div className="relative group inline-block">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#444746] dark:text-[#C4C7C5] group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] hover:text-[#0B57D0] dark:hover:text-white transition-colors py-2 cursor-pointer"
              >
                <span>{t('resources')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute left-0 top-full pt-2 w-80 hidden group-hover:block transition-all duration-200 z-50">
                <div className="bg-white dark:bg-[#1E1F20] border-none rounded-3xl shadow-none p-3 flex flex-col gap-1">
                  <a
                    href="#blog"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('resourcesDropdown.blogTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('resourcesDropdown.blogDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#docs"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('resourcesDropdown.docsTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('resourcesDropdown.docsDesc')}
                      </span>
                    </div>
                  </a>

                  <a
                    href="#community"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] shrink-0 group-hover/item:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] transition-colors">
                        {t('resourcesDropdown.communityTitle')}
                      </span>
                      <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-tight mt-0.5">
                        {t('resourcesDropdown.communityDesc')}
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <a
              href="#ve-chung-toi"
              className="text-sm font-semibold text-slate-700 dark:text-[#C4C7C5] hover:text-blue-600 dark:hover:text-[#38BDF8] transition-colors py-2"
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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F4F9] text-slate-700 transition-colors hover:bg-[#E1E5EA] dark:bg-[#1E1F20] dark:text-[#A8C7FA] border-none shadow-none"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#A8C7FA]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <Link
            href="/login"
            prefetch={true}
            className="hidden sm:inline-flex text-sm font-medium text-slate-700 dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-white hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] px-4 py-2 rounded-full transition-colors whitespace-nowrap"
          >
            {t('login')}
          </Link>

          <Link
            href="/register"
            prefetch={true}
            className="inline-flex items-center text-sm font-medium text-[#041E49] bg-[#D3E3FD] hover:bg-[#B9D0F9] dark:text-[#062E6F] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] px-5 py-2.5 rounded-full border-none shadow-none transition-colors whitespace-nowrap"
          >
            {t('getStarted')}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] text-slate-700 dark:text-[#C4C7C5] border-none shadow-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-none bg-white/95 dark:bg-[#131314] backdrop-blur-2xl px-4 py-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-full font-medium text-[#041E49] bg-[#D3E3FD] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-sm"
          >
            {t('home')}
          </Link>
          <a
            href="#tinh-nang-noi-bat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-full font-medium text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-sm"
          >
            {t('features')}
          </a>
          <a
            href="#quy-trinh-hoat-dong"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-full font-medium text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-sm"
          >
            {t('solutions')}
          </a>
          <a
            href="#bang-gia"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-full font-medium text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-sm"
          >
            {t('pricing')}
          </a>
          <a
            href="#ve-chung-toi"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-full font-medium text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-sm"
          >
            {t('about')}
          </a>
          <div className="pt-2 flex gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 text-sm font-medium rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] text-slate-800 dark:text-[#E3E3E3] border-none shadow-none"
            >
              {t('login')}
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 text-sm font-medium rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#A8C7FA] dark:text-[#062E6F] border-none shadow-none"
            >
              {t('getStarted')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
