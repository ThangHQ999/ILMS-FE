'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Chapter, LessonType } from '../../schemas/course.schema';

interface LessonSyllabusSidebarProps {
  courseCode?: string;
  semester?: string;
  chapters: Chapter[];
  progressPercent?: number;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
  activeLessonId?: string;
  canEdit?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onAddLessonInChapter?: (chapterId: string) => void;
  onDeleteChapter?: (chapterId: string, chapterTitle: string) => void;
  onDeleteLesson?: (lessonId: string, lessonTitle: string) => void;
  onSelectLessonItem: (lessonId: string, lessonTitle: string) => void;
  onToast?: (msg: string) => void;
}

export function LessonSyllabusSidebar({
  courseCode = 'COURSE',
  semester,
  chapters = [],
  progressPercent = 0,
  completedLessonsCount = 0,
  totalLessonsCount = 0,
  activeLessonId,
  canEdit = false,
  isCollapsed = false,
  onToggleCollapse,
  onAddLessonInChapter,
  onDeleteChapter,
  onDeleteLesson,
  onSelectLessonItem,
}: LessonSyllabusSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  // Auto-open the chapter containing the active lesson (or first chapter)
  useEffect(() => {
    if (chapters.length === 0) return;
    setOpenChapters((prev) => {
      const next = { ...prev };
      const activeChap = chapters.find((ch) =>
        ch.lessons.some((l) => l.id === activeLessonId)
      );
      if (activeChap) {
        next[activeChap.id] = true;
      } else if (Object.keys(prev).length === 0) {
        next[chapters[0].id] = true;
      }
      return next;
    });
  }, [chapters, activeLessonId]);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return chapters;
    return chapters
      .map((ch) => {
        const chapterMatches = ch.title.toLowerCase().includes(q);
        const matchedLessons = ch.lessons.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            (l.description && l.description.toLowerCase().includes(q))
        );
        if (chapterMatches) return ch;
        if (matchedLessons.length > 0) return { ...ch, lessons: matchedLessons };
        return null;
      })
      .filter((ch): ch is Chapter => ch !== null);
  }, [chapters, searchQuery]);

  const getLessonMeta = (_type: LessonType, status: string) => {
    if (status === 'COMPLETED') {
      return {
        icon: 'check_circle',
        color: 'text-emerald-600 dark:text-emerald-400',
      };
    }
    return {
      icon: 'article',
      color: 'text-blue-600 dark:text-blue-400',
    };
  };

  if (isCollapsed) {
    return (
      <aside
        className="w-14 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col items-center py-3 gap-3 transition-all duration-200 z-30 min-h-[calc(100vh-7.5rem)] self-stretch"
        id="left-sidebar"
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Mở rộng Chương trình học"
          aria-label="Mở rộng Chương trình học"
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center border-none cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>

        <div className="w-7 h-px bg-slate-200 dark:bg-slate-800" />

        <div className="flex flex-col items-center gap-2 overflow-y-auto py-1">
          {chapters.map((chap, idx) => {
            const hasActive = chap.lessons.some((l) => l.id === activeLessonId);
            return (
              <button
                key={chap.id}
                type="button"
                title={`Chương ${String(idx + 1).padStart(2, '0')}: ${chap.title}`}
                onClick={() => {
                  setOpenChapters((prev) => ({ ...prev, [chap.id]: true }));
                  onToggleCollapse?.();
                }}
                className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center border-none cursor-pointer transition-all ${
                  hasActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {String(idx + 1).padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="w-80 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-all duration-200 z-30 min-h-[calc(100vh-7.5rem)] self-stretch"
      id="left-sidebar"
    >
      {/* Sidebar Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">
              account_tree
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              Chương trình học
            </h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80">
              {progressPercent}% ({completedLessonsCount}/{totalLessonsCount})
            </span>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Thu gọn Chương trình học"
                aria-label="Thu gọn Chương trình học"
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium truncate">
          {semester ? `${courseCode} • ${semester}` : courseCode}
        </p>

        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-slate-400 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bài học, lab, quiz..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/40 border border-slate-200/60 dark:border-slate-700/60 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer flex items-center justify-center p-0"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Syllabus Accordion */}
      <div className="p-3 pb-8 flex-1 overflow-y-auto flex flex-col gap-2.5">
        {filteredChapters.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {chapters.length === 0
              ? 'Môn học chưa có chương học nào.'
              : 'Không tìm thấy bài học phù hợp.'}
          </div>
        ) : (
          filteredChapters.map((chap, idx) => {
            const isOpen = Boolean(openChapters[chap.id]) || searchQuery.trim().length > 0;
            const completedInChap = chap.lessons.filter((l) => l.status === 'COMPLETED').length;
            const isChapDone =
              chap.lessons.length > 0 && completedInChap === chap.lessons.length;
            const hasActiveLesson = chap.lessons.some((l) => l.id === activeLessonId);
            const chapterNumber = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={chap.id}
                className={`rounded-2xl overflow-hidden transition-colors border ${
                  hasActiveLesson
                    ? 'bg-blue-50/60 dark:bg-slate-800/70 border-blue-200 dark:border-blue-800/70'
                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 p-3.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleChapter(chap.id)}
                    className="flex-1 flex items-center gap-2.5 min-w-0 cursor-pointer text-left border-none bg-transparent p-0"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] shrink-0 ${
                        isChapDone
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : hasActiveLesson
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400'
                      }`}
                    >
                      {isChapDone ? 'check_circle' : hasActiveLesson ? 'radio_button_checked' : 'folder'}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                        Chương {chapterNumber} • {completedInChap}/{chap.lessons.length} Bài
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {chap.title}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {canEdit && onAddLessonInChapter && (
                      <button
                        type="button"
                        onClick={() => onAddLessonInChapter(chap.id)}
                        title="Thêm bài học mới vào chương này"
                        className="w-6 h-6 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-center border-none bg-transparent cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    )}
                    {canEdit && onDeleteChapter && (
                      <button
                        type="button"
                        onClick={() => onDeleteChapter(chap.id, chap.title)}
                        title="Xóa chương này"
                        className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center border-none bg-transparent cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleChapter(chap.id)}
                      className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center border-none bg-transparent cursor-pointer"
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-2.5 pb-3 pt-0.5 flex flex-col gap-1.5">
                    {chap.lessons.length === 0 ? (
                      <div className="px-3 py-2 flex flex-col items-start gap-2">
                        <p className="text-[11px] text-slate-400 italic">
                          Chưa có bài học trong chương này.
                        </p>
                        {canEdit && onAddLessonInChapter && (
                          <button
                            type="button"
                            onClick={() => onAddLessonInChapter(chap.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-[11px] font-bold border-none cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            <span>Tạo bài đầu tiên</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      chap.lessons
                        .filter((les) => canEdit || les.isPublished !== false)
                        .map((les) => {
                        const isActive = les.id === activeLessonId;
                        const meta = getLessonMeta(les.lessonType, les.status);
                        const statusLabel =
                          les.status === 'COMPLETED'
                            ? 'Hoàn thành'
                            : les.status === 'IN_PROGRESS'
                              ? 'Đang học'
                              : 'Chưa học';
                        const subtitleParts = [
                          les.duration > 0 ? `${les.duration} phút` : 'Trang bài học',
                          statusLabel,
                        ];

                        return (
                          <div
                            key={les.id}
                            className={`group/les w-full flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl transition-all ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-transparent hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onSelectLessonItem(les.id, les.title)}
                              className="flex-1 flex items-center gap-2.5 min-w-0 text-left border-none bg-transparent cursor-pointer p-0"
                            >
                              <span
                                className={`material-symbols-outlined text-[18px] shrink-0 ${
                                  isActive ? 'text-white' : meta.color
                                }`}
                              >
                                {meta.icon}
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span
                                  className={`text-xs font-semibold truncate ${
                                    isActive
                                      ? 'text-white font-bold'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {les.title}
                                </span>
                                <span
                                  className={`text-[10px] mt-0.5 ${
                                    isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                                  }`}
                                >
                                  {subtitleParts.join(' • ')}
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center gap-0.5 shrink-0">
                              {canEdit && onDeleteLesson && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteLesson(les.id, les.title);
                                  }}
                                  title="Xóa bài học"
                                  className={`w-6 h-6 rounded-lg opacity-0 group-hover/les:opacity-100 focus:opacity-100 flex items-center justify-center border-none bg-transparent cursor-pointer transition-opacity ${
                                    isActive
                                      ? 'text-blue-100 hover:text-white hover:bg-white/15'
                                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[15px]">delete</span>
                                </button>
                              )}
                              {isActive && (
                                <span className="material-symbols-outlined text-[16px] text-white shrink-0">
                                  chevron_right
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
