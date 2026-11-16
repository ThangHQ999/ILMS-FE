'use client';

import React from 'react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Đã có lỗi xảy ra',
  description = 'Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
  error,
  onRetry,
  retryLabel = 'Thử lại',
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`p-10 sm:p-14 rounded-3xl bg-white dark:bg-[#1E1F20] border border-red-200/60 dark:border-red-900/30 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-2xs ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px]">error</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-[#C4C7C5] max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {onRetry && (
        <Button
          variant="primary"
          size="sm"
          onClick={onRetry}
          icon={<span className="material-symbols-outlined text-[16px]">refresh</span>}
        >
          {retryLabel}
        </Button>
      )}

      {process.env.NODE_ENV === 'development' && error instanceof Error && (
        <details className="mt-6 text-left w-full max-w-md bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto">
          <summary className="cursor-pointer font-bold text-red-600 dark:text-red-400 mb-1">
            Chi tiết lỗi kỹ thuật (chỉ hiện trong Dev)
          </summary>
          {error.message}
          {error.stack && <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>}
        </details>
      )}
    </div>
  );
}
