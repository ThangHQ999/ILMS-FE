'use client';

import React from 'react';

export function ActiveWeekBanner() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 text-white flex items-center justify-between shadow-sm border-[3px] border-blue-500/40">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
          <span className="material-symbols-outlined text-blue-200 text-[24px]">calendar_today</span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
            Tuần học hiện tại: Tuần 09 (14/10 - 20/10)
          </p>
          <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
            Đang triển khai: Chương 3 - Tầng Giao vận (Transport Layer)
          </h2>
        </div>
      </div>
      <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-950 font-bold text-xs shadow-xs shrink-0">
        Trọng tâm thi giữa kỳ
      </span>
    </div>
  );
}

