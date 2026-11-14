'use client';

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

interface LessonWorkspaceHeaderProps {
  courseId: string;
  courseCode?: string;
  courseName?: string;
  classGroup?: string;
  chapterNumber?: string | number;
  lessonNumber?: string | number;
  lessonTitle: string;
  activeNavTab: 'workspace' | 'syllabus' | 'resources' | 'discussion';
  onSelectNavTab: (tab: 'workspace' | 'syllabus' | 'resources' | 'discussion') => void;
  isLeftSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onOpenNotes: () => void;
  hasUnsavedNotes?: boolean;
  studentName?: string;
  studentCode?: string;
  overallProgress?: number;
  lessonProgress?: number;
  onHelpClick?: () => void;
}

export function LessonWorkspaceHeader({
  courseId,
  courseCode = 'CS-202',
  courseName = 'Cấu trúc dữ liệu & Giải thuật nâng cao',
  classGroup = 'CS-202 • Nhóm 01',
  chapterNumber = '03',
  lessonNumber = '02',
  lessonTitle = 'Cơ chế truyền tin cậy (RDT) & Bắt tay 3 bước TCP',
  activeNavTab,
  onSelectNavTab,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
  isFocusMode,
  onToggleFocusMode,
  onOpenNotes,
  hasUnsavedNotes = true,
  studentName = 'Trần Nhật Minh',
  studentCode = '21120485',
  overallProgress = 64,
  lessonProgress = 68,
  onHelpClick,
}: LessonWorkspaceHeaderProps) {
  return (
    <div className="w-full flex flex-col">
      {/* ========================================================= */}
      {/* 1. TOP APP NAVIGATION BAR (Fixed top-0, h-16)            */}
      {/* ========================================================= */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xs border-b-[3px] border-slate-300 dark:border-slate-700">
        <div className="relative h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: Back & Lesson Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
              title="Quay lại không gian môn học"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="text-xs sm:text-sm font-bold hidden sm:inline">Khóa học</span>
            </Link>

            <div className="h-5 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block shrink-0" />

            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                Chương {chapterNumber} • Bài {lessonNumber}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs md:max-w-md">
                Xây dựng Cấu trúc Layout 3 Cột Hiện đại
              </span>
            </div>
          </div>

          {/* Center/Right Nav & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Nav Pills */}
            <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onSelectNavTab('workspace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeNavTab === 'workspace'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Không gian học
              </button>
              <button
                type="button"
                onClick={() => onSelectNavTab('syllabus')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeNavTab === 'syllabus'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Đề cương
              </button>
              <button
                type="button"
                onClick={() => onSelectNavTab('resources')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeNavTab === 'resources'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Tài nguyên
              </button>
              <button
                type="button"
                onClick={() => onSelectNavTab('discussion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeNavTab === 'discussion'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Hỏi đáp
              </button>
            </nav>

            <ThemeToggle />
            <LanguageSwitcher variant="minimal" />

            {/* Help Button */}
            <button
              type="button"
              onClick={onHelpClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors text-xs font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
              <span className="hidden md:inline">Trợ giúp</span>
            </button>

            {/* User Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>

          {/* Bottom Micro Progress Rail (Overall course progress) */}
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
              title={`Tiến độ môn học: ${overallProgress}%`}
            />
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. SUB-HEADER BAR: WORKSTATION CONTROLS (Sticky top-16)  */}
      {/* ========================================================= */}
      <div className="sticky top-16 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xs border-b-[3px] border-slate-300 dark:border-slate-700">
        <div className="w-full px-4 sm:px-6 py-2 flex items-center justify-between gap-3 flex-wrap">
          {/* Breadcrumb & Class Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 text-xs sm:text-sm font-semibold transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">keyboard_backspace</span>
              <span className="hidden sm:inline">{courseCode}</span>
            </Link>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider shrink-0 border border-slate-300 dark:border-slate-700">
              {classGroup}
            </span>

            <div className="hidden xl:flex items-center gap-1.5 min-w-0">
              <span className="text-slate-400">•</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-xl">
                Bài {chapterNumber}.{lessonNumber}: {lessonTitle}
              </span>
            </div>
          </div>

          {/* Quick Actions & Control Toggles */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Toggle Left Sidebar */}
            <button
              type="button"
              onClick={onToggleLeftSidebar}
              className={`p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border ${
                isLeftSidebarOpen
                  ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'border-transparent'
              }`}
              title="Ẩn/Hiện Cây Giáo Trình (Left Sidebar)"
            >
              <span className="material-symbols-outlined text-[20px]">view_sidebar</span>
            </button>

            {/* Focus Mode Button (Toggles both sidebars off/on) */}
            <button
              type="button"
              onClick={onToggleFocusMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isFocusMode
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
              title="Chế độ Tập trung: Ẩn cả hai thanh bên để tối đa hóa không gian học"
            >
              <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
              <span className="hidden md:inline">{isFocusMode ? 'Thoát Focus' : 'Focus Mode'}</span>
            </button>

            {/* Quick Notes Scratchpad Button */}
            <button
              type="button"
              onClick={onOpenNotes}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer border border-transparent"
              title="Mở sổ tay ghi chú nháp"
            >
              <span className="material-symbols-outlined text-[20px]">sticky_note_2</span>
              {hasUnsavedNotes && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              )}
              {hasUnsavedNotes && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>

            {/* Toggle Right AI Sidebar */}
            <button
              type="button"
              onClick={onToggleRightSidebar}
              className={`p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border ${
                isRightSidebarOpen
                  ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent'
              }`}
              title="Ẩn/Hiện Trợ lý Socratic AI (Right Sidebar)"
            >
              <span className="material-symbols-outlined text-[20px]">neurology</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-1">
              <div className="relative w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
                NM
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {studentName}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-mono">
                  {studentCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Progress Rail */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-[3px] relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
            style={{ width: `${lessonProgress}%` }}
            title={`Tiến độ bài học: ${lessonProgress}%`}
          />
        </div>
      </div>
    </div>
  );
}

