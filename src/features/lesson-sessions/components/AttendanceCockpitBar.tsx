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
  // If class has no students, hide the cockpit floating action bar
  if (totalCount === 0) return null;

  const is100Percent = checkedCount >= totalCount && totalCount > 0;
  const uncheckedCount = Math.max(0, totalCount - checkedCount);

  return (
    <div
      className={`fixed bottom-3 sm:bottom-6 right-0 z-40 transition-all duration-300 pointer-events-none px-3 sm:px-6 lg:px-8 ${
        sidebarPaddingClass ?? 'left-0'
      }`}
    >
      <div
        className={`mx-auto w-full pointer-events-auto bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 ${containerClass}`}
      >
        {/* Left Progress Telemetry */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              is100Percent
                ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]'
                : checkedCount > 0
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                : 'bg-slate-100 text-slate-600 dark:bg-[#282A2C] dark:text-[#C4C7C5]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[22px]">
              {is100Percent ? 'task_alt' : checkedCount > 0 ? 'how_to_reg' : 'fact_check'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {checkedCount}/{totalCount} sinh viên
              </span>
              {is100Percent ? (
                <span className="font-mono text-[10px] sm:text-[11px] bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                  ✓ 100% xong
                </span>
              ) : uncheckedCount > 0 ? (
                <span className="font-mono text-[10px] sm:text-[11px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                  Còn {uncheckedCount}
                </span>
              ) : null}
            </div>
            <div className="text-[11px] sm:text-xs text-[#747775] dark:text-[#8E918F]">
              Tỷ lệ: <strong className="text-[#1F1F1F] dark:text-[#E3E3E3] font-bold">{presenceRate}%</strong>
            </div>
          </div>
        </div>

        {/* Right Controls Cluster */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2.5 justify-end">
          <button
            onClick={onBack}
            type="button"
            className="bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs text-center whitespace-nowrap transition-colors border-none shadow-none cursor-pointer"
          >
            Quay lại
          </button>

          <button
            onClick={onSaveDraft}
            type="button"
            disabled={isSaving}
            className="bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs text-center whitespace-nowrap transition-colors flex items-center justify-center gap-1 border-none shadow-none cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px]">save</span>
            <span>Lưu</span>
          </button>

          <button
            onClick={onLockSession}
            disabled={isSaving || isLocked}
            type="button"
            className={`font-semibold rounded-full px-3 sm:px-5 py-2 sm:py-2.5 text-xs text-center whitespace-nowrap transition-all flex items-center justify-center gap-1 border-none shadow-xs truncate ${
              isLocked
                ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] cursor-default'
                : 'bg-[#0B57D0] hover:bg-[#0842A0] text-white dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              {isSaving ? 'sync' : isLocked ? 'check_circle' : 'how_to_reg'}
            </span>
            <span className="truncate">
              {isSaving ? 'Lưu...' : isLocked ? 'Đã chốt' : 'Chốt'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
