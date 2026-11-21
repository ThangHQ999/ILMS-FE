'use client';

import React from 'react';
import Link from 'next/link';

export default function CreateClassError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0F4F8] dark:bg-[#0B0F19] text-gray-900 dark:text-[#E3E3E3]">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#1E1F20] p-8 text-center space-y-4">
        <span className="material-symbols-outlined text-4xl text-[#B3261E] dark:text-[#FFB4AB]">
          error
        </span>
        <h2 className="text-lg font-bold">Không thể tải trang tạo lớp học</h2>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-full bg-[#0B57D0] text-white text-xs font-semibold cursor-pointer border-none"
          >
            Thử lại
          </button>
          <Link
            href="/classes"
            className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-[#282A2C] text-xs font-semibold"
          >
            Quay lại Lớp học
          </Link>
        </div>
      </div>
    </div>
  );
}
