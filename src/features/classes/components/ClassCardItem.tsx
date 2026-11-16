'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, User, ArrowRight } from 'lucide-react';
import type { ClassItem, ClassViewMode, WorkspaceRoleMode } from '../types';

export interface ClassCardItemProps {
  item: ClassItem;
  workspaceMode?: WorkspaceRoleMode;
  viewMode?: ClassViewMode;
  onArchiveClick: (item: ClassItem) => void;
  onRestoreClick?: (item: ClassItem) => void;
  isCopied: boolean;
  onCopyCode: (code: string) => void;
}

export function ClassCardItem({
  item,
  workspaceMode = 'faculty',
  viewMode = 'grid',
  onArchiveClick,
  onRestoreClick,
  isCopied,
  onCopyCode,
}: ClassCardItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ==========================================
  // STUDENT WORKSPACE CARD (MD3 Minimalist Flat Tonal)
  // ==========================================
  if (workspaceMode === 'student') {
    const courseCode = item.name || item.enrollmentKey || 'IT-101';
    const credits = '4 Tín chỉ';
    const teacherName = item.instructor?.fullName || 'Ban Giảng huấn CNTT';
    const studentCount = item.enrolledCount || 42;

    const nameLower = (item.name + (item.title || '')).toLowerCase();
    const knowledgeNodes =
      nameLower.includes('dữ liệu') || nameLower.includes('csdl')
        ? 110
        : nameLower.includes('ai') || nameLower.includes('trí tuệ')
        ? 120
        : nameLower.includes('thuật')
        ? 95
        : 110;
    const gpa = nameLower.includes('oop') ? '9.0' : nameLower.includes('dữ liệu') ? '8.4' : '8.6';
    const progressPercent = nameLower.includes('csdl')
      ? 28
      : nameLower.includes('ctdl')
      ? 45
      : nameLower.includes('oop')
      ? 75
      : 28;

    return (
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 flex flex-col h-full min-h-[260px] border-none shadow-sm dark:shadow-none relative transition-transform hover:-translate-y-0.5 duration-200">
        {/* Header: Course Code & Options */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            <span className="bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA] px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide">
              {courseCode}
            </span>
            <span className="bg-gray-100 dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] px-2.5 py-1 rounded-md text-[11px] font-semibold">
              {credits}
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Tùy chọn môn học"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:bg-gray-100 dark:hover:bg-[#282A2C] rounded-full p-1 border-none bg-transparent cursor-pointer flex items-center justify-center transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#282A2C] shadow-xl py-1.5 text-xs font-medium text-gray-700 dark:text-[#E3E3E3] z-50 border-none">
                  <Link
                    href={`/classes/${item.id}`}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                      login
                    </span>
                    <span>Vào môn học</span>
                  </Link>

                  <Link
                    href={`/classes/${item.id}?tab=people`}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[18px] text-gray-400 dark:text-[#8E918F]">
                      groups
                    </span>
                    <span>Xem thành viên ({studentCount})</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onCopyCode(item.enrollmentKey || item.name);
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] cursor-pointer transition-colors border-none bg-transparent"
                  >
                    <span className="material-symbols-outlined text-[18px] text-gray-400 dark:text-[#8E918F]">
                      content_copy
                    </span>
                    <span>Sao chép mã lớp</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title & Teacher */}
        <div className="mt-1">
          <Link href={`/classes/${item.id}`} className="hover:text-blue-600 dark:hover:text-[#A8C7FA] transition-colors">
            <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3] line-clamp-2 leading-snug">
              {item.title || item.name}
            </h3>
          </Link>
          <p className="text-[12px] font-medium text-gray-500 dark:text-[#8E918F] mt-1.5 flex items-center gap-1.5">
            <User size={12} className="shrink-0" /> {teacherName}
          </p>
        </div>

        {/* Flat Stats Row (REPLACING THE CRAMPED TABLE) */}
        <div className="flex justify-between items-center mt-5 mb-5 px-4 py-3 bg-[#F0F4F8] dark:bg-[#131314] rounded-2xl border-none">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[15px] font-bold text-gray-900 dark:text-[#E3E3E3]">{studentCount}</span>
            <span className="text-[10px] font-medium text-gray-500 dark:text-[#8E918F]">Sinh viên</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[15px] font-bold text-gray-900 dark:text-[#E3E3E3]">{knowledgeNodes}</span>
            <span className="text-[10px] font-medium text-gray-500 dark:text-[#8E918F]">Node Tri thức</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[15px] font-bold text-green-600 dark:text-[#81C995]">{gpa}</span>
            <span className="text-[10px] font-medium text-gray-500 dark:text-[#8E918F]">ĐTB Lớp</span>
          </div>
        </div>

        {/* Progress & Action */}
        <div className="mt-auto flex flex-col gap-4">
          <div>
            <div className="flex justify-between text-[11px] font-medium mb-1.5 text-gray-600 dark:text-[#C4C7C5]">
              <span>Tiến độ hoàn tất</span>
              <span className="text-blue-600 dark:text-[#A8C7FA]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-[#282A2C] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#007BFF] dark:bg-[#A8C7FA] h-1.5 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Footer Action (Full Width) */}
          <Link
            href={`/classes/${item.id}`}
            className="w-full flex justify-center items-center gap-2 bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] rounded-full py-2.5 text-sm font-semibold hover:brightness-95 transition-all border-none cursor-pointer"
          >
            <span>Vào môn học</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // FACULTY / TEACHER WORKSPACE CARD
  // ==========================================
  const isArchived = item.status === 'ARCHIVED';
  const isOwner = item.teachingRole === 'PRIMARY_INSTRUCTOR' || Boolean(item.ownerId);

  // Compute clean metadata
  const enrolled = item.enrolledCount || 38;
  const maxCapacity = item.maxStudents || 60;
  const attendanceRate = item.stats?.attendanceRate || 95;
  const curriculumWeek = 'Tuần 10/15';

  // Compute contextual alert (plain text with colored icon, zero heavy alert box)
  const getAlertText = () => {
    if (isArchived) return null;
    const nameLower = (item.name + (item.title || '')).toLowerCase();
    if (nameLower.includes('csdl') || nameLower.includes('dữ liệu')) {
      return '3 bài tập chờ chấm';
    }
    if (nameLower.includes('ctdl') || nameLower.includes('thuật')) {
      return '3 bài tập chờ chấm';
    }
    if (nameLower.includes('oop') || nameLower.includes('đối tượng')) {
      return '1 yêu cầu duyệt sinh viên';
    }
    return '3 bài tập chờ chấm';
  };

  const alertText = getAlertText();
  const isGridView = viewMode !== 'list';

  return (
    <article
      className={
        isGridView
          ? 'bg-[#FFFFFF] dark:bg-[#1E1F20] rounded-3xl p-5 border-none shadow-sm dark:shadow-none flex flex-col h-full min-h-[280px] relative transition-transform hover:-translate-y-0.5 duration-200'
          : 'bg-[#FFFFFF] dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col justify-between relative transition-transform hover:-translate-y-0.5 duration-200'
      }
    >
      {/* 1. HEADER: Status Badge & 3-dots */}
      <div className="flex justify-between items-start mb-3">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isArchived
              ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5]'
              : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5]'
          }`}
        >
          {isArchived ? 'ĐÃ LƯU TRỮ' : 'ĐANG HOẠT ĐỘNG'}
        </span>

        {/* 3-dots menu button */}
        <div className="relative">
          <button
            type="button"
            aria-label="Tùy chọn lớp học"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-[#282A2C] rounded-full p-1 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#282A2C] shadow-xl py-1.5 text-xs font-medium text-gray-700 dark:text-[#E3E3E3] z-50 border-none">
                <Link
                  href={`/classes/${item.id}`}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                    login
                  </span>
                  <span>Vào lớp học</span>
                </Link>

                <Link
                  href={`/classes/${item.id}?tab=people`}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-[18px] text-gray-400 dark:text-[#8E918F]">
                    groups
                  </span>
                  <span>Xem thành viên ({enrolled})</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onCopyCode(item.enrollmentKey || item.name);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] cursor-pointer transition-colors border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px] text-gray-400 dark:text-[#8E918F]">
                    content_copy
                  </span>
                  <span>Sao chép mã lớp</span>
                </button>

                {isOwner && (
                  <Link
                    href={`/classes/${item.id}?tab=settings`}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[18px] text-gray-400 dark:text-[#8E918F]">
                      settings
                    </span>
                    <span>Cấu hình lớp</span>
                  </Link>
                )}

                {isOwner && !isArchived && (
                  <div className="border-t border-gray-100 dark:border-[#383A3C] my-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onArchiveClick(item);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 cursor-pointer transition-colors border-none bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[18px]">archive</span>
                      <span>Lưu trữ lớp học</span>
                    </button>
                  </div>
                )}

                {isArchived && onRestoreClick && (
                  <div className="border-t border-gray-100 dark:border-[#383A3C] my-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onRestoreClick(item);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 cursor-pointer transition-colors border-none bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[18px]">unarchive</span>
                      <span>Khôi phục lớp học</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. TITLE & CODE */}
      <div>
        <Link href={`/classes/${item.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] line-clamp-2 leading-snug hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors">
            {item.title || item.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mt-1.5">
          <p className="text-xs font-medium text-gray-500 dark:text-[#8E918F]">
            {item.name}
          </p>
          <button
            type="button"
            onClick={() => onCopyCode(item.enrollmentKey || item.name)}
            className="text-gray-400 hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors p-0.5 border-none bg-transparent cursor-pointer inline-flex items-center"
            title="Sao chép mã lớp"
          >
            <span className="material-symbols-outlined text-[14px]">
              {isCopied ? 'check' : 'content_copy'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. META STATS */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs font-medium text-gray-600 dark:text-[#C4C7C5]">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-gray-400 dark:text-[#8E918F]">
            group
          </span>
          <span>{enrolled}/{maxCapacity} Học viên</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-gray-400 dark:text-[#8E918F]">
            calendar_today
          </span>
          <span>{curriculumWeek}</span>
        </div>
        <div className="flex items-center gap-1.5 w-full">
          <span className="material-symbols-outlined text-[15px] text-gray-400 dark:text-[#8E918F]">
            check_circle
          </span>
          <span>Chuyên cần {attendanceRate}%</span>
        </div>
      </div>

      {/* 4. FOOTER ACTIONS (VERTICAL STACK IN GRID VIEW) */}
      <div className={isGridView ? 'mt-auto pt-5 flex flex-col gap-3' : 'mt-auto pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3'}>
        {alertText ? (
          <div className="text-orange-600 dark:text-[#FFB784] text-xs font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">
              pending_actions
            </span>
            <span>{alertText}</span>
          </div>
        ) : (
          <div className={isGridView ? 'hidden' : 'hidden sm:block'} />
        )}

        <Link
          href={`/classes/${item.id}`}
          className={
            isGridView
              ? 'w-full flex justify-center items-center gap-2 bg-blue-100 dark:bg-[#A8C7FA] text-blue-900 dark:text-[#062E6F] rounded-full py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity border-none cursor-pointer'
              : 'inline-flex justify-center items-center gap-2 bg-blue-100 dark:bg-[#A8C7FA] text-blue-900 dark:text-[#062E6F] rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity border-none cursor-pointer'
          }
        >
          <span>Vào không gian lớp</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
}

export { ClassCardItem as TeacherClasses };
