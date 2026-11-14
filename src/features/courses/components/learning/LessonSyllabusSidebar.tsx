'use client';

import React, { useState } from 'react';

interface LessonSyllabusSidebarProps {
  courseCode?: string;
  semester?: string;
  progressPercent?: number;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
  activeLessonId?: string;
  onSelectLessonItem: (lessonId: string, lessonTitle: string) => void;
  onToast: (msg: string) => void;
}

export function LessonSyllabusSidebar({
  courseCode = 'CS-202',
  semester = 'HK2 2024-2025',
  progressPercent = 68,
  completedLessonsCount = 15,
  totalLessonsCount = 22,
  activeLessonId = 'les-3-2',
  onSelectLessonItem,
  onToast,
}: LessonSyllabusSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({
    ch1: false,
    ch2: false,
    ch3: true,
    ch4: false,
  });

  const toggleChapter = (key: string) => {
    setOpenChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className="w-80 shrink-0 bg-white dark:bg-slate-900 border-r-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col transition-all duration-300 z-30 h-[calc(100vh-8rem)] sticky top-32 overflow-y-auto"
      id="left-sidebar"
    >
      {/* Sidebar Header */}
      <div className="p-4 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">
              account_tree
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Chương trình học
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
            {progressPercent}% ({completedLessonsCount}/{totalLessonsCount})
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold">
          {courseCode} • {semester}
        </p>

        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bài học, lab, quiz..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/40 border border-transparent focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Syllabus Accordion */}
      <div className="p-3 pb-8 flex flex-col gap-2">
        {/* ======================================================== */}
        {/* Module 1 (Done)                                         */}
        {/* ======================================================== */}
        <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 transition-colors">
          <button
            type="button"
            onClick={() => toggleChapter('ch1')}
            className="w-full flex items-center justify-between p-3 cursor-pointer text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] shrink-0">
                check_circle
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  Chương 01 • 4/4 Bài
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  Mô hình OSI &amp; TCP/IP
                </span>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform duration-200 ${
                openChapters.ch1 ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {openChapters.ch1 && (
            <div className="px-3 pb-3 pt-1 pl-7 flex flex-col gap-1 text-slate-600 dark:text-slate-300 text-xs">
              <div
                onClick={() => onSelectLessonItem('les-1-1', '1.1 Tổng quan Internet')}
                className="py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">1.1 Tổng quan Internet</span>
                <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
              </div>
              <div
                onClick={() => onSelectLessonItem('les-1-2', '1.2 Trễ gói & Băng thông')}
                className="py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">1.2 Trễ gói &amp; Băng thông</span>
                <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
              </div>
              <div
                onClick={() => onSelectLessonItem('les-1-3', '1.3 Chồng giao thức 5 tầng')}
                className="py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">1.3 Chồng giao thức 5 tầng</span>
                <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
              </div>
              <div
                onClick={() => onSelectLessonItem('les-1-4', '1.4 Lab: Wireshark Primer')}
                className="py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">1.4 Lab: Wireshark Primer</span>
                <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* Module 2 (Done)                                         */}
        {/* ======================================================== */}
        <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 transition-colors">
          <button
            type="button"
            onClick={() => toggleChapter('ch2')}
            className="w-full flex items-center justify-between p-3 cursor-pointer text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] shrink-0">
                check_circle
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  Chương 02 • 4/4 Bài
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  Tầng Ứng dụng (DNS, HTTP)
                </span>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform duration-200 ${
                openChapters.ch2 ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {openChapters.ch2 && (
            <div className="px-3 pb-3 pt-1 pl-7 flex flex-col gap-1 text-slate-600 dark:text-slate-300 text-xs">
              <div
                onClick={() => onSelectLessonItem('les-2-1', '2.1 Giao thức Web HTTP/2 & 3')}
                className="py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">2.1 Giao thức Web HTTP/2 &amp; 3</span>
                <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
              </div>
              <div
                onClick={() => onSelectLessonItem('les-2-2', '2.2 Cơ chế phân giải tên miền DNS')}
                className="py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">2.2 Cơ chế phân giải tên miền DNS</span>
                <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
              </div>
              <div
                onClick={() => onSelectLessonItem('les-2-3', '2.3 Lập trình Socket TCP/UDP')}
                className="py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">2.3 Lập trình Socket TCP/UDP</span>
                <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
              </div>
              <div
                onClick={() => onToast('Bài Quiz 02 đã hoàn thành: 10/10 điểm!')}
                className="py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                <span className="truncate">Quiz 02: Ứng dụng &amp; Dịch vụ</span>
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* Module 3 (Active, Open)                                 */}
        {/* ======================================================== */}
        <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs border-[2px] border-blue-500/50">
          <button
            type="button"
            onClick={() => toggleChapter('ch3')}
            className="w-full flex items-center justify-between p-3 cursor-pointer text-left bg-blue-50/60 dark:bg-blue-950/40"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">
                radio_button_checked
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-extrabold">
                  Chương 03 • Đang học
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  Tầng Giao vận (Transport Layer)
                </span>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform duration-200 ${
                openChapters.ch3 ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {openChapters.ch3 && (
            <div className="p-2 flex flex-col gap-1.5 pt-2">
              {/* 3.1 Done */}
              <div
                onClick={() =>
                  onSelectLessonItem('les-3-1', 'Bài 3.1: Dịch vụ định vị cổng & Phân kênh')
                }
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
              >
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] shrink-0">
                  check_circle
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">Bài 3.1: Dịch vụ &amp; Phân kênh</p>
                  <p className="text-[11px] text-slate-400">24:10 • Hoàn thành</p>
                </div>
              </div>

              {/* 3.2 ACTIVE LESSON */}
              <div
                onClick={() =>
                  onSelectLessonItem(
                    'les-3-2',
                    'Bài 3.2: Cơ chế truyền tin cậy (RDT) & Bắt tay 3 bước TCP'
                  )
                }
                className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm flex items-center gap-2 relative overflow-hidden cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
                  <span className="material-symbols-outlined text-[18px] text-white">play_arrow</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-white">
                      Đang học
                    </span>
                    <span className="text-[11px] opacity-80 font-mono">28:45</span>
                  </div>
                  <p className="text-xs font-bold truncate text-white mt-0.5">
                    Bài 3.2: Cơ chế RDT &amp; Bắt tay 3 bước TCP
                  </p>
                </div>
                <span className="material-symbols-outlined text-white text-[16px]">chevron_right</span>
              </div>

              {/* 3.3 Up Next */}
              <div
                onClick={() =>
                  onSelectLessonItem(
                    'les-3-3',
                    'Bài 3.3: Điều khiển luồng & Kiểm soát tắc nghẽn'
                  )
                }
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400"
              >
                <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">
                  radio_button_unchecked
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Bài 3.3: Điều khiển luồng &amp; Tắc nghẽn
                  </p>
                  <p className="text-[11px] text-slate-400">32:00 • Bài tiếp theo</p>
                </div>
              </div>

              {/* 3.4 Wireshark Lab */}
              <div
                onClick={() =>
                  onSelectLessonItem(
                    'les-3-4',
                    'Bài 3.4: Wireshark Lab - Bắt gói tin TCP Handshake'
                  )
                }
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400"
              >
                <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0">
                  assignment_late
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      Bài 3.4: Wireshark Lab Handshake
                    </p>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Thực hành bắt gói • Cần nộp
                  </p>
                </div>
              </div>

              {/* Quiz 03 Locked */}
              <div className="p-2 rounded-lg bg-slate-100/60 dark:bg-slate-800/40 flex items-center gap-2 opacity-60 cursor-not-allowed">
                <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">
                  lock
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    Quiz 03: Chuẩn đầu ra Tầng giao vận
                  </p>
                  <p className="text-[11px] text-slate-400">15 câu hỏi • Mở khi xong 3.4</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* Module 4 (Locked)                                       */}
        {/* ======================================================== */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 opacity-60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">
              lock
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Chương 04 • Tuần 11
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                Tầng Mạng &amp; Giao thức IP
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold shrink-0">Chưa mở</span>
        </div>
      </div>
    </aside>
  );
}

