'use client';

import React from 'react';

export interface LessonItem {
  id: string;
  code?: string;
  title: string;
  type: 'video' | 'slide' | 'lab' | 'quiz' | 'simulation';
  meta: string;
  stats: string;
  status: 'published' | 'draft' | 'closed' | 'conditional_lock';
  isDraft?: boolean;
  alert?: string;
  prerequisite?: string;
  submissionsCount?: number;
}

export interface ModuleData {
  id: string;
  order: number;
  title: string;
  weeks: string;
  statusBadge: string;
  statusType?: 'published' | 'active_focus' | 'scheduled' | 'locked';
  isActiveFocus?: boolean;
  isLocked?: boolean;
  lessons: LessonItem[];
}

export interface ModuleAccordionItemProps {
  module: ModuleData;
  isExpanded: boolean;
  isEditMode: boolean;
  onToggle: () => void;
  onAddLessonClick: (moduleId: string) => void;
  onEditModuleClick: (moduleId: string) => void;
  onPublishLesson: (lessonId: string) => void;
  onGradeLesson: (lessonId: string) => void;
  onLessonStatsClick: (lessonId: string) => void;
  onQuickAdd: (moduleId: string, type: string) => void;
  onOpenEarlyClick?: (moduleId: string) => void;
}

export function ModuleAccordionItem({
  module,
  isExpanded,
  isEditMode,
  onToggle,
  onAddLessonClick,
  onEditModuleClick,
  onPublishLesson,
  onGradeLesson,
  onLessonStatsClick,
  onQuickAdd,
  onOpenEarlyClick,
}: ModuleAccordionItemProps) {
  const getFormatIcon = (type: LessonItem['type']) => {
    switch (type) {
      case 'video':
        return 'smart_display';
      case 'slide':
        return 'description';
      case 'lab':
        return 'terminal';
      case 'quiz':
        return 'quiz';
      case 'simulation':
        return 'developer_board';
      default:
        return 'menu_book';
    }
  };

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all duration-200 border-[3px] ${
        module.isActiveFocus
          ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
          : module.isLocked
          ? 'border-slate-300 dark:border-slate-800 opacity-75'
          : 'border-slate-300 dark:border-slate-700'
      }`}
    >
      {/* Module Header */}
      <div
        onClick={onToggle}
        className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
          module.isActiveFocus
            ? 'bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-950/60'
            : 'bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {isEditMode && (
            <span
              className="material-symbols-outlined text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab shrink-0"
              title="Kéo thả để sắp xếp lại chương"
              onClick={(e) => e.stopPropagation()}
            >
              drag_indicator
            </span>
          )}

          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
              module.isActiveFocus
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {module.order}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  module.isActiveFocus ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
                }`}
              >
                Chương {module.order} {module.isActiveFocus && '• Đang giảng dạy'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {module.weeks}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  module.isActiveFocus
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                {module.isActiveFocus && (
                  <span className="material-symbols-outlined text-[12px]">bolt</span>
                )}
                <span>{module.statusBadge}</span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {module.title}
            </h3>
          </div>
        </div>

        {/* Action buttons on Header */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {module.statusType === 'scheduled' && onOpenEarlyClick && (
            <button
              type="button"
              onClick={() => onOpenEarlyClick(module.id)}
              className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              Mở ngay bây giờ
            </button>
          )}

          {isEditMode && (
            <>
              <button
                type="button"
                onClick={() => onAddLessonClick(module.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Thêm bài học vào chương này"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <button
                type="button"
                onClick={() => onEditModuleClick(module.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Chỉnh sửa chương"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onToggle}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-transform duration-200 cursor-pointer ${
              isExpanded ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
            }`}
            aria-label="Thu gọn hoặc mở rộng"
          >
            <span className="material-symbols-outlined text-[22px]">expand_more</span>
          </button>
        </div>
      </div>

      {/* Module Lessons Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 flex flex-col gap-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {module.lessons.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">
              Chưa có bài học nào trong chương này.
            </p>
          ) : (
            module.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  lesson.isDraft
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700'
                    : 'bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isEditMode && (
                    <span
                      className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 cursor-grab text-[18px] shrink-0"
                      title="Kéo thả bài học"
                    >
                      drag_indicator
                    </span>
                  )}

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100/70 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[19px]">
                      {getFormatIcon(lesson.type)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {lesson.code && (
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {lesson.code}
                        </span>
                      )}
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {lesson.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                      <span>{lesson.meta}</span>
                      <span>•</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {lesson.stats}
                      </span>
                      {lesson.alert && (
                        <>
                          <span>•</span>
                          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            <span>{lesson.alert}</span>
                          </span>
                        </>
                      )}
                      {lesson.prerequisite && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            <span>{lesson.prerequisite}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls per lesson */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                  {lesson.isDraft ? (
                    <>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        Bản nháp
                      </span>
                      <button
                        type="button"
                        onClick={() => onPublishLesson(lesson.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Xuất bản
                      </button>
                    </>
                  ) : lesson.submissionsCount ? (
                    <>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                        Đang mở nộp
                      </span>
                      <button
                        type="button"
                        onClick={() => onGradeLesson(lesson.id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">grading</span>
                        <span>Chấm bài ({lesson.submissionsCount})</span>
                      </button>
                    </>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                      Đã xuất bản
                    </span>
                  )}

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => onLessonStatsClick(lesson.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Thống kê học viên"
                    >
                      <span className="material-symbols-outlined text-[16px]">query_stats</span>
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Chỉnh sửa nội dung"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* In-Module Quick Action Bar (when Edit Mode is active) */}
          {isEditMode && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 mt-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                  add_circle
                </span>
                <span>Thêm nhanh vào Chương {module.order}:</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => onQuickAdd(module.id, 'video')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px] text-blue-600">smart_display</span>
                  <span>Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => onQuickAdd(module.id, 'slide')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px] text-slate-800 dark:text-slate-100">description</span>
                  <span>Slide PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => onQuickAdd(module.id, 'lab')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px] text-blue-600">terminal</span>
                  <span>Bài Lab</span>
                </button>

                <button
                  type="button"
                  onClick={() => onQuickAdd(module.id, 'quiz')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px] text-purple-600">psychology</span>
                  <span>Trắc nghiệm AI</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
