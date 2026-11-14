'use client';

import React from 'react';

export interface AiSyllabusCopilotCardProps {
  onExtractPdfClick: () => void;
  onViewKnowledgeGraphClick: () => void;
}

export function AiSyllabusCopilotCard({
  onExtractPdfClick,
  onViewKnowledgeGraphClick,
}: AiSyllabusCopilotCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
          psychology
        </span>
        <h4 className="text-sm font-bold">Trợ lý Giáo trình AI (Copilot)</h4>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Công cụ tự động phân tích Slide bài giảng PDF và Đề cương chuẩn để sinh cấu trúc Chương mục, Objectives và Ngân hàng câu hỏi trắc nghiệm tương thích.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onExtractPdfClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px] text-amber-400 dark:text-amber-600">
            auto_awesome
          </span>
          <span>Trích xuất tự động từ Syllabus PDF</span>
        </button>

        <button
          type="button"
          onClick={onViewKnowledgeGraphClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-blue-400">
            hub
          </span>
          <span>Xem Đồ thị Tri thức môn học (34 Nodes)</span>
        </button>
      </div>

      {/* Knowledge Graph Snapshot Graphic */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span>Độ phủ Chuẩn đầu ra (CDIO / ABET):</span>
          <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">88.5%</span>
        </div>

        {/* 2-Segment Multi Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
          <div className="bg-blue-600 h-full transition-all" style={{ width: '70%' }} title="CLO 1: Kiến trúc (Đạt 70%)" />
          <div className="bg-purple-600 h-full transition-all" style={{ width: '18.5%' }} title="CLO 2: Giao thức (Đang dạy 18.5%)" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>CLO 1: Kiến trúc (Đạt)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>CLO 2: Giao thức (Đang dạy)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
