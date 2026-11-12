'use client';

import React from 'react';
import Link from 'next/link';

interface LessonSessionHeaderProps {
  onBackToClasses?: () => void;
}

export const LessonSessionHeader: React.FC<LessonSessionHeaderProps> = ({
  onBackToClasses,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Back Link */}
      {onBackToClasses ? (
        <button
          type="button"
          onClick={onBackToClasses}
          className="inline-flex items-center gap-1.5 text-[#0B57D0] hover:bg-[#F0F4F9] dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors w-fit border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Quay lại danh sách lớp học</span>
        </button>
      ) : (
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-[#0B57D0] hover:bg-[#F0F4F9] dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors w-fit border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Quay lại danh sách lớp học</span>
        </Link>
      )}

      {/* Main Title & Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
              Lập trình Web nâng cao - Next.js &amp; TypeScript (CNTT-K21A)
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs font-medium whitespace-nowrap border-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
              Đang giảng dạy
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#747775] dark:text-[#8E918F] flex-wrap">
            <span className="font-mono font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">INT3306 01</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#747775] dark:text-[#8E918F]">group</span>
              45 sinh viên
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#747775] dark:text-[#8E918F]">meeting_room</span>
              Giảng đường B204
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#747775] dark:text-[#8E918F]">event_note</span>
              Học kỳ 1 (2024 - 2025)
            </span>
          </div>
        </div>

        {/* Quick Telemetry Chips */}
        <div className="flex items-center gap-2 self-start lg:self-auto bg-white dark:bg-[#1E1F20] p-1.5 rounded-2xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="px-4 py-1.5 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] flex flex-col items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#444746] dark:text-[#8E918F] font-semibold">TIẾN ĐỘ</span>
            <span className="text-base font-bold text-[#0B57D0] dark:text-[#A8C7FA]">5 / 15</span>
          </div>
          <div className="px-4 py-1.5 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] flex flex-col items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#444746] dark:text-[#8E918F] font-semibold">CHUYÊN CẦN TB</span>
            <span className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">95.6%</span>
          </div>
        </div>
      </div>

      {/* Class Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#1E1F20] rounded-full w-full border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none max-w-full overflow-x-auto mt-2">
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors text-xs sm:text-sm whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          <span>Tổng quan</span>
        </Link>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs sm:text-sm font-medium whitespace-nowrap border-none cursor-pointer" type="button">
          <span className="material-symbols-outlined text-[18px]">event_repeat</span>
          <span>Ca học</span>
          <span className="px-2 py-0.5 rounded-full bg-white/70 text-[#041E49] dark:bg-[#282A2C] dark:text-[#A8C7FA] text-[11px] font-mono whitespace-nowrap">12 ca đã lập</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors text-xs sm:text-sm whitespace-nowrap border-none cursor-pointer" type="button">
          <span className="material-symbols-outlined text-[18px]">groups</span>
          <span>Sinh viên (45)</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors text-xs sm:text-sm whitespace-nowrap border-none cursor-pointer" type="button">
          <span className="material-symbols-outlined text-[18px]">folder_shared</span>
          <span>Tài liệu môn học</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors text-xs sm:text-sm whitespace-nowrap border-none cursor-pointer" type="button">
          <span className="material-symbols-outlined text-[18px]">grade</span>
          <span>Bảng điểm số</span>
        </button>
      </div>
    </div>
  );
};
