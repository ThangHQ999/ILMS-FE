'use client';

import React from 'react';
import type { WorkspaceRoleMode } from '../types';

interface ClassHeroSectionProps {
  workspaceMode: WorkspaceRoleMode;
  onToggleWorkspaceMode?: (mode: WorkspaceRoleMode) => void;
  onCreateClick: () => void;
  onJoinClick?: () => void;
  onExportClick?: () => void;
}

export function ClassHeroSection({
  workspaceMode,
  onCreateClick,
  onJoinClick,
  onExportClick,
}: ClassHeroSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* 2. DECLUTTER THE PAGE HEADER: Only Title "Các lớp học" (no subtitle) */}
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-[#E3E3E3] font-sans tracking-tight">
        Các lớp học
      </h1>

      {/* Action buttons directly opposite the title */}
      <div className="flex items-center gap-3 shrink-0">
        {workspaceMode === 'student' ? (
          <button
            type="button"
            onClick={onJoinClick}
            className="bg-[#D3E3FD] text-[#041E49] hover:bg-[#C2E7FF] dark:bg-[#A8C7FA] dark:hover:bg-[#A8C7FA]/90 dark:text-[#062E6F] px-5 py-2.5 rounded-full font-medium transition-opacity border-none cursor-pointer text-sm shadow-none inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">vpn_key</span>
            <span>Tham gia lớp bằng mã</span>
          </button>
        ) : (
          <>
            <button
              onClick={onExportClick}
              type="button"
              className="bg-[#E1E5EA] hover:bg-gray-300 dark:bg-[#282A2C] dark:hover:bg-[#333537] text-gray-800 dark:text-[#C4C7C5] px-5 py-2.5 rounded-full font-medium transition-colors border-none cursor-pointer text-sm shadow-none inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Xuất báo cáo</span>
            </button>

            <button
              onClick={onCreateClick}
              type="button"
              className="bg-[#D3E3FD] text-[#041E49] hover:bg-[#C2E7FF] dark:bg-[#A8C7FA] dark:hover:bg-[#A8C7FA]/90 dark:text-[#062E6F] px-5 py-2.5 rounded-full font-medium transition-opacity border-none cursor-pointer text-sm shadow-none inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Tạo lớp học</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
