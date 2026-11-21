'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CourseModulesTabContentProps {
  role: 'student' | 'teacher';
  courseId: string;
  onOpenAddChapter: () => void;
  onOpenAddLesson: () => void;
  onSwitchToStudent: () => void;
  onGoToAssignments: () => void;
  showToast: (msg: string) => void;
}

export function CourseModulesTabContent({
  role,
  courseId,
  onOpenAddChapter,
  onOpenAddLesson,
  onSwitchToStudent,
  onGoToAssignments,
  showToast,
}: CourseModulesTabContentProps) {
  // Teacher studio edit mode
  const [isEditMode, setIsEditMode] = useState(true);
  const [learningFlow, setLearningFlow] = useState<'sequential' | 'guided'>('sequential');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Accordion open/close state
  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: true,
    4: false,
    5: false,
  });

  const toggleChapter = (num: number) => {
    setOpenChapters((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  const [draft33Published, setDraft33Published] = useState(false);
  const [module4Opened, setModule4Opened] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW & STUDIO COMMAND BAR */}
      {role === 'student' ? (
        /* Student View: Header & Progress Resume Card */
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#0059bb] dark:text-blue-400 font-bold uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                  <span>Lộ trình đào tạo chuẩn</span>
                </div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                  Chương trình học &amp; Cấu trúc học phần
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Phân phối 5 chương theo khung chuẩn ACM/IEEE với học liệu đa phương tiện, phòng thí nghiệm giả lập và bài trắc nghiệm.
                </p>
              </div>
            </div>

            {/* Student Progress and Quick Resume Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Tiến độ tổng thể chương trình
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[#0059bb] dark:text-blue-400">
                    14/22 bài học (64%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-[#0059bb] rounded-full transition-all duration-500" style={{ width: '64%' }} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn đã hoàn tất xuất sắc Chương 1, Chương 2 và đang thực hiện các bài học cốt lõi của Chương 3.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href={`/courses/${courseId}/lessons/les-cs202-302`}
                  className="px-5 py-2.5 rounded-xl bg-[#0059bb] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  <span>Tiếp tục bài đang học: Bài 3.2</span>
                </Link>
              </div>
            </div>

            {/* Search & Filter pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài học, chủ đề, giao thức (TCP, DNS, OSPF...)"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {['Tất cả', 'Đã học (14)', 'Đang học (2)', 'Bị khóa (6)'].map((p, idx) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFilterStatus(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        (filterStatus === 'all' && idx === 0) || filterStatus === p
                          ? 'bg-white dark:bg-slate-700 text-[#0059bb] dark:text-blue-400 shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Teacher View: Studio Command Bar */
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left Controls: Edit Mode Toggle & Filter */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Edit Mode Toggle Switch */}
            <label
              htmlFor="teacher-edit-mode-toggle"
              className="cursor-pointer select-none inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 transition-colors"
            >
              <input
                id="teacher-edit-mode-toggle"
                type="checkbox"
                checked={isEditMode}
                onChange={(e) => {
                  setIsEditMode(e.target.checked);
                  showToast(e.target.checked ? 'Đã bật Chế độ Chỉnh sửa Giáo trình' : 'Đã tắt Chế độ Chỉnh sửa');
                }}
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  isEditMode ? 'bg-[#0059bb]' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                    isEditMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-[17px] text-[#0059bb]">tune</span>
                <span>
                  Chế độ Chỉnh sửa:{' '}
                  <strong className={isEditMode ? 'text-[#0059bb] dark:text-blue-400 underline' : 'text-slate-500'}>
                    {isEditMode ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                  </strong>
                </span>
              </span>
            </label>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài giảng, mã lab, tài liệu..."
                className="w-56 sm:w-64 pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 text-xs">
              {['Tất cả (22)', 'Đã xuất bản (18)', 'Bản nháp (4)'].map((p, idx) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilterStatus(p)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    (filterStatus === 'all' && idx === 0) || filterStatus === p
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSwitchToStudent}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px] text-slate-500">visibility</span>
              <span>Xem góc nhìn học sinh</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Mở trình tải lên hàng loạt (Bulk Ingestion Engine)...')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px] text-slate-500">upload_file</span>
              <span>Tải lên hàng loạt</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddLesson}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">post_add</span>
              <span>+ Thêm Bài học</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddChapter}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">create_new_folder</span>
              <span>+ Thêm Chương mới</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. TWO-COLUMN WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): 5 Chapters Accordion Tree */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Week Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d1c32] to-[#0059bb] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#d8e2ff] text-[24px]">calendar_today</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#d8e2ff]">
                  Tuần học hiện tại: Tuần 09 (14/10 - 20/10)
                </p>
                <h3 className="font-display font-bold text-sm sm:text-base text-white mt-0.5">
                  Đang triển khai: Chương 3 - Tầng Giao vận (Transport Layer)
                </h3>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white font-semibold text-xs border border-white/20">
              Trọng tâm thi giữa kỳ
            </span>
          </div>

          {/* ==================== CHƯƠNG 1 ==================== */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleChapter(1)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleChapter(1)}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {isEditMode && role === 'teacher' && (
                  <span className="material-symbols-outlined text-slate-400 cursor-grab hover:text-slate-700">
                    drag_indicator
                  </span>
                )}
                <span className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Chương 1 • Đã hoàn thành 100%
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                      Đạt chuẩn
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                    Tổng quan Mạng máy tính &amp; Mô hình OSI / TCP-IP
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 hidden sm:inline-block">4 bài học • 1 trắc nghiệm</span>
                <span
                  className={`material-symbols-outlined text-slate-500 transition-transform ${
                    openChapters[1] ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </div>

            {/* Content */}
            {openChapters[1] && (
              <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* 1.1 */}
                <div className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                      check_circle
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Bài 1.1: Giới thiệu Internet và Kiến trúc phân tầng (Layering)
                      </p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">videocam</span> Video 24 phút • Đã xem đầy đủ
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] shrink-0">
                    100%
                  </span>
                </div>

                {/* 1.2 */}
                <div className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                      check_circle
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Bài 1.2: So sánh mô hình 7 tầng OSI vs TCP/IP 4 tầng
                      </p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">description</span> Tài liệu PDF 18 trang • Đã đọc
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] shrink-0">
                    Đã đọc
                  </span>
                </div>

                {/* 1.3 */}
                <div className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                      check_circle
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Bài 1.3: Độ trễ, Mất gói và Thông lượng (Packet Loss &amp; Throughput)
                      </p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">terminal</span> Lab Packet Tracer • Nộp ngày 05/10
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0">
                    10/10
                  </span>
                </div>

                {/* Quiz 01 */}
                <div className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                      quiz
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        Quiz 01: Ôn tập trắc nghiệm kiến trúc mạng Chương 1 (15 câu)
                      </p>
                      <span className="text-[11px] text-slate-400">
                        Thời gian làm bài: 15 phút • Nộp lúc 08/10
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold text-[11px] shrink-0">
                    9.5/10
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ==================== CHƯƠNG 2 ==================== */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleChapter(2)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleChapter(2)}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {isEditMode && role === 'teacher' && (
                  <span className="material-symbols-outlined text-slate-400 cursor-grab hover:text-slate-700">
                    drag_indicator
                  </span>
                )}
                <span className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Chương 2 • Đã hoàn thành 100%
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                      4 bài học • 1 Lab C++ • 1 Quiz
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                    Tầng Ứng dụng (Application Layer - DNS, HTTP/HTTPS, Socket)
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                  Điểm tổng kết: 9.2
                </span>
                <span
                  className={`material-symbols-outlined text-slate-500 transition-transform ${
                    openChapters[2] ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </div>

            {openChapters[2] && (
              <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Bài 2.1: Giao thức HTTP 1.1 / HTTP/2 và Hệ thống DNS</span>
                  <span className="text-emerald-600 font-semibold">Đã học</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Lab 02: Lập trình Socket TCP / UDP Client-Server bằng C++</span>
                  <span className="text-emerald-600 font-bold">10/10</span>
                </div>
              </div>
            )}
          </div>

          {/* ==================== CHƯƠNG 3 (ACTIVE FOCUS) ==================== */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border-2 border-[#0059bb]/40 dark:border-blue-500/40 shadow-md overflow-hidden ring-2 ring-[#0059bb]/10">
            {/* Header */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleChapter(3)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleChapter(3)}
              className="p-4 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {isEditMode && role === 'teacher' && (
                  <span className="material-symbols-outlined text-[#0059bb] cursor-grab">
                    drag_indicator
                  </span>
                )}
                <span className="w-9 h-9 rounded-full bg-[#0059bb] text-white flex items-center justify-center shrink-0 font-display font-extrabold text-xs shadow-xs">
                  60%
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0059bb] dark:text-blue-400">
                      Chương 3 • Đang diễn ra
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0059bb] text-white text-[10px] font-bold">
                      Trọng tâm tuần này
                    </span>
                  </div>
                  <h4 className="font-display font-black text-sm text-slate-900 dark:text-white truncate mt-0.5">
                    Tầng Giao vận (Transport Layer - TCP vs UDP)
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[#0059bb] dark:text-blue-400 hidden sm:inline-block">
                  Bài 3.2 đang mở
                </span>
                <span
                  className={`material-symbols-outlined text-[#0059bb] transition-transform ${
                    openChapters[3] ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </div>

            {/* Content */}
            {openChapters[3] && (
              <div className="p-4 space-y-3 text-xs">
                {/* 3.1 */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                      check_circle
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        Bài 3.1: Dịch vụ tầng giao vận &amp; Ghép / Phân kênh (Multiplexing/Demux)
                      </p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">videocam</span> Video 32 phút • Đã xem xong
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-500 font-semibold shrink-0">Đã hoàn thành</span>
                </div>

                {/* 3.2 (ACTIVE READING) */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-[#0059bb] dark:text-blue-400 text-[24px] shrink-0 animate-pulse">
                      play_circle
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          Bài 3.2: Cơ chế truyền tin cậy (RDT) &amp; Bắt tay 3 bước TCP
                        </p>
                        <span className="px-1.5 py-0.5 rounded bg-[#0059bb] text-white text-[10px] font-bold uppercase">
                          Đang học
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">slideshow</span> Slide &amp; Mô phỏng tương tác • Đã xem 70%
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/courses/${courseId}/lessons/les-cs202-302`}
                    className="px-4 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 shrink-0 self-end sm:self-auto cursor-pointer"
                  >
                    <span>Học tiếp</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                {/* 3.3 (DRAFT / READING) */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">
                      menu_book
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Bài 3.3: Điều khiển luồng (Flow Control) &amp; Điều khiển tắc nghẽn (TCP Reno/CUBIC)
                      </p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">article</span> Bài đọc giáo trình 26 trang • Đang mở
                      </span>
                    </div>
                  </div>

                  {role === 'teacher' && !draft33Published ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft33Published(true);
                        showToast('Đã xuất bản bài 3.3 thành công!');
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                    >
                      Xuất bản
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      {draft33Published ? 'Đã xuất bản' : 'Chưa đọc'}
                    </span>
                  )}
                </div>

                {/* 3.4 (URGENT LAB) */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[22px] shrink-0">
                      assignment_late
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          Bài 3.4: Wireshark Lab: Phân tích gói tin TCP 3-Way Handshake
                        </p>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          Cần nộp ⚠️
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">terminal</span> Lab thực hành • Hạn chót: 23:59 Chủ nhật này
                      </span>
                    </div>
                  </div>

                  {role === 'teacher' ? (
                    <button
                      type="button"
                      onClick={onGoToAssignments}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 self-end sm:self-auto cursor-pointer"
                    >
                      Chấm bài (31)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onGoToAssignments}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 self-end sm:self-auto cursor-pointer"
                    >
                      Nộp bài Lab
                    </button>
                  )}
                </div>

                {/* Quiz 03 (Locked) */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-3 opacity-75">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">
                      lock
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        Quiz 03: Đánh giá nhanh chuẩn đầu ra Tầng giao vận (20 câu)
                      </p>
                      <span className="text-[11px] text-slate-400">
                        Điều kiện: Hoàn thành nộp bài Lab 3.4 để mở khóa
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                </div>

                {/* Teacher in-module quick add action bar */}
                {role === 'teacher' && (
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 mt-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#0059bb]">add_circle</span>
                      <span>Thêm nhanh vào Chương 3:</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <button
                        type="button"
                        onClick={() => showToast('Mở tạo video bài giảng cho Chương 3')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 font-medium border border-slate-200 dark:border-slate-600 cursor-pointer"
                      >
                        Video
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Mở tải lên Slide PDF cho Chương 3')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 font-medium border border-slate-200 dark:border-slate-600 cursor-pointer"
                      >
                        File PDF / Slide
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Mở cấu hình bài Lab cho Chương 3')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 font-medium border border-slate-200 dark:border-slate-600 cursor-pointer"
                      >
                        Bài Lab
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Khởi chạy sinh đề trắc nghiệm bằng AI')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 hover:bg-slate-50 font-medium border border-slate-200 dark:border-slate-600 cursor-pointer"
                      >
                        Trắc nghiệm AI
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==================== CHƯƠNG 4 (LOCKED / SCHEDULED) ==================== */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden opacity-80">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Chương 4 • {module4Opened ? 'Đã mở' : 'Bị khóa'}
                    </span>
                    <span className="text-xs text-slate-400">Dự kiến mở: Tuần 11</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    Tầng Mạng &amp; Định tuyến (Network Layer, IPv4/IPv6, OSPF, BGP)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Bao gồm các chủ đề: Subnetting VLSM, Thuật toán Dijkstra, Cấu hình Router Cisco.
                  </p>
                </div>
              </div>

              {role === 'teacher' && !module4Opened ? (
                <button
                  type="button"
                  onClick={() => {
                    setModule4Opened(true);
                    showToast('Đã mở Chương 4 ngay lập tức cho sinh viên!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer shrink-0"
                >
                  Mở ngay bây giờ
                </button>
              ) : (
                <span className="text-xs text-slate-400 hidden sm:inline-block shrink-0">
                  Điều kiện: Vượt qua Quiz Chương 3
                </span>
              )}
            </div>
          </div>

          {/* ==================== CHƯƠNG 5 (LOCKED) ==================== */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden opacity-60">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Chương 5 • Bị khóa
                    </span>
                    <span className="text-xs text-slate-400">Dự kiến mở: Tuần 13</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    Tầng Liên kết dữ liệu &amp; Mạng cục bộ (Data Link Layer &amp; LAN)
                  </h4>
                </div>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline-block shrink-0">
                Điều kiện: Vượt qua Chương 4
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Insights & Copilot Tools */}
        <div className="lg:col-span-4 space-y-5">
          {role === 'student' ? (
            /* Student Right Column: PLO Matrix + Fast Resources */
            <>
              {/* PLO Matrix */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Chuẩn đầu ra (PLO Matrix)
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[#0059bb] dark:text-blue-300 font-bold text-[11px]">
                    Chuẩn ABET
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tiến độ đo lường năng lực tích lũy theo từng chuẩn đầu ra của học phần:
                </p>

                {/* PLO 01 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">PLO-01: Kiến thức nền tảng mạng</span>
                    <span className="text-emerald-600 font-bold">85% Đạt</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 block">Đã đánh giá qua Quiz 01 &amp; Bài tập</span>
                </div>

                {/* PLO 02 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">PLO-02: Cấu hình &amp; Bắt gói tin</span>
                    <span className="text-[#0059bb] font-bold">64% Tích lũy</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-[#0059bb] rounded-full" style={{ width: '64%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 block">Đang đánh giá qua Lab 00 &amp; Lab 01</span>
                </div>

                {/* PLO 03 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">PLO-03: Thiết kế hệ thống mạng</span>
                    <span className="text-slate-400 font-medium">Sắp mở khóa</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: '15%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 block">Sẽ đánh giá qua Bài tập lớn Thiết kế OSPF</span>
                </div>
              </div>

              {/* Fast References */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Tài liệu tham khảo nhanh
                </h4>
                <div className="flex flex-col gap-1 text-xs">
                  <a
                    href="#kurose"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Đang mở Giáo trình Kurose & Ross 8th');
                    }}
                    className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[#0059bb] text-[18px]">menu_book</span>
                      <span className="truncate">Giáo trình Kurose &amp; Ross 8th</span>
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-[15px]">open_in_new</span>
                  </a>
                  <a
                    href="#cisco"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Đang tải Cisco Packet Tracer 8.2');
                    }}
                    className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[#0059bb] text-[18px]">download</span>
                      <span className="truncate">Cisco Packet Tracer 8.2 (Win/Mac)</span>
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-[15px]">file_download</span>
                  </a>
                  <a
                    href="#wireshark"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Đang mở Wireshark Display Filters Cheatsheet');
                    }}
                    className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[#0059bb] text-[18px]">terminal</span>
                      <span className="truncate">Wireshark Filters Cheatsheet</span>
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-[15px]">download</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            /* Teacher Right Column: Adaptive Flow + AI Copilot + Audit Checklist */
            <>
              {/* Panel 1: Cấu hình Lộ trình học (Tự động hóa) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                    <span className="material-symbols-outlined text-[#0059bb] text-[19px]">alt_route</span>
                    <span>Cấu hình Lộ trình học</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[#0059bb] dark:text-blue-300 font-bold text-[10px]">
                    Tự động hóa
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="radio"
                      name="learning_flow"
                      checked={learningFlow === 'sequential'}
                      onChange={() => setLearningFlow('sequential')}
                      className="mt-1 text-[#0059bb]"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        Học theo Tiến độ Tuần tự (Sequential)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Học viên buộc phải hoàn thành bài trước và đạt điểm điều kiện mới mở bài kế tiếp.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="radio"
                      name="learning_flow"
                      checked={learningFlow === 'guided'}
                      onChange={() => setLearningFlow('guided')}
                      className="mt-1 text-[#0059bb]"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        Mở Tự do có kiểm soát (Guided Open)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Sinh viên được xem trước tài liệu, chỉ khóa đối với các bài Quiz và Bài tập nộp điểm.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Stalled Students Warning */}
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
                    report_problem
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white">
                      Cảnh báo Trở ngại Nhận thức:
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Có <strong className="text-rose-600 font-bold">6 học viên</strong> đang kẹt tại Bài 3.2 hơn 4 ngày do chưa hoàn thành mô phỏng Bắt tay 3 bước.
                    </p>
                    <button
                      type="button"
                      onClick={() => showToast('Đã gửi thông báo nhắc nhở tự động qua Email & Chatbot tới 6 học viên!')}
                      className="text-[#0059bb] dark:text-blue-400 text-xs font-bold hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Gửi nhắc nhở tự động qua Email &amp; Chatbot</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel 2: Trợ lý Giáo trình AI (Copilot) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="material-symbols-outlined text-[#0059bb] text-[20px]">neurology</span>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Trợ lý Giáo trình AI (Copilot)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Công cụ tự động phân tích Slide bài giảng PDF và Đề cương chuẩn để sinh cấu trúc Chương mục, Objectives và Ngân hàng câu hỏi trắc nghiệm tương thích.
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => showToast('Đang phân tích và trích xuất cấu trúc từ Syllabus PDF...')}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#0d1c32] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#d8e2ff]">auto_awesome</span>
                    <span>Trích xuất tự động từ Syllabus PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Đang mở Đồ thị Tri thức môn học (34 Nodes)...')}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0059bb]">hub</span>
                    <span>Xem Đồ thị Tri thức môn học (34 Nodes)</span>
                  </button>
                </div>

                {/* Coverage Snapshot */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Độ phủ Chuẩn đầu ra (CDIO / ABET):</span>
                    <span className="text-[#0059bb] font-bold">88.5%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-[#0059bb] h-full" style={{ width: '70%' }} />
                    <div className="bg-purple-600 h-full" style={{ width: '18.5%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>CLO 1: Kiến trúc (Đạt)</span>
                    <span>CLO 2: Giao thức (Đang dạy)</span>
                  </div>
                </div>
              </div>

              {/* Panel 3: Kiểm tra Chất lượng (Audit) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Kiểm tra Chất lượng (Audit)
                  </h4>
                  <span className="font-mono text-sm font-extrabold text-[#0059bb]">94/100</span>
                </div>

                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">check_circle</span>
                    <span>Tất cả các bài học đều có Mục tiêu bài giảng rõ ràng</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">check_circle</span>
                    <span>Có ít nhất 1 bài tập thực hành tương tác mỗi 2 tuần</span>
                  </li>
                  <li className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <span className="material-symbols-outlined text-[18px] shrink-0">pending</span>
                    <span>Bài 3.3 đang thiếu tài liệu đọc thêm (RFC 793 / RFC 5681)</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => showToast('Đang xuất Báo cáo Giáo trình PDF cho Trưởng Bộ môn...')}
                  className="w-full pt-2 text-[#0059bb] dark:text-blue-400 text-xs font-bold hover:underline inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Xuất Báo cáo Giáo trình PDF cho Trưởng Bộ môn</span>
                  <span className="material-symbols-outlined text-[15px]">download</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

