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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
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
          className={`group p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 ${
            activeKpi === 'enrolled'
              ? 'ring-2 ring-blue-500 border-blue-500/50'
              : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              LỚP ĐANG THEO HỌC
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {studentStats.enrolledClassesCount || 4}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              lớp học tín chỉ
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
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
          className={`group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer ring-1 ring-rose-500/10 ${
            activeKpi === 'tasks' ? 'ring-2 ring-rose-500' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>BÀI TẬP CẦN NỘP</span>
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-[22px]">assignment</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {studentStats.upcomingAssignmentsCount || 2}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              bài tập cần hoàn thành
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span className="material-symbols-outlined text-[16px]">alarm</span>
            <span className="truncate">1 bài đến hạn 23:59 hôm nay</span>
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
          className={`group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer ring-1 ring-emerald-500/10 ${
            activeKpi === 'gpa' ? 'ring-2 ring-emerald-500' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              ĐIỂM TRUNG BÌNH HỆ 10
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              8.8
            </span>
            <span className="text-sm font-semibold text-slate-400">
              / 10
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span className="truncate">+0.4 so với kỳ trước • Đạt chuẩn PLO</span>
          </div>
        </div>
      </div>
    );
  }

  // Faculty Mode KPIs
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
      {/* KPI 1: ĐANG GIẢNG DẠY */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onKpiClick?.('teaching')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onKpiClick?.('teaching');
          }
        }}
        className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm ${
          activeKpi === 'teaching'
            ? 'ring-2 ring-blue-500 border-blue-500/50'
            : 'border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            ĐANG GIẢNG DẠY
          </span>
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">school</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            {stats.activeClassesCount || 12}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            lớp học trực tiếp
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span className="truncate">100% đúng tiến độ phân phối chương trình</span>
        </div>
      </div>

      {/* KPI 2: TỔNG HỌC VIÊN */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onKpiClick?.('students')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onKpiClick?.('students');
          }
        }}
        className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm ${
          activeKpi === 'students'
            ? 'ring-2 ring-blue-500 border-blue-500/50'
            : 'border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            TỔNG HỌC VIÊN
          </span>
          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">group</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            {stats.totalStudentsCount || 368}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            thành viên ghi danh
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          <span className="truncate">+24 sinh viên tham gia tuần này</span>
        </div>
      </div>

      {/* KPI 3: CẦN XỬ LÝ NGAY */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onKpiClick?.('pending')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onKpiClick?.('pending');
          }
        }}
        className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm ${
          activeKpi === 'pending'
            ? 'ring-2 ring-rose-500 border-rose-500/50'
            : 'border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            CẦN XỬ LÝ NGAY
          </span>
          <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">assignment_late</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight font-display">
            {stats.needsAttentionCount || 7}
          </span>
          <span className="text-xs text-rose-600/90 dark:text-rose-400/90 font-medium">
            yêu cầu chờ
          </span>
        </div>

        <div className="mt-3 p-1.5 px-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 font-medium truncate">
          • 4 duyệt sinh viên • 3 bài quá hạn chấm
        </div>
      </div>
    </div>
  );
}
