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
    <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-6 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-all">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] uppercase">
            Bộ Font chữ hệ thống - System Typography
          </h2>
          <p className="mt-1 text-xs text-[#444746] dark:text-[#C4C7C5]">
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
              className={`group relative flex flex-col justify-between rounded-3xl p-5 text-left transition-all border-none shadow-none cursor-pointer ${
                isActive
                  ? 'bg-[#D3E3FD]/50 dark:bg-[#162B4D]/60'
                  : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
              }`}
            >
              {/* Checkmark Badge for Active Card */}
              {isActive && (
                <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#0B57D0] text-white">
                  <svg className="h-3.5 w-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}

              <div>
                <h3 className={`text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3] ${font.fontClass}`}>
                  {font.name}
                </h3>
                <p className="mt-0.5 text-xs text-[#444746] dark:text-[#C4C7C5]">
                  {font.description}
                </p>

                {/* Preview Typography Sample */}
                <div className={`my-4 rounded-2xl bg-white dark:bg-[#1E1F20] p-4 border-none shadow-none ${font.fontClass}`}>
                  <span className="text-xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] block">
                    Aa Bb Gg 123...
                  </span>
                  <span className="text-xs text-[#444746] dark:text-[#C4C7C5] block mt-1 line-clamp-1">
                    Trí tuệ nhân tạo ILMS Việt Nam
                  </span>
                </div>
              </div>

              {/* Weights Preview Section (700 / 600 / 400) */}
              <div className={`mt-2 flex items-center justify-between pt-2 text-[11px] border-none ${font.fontClass}`}>
                <span className="font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">700 Bold</span>
                <span className="font-semibold text-[#444746] dark:text-[#C4C7C5]">600 Semi</span>
                <span className="font-normal text-[#747775] dark:text-[#8E918F]">400 Reg</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
