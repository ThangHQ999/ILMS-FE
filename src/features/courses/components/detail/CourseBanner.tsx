'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { CourseDetail } from '../../schemas/course.schema';

interface CourseBannerProps {
  course: CourseDetail;
  totalLessons: number;
  completedLessons: number;
  totalChapters?: number;
  totalHours?: number;
  onOpenAddChapter: () => void;
  onOpenAddLesson: () => void;
  onSelectTab: (tab: string) => void;
}

export function CourseBanner({
  course,
  totalLessons,
  completedLessons,
  totalChapters,
  totalHours,
  onOpenAddChapter,
  onOpenAddLesson,
  onSelectTab,
}: CourseBannerProps) {
  const t = useTranslations('courses.detail');
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : course.teachingProgress || 36;

  const chaptersCountDisplay = totalChapters || course.chaptersCount || 8;
  const lessonsCountDisplay = totalLessons || course.lecturesCount || 24;
  const hoursCountDisplay = totalHours || 36;

  return (
    <div className="bg-[#39359e] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between gap-6 border-[3px] border-[#4f4ca8]">
      {/* Background Decoration */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />

      {/* Left Info */}
      <div className="flex flex-col gap-4 relative z-10 w-full md:w-2/3">
        {/* Breadcrumbs & Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <Link
            href="/classes"
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{t('backToClasses')}</span>
          </Link>
          <span className="text-white/50">/</span>
          <span className="font-semibold text-white/90 truncate max-w-xs sm:max-w-md">
            {course.name}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('statusActive')}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 font-semibold text-xs">
              {t('credits', { count: course.credits || 3 })}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-white text-[#39359e] rounded font-bold shadow-xs">
            {course.courseCode}
          </span>
          <span className="px-3 py-1 bg-white/10 rounded border border-white/20">
            {course.semester || 'Học kỳ II (2024-2025)'}
          </span>
          <span className="px-3 py-1 bg-white/10 rounded border border-white/20 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">stars</span>
            <span>{course.specialFeature || 'Đồ thị AVL tự chấm'}</span>
          </span>
        </div>

        {/* Title & Desc */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight leading-snug">
            {course.name}
          </h1>
          <p className="text-white/80 max-w-2xl leading-relaxed text-sm md:text-base">
            {course.description ||
              'Học phần chuyên sâu nghiên cứu các cấu trúc dữ liệu cây cân bằng (AVL, Red-Black), Segment Tree, Fenwick Tree và các thuật toán đồ thị nâng cao phục vụ thiết kế hệ thống xử lý dữ liệu lớn.'}
          </p>
        </div>

        {/* Meta Info & Progress Summary Badges */}
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-6 text-white/90 text-xs md:text-sm">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span>{t('instructor')}:</span>
              <strong className="text-white ml-1">{course.instructorName || 'TS. Nguyễn Văn An (CN)'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px]">hub</span>
              <strong>{course.knowledgeNodesCount || 142}</strong> {t('knowledgeNodes')}
            </span>
          </div>

          {/* New row: Tổng số chương, Tổng số bài học, Thời lượng */}
          <div className="flex flex-wrap items-center gap-3 w-full pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border-[3px] border-white/20 text-white text-xs shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-emerald-300">folder</span>
              <span>
                Tổng số: <strong className="text-white font-bold ml-0.5">{chaptersCountDisplay} Chương</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border-[3px] border-white/20 text-white text-xs shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-emerald-300">list_alt</span>
              <span>
                Tổng số: <strong className="text-white font-bold ml-0.5">{lessonsCountDisplay} Bài học</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border-[3px] border-white/20 text-white text-xs shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-emerald-300">schedule</span>
              <span>
                Thời lượng: <strong className="text-white font-bold ml-0.5">{hoursCountDisplay} Giờ học</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Actions & Stats */}
      <div className="flex flex-col gap-3 relative z-10 w-full md:w-auto min-w-[240px]">
        <button
          type="button"
          onClick={onOpenAddLesson}
          className="flex items-center justify-center gap-2 bg-white text-[#39359e] font-bold px-4 py-2.5 rounded-xl border-[3px] border-white/40 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer text-xs sm:text-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>{t('btnAddLesson')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddChapter}
          className="flex items-center justify-center gap-2 bg-white/10 border-[3px] border-white/40 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer text-xs sm:text-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">playlist_add</span>
          <span>{t('btnAddChapter')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('aiTutor')}
          className="flex items-center justify-center gap-2 bg-amber-400 text-amber-950 font-bold px-4 py-2.5 rounded-xl border-[3px] border-amber-300 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer text-xs sm:text-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          <span>{t('btnOpenAiTutor')}</span>
        </button>

        {/* Progress Bar */}
        <div className="mt-auto pt-4 border-t border-white/20 flex flex-col gap-1.5">
          <div className="flex justify-between text-white/90 text-xs">
            <span>{t('teachingProgress')}</span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
