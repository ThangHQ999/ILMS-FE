'use client';

import React from 'react';
import { EditTool } from '../../types';

interface EditFloatingPaletteProps {
  activeTool: EditTool;
  onSelectTool: (tool: EditTool) => void;
  toastMessage?: string | null;
}

export function EditFloatingPalette({
  activeTool,
  onSelectTool,
  toastMessage,
}: EditFloatingPaletteProps) {
  const tools: Array<{
    id: EditTool;
    icon: string;
    label: string;
    shortcut: string;
  }> = [
    { id: 'select', icon: 'near_me', label: 'Chọn & Di chuyển', shortcut: 'V' },
    { id: 'add-node', icon: 'add_circle', label: 'Thêm Node tri thức', shortcut: 'A' },
    { id: 'connect', icon: 'polyline', label: 'Nối quan hệ tiên quyết', shortcut: 'C' },
    { id: 'delete', icon: 'delete', label: 'Xóa đối tượng', shortcut: 'D' },
  ];

  return (
    <>
      {/* Floating Toolbar (Top-Left of Canvas) */}
      <div className="absolute left-4 top-4 z-30 flex flex-col gap-2 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className={`group relative p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={`${t.label} (${t.shortcut})`}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">{t.icon}</span>

              {/* Tooltip */}
              <span className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-lg bg-slate-900 text-white px-2.5 py-1 text-[11px] font-semibold shadow-xl z-50">
                {t.label} ({t.shortcut})
              </span>
            </button>
          );
        })}

        <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-800 my-0.5" />

        {/* Info Indicator */}
        <div
          className="flex items-center justify-center p-1 text-slate-400 cursor-help group relative"
          title="Đang bật Chế độ Chỉnh sửa"
        >
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-lg bg-slate-900 text-white px-2.5 py-1 text-[11px] font-semibold shadow-xl z-50">
            Chế độ Chỉnh sửa đồ thị
          </span>
        </div>
      </div>

      {/* Floating Status Toast Banner */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 dark:text-blue-600 text-[18px]">
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
