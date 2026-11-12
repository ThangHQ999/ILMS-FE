'use client';

import React from 'react';
import { LessonSession } from '../types';

interface AttendanceHeroBannerProps {
  session: LessonSession;
  onBack: () => void;
  onMarkAllPresent: () => void;
  onRefresh: () => void;
  totalStudents: number;
  checkedCount: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  isLocked?: boolean;
}

export const AttendanceHeroBanner: React.FC<AttendanceHeroBannerProps> = ({
  session,
  onBack,
  onMarkAllPresent,
  onRefresh,
  totalStudents,
  checkedCount,
  presentCount,
  lateCount,
  absentCount,
  excusedCount,
  isLocked = false,
}) => {
  const presentPct = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0';
  const latePct = totalStudents > 0 ? ((lateCount / totalStudents) * 100).toFixed(1) : '0';
  const absentPct = totalStudents > 0 ? (((absentCount + excusedCount) / totalStudents) * 100).toFixed(1) : '0';

  return (
    <div className="flex flex-col gap-6">
      {/* Back Link & Fast Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[#0B57D0] hover:bg-[#F0F4F9] dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors group border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span>Quay lại Danh sách ca học</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#747775] dark:text-[#8E918F]">
            Mã ca: #{session.lessonSessionId || 'SES-2024-B1-09'}
          </span>
          <button className="flex items-center gap-1.5 bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors border-none shadow-none cursor-pointer">
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">download</span>
            <span>Xuất DS Excel</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 relative overflow-hidden border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border-none ${
                isLocked || checkedCount >= totalStudents
                  ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]'
                  : 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isLocked || checkedCount >= totalStudents ? 'bg-[#0D652D] dark:bg-[#81C995]' : 'bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse'
                }`} />
                {isLocked
                  ? `Đã chốt danh sách (${checkedCount}/${totalStudents})`
                  : checkedCount >= totalStudents
                  ? `Đã điểm danh (${checkedCount}/${totalStudents})`
                  : `Đang điểm danh (${checkedCount}/${totalStudents})`}
              </span>
              <span className="font-mono text-xs text-[#747775] dark:text-[#8E918F]">
                Học phần: {session.subjectCode || 'INT1434'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
              {session.className}
            </h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-1 text-xs text-[#747775] dark:text-[#8E918F]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">calendar_month</span>
                <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">{session.sessionDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">schedule</span>
                <span>{session.startTime} - {session.endTime} (Tiết {session.startShift}-{session.endShift})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">meeting_room</span>
                <span className="font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">{session.roomName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#8E918F]">badge</span>
                <span>{session.instructorName || 'ThS. Nguyễn Văn An'}</span>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Action */}
          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              onClick={onMarkAllPresent}
              className="flex items-center gap-2 bg-[#C4EED0] hover:bg-[#A8E5BA] text-[#0D652D] dark:bg-[#142E20] dark:hover:bg-[#1A3D2A] dark:text-[#81C995] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors border-none shadow-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>Đánh dấu tất cả Có mặt</span>
            </button>
            <button
              onClick={onRefresh}
              title="Làm mới trạng thái"
              className="w-10 h-10 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#444746] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#C4C7C5] flex items-center justify-center transition-colors border-none shadow-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 flex items-center justify-between border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div>
            <span className="text-[11px] font-semibold text-[#444746] dark:text-[#C4C7C5] uppercase tracking-wider block">Tổng sĩ số</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">{totalStudents}</span>
              <span className="text-xs text-[#444746] dark:text-[#C4C7C5]">sinh viên</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-[#444746] dark:text-[#8E918F]">
            <span className="material-symbols-outlined text-[22px]">group</span>
          </div>
        </div>

        <div className="bg-[#C4EED0] dark:bg-[#142E20] rounded-3xl p-6 flex items-center justify-between border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div>
            <span className="text-[11px] font-semibold text-[#0D652D] dark:text-[#81C995] uppercase tracking-wider block">Có mặt</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#0D652D] dark:text-[#81C995]">{presentCount}</span>
              <span className="text-[11px] font-mono text-[#0D652D] dark:text-[#81C995] px-1.5 py-0.5 rounded">{presentPct}%</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#0D652D]/15 dark:bg-[#81C995]/20 text-[#0D652D] dark:text-[#81C995] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
          </div>
        </div>

        <div className="bg-[#FCEBA4] dark:bg-[#3C2A1E] rounded-3xl p-6 flex items-center justify-between border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div>
            <span className="text-[11px] font-semibold text-[#725200] dark:text-[#FFB784] uppercase tracking-wider block">Đi muộn</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#725200] dark:text-[#FFB784]">{lateCount}</span>
              <span className="text-[11px] font-mono text-[#725200] dark:text-[#FFB784] px-1.5 py-0.5 rounded">{latePct}%</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#725200]/15 dark:bg-[#FFB784]/20 text-[#725200] dark:text-[#FFB784] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">schedule</span>
          </div>
        </div>

        <div className="bg-[#FAD2CF] dark:bg-[#3C1919] rounded-3xl p-6 flex items-center justify-between border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div>
            <span className="text-[11px] font-semibold text-[#B3261E] dark:text-[#F28B82] uppercase tracking-wider block">Vắng mặt</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#B3261E] dark:text-[#F28B82]">{absentCount + excusedCount}</span>
              <span className="text-[11px] font-mono text-[#B3261E] dark:text-[#F28B82] px-1.5 py-0.5 rounded">
                {absentPct}% ({excusedCount} phép)
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#B3261E]/15 dark:bg-[#F28B82]/20 text-[#B3261E] dark:text-[#F28B82] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">cancel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
