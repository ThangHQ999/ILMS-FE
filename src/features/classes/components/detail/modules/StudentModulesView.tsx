'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ActiveWeekBanner } from './ActiveWeekBanner';

export interface StudentModulesViewProps {
  onToast: (msg: string) => void;
  onNavigateTab?: (tab: string) => void;
  isPreview?: boolean;
  onExitPreview?: () => void;
}

export function StudentModulesView({
  onToast,
  onNavigateTab,
  isPreview = false,
  onExitPreview,
}: StudentModulesViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in_progress' | 'completed'>('all');

  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({
    'mod-1': false,
    'mod-2': false,
    'mod-3': true,
    'mod-4': false,
    'mod-5': false,
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenLesson = (lessonId: string, title: string) => {
    onToast(`Đang mở không gian học tập: ${title}...`);
    router.push('/courses/course-cs-202/lessons/les-3-2');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* If in Teacher Preview mode, show top banner */}
      {isPreview && onExitPreview && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border-[3px] border-amber-500 text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="material-symbols-outlined text-[20px] text-amber-600">visibility</span>
            <span>Bạn đang xem giao diện Chương trình học với Góc nhìn Học viên (Student View).</span>
          </div>
          <button
            type="button"
            onClick={onExitPreview}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
          >
            Quay lại Chế độ Giảng viên
          </button>
        </div>
      )}

      {/* 1. Student Progress & Search Header */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
              Góc nhìn Học viên
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              CS-202 • Mạng máy tính & Truyền thông dữ liệu
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            Lộ trình & Tiến độ học tập của bạn
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-48 sm:w-64 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: '64.2%' }} />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              64.2% (14/22 bài học hoàn tất)
            </span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài học, tài liệu..."
              className="pl-9 pr-3 py-2 w-56 sm:w-64 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => handleOpenLesson('les-3-2', 'Bài 3.2 TCP 3-Way Handshake')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            <span>Học tiếp bài gần nhất &rarr;</span>
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: 8 Columns - Student Syllabus Tree */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          <ActiveWeekBanner />

          {/* Module 1: Completed */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 transition-all">
            <div
              onClick={() => toggleModule('mod-1')}
              className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-300 dark:border-emerald-800">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Chương 1 • Đã hoàn thành 100%
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Tuần 1 - 3</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Tổng quan Mạng máy tính & Mô hình Phân tầng (OSI & TCP/IP)
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                  4/4 bài đã học
                </span>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedModules['mod-1'] ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </div>

            {expandedModules['mod-1'] && (
              <div className="p-4 sm:p-5 flex flex-col gap-2.5 border-t border-slate-200 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Bài 1.1: Khái niệm Mạng máy tính, Topo mạng và Băng thông
                      </p>
                      <p className="text-[11px] text-slate-500">Video 42 phút • Đã hoàn thành 100%</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToast('Mở xem lại video bài 1.1')}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Xem lại
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Bài 1.2: Phân tích 7 tầng mô hình OSI và 4 tầng TCP/IP
                      </p>
                      <p className="text-[11px] text-slate-500">Slide PDF 38 trang • Đã xem</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToast('Tải slide bài 1.2')}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Mở Slide
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Bài 1.3: Thực hành Lệnh chẩn đoán mạng (ping, traceroute, nslookup, netstat)
                      </p>
                      <p className="text-[11px] text-slate-500">Interactive Lab Terminal • Đã nộp log</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    10/10 điểm
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Quiz 01: Kiểm tra nhanh Kiến trúc & Nguyên lý Mạng
                      </p>
                      <p className="text-[11px] text-slate-500">Trắc nghiệm 15 câu • Điểm: 8.4/10</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    Đã hoàn thành
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Module 2: Completed */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 transition-all">
            <div
              onClick={() => toggleModule('mod-2')}
              className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-300 dark:border-emerald-800">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Chương 2 • Đã hoàn thành
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Tuần 4 - 6</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Tầng Ứng dụng (Application Layer: HTTP, DNS, SMTP, P2P)
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                  2/2 bài đã học
                </span>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedModules['mod-2'] ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </div>

            {expandedModules['mod-2'] && (
              <div className="p-4 sm:p-5 flex flex-col gap-2.5 border-t border-slate-200 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Bài 2.1: Giao thức HTTP 1.1 / HTTP/2 và Hệ thống phân giải tên miền DNS
                      </p>
                      <p className="text-[11px] text-slate-500">Video bài giảng • Đã xem</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToast('Mở xem lại video bài 2.1')}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Xem lại
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Lab 02: Lập trình Socket TCP / UDP Client-Server bằng C++
                      </p>
                      <p className="text-[11px] text-slate-500">Thực hành Code Runner • Đã chấm điểm: 9.0/10</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    9.0/10
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Module 3: Active Focus (Student Currently Learning Here) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-md overflow-hidden border-[3px] border-blue-500 ring-2 ring-blue-500/20 transition-all">
            <div
              onClick={() => toggleModule('mod-3')}
              className="p-4 sm:p-5 bg-blue-50/70 dark:bg-blue-950/40 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  3
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Chương 3 • Đang học (Tuần này)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">bolt</span>
                      Trọng tâm học
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Tầng Giao vận (Transport Layer - TCP & UDP Protocol Suite)
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hidden sm:inline">
                  Đang diễn ra (1/4 hoàn thành)
                </span>
                <span className={`material-symbols-outlined text-blue-600 transition-transform ${expandedModules['mod-3'] ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </div>

            {expandedModules['mod-3'] && (
              <div className="p-4 sm:p-5 flex flex-col gap-3 border-t border-blue-200 dark:border-blue-900">
                {/* 3.1: Completed */}
                <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Bài 3.1: Dịch vụ Tầng Giao vận, Ghép kênh & Phân kênh (Multiplexing / Demultiplexing)
                      </p>
                      <p className="text-[11px] text-slate-500">Video 32 phút • Đã hoàn thành 100%</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToast('Mở xem lại video bài 3.1')}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Xem lại
                  </button>
                </div>

                {/* 3.2: Current Active Lesson (HIGHLIGHTED) */}
                <div
                  onClick={() => handleOpenLesson('les-3-2', 'Bài 3.2: Cơ chế Bắt tay 3 bước TCP')}
                  className="p-4 rounded-xl bg-blue-50/90 dark:bg-blue-950/70 border-[3px] border-blue-500 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">play_circle</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold">
                          ĐANG HỌC
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                          Bài 3.2
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        Cơ chế Truyền tin cậy RDT & Quá trình Bắt tay 3 bước TCP (3-way Handshake)
                      </p>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                        Mô phỏng tương tác gói tin SYN / SYN-ACK / ACK • Sơ đồ chuỗi Sequence
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto"
                  >
                    <span>Tiếp tục học</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

                {/* 3.4: Wireshark Lab */}
                <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">assignment</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          Bài 3.4
                        </span>
                        <span className="px-2 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                          Bài tập nộp điểm
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Wireshark Lab: Bắt và Phân tích gói tin TCP 3-Way Handshake, Window Size
                      </p>
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                        Hạn chót: Chủ Nhật, 20/10 • 23:59 (Còn 2 ngày)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('assignments');
                      else onToast('Chuyển tới trang nộp bài tập Wireshark Lab...');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors shrink-0 cursor-pointer"
                  >
                    Nộp bài Lab ngay
                  </button>
                </div>

                {/* Quiz 03: Locked */}
                <div className="p-3.5 rounded-xl bg-slate-50/40 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-80">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Quiz 03: Đánh giá Năng lực Tầng Giao vận (20 câu trắc nghiệm)
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">
                        Điều kiện mở khóa: Cần hoàn tất Bài 3.2 và nộp báo cáo Lab 3.4
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                    Khóa có điều kiện
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Module 4: Upcoming */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 opacity-75">
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Chương 4 • Sắp diễn ra
                    </span>
                    <span className="text-xs text-slate-400">Dự kiến Tuần 10 - 12</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    Tầng Mạng & Giao thức Định tuyến (Network Layer: IPv4/IPv6, OSPF, BGP)
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium">
                Mở vào 28/10/2024
              </span>
            </div>
          </div>

          {/* Module 5: Locked */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 opacity-60">
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Chương 5 • Đang khóa
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    Tầng Liên kết Dữ liệu & Mạng cục bộ (Data Link Layer & LANs, CSMA/CD, ARP)
                  </h3>
                </div>
              </div>
              <span className="text-xs text-slate-400">Yêu cầu hoàn tất Chương 4</span>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Columns - Student Learning Companion */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* Card 1: Nhiệm vụ tuần này của sinh viên */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                  task_alt
                </span>
                <span>Nhiệm vụ tuần 09 của bạn</span>
              </h4>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                1/3 Xong
              </span>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5 text-slate-400 line-through">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">check_circle</span>
                <span>Xem video bài 3.1 Multiplexing / Demultiplexing</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-900 dark:text-slate-100 font-bold">
                <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0">radio_button_checked</span>
                <span>Hoàn thành mô phỏng Bài 3.2 TCP 3-Way Handshake</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0">pending</span>
                <span>Nộp file pcapng Wireshark Lab 3.4 (Hạn 20/10)</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => handleOpenLesson('les-3-2', 'Bài 3.2 TCP 3-Way Handshake')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Tiếp tục học ngay &rarr;
            </button>
          </div>

          {/* Card 2: Chuẩn đầu ra cá nhân (CLO) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[20px]">
                  insights
                </span>
                <span>Mức độ đạt chuẩn đầu ra (CLO)</span>
              </h4>
              <span className="font-bold text-xs text-purple-600 dark:text-purple-400">
                82% Tích lũy
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>CLO 1: Kiến trúc phân tầng & OSI</span>
                  <span className="text-emerald-600 font-bold">100% (Đạt)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>CLO 2: Giao thức truyền vận TCP / UDP</span>
                  <span className="text-blue-600 font-bold">65% (Đang học)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: AI Socratic Tutor Quick Help */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">psychology</span>
              <h4 className="text-sm font-bold">Trợ lý Socratic AI Tutor</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có câu hỏi nào về cơ chế bắt tay 3 bước TCP SYN/ACK hay thuật toán cửa sổ trượt (Sliding Window)?
            </p>
            <button
              type="button"
              onClick={() => onToast('Mở trợ lý Socratic AI Tutor hỗ trợ bài 3.2!')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-blue-600 dark:text-blue-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Hỏi Trợ lý AI ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

