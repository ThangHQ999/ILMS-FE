'use client';

import React from 'react';
import Link from 'next/link';

interface QuestionBankHeaderProps {
  onOpenCreate: () => void;
  onOpenAiGenerate: () => void;
  onOpenImport: () => void;
  onOpenConcepts: () => void;
}

export function QuestionBankHeader({
  onOpenCreate,
  onOpenAiGenerate,
  onOpenImport,
  onOpenConcepts,
}: QuestionBankHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
          <Link
            href="/assignments"
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 hover:bg-[#E9EEF6] dark:hover:bg-[#282A2C] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Trung tâm Bài tập & Đánh giá
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
          Ngân hàng Câu hỏi
        </h1>
        <p className="text-sm text-[#444746] dark:text-[#C4C7C5]">
          Quản lý câu hỏi chuẩn hóa theo môn học, khái niệm tri thức và đưa nhanh vào Quiz / Bài kiểm tra.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenConcepts}
          className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#1E1F20] px-4 py-2.5 text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#E9EEF6] dark:hover:bg-[#282A2C] transition-colors shadow-sm dark:shadow-none"
        >
          <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
            hub
          </span>
          Khái niệm
        </button>

        <button
          type="button"
          onClick={onOpenImport}
          className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#1E1F20] px-4 py-2.5 text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#E9EEF6] dark:hover:bg-[#282A2C] transition-colors shadow-sm dark:shadow-none"
        >
          <span className="material-symbols-outlined text-[18px] text-[#146C2E] dark:text-[#6DD58C]">
            upload_file
          </span>
          Nhập tệp
        </button>

        <button
          type="button"
          onClick={onOpenAiGenerate}
          className="inline-flex items-center gap-2 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-4 py-2.5 text-sm font-medium text-[#041E49] dark:text-[#C2E7FF] hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          AI Tạo câu hỏi
        </button>

        <Link
          href="/assignments/question-bank/azota-editor"
          className="inline-flex items-center gap-2 rounded-full bg-[#C4EED0] dark:bg-[#0F5223] px-4 py-2.5 text-sm font-medium text-[#072711] dark:text-[#C4EED0] hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          Soạn kiểu Azota
        </Link>

        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2.5 text-sm font-medium text-white dark:text-[#062E6F] hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo câu hỏi
        </button>
      </div>
    </header>
  );
}
