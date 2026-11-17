'use client';

import React from 'react';

export type CourseWorkspaceTab = 'stream' | 'modules' | 'assignments' | 'people' | 'settings';

interface CourseWorkspaceSidebarProps {
  courseCode: string;
  courseTitle: string;
  activeTab: CourseWorkspaceTab;
  onTabChange: (tab: CourseWorkspaceTab) => void;
  role: 'student' | 'teacher';
}

export function CourseWorkspaceSidebar({
  courseCode,
  courseTitle,
  activeTab,
  onTabChange,
  role,
}: CourseWorkspaceSidebarProps) {
  const navItems = [
    {
      id: 'stream' as CourseWorkspaceTab,
      label: 'Tổng quan & Bảng tin',
      icon: 'forum',
    },
    {
      id: 'modules' as CourseWorkspaceTab,
      label: 'Chương trình học',
      icon: 'menu_book',
    },
    {
      id: 'assignments' as CourseWorkspaceTab,
      label: 'Bài tập & Đánh giá',
      icon: 'assignment',
    },
    {
      id: 'people' as CourseWorkspaceTab,
      label: 'Thành viên',
      icon: 'group',
    },
    ...(role === 'teacher'
      ? [
          {
            id: 'settings' as CourseWorkspaceTab,
            label: 'Cài đặt & Thống kê',
            icon: 'query_stats',
            badge: 'Giáo viên',
          },
        ]
      : []),
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-72 bg-white dark:bg-[#111726] border-r border-slate-200/80 dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 hidden lg:flex flex-col justify-between overflow-y-auto p-5 transition-colors">
      <div className="space-y-5">
        {/* Course Identity Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-[#0d1c32] flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[#d8e2ff] text-[24px]">hub</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-bold text-[#0059bb] dark:text-blue-400 uppercase tracking-wider">
              {courseCode || 'CS-202'}
            </p>
            <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
              {courseTitle || 'Mạng máy tính'}
            </h2>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Học phần
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5" aria-label="Điều hướng học phần">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0059bb] text-white shadow-[0_2px_8px_rgba(0,89,187,0.25)]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 dark:bg-blue-900/60 text-[#0059bb] dark:text-blue-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Semester Academic Card at Bottom */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
          <div className="flex items-center gap-2 text-[#0059bb] dark:text-blue-400 font-bold text-xs">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Học kỳ I • 2024–2025</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Khoa Công nghệ Thông tin &amp; Truyền thông
          </p>
        </div>
      </div>
    </aside>
  );
}

