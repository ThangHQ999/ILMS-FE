'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { ClassItem } from '../../schemas/class.schema';

interface ClassDetailBannerProps {
  classInfo: ClassItem;
  currentRole: 'student' | 'teacher' | 'owner';
  activeTab: string;
  onTabChange: (tab: string) => void;
  subjectsCount: number;
  studentsCount?: number;
  assignmentsCount?: number;
  sessionsCount?: number;
  instructorsCount: number;
  canManageClass?: boolean;
  isCompact?: boolean;
  onCopyCode: () => void;
  onInviteClick: () => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
  onOpenManageCode: () => void;
  onOpenCreateSession?: () => void;
}

export function ClassDetailBanner({
  classInfo,
  currentRole,
  activeTab,
  onTabChange,
  subjectsCount,
  studentsCount,
  assignmentsCount,
  sessionsCount,
  instructorsCount,
  onCopyCode,
  onInviteClick,
  onOpenSettings,
  onOpenArchive,
  onOpenManageCode,
  onOpenCreateSession,
}: ClassDetailBannerProps) {
  const t = useTranslations('classes.detail');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tabListRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Kiểm tra vị trí cuộn để ẩn/hiện nút mũi tên và cập nhật trạng thái
  const checkScroll = useCallback(() => {
    const el = tabListRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  // Cho phép lăn chuột dọc chuyển thành cuộn ngang mượt mà khi hover thanh tab
  useEffect(() => {
    const el = tabListRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        const isAtStart = el.scrollLeft <= 0 && e.deltaY < 0;
        const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth && e.deltaY > 0;
        if (!isAtStart && !isAtEnd) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkScroll();
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [checkScroll]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabListRef.current;
    if (el) {
      const scrollAmount = 260;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 320);
    }
  };

  // Streamlined 5 tabs: Tổng quan, Môn học liên kết, Bài tập, Thành viên, Cài đặt
  const resolvedStudentsCount = studentsCount ?? classInfo.enrolledCount ?? 0;
  const tabs = [
    { id: 'stream', label: 'Tổng quan & Bảng tin', icon: 'forum' },
    {
      id: 'sessions',
      label: 'Ca học',
      icon: 'calendar_clock',
      badge: sessionsCount !== undefined ? `${sessionsCount} ca` : undefined,
    },
    { id: 'subjects', label: 'Các môn học liên kết', icon: 'library_books', badge: subjectsCount },
    {
      id: 'assignments',
      label: 'Bài tập & Đánh giá',
      icon: 'assignment',
      ...(assignmentsCount !== undefined ? { badge: assignmentsCount } : {}),
    },
    { id: 'people', label: 'Thành viên', icon: 'groups', badge: resolvedStudentsCount },
    ...(currentRole !== 'student'
      ? [{ id: 'settings', label: 'Cài đặt & Thống kê', icon: 'analytics', badge: 'GV' }]
      : []),
  ];

  return (
    <div className="w-full">
      {/* 1. MAIN CLASS HEADER CARD (Flat, borderless MD3 Elevated Card) */}
      <section className="relative bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-none border-none transition-all">
        {classInfo.backgroundUrl && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
            <img
              src={classInfo.backgroundUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/70 dark:from-[#1E1F20]/95 dark:via-[#1E1F20]/88 dark:to-[#1E1F20]/70" />
          </div>
        )}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Class Metadata & Title */}
          <div className="min-w-0 flex-1">
            {/* Tags Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] px-3 py-1 rounded-full text-xs font-semibold">
                {classInfo.name || classInfo.enrollmentKey || 'CS-202'}
              </span>
              <span className="bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] px-3 py-1 rounded-full text-xs font-medium">
                {classInfo.semester || 'Học kỳ 1 • 2024-2025'}
              </span>
              <span className="bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Trực tiếp &amp; Hybrid
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-[#E3E3E3] mt-3 tracking-tight">
              {classInfo.title || classInfo.name || 'Cơ sở dữ liệu – Nhóm 01'}
            </h1>

            {/* Subtitle / Instructor & Class Meta */}
            <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] mt-2 flex items-center gap-2 flex-wrap">
              <span>{classInfo.major || 'Khoa học máy tính'}</span>
              <span>•</span>
              <span className="font-medium text-gray-700 dark:text-[#C4C7C5]">
                {classInfo.instructor?.fullName || ' (Chủ nhiệm môn)'}
              </span>
              <span>•</span>
              <span>Sĩ số: {resolvedStudentsCount} Học viên</span>
              {(currentRole !== 'student' || classInfo.isCodeActive !== false) && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={onCopyCode}
                    className="inline-flex items-center gap-1 font-mono text-xs text-blue-600 dark:text-[#A8C7FA] hover:underline cursor-pointer"
                    title={t('copyCodeTooltip')}
                  >
                    <span>Mã lớp: {classInfo.enrollmentKey || classInfo.name}</span>
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Right: + Lên lịch học / + Mời thành viên / Mã mời & QR + Options */}
          {(currentRole !== 'student' || classInfo.isCodeActive !== false) && (
            <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
              {currentRole !== 'student' && onOpenCreateSession && (
                <button
                  type="button"
                  onClick={onOpenCreateSession}
                  className="px-4 py-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border-none"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                    calendar_add_on
                  </span>
                  <span>+ Lên lịch học</span>
                </button>
              )}

              <button
                type="button"
                onClick={onInviteClick}
                className="px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {currentRole === 'student' ? 'qr_code_2' : 'person_add'}
                </span>
                <span>{currentRole === 'student' ? 'Mã mời & QR' : '+ Mời thành viên'}</span>
              </button>

              {/* Three Dots Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-9 h-9 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-700 dark:text-[#C4C7C5] flex items-center justify-center transition-colors cursor-pointer border-none"
                  title="Tùy chọn lớp học"
                >
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>

                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl py-1.5 z-30 text-xs font-medium text-gray-800 dark:text-[#C4C7C5] border-none animate-in fade-in zoom-in-95 duration-150">
                      {currentRole !== 'student' && onOpenCreateSession && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenCreateSession();
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-[#282A2C] flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#A8C7FA]">calendar_add_on</span>
                          <span>Tạo ca học mới</span>
                        </button>
                      )}
                      {currentRole !== 'student' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenSettings();
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-[#282A2C] flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">tune</span>
                          <span>{t('editClassInfo')}</span>
                        </button>
                      )}
                      {(currentRole !== 'student' || classInfo.isCodeActive !== false) && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenManageCode();
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-[#282A2C] flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                          <span>{currentRole === 'student' ? 'Xem mã mời & QR lớp' : t('manageJoinCode')}</span>
                        </button>
                      )}
                      {currentRole === 'owner' && (
                        <div className="mt-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              onOpenArchive();
                            }}
                            className="w-full px-3.5 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
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
          )}
        </div>
      </section>

      {/* 2. MAIN NAVIGATION TAB BAR (Flat, scrollable row with visible MD3 scrollbar & quick scroll chevrons) */}
      <div className="relative w-full mt-6">
        {/* Left Scroll Button with Gradient Fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-3 flex items-center pr-6 pl-0.5 bg-gradient-to-r from-[#F0F4F8] dark:from-[#0B0F19] via-[#F0F4F8]/90 dark:via-[#0B0F19]/90 to-transparent pointer-events-none z-10">
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#282A2C] shadow-md flex items-center justify-center text-gray-700 dark:text-[#E3E3E3] hover:scale-110 active:scale-95 transition-all pointer-events-auto cursor-pointer border-none"
              title="Cuộn về trước"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
          </div>
        )}

        <nav
          ref={tabListRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 overflow-x-auto flex-nowrap w-full pb-3 scroll-smooth max-w-full select-none
            [scrollbar-width:thin] [scrollbar-color:#94a3b8_rgba(0,0,0,0.06)] dark:[scrollbar-color:#5E6062_rgba(255,255,255,0.06)]
            [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:bg-black/5 dark:[&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-[#5E6062] [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 dark:hover:[&::-webkit-scrollbar-thumb]:bg-[#8E918F]"
          aria-label="Class navigation tabs"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer border-none ${isActive
                    ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3]'
                    : 'text-gray-600 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] bg-transparent'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isActive
                        ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-[#E3E3E3]'
                        : 'bg-gray-200 dark:bg-[#333537] text-gray-700 dark:text-[#C4C7C5]'
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Scroll Button with Gradient Fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-3 flex items-center pl-6 pr-0.5 bg-gradient-to-l from-[#F0F4F8] dark:from-[#0B0F19] via-[#F0F4F8]/90 dark:via-[#0B0F19]/90 to-transparent pointer-events-none z-10">
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#282A2C] shadow-md flex items-center justify-center text-gray-700 dark:text-[#E3E3E3] hover:scale-110 active:scale-95 transition-all pointer-events-auto cursor-pointer border-none"
              title="Cuộn tiếp các tab"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
