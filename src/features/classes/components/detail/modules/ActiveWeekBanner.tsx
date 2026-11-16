'use client';

import React from 'react';

export function ActiveWeekBanner() {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] flex items-center justify-between shadow-sm dark:shadow-none border-none transition-all">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center shrink-0 border-none">
          <span className="material-symbols-outlined text-[24px]">calendar_today</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-blue-600 dark:text-[#A8C7FA] uppercase tracking-wider">
            Tuần học hiện tại: Tuần 09 (14/10 - 20/10)
          </p>
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] mt-0.5">
            Đang triển khai: Chương 3 - Tầng Giao vận (Transport Layer)
          </h2>
        </div>
      </div>
      <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-semibold text-xs shrink-0 border-none">
        Trọng tâm thi giữa kỳ
      </span>
    </div>
  );
}

