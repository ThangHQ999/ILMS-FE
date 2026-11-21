'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

  const isArchived = item.status === 'ARCHIVED';
  const isStudent = workspaceMode === 'student' || item.teachingRole === 'STUDENT';
  const isOwner =
    !isStudent &&
    (item.teachingRole === 'PRIMARY_INSTRUCTOR' || Boolean(item.ownerId));
  const canCopyCode = !isStudent || item.isCodeActive !== false;

  // Compute clean metadata from real API fields
  const enrolled = item.enrolledCount ?? 0;
  const maxCapacity = item.maxCapacity ?? item.maxStudents ?? 60;
  const attendanceRate = item.stats?.attendanceRate;
  const periodLabel = item.semester || item.academicYear || '2026-2027';

  // Teacher-only contextual alert (shown ONLY when real pending/ungraded count > 0)
  const getAlertText = (): string | null => {
    if (isArchived || isStudent) return null;
    const pendingRequests = item.stats?.pendingRequestsCount ?? 0;
    const ungradedAssignments = item.stats?.ungradedAssignmentsCount ?? 0;
    if (pendingRequests > 0) {
      return `${pendingRequests} yêu cầu duyệt sinh viên`;
    }
    if (ungradedAssignments > 0) {
      return `${ungradedAssignments} bài tập chờ chấm`;
    }
    return null;
  };

  const alertText = getAlertText();
  const isGridView = viewMode !== 'list';

  return (
    <article
      className={`${
        isGridView
          ? 'bg-[#FFFFFF] dark:bg-[#1E1F20] rounded-3xl p-5 border-none shadow-sm dark:shadow-none flex flex-col h-full min-h-[280px] relative transition-transform hover:-translate-y-0.5 duration-200'
          : 'bg-[#FFFFFF] dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col justify-between relative transition-transform hover:-translate-y-0.5 duration-200'
      } ${isMenuOpen ? 'z-30' : ''}`}
    >
      {/* Optional Background Layer */}
      {item.backgroundUrl && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
          <img
            src={item.backgroundUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/85 to-white/65 dark:from-[#1E1F20]/95 dark:via-[#1E1F20]/85 dark:to-[#1E1F20]/65" />
        </div>
      )}

      {/* 1. HEADER: Status Badge & 3-dots */}
      <div
        className={`relative ${
          isMenuOpen ? 'z-30' : 'z-10'
        } flex justify-between items-start mb-3`}
      >
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

                {canCopyCode && (
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
                )}

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

                {!isStudent && isArchived && onRestoreClick && (
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
      <div className="relative z-10">
        <Link href={`/classes/${item.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] line-clamp-2 leading-snug hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] transition-colors">
            {item.title || item.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mt-1.5">
          <p className="text-xs font-medium text-gray-500 dark:text-[#8E918F]">
            {item.name}
          </p>
          {canCopyCode && (
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
          )}
        </div>
      </div>

      {/* 3. META STATS */}
      <div className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs font-medium text-gray-600 dark:text-[#C4C7C5]">
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
          <span>{periodLabel}</span>
        </div>
        {typeof attendanceRate === 'number' && (
          <div className="flex items-center gap-1.5 w-full">
            <span className="material-symbols-outlined text-[15px] text-gray-400 dark:text-[#8E918F]">
              check_circle
            </span>
            <span>Chuyên cần {attendanceRate}%</span>
          </div>
        )}
      </div>

      {/* 4. FOOTER ACTIONS */}
      <div
        className={
          isGridView
            ? 'relative z-10 mt-auto pt-5 flex flex-col gap-3'
            : 'relative z-10 mt-auto pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3'
        }
      >
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
