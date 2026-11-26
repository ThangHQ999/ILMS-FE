'use client';

import React from 'react';
import Link from 'next/link';
import type { UnifiedAssessmentItem } from '../../schemas/assessment-hub.schema';

interface AssessmentRowCardProps {
  item: UnifiedAssessmentItem;
  mode: 'STUDENT' | 'TEACHER';
  onPublish?: (kind: 'QUIZ' | 'EXAM', id: string) => void;
  isPublishing?: boolean;
}

const KIND_META: Record<
  UnifiedAssessmentItem['kind'],
  { label: string; icon: string; badgeClass: string }
> = {
  ASSIGNMENT: {
    label: 'Bài tập',
    icon: 'assignment',
    badgeClass: 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]',
  },
  QUIZ: {
    label: 'Quiz',
    icon: 'quiz',
    badgeClass: 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]',
  },
  EXAM: {
    label: 'Kiểm tra',
    icon: 'school',
    badgeClass: 'bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784]',
  },
};

function formatDueText(iso?: string | null): string {
  if (!iso) return 'Không giới hạn';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Không giới hạn';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(
  item: UnifiedAssessmentItem
): { label: string; className: string } {
  switch (item.status) {
    case 'GRADED':
      return {
        label:
          typeof item.studentScore === 'number'
            ? `Đã chấm: ${item.studentScore}/${item.maxScore}`
            : 'Đã có điểm',
        className: 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]',
      };
    case 'SUBMITTED':
      return {
        label: 'Đã nộp (Chờ chấm)',
        className: 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]',
      };
    case 'OVERDUE':
      return {
        label: 'Quá hạn',
        className: 'bg-[#F9DEDC] dark:bg-[#3C1919] text-[#410E0B] dark:text-[#F28B82]',
      };
    case 'NEEDS_GRADING':
      return {
        label: `${item.pendingGradingCount ?? 0} bài chờ chấm`,
        className: 'bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784]',
      };
    case 'DRAFT':
      return {
        label: 'Bản nháp',
        className: 'bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#8E918F]',
      };
    case 'CLOSED':
      return {
        label: 'Đã kết thúc',
        className: 'bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#8E918F]',
      };
    case 'OPEN':
    case 'TODO':
    default:
      return {
        label: 'Đang mở',
        className: 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]',
      };
  }
}

function getActionLabel(item: UnifiedAssessmentItem, mode: 'STUDENT' | 'TEACHER'): string {
  if (mode === 'TEACHER') {
    if (item.kind === 'ASSIGNMENT') {
      return (item.pendingGradingCount ?? 0) > 0 ? 'Chấm bài' : 'Xem chi tiết';
    }
    if (item.kind === 'QUIZ') return 'Thống kê Quiz';
    return 'Quản lý đề';
  }
  if (item.status === 'GRADED' || item.status === 'SUBMITTED') return 'Xem bài';
  if (item.kind === 'QUIZ') return 'Làm Quiz';
  if (item.kind === 'EXAM') return 'Vào thi';
  return item.status === 'OVERDUE' ? 'Nộp muộn' : 'Nộp bài';
}

export function AssessmentRowCard({
  item,
  mode,
  onPublish,
  isPublishing = false,
}: AssessmentRowCardProps) {
  const kindMeta = KIND_META[item.kind];
  const statusBadge = getStatusBadge(item);
  const actionLabel = getActionLabel(item, mode);

  const specs: string[] = [
    item.classCode ? `${item.classCode} • ${item.className}` : item.className,
    kindMeta.label,
    `${item.maxScore} điểm`,
  ];
  if (item.durationMinutes) specs.push(`${item.durationMinutes} phút`);
  if (typeof item.questionCount === 'number' && item.questionCount > 0) {
    specs.push(`${item.questionCount} câu`);
  }

  return (
    <div className="bg-white dark:bg-[#1E1F20] hover:bg-[#F8FAFD] dark:hover:bg-[#282A2C] rounded-3xl p-5 shadow-sm dark:shadow-none border-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
      {/* Left: Icon + Title + Flat Specs */}
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${kindMeta.badgeClass}`}
        >
          <span className="material-symbols-outlined text-[22px]">{kindMeta.icon}</span>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
            {item.courseName && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] text-[11px] font-medium whitespace-nowrap">
                {item.courseName}
              </span>
            )}
          </div>

          <Link href={item.actionHref} className="block">
            <h3 className="text-sm sm:text-base font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors truncate">
              {item.title}
            </h3>
          </Link>

          <p className="text-xs text-[#444746] dark:text-[#8E918F] truncate">
            {specs.join(' • ')}
          </p>
        </div>
      </div>

      {/* Right: Deadline / Stats + Single Primary CTA */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[11px] text-[#444746] dark:text-[#8E918F]">
            {mode === 'TEACHER' && item.kind === 'ASSIGNMENT'
              ? `Đã nộp: ${item.submittedCount ?? 0}/${item.totalStudents ?? 0}`
              : 'Hạn nộp'}
          </div>
          <div className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] whitespace-nowrap">
            {formatDueText(item.dueDate)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'TEACHER' &&
            item.status === 'DRAFT' &&
            (item.kind === 'QUIZ' || item.kind === 'EXAM') &&
            onPublish && (
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => onPublish(item.kind as 'QUIZ' | 'EXAM', item.id)}
                className="px-4 py-2 rounded-full bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995] hover:brightness-95 text-xs font-semibold border-none cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                Công bố
              </button>
            )}

          <Link
            href={item.actionHref}
            className="px-5 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold transition-all whitespace-nowrap"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
