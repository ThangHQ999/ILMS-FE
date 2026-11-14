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
    <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      {/* Left Controls: Switcher & Filter */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Edit Mode Toggle Pill */}
        <label
          onClick={(e) => {
            e.preventDefault();
            onToggleEditMode();
          }}
          className={`cursor-pointer select-none inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-[2px] transition-all ${
            isEditMode
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
          }`}
        >
          <div
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
              isEditMode ? 'bg-blue-600' : 'bg-slate-400 dark:bg-slate-600'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isEditMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
              tune
            </span>
            <span>Chế độ Chỉnh sửa:</span>
            <span
              className={`underline decoration-2 underline-offset-4 ${
                isEditMode
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                  : 'text-slate-500'
              }`}
            >
              {isEditMode ? 'ĐANG BẬT' : 'ĐANG TẮT'}
            </span>
          </span>
        </label>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Filter & Search in syllabus */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm bài giảng, mã lab, tài liệu..."
            className="pl-9 pr-3 py-1.5 w-60 sm:w-64 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Tất cả ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('published')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'published'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Đã xuất bản ({counts.published})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('draft')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-[17px] text-slate-500">visibility</span>
          <span>Xem góc nhìn học sinh</span>
        </button>

        <button
          type="button"
          onClick={onBatchUploadClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-[17px] text-slate-500">upload_file</span>
          <span>Tải lên hàng loạt</span>
        </button>

        <button
          type="button"
          onClick={onAddLessonClick}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">post_add</span>
          <span>+ Thêm Bài học</span>
        </button>

        <button
          type="button"
          onClick={onAddChapterClick}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">create_new_folder</span>
          <span>+ Thêm Chương mới</span>
        </button>
      </div>
    </div>
  );
}

