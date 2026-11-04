'use client';

import React from 'react';

interface FocusPillToolbarProps {
  isMinimapVisible: boolean;
  onToggleMinimap: () => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  onClearDrawing: () => void;
  onCenterSegmentTree: () => void;
}

export function FocusPillToolbar({
  isMinimapVisible,
  onToggleMinimap,
  isDrawingMode,
  onToggleDrawingMode,
  onClearDrawing,
  onCenterSegmentTree,
}: FocusPillToolbarProps) {
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl">
      {/* Minimap Toggle */}
      <button
        onClick={onToggleMinimap}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          isMinimapVisible
            ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Bật/Tắt Bản đồ thu nhỏ (M)"
        type="button"
      >
        <span className="material-symbols-outlined text-[17px]">map</span>
        <span>Bản đồ thu nhỏ</span>
      </button>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 my-auto" />

      {/* Center Segment Tree */}
      <button
        onClick={onCenterSegmentTree}
        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        title="Tập trung vào Segment Tree"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
      </button>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 my-auto" />

      {/* Draw / Sketch Annotation Tool */}
      <button
        onClick={onToggleDrawingMode}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          isDrawingMode
            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Công cụ vẽ nháp / Khoanh vùng ghi chú (D)"
        type="button"
      >
        <span className="material-symbols-outlined text-[17px] text-amber-500">draw</span>
        <span>{isDrawingMode ? 'Đang vẽ (D)' : 'Vẽ ghi chú'}</span>
      </button>

      {/* Clear Drawing Button */}
      {isDrawingMode && (
        <button
          onClick={onClearDrawing}
          className="w-9 h-9 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-all cursor-pointer"
          title="Xóa nét vẽ"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px]">delete_sweep</span>
        </button>
      )}
    </div>
  );
}
