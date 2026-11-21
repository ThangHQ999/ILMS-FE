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
}) => {
  const is100Percent = checkedCount >= totalCount && totalCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 py-3.5 px-6 sm:px-8 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md shadow-xl dark:shadow-none border-none z-40 flex items-center justify-between">
      {/* Left Progress Telemetry */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">verified</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              Đã kiểm tra {checkedCount}/{totalCount} sinh viên
            </span>
            {is100Percent ? (
              <span className="font-mono text-[10px] bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] px-3 py-1 rounded-full font-medium whitespace-nowrap border-none">
                100% hoàn thành
              </span>
            ) : (
              <span className="font-mono text-[10px] bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] px-3 py-1 rounded-full font-medium whitespace-nowrap border-none">
                Còn {totalCount - checkedCount} chưa điểm danh
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#747775] dark:text-[#8E918F]">
            Tỷ lệ hiện diện thực tế:{' '}
            <strong className="text-[#1F1F1F] dark:text-[#E3E3E3] font-bold">{presenceRate}%</strong> (Có mặt &amp; Đi muộn)
          </div>
        </div>
      </div>

      {/* Right Controls Cluster */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onBack}
          type="button"
          className="bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors border-none shadow-none cursor-pointer"
        >
          Quay lại
        </button>

        <button
          onClick={onSaveDraft}
          type="button"
          disabled={isSaving}
          className="bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 border-none shadow-none cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          <span>Lưu nháp</span>
        </button>

        <button
          onClick={onLockSession}
          disabled={isSaving || isLocked}
          type="button"
          className={`font-medium rounded-full px-6 py-2.5 text-xs whitespace-nowrap transition-colors flex items-center gap-2 border-none shadow-none ${
            isLocked
              ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] cursor-default'
              : 'bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] cursor-pointer'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isSaving ? 'sync' : isLocked ? 'check_circle' : 'how_to_reg'}
          </span>
          <span>
            {isSaving ? 'Đang lưu...' : isLocked ? 'Đã chốt thành công!' : 'Chốt danh sách điểm danh'}
          </span>
        </button>
      </div>
    </div>
  );
};
