'use client';

import React from 'react';
import { CustomSelect } from '@/components/shared';

interface FieldItem {
  key: string;
  label: string;
  value: string;
  rows?: number;
}

interface DraftStudioPropertiesPanelProps {
  isOpen: boolean;
  editable: boolean;
  selectedNode: {
    id: string;
    kind: string;
    path: string;
    label: string;
  } | null;
  selectedNodeFields: {
    label: string;
    fields: FieldItem[];
  } | null;
  onToggle: () => void;
  onEditField: (field: string, value: string) => void;
  onDeleteNode: () => void;
  onOpenFullEditor?: () => void;
  onMoveExercise?: (destIdx: number) => void;
  entityOptions?: Array<{ value: number; label: string }>;
}

export function DraftStudioPropertiesPanel({
  isOpen,
  editable,
  selectedNode,
  selectedNodeFields,
  onToggle,
  onEditField,
  onDeleteNode,
  onOpenFullEditor,
  onMoveExercise,
  entityOptions,
}: DraftStudioPropertiesPanelProps) {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute top-16 right-3 z-20 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xl backdrop-blur-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
        title="Mở Bảng thuộc tính (Draw.io Format Panel)"
      >
        <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
          tune
        </span>
        <span>Thuộc tính</span>
      </button>
    );
  }

  return (
    <aside className="w-80 shrink-0 bg-white/95 dark:bg-slate-900/95 border-l border-slate-200/80 dark:border-slate-800 flex flex-col h-full backdrop-blur-md z-20 select-none shadow-sm text-left">
      {/* Panel Header */}
      <div className="h-10 px-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
            tune
          </span>
          <span>Bảng thuộc tính (Format Panel)</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
          title="Thu gọn bảng thuộc tính sang phải"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedNode && selectedNodeFields ? (
          <>
            {/* Node Metadata Card */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {selectedNode.kind}
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
                  {selectedNode.path}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
                {selectedNodeFields.label || selectedNode.label}
              </h4>
            </div>

            {/* Editable Properties Form */}
            <div className="space-y-3">
              {selectedNodeFields.fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{f.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">
                      [{f.key}]
                    </span>
                  </div>
                  <textarea
                    rows={f.rows || 3}
                    value={f.value}
                    readOnly={!editable}
                    onChange={(e) => onEditField(f.key, e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-sans leading-relaxed"
                  />
                </div>
              ))}
            </div>

            {/* Exercise Special Move Control */}
            {selectedNode.kind === 'Exercise' &&
              editable &&
              entityOptions &&
              onMoveExercise && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Chuyển bài tập sang thực thể khác:
                  </span>
                  <CustomSelect<number>
                    variant="pill"
                    value={Number(selectedNode.path.split('/')[1])}
                    onChange={(val) => onMoveExercise(val)}
                    options={entityOptions}
                  />
                </div>
              )}

            {/* Actions for Selected Node */}
            {editable && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {selectedNode.kind === 'KnowledgeEntity' && onOpenFullEditor && (
                  <button
                    type="button"
                    onClick={onOpenFullEditor}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">hub</span>
                    <span>Biên tập 5 tab chuyên sâu</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onDeleteNode}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Xóa node này (Phím Delete)</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty / Default Format Panel State with Shortcuts */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-center space-y-1.5">
              <span className="material-symbols-outlined text-[28px] text-blue-600 dark:text-blue-400">
                touch_app
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Chưa chọn phần tử nào
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Nhấp vào một node trên đồ thị để kiểm tra và chỉnh sửa thuộc tính tại đây.
              </p>
            </div>

            {/* Draw.io Shortcut Guide Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="material-symbols-outlined text-[16px] text-amber-500">
                  lightbulb
                </span>
                <span>Phím tắt &amp; Mẹo </span>
              </div>

              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[15px] text-blue-500 shrink-0 mt-0.5">
                    drag_indicator
                  </span>
                  <span><strong>Kéo thả khối:</strong> Kéo từ thanh bên trái thả vào bất kỳ đâu trên canvas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[15px] text-purple-500 shrink-0 mt-0.5">
                    timeline
                  </span>
                  <span><strong>Nối dây:</strong> Rê chuột vào node, kéo chấm tròn sang node đích để kết nối.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[15px] text-rose-500 shrink-0 mt-0.5">
                    backspace
                  </span>
                  <span><strong>Xóa nhanh:</strong> Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Delete</kbd> hoặc <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Backspace</kbd>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[15px] text-emerald-500 shrink-0 mt-0.5">
                    mouse
                  </span>
                  <span><strong>Sửa liên kết:</strong> Nhấp vào dây nối để đổi loại quan hệ hoặc xóa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[15px] text-indigo-500 shrink-0 mt-0.5">
                    fullscreen
                  </span>
                  <span><strong>Toàn màn hình:</strong> Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">F</kbd> hoặc <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Esc</kbd>.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
