'use client';

import React from 'react';
import { Button } from './Button';

export type EmptyStateVariant = 'zero-data' | 'not-found' | 'archived';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}

export function EmptyState({
  variant = 'zero-data',
  icon,
  title,
  description,
  action,
  onReset,
  resetLabel = 'Đặt lại bộ lọc',
  className = '',
}: EmptyStateProps) {
  const defaultIcon = () => {
    switch (variant) {
      case 'not-found':
        return <span className="material-symbols-outlined text-[32px] text-amber-500">search_off</span>;
      case 'archived':
        return <span className="material-symbols-outlined text-[32px] text-slate-400">inventory_2</span>;
      case 'zero-data':
      default:
        return <span className="material-symbols-outlined text-[32px] text-blue-600 dark:text-blue-400">inbox</span>;
    }
  };

  const iconBg = () => {
    switch (variant) {
      case 'not-found':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400';
      case 'archived':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
      case 'zero-data':
      default:
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div
      className={`p-10 sm:p-14 rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-2xs ${className}`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${iconBg()}`}>
        {icon || defaultIcon()}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#C4C7C5] max-w-md mx-auto mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action ? (
        <div className="flex items-center gap-3">{action}</div>
      ) : onReset ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onReset}
          icon={<span className="material-symbols-outlined text-[16px]">restart_alt</span>}
        >
          {resetLabel}
        </Button>
      ) : null}
    </div>
  );
}
