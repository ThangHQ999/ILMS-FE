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
    <div className="fixed z-40 w-96 rounded-3xl p-6 bg-white dark:bg-[#1E1F20] border-none shadow-none text-[#1F1F1F] dark:text-[#E3E3E3] right-8 top-24 animate-scale-up">
      {/* Header Tag & Close Button */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] border-none text-[11px] font-bold text-[#041E49] dark:text-[#A8C7FA]">
          <span className="material-symbols-outlined text-[15px] text-[#041E49] dark:text-[#A8C7FA]">
            gps_fixed
          </span>
          <span>ĐANG HỌC TẬP TRUNG • ĐIỂM NGHẼN</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] p-1.5 rounded-full transition-colors cursor-pointer border-none"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Title Block */}
      <div className="mt-2 mb-2">
        <h3 className="text-xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-tight">
          {node.label}
        </h3>
        {node.sublabel && (
          <p className="text-xs text-[#444746] dark:text-[#C4C7C5] font-medium mt-0.5">
            ({node.sublabel})
          </p>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-[#444746] dark:text-[#C4C7C5] leading-relaxed font-normal mb-4">
        {node.description}
      </p>

      {/* Stats 3-column Box */}
      <div className="bg-[#F0F4F9] dark:bg-[#282A2C] border-none rounded-2xl p-3.5 grid grid-cols-3 gap-2 text-center mb-4 shadow-none">
        <div>
          <span className="text-[10px] text-[#444746] dark:text-[#8E918F] font-semibold uppercase tracking-wider block">
            TIẾN ĐỘ
          </span>
          <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-bold text-base leading-tight mt-0.5 block">
            {node.masteryScore}%
          </span>
        </div>
        <div className="px-1">
          <span className="text-[10px] text-[#444746] dark:text-[#8E918F] font-semibold uppercase tracking-wider block">
            THỜI GIAN
          </span>
          <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-mono font-semibold text-xs leading-tight mt-0.5 block">
            {node.complexity?.time || 'O(log N)'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#444746] dark:text-[#8E918F] font-semibold uppercase tracking-wider block">
            BỘ NHỚ
          </span>
          <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-mono font-semibold text-xs leading-tight mt-0.5 block">
            {node.complexity?.space || 'O(N)'}
          </span>
        </div>
      </div>

      {/* Progress Row */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#444746] dark:text-[#8E918F] text-[11px]">
            Độ thành thạo kiến thức
          </span>
          <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-bold font-mono">
            {node.masteryScore}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#131314] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] transition-all duration-500"
            style={{ width: `${node.masteryScore}%` }}
          />
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-5 gap-2">
        <button
          onClick={() => onOpenLesson?.(node)}
          className="col-span-3 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium text-xs tracking-wide border-none shadow-none transition-colors cursor-pointer"
          type="button"
        >
          <span>Vào bài học ngay</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
        <button
          onClick={() => onAskAiTutor?.(node)}
          className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full bg-[#E1E5EA] hover:bg-[#D3D8DE] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium text-xs border-none shadow-none transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
            neurology
          </span>
          <span>Gia sư AI</span>
        </button>
      </div>
    </div>
  );
}
