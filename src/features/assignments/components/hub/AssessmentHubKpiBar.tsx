'use client';

import React from 'react';
import type { AssessmentHubKpi } from '../../schemas/assessment-hub.schema';

interface AssessmentHubKpiBarProps {
  mode: 'STUDENT' | 'TEACHER';
  kpi: AssessmentHubKpi;
}

export function AssessmentHubKpiBar({ mode, kpi }: AssessmentHubKpiBarProps) {
  const cards =
    mode === 'STUDENT'
      ? [
          {
            label: 'Cần hoàn thành',
            value: String(kpi.todoCount),
            sub: 'Bài tập & Quiz đang mở',
            icon: 'pending_actions',
            iconBg: 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]',
          },
          {
            label: 'Quá hạn chưa nộp',
            value: String(kpi.overdueCount),
            sub: kpi.overdueCount > 0 ? 'Cần xử lý sớm' : 'Không có bài quá hạn',
            icon: 'event_busy',
            iconBg:
              kpi.overdueCount > 0
                ? 'bg-[#F9DEDC] dark:bg-[#3C1919] text-[#410E0B] dark:text-[#F28B82]'
                : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#8E918F]',
          },
          {
            label: 'Đã nộp (Chờ chấm)',
            value: String(kpi.submittedCount),
            sub: 'Đang chờ giảng viên phản hồi',
            icon: 'outgoing_mail',
            iconBg: 'bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784]',
          },
          {
            label: 'Điểm trung bình',
            value: kpi.averageScore !== null ? `${kpi.averageScore}` : '--',
            sub:
              kpi.gradedCount > 0
                ? `Từ ${kpi.gradedCount} bài đã có điểm`
                : 'Chưa có bài được chấm',
            icon: 'verified',
            iconBg: 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]',
          },
        ]
      : [
          {
            label: 'Cần chấm điểm',
            value: String(kpi.pendingGradingCount),
            sub:
              kpi.pendingGradingCount > 0
                ? 'Bài có bài nộp mới'
                : 'Chưa có bài chờ chấm',
            icon: 'grading',
            iconBg:
              kpi.pendingGradingCount > 0
                ? 'bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784]'
                : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#8E918F]',
          },
          {
            label: 'Đang mở nhận bài',
            value: String(kpi.openCount),
            sub: 'Đang diễn ra trong các lớp',
            icon: 'play_circle',
            iconBg: 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]',
          },
          {
            label: 'Bản nháp',
            value: String(kpi.draftCount),
            sub: 'Chưa công bố cho học viên',
            icon: 'edit_note',
            iconBg: 'bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#8E918F]',
          },
          {
            label: 'Tổng bài đánh giá',
            value: String(kpi.totalCount),
            sub: `${kpi.assignmentCount} bài tập • ${kpi.quizCount} quiz • ${kpi.examCount} đề thi`,
            icon: 'inventory_2',
            iconBg: 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]',
          },
        ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 shadow-sm dark:shadow-none border-none flex items-start justify-between gap-3"
        >
          <div className="min-w-0 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#444746] dark:text-[#8E918F] block truncate">
              {card.label}
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {card.value}
            </div>
            <p className="text-[11px] text-[#444746] dark:text-[#8E918F] truncate">
              {card.sub}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}
          >
            <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
