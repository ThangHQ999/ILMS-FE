'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ClassKpiStats, StudentClassKpiStats, WorkspaceRoleMode } from '../types';

interface ClassKpiStatsBarProps {
  workspaceMode?: WorkspaceRoleMode;
  stats: ClassKpiStats;
  studentStats?: StudentClassKpiStats;
  onKpiClick?: (type: string) => void;
  activeKpi?: string | null;
}

export function ClassKpiStatsBar({
  workspaceMode = 'faculty',
  stats,
  studentStats = {
    enrolledClassesCount: 4,
    upcomingAssignmentsCount: 2,
    avgProgressPercent: 88,
  },
  onKpiClick,
  activeKpi,
}: ClassKpiStatsBarProps) {
  const t = useTranslations('classes');

  if (workspaceMode === 'student') {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
        {/* KPI 1: Lớp đang theo học */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onKpiClick?.('enrolled')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onKpiClick?.('enrolled');
            }
          }}
          className={`group p-5 rounded-3xl bg-white dark:bg-[#1E1F20] transition-transform hover:-translate-y-0.5 duration-200 cursor-pointer shadow-sm dark:shadow-none border-none ${
            activeKpi === 'enrolled'
              ? 'bg-blue-50/50 dark:bg-[#162B4D]/40'
              : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wider">
              LỚP ĐANG THEO HỌC
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA] flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-gray-900 dark:text-[#E3E3E3] tracking-tight">
              {studentStats.enrolledClassesCount || 4}
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-[#8E918F]">
              lớp tín chỉ
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-[#81C995]">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span className="truncate">100% đúng tiến độ học tập</span>
          </div>
        </div>

        {/* KPI 2: Bài tập cần nộp */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onKpiClick?.('tasks')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onKpiClick?.('tasks');
            }
          }}
          className={`group p-5 rounded-3xl bg-white dark:bg-[#1E1F20] transition-transform hover:-translate-y-0.5 duration-200 cursor-pointer shadow-sm dark:shadow-none border-none ${
            activeKpi === 'tasks' ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>BÀI TẬP CẦN NỘP</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[22px]">assignment</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
              {studentStats.upcomingAssignmentsCount || 2}
            </span>
            <span className="text-sm font-semibold text-rose-600/80 dark:text-rose-400/80">
              bài tập cần hoàn thành
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 truncate">
            <span className="material-symbols-outlined text-[16px]">alarm</span>
            <span className="truncate font-semibold">1 bài đến hạn 23:59 hôm nay</span>
          </div>
        </div>

        {/* KPI 3: Điểm trung bình hệ 10 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onKpiClick?.('gpa')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onKpiClick?.('gpa');
            }
          }}
          className={`group p-5 rounded-3xl bg-white dark:bg-[#1E1F20] transition-transform hover:-translate-y-0.5 duration-200 cursor-pointer shadow-sm dark:shadow-none border-none ${
            activeKpi === 'gpa' ? 'bg-emerald-50/50 dark:bg-[#142E20]/40' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wider">
              ĐIỂM TRUNG BÌNH HỆ 10
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-emerald-600 dark:text-[#81C995] tracking-tight">
              8.8
            </span>
            <span className="text-sm font-semibold text-gray-400 dark:text-[#8E918F]">
              / 10
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-[#81C995]">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span className="truncate">+0.4 so với kỳ trước • Đạt chuẩn PLO</span>
          </div>
        </div>
      </section>
    );
  }

  // Faculty Mode KPIs (Đã loại bỏ 3 tab Đang giảng dạy, Tổng học viên, Cần xử lý ngay theo NV2)
  return null;
}
