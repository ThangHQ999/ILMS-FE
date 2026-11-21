'use client';

import React, { useState, useEffect } from 'react';
import { CustomSelect } from '@/components/shared';
import type {
  CreateChapterInput,
  CreateLessonInput,
  LessonType,
} from '../../schemas/course.schema';
import type { LessonBlockType } from '../../schemas/lesson-block.schema';

export type LessonCanvasTemplateId =
  | 'BLANK'
  | 'VIDEO_LESSON'
  | 'THEORY_LAB'
  | 'SLIDE_QUIZ';

export interface LessonCreateAuthoringPayload extends CreateLessonInput {
  chapterId?: string;
  starterBlockTypes?: LessonBlockType[];
  openEditorAfterCreate?: boolean;
}

interface CanvasTemplateOption {
  id: LessonCanvasTemplateId;
  title: string;
  subtitle: string;
  icon: string;
  defaultLessonType: LessonType;
  blocks: LessonBlockType[];
  badgeText: string;
}

const CANVAS_TEMPLATES: CanvasTemplateOption[] = [
  {
    id: 'BLANK',
    title: 'Trang trắng tự do',
    subtitle: 'Canvas trống giống Notion — gõ / để chèn bất kỳ khối nào.',
    icon: 'article',
    defaultLessonType: 'THEORY',
    blocks: [],
    badgeText: 'Tùy biến 100%',
  },
  {
    id: 'VIDEO_LESSON',
    title: 'Video + Ghi chú + Quiz',
    subtitle: 'Kết hợp video bài giảng, tóm tắt lý thuyết và câu hỏi kiểm tra.',
    icon: 'smart_display',
    defaultLessonType: 'VIDEO',
    blocks: ['HEADING', 'VIDEO', 'TEXT', 'QUIZ'],
    badgeText: '4 khối sẵn',
  },
  {
    id: 'THEORY_LAB',
    title: 'Lý thuyết + Sơ đồ + Code Lab',
    subtitle: 'Định lý KaTeX, sơ đồ Mermaid/3D và trình chạy code tương tác.',
    icon: 'code_blocks',
    defaultLessonType: 'THEORY',
    blocks: ['HEADING', 'TEXT', 'DIAGRAM', 'CODE_SANDBOX', 'CALLOUT'],
    badgeText: '5 khối sẵn',
  },
  {
    id: 'SLIDE_QUIZ',
    title: 'Slide PDF + Ghi chú + Quiz',
    subtitle: 'Nhúng slide trình chiếu kèm Callout trọng tâm và trắc nghiệm nhanh.',
    icon: 'co_present',
    defaultLessonType: 'DOCUMENT',
    blocks: ['HEADING', 'SLIDE', 'CALLOUT', 'QUIZ'],
    badgeText: '4 khối sẵn',
  },
];

export interface CurriculumAuthoringModalProps {
  isOpen: boolean;
  initialTab?: 'chapter' | 'lesson';
  courseCode?: string;
  courseTitle?: string;
  chapterId?: string | null;
  chapterTitle?: string;
  chapters?: Array<{
    id: string;
    title: string;
    orderIndex?: number;
    lessons?: Array<{ id: string; title?: string }>;
  }>;
  onClose: () => void;
  onSubmitChapter?: (input: CreateChapterInput) => void;
  onSubmitLesson?: (input: LessonCreateAuthoringPayload) => void;
  isLoading?: boolean;
  onToast?: (message: string) => void;
}

