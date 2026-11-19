'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useCurrentUser } from '@/features/auth';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const params = useParams<{ id?: string }>();
  const classId = params?.id;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { data: user } = useCurrentUser();

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Học viên ILMS';

  useEffect(() => {
    // Error captured by route boundary; avoid noisy console dumps in production
  }, [error]);

  const backHref = classId ? `/classes/${classId}?tab=assignments` : '/classes';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
        userFullName={userFullName}
      />
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto ${
          isFocusMode
            ? 'pl-24'
            : isSidebarCollapsed
              ? 'pl-24'
              : 'lg:pl-[284px]'
        }`}
      >
        <div className="my-8 max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-200 dark:border-red-900/60 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">error_outline</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Không thể hiển thị chi tiết bài tập
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Đã phát sinh lỗi trong quá trình tải hoặc xử lý nội dung trang. Bạn có thể thử tải lại vùng nội dung này hoặc quay về danh sách bài tập của lớp.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0059BB] text-white hover:bg-[#004493] transition-colors cursor-pointer shadow-xs"
            >
              Thử lại
            </button>
            <Link
              href={backHref}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {classId ? 'Về danh sách bài tập' : 'Về danh sách lớp'}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
