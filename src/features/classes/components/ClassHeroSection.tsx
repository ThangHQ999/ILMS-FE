'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ClassHeroSectionProps {
  showExportMenu?: boolean;
  onCreateClick?: () => void;
  onJoinClick: () => void;
  onExportClick?: () => void;
}

export function ClassHeroSection({
  showExportMenu = false,
  onJoinClick,
  onExportClick,
}: ClassHeroSectionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-[#E3E3E3] font-sans tracking-tight">
        Các lớp học
      </h1>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onJoinClick}
          className="bg-white hover:bg-slate-100 dark:bg-[#1E1F20] dark:hover:bg-[#282A2C] text-gray-800 dark:text-[#E3E3E3] border border-slate-200 dark:border-[#3c4043] px-4 py-2.5 rounded-full font-medium transition-colors cursor-pointer text-sm shadow-none inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">vpn_key</span>
          <span>Tham gia bằng mã</span>
        </button>

        <Link
          href="/classes/create"
          prefetch={true}
          className="bg-[#D3E3FD] text-[#041E49] hover:bg-[#C2E7FF] dark:bg-[#A8C7FA] dark:hover:bg-[#A8C7FA]/90 dark:text-[#062E6F] px-5 py-2.5 rounded-full font-semibold transition-opacity border-none cursor-pointer text-sm shadow-none inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Tạo lớp học</span>
        </Link>

        {showExportMenu && onExportClick && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Thao tác khác"
              aria-expanded={isMenuOpen}
              className="w-10 h-10 rounded-full bg-[#E1E5EA] hover:bg-gray-300 dark:bg-[#282A2C] dark:hover:bg-[#333537] text-gray-700 dark:text-[#C4C7C5] flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#3c4043] shadow-lg py-1.5 z-30">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onExportClick();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-800 dark:text-[#E3E3E3] hover:bg-slate-100 dark:hover:bg-[#282A2C] flex items-center gap-2 border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Xuất báo cáo</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
