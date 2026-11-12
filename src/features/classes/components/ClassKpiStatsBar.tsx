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
      </section>
    );
  }

  // Faculty Mode KPIs
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
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
        className={`group p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer relative overflow-hidden ${
          activeKpi === 'teaching'
            ? 'ring-2 ring-blue-500 border-blue-500/50'
            : 'border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Đang giảng dạy
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[22px]">school</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.activeClassesCount || 12}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            lớp học trực tiếp
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
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
        className={`group p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer relative overflow-hidden ${
          activeKpi === 'students'
            ? 'ring-2 ring-indigo-500 border-indigo-500/50'
            : 'border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tổng học viên
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[22px]">group</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.totalStudentsCount || 368}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            thành viên ghi danh
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
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
        className={`group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer relative overflow-hidden ring-1 ring-rose-500/10 ${
          activeKpi === 'pending'
            ? 'ring-2 ring-rose-500 border-rose-500/50'
            : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Cần xử lý ngay</span>
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
            {stats.needsAttentionCount || 7}
          </span>
          <span className="text-sm font-semibold text-rose-600/80 dark:text-rose-400/80">
            yêu cầu chờ
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 truncate">
          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            4 duyệt sinh viên
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            3 bài quá hạn chấm
          </span>
        </div>
      </div>
    </section>
  );
}
