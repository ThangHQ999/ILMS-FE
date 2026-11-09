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
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] transition-all duration-300 overflow-hidden hover:-translate-y-1">
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
            <span className="px-2.5 py-1 rounded-lg bg-black/25 backdrop-blur-md text-white text-[11px] font-mono font-bold tracking-wider uppercase border border-white/20">
              {item.name}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20 hidden sm:inline-block">
              {item.semester || 'HK1'}
            </span>
          </div>

          {/* Action Menu Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/35 backdrop-blur-md text-white flex items-center justify-center transition-colors border border-white/20"
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
                <div className="absolute right-0 top-10 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (item.enrollmentKey) onCopyCode(item.enrollmentKey);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>{t('copyCode')}</span>
                  </button>

                  {!isArchived ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onArchiveClick(item);
                      }}
                      className="w-full px-3.5 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
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
                        className="w-full px-3.5 py-2 text-left text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2"
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
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
            {item.academicYear}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Title */}
          <Link
            href={`/classes/${item.id}`}
            prefetch={true}
            className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          >
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
              {item.title}
            </h3>
          </Link>

          {/* Description or details */}
          {item.description ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
              {item.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic min-h-[32px]">
              Chưa có mô tả lớp học
            </p>
          )}

          {/* Schedule Info */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
              meeting_room
            </span>
            <span className="font-medium truncate">
              {item.schedule?.room || 'Phòng học trực tuyến'}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="truncate text-slate-500 dark:text-slate-400">
              {item.schedule?.dayOfWeek || 'Linh hoạt'}
            </span>
          </div>

          {/* Capacity Progress */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t('students')}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.enrolledCount || 0} / {item.maxStudents || 60} ({enrolledPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${enrolledPercent}%` }}
              />
            </div>
          </div>

          {/* Alert Notification Strip (if pending or ungraded tasks exist) */}
          {hasAlert && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-amber-600 dark:text-amber-400 shrink-0">
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
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          {/* Copy Code Pill */}
          {item.enrollmentKey ? (
            <button
              type="button"
              onClick={() => onCopyCode(item.enrollmentKey!)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold transition-colors"
              title={t('copyCode')}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isCopied ? 'check' : 'content_copy'}
              </span>
              <span>{item.enrollmentKey}</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Không có mã</span>
          )}

          {/* Enter Class Space */}
          <Link
            href={`/classes/${item.id}`}
            prefetch={true}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
          >
            <span>{t('enterClassSpace')}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

