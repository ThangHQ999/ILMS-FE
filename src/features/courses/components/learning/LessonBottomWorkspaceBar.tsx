'use client';

import React from 'react';

interface LessonBottomWorkspaceBarProps {
  previousLessonTitle?: string;
  nextLessonTitle?: string;
  isCompleted?: boolean;
  progressPercent?: number;
  isUpdating?: boolean;
  onGoPrevious?: () => void;
  onGoNext?: () => void;
  onToggleComplete?: () => void;
  onCompleteAndNext?: () => void;
  onToast: (msg: string) => void;
}

export function LessonBottomWorkspaceBar({
  previousLessonTitle = 'Chưa có bài trước',
  nextLessonTitle = 'Bài học cuối cùng',
  isCompleted = false,
  progressPercent = 0,
  isUpdating = false,
  onGoPrevious,
  onGoNext,
  onToggleComplete,
  onCompleteAndNext,
  onToast,
}: LessonBottomWorkspaceBarProps) {
  return (
    <aside className="sticky bottom-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-md px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Previous Lesson */}
        <button
          type="button"
          onClick={onGoPrevious || (() => onToast(`Đang quay lại: ${previousLessonTitle}`))}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline truncate max-w-[220px]">
            Bài trước: <strong className="text-slate-900 dark:text-slate-100">{previousLessonTitle}</strong>
          </span>
        </button>

        {/* Center: Real Lesson Progress */}
        <div className="hidden md:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>
            Tiến độ bài học: <strong className="text-slate-900 dark:text-slate-100">{progressPercent}%</strong>
          </span>
          <span>•</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {isCompleted ? 'Đã hoàn thành' : 'Đang học'}
          </span>
        </div>

        {/* Right: Actions Group */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            disabled={isUpdating}
            onClick={onToggleComplete}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border disabled:opacity-60 ${
              isCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            >
              {isCompleted ? 'verified' : 'check_circle'}
            </span>
            <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu đã hiểu'}</span>
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={onCompleteAndNext || onGoNext}
            className="px-4 sm:px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75 border-none"
          >
            {isUpdating ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span>Hoàn thành &amp; Tiếp theo</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
