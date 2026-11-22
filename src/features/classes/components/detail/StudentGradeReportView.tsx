'use client';

import React, { useState } from 'react';
import { useMyGradeReport } from '../../hooks/useGradeReports';
import { useMyOutcomeAttainment } from '@/features/outcomes';
import type { AttainmentStatus } from '@/features/outcomes/schemas/outcome-attainment.schema';
import type { BloomLevel } from '@/features/outcomes/schemas/plo.schema';

export interface StudentGradeReportViewProps {
  classId: string;
  courseId?: string;
}

const BLOOM_BADGES: Record<BloomLevel, { bg: string; text: string; label: string }> = {
  REMEMBER: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', label: 'Nhớ (L1)' },
  UNDERSTAND: { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', label: 'Hiểu (L2)' },
  APPLY: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', label: 'Vận dụng (L3)' },
  ANALYZE: { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', label: 'Phân tích (L4)' },
  EVALUATE: { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', label: 'Đánh giá (L5)' },
  CREATE: { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', label: 'Sáng tạo (L6)' },
};

const ATTAINMENT_STATUS_CONFIG: Record<
  AttainmentStatus,
  { bg: string; text: string; label: string; icon: string }
> = {
  EXCEEDED: {
    bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    label: 'Vượt chuẩn',
    icon: 'stars',
  },
  MET: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    label: 'Đạt chuẩn',
    icon: 'check_circle',
  },
  APPROACHING: {
    bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'Tiệm cận',
    icon: 'trending_up',
  },
  BELOW: {
    bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300',
    label: 'Chưa đạt',
    icon: 'warning',
  },
  NOT_ASSESSED: {
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
    label: 'Chưa đánh giá',
    icon: 'schedule',
  },
};

function formatScore(score: number | null | undefined): React.ReactNode {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
        Chưa có điểm
      </span>
    );
  }

  // Format 8.5 -> 8,5 / 10 and 0 -> 0 / 10
  const formatted = String(score).replace('.', ',');
  return (
    <div className="flex items-baseline justify-end">
      <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
        {formatted}
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">/ 10</span>
    </div>
  );
}

function formatUpdatedAt(isoString?: string | null): string {
  if (!isoString) return '16:00 – 15/11/2024';
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hours, minutes] = match;
    return `${hours}:${minutes} – ${day}/${month}/${year}`;
  }
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '16:00 – 15/11/2024';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} – ${day}/${month}/${year}`;
}

export function StudentGradeReportView({ classId, courseId }: StudentGradeReportViewProps) {
  const { data, isLoading, isError, error, refetch } = useMyGradeReport(classId);
  const {
    data: outcomeData,
    isLoading: isOutcomeLoading,
  } = useMyOutcomeAttainment(classId, courseId);

  const [expandedCloId, setExpandedCloId] = useState<string | null>(null);

  // Loading State
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-6 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="p-6 space-y-4">
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
        </div>
      </div>
    );
  }

  // Error & 404 / 403 States
  if (isError || !data) {
    const status =
      (error as { status?: number; httpStatus?: number })?.status ||
      (error as { status?: number; httpStatus?: number })?.httpStatus ||
      (error as { response?: { status?: number } })?.response?.status;

    const is404 = status === 404;
    const is403 = status === 403;

    if (is404) {
      return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 shadow-sm p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">assignment_late</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Chưa có bảng điểm
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Không tìm thấy bảng điểm. Giảng viên chưa công bố bảng điểm cho lớp học này.
          </p>
        </div>
      );
    }

    if (is403) {
      return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/60 shadow-sm p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">lock</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Không có quyền truy cập
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Bạn không có quyền xem bảng điểm của lớp này. Vui lòng liên hệ giảng viên.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/60 shadow-sm p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">error_outline</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Không thể tải dữ liệu bảng điểm
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {(error as Error)?.message || 'Đã có lỗi xảy ra khi kết nối tới máy chủ.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const studentDisplayName = data.studentName || '';

  return (
    <div className="space-y-6">
      {/* 1. Bảng Điểm Thành Phần */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {/* Header Thẻ */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Bảng điểm cá nhân
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Học viên: {studentDisplayName}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium self-start sm:self-auto">
            <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500">
              visibility
            </span>
            <span>Chế độ chỉ đọc</span>
          </div>
        </div>

        {/* Bảng điểm 2 cột */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="w-2/3 py-3.5 pl-6 pr-4 font-semibold" scope="col">
                  Thành phần
                </th>
                <th className="w-1/3 py-3.5 pr-6 pl-4 text-right font-semibold" scope="col">
                  Điểm
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {/* 1. Chuyên cần */}
              <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 pl-6 pr-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">fact_check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base text-slate-900 dark:text-slate-100">
                        Chuyên cần
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Điểm danh &amp; tham gia bài học
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-6 pl-4 align-middle text-right">
                  {formatScore(data.attendanceScore)}
                </td>
              </tr>

              {/* 2. Giữa kỳ */}
              <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors bg-slate-50/30 dark:bg-slate-800/20">
                <td className="py-4 pl-6 pr-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        assignment_turned_in
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base text-slate-900 dark:text-slate-100">
                        Giữa kỳ
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Kiểm tra giữa kỳ tập trung
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-6 pl-4 align-middle text-right">
                  {formatScore(data.midtermScore)}
                </td>
              </tr>

              {/* 3. Cuối kỳ */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 pl-6 pr-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">history_edu</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base text-slate-900 dark:text-slate-100">
                        Cuối kỳ
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Thi kết thúc học phần
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-6 pl-4 align-middle text-right">
                  {formatScore(data.finalScore)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Thẻ */}
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500">
              update
            </span>
            Cập nhật lần cuối: {formatUpdatedAt(data.updatedAt)}
          </span>
          <span className="italic text-slate-400 dark:text-slate-500">
            Chỉ hiển thị điểm thành phần
          </span>
        </div>
      </div>

      {/* 2. Báo cáo Đạt Chuẩn Đầu Ra (Outcome Attainment Cá Nhân) */}
      {outcomeData && outcomeData.cloAttainments && outcomeData.cloAttainments.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  Chuẩn Đầu Ra Cá Nhân
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {outcomeData.metCloCount} / {outcomeData.totalCloCount} CLO Đạt
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                Mức độ Thành Thục Chuẩn CLO &amp; PLO
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Tỷ lệ hoàn thành:</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {outcomeData.overallAttainmentRate}%
              </span>
            </div>
          </div>

          {/* CLO Items list */}
          <div className="space-y-3">
            {outcomeData.cloAttainments.map((clo) => {
              const bloom = BLOOM_BADGES[clo.bloomLevel] || BLOOM_BADGES.APPLY;
              const status =
                ATTAINMENT_STATUS_CONFIG[clo.status] || ATTAINMENT_STATUS_CONFIG.NOT_ASSESSED;
              const isExpanded = expandedCloId === clo.cloId;

              return (
                <div
                  key={clo.cloId}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {clo.cloCode}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {clo.cloDescription || clo.cloCode}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${bloom.bg} ${bloom.text}`}
                          >
                            {bloom.label}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Ngưỡng chuẩn: {clo.targetScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">
                          Điểm thành thục
                        </span>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                          {clo.attainmentScore.toFixed(1)} / 100
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {status.icon}
                        </span>
                        <span>{status.label}</span>
                      </span>

                      {clo.conceptBreakdowns && clo.conceptBreakdowns.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedCloId(isExpanded ? null : clo.cloId)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          title="Xem chi tiết các khái niệm"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Concept Breakdowns */}
                  {isExpanded && clo.conceptBreakdowns && clo.conceptBreakdowns.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {clo.conceptBreakdowns.map((c) => (
                        <div
                          key={c.conceptId}
                          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {c.conceptName}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              Trọng số: {Math.round(c.weight * 100)}%
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {c.accuracy.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
