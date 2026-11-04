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
    <div className="min-h-screen bg-background text-foreground antialiased transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              SaaS Educational Platform
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-foreground">
              Tùy biến Design System (ILMS)
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Điều chỉnh giao diện, bảng màu RGB động và font chữ hệ thống lưu trữ đồng bộ.
            </p>
          </div>

          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-accent active:scale-95 self-start sm:self-auto"
          >
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
