'use client';

import React from 'react';

interface DraftStudioHeaderProps {
  title: string;
  nodeCount: number;
  edgeCount: number;
  editable: boolean;
  isLeftPaletteOpen: boolean;
  isRightInspectorOpen: boolean;
  isAutoSpreading?: boolean;
  onToggleLeftPalette: () => void;
  onToggleRightInspector: () => void;
  onAutoSpread: () => void;
  onFitView: () => void;
  onOpenAddEntity: () => void;
  onOpenAddTopic: () => void;
  onOpenAddRelation: () => void;
  onOpenJsonStudio?: () => void;
  onOpenAiRepair?: () => void;
  onExitFullscreen: () => void;
}

export function DraftStudioHeader({
  title,
  nodeCount,
  edgeCount,
  editable,
  isLeftPaletteOpen,
  isRightInspectorOpen,
  isAutoSpreading,
  onToggleLeftPalette,
  onToggleRightInspector,
  onAutoSpread,
  onFitView,
  onOpenAddEntity,
  onOpenAddTopic,
  onOpenAddRelation,
  onOpenJsonStudio,
  onOpenAiRepair,
  onExitFullscreen,
}: DraftStudioHeaderProps) {
  return (
    <header className="h-14 px-4 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 select-none z-30 shadow-md text-slate-100 w-full">
      {/* Left: Brand, Title & Left Palette Toggle */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleLeftPalette}
          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
            isLeftPaletteOpen
              ? 'bg-blue-600/20 border-blue-500/60 text-blue-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title={isLeftPaletteOpen ? 'Thu gọn thư viện khối & tìm kiếm (Alt+1)' : 'Mở thư viện khối & tìm kiếm (Alt+1)'}
        >
          <span className="material-symbols-outlined text-[19px]">
            {isLeftPaletteOpen ? 'vertical_split' : 'view_sidebar'}
          </span>
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[16px]">account_tree</span>
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[200px] sm:max-w-[320px]">
            {title || 'Đồ thị bản nháp theo revision'}
          </h2>
          <span className="hidden sm:inline-flex font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold shrink-0">
            {nodeCount} nút · {edgeCount} liên kết
          </span>
        </div>
      </div>

      {/* Middle: Canvas Quick Tools */}
      <div className="hidden md:flex items-center gap-2">
        {editable && (
          <>
            <button
              type="button"
              onClick={onOpenAddEntity}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Thêm Thực thể Tri thức mới"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Thực thể</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddRelation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Tạo liên kết quan hệ giữa 2 thực thể"
            >
              <span className="material-symbols-outlined text-[16px]">timeline</span>
              <span>+ Quan hệ</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddTopic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Thêm Chủ đề gom nhóm"
            >
              <span className="material-symbols-outlined text-[16px]">folder_special</span>
              <span>+ Chủ đề</span>
            </button>
          </>
        )}

        {onOpenJsonStudio && (
          <button
            type="button"
            onClick={onOpenJsonStudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer shadow-xs"
            title="Xem mã JSON đồ thị hoặc chèn nhóm thực thể mới bằng code JSON"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-400">data_object</span>
            <span>&lt;/&gt; JSON</span>
          </button>
        )}

        {onOpenAiRepair && (
          <button
            type="button"
            onClick={onOpenAiRepair}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/40 to-blue-600/40 hover:from-purple-600/60 hover:to-blue-600/60 text-purple-200 text-xs font-bold border border-purple-500/50 transition-colors cursor-pointer shadow-xs"
            title="Quét kiểm tra lỗi đồ thị bằng thuật toán DFS & gọi AI sửa trực tiếp"
          >
            <span className="material-symbols-outlined text-[16px] text-purple-400">troubleshoot</span>
            <span>Kiểm tra đồ thị (AI)</span>
          </button>
        )}

        <div className="h-5 w-px bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={onAutoSpread}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          title="Tự động giãn cách và xếp phân cấp cây tri thức"
        >
          <span className={`material-symbols-outlined text-[16px] ${isAutoSpreading ? 'animate-spin' : ''}`}>
            unfold_more
          </span>
          <span>Tách &amp; Giãn cách</span>
        </button>

        <button
          type="button"
          onClick={onFitView}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          title="Căn giữa toàn bộ đồ thị (Fit View)"
        >
          <span className="material-symbols-outlined text-[18px]">fit_screen</span>
        </button>
      </div>

      {/* Right: Right Inspector Toggle & Exit Fullscreen */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleRightInspector}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            isRightInspectorOpen
              ? 'bg-blue-600/20 border-blue-500/60 text-blue-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          title={isRightInspectorOpen ? 'Ẩn bảng thuộc tính bên phải' : 'Hiện bảng thuộc tính bên phải'}
        >
          <span className="material-symbols-outlined text-[17px]">edit_note</span>
          <span className="hidden sm:inline">Thuộc tính</span>
        </button>

        <button
          type="button"
          onClick={onExitFullscreen}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          title="Thoát toàn màn hình (Phím Esc)"
        >
          <span className="material-symbols-outlined text-[17px]">fullscreen_exit</span>
          <span>Thoát</span>
        </button>
      </div>
    </header>
  );
}
