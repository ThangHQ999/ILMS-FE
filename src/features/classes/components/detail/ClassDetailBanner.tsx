'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ClassItem } from '../../schemas/class.schema';

interface ClassDetailBannerProps {
  classInfo: ClassItem;
  currentRole: 'student' | 'teacher' | 'owner';
  activeTab: string;
  onTabChange: (tab: string) => void;
  subjectsCount: number;
  instructorsCount: number;
  onCopyCode: () => void;
  onInviteClick: () => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
  onOpenManageCode: () => void;
}

export function ClassDetailBanner({
  classInfo,
  currentRole,
  activeTab,
  onTabChange,
  subjectsCount,
  instructorsCount,
  onCopyCode,
  onInviteClick,
  onOpenSettings,
  onOpenArchive,
  onOpenManageCode,
}: ClassDetailBannerProps) {
  const t = useTranslations('classes.detail');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Streamlined 5 tabs as requested in user mockup
  const tabs = [
    { id: 'stream', label: 'Tổng quan & Bảng tin', icon: 'forum' },
    { id: 'modules', label: 'Chương trình học', icon: 'account_tree' },
    { id: 'assignments', label: 'Bài tập & Đánh giá', icon: 'assignment', badge: '2' },
    { id: 'people', label: 'Thành viên', icon: 'groups', badge: classInfo.enrolledCount || 48 },
    ...(currentRole !== 'student'
      ? [{ id: 'settings', label: 'Cài đặt & Thống kê', icon: 'analytics', badge: 'GV' }]
      : []),
  ];

  return (
    <div className="space-y-4">
      {/* 1. HERO COURSE BANNER STRIP */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0d1c32] text-white border-[3px] border-slate-300 dark:border-slate-700 shadow-md">
        {/* Radial Ambient Dot Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#d8e2ff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Lan Icon & Class Metadata */}
          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <span className="material-symbols-outlined text-[#d8e2ff] text-[32px] sm:text-[36px]">lan</span>
            </div>

            <div className="min-w-0 flex-1">
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-2 flex-wrap text-xs font-semibold">
                <span className="px-3 py-0.5 rounded-full bg-[#0059bb] text-white font-bold tracking-wide uppercase shadow-xs">
                  {classInfo.enrollmentKey || classInfo.name || 'CS-202'} • Nhóm 01
                </span>
                <span className="px-3 py-0.5 rounded-full bg-white/15 text-slate-200">
                  {classInfo.semester || 'Học kỳ 1 • 2024-2025'}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-white/10 text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Trực tiếp &amp; Hybrid
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight truncate">
                {classInfo.title}
              </h1>

              {/* Subtitle / Instructor */}
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span>{classInfo.major || 'Khoa Mạng Máy tính & Truyền thông'}</span>
                <span>•</span>
                <span className="font-semibold text-white">
                  {classInfo.instructor?.fullName || 'TS. Lê Hoàng Nam'}
                </span>
                <span className="hidden sm:inline-block">•</span>
                <button
                  type="button"
                  onClick={onCopyCode}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-sky-200 bg-white/10 px-2 py-0.5 rounded hover:bg-white/20 transition-colors"
                  title={t('copyCodeTooltip')}
                >
                  <span>Mã lớp: {classInfo.enrollmentKey || classInfo.name}</span>
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                </button>
              </p>
            </div>
          </div>

          {/* Right: Resolved Role Badge from class_member */}
          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-sm self-stretch md:self-auto justify-center">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#d8e2ff]">verified_user</span>
              <span>Vai trò trong lớp:</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 ring-1 ring-white/30 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="material-symbols-outlined text-[#d8e2ff] text-[18px]">
                {currentRole === 'owner'
                  ? 'verified'
                  : currentRole === 'teacher'
                  ? 'co_present'
                  : 'school'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white">
                {currentRole === 'owner'
                  ? 'Chủ sở hữu / Trưởng bộ môn'
                  : currentRole === 'teacher'
                  ? 'Giảng viên phụ trách'
                  : 'Học viên chính thức'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#d8e2ff] text-[#001a41] text-[10px] uppercase font-extrabold tracking-wider">
                {currentRole === 'owner' ? 'OWNER' : currentRole === 'teacher' ? 'GV' : 'HV'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-300/80 mt-0.5">
              <span className="material-symbols-outlined text-[12px]">dataset</span>
              <span>Dữ liệu phân quyền từ class_member</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer inside Hero (Invite + Dropdown options) */}
        <div className="px-6 py-2.5 bg-black/20 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Sĩ số: <strong className="text-white font-bold">{classInfo.enrolledCount || 48} Học viên</strong>
            </span>
            <span>•</span>
            <span>
              Môn học:{' '}
              <strong className="text-white font-bold">{subjectsCount || 4} Môn liên kết</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onInviteClick}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">person_add</span>
              <span>{t('inviteMembers')}</span>
            </button>

            {/* Three Dots Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tùy chọn lớp học"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 text-xs text-slate-800 dark:text-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">tune</span>
                      <span>{t('editClassInfo')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenManageCode();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                      <span>{t('manageJoinCode')}</span>
                    </button>
                    {currentRole === 'owner' && (
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenArchive();
                          }}
                          className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">archive</span>
                          <span>{t('archiveClass')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN NAVIGATION TAB BAR (Dọn gọn thanh tab - 5 Tabs chuẩn) */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-850 border-[3px] border-slate-300 dark:border-slate-700 shadow-xs">
        {/* Tab pills container */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-extrabold shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50 font-semibold'
                }`}
              >
                <span className={`material-symbols-outlined text-[19px] ${isActive ? 'fill-icon' : ''}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Context Info Indicator */}
        <div className="hidden xl:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium px-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">verified</span>
            <span>Mã môn: <strong className="font-mono text-slate-800 dark:text-slate-200">IT005.O21</strong></span>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">domain</span>
            <span>Phòng Lab: <strong className="text-slate-800 dark:text-slate-200">H6-302</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}


