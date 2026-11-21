'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
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
import { useCurrentUser } from '@/features/auth';
import { UserMenuDropdown } from '@/features/dashboard/components/UserMenuDropdown';

export function PublicHeader() {
  const t = useTranslations('landing.nav');
  const tCommon = useTranslations('common');
  const { resolvedTheme, setTheme } = useTheme();
  const { data: user } = useCurrentUser();
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/65 dark:bg-[#061844]/65 backdrop-blur-xl border-b border-white/40 dark:border-sky-300/12 shadow-[0_10px_32px_-18px_rgba(15,38,92,0.18)] transition-colors">
      <div className="h-16 w-full max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-14 flex items-center justify-between">
        {/* Brand Logo & Nav */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" prefetch={true} className="flex items-center gap-2 group focus:outline-none">
            <img
              src="/logo-full.png"
              alt="ILMS Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
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
                    href="/#tinh-nang-noi-bat"
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
                    href="/#tinh-nang-noi-bat"
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-transparent flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform overflow-hidden">
                      <img src="/socratic_mascot.png" alt="Socratic AI" className="w-7 h-7 object-contain" />
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
                    href="/#khong-gian-lop-hoc"
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
                    href="/#khong-gian-lop-hoc"
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
                    href="/#tinh-nang-noi-bat"
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
                    href="/#quy-trinh-hoat-dong"
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
                    href="/#quy-trinh-hoat-dong"
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
                    href="/#quy-trinh-hoat-dong"
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

            <Link
              href="/pricing"
              className="text-sm font-semibold text-[#444746] dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors py-2"
            >
              {t('pricing')}
            </Link>

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

            <Link
              href="/about"
              prefetch={true}
              className="text-sm font-semibold text-slate-700 dark:text-[#C4C7C5] hover:text-blue-600 dark:hover:text-[#38BDF8] transition-colors py-2"
            >
              {t('about')}
            </Link>
          </nav>
        </div>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-3">
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

          {/* Action Buttons: Avatar if logged in, else Login/Register */}
          {mounted && user ? (
            <UserMenuDropdown
              userFullName={
                [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') ||
                user.email
              }
              isFocus={false}
            />
          ) : (
            <>
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
            </>
          )}

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
            href="/#tinh-nang-noi-bat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-full font-medium text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-sm"
          >
            {t('features')}
          </a>
          <a
            href="/#quy-trinh-hoat-dong"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-full font-medium text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-sm"
          >
            {t('solutions')}
          </a>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-full font-medium text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-sm"
          >
            {t('pricing')}
          </Link>
          <Link
            href="/about"
            prefetch={true}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-full font-medium text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-sm"
          >
            {t('about')}
          </Link>

          {mounted && user ? (
            <div className="pt-2 border-t border-slate-100 dark:border-[#282A2C] space-y-2">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#1E1F20]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {([user.firstName, user.lastName].filter(Boolean).join(' ') || user.email)
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3] truncate">
                    {[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') ||
                      user.email}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-[#C4C7C5] truncate">
                    {user.email}
                  </span>
                </div>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold bg-[#D3E3FD] text-[#041E49] dark:bg-[#A8C7FA] dark:text-[#062E6F] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span>Vào Bảng điều khiển</span>
              </Link>
            </div>
          ) : (
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
          )}
        </div>
      )}
    </header>
  );
}
