'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CustomSelect } from '@/components/shared';
import type { Chapter, Lesson, LessonType } from '../../schemas/course.schema';

interface CourseSyllabusTabProps {
  chapters: Chapter[];
  canEdit?: boolean;
  onOpenAddChapter: () => void;
  onOpenAddLessonForChapter: (chapterId: string) => void;
  onDeleteChapter?: (chapter: Chapter) => void;
  onSelectLesson: (lesson: Lesson, chapter: Chapter) => void;
  onEditLesson?: (lesson: Lesson) => void;
  onDeleteLesson?: (lesson: Lesson) => void;
}

export function CourseSyllabusTab({
  chapters,
  canEdit = false,
  onOpenAddChapter,
  onOpenAddLessonForChapter,
  onDeleteChapter,
  onSelectLesson,
  onEditLesson,
  onDeleteLesson,
}: CourseSyllabusTabProps) {
  const t = useTranslations('courses.detail');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

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

          const matchStatus =
            selectedStatus === 'ALL' || les.status === selectedStatus;

          return matchQuery && matchStatus;
        });

        const chapterTitleMatch = !q || ch.title.toLowerCase().includes(q);

        return {
          ...ch,
          matchedLessons,
          isVisible: chapterTitleMatch || matchedLessons.length > 0,
        };
      })
      .filter((ch) => ch.isVisible);
  }, [chapters, searchQuery, selectedStatus]);

  const getNotionLessonStyle = () => ({
    icon: 'article',
    containerClass:
      'bg-blue-50 text-[#0059bb] dark:bg-blue-950/60 dark:text-blue-400 border-2 border-blue-200/80 dark:border-blue-800/60 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60',
  });

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
          <CustomSelect<string>
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'COMPLETED', label: 'Đã hoàn thành' },
              { value: 'IN_PROGRESS', label: 'Đang học' },
              { value: 'NOT_STARTED', label: 'Chưa học' },
            ]}
            className="min-w-[160px]"
          />

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

          {canEdit && (
            <button
              type="button"
              onClick={onOpenAddChapter}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0059bb] hover:bg-[#004899] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm ml-2 border-2 border-[#0059bb] transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{t('btnAddChapter')}</span>
            </button>
          )}
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
          {!searchQuery && canEdit && (
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
            const originalIdx = chapters.findIndex((c) => c.id === ch.id);
            const displayChapterNum = (originalIdx >= 0 ? originalIdx : chIdx) + 1;

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
                      {displayChapterNum}
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
                  <div className="flex items-center gap-2 shrink-0">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onOpenAddLessonForChapter(ch.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[#0059bb] dark:text-blue-400 border-2 border-[#0059bb]/30 hover:border-[#0059bb] hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>{t('btnAddLesson')}</span>
                      </button>
                    )}

                    {canEdit && onDeleteChapter && (
                      <button
                        type="button"
                        onClick={() => onDeleteChapter(ch)}
                        title="Xóa chương học"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    )}

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
                    {displayedLessons.filter((les) => canEdit || les.isPublished !== false).length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 italic">
                        {t('emptyLessons')}
                      </div>
                    ) : (
                      displayedLessons
                        .filter((les) => canEdit || les.isPublished !== false)
                        .map((les) => {
                        const pageStyle = getNotionLessonStyle();

                        return (
                          <div
                            key={les.id}
                            className="bg-white dark:bg-slate-900 border-[3px] border-slate-200 dark:border-slate-800 hover:border-[#0059bb] dark:hover:border-blue-500 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group shadow-sm"
                          >
                            <div className="flex items-start md:items-center gap-4 min-w-0 flex-1">
                              {/* Page Icon Box */}
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${pageStyle.containerClass}`}
                              >
                                <span className="material-symbols-outlined text-[22px]">
                                  {pageStyle.icon}
                                </span>
                              </div>

                              {/* Title & Metadata */}
                              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                <h3 className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-semibold group-hover:text-[#0059bb] dark:group-hover:text-blue-400 transition-colors truncate">
                                  {les.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                    Bài giảng dạng khối
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

                            {/* Right Status Badge & Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                              {les.isPublished === false && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                                  Bản nháp
                                </span>
                              )}
                              {getLessonStatusBadge(les.status)}

                              {canEdit && onEditLesson && (
                                <button
                                  type="button"
                                  onClick={() => onEditLesson(les)}
                                  title="Mở Không gian Biên soạn Khối (Notion Editor)"
                                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/70 transition-colors text-xs font-semibold cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                  <span>Biên soạn</span>
                                </button>
                              )}

                              {canEdit && onDeleteLesson && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteLesson(les)}
                                  title="Xóa bài học"
                                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border-none bg-transparent"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              )}

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
