'use client';

import React from 'react';

interface DraftFocusToolbarProps {
  editable: boolean;
  isMinimapVisible: boolean;
  onToggleMinimap: () => void;
  onOpenAddEntity: () => void;
  onOpenAddRelation: () => void;
  onOpenAddTopic: () => void;
  onAutoSpread: () => void;
  onFitView: () => void;
  onOpenAiRepair?: () => void;
}

export function DraftFocusToolbar({
  editable,
  isMinimapVisible,
  onToggleMinimap,
  onOpenAddEntity,
  onOpenAddRelation,
  onOpenAddTopic,
  onAutoSpread,
  onFitView,
  onOpenAiRepair,
}: DraftFocusToolbarProps) {
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-2 rounded-full bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl select-none">
      {/* Add Entity */}
      {editable && (
        <button
          onClick={onOpenAddEntity}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer border-none shadow-xs"
          title="Thêm thực thể tri thức mới"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px]">add_circle</span>
          <span>Thêm thực thể</span>
        </button>
      )}

      {/* Add Relation */}
      {editable && (
        <button
          onClick={onOpenAddRelation}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all cursor-pointer border-none shadow-xs"
          title="Nối quan hệ giữa 2 thực thể"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px]">cable</span>
          <span>Nối quan hệ</span>
        </button>
      )}

      {/* Add Topic */}
      {editable && (
        <button
          onClick={onOpenAddTopic}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#282A2C] dark:hover:bg-[#333537] text-slate-700 dark:text-[#E3E3E3] text-xs font-medium transition-all cursor-pointer border-none"
          title="Thêm chủ đề phân nhóm"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px]">bookmark_add</span>
          <span className="hidden sm:inline">Thêm chủ đề</span>
        </button>
      )}

      {/* AI Graph Validation & Auto-Repair */}
      {editable && onOpenAiRepair && (
        <button
          onClick={onOpenAiRepair}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 dark:from-purple-950/80 dark:to-blue-950/80 text-purple-800 dark:text-purple-300 text-xs font-bold transition-all cursor-pointer border-none shadow-xs"
          title="Quét kiểm tra lỗi đồ thị bằng DFS & AI sửa trực tiếp"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px] text-purple-600 dark:text-purple-400">
            troubleshoot
          </span>
          <span>Kiểm tra đồ thị</span>
        </button>
      )}

      {editable && <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 my-auto mx-0.5" />}

      {/* Auto Layout / Spread */}
      <button
        onClick={onAutoSpread}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium text-slate-700 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-all cursor-pointer border-none"
        title="Tự động sắp xếp lại các nút theo cấu trúc nhánh"
        type="button"
      >
        <span className="material-symbols-outlined text-[17px] text-amber-500">auto_fix_high</span>
        <span className="hidden md:inline">Tự động sắp xếp</span>
      </button>

      {/* Fit View */}
      <button
        onClick={onFitView}
        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-[#C4C7C5] hover:text-blue-600 dark:hover:text-[#A8C7FA] hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-all cursor-pointer border-none"
        title="Thu phóng vừa vặn toàn màn hình"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
      </button>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 my-auto mx-0.5" />

      {/* Minimap Toggle */}
      <button
        onClick={onToggleMinimap}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border-none ${
          isMinimapVisible
            ? 'bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA]'
            : 'text-slate-600 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#282A2C]'
        }`}
        title="Bật/Tắt Bản đồ thu nhỏ (Phím M)"
        type="button"
      >
        <span className="material-symbols-outlined text-[17px]">map</span>
        <span className="hidden sm:inline">Bản đồ thu nhỏ</span>
      </button>
    </div>
  );
}
