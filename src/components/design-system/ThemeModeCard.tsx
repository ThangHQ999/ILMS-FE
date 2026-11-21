'use client';

import React from 'react';
import { ThemeMode } from '@/hooks/useDesignSystem';

interface ThemeModeCardProps {
  themeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
}

export function ThemeModeCard({ themeMode, onSelectTheme }: ThemeModeCardProps) {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-6 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-all">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] uppercase">
            Giao diện hiển thị
          </h2>
          <p className="mt-1 text-xs text-[#444746] dark:text-[#C4C7C5]">
            Lựa chọn chủ đề màu sáng hoặc tối cho giao diện người dùng theo chuẩn MD3 Flat Tonal.
          </p>
        </div>
        <span className="rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] px-3 py-1 text-xs font-semibold text-[#041E49] dark:text-[#A8C7FA] border-none">
          Theme Mode
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Light Mode Wireframe Button */}
        <button
          type="button"
          onClick={() => onSelectTheme('light')}
          className={`group relative flex flex-col items-start rounded-3xl p-5 text-left transition-all border-none shadow-none cursor-pointer ${
            themeMode === 'light'
              ? 'bg-[#D3E3FD]/50 dark:bg-[#162B4D]/60'
              : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
          }`}
        >
          {themeMode === 'light' && (
            <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#0B57D0] text-white">
              <svg className="h-3.5 w-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}

          {/* Wireframe Mockup Preview */}
          <div className="mb-3.5 w-full rounded-2xl bg-white dark:bg-[#1E1F20] p-3 border-none shadow-none">
            <div className="mb-2 flex items-center gap-1.5 pb-2">
              <div className="h-2 w-2 rounded-full bg-[#B9D0F9]" />
              <div className="h-2 w-10 rounded-full bg-[#D3E3FD]" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-6 rounded-xl bg-[#D3E3FD]/60" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-full rounded-full bg-[#F0F4F9]" />
                <div className="h-4 w-3/4 rounded-full bg-[#D3E3FD]" />
              </div>
            </div>
          </div>

          <span className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">Giao diện Sáng</span>
          <span className="mt-0.5 text-xs text-[#444746] dark:text-[#C4C7C5]">MD3 Tonal Light</span>
        </button>

        {/* Dark Mode Wireframe Button */}
        <button
          type="button"
          onClick={() => onSelectTheme('dark')}
          className={`group relative flex flex-col items-start rounded-3xl p-5 text-left transition-all border-none shadow-none cursor-pointer ${
            themeMode === 'dark'
              ? 'bg-[#D3E3FD]/50 dark:bg-[#162B4D]/60'
              : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
          }`}
        >
          {themeMode === 'dark' && (
            <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#0B57D0] text-white">
              <svg className="h-3.5 w-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}

          {/* Wireframe Mockup Preview */}
          <div className="mb-3.5 w-full rounded-2xl bg-[#131314] p-3 border-none shadow-none">
            <div className="mb-2 flex items-center gap-1.5 pb-2">
              <div className="h-2 w-2 rounded-full bg-[#333537]" />
              <div className="h-2 w-10 rounded-full bg-[#282A2C]" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-6 rounded-xl bg-[#162B4D]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-full rounded-full bg-[#1E1F20]" />
                <div className="h-4 w-3/4 rounded-full bg-[#162B4D]" />
              </div>
            </div>
          </div>

          <span className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">Giao diện Tối</span>
          <span className="mt-0.5 text-xs text-[#444746] dark:text-[#C4C7C5]">Gemini Deep Charcoal</span>
        </button>
      </div>
    </div>
  );
}
