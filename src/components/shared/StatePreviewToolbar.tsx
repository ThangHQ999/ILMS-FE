'use client';

import React from 'react';

export interface StatePreviewOption<T extends string> {
  key: T;
  label: string;
  badge?: string | number;
}

export interface StatePreviewToolbarProps<T extends string> {
  title?: string;
  subtitle?: string;
  activeState: T;
  onStateChange: (state: T) => void;
  options: StatePreviewOption<T>[];
  className?: string;
}

export function StatePreviewToolbar<T extends string>({
  title = 'CHẾ ĐỘ KIỂM THỬ TRẠNG THÁI GIAO DIỆN (STATE PREVIEWS)',
  subtitle = 'Nhấp để thử nghiệm các kịch bản thực tế',
  activeState,
  onStateChange,
  options,
  className = '',
}: StatePreviewToolbarProps<T>) {
  return (
    <div
      className={`p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 flex flex-col gap-3 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
            developer_mode
          </span>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {title}
          </h4>
        </div>
        {subtitle && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {options.map((opt) => {
          const isActive = activeState === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onStateChange(opt.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span>{opt.label}</span>
              {opt.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {opt.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
