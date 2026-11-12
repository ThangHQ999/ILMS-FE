'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-full bg-slate-100 dark:bg-[#1E1F20] flex items-center justify-center ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center justify-center gap-2 p-2 rounded-full bg-slate-100 dark:bg-[#1E1F20] hover:bg-slate-200 dark:hover:bg-[#282A2C] text-slate-700 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-[#E3E3E3] transition-colors border-none cursor-pointer select-none ${className}`}
      title={isDark ? 'Chuyển sang chế độ Sáng (Light Mode)' : 'Chuyển sang chế độ Tối (Dark Mode)'}
      aria-label={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
    >
      <span className="material-symbols-outlined text-[19px]">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      {showLabel && (
        <span className="text-xs font-medium whitespace-nowrap">
          {isDark ? 'Chế độ Sáng' : 'Chế độ Tối'}
        </span>
      )}
    </button>
  );
}

