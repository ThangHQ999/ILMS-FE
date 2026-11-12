'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ClassItem } from '../types';

interface ClassCardItemProps {
  item: ClassItem;
  onArchiveClick: (item: ClassItem) => void;
  onRestoreClick?: (item: ClassItem) => void;
  isCopied: boolean;
  onCopyCode: (code: string) => void;
}

export function ClassCardItem({
  item,
  onArchiveClick,
  onRestoreClick,
  isCopied,
  onCopyCode,
}: ClassCardItemProps) {
  const t = useTranslations('classes');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Derive theme gradient based on major
  const getGradientByMajor = (major: string) => {
    if (major.includes('Khoa học')) return 'from-blue-600 via-indigo-600 to-blue-700';
    if (major.includes('Phần mềm')) return 'from-indigo-600 via-purple-600 to-violet-700';
    if (major.includes('Mạng')) return 'from-cyan-600 via-teal-600 to-emerald-700';
    if (major.includes('Hệ thống')) return 'from-amber-600 via-orange-600 to-amber-700';
    if (major.includes('Trí tuệ')) return 'from-rose-600 via-fuchsia-600 to-pink-700';
    return 'from-slate-700 via-slate-800 to-slate-900';
  };

  const gradientClass = getGradientByMajor(item.major);
  const enrolledPercent = Math.min(
    100,
    Math.round(((item.enrolledCount || 0) / (item.maxStudents || 60)) * 100)
  );

  const hasAlert =
    (item.stats?.pendingRequestsCount ?? 0) > 0 ||
    (item.stats?.ungradedAssignmentsCount ?? 0) > 0;

  const isArchived = item.status === 'ARCHIVED';

  return (
    <div className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#1E1F20] transition-all duration-300 overflow-hidden hover:-translate-y-1 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
      {/* Top Graphic Banner with Mesh Gradient */}
      <div className={`relative h-28 w-full bg-gradient-to-tr ${gradientClass} p-4 flex flex-col justify-between overflow-hidden`}>
        {/* Abstract Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`mesh-${item.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 24 M 0 0 L 24 24" fill="none" stroke="white" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#mesh-${item.id})`} />
          </svg>
        </div>

        {/* Top Badges & Actions */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-white text-[11px] font-mono font-bold tracking-wider uppercase whitespace-nowrap border-none">
              {item.name}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold hidden sm:inline-block whitespace-nowrap border-none">
              {item.semester || 'HK1'}
            </span>
          </div>

          {/* Action Menu Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 backdrop-blur-md text-white flex items-center justify-center transition-colors border-none cursor-pointer"
              title="Tùy chọn lớp học"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 w-44 rounded-2xl bg-white dark:bg-[#282A2C] shadow-xl py-1.5 z-30 text-xs border-none">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (item.enrollmentKey) onCopyCode(item.enrollmentKey);
                    }}
                    className="w-full px-3.5 py-2 text-left text-[#1F1F1F] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#333537] flex items-center gap-2 border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">content_copy</span>
                    <span>{t('copyCode')}</span>
                  </button>

                  {!isArchived ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onArchiveClick(item);
                      }}
                      className="w-full px-3.5 py-2 text-left text-[#B3261E] dark:text-[#F28B82] hover:bg-[#FAD2CF] dark:hover:bg-[#3C1919] flex items-center gap-2 border-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">archive</span>
                      <span>{t('menuArchive')}</span>
                    </button>
                  ) : (
                    onRestoreClick && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onRestoreClick(item);
                        }}
                        className="w-full px-3.5 py-2 text-left text-[#0D652D] dark:text-[#81C995] hover:bg-[#C4EED0] dark:hover:bg-[#142E20] flex items-center gap-2 border-none cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">unarchive</span>
                        <span>{t('menuRestore')}</span>
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Banner Info */}
        <div className="relative z-10 flex items-center justify-between text-white/90 text-xs font-medium">
          <span className="truncate pr-2">{item.major}</span>
          <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-mono whitespace-nowrap border-none">
            {item.academicYear}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Title */}
          <Link
            href={`/classes/${item.id}`}
            prefetch={true}
            className="block group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors"
          >
            <h3 className="text-base font-display font-bold text-[#1F1F1F] dark:text-[#E3E3E3] line-clamp-1">
              {item.title}
            </h3>
          </Link>

          {/* Description or details */}
          {item.description ? (
            <p className="text-xs text-[#747775] dark:text-[#8E918F] line-clamp-2 min-h-[32px] leading-relaxed">
              {item.description}
            </p>
          ) : (
            <p className="text-xs text-[#747775] dark:text-[#8E918F] italic min-h-[32px]">
              Chưa có mô tả lớp học
            </p>
          )}

          {/* Schedule Info */}
          <div className="p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#444746] dark:text-[#C4C7C5] flex items-center gap-2 border-none">
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
              meeting_room
            </span>
            <span className="font-medium truncate">
              {item.schedule?.room || 'Phòng học trực tuyến'}
            </span>
            <span className="text-[#747775] dark:text-[#8E918F]">•</span>
            <span className="truncate text-[#747775] dark:text-[#8E918F]">
              {item.schedule?.dayOfWeek || 'Linh hoạt'}
            </span>
          </div>

          {/* Capacity Progress */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#747775] dark:text-[#8E918F]">{t('students')}</span>
              <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {item.enrolledCount || 0} / {item.maxStudents || 60} ({enrolledPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] transition-all duration-500"
                style={{ width: `${enrolledPercent}%` }}
              />
            </div>
          </div>

          {/* Alert Notification Strip (if pending or ungraded tasks exist) */}
          {hasAlert && (
            <div className="px-3 py-1.5 rounded-full bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] text-[11px] font-medium flex items-center gap-1.5 whitespace-nowrap border-none">
              <span className="material-symbols-outlined text-[15px] text-[#725200] dark:text-[#FFB784] shrink-0">
                notification_important
              </span>
              <span className="truncate">
                {(item.stats?.pendingRequestsCount ?? 0) > 0 &&
                  t('pendingRequests', { count: item.stats?.pendingRequestsCount || 0 })}
                {(item.stats?.pendingRequestsCount ?? 0) > 0 &&
                  (item.stats?.ungradedAssignmentsCount ?? 0) > 0 &&
                  ' • '}
                {(item.stats?.ungradedAssignmentsCount ?? 0) > 0 &&
                  t('ungradedAssignments', { count: item.stats?.ungradedAssignmentsCount || 0 })}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-between gap-2">
          {/* Copy Code Pill */}
          {item.enrollmentKey ? (
            <button
              type="button"
              onClick={() => onCopyCode(item.enrollmentKey!)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#C4C7C5] text-xs font-mono font-medium whitespace-nowrap transition-colors border-none cursor-pointer"
              title={t('copyCode')}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isCopied ? 'check' : 'content_copy'}
              </span>
              <span>{item.enrollmentKey}</span>
            </button>
          ) : (
            <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">Không có mã</span>
          )}

          {/* Enter Class Space - MD3 Primary Tonal */}
          <Link
            href={`/classes/${item.id}`}
            prefetch={true}
            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-medium whitespace-nowrap transition-colors border-none shadow-none"
          >
            <span>{t('enterClassSpace')}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
