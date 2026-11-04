'use client';

import React from 'react';
import { KnowledgeNodeData } from '../../types';

interface FloatingNodeCardProps {
  node: KnowledgeNodeData | null;
  onClose: () => void;
  onOpenLesson?: (node: KnowledgeNodeData) => void;
  onAskAiTutor?: (node: KnowledgeNodeData) => void;
}

export function FloatingNodeCard({
  node,
  onClose,
  onOpenLesson,
  onAskAiTutor,
}: FloatingNodeCardProps) {
  if (!node) return null;

  return (
    <div className="fixed z-40 w-96 rounded-2xl p-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 right-8 top-24 animate-scale-up">
      {/* Header Tag & Close Button */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-[11px] font-bold text-blue-700 dark:text-blue-300">
          <span className="material-symbols-outlined text-[15px] text-blue-700 dark:text-blue-300">
            gps_fixed
          </span>
          <span>ĐANG HỌC TẬP TRUNG • ĐIỂM NGHẼN</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-full transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Title Block */}
      <div className="mt-3 mb-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          {node.label}
        </h3>
        {node.sublabel && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            ({node.sublabel})
          </p>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-3.5">
        {node.description}
      </p>

      {/* Stats 3-column Box */}
      <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 grid grid-cols-3 gap-2 text-center mb-3.5 shadow-sm">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            TIẾN ĐỘ
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-bold text-base leading-tight mt-0.5 block">
            {node.masteryScore}%
          </span>
        </div>
        <div className="border-x border-slate-200 dark:border-slate-700 px-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            THỜI GIAN
          </span>
          <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold text-xs leading-tight mt-0.5 block">
            {node.complexity?.time || 'O(log N)'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            BỘ NHỚ
          </span>
          <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold text-xs leading-tight mt-0.5 block">
            {node.complexity?.space || 'O(N)'}
          </span>
        </div>
      </div>

      {/* Progress Row */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Độ thành thạo kiến thức
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">
            {node.masteryScore}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-500"
            style={{ width: `${node.masteryScore}%` }}
          />
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-5 gap-2">
        <button
          onClick={() => onOpenLesson?.(node)}
          className="col-span-3 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
          type="button"
        >
          <span>Vào bài học ngay</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
        <button
          onClick={() => onAskAiTutor?.(node)}
          className="col-span-2 flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px] text-purple-600 dark:text-purple-400">
            neurology
          </span>
          <span>Gia sư AI</span>
        </button>
      </div>
    </div>
  );
}
