'use client';

import React from 'react';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { ThemeModeCard } from './design-system/ThemeModeCard';
import { LivePreviewCard } from './design-system/LivePreviewCard';
import { ColorTokensCard } from './design-system/ColorTokensCard';
import { FontSelectorCard } from './design-system/FontSelectorCard';

export function DesignSystemSettings() {
  const {
    isMounted,
    themeMode,
    colorTokens,
    fontFamily,
    setThemeMode,
    setColorToken,
    setFontFamily,
    resetToDefaults,
  } = useDesignSystem();

  // Prevent SSR hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background p-6 sm:p-10 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Đang tải cấu hình Design System...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] antialiased transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-none pb-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] px-3.5 py-1 text-xs font-medium mb-2 border-none">
              <span className="h-2 w-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
              SaaS Educational Platform
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900 dark:text-[#E3E3E3]">
              Tùy biến Design System (ILMS)
            </h1>
            <p className="mt-1 text-sm text-[#747775] dark:text-[#8E918F]">
              Điều chỉnh giao diện, bảng màu RGB động và font chữ hệ thống lưu trữ đồng bộ.
            </p>
          </div>

          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-slate-100 dark:hover:bg-[#282A2C] px-5 py-2.5 text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] border-none shadow-none transition-colors self-start sm:self-auto cursor-pointer"
          >
            <svg className="h-4 w-4 text-[#747775] dark:text-[#8E918F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Khôi phục mặc định</span>
          </button>
        </div>

        {/* Section 1: Top Grid (2 Columns) */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ThemeModeCard
            themeMode={themeMode}
            onSelectTheme={setThemeMode}
          />
          <LivePreviewCard
            fontFamily={fontFamily}
          />
        </section>

        {/* Section 2: Middle Wide Card (Color Palette Tokens) */}
        <section>
          <ColorTokensCard
            colorTokens={colorTokens}
            onSelectColor={setColorToken}
          />
        </section>

        {/* Section 3: Bottom Wide Card (System Typography) */}
        <section>
          <FontSelectorCard
            currentFont={fontFamily}
            onSelectFont={setFontFamily}
          />
        </section>
      </div>
    </div>
  );
}
