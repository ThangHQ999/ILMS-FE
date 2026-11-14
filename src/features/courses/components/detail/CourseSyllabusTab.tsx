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
        return {
          icon: 'play_circle',
          containerClass:
            'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-800/60 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/60',
        };
      case 'ASSIGNMENT':
        return {
          icon: 'code',
          containerClass:
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-800/60 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60',
        };
      case 'QUIZ':
        return {
          icon: 'quiz',
          containerClass:
            'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800/60 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60',
        };
      case 'DOCUMENT':
        return {
          icon: 'description',
          containerClass:
            'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800/60 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60',
        };
      case 'THEORY':
      default:
        return {
          icon: 'menu_book',
          containerClass:
            'bg-slate-100 text-[#0059bb] dark:bg-blue-950/60 dark:text-blue-400 border-2 border-slate-300/60 dark:border-blue-800/60 group-hover:bg-[#d8e2ff] dark:group-hover:bg-blue-900/60 group-hover:border-[#0059bb]/50',
        };
    }
  };

  const getLessonStatusBadge = (status: Lesson['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold text-xs border-2 border-emerald-300 dark:border-emerald-700 shrink-0">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{t('lessonStatus.COMPLETED')}</span>
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-semibold text-xs border-2 border-amber-300 dark:border-amber-700 shrink-0">
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
            <span>{t('lessonStatus.IN_PROGRESS')}</span>
          </div>
        );
      case 'NOT_STARTED':
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium text-xs border-2 border-slate-300/60 dark:border-slate-700 shrink-0">
            <span className="material-symbols-outlined text-[18px]">circle</span>
            <span>{t('lessonStatus.NOT_STARTED')}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* TOOLBAR LỌC & TÌM KIẾM */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border-2 border-slate-300 dark:border-slate-700">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1 min-w-[250px]">
          <span className="material-symbols-outlined text-slate-400 ml-2 text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchLessonPlaceholder')}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 p-2"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 text-sm px-2"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg border-2 border-slate-300/60 dark:border-slate-700"
          >
            <option value="ALL" className="bg-white dark:bg-slate-900">{t('filterTypeAll')}</option>
            <option value="THEORY" className="bg-white dark:bg-slate-900">{t('filterTypeTheory')}</option>
            <option value="VIDEO" className="bg-white dark:bg-slate-900">{t('filterTypeVideo')}</option>
            <option value="ASSIGNMENT" className="bg-white dark:bg-slate-900">{t('filterTypeAssignment')}</option>
            <option value="QUIZ" className="bg-white dark:bg-slate-900">{t('filterTypeQuiz')}</option>
          </select>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={handleExpandAll}
            className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border-2 border-slate-300/60 dark:border-slate-700 hover:border-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">unfold_more</span>
            <span>{t('expandAll')}</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border-2 border-slate-300/60 dark:border-slate-700 hover:border-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">unfold_less</span>
            <span>{t('collapseAll')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddChapter}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0059bb] hover:bg-[#004899] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm ml-2 border-2 border-[#0059bb] transition-colors cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>{t('btnAddChapter')}</span>
          </button>
        </div>
      </div>

      {/* KHUNG NỘI DUNG CÁC CHƯƠNG */}
      {filteredChapters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0059bb] dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">menu_book</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            {searchQuery ? t('emptySearch') : t('emptyChapters')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc định dạng.'
              : 'Bắt đầu xây dựng đề cương môn học bằng cách thêm chương học đầu tiên.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={onOpenAddChapter}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0059bb] hover:bg-[#004899] text-white text-xs font-bold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{t('btnAddChapter')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8 mt-2">
          {filteredChapters.map((ch, chIdx) => {
            const isOpen = openChapterIds[ch.id] ?? true;
            const displayedLessons = ch.matchedLessons;

            return (
              <div
                key={ch.id}
                className="bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
              >
                {/* Header Chương */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Circle Chapter Index */}
                    <div className="w-12 h-12 rounded-full bg-[#d6e3ff] text-[#0d1c32] dark:bg-blue-950 dark:text-blue-200 flex items-center justify-center text-lg shrink-0 font-bold border-[3px] border-[#b9c7e4] dark:border-blue-800">
                      {ch.orderIndex || chIdx + 1}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                          {ch.title}
                        </h2>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs font-semibold border-2 border-slate-300/40 dark:border-slate-700">
                          {t('lessonsInChapter', { count: ch.lessons.length })}
                        </span>
                      </div>
                      {ch.description && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          {ch.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenAddLessonForChapter(ch.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#0059bb] dark:text-blue-400 border-2 border-[#0059bb]/30 hover:border-[#0059bb] hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                      <span>{t('btnAddLesson')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleChapter(ch.id)}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-400 border-2 border-slate-300/40 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isOpen ? t('collapseAll') : t('expandAll')}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Danh sách Bài học Chương */}
                {isOpen && (
                  <div className="flex flex-col gap-4">
                    {displayedLessons.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 italic">
                        {t('emptyLessons')}
                      </div>
                    ) : (
                      displayedLessons.map((les) => {
                        const typeInfo = getLessonTypeIcon(les.lessonType);

                        return (
                          <div
                            key={les.id}
                            className="bg-white dark:bg-slate-900 border-[3px] border-slate-200 dark:border-slate-800 hover:border-[#0059bb] dark:hover:border-blue-500 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group shadow-sm"
                          >
                            <div className="flex items-start md:items-center gap-4 min-w-0 flex-1">
                              {/* Type Icon Box */}
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${typeInfo.containerClass}`}
                              >
                                <span className="material-symbols-outlined text-[22px]">
                                  {typeInfo.icon}
                                </span>
                              </div>

                              {/* Title & Metadata */}
                              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                <h3 className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-semibold group-hover:text-[#0059bb] dark:group-hover:text-blue-400 transition-colors truncate">
                                  {les.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                    {t(`lessonType.${les.lessonType}`)}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                                    <span>{t('lessonDuration', { minutes: les.duration || 45 })}</span>
                                  </span>
                                  {les.materials && les.materials.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-[#0059bb] dark:text-blue-400 font-semibold">
                                        <span className="material-symbols-outlined text-[16px]">attach_file</span>
                                        <span>{les.materials.length} tài liệu</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Status Badge & Action Button */}
                            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                              {getLessonStatusBadge(les.status)}

                              <button
                                type="button"
                                onClick={() => onSelectLesson(les, ch)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-[3px] border-slate-300 dark:border-slate-700 hover:border-[#0059bb] dark:hover:border-blue-500 transition-colors text-xs font-semibold cursor-pointer active:scale-95"
                              >
                                <span>
                                  {les.status === 'COMPLETED' ? t('actionPreview') : t('actionLearn')}
                                </span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
