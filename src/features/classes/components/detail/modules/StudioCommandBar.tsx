'use client';

import React from 'react';

export interface StudioCommandBarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'all' | 'published' | 'draft';
  onStatusFilterChange: (f: 'all' | 'published' | 'draft') => void;
  counts: { all: number; published: number; draft: number };
  onStudentViewClick: () => void;
  onBatchUploadClick: () => void;
  onAddLessonClick: () => void;
  onAddChapterClick: () => void;
}

export function StudioCommandBar({
  isEditMode,
  onToggleEditMode,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  counts,
  onStudentViewClick,
  onBatchUploadClick,
  onAddLessonClick,
  onAddChapterClick,
}: StudioCommandBarProps) {
  return (
    <div className="p-5 sm:p-6 bg-white dark:bg-[#1E1F20] rounded-3xl border-none shadow-sm dark:shadow-none flex flex-col xl:flex-row xl:items-center justify-between gap-4 transition-all">
      {/* Left Controls: Switcher & Filter */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Edit Mode Toggle Pill */}
        <label
          onClick={(e) => {
            e.preventDefault();
            onToggleEditMode();
          }}
          className={`cursor-pointer select-none inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-none transition-all ${
            isEditMode
              ? 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
              : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5]'
          }`}
        >
          <div
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
              isEditMode ? 'bg-[#007BFF] dark:bg-[#A8C7FA]' : 'bg-gray-400 dark:bg-gray-600'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isEditMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">
              tune
            </span>
            <span>Chế độ Chỉnh sửa:</span>
            <span className="font-bold">
              {isEditMode ? 'ĐANG BẬT' : 'ĐANG TẮT'}
            </span>
          </span>
        </label>

        <div className="h-6 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />

        {/* Filter & Search in syllabus */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-gray-400 dark:text-[#8E918F] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm bài giảng, mã lab, tài liệu..."
            className="pl-9 pr-4 py-2 w-60 sm:w-64 rounded-full bg-[#F0F4F8] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] text-xs border-none outline-none transition-all font-medium"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#E1E5EA] dark:bg-[#282A2C] p-1 rounded-full">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
            }`}
          >
            Tất cả ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('published')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${
              statusFilter === 'published'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
            }`}
          >
            Đã xuất bản ({counts.published})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('draft')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${
              statusFilter === 'draft'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
            }`}
          >
            Bản nháp ({counts.draft})
          </button>
        </div>
      </div>

      {/* Right Action CTA Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onStudentViewClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[17px] text-gray-500 dark:text-[#8E918F]">visibility</span>
          <span>Xem góc nhìn học sinh</span>
        </button>

        <button
          type="button"
          onClick={onBatchUploadClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[17px] text-gray-500 dark:text-[#8E918F]">upload_file</span>
          <span>Tải lên hàng loạt</span>
        </button>

        <button
          type="button"
          onClick={onAddLessonClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold transition-all cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[17px]">post_add</span>
          <span>+ Thêm Bài học</span>
        </button>

        <button
          type="button"
          onClick={onAddChapterClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold transition-all shadow-xs cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[17px]">create_new_folder</span>
          <span>+ Thêm Chương mới</span>
        </button>
      </div>
    </div>
  );
}

