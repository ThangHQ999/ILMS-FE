'use client';

import React from 'react';

export interface SyllabusAuditChecklistCardProps {
  onExportReportClick: () => void;
}

export function SyllabusAuditChecklistCard({
  onExportReportClick,
}: SyllabusAuditChecklistCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[20px]">
            verified
          </span>
          <span>Kiểm tra Chất lượng (Audit)</span>
        </h4>
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          94/100
        </span>
      </div>

      {/* Checklist */}
      <ul className="space-y-2.5 text-xs">
        <li className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] shrink-0 mt-0.5">
            check_circle
          </span>
          <span className="leading-snug">
            Tất cả các bài học đều có Mục tiêu bài giảng rõ ràng
          </span>
        </li>

        <li className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] shrink-0 mt-0.5">
            check_circle
          </span>
          <span className="leading-snug">
            Có ít nhất 1 bài tập thực hành tương tác mỗi 2 tuần
          </span>
        </li>

        <li className="flex items-start gap-2.5 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5">
            pending
          </span>
          <span className="leading-snug">
            Bài 3.3 đang thiếu tài liệu đọc thêm (RFC 793 / RFC 5681)
          </span>
        </li>
      </ul>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onExportReportClick}
          className="w-full inline-flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer"
        >
          <span>Xuất Báo cáo Giáo trình PDF cho Trưởng Bộ môn</span>
          <span className="material-symbols-outlined text-[15px]">download</span>
        </button>
      </div>
    </div>
  );
}
