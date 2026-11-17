'use client';

import React, { useState, useEffect } from 'react';
import type {
  CreateChapterInput,
  CreateLessonInput,
  LessonType,
} from '../../schemas/course.schema';

export interface CurriculumAuthoringModalProps {
  isOpen: boolean;
  initialTab?: 'chapter' | 'lesson';
  courseCode?: string;
  courseTitle?: string;
  chapterId?: string | null;
  chapterTitle?: string;
  chapters?: Array<{ id: string; title: string }>;
  onClose: () => void;
  onSubmitChapter?: (input: CreateChapterInput) => void;
  onSubmitLesson?: (input: CreateLessonInput & { chapterId?: string }) => void;
  isLoading?: boolean;
  onToast?: (message: string) => void;
}

export function CurriculumAuthoringModal({
  isOpen,
  initialTab = 'lesson',
  courseCode = 'CS-202',
  chapterId,
  chapterTitle,
  chapters = [],
  onClose,
  onSubmitChapter,
  onSubmitLesson,
  isLoading = false,
  onToast,
}: CurriculumAuthoringModalProps) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'chapter' | 'lesson'>(initialTab);

  // Sync tab with initialTab when opened
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Selected target chapter for adding lesson
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
  const [chapterWeeks, setChapterWeeks] = useState('Tuần 05 - Tuần 07');
  const [chapterPacing, setChapterPacing] = useState<'sequential' | 'free'>('sequential');
  const [chapterDesc, setChapterDesc] = useState('');

  // Lesson Form States
  const [lessonTitle, setLessonTitle] = useState(
    'Bài 2.3: Thao tác xoay cây và cân bằng AVL Tree'
  );
  const [lessonFormat, setLessonFormat] = useState<LessonType>('VIDEO');
  const [duration, setDuration] = useState('45 Phút');
  const [targetWeek, setTargetWeek] = useState('w04');
  const [prerequisite, setPrerequisite] = useState('l22');
  const [instantUnlock, setInstantUnlock] = useState(true);
  const [lessonAbstract, setLessonAbstract] = useState(
    'Cung cấp kiến thức chuyên sâu về cơ chế tự cân bằng cây AVL thông qua hệ số cân bằng Balance Factor (-1, 0, 1). Hướng dẫn trực quan 4 trường hợp xoay: Xoay đơn (LL, RR) và Xoay kép (LR, RL) kèm mã nguồn minh hoạ mẫu.'
  );

  // Close on ESC
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

  // Find active chapter label
  const activeChapterObj = chapters.find((c) => c.id === selectedTargetChapterId);
  const displayChapterName =
    chapterTitle || activeChapterObj?.title || '02 - Cây tìm kiếm nhị phân';

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
      notify(`Đã tạo thành công chương học: "${chapterName.trim()}"`);
      setChapterName('');
      setChapterDesc('');
      onClose();
    } else {
      if (!lessonTitle.trim()) {
        notify('Vui lòng nhập tên bài học');
        return;
      }
      const durNum = parseInt(duration, 10) || 45;
      if (onSubmitLesson) {
        onSubmitLesson({
          title: lessonTitle.trim(),
          lessonType: lessonFormat,
          duration: durNum,
          description: lessonAbstract.trim() || undefined,
          chapterId: selectedTargetChapterId,
        });
      }
      notify(`Đã lưu bài giảng và xuất bản thành công: "${lessonTitle.trim()}"`);
      onClose();
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
      {/* Modal Window Container (3px crisp border, level-3 elevation shadow) */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200 my-auto">
        {/* Top Decorative Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-slate-800" />

        {/* Modal Top Navigation & Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 bg-slate-50 dark:bg-slate-850 flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs border border-blue-200/60 dark:border-blue-900">
                <span className="material-symbols-outlined text-[24px]">post_add</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {courseCode} Studio
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Curriculum Authoring Engine
                  </span>
                </div>
                <h2
                  id="authoring-modal-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight mt-0.5"
                >
                  Tạo chương học / Bài giảng mới
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="w-9 h-9 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Segmented Tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('chapter')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'chapter'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
              <span>Tạo Chương mới (Module Root)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lesson')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer truncate ${
                activeTab === 'lesson'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">library_add</span>
              <span className="truncate">Thêm Bài giảng vào {displayChapterName}</span>
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable Form Canvas) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 custom-scrollbar">
          {activeTab === 'chapter' ? (
            /* TAB 1: CREATE CHAPTER */
            <div className="flex flex-col gap-6">
              {/* Field 1: Chapter Title */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span>
                    Tên chương học / Khối kiến thức <span className="text-rose-500">*</span>
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
                    placeholder="Chương 03: Cây đỏ đen & Cây tìm kiếm đa phân (B-Tree / 2-3 Tree)"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              {/* Field 2: Weeks & Schedule */}
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
                    placeholder="Tuần 05 - Tuần 07"
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
                  <select
                    value={chapterPacing}
                    onChange={(e) => setChapterPacing(e.target.value as 'sequential' | 'free')}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                  >
                    <option value="sequential">Lộ trình tuần tự (Sequential - Mở bài kế tiếp khi đạt bài trước)</option>
                    <option value="free">Lộ trình tự do (Free-flow - Mở toàn bộ bài học)</option>
                  </select>
                </div>
              </div>

              {/* Field 3: Chapter Abstract & CLO */}
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
                  rows={4}
                  value={chapterDesc}
                  onChange={(e) => setChapterDesc(e.target.value)}
                  placeholder="Mô tả trọng tâm kiến thức chương 03, chuẩn đầu ra đóng góp (CLO2, ABET 1), bài toán thực tế áp dụng và cấu trúc dữ liệu cốt lõi..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          ) : (
            /* TAB 2: CREATE LESSON */
            <div className="flex flex-col gap-6">
              {/* Optional Chapter Picker if multiple chapters exist */}
              {chapters.length > 1 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                      folder
                    </span>
                    Chọn Chương học đích
                  </label>
                  <select
                    value={selectedTargetChapterId}
                    onChange={(e) => setSelectedTargetChapterId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                  >
                    {chapters.map((ch, idx) => (
                      <option key={ch.id} value={ch.id}>
                        Chương {idx + 1}: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Field 1: Lesson Title */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span>
                    Tên bài giảng / Mục tiêu bài học <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Mã nhận diện tự động:{' '}
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {courseCode}-L2.3
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
                    placeholder="vd: Bài 2.3: Thao tác xoay cây và cân bằng AVL Tree"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              {/* Field 2: Lesson Content Format Types (4 Interactive Radio Cards) */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Loại hình bài học &amp; Tài nguyên chính <span className="text-rose-500">*</span>
                  </label>
                  <span
                    onClick={() => notify('Hệ thống hỗ trợ 4 định dạng bài học: Lý thuyết, Video, Slide PDF và IDE thực hành')}
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    Xem quy chuẩn định dạng
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Format 1: Markdown Theory */}
                  <label
                    className={`relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all border-[2px] ${
                      lessonFormat === 'THEORY'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lesson_format"
                      value="THEORY"
                      checked={lessonFormat === 'THEORY'}
                      onChange={() => setLessonFormat('THEORY')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          lessonFormat === 'THEORY'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">menu_book</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          lessonFormat === 'THEORY'
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {lessonFormat === 'THEORY' && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        Lý thuyết đọc
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        Markdown / HTML tài liệu giàu ký tự
                      </p>
                    </div>
                  </label>

                  {/* Format 2: Video Lecture */}
                  <label
                    className={`relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all border-[2px] ${
                      lessonFormat === 'VIDEO'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lesson_format"
                      value="VIDEO"
                      checked={lessonFormat === 'VIDEO'}
                      onChange={() => setLessonFormat('VIDEO')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          lessonFormat === 'VIDEO'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">smart_display</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          lessonFormat === 'VIDEO'
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {lessonFormat === 'VIDEO' && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        Video bài giảng
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        YouTube / Loom / MP4 chất lượng cao
                      </p>
                    </div>
                  </label>

                  {/* Format 3: Slides & Document */}
                  <label
                    className={`relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all border-[2px] ${
                      lessonFormat === 'DOCUMENT'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lesson_format"
                      value="DOCUMENT"
                      checked={lessonFormat === 'DOCUMENT'}
                      onChange={() => setLessonFormat('DOCUMENT')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          lessonFormat === 'DOCUMENT'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          lessonFormat === 'DOCUMENT'
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {lessonFormat === 'DOCUMENT' && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        Tài liệu đính kèm
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        Slide trình chiếu / PDF phân tích
                      </p>
                    </div>
                  </label>

                  {/* Format 4: Hands-on Lab Sandbox */}
                  <label
                    className={`relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all border-[2px] ${
                      lessonFormat === 'ASSIGNMENT'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lesson_format"
                      value="ASSIGNMENT"
                      checked={lessonFormat === 'ASSIGNMENT'}
                      onChange={() => setLessonFormat('ASSIGNMENT')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          lessonFormat === 'ASSIGNMENT'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">terminal</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          lessonFormat === 'ASSIGNMENT'
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {lessonFormat === 'ASSIGNMENT' && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        Bài tập Lab
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        IDE tương tác &amp; Tự động chấm điểm
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Field 3: Duration & Curriculum Schedule Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                      timer
                    </span>
                    Thời lượng ước tính hoàn thành
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">
                      Standard pace
                    </span>
                  </div>
                </div>

                {/* Target Week */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                      calendar_today
                    </span>
                    Gán vào Phân phối Tuần học
                  </label>
                  <div className="relative w-full">
                    <select
                      value={targetWeek}
                      onChange={(e) => setTargetWeek(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 appearance-none border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer font-medium"
                    >
                      <option value="w03">Tuần 03: BST Fundamentals &amp; Search Logic</option>
                      <option value="w04">Tuần 04: AVL Tree Rotations &amp; Heights</option>
                      <option value="w05">Tuần 05: Red-Black Trees &amp; Multiway Search</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                      unfold_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Field 4: Prerequisites & Availability Controls */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">
                      lock_clock
                    </span>
                    Điều kiện tiên quyết &amp; Lập lịch công bố (Prerequisites)
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Quy tắc thông minh
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  {/* Prerequisite Dropdown (7 cols) */}
                  <div className="md:col-span-7 flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Bài học bắt buộc phải hoàn thành trước:
                    </label>
                    <div className="relative w-full">
                      <select
                        value={prerequisite}
                        onChange={(e) => setPrerequisite(e.target.value)}
                        className="w-full pl-3.5 pr-9 py-2.5 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-900 dark:text-slate-100 appearance-none border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer font-medium truncate"
                      >
                        <option value="l21">Bài 2.1: Cấu trúc Node &amp; Duyệt cây nhị phân (Đã học)</option>
                        <option value="l22">Bài 2.2: Các phép chèn và xóa nút trong BST (Yêu cầu &gt;= 80% điểm)</option>
                        <option value="none">Không yêu cầu tiên quyết (Mở tự do)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                        arrow_drop_down
                      </span>
                    </div>
                  </div>

                  {/* Unlock Switch & Schedule (5 cols) */}
                  <div className="md:col-span-5 flex flex-col justify-between sm:pl-3 sm:border-l border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Mở khóa ngay lập tức
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Sinh viên truy cập khi xuất bản
                        </span>
                      </div>

                      {/* Interactive Toggle */}
                      <button
                        type="button"
                        onClick={() => setInstantUnlock(!instantUnlock)}
                        className={`w-12 h-6 rounded-full p-0.5 flex items-center transition-colors shadow-inner cursor-pointer ${
                          instantUnlock ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                            instantUnlock ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mt-2">
                      <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                        schedule
                      </span>
                      <span>
                        Tùy chọn phụ:{' '}
                        <button
                          type="button"
                          onClick={() => notify('Đã kích hoạt hẹn giờ mở theo thời khóa biểu lớp')}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                        >
                          Hẹn giờ mở theo lịch biểu lớp
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 5: Lesson Abstract & Objectives */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Tóm tắt nội dung bài học &amp; Ghi chú giảng viên
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    Markdown Supported
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={lessonAbstract}
                  onChange={(e) => setLessonAbstract(e.target.value)}
                  placeholder="Mô tả mục tiêu đầu ra (CLO), khái niệm mất cân bằng Left-Left, Right-Right, Left-Right, Right-Left..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none shadow-inner leading-relaxed"
                />
              </div>

              {/* Quick Attachment Media Preview */}
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[22px]">video_library</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      Source: avl_rotation_explained_fullhd.mp4
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Lưu trữ trên S3 Media Storage • 184.2 MB • Độ phân giải 1080p60
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => notify('Mở trình quản lý file để thay đổi video nguồn...')}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  Thay đổi video nguồn
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer Action Bar */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 mt-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đã tự động lưu nháp lúc 14:32</span>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                  publish
                </span>
                <span>
                  {activeTab === 'chapter' ? 'Lưu chương & Xuất bản' : 'Lưu bài giảng & Xuất bản'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

