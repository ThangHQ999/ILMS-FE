'use client';

import React, { useEffect } from 'react';
import type { EditTool } from '../../types';

interface EditFloatingPaletteProps {
  activeTool: EditTool;
  onSelectTool: (tool: EditTool) => void;
  onOpenAddModal?: () => void;
  onCloseEditMode?: () => void;
  connectPendingLabel?: string | null;
  toastMessage?: string | null;
}

export function EditFloatingPalette({
  activeTool,
  onSelectTool,
  onOpenAddModal,
  onCloseEditMode,
  connectPendingLabel,
  toastMessage,
}: EditFloatingPaletteProps) {
  const tools: Array<{
    id: EditTool;
    icon: string;
    label: string;
    shortcut: string;
    description: string;
  }> = [
    {
      id: 'select',
      icon: 'near_me',
      label: 'Chọn & Di chuyển',
      shortcut: 'V',
      description: 'Chọn xem chi tiết và di chuyển node',
    },
    {
      id: 'add-node',
      icon: 'add_circle',
      label: 'Thêm Node tri thức',
      shortcut: 'A',
      description: 'Click vào khoảng trống canvas để tạo node',
    },
    {
      id: 'connect',
      icon: 'polyline',
      label: 'Nối quan hệ',
      shortcut: 'C',
      description: 'Click Node A rồi click Node B để nối',
    },
    {
      id: 'delete',
      icon: 'delete',
      label: 'Xóa đối tượng',
      shortcut: 'D',
      description: 'Click vào node để xóa khỏi đồ thị',
    },
  ];

  // Global hotkeys V, A, C, D, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'v' || e.key === 'V') onSelectTool('select');
      else if (e.key === 'a' || e.key === 'A') onSelectTool('add-node');
      else if (e.key === 'c' || e.key === 'C') onSelectTool('connect');
      else if (e.key === 'd' || e.key === 'D') onSelectTool('delete');
      else if (e.key === 'Escape' && onCloseEditMode) {
        onCloseEditMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTool, onCloseEditMode]);

  return (
    <>
      {/* Floating Toolbar (Top-Left of Canvas) */}
      <div className="absolute left-4 top-4 z-30 flex flex-col items-center gap-1.5 p-2 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 animate-fade-in">
        {/* Title badge */}
        <div className="w-full text-center pb-1 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Chỉnh sửa
          </span>
        </div>

        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className={`group relative p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer border-none ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#282A2C] hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={`${t.label} (Phím ${t.shortcut})`}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">{t.icon}</span>

              {/* Tooltip */}
              <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col gap-0.5 whitespace-nowrap rounded-xl bg-slate-900 dark:bg-slate-800 text-white px-3 py-1.5 text-left shadow-xl z-50">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <span>{t.label}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-700 text-[10px] font-mono">
                    {t.shortcut}
                  </span>
                </span>
                <span className="text-[10px] text-slate-300 font-normal">{t.description}</span>
              </div>
            </button>
          );
        })}

        {/* Quick Add Form Modal Trigger */}
        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="group relative p-2.5 rounded-xl text-slate-600 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#282A2C] hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center cursor-pointer border-none"
            title="Mở bảng tạo chi tiết"
          >
            <span className="material-symbols-outlined text-[20px]">post_add</span>
            <span className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-lg bg-slate-900 text-white px-2.5 py-1 text-[11px] font-semibold shadow-xl z-50">
              Form tạo nhanh node
            </span>
          </button>
        )}

        <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-700 my-1" />

        {/* Exit Edit Mode Button */}
        {onCloseEditMode && (
          <button
            type="button"
            onClick={onCloseEditMode}
            className="group relative p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center justify-center cursor-pointer border-none"
            title="Thoát chế độ chỉnh sửa (Esc)"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            <span className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-lg bg-slate-900 text-white px-2.5 py-1 text-[11px] font-semibold shadow-xl z-50">
              Thoát chỉnh sửa (Esc)
            </span>
          </button>
        )}
      </div>

      {/* Floating Connecting Helper Banner */}
      {connectPendingLabel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">polyline</span>
          <span>
            Đang chọn từ: <strong>{connectPendingLabel}</strong>. Hãy bấm vào node thứ hai để hoàn tất nối!
          </span>
        </div>
      )}

      {/* Floating Status Toast Banner */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 dark:text-blue-600 text-[18px]">
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
