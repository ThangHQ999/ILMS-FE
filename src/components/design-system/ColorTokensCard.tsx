'use client';

import React from 'react';
import { ColorTokens } from '@/hooks/useDesignSystem';

interface ColorPreset {
  name: string;
  hex: string;
  rgb: string;
}

interface ColorColumnConfig {
  key: keyof ColorTokens;
  title: string;
  subtitle: string;
  presets: ColorPreset[];
}

const COLOR_CONFIGS: ColorColumnConfig[] = [
  {
    key: 'primary',
    title: 'Primary Color',
    subtitle: 'Nút chính, tiêu đề & tương tác nổi bật',
    presets: [
      { name: 'Tech Blue', hex: '#007BFF', rgb: '0 123 255' },
      { name: 'Tech Cyan', hex: '#38BDF8', rgb: '56 189 248' },
      { name: 'Royal Indigo', hex: '#4F46E5', rgb: '79 70 229' },
      { name: 'Cyber Emerald', hex: '#10B981', rgb: '16 185 129' },
    ],
  },
  {
    key: 'secondary',
    title: 'Secondary Color',
    subtitle: 'Huy hiệu, tag & thông tin bổ trợ',
    presets: [
      { name: 'Electric Indigo', hex: '#6C5CE7', rgb: '108 92 231' },
      { name: 'Deep Blue', hex: '#2563EB', rgb: '37 99 235' },
      { name: 'Purple Neon', hex: '#A855F7', rgb: '168 85 247' },
      { name: 'Rose Coral', hex: '#F43F5E', rgb: '244 63 94' },
    ],
  },
  {
    key: 'tertiary',
    title: 'Tertiary / Accent',
    subtitle: 'Thanh tiến độ, biểu đồ & chỉ số thành tích',
    presets: [
      { name: 'Emerald Green', hex: '#10B981', rgb: '16 185 129' },
      { name: 'Neon Teal', hex: '#14B8A6', rgb: '20 184 166' },
      { name: 'Streak Amber', hex: '#F59E0B', rgb: '245 158 11' },
      { name: 'Cyan Flash', hex: '#06B6D4', rgb: '6 182 212' },
    ],
  },
  {
    key: 'neutral',
    title: 'Neutral Palette',
    subtitle: 'Tổng nền, viền thẻ & văn bản phụ',
    presets: [
      { name: 'Slate Modern', hex: '#64748B', rgb: '100 116 139' },
      { name: 'Cool Gray', hex: '#6B7280', rgb: '107 114 128' },
      { name: 'Zinc Pro', hex: '#71717A', rgb: '113 113 122' },
      { name: 'Obsidian Navy', hex: '#475569', rgb: '71 85 105' },
    ],
  },
];

interface ColorTokensCardProps {
  colorTokens: ColorTokens;
  onSelectColor: (tokenKey: keyof ColorTokens, rgb: string) => void;
}

export function ColorTokensCard({ colorTokens, onSelectColor }: ColorTokensCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground uppercase">
            Hệ màu chuẩn Design System - Color Palette Tokens
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tùy biến các kênh màu cốt lõi được định nghĩa trong Tailwind config thông qua alpha-value syntax.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COLOR_CONFIGS.map((col) => {
          const currentRgb = colorTokens[col.key];
          const activePreset = col.presets.find((p) => p.rgb === currentRgb) || col.presets[0];

          return (
            <div
              key={col.key}
              className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/50 p-4 transition-all"
            >
              <div>
                <span className="text-xs font-bold text-foreground block">{col.title}</span>
                <span className="text-[11px] text-muted-foreground block mt-0.5 min-h-[32px]">
                  {col.subtitle}
                </span>

                {/* Swatches Row */}
                <div className="my-4 flex items-center gap-2.5">
                  {col.presets.map((preset) => {
                    const isActive = currentRgb === preset.rgb;
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => onSelectColor(col.key, preset.rgb)}
                        aria-label={`${col.title} - ${preset.name}`}
                        style={{ backgroundColor: preset.hex }}
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-95 ${
                          isActive
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-sm'
                            : 'hover:scale-105 opacity-85 hover:opacity-100'
                        }`}
                      >
                        {isActive && (
                          <svg
                            className="h-3.5 w-3.5 text-white stroke-[3] drop-shadow-sm"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Hex & Name Info */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs">
                <span className="font-medium text-foreground">{activePreset?.name || 'Custom'}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{activePreset?.hex || ''}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
