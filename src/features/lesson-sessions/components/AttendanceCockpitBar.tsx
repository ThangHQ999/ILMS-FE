'use client';

import React from 'react';

interface AttendanceCockpitBarProps {
  totalCount: number;
  checkedCount: number;
  presenceRate: string;
  onBack: () => void;
  onSaveDraft: () => void;
  onLockSession: () => void;
  isSaving: boolean;
  isLocked: boolean;
  sidebarPaddingClass?: string;
  containerClass?: string;
}

export const AttendanceCockpitBar: React.FC<AttendanceCockpitBarProps> = ({
  totalCount,
  checkedCount,
  presenceRate,
  onBack,
  onSaveDraft,
  onLockSession,
  isSaving,
  isLocked,
  sidebarPaddingClass,
  containerClass = 'max-w-7xl',
}) => {
  const is100Percent = checkedCount >= totalCount && totalCount > 0;
  const uncheckedCount = Math.max(0, totalCount - checkedCount);

  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 right-0 z-40 transition-all duration-300 pointer-events-none px-4 sm:px-6 lg:px-8 ${
        sidebarPaddingClass ?? 'left-0 sm:left-64'
      }`}
    >
      <div
        className={`mx-auto w-full pointer-events-auto bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 ${containerClass}`}
      >
        {/* Left Progress Telemetry */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              is100Percent
                ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]'
                : checkedCount > 0
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                : 'bg-slate-100 text-slate-600 dark:bg-[#282A2C] dark:text-[#C4C7C5]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {is100Percent ? 'task_alt' : checkedCount > 0 ? 'how_to_reg' : 'fact_check'}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Đã kiểm tra {checkedCount}/{totalCount} sinh viên
              </span>
              {is100Percent ? (
                <span className="font-mono text-[11px] bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] px-3 py-0.5 rounded-full font-bold whitespace-nowrap">
                  ✓ 100% hoàn thành
                </span>
              ) : uncheckedCount > 0 ? (
                <span className="font-mono text-[11px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                  Còn {uncheckedCount} chưa điểm danh
                </span>
              ) : null}
            </div>
            <div className="text-xs text-[#747775] dark:text-[#8E918F] mt-0.5">
              Tỷ lệ hiện diện thực tế:{' '}
              <strong className="text-[#1F1F1F] dark:text-[#E3E3E3] font-bold">
                {presenceRate}%
              </strong>{' '}
              (Có mặt &amp; Đi muộn)
            </div>
          </div>
        </div>

        {/* Right Controls Cluster */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <button
            onClick={onBack}
            type="button"
            className="bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-4 py-2.5 text-xs whitespace-nowrap transition-colors border-none shadow-none cursor-pointer"
          >
            Quay lại
          </button>

          <button
            onClick={onSaveDraft}
            type="button"
            disabled={isSaving}
            className="bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-4 py-2.5 text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 border-none shadow-none cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Lưu nháp</span>
          </button>

          <button
            onClick={onLockSession}
            disabled={isSaving || isLocked}
            type="button"
            className={`font-semibold rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-all flex items-center gap-2 border-none shadow-xs ${
              isLocked
                ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] cursor-default'
                : 'bg-[#0B57D0] hover:bg-[#0842A0] text-white dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSaving ? 'sync' : isLocked ? 'check_circle' : 'how_to_reg'}
            </span>
            <span>
              {isSaving ? 'Đang lưu...' : isLocked ? 'Đã chốt thành công!' : 'Chốt danh sách điểm danh'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
