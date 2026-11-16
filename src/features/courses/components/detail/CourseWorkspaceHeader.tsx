'use client';

import React from 'react';
import Link from 'next/link';

interface CourseWorkspaceHeaderProps {
  courseCode: string;
  courseTitle: string;
  role: 'student' | 'teacher';
  onRoleChange: (role: 'student' | 'teacher') => void;
  userFullName?: string;
}

export function CourseWorkspaceHeader({
  courseCode,
  courseTitle,
  role,
  onRoleChange,
  userFullName = 'TS. Lê Hoàng Nam',
}: CourseWorkspaceHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#F8FAFC]/85 dark:bg-[#0B0F19]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Breadcrumb */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link href="/classes" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-[#0059bb] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight hidden sm:inline-block">
              ILMS
            </span>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

          {/* Breadcrumb Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-hidden font-medium">
            <Link href="/classes" className="hover:text-slate-900 dark:hover:text-white truncate transition-colors">
              Lớp học của tôi
            </Link>
            <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
            <span className="hover:text-slate-900 dark:hover:text-white truncate cursor-default">
              {courseTitle || 'Mạng máy tính'}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
            <span className="font-semibold text-[#0059bb] dark:text-blue-400 truncate font-mono">
              {courseCode || 'CS-202'}
            </span>
          </nav>
        </div>

        {/* Right: Role Switcher & User Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Role simulation toggle pill */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
            <button
              type="button"
              onClick={() => onRoleChange('student')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'student'
                  ? 'bg-white dark:bg-slate-700 text-[#0059bb] dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Học viên
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('teacher')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'teacher'
                  ? 'bg-white dark:bg-slate-700 text-[#0059bb] dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Giảng viên
            </button>
          </div>

          {/* Notifications Button */}
          <button
            type="button"
            aria-label="Thông báo"
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0059bb] ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userFullName.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden lg:inline-block max-w-[130px] truncate">
              {userFullName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

