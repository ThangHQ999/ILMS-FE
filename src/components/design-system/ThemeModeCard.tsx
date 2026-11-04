'use client';

import React from 'react';
import { ThemeMode } from '@/hooks/useDesignSystem';

interface ThemeModeCardProps {
  themeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
}

export function ThemeModeCard({ themeMode, onSelectTheme }: ThemeModeCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground uppercase">
            Giao diện hiển thị
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Lựa chọn chủ đề màu sáng hoặc tối cho giao diện người dùng.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          Theme Mode
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Light Mode Wireframe Button */}
        <button
          type="button"
          onClick={() => onSelectTheme('light')}
          className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
            themeMode === 'light'
              ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-accent/40 shadow-sm'
              : 'border-border bg-background/50 hover:border-border hover:bg-accent/20'
          }`}
        >
          {themeMode === 'light' && (
            <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <svg className="h-3 w-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}

          {/* Wireframe Mockup Preview */}
          <div className="mb-3.5 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 shadow-inner">
            <div className="mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <div className="h-2 w-2 rounded-full bg-slate-300" />
              <div className="h-2 w-10 rounded bg-slate-200" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-6 rounded bg-slate-200/80" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-full rounded bg-white border border-slate-200" />
                <div className="h-4 w-3/4 rounded bg-blue-100" />
              </div>
            </div>
          </div>

          <span className="text-sm font-semibold text-foreground">Giao diện Sáng</span>
          <span className="mt-0.5 text-xs text-muted-foreground">Clean Modern Corporate</span>
        </button>

        {/* Dark Mode Wireframe Button */}
        <button
          type="button"
          onClick={() => onSelectTheme('dark')}
          className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
            themeMode === 'dark'
              ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-accent/40 shadow-sm'
              : 'border-border bg-background/50 hover:border-border hover:bg-accent/20'
          }`}
        >
          {themeMode === 'dark' && (
            <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <svg className="h-3 w-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}

          {/* Wireframe Mockup Preview */}
          <div className="mb-3.5 w-full rounded-lg border border-slate-800 bg-[#0d131f] p-2.5 shadow-inner">
            <div className="mb-2 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <div className="h-2 w-2 rounded-full bg-slate-700" />
              <div className="h-2 w-10 rounded bg-slate-800" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-6 rounded bg-slate-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-full rounded bg-[#161c28] border border-slate-800" />
                <div className="h-4 w-3/4 rounded bg-sky-950/80 border border-sky-800/40" />
              </div>
            </div>
          </div>

          <span className="text-sm font-semibold text-foreground">Giao diện Tối</span>
          <span className="mt-0.5 text-xs text-muted-foreground">DevDark Pro Minimal</span>
        </button>
      </div>
    </div>
  );
}