export function CurriculumAuthoringModal({
  isOpen,
  initialTab = 'lesson',
  courseCode = 'COURSE',
  chapterId,
  chapterTitle,
  chapters = [],
  onClose,
  onSubmitChapter,
  onSubmitLesson,
  isLoading = false,
  onToast,
}: CurriculumAuthoringModalProps) {
  const [activeTab, setActiveTab] = useState<'chapter' | 'lesson'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  const [selectedTargetChapterId, setSelectedTargetChapterId] = useState<string>(
    chapterId || (chapters.length > 0 ? chapters[0].id : '')
  );

  useEffect(() => {
    if (chapterId) {
      setSelectedTargetChapterId(chapterId);
    } else if (chapters.length > 0 && !selectedTargetChapterId) {
      setSelectedTargetChapterId(chapters[0].id);
    }
  }, [chapterId, chapters, selectedTargetChapterId]);

  // Chapter Form States
  const [chapterName, setChapterName] = useState('');
  const [chapterWeeks, setChapterWeeks] = useState('Tuần 01 - Tuần 03');
  const [chapterPacing, setChapterPacing] = useState<'sequential' | 'free'>('sequential');
  const [chapterDesc, setChapterDesc] = useState('');

  // Notion Lesson Canvas States
  const [lessonTitle, setLessonTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] =
    useState<LessonCanvasTemplateId>('VIDEO_LESSON');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [lessonAbstract, setLessonAbstract] = useState('');
  const [openEditorAfterCreate, setOpenEditorAfterCreate] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  const activeChapterIdx = chapters.findIndex(
    (c) => c.id === selectedTargetChapterId
  );
  const activeChapterObj =
    activeChapterIdx >= 0 ? chapters[activeChapterIdx] : undefined;
  const displayChapterName =
    chapterTitle || activeChapterObj?.title || 'Chương mới';
  const activeChapterNum = activeChapterIdx >= 0 ? activeChapterIdx + 1 : 1;
  const nextLessonNum = (activeChapterObj?.lessons?.length ?? 0) + 1;
  const autoLessonCode = `${courseCode}-L${activeChapterNum}.${nextLessonNum}`;

  const formatChapterLabel = (title: string, idx: number) => {
    const trimmed = title.trim();
    if (/^chương\s+\d+/i.test(trimmed)) return trimmed;
    return `Chương ${idx + 1}: ${trimmed}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'chapter') {
      if (!chapterName.trim()) {
        notify('Vui lòng nhập tên chương học');
        return;
      }
      if (onSubmitChapter) {
        onSubmitChapter({
          title: chapterName.trim(),
          description: chapterDesc.trim() || undefined,
        });
      }
      setChapterName('');
      setChapterDesc('');
      onClose();
    } else {
      if (!lessonTitle.trim()) {
        notify('Vui lòng nhập tên bài học');
        return;
      }
      const templateObj =
        CANVAS_TEMPLATES.find((t) => t.id === selectedTemplate) ??
        CANVAS_TEMPLATES[0];

      if (onSubmitLesson) {
        onSubmitLesson({
          title: lessonTitle.trim(),
          lessonType: templateObj.defaultLessonType,
          duration: Math.max(1, Number(durationMinutes) || 45),
          description: lessonAbstract.trim() || undefined,
          content: lessonAbstract.trim() || undefined,
          chapterId: selectedTargetChapterId,
          starterBlockTypes: templateObj.blocks,
          openEditorAfterCreate,
        });
      }
      setLessonTitle('');
      setLessonAbstract('');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="authoring-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200 my-auto">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-slate-800" />

        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 bg-slate-50 dark:bg-slate-900 flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs border border-blue-200/60 dark:border-blue-900">
                <span className="material-symbols-outlined text-[24px]">
                  view_agenda
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {courseCode} Studio
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Modular Block Workspace
                  </span>
                </div>
                <h2
                  id="authoring-modal-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight mt-0.5"
                >
                  Tạo chương học / Trang bài giảng mới
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="w-9 h-9 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('chapter')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
                activeTab === 'chapter'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                create_new_folder
              </span>
              <span>Tạo Chương mới</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lesson')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer truncate border-none ${
                activeTab === 'lesson'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                library_add
              </span>
              <span className="truncate">
                Thêm Bài giảng vào {displayChapterName}
              </span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-5 custom-scrollbar"
        >
          {activeTab === 'chapter' ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span>
                    Tên chương học / Khối kiến thức{' '}
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Mã nhận diện tự động:{' '}
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {courseCode}-CH{(chapters.length || 0) + 1}
                    </span>
                  </span>
                </label>
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    create_new_folder
                  </span>
                  <input
                    type="text"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="vd: Chương 1: Tổng quan & Kiến trúc hệ thống"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                      calendar_month
                    </span>
                    Phân phối tuần học
                  </label>
                  <input
                    type="text"
                    value={chapterWeeks}
                    onChange={(e) => setChapterWeeks(e.target.value)}
                    placeholder="Tuần 01 - Tuần 03"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                      timeline
                    </span>
                    Thiết lập lộ trình học
                  </label>
                  <CustomSelect<'sequential' | 'free'>
                    value={chapterPacing}
                    onChange={setChapterPacing}
                    options={[
                      {
                        value: 'sequential',
                        label: 'Tuần tự (Mở bài kế tiếp khi đạt bài trước)',
                      },
                      {
                        value: 'free',
                        label: 'Tự do (Mở toàn bộ bài học trong chương)',
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Mô tả mục tiêu chương học &amp; Chuẩn đầu ra (CLO)
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    Markdown Supported
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={chapterDesc}
                  onChange={(e) => setChapterDesc(e.target.value)}
                  placeholder="Nhập trọng tâm kiến thức và chuẩn đầu ra của chương..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            /* TAB 2: NOTION-STYLE MODULAR LESSON CREATOR */
            <div className="flex flex-col gap-5">
              {chapters.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                      folder
                    </span>
                    Chọn Chương học đích
                  </label>
                  <CustomSelect<string>
                    value={selectedTargetChapterId}
                    onChange={setSelectedTargetChapterId}
                    options={chapters.map((ch, idx) => ({
                      value: ch.id,
                      label: formatChapterLabel(ch.title, idx),
                    }))}
                  />
                </div>
              )}

              {/* Lesson Title */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span>
                    Tiêu đề trang bài học <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Mã nhận diện tự động:{' '}
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {autoLessonCode}
                    </span>
                  </span>
                </label>
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    edit_note
                  </span>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="vd: Bài 1.2: Kiến trúc phân tầng & Thực hành Code"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Starter Block Templates (Notion Canvas Mindset) */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Mẫu khối khởi tạo (Starter Canvas Blocks)
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mỗi bài học hỗ trợ tự do kết hợp nhiều khối &amp; kéo thả sau khi tạo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CANVAS_TEMPLATES.map((tpl) => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`p-4 rounded-xl text-left transition-all border-2 cursor-pointer flex flex-col gap-2.5 ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {tpl.icon}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                              {tpl.title}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {tpl.badgeText}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {tpl.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Auto-open Editor Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                      schedule
                    </span>
                    Thời lượng ước tính (phút)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(Math.max(1, Number(e.target.value) || 45))
                    }
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 px-1">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Mở ngay Canvas Biên soạn (Notion Editor)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Vào thẳng trang kéo thả khối &amp; gõ <kbd>/</kbd> sau khi tạo
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={openEditorAfterCreate}
                    onChange={(e) => setOpenEditorAfterCreate(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                  />
                </div>
              </div>

              {/* Short Summary */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Tóm tắt ngắn mục tiêu bài học (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={lessonAbstract}
                  onChange={(e) => setLessonAbstract(e.target.value)}
                  placeholder="Mô tả ngắn hiển thị ở đề cương môn học..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {activeTab === 'chapter'
                  ? 'Sẵn sàng lưu vào đề cương môn học'
                  : 'Hỗ trợ kéo thả, gõ / và auto-save từng khối sau khi tạo'}
              </span>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer border-none"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 group cursor-pointer border-none disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                  {activeTab === 'lesson' && openEditorAfterCreate
                    ? 'open_in_new'
                    : 'publish'}
                </span>
                <span>
                  {isLoading
                    ? 'Đang tạo...'
                    : activeTab === 'chapter'
                      ? 'Lưu chương & Xuất bản'
                      : openEditorAfterCreate
                        ? 'Tạo & Mở Canvas Biên soạn'
                        : 'Lưu trang bài học'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
