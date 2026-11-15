'use client';

import React, { useState } from 'react';

// ----------------------------------------------------
// UNIFIED STUDIO CURRICULUM AUTHORING MODAL FOR CLASSES
// ----------------------------------------------------
interface ClassCurriculumModalProps {
  isOpen: boolean;
  initialTab?: 'chapter' | 'lesson';
  moduleTitle?: string;
  onClose: () => void;
  onSubmitChapter?: (title: string, weeks: string) => void;
  onSubmitLesson?: (title: string, type: string, duration: string) => void;
}

export function ClassCurriculumModal({
  isOpen,
  initialTab = 'lesson',
  moduleTitle = '02 - Cây tìm kiếm nhị phân',
  onClose,
  onSubmitChapter,
  onSubmitLesson,
}: ClassCurriculumModalProps) {
  const [activeTab, setActiveTab] = useState<'chapter' | 'lesson'>(initialTab);

  // Lesson Form States
  const [lessonTitle, setLessonTitle] = useState('Bài 2.3: Thao tác xoay cây và cân bằng AVL Tree');
  const [lessonFormat, setLessonFormat] = useState<'reading' | 'video' | 'document' | 'lab'>('video');
  const [duration, setDuration] = useState('45 Phút');
  const [targetWeek, setTargetWeek] = useState('w04');
  const [prerequisite, setPrerequisite] = useState('l22');
  const [instantUnlock, setInstantUnlock] = useState(true);
  const [lessonAbstract, setLessonAbstract] = useState(
    'Cung cấp kiến thức chuyên sâu về cơ chế tự cân bằng cây AVL thông qua hệ số cân bằng Balance Factor (-1, 0, 1). Hướng dẫn trực quan 4 trường hợp xoay: Xoay đơn (LL, RR) và Xoay kép (LR, RL) kèm mã nguồn minh hoạ mẫu.'
  );

  // Chapter Form States
  const [chapterTitle, setChapterTitle] = useState('Chương 03: Cây đỏ đen & Cây tìm kiếm đa phân');
  const [chapterWeeks, setChapterWeeks] = useState('Tuần 05 - Tuần 07');
  const [chapterPacing, setChapterPacing] = useState<'sequential' | 'free'>('sequential');
  const [chapterDesc, setChapterDesc] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'chapter') {
      if (!chapterTitle.trim()) return;
      if (onSubmitChapter) {
        onSubmitChapter(chapterTitle.trim(), chapterWeeks.trim());
      }
    } else {
      if (!lessonTitle.trim()) return;
      if (onSubmitLesson) {
        onSubmitLesson(lessonTitle.trim(), lessonFormat, duration.trim());
      }
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
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
                    CS-202 Studio
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Curriculum Authoring Engine
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
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
              <span className="truncate">Thêm Bài giảng vào {moduleTitle}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 custom-scrollbar">
          {activeTab === 'chapter' ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span>
                    Tên chương học / Khối kiến thức <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Mã nhận diện tự động:{' '}
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      CS202-CH03
                    </span>
                  </span>
                </label>
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    create_new_folder
                  </span>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="Chương 03: Cây đỏ đen & Cây tìm kiếm đa phân"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
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
                  placeholder="Mô tả trọng tâm kiến thức chương 03, chuẩn đầu ra đóng góp (CLO2, ABET 1), bài toán thực tế áp dụng..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span>
                    Tên bài giảng / Mục tiêu bài học <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Mã nhận diện tự động:{' '}
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      CS202-L2.3
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
                    placeholder="Bài 2.3: Thao tác xoay cây và cân bằng AVL Tree"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              {/* 4 Interactive Radio Cards */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Loại hình bài học &amp; Tài nguyên chính <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <label
                    className={`relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all border-[2px] ${
                      lessonFormat === 'reading'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lesson_format_class"
                      value="reading"
                      checked={lessonFormat === 'reading'}
                      onChange={() => setLessonFormat('reading')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          lessonFormat === 'reading'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">menu_book</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          lessonFormat === 'reading'
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {lessonFormat === 'reading' && (
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

                  <label
                    className={`relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all border-[2px] ${
                      lessonFormat === 'video'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lesson_format_class"
                      value="video"
                      checked={lessonFormat === 'video'}
                      onChange={() => setLessonFormat('video')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          lessonFormat === 'video'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">smart_display</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          lessonFormat === 'video'
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {lessonFormat === 'video' && (
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

                  <label
                    className={`relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all border-[2px] ${
                      lessonFormat === 'document'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lesson_format_class"
                      value="document"
                      checked={lessonFormat === 'document'}
                      onChange={() => setLessonFormat('document')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          lessonFormat === 'document'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          lessonFormat === 'document'
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {lessonFormat === 'document' && (
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

                  <label
                    className={`relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all border-[2px] ${
                      lessonFormat === 'lab'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lesson_format_class"
                      value="lab"
                      checked={lessonFormat === 'lab'}
                      onChange={() => setLessonFormat('lab')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          lessonFormat === 'lab'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">terminal</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          lessonFormat === 'lab'
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {lessonFormat === 'lab' && (
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

              {/* Duration & Week */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
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

              {/* Prerequisites */}
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
                  </div>
                </div>
              </div>

              {/* Abstract */}
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
                  placeholder="Mô tả mục tiêu đầu ra (CLO), khái niệm mất cân bằng Left-Left, Right-Right..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none shadow-inner leading-relaxed"
                />
              </div>

              {/* Quick Attachment Preview */}
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
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  Thay đổi video nguồn
                </button>
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 mt-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đã tự động lưu nháp lúc 14:32</span>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
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

// ----------------------------------------------------
// 1. ADD CHAPTER MODAL (FORWARD TO STUDIO MODAL)
// ----------------------------------------------------
export interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, weeks: string) => void;
}

export function AddChapterModal({ isOpen, onClose, onSubmit }: AddChapterModalProps) {
  return (
    <ClassCurriculumModal
      isOpen={isOpen}
      initialTab="chapter"
      onClose={onClose}
      onSubmitChapter={onSubmit}
    />
  );
}

// ----------------------------------------------------
// 2. ADD LESSON MODAL (FORWARD TO STUDIO MODAL)
// ----------------------------------------------------
export interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: string, duration: string) => void;
  initialType?: string;
  moduleTitle?: string;
}

export function AddLessonModal({
  isOpen,
  onClose,
  onSubmit,
  moduleTitle,
}: AddLessonModalProps) {
  return (
    <ClassCurriculumModal
      isOpen={isOpen}
      initialTab="lesson"
      moduleTitle={moduleTitle}
      onClose={onClose}
      onSubmitLesson={onSubmit}
    />
  );
}

// ----------------------------------------------------
// 3. BATCH UPLOAD MODAL
// ----------------------------------------------------
export interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

export function BatchUploadModal({ isOpen, onClose, onUpload }: BatchUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Tải lên tài nguyên hàng loạt
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
            }`}
          >
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2 block">
              cloud_upload
            </span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kéo thả các file Slide (PPTX/PDF), Video (MP4) hoặc Bài tập tại đây
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Hỗ trợ tệp lên đến 500MB mỗi file
            </p>
            <input
              type="file"
              multiple
              id="batch-file-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setSelectedFiles(Array.from(e.target.files));
                }
              }}
            />
            <label
              htmlFor="batch-file-input"
              className="inline-block mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              Chọn tệp từ máy tính
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Tệp đã chọn ({selectedFiles.length}):
              </span>
              {selectedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <span className="truncate max-w-[280px]">{f.name}</span>
                  <span className="text-slate-400 font-mono">
                    {(f.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={selectedFiles.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-40"
            >
              Bắt đầu phân tích &amp; Tải lên ({selectedFiles.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
