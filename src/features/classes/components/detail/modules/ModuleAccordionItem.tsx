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
      className={`rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none overflow-hidden transition-all duration-200 border-none ${
        module.isLocked ? 'opacity-75' : ''
      }`}
    >
      {/* Module Header */}
      <div
        onClick={onToggle}
        className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
          module.isActiveFocus
            ? 'bg-[#D3E3FD]/30 dark:bg-[#162B4D]/30 hover:opacity-90'
            : 'bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90'
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {isEditMode && (
            <span
              className="material-symbols-outlined text-gray-400 hover:text-gray-700 dark:hover:text-[#E3E3E3] cursor-grab shrink-0"
              title="Kéo thả để sắp xếp lại chương"
              onClick={(e) => e.stopPropagation()}
            >
              drag_indicator
            </span>
          )}

          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border-none ${
              module.isActiveFocus
                ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F]'
                : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5]'
            }`}
          >
            {module.order}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  module.isActiveFocus ? 'text-blue-600 dark:text-[#A8C7FA]' : 'text-gray-500 dark:text-[#8E918F]'
                }`}
              >
                Chương {module.order} {module.isActiveFocus && '• Đang giảng dạy'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="text-xs text-gray-500 dark:text-[#8E918F] font-medium">
                {module.weeks}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border-none ${
                  module.isActiveFocus
                    ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F]'
                    : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5]'
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
        <div className="p-4 sm:p-5 flex flex-col gap-2.5 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#1E1F20]">
          {module.lessons.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-[#8E918F] italic py-2 text-center">
              Chưa có bài học nào trong chương này.
            </p>
          ) : (
            module.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`p-3.5 sm:p-4 rounded-2xl border-none transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  lesson.isDraft
                    ? 'bg-[#F0F4F8]/60 dark:bg-[#131314]/60'
                    : 'bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isEditMode && (
                    <span
                      className="material-symbols-outlined text-gray-300 group-hover:text-gray-500 cursor-grab text-[18px] shrink-0"
                      title="Kéo thả bài học"
                    >
                      drag_indicator
                    </span>
                  )}

                  <div className="w-9 h-9 rounded-xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center shrink-0 border-none">
                    <span className="material-symbols-outlined text-[19px]">
                      {getFormatIcon(lesson.type)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {lesson.code && (
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-[#A8C7FA]">
                          {lesson.code}
                        </span>
                      )}
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] truncate">
                        {lesson.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-[#8E918F] mt-0.5 flex-wrap">
                      <span>{lesson.meta}</span>
                      <span>•</span>
                      <span className="text-gray-700 dark:text-[#C4C7C5] font-medium">
                        {lesson.stats}
                      </span>
                      {lesson.alert && (
                        <>
                          <span>•</span>
                          <span className="text-rose-600 dark:text-[#F28B82] font-semibold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            <span>{lesson.alert}</span>
                          </span>
                        </>
                      )}
                      {lesson.prerequisite && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 dark:text-[#FFB784] font-medium flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            <span>{lesson.prerequisite}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls per lesson */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                  {lesson.isDraft ? (
                    <>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] text-[10px] font-semibold border-none">
                        Bản nháp
                      </span>
                      <button
                        type="button"
                        onClick={() => onPublishLesson(lesson.id)}
                        className="px-3.5 py-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-[11px] font-semibold transition-colors cursor-pointer border-none"
                      >
                        Xuất bản
                      </button>
                    </>
                  ) : lesson.submissionsCount ? (
                    <>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] text-[10px] font-semibold border-none">
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

                  {isEditMode && (
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
                  )}
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

