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
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-2 rounded-full bg-white dark:bg-[#1E1F20] backdrop-blur-2xl border-none shadow-none">
      {/* Minimap Toggle */}
      <button
        onClick={onToggleMinimap}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border-none ${
          isMinimapVisible
            ? 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
            : 'text-[#1F1F1F] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
        }`}
        title="Bật/Tắt Bản đồ thu nhỏ (M)"
        type="button"
      >
        <span className="material-symbols-outlined text-[17px]">map</span>
        <span>Bản đồ thu nhỏ</span>
      </button>

      <div className="w-px h-5 bg-[#E1E5EA] dark:bg-[#282A2C] my-auto" />

      {/* Center Segment Tree */}
      <button
        onClick={onCenterSegmentTree}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[#1F1F1F] dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-all cursor-pointer border-none"
        title="Tập trung vào Segment Tree"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
      </button>

      <div className="w-px h-5 bg-[#E1E5EA] dark:bg-[#282A2C] my-auto" />

      {/* Draw / Sketch Annotation Tool */}
      <button
        onClick={onToggleDrawingMode}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border-none ${
          isDrawingMode
            ? 'bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784]'
            : 'text-[#1F1F1F] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
        }`}
        title="Công cụ vẽ nháp / Khoanh vùng ghi chú (D)"
        type="button"
      >
        <span className="material-symbols-outlined text-[17px] text-[#725200] dark:text-[#FFB784]">draw</span>
        <span>{isDrawingMode ? 'Đang vẽ (D)' : 'Vẽ ghi chú'}</span>
      </button>

      {/* Clear Drawing Button */}
      {isDrawingMode && (
        <button
          onClick={onClearDrawing}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#B3261E] hover:bg-[#FAD2CF] dark:hover:bg-[#3C1919] transition-all cursor-pointer border-none"
          title="Xóa nét vẽ"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px]">delete_sweep</span>
        </button>
      )}
    </div>
  );
}
