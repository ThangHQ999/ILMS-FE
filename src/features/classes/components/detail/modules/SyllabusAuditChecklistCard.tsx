'use client';

import React from 'react';

export interface SyllabusAuditChecklistCardProps {
  onExportReportClick: () => void;
}

export function SyllabusAuditChecklistCard({
  onExportReportClick,
}: SyllabusAuditChecklistCardProps) {
  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 dark:text-[#81C995] text-[20px]">
            verified
          </span>
          <span>Kiểm tra Chất lượng (Audit)</span>
        </h4>
        <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] border-none">
          94/100
        </span>
      </div>

      {/* Checklist */}
      <ul className="space-y-2.5 text-xs">
        <li className="flex items-start gap-2.5 text-gray-800 dark:text-[#E3E3E3]">
          <span className="material-symbols-outlined text-emerald-600 dark:text-[#81C995] text-[18px] shrink-0 mt-0.5">
            check_circle
          </span>
          <span className="leading-snug">
            Tất cả các bài học đều có Mục tiêu bài giảng rõ ràng
          </span>
        </li>

        <li className="flex items-start gap-2.5 text-gray-800 dark:text-[#E3E3E3]">
          <span className="material-symbols-outlined text-emerald-600 dark:text-[#81C995] text-[18px] shrink-0 mt-0.5">
            check_circle
          </span>
          <span className="leading-snug">
            Có ít nhất 1 bài tập thực hành tương tác mỗi 2 tuần
          </span>
        </li>

        <li className="flex items-start gap-2.5 text-amber-700 dark:text-[#FFB784]">
          <span className="material-symbols-outlined text-amber-600 dark:text-[#FFB784] text-[18px] shrink-0 mt-0.5">
            pending
          </span>
          <span className="leading-snug">
            Bài 3.3 đang thiếu tài liệu đọc thêm (RFC 793 / RFC 5681)
          </span>
        </li>
      </ul>

      {/* Action Footer */}
      <div className="pt-2 border-t border-black/5 dark:border-white/5">
        <button
          type="button"
          onClick={onExportReportClick}
          className="w-full inline-flex items-center justify-center gap-1.5 text-blue-600 dark:text-[#A8C7FA] text-xs font-semibold hover:underline cursor-pointer border-none bg-transparent"
        >
          <span>Xuất Báo cáo Giáo trình PDF cho Trưởng Bộ môn</span>
          <span className="material-symbols-outlined text-[15px]">download</span>
        </button>
      </div>
    </div>
  );
}

