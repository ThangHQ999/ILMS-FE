'use client';

import React from 'react';
import type { CourseWorkspaceTab } from './CourseWorkspaceSidebar';

interface CourseHeroBannerProps {
  courseCode: string;
  courseTitle: string;
  instructor?: string;
  role: 'student' | 'teacher';
  onRoleChange: (role: 'student' | 'teacher') => void;
  activeTab: CourseWorkspaceTab;
  onTabChange: (tab: CourseWorkspaceTab) => void;
  assignmentsCount?: number;
  membersCount?: number;
}

export function CourseHeroBanner({
  courseCode,
  courseTitle,
  instructor = 'TS. Lê Hoàng Nam',
  role,
  onRoleChange,
  activeTab,
  onTabChange,
  assignmentsCount = 2,
  membersCount = 48,
}: CourseHeroBannerProps) {
  const tabs = [
    {
      id: 'stream' as CourseWorkspaceTab,
      label: 'Tổng quan & Bảng tin',
      icon: 'forum',
    },
    {
      id: 'modules' as CourseWorkspaceTab,
      label: 'Chương trình học',
      icon: 'account_tree',
      badge: role === 'teacher' ? '5' : undefined,
    },
    {
      id: 'assignments' as CourseWorkspaceTab,
      label: 'Bài tập & Đánh giá',
      icon: 'assignment',
      badge: role === 'teacher' ? '2 cần chấm' : String(assignmentsCount),
      badgeColor: role === 'teacher' ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300' : 'bg-blue-100 dark:bg-blue-900/60 text-[#0059bb] dark:text-blue-300',
    },
    {
      id: 'people' as CourseWorkspaceTab,
      label: 'Thành viên',
      icon: 'groups',
      badge: role === 'teacher' ? `${membersCount} SV` : String(membersCount),
    },
    ...(role === 'teacher'
      ? [
          {
            id: 'settings' as CourseWorkspaceTab,
            label: 'Cài đặt & Thống kê',
            icon: 'analytics',
            badge: 'GV',
            badgeColor: 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {/* 1. HERO COURSE BANNER STRIP */}
      {role === 'student' ? (
        /* Student View Banner: Dark Tech Hero with Grid Overlay */
        <div className="relative overflow-hidden rounded-2xl bg-[#0d1c32] text-white shadow-md p-5 sm:p-6 lg:p-7">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#d8e2ff 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            {/* Course Title and Badges */}
            <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/15 shadow-inner">
                <span className="material-symbols-outlined text-[#d8e2ff] text-[32px] sm:text-[36px]">
                  lan
                </span>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0059bb] text-white font-mono text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                    {courseCode || 'CS-202'} • Nhóm 01
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-xs font-medium">
                    Học kỳ 1 • 2024-2025
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-xs font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Trực tiếp &amp; Hybrid</span>
                  </span>
                </div>
                <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white truncate">
                  {courseTitle || 'Mạng máy tính & Truyền thông dữ liệu'}
                </h1>
                <p className="text-xs text-slate-300 font-medium truncate">
                  Khoa Mạng Máy tính &amp; Truyền thông • {instructor}
                </p>
              </div>
            </div>

            {/* Role Simulator Pill */}
            <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10 self-stretch sm:self-auto">
              <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                <span>Chế độ mô phỏng quyền:</span>
              </div>
              <div className="inline-flex p-1 rounded-lg bg-[#0d1c32]/80 border border-white/10 shadow-inner">
                <button
                  type="button"
                  onClick={() => onRoleChange('student')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all bg-[#0059bb] text-white shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  <span>Học viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRoleChange('teacher')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">co_present</span>
                  <span>Giảng viên</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Teacher View Banner: Comprehensive Studio Header with Class Metrics */
        <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
          {/* Breadcrumb & Instructor indicator */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-blue-600">school</span>
                Lớp học của tôi
              </span>
              <span className="material-symbols-outlined text-[15px] text-slate-400">chevron_right</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {courseTitle || 'Mạng máy tính & Truyền thông dữ liệu'}
              </span>
              <span className="material-symbols-outlined text-[15px] text-slate-400">chevron_right</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                {courseCode || 'CS-202'}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-[#0059bb] dark:text-blue-400 font-bold">Nhóm 01 • HK2 2024-2025</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-slate-400">meeting_room</span>
                <span>Lab H6-302</span>
              </span>
            </div>

            {/* Role switch pill & Authoring rights badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => onRoleChange('student')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">school</span>
                  <span>Học viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRoleChange('teacher')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#0d1c32] text-white shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#d8e2ff]">assignment_ind</span>
                  <span>Giảng viên (Quản trị)</span>
                </button>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0059bb] dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-900">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0059bb] animate-pulse" />
                <span>Quyền Biên tập Giáo trình</span>
              </span>
            </div>
          </div>

          {/* Title & Metrics Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold">
                  IT005.021
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  • 4 Tín chỉ (3 LT + 1 TH)
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {courseTitle || 'Mạng máy tính & Truyền thông dữ liệu'}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  <strong>GV Phụ trách:</strong> {instructor}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>Khoa Mạng máy tính &amp; Truyền thông</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-[#0059bb] dark:text-blue-400 font-mono font-medium">
                  nam.lh@ilms.edu.vn
                </span>
              </p>
            </div>

            {/* 3 Metric Overview boxes */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-850 p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-750 shrink-0 shadow-2xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tiến độ lớp
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                    64.2%
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center">
                    <span className="material-symbols-outlined text-[13px]">trending_up</span>+5.4%
                  </span>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Học phần
                </p>
                <p className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  5 <span className="text-xs font-normal text-slate-500">Chương</span>
                </p>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bài giảng
                </p>
                <p className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  22 <span className="text-xs font-normal text-slate-500">(18 mở)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN HORIZONTAL NAVIGATION TAB BAR */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-[#0059bb] dark:text-blue-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      tab.badgeColor ||
                      (isActive
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-[#0059bb] dark:text-blue-300'
                        : 'bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-300')
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Context Info on Desktop */}
        <div className="hidden xl:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#0059bb] dark:text-blue-400 text-[17px]">verified</span>
            <span>Mã môn: <strong className="font-mono text-slate-800 dark:text-slate-200">{courseCode || 'IT005.O21'}</strong></span>
          </div>
          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-slate-400 text-[17px]">domain</span>
            <span>Phòng Lab: <strong className="text-slate-800 dark:text-slate-200">H6-302</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

