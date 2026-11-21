'use client';

import React from 'react';
import Link from 'next/link';

interface LessonSessionHeaderProps {
  onBackToClasses?: () => void;
  activeClass?: {
    id: string;
    name: string;
    code?: string;
    enrolledCount?: number;
    academicYear?: string;
    semester?: string;
    schedule?: { room?: string | null; dayOfWeek?: string | null; timeSlot?: string | null };
  } | null;
  classesList?: Array<{ id: string; name: string; code?: string }>;
  selectedClassId?: string;
  onSelectClassId?: (id: string) => void;
  totalSessionsCount?: number;
  completedSessionsCount?: number;
  attendanceRate?: number;
}

export const LessonSessionHeader: React.FC<LessonSessionHeaderProps> = ({
  onBackToClasses,
  activeClass,
  classesList = [],
  selectedClassId,
  onSelectClassId,
  totalSessionsCount = 12,
  completedSessionsCount = 0,
  attendanceRate = 95.0,
}) => {
  const classNameTitle = activeClass?.name || 'Quản lý Ca học & Điểm danh';
  const classCode = activeClass?.code || 'INT3306 01';
  const studentsCount = activeClass?.enrolledCount ?? 45;
  const roomName = activeClass?.schedule?.room || 'Phòng B1-204';
  const academicYear = activeClass?.academicYear || '2026-2027';
  const semester = activeClass?.semester || 'Học kỳ 1';
  const classDetailUrl = activeClass?.id ? `/classes/${activeClass.id}` : '/classes';

  return (
    <div className="flex flex-col gap-3">
      {/* Top Bar: Back Link & Class Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onBackToClasses ? (
          <button
            type="button"
            onClick={onBackToClasses}
            className="inline-flex items-center gap-1.5 text-[#0B57D0] hover:bg-[#F0F4F9] dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors w-fit border-none cursor-pointer font-sans"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Quay lại danh sách lớp học</span>
          </button>
        ) : (
          <Link
            href="/classes"
            className="inline-flex items-center gap-1.5 text-[#0B57D0] hover:bg-[#F0F4F9] dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors w-fit border-none cursor-pointer font-sans"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Quay lại danh sách lớp học</span>
          </Link>
        )}

        {/* Class Switcher Dropdown */}
        {classesList.length > 0 && onSelectClassId && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-[#8E918F] hidden sm:inline font-sans">
              Lớp học:
            </span>
            <select
              value={selectedClassId || ''}
              onChange={(e) => onSelectClassId(e.target.value)}
              className="h-8 px-3 rounded-full bg-white dark:bg-[#1E1F20] text-xs font-medium text-slate-800 dark:text-[#E3E3E3] border border-slate-200 dark:border-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-[#0B57D0]"
            >
              {classesList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code || 'Lớp'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Title & Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
              {classNameTitle}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs font-medium whitespace-nowrap border-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
              Đang giảng dạy
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#747775] dark:text-[#8E918F] flex-wrap">
            <span className="font-mono font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">{classCode}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#747775] dark:text-[#8E918F]">group</span>
              {studentsCount} sinh viên
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#747775] dark:text-[#8E918F]">meeting_room</span>
              {roomName}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#747775] dark:text-[#8E918F]">event_note</span>
              {semester} ({academicYear})
            </span>
          </div>
        </div>

        {/* Quick Telemetry Chips */}
        <div className="flex items-center gap-2 self-start lg:self-auto bg-white dark:bg-[#1E1F20] p-1.5 rounded-2xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="px-4 py-1.5 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] flex flex-col items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#444746] dark:text-[#8E918F] font-semibold">
              TIẾN ĐỘ
            </span>
            <span className="text-base font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
              {completedSessionsCount} / {totalSessionsCount}
            </span>
          </div>
          <div className="px-4 py-1.5 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] flex flex-col items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#444746] dark:text-[#8E918F] font-semibold">
              CHUYÊN CẦN TB
            </span>
            <span className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {attendanceRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Class Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#1E1F20] rounded-full w-full border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none max-w-full overflow-x-auto mt-2">
        <Link
          href={classDetailUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors text-xs sm:text-sm whitespace-nowrap font-sans"
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          <span>Tổng quan</span>
        </Link>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs sm:text-sm font-medium whitespace-nowrap border-none cursor-pointer font-sans"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">event_repeat</span>
          <span>Ca học</span>
          <span className="px-2 py-0.5 rounded-full bg-white/70 text-[#041E49] dark:bg-[#282A2C] dark:text-[#A8C7FA] text-[11px] font-mono whitespace-nowrap">
            {totalSessionsCount} ca
          </span>
        </button>
        <Link
          href={`${classDetailUrl}?tab=members`}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors text-xs sm:text-sm whitespace-nowrap border-none cursor-pointer font-sans"
        >
          <span className="material-symbols-outlined text-[18px]">groups</span>
          <span>Sinh viên ({studentsCount})</span>
        </Link>
        <Link
          href={`${classDetailUrl}?tab=materials`}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors text-xs sm:text-sm whitespace-nowrap border-none cursor-pointer font-sans"
        >
          <span className="material-symbols-outlined text-[18px]">folder_shared</span>
          <span>Tài liệu môn học</span>
        </Link>
        <Link
          href={`${classDetailUrl}?tab=gradebook`}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors text-xs sm:text-sm whitespace-nowrap border-none cursor-pointer font-sans"
        >
          <span className="material-symbols-outlined text-[18px]">grade</span>
          <span>Bảng điểm số</span>
        </Link>
      </div>
    </div>
  );
};
