'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring if needed
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/60 p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">error_outline</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Không thể tải không gian bài tập
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Đã xảy ra lỗi trong quá trình kết nối tới hệ thống bài tập và đánh giá của lớp học.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/classes"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Về danh sách lớp
          </Link>
        </div>
      </div>
    </div>
  );
}
