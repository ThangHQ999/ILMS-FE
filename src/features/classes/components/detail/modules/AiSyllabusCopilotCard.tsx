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
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5 text-gray-900 dark:text-[#E3E3E3]">
        <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[20px]">
          psychology
        </span>
        <h4 className="text-sm font-semibold">Trợ lý Giáo trình AI (Copilot)</h4>
      </div>

      <p className="text-xs text-gray-600 dark:text-[#C4C7C5] leading-relaxed">
        Công cụ tự động phân tích Slide bài giảng PDF và Đề cương chuẩn để sinh cấu trúc Chương mục, Objectives và Ngân hàng câu hỏi trắc nghiệm tương thích.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onExtractPdfClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold shadow-xs transition-all cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[17px] text-amber-500">
            auto_awesome
          </span>
          <span>Trích xuất tự động từ Syllabus PDF</span>
        </button>

        <button
          type="button"
          onClick={onViewKnowledgeGraphClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold transition-all cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-[#A8C7FA]">
            hub
          </span>
          <span>Xem Đồ thị Tri thức môn học (34 Nodes)</span>
        </button>
      </div>

      {/* Knowledge Graph Snapshot Graphic */}
      <div className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none space-y-2">
        <div className="text-xs font-semibold text-gray-800 dark:text-[#E3E3E3] flex items-center justify-between">
          <span>Độ phủ Chuẩn đầu ra (CDIO / ABET):</span>
          <span className="text-blue-600 dark:text-[#A8C7FA] font-bold text-sm">88.5%</span>
        </div>

        {/* 2-Segment Multi Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-[#282A2C] h-2 rounded-full overflow-hidden flex">
          <div className="bg-[#007BFF] dark:bg-[#A8C7FA] h-full transition-all" style={{ width: '70%' }} title="CLO 1: Kiến trúc (Đạt 70%)" />
          <div className="bg-purple-500 h-full transition-all" style={{ width: '18.5%' }} title="CLO 2: Giao thức (Đang dạy 18.5%)" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-[#8E918F] pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#007BFF] dark:bg-[#A8C7FA]" />
            <span>CLO 1: Kiến trúc (Đạt)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>CLO 2: Giao thức (Đang dạy)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

