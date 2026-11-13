'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { CourseDetail } from '../../schemas/course.schema';

interface CourseBannerProps {
  course: CourseDetail;
  totalLessons: number;
  completedLessons: number;
  onOpenAddChapter: () => void;
  onOpenAddLesson: () => void;
  onSelectTab: (tab: string) => void;
}

export function CourseBanner({
  course,
  totalLessons,
  completedLessons,
  onOpenAddChapter,
  onOpenAddLesson,
  onSelectTab,
}: CourseBannerProps) {
  const t = useTranslations('courses.detail');
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : course.teachingProgress || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 shadow-md">
      {/* Background ambient decorative shapes */}
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute right-32 -bottom-20 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-100/90 font-medium">
          <Link
            href="/classes"
            className="hover:text-white transition-colors flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>{t('backToClasses')}</span>
          </Link>
          <span>/</span>
          <span className="text-white font-semibold truncate max-w-[200px] sm:max-w-md">
            {course.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('statusActive')}</span>
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/30 text-white backdrop-blur-sm">
            {t('credits', { count: course.credits || 3 })}
          </span>
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-white text-blue-900 shadow-xs">
              {course.courseCode}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/40 text-blue-100 font-medium">
              {course.semester || 'Học kỳ II (2024-2025)'}
            </span>
            {course.specialFeature && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-400/20 text-white font-medium">
                <span className="material-symbols-outlined text-[14px]">
                  {course.specialFeatureIcon || 'auto_awesome'}
                </span>
                <span>{course.specialFeature}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 leading-snug">
            {course.name}
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed max-w-2xl line-clamp-2">
            {course.description || 'Chương trình giảng dạy học phần tích hợp Đồ thị tri thức và Trợ lý AI Socratic.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-blue-200">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-300">person</span>
              <span>{t('instructor')}:</span>
              <strong className="text-white font-semibold">{course.instructorName || 'TS. Lê Hoàng Nam'}</strong>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-300">hub</span>
              <strong className="text-white font-semibold">{course.knowledgeNodesCount || 142}</strong>
              <span>{t('knowledgeNodes')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAddLesson}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>{t('btnAddLesson')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddChapter}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">playlist_add</span>
            <span>{t('btnAddChapter')}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('aiTutor')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-105 text-slate-900 font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">smart_toy</span>
            <span>{t('btnOpenAiTutor')}</span>
          </button>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="mt-8 pt-6 border-t border-white/10 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-xs text-blue-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </span>
            <div>
              <div className="font-bold text-white text-sm">{course.chaptersCount || 4}</div>
              <div className="text-blue-200 text-[11px]">{t('chaptersCount')}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold">
              <span className="material-symbols-outlined text-[18px]">play_lesson</span>
            </span>
            <div>
              <div className="font-bold text-white text-sm">{totalLessons || 12}</div>
              <div className="text-blue-200 text-[11px]">{t('lessonsCount')}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-64">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-blue-200 font-medium">{t('teachingProgress')}</span>
            <span className="text-white font-bold font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
