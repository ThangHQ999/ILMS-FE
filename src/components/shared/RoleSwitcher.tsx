'use client';

import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';

interface RoleSwitcherProps {
  compact?: boolean;
}

export function RoleSwitcher({ compact = false }: RoleSwitcherProps) {
  const { activeRole, detectedRole, isTeacher, isOverridden, switchRole, resetRole } = useUserRole();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => switchRole(isTeacher ? 'STUDENT' : 'TEACHER')}
        title={
          isOverridden
            ? `Đang giả lập ${isTeacher ? 'Giảng viên' : 'Học sinh'} (Gốc: ${detectedRole === 'TEACHER' ? 'Giảng viên' : 'Học sinh'}). Bấm để đổi.`
            : `Vai trò: ${isTeacher ? 'Giảng viên' : 'Học sinh'}. Bấm để chuyển góc nhìn.`
        }
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] hover:opacity-90 transition-all border-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-[15px]">
          {isTeacher ? 'school' : 'person'}
        </span>
        <span>{isTeacher ? 'Giảng viên' : 'Học sinh'}</span>
        {isOverridden && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-xs">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
          swap_horiz
        </span>
        <div className="flex flex-col">
          <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
            Góc nhìn: {isTeacher ? 'Giảng viên' : 'Học sinh'}
          </span>
          {isOverridden && (
            <span className="text-[10px] text-[#747775] dark:text-[#8E918F]">
              (Gốc: {detectedRole === 'TEACHER' ? 'Giảng viên' : 'Học sinh'})
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => switchRole(isTeacher ? 'STUDENT' : 'TEACHER')}
          className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] font-medium hover:bg-white/80 dark:hover:bg-[#333537] border-none cursor-pointer transition-colors"
        >
          Đổi sang {isTeacher ? 'Học sinh' : 'Giảng viên'}
        </button>
        {isOverridden && (
          <button
            type="button"
            onClick={resetRole}
            title="Khôi phục vai trò theo tài khoản đăng nhập"
            className="p-1 rounded-full text-[#747775] hover:text-[#B3261E] dark:hover:text-[#F28B82] border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          </button>
        )}
      </div>
    </div>
  );
}

