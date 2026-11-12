'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { WorkspaceRoleMode } from '../types';

interface ClassHeroSectionProps {
  workspaceMode: WorkspaceRoleMode;
  onToggleWorkspaceMode?: (mode: WorkspaceRoleMode) => void;
  onCreateClick: () => void;
  onJoinClick?: () => void;
  onExportClick?: () => void;
}

export function ClassHeroSection({
  workspaceMode,
  onCreateClick,
  onJoinClick,
  onExportClick,
}: ClassHeroSectionProps) {
  const t = useTranslations('classes');

  return (
    <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-1">
      <div>
        {/* Semester & Timeline Tag */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-xs tracking-wide">
            HỌC KỲ 1 • 2024-2025
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Đang diễn ra tuần 08
          </span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {workspaceMode === 'student' ? 'Lớp học đang tham gia' : 'Các lớp học'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
          {workspaceMode === 'student'
            ? 'Theo dõi tiến độ học tập, bài tập cần nộp và chuẩn đầu ra năng lực của các lớp bạn đang theo học.'
            : 'Quản lý lớp đang giảng dạy, phê duyệt sinh viên, phân phối học liệu và theo dõi tiến độ học tập.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
        {workspaceMode === 'student' ? (
          <>
            {/* Lịch học tuần này */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                calendar_month
              </span>
              <span>Lịch học tuần này</span>
            </button>

            {/* Tham gia lớp bằng mã */}
            <button
              type="button"
              onClick={onJoinClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all transform active:scale-95 cursor-pointer group"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                key
              </span>
              <span>Tham gia lớp bằng mã</span>
            </button>
          </>
        ) : (
          <>
            {/* Xuất báo cáo */}
            <button
              onClick={onExportClick}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                download
              </span>
              <span>Xuất báo cáo</span>
            </button>

            {/* Tạo lớp học */}
            <button
              onClick={onCreateClick}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all transform active:scale-95 cursor-pointer group"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">
                add
              </span>
              <span>Tạo lớp học</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
