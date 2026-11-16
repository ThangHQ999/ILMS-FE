'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useStorageSummary, useStorageBreakdown } from '../../hooks/useStorage';
import { ManageStorageFilesModal } from '../modals/ManageStorageFilesModal';

interface CloudStorageCardProps {
  onSuccessToast?: () => void;
}

export function CloudStorageCard({ onSuccessToast }: CloudStorageCardProps) {
  const t = useTranslations('settings');
  const [isManageOpen, setIsManageOpen] = useState(false);

  const { data: summary, isLoading: isLoadingSummary } = useStorageSummary();
  const { data: breakdown, isLoading: isLoadingBreakdown } = useStorageBreakdown();

  if (isLoadingSummary || !summary) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent" />
      </div>
    );
  }

  const isNearLimit = summary.isStorageNearLimit || summary.usagePercentage >= 85;
  const progressColor = isNearLimit
    ? 'bg-rose-500'
    : summary.usagePercentage > 60
    ? 'bg-amber-500'
    : 'bg-[#0B57D0] dark:bg-[#A8C7FA]';

  return (
    <>
      <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">cloud</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                  Dung lượng lưu trữ Đám mây (Cloud Storage)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] text-[10px] font-bold">
                  {summary.planName}
                </span>
              </div>
              <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                Theo dõi và giải phóng dung lượng tài liệu, bài giảng và video của bạn
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsManageOpen(true)}
            className="px-4 py-2 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#0B57D0] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#A8C7FA] text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer border-none shadow-none"
          >
            <span className="material-symbols-outlined text-[16px]">folder_managed</span>
            <span>Giải phóng dung lượng</span>
          </button>
        </div>

        {/* Progress Bar Area */}
        <div className="p-5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C]/60 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1F1F1F] dark:text-[#E3E3E3] text-sm">
                {summary.usedStorageFormatted}
              </span>
              <span className="text-[#747775] dark:text-[#C4C7C5]">
                / {summary.maxStorageFormatted} ({summary.usagePercentage.toFixed(1)}%)
              </span>
            </div>
            {isNearLimit ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Sắp hết dung lượng
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                Dung lượng khả dụng
              </span>
            )}
          </div>

          {/* Bar */}
          <div className="w-full h-3 bg-white dark:bg-[#1E1F20] rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(1, summary.usagePercentage))}%` }}
            />
          </div>

          {/* Breakdown Pills */}
          {breakdown && breakdown.byFileType.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {breakdown.byFileType.map((item) => (
                <div
                  key={item.fileType}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1E1F20] text-xs text-[#444746] dark:text-[#C4C7C5]"
                >
                  <span className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
                  <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                    {item.fileType}:
                  </span>
                  <span>{item.totalBytesFormatted} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/30 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[20px]">
              inventory_2
            </span>
            <div className="flex flex-col">
              <span className="text-[#747775] dark:text-[#8E918F] text-[11px]">Tổng số tệp</span>
              <span className="font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {summary.totalFilesCount} tệp tin
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/30 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[20px]">
              upload_file
            </span>
            <div className="flex flex-col">
              <span className="text-[#747775] dark:text-[#8E918F] text-[11px]">Giới hạn tải lên</span>
              <span className="font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {summary.maxUploadFileSizeFormatted} / tệp
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/30 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[20px]">
              speed
            </span>
            <div className="flex flex-col">
              <span className="text-[#747775] dark:text-[#8E918F] text-[11px]">Trạng thái Cloud</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Tối ưu hóa AI CDN
              </span>
            </div>
          </div>
        </div>
      </div>

      <ManageStorageFilesModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        onFileDeleted={() => {
          onSuccessToast?.();
        }}
      />
    </>
  );
}
