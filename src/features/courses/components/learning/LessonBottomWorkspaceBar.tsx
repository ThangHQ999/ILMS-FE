'use client';

import React, { useState } from 'react';

interface LessonBottomWorkspaceBarProps {
  previousLessonTitle?: string;
  nextLessonTitle?: string;
  onGoPrevious?: () => void;
  onGoNext?: () => void;
  onToast: (msg: string) => void;
}

export function LessonBottomWorkspaceBar({
  previousLessonTitle = 'Bài 3.1: Phân kênh',
  nextLessonTitle = 'Bài 3.3: Điều khiển luồng & Tắc nghẽn',
  onGoPrevious,
  onGoNext,
  onToast,
}: LessonBottomWorkspaceBarProps) {
  const [isUnderstood, setIsUnderstood] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggleUnderstood = () => {
    setIsUnderstood((prev) => !prev);
    onToast(
      isUnderstood
        ? 'Đã bỏ đánh dấu hiểu bài học'
        : 'Tuyệt vời! Đã ghi nhận bạn đã hiểu rõ kiến thức Bài 3.2.'
    );
  };

  const handleCompleteAndNext = () => {
    setIsCompleting(true);
    setTimeout(() => {
      setIsCompleting(false);
      onToast(
        `Chúc mừng bạn đã hoàn tất Bài 3.2! Hệ thống đang chuyển tiếp sang ${nextLessonTitle}.`
      );
      if (onGoNext) onGoNext();
    }, 700);
  };

  return (
    <aside className="sticky bottom-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-[3px] border-slate-300 dark:border-slate-700 shadow-md px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Previous Lesson */}
        <button
          type="button"
          onClick={onGoPrevious || (() => onToast(`Đang quay lại: ${previousLessonTitle}`))}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">
            Bài trước: <strong className="text-slate-900 dark:text-slate-100">{previousLessonTitle}</strong>
          </span>
        </button>

        {/* Center: Auto-Save Status Indicator */}
        <div className="hidden md:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>
            Đã lưu tiến độ học lúc <strong>14:20</strong>
          </span>
          <span>•</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">Đồng bộ đa thiết bị</span>
        </div>

        {/* Right: Actions Group */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Mark Understood */}
          <button
            type="button"
            onClick={handleToggleUnderstood}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isUnderstood
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isUnderstood ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            >
              {isUnderstood ? 'verified' : 'check_circle'}
            </span>
            <span>{isUnderstood ? 'Đã hiểu bài học!' : 'Đánh dấu đã hiểu'}</span>
          </button>

          {/* Primary Call to Action */}
          <button
            type="button"
            disabled={isCompleting}
            onClick={handleCompleteAndNext}
            className="px-4 sm:px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isCompleting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>Đang chuyển bài...</span>
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

