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
    <div className="flex flex-col gap-2 pt-1 pb-1">
      {/* Subheader Semester & Status Tag */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-xs tracking-wide">
          HỌC KỲ 1 • 2024-2025
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold normal-case">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Đang diễn ra tuần 08</span>
        </span>
      </div>

      {/* Main Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            {workspaceMode === 'student' ? 'Lớp học đang tham gia' : 'Các lớp học'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl font-normal">
            {workspaceMode === 'student'
              ? 'Theo dõi tiến độ học tập, bài tập cần nộp và chuẩn đầu ra năng lực của các lớp bạn đang theo học.'
              : 'Quản lý lớp đang giảng dạy, phê duyệt sinh viên, phân phối học liệu và theo dõi tiến độ học tập.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
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
              {onExportClick && (
                <button
                  onClick={onExportClick}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all shadow-xs border border-slate-200 dark:border-slate-700 whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  <span>Xuất báo cáo</span>
                </button>
              )}

              <button
                onClick={onCreateClick}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Tạo lớp học</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
