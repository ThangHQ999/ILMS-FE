'use client';

import React from 'react';
import { deduplicateParagraphs } from '@/features/knowledge-graph/services/knowledge-graph.service';

interface DraftFloatingNodeCardProps {
  selectedNode: {
    path: string;
    kind: string;
    label: string;
    index?: number;
  };
  selectedNodeFields?: {
    label?: string;
    description?: string;
    kind?: string;
  } | null;
  editable: boolean;
  onClose: () => void;
  onEdit: () => void;
  onOpenFullEditor?: () => void;
  onDelete: () => void;
  onConnectFromThisNode?: () => void;
}

const KIND_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Topic: { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', icon: 'topic' },
  KnowledgeEntity: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', icon: 'psychology' },
  Definition: { bg: 'bg-sky-100 dark:bg-sky-950/60', text: 'text-sky-700 dark:text-sky-300', icon: 'menu_book' },
  Process: { bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', icon: 'account_tree' },
  ProcessStep: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400', icon: 'arrow_forward' },
  Exercise: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', icon: 'quiz' },
  ExerciseStep: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', icon: 'format_list_numbered' },
  Example: { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', icon: 'lightbulb' },
  Argument: { bg: 'bg-pink-100 dark:bg-pink-950/60', text: 'text-pink-700 dark:text-pink-300', icon: 'forum' },
};

export function DraftFloatingNodeCard({
  selectedNode,
  selectedNodeFields,
  editable,
  onClose,
  onEdit,
  onOpenFullEditor,
  onDelete,
  onConnectFromThisNode,
}: DraftFloatingNodeCardProps) {
  const displayLabel = selectedNodeFields?.label || selectedNode.label || 'Không có tên';
  const rawDescription = selectedNodeFields?.description || '';
  const cleanDescription = deduplicateParagraphs(rawDescription);
  const colorConfig = KIND_COLORS[selectedNode.kind] || {
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'schema',
  };

  return (
    <div className="fixed top-20 right-6 z-30 w-80 md:w-96 rounded-3xl bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-2xl flex flex-col gap-4 select-none animate-in slide-in-from-right-4 duration-200">
      {/* Header with Kind Pill and Close */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colorConfig.bg} ${colorConfig.text}`}
        >
          <span className="material-symbols-outlined text-[15px]">{colorConfig.icon}</span>
          <span>{selectedNode.kind}</span>
        </span>

        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-[#E3E3E3] p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none"
          title="Đóng bảng chi tiết"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Title & Path */}
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-slate-800 dark:text-[#E3E3E3] leading-snug break-words">
          {displayLabel}
        </h3>
        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate" title={selectedNode.path}>
          Path: {selectedNode.path}
        </p>
      </div>

      {/* Description / Content */}
      <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5 text-xs text-slate-600 dark:text-[#C4C7C5] leading-relaxed whitespace-pre-line border-t border-slate-100 dark:border-slate-800/80 pt-3">
        {cleanDescription ? (
          <p>{cleanDescription}</p>
        ) : (
          <p className="italic text-slate-400">Chưa có mô tả chi tiết cho thực thể này.</p>
        )}
      </div>

      {/* Action buttons */}
      {editable && (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Chỉnh sửa nhanh</span>
            </button>

            {selectedNode.kind === 'KnowledgeEntity' && onOpenFullEditor && (
              <button
                onClick={onOpenFullEditor}
                type="button"
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#282A2C] dark:hover:bg-[#333537] text-slate-700 dark:text-[#E3E3E3] font-medium text-xs transition-colors cursor-pointer border-none"
                title="Mở toàn bộ quy trình, bài tập, ví dụ của thực thể này"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onConnectFromThisNode && (
              <button
                onClick={onConnectFromThisNode}
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#282A2C] dark:hover:bg-[#333537] text-slate-700 dark:text-[#E3E3E3] font-medium text-xs transition-colors cursor-pointer border-none"
                title="Tạo liên kết từ nút này sang nút khác"
              >
                <span className="material-symbols-outlined text-[16px]">cable</span>
                <span>Nối liên kết</span>
              </button>
            )}

            <button
              onClick={onDelete}
              type="button"
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-medium text-xs transition-colors cursor-pointer border-none"
              title="Xóa nút này (Phím Delete)"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Xóa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
