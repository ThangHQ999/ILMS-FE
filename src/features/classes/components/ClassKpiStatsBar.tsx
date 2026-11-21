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
    enrolledClassesCount: 0,
    upcomingAssignmentsCount: 0,
    avgProgressPercent: 0,
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
              {studentStats.enrolledClassesCount ?? 0}
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-[#8E918F]">
              lớp tín chỉ
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-[#81C995]">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span className="truncate">Theo kế hoạch học tập hiện tại</span>
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
              {studentStats.upcomingAssignmentsCount ?? 0}
            </span>
            <span className="text-sm font-semibold text-rose-600/80 dark:text-rose-400/80">
              bài tập cần hoàn thành
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 truncate">
            <span className="material-symbols-outlined text-[16px]">
              {(studentStats.upcomingAssignmentsCount ?? 0) > 0 ? 'alarm' : 'check_circle'}
            </span>
            <span className="truncate font-semibold">
              {(studentStats.upcomingAssignmentsCount ?? 0) > 0
                ? `${studentStats.upcomingAssignmentsCount} bài tập chưa hoàn thành`
                : 'Đã hoàn thành toàn bộ bài tập'}
            </span>
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
        className={`group p-5 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
          activeKpi === 'teaching'
            ? 'ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA]'
            : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wider">
            Đang giảng dạy
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[22px]">school</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold text-gray-900 dark:text-[#E3E3E3] tracking-tight">
            {stats.activeClassesCount ?? 0}
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-[#8E918F]">
            lớp học trực tiếp
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span className="truncate">Theo kế hoạch giảng dạy học kỳ</span>
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
        className={`group p-5 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
          activeKpi === 'students'
            ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
            : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wider">
            Tổng học viên
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[22px]">group</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold text-gray-900 dark:text-[#E3E3E3] tracking-tight">
            {stats.totalStudentsCount ?? 0}
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-[#8E918F]">
            thành viên ghi danh
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#0B57D0] dark:text-[#A8C7FA]">
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          <span className="truncate">Theo danh sách sinh viên thực tế</span>
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
        className={`group p-5 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
          activeKpi === 'pending'
            ? 'ring-2 ring-rose-500 dark:ring-rose-400'
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
          <span className="font-display text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
            {stats.needsAttentionCount ?? 0}
          </span>
          <span className="text-sm font-semibold text-rose-600/80 dark:text-rose-400/80">
            yêu cầu chờ
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-[#8E918F] truncate">
          <span className="inline-flex items-center gap-1 font-semibold text-gray-500 dark:text-[#8E918F]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                (stats.needsAttentionCount ?? 0) > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            {(stats.needsAttentionCount ?? 0) > 0
              ? `${stats.needsAttentionCount} yêu cầu đang chờ xử lý`
              : 'Không có yêu cầu chờ xử lý'}
          </span>
        </div>
      </div>
    </section>
  );
}
