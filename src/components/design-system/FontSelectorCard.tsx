'use client';

import React from 'react';
import { FontFamilyName } from '@/hooks/useDesignSystem';

interface FontOption {
  name: FontFamilyName;
  description: string;
  fontClass: string;
}

const FONT_OPTIONS: FontOption[] = [
  {
    name: 'Plus Jakarta Sans',
    description: 'Mặc định công nghệ SaaS',
    fontClass: 'font-[family-name:var(--font-plus-jakarta-sans)]',
  },
  {
    name: 'Inter',
    description: 'Chuẩn UI/UX quốc tế',
    fontClass: 'font-[family-name:var(--font-inter)]',
  },
  {
    name: 'Montserrat',
    description: 'Trẻ trung, hình học',
    fontClass: 'font-[family-name:var(--font-montserrat)]',
  },
  {
    name: 'Be Vietnam Pro',
    description: 'Tối ưu tiếng Việt chuẩn',
    fontClass: 'font-[family-name:var(--font-be-vietnam-pro)]',
  },
];

interface FontSelectorCardProps {
  currentFont: FontFamilyName;
  onSelectFont: (font: FontFamilyName) => void;
}

export function FontSelectorCard({ currentFont, onSelectFont }: FontSelectorCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground uppercase">
            Bộ Font chữ hệ thống - System Typography
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Lựa chọn kiểu chữ tối ưu trải nghiệm đọc, hỗ trợ đầy đủ ký tự tiếng Việt có dấu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FONT_OPTIONS.map((font) => {
          const isActive = currentFont === font.name;

          return (
            <button
              key={font.name}
              type="button"
              onClick={() => onSelectFont(font.name)}
              className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-accent/40 shadow-sm'
                  : 'border-border bg-background/50 hover:border-primary/50 hover:bg-accent/15'
              }`}
            >
              {/* Checkmark Badge for Active Card */}
              {isActive && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <svg className="h-3 w-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}

              <div>
                <h3 className={`text-sm font-bold text-foreground ${font.fontClass}`}>
                  {font.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {font.description}
                </p>

                {/* Preview Typography Sample */}
                <div className={`my-4 rounded-lg border border-border/80 bg-card p-3 ${font.fontClass}`}>
                  <span className="text-xl font-bold tracking-tight text-foreground block">
                    Aa Bb Gg 123...
                  </span>
                  <span className="text-xs text-muted-foreground block mt-1 line-clamp-1">
                    Trí tuệ nhân tạo ILMS Việt Nam
                  </span>
                </div>
              </div>

              {/* Weights Preview Section (700 / 600 / 400) */}
              <div className={`mt-2 flex items-center justify-between border-t border-border/70 pt-2 text-[11px] text-muted-foreground ${font.fontClass}`}>
                <span className="font-bold text-foreground">700 Bold</span>
                <span className="font-semibold text-foreground/80">600 Semi</span>
                <span className="font-normal text-muted-foreground">400 Reg</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
