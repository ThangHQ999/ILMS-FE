'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Chapter, Lesson, LessonType } from '../../schemas/course.schema';

interface CourseSyllabusTabProps {
  chapters: Chapter[];
  onOpenAddChapter: () => void;
  onOpenAddLessonForChapter: (chapterId: string) => void;
  onSelectLesson: (lesson: Lesson, chapter: Chapter) => void;
}

export function CourseSyllabusTab({
  chapters,
  onOpenAddChapter,
  onOpenAddLessonForChapter,
  onSelectLesson,
}: CourseSyllabusTabProps) {
  const t = useTranslations('courses.detail');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Accordion open/close map (default all open)
  const [openChapterIds, setOpenChapterIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      init[ch.id] = true;
    });
    return init;
  });

  const toggleChapter = (chapterId: string) => {
    setOpenChapterIds((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      next[ch.id] = true;
    });
    setOpenChapterIds(next);
  };

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      next[ch.id] = false;
    });
    setOpenChapterIds(next);
  };

  // Filtered chapters and lessons
  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return chapters
      .map((ch) => {
        const matchedLessons = ch.lessons.filter((les) => {
          const matchQuery =
            !q ||
            les.title.toLowerCase().includes(q) ||
            (les.description && les.description.toLowerCase().includes(q));

          const matchType = selectedType === 'ALL' || les.lessonType === selectedType;

          return matchQuery && matchType;
        });

        // Also include chapter if title matches query and no type filter
        const chapterTitleMatch = !q || ch.title.toLowerCase().includes(q);

        return {
          ...ch,
          matchedLessons,
          isVisible: chapterTitleMatch || matchedLessons.length > 0,
        };
      })
      .filter((ch) => ch.isVisible);
  }, [chapters, searchQuery, selectedType]);

  const getLessonTypeIcon = (type: LessonType) => {
    switch (type) {
      case 'VIDEO':
        return { icon: 'smart_display', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' };
      case 'QUIZ':
        return { icon: 'quiz', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' };
      case 'ASSIGNMENT':
        return { icon: 'code', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' };
      case 'DOCUMENT':
        return { icon: 'description', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' };
      case 'THEORY':
      default:
        return { icon: 'menu_book', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' };
    }
  };

  const getLessonStatusBadge = (status: Lesson['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            <span>{t('lessonStatus.COMPLETED')}</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            <span className="material-symbols-outlined text-[13px]">pending</span>
            <span>{t('lessonStatus.IN_PROGRESS')}</span>
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-[13px]">radio_button_unchecked</span>
            <span>{t('lessonStatus.NOT_STARTED')}</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchLessonPlaceholder')}
            className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[16px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type Filter & Actions */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2 rounded-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300 transition-all"
          >
            <option value="ALL">{t('filterTypeAll')}</option>
            <option value="THEORY">{t('filterTypeTheory')}</option>
            <option value="VIDEO">{t('filterTypeVideo')}</option>
            <option value="QUIZ">{t('filterTypeQuiz')}</option>
            <option value="ASSIGNMENT">{t('filterTypeAssignment')}</option>
          </select>

          <button
            type="button"
            onClick={handleExpandAll}
            className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">unfold_more</span>
            <span>{t('expandAll')}</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">unfold_less</span>
            <span>{t('collapseAll')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddChapter}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>{t('btnAddChapter')}</span>
          </button>
        </div>
      </div>

      {/* Chapters Accordion List */}
      {filteredChapters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">menu_book</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            {searchQuery ? t('emptySearch') : t('emptyChapters')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc định dạng.' : 'Bắt đầu xây dựng đề cương môn học bằng cách thêm chương học đầu tiên.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={onOpenAddChapter}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>{t('btnAddChapter')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredChapters.map((ch, chIdx) => {
            const isOpen = openChapterIds[ch.id] ?? true;
            const displayedLessons = ch.matchedLessons;

            return (
              <div
                key={ch.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
              >
                {/* Chapter Accordion Header */}
                <div
                  onClick={() => toggleChapter(ch.id)}
                  className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <span className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 sm:mt-0">
                      {ch.orderIndex || chIdx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                          {ch.title}
                        </h2>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {t('lessonsInChapter', { count: ch.lessons.length })}
                        </span>
                      </div>
                      {ch.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {ch.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onOpenAddLessonForChapter(ch.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors"
                      title={t('btnAddLesson')}
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span className="hidden sm:inline">{t('btnAddLesson')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleChapter(ch.id)}
                      className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {/* Lessons list inside chapter */}
                {isOpen && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 px-4 sm:px-6 py-4 flex flex-col gap-2.5 bg-slate-50/40 dark:bg-slate-950/30">
                    {displayedLessons.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        {t('emptyLessons')}
                      </div>
                    ) : (
                      displayedLessons.map((les) => {
                        const typeInfo = getLessonTypeIcon(les.lessonType);

                        return (
                          <div
                            key={les.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Type Icon */}
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.color}`}>
                                <span className="material-symbols-outlined text-[18px]">
                                  {typeInfo.icon}
                                </span>
                              </div>

                              {/* Title & Metadata */}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {les.title}
                                  </h4>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                  <span className="font-medium text-slate-600 dark:text-slate-300">
                                    {t(`lessonType.${les.lessonType}`)}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                                    <span>{t('lessonDuration', { minutes: les.duration || 45 })}</span>
                                  </span>
                                  {les.materials && les.materials.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                        <span className="material-symbols-outlined text-[13px]">attach_file</span>
                                        <span>{les.materials.length} tài liệu</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Status & Action */}
                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              {getLessonStatusBadge(les.status)}

                              <button
                                type="button"
                                onClick={() => onSelectLesson(les, ch)}
                                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all active:scale-95"
                              >
                                <span>{les.status === 'COMPLETED' ? t('actionPreview') : t('actionLearn')}</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

