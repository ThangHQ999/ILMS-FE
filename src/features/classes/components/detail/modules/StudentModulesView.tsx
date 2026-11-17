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
        <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-800 dark:text-[#FFB784] flex items-center justify-between gap-3 border-none">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="material-symbols-outlined text-[20px] text-amber-600 dark:text-[#FFB784]">visibility</span>
            <span>Bạn đang xem giao diện Chương trình học với Góc nhìn Học viên (Student View).</span>
          </div>
          <button
            type="button"
            onClick={onExitPreview}
            className="px-4 py-2 rounded-full bg-amber-100 dark:bg-[#2E1F00] hover:opacity-85 text-amber-900 dark:text-[#FFB784] font-semibold text-xs transition-colors shrink-0 cursor-pointer border-none"
          >
            Quay lại Chế độ Giảng viên
          </button>
        </div>
      )}

      {/* 1. Student Progress & Search Header */}
      <div className="p-6 bg-white dark:bg-[#1E1F20] rounded-3xl border-none shadow-sm dark:shadow-none flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] text-[10px] font-semibold border-none">
              Góc nhìn Học viên
            </span>
            <span className="text-xs text-gray-500 dark:text-[#8E918F] font-medium">
              CS-202 • Mạng máy tính &amp; Truyền thông dữ liệu
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mt-1">
            Lộ trình &amp; Tiến độ học tập của bạn
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-48 sm:w-64 bg-gray-200 dark:bg-[#282A2C] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: '64.2%' }} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-[#81C995]">
              64.2% (14/22 bài học hoàn tất)
            </span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-gray-400 dark:text-[#8E918F] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài học, tài liệu..."
              className="pl-9 pr-4 py-2 w-56 sm:w-64 rounded-full bg-[#F0F4F8] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] text-xs border-none outline-none font-medium transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => handleOpenLesson('les-3-2', 'Bài 3.2 TCP 3-Way Handshake')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 border-none"
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
          <div className="rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none overflow-hidden border-none transition-all">
            <div
              onClick={() => toggleModule('mod-1')}
              className="p-5 sm:p-6 bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90 flex items-center justify-between cursor-pointer select-none transition-all"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] flex items-center justify-center font-bold text-sm shrink-0 border-none">
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
          <div className="rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none overflow-hidden border-none transition-all">
            <div
              onClick={() => toggleModule('mod-2')}
              className="p-5 sm:p-6 bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90 flex items-center justify-between cursor-pointer select-none transition-all"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] flex items-center justify-center font-bold text-sm shrink-0 border-none">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-[#81C995]">
                      Chương 2 • Đã hoàn thành
                    </span>
                    <span className="text-xs text-gray-400 dark:text-[#8E918F] font-medium">Tuần 4 - 6</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] mt-0.5">
                    Tầng Ứng dụng (Application Layer: HTTP, DNS, SMTP, P2P)
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-emerald-600 dark:text-[#81C995] hidden sm:inline">
                  2/2 bài đã học
                </span>
                <span className={`material-symbols-outlined text-gray-400 dark:text-[#8E918F] transition-transform ${expandedModules['mod-2'] ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </div>

            {expandedModules['mod-2'] && (
              <div className="p-4 sm:p-5 flex flex-col gap-2.5 border-t border-black/5 dark:border-white/5">
                <div className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-[#81C995] text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                        Bài 2.1: Giao thức HTTP 1.1 / HTTP/2 và Hệ thống phân giải tên miền DNS
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-[#8E918F]">Video bài giảng • Đã xem</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToast('Mở xem lại video bài 2.1')}
                    className="px-3 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] border-none"
                  >
                    Xem lại
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-[#81C995] text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                        Lab 02: Lập trình Socket TCP / UDP Client-Server bằng C++
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-[#8E918F]">Thực hành Code Runner • Đã chấm điểm: 9.0/10</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] text-xs font-semibold border-none">
                    9.0/10
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Module 3: Active Focus (Student Currently Learning Here) */}
          <div className="rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none overflow-hidden border-none transition-all">
            <div
              onClick={() => toggleModule('mod-3')}
              className="p-5 sm:p-6 bg-[#D3E3FD]/30 dark:bg-[#162B4D]/30 hover:opacity-90 flex items-center justify-between cursor-pointer select-none transition-all"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] flex items-center justify-center font-bold text-sm shrink-0 border-none">
                  3
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-[#A8C7FA]">
                      Chương 3 • Đang học (Tuần này)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] text-[10px] font-semibold flex items-center gap-1 border-none">
                      <span className="material-symbols-outlined text-[12px]">bolt</span>
                      Trọng tâm học
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] mt-0.5">
                    Tầng Giao vận (Transport Layer - TCP &amp; UDP Protocol Suite)
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-blue-600 dark:text-[#A8C7FA] hidden sm:inline">
                  Đang diễn ra (1/4 hoàn thành)
                </span>
                <span className={`material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] transition-transform ${expandedModules['mod-3'] ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </div>

            {expandedModules['mod-3'] && (
              <div className="p-4 sm:p-5 flex flex-col gap-3 border-t border-black/5 dark:border-white/5">
                {/* 3.1: Completed */}
                <div className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-[#81C995] text-[20px]">check_circle</span>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                        Bài 3.1: Dịch vụ Tầng Giao vận, Ghép kênh &amp; Phân kênh (Multiplexing / Demultiplexing)
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-[#8E918F]">Video 32 phút • Đã hoàn thành 100%</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToast('Mở xem lại video bài 3.1')}
                    className="px-3 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] border-none"
                  >
                    Xem lại
                  </button>
                </div>

                {/* 3.2: Current Active Lesson (HIGHLIGHTED) */}
                <div
                  onClick={() => handleOpenLesson('les-3-2', 'Bài 3.2: Cơ chế Bắt tay 3 bước TCP')}
                  className="p-4 rounded-2xl bg-[#D3E3FD]/40 dark:bg-[#162B4D]/40 border-none shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:opacity-90 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#007BFF] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border-none">
                      <span className="material-symbols-outlined text-[24px]">play_circle</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#007BFF] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-[10px] font-semibold border-none">
                          ĐANG HỌC
                        </span>
                        <span className="text-xs font-mono font-semibold text-blue-700 dark:text-[#A8C7FA]">
                          Bài 3.2
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mt-0.5">
                        Cơ chế Truyền tin cậy RDT &amp; Quá trình Bắt tay 3 bước TCP (3-way Handshake)
                      </p>
                      <p className="text-[11px] text-blue-700 dark:text-[#A8C7FA] mt-0.5">
                        Mô phỏng tương tác gói tin SYN / SYN-ACK / ACK • Sơ đồ chuỗi Sequence
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto border-none cursor-pointer transition-all"
                  >
                    <span>Tiếp tục học</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

                {/* 3.4: Wireshark Lab */}
                <div className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400 dark:text-[#8E918F] text-[20px]">assignment</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-gray-700 dark:text-[#C4C7C5]">
                          Bài 3.4
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-[#2E1F00] text-amber-800 dark:text-[#FFB784] text-[10px] font-semibold border-none">
                          Bài tập nộp điểm
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                        Wireshark Lab: Bắt và Phân tích gói tin TCP 3-Way Handshake, Window Size
                      </p>
                      <p className="text-[11px] text-rose-600 dark:text-[#F28B82] font-semibold">
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
                    className="px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold transition-colors shrink-0 cursor-pointer border-none"
                  >
                    Nộp bài Lab ngay
                  </button>
                </div>

                {/* Quiz 03: Locked */}
                <div className="p-3.5 rounded-2xl bg-[#F0F4F8]/60 dark:bg-[#131314]/60 border-none flex items-center justify-between opacity-80">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400 dark:text-[#8E918F] text-[20px]">lock</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5]">
                        Quiz 03: Đánh giá Năng lực Tầng Giao vận (20 câu trắc nghiệm)
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-[#FFB784]">
                        Điều kiện mở khóa: Cần hoàn tất Bài 3.2 và nộp báo cáo Lab 3.4
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] text-[10px] font-semibold border-none">
                    Khóa có điều kiện
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Module 4: Upcoming */}
          <div className="rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none overflow-hidden border-none opacity-75">
            <div className="p-5 sm:p-6 bg-[#F0F4F8] dark:bg-[#131314] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-500 dark:text-[#8E918F] flex items-center justify-center font-bold text-sm shrink-0 border-none">
                  4
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#8E918F]">
                      Chương 4 • Sắp diễn ra
                    </span>
                    <span className="text-xs text-gray-400 dark:text-[#8E918F]">Dự kiến Tuần 10 - 12</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-[#E3E3E3] mt-0.5">
                    Tầng Mạng &amp; Giao thức Định tuyến (Network Layer: IPv4/IPv6, OSPF, BGP)
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] text-xs font-medium border-none">
                Mở vào 28/10/2024
              </span>
            </div>
          </div>

          {/* Module 5: Locked */}
          <div className="rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none overflow-hidden border-none opacity-60">
            <div className="p-5 sm:p-6 bg-[#F0F4F8] dark:bg-[#131314] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-500 dark:text-[#8E918F] flex items-center justify-center font-bold text-sm shrink-0 border-none">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#8E918F]">
                    Chương 5 • Đang khóa
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-[#C4C7C5] mt-0.5">
                    Tầng Liên kết Dữ liệu &amp; Mạng cục bộ (Data Link Layer &amp; LANs, CSMA/CD, ARP)
                  </h3>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-[#8E918F]">Yêu cầu hoàn tất Chương 4</span>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Columns - Student Learning Companion */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* Card 1: Nhiệm vụ tuần này của sinh viên */}
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[20px]">
                  task_alt
                </span>
                <span>Nhiệm vụ tuần 09 của bạn</span>
              </h4>
              <span className="text-[11px] font-semibold text-blue-800 dark:text-[#A8C7FA] bg-[#D3E3FD] dark:bg-[#162B4D] px-2.5 py-0.5 rounded-full border-none">
                1/3 Xong
              </span>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5 text-gray-400 dark:text-[#8E918F] line-through">
                <span className="material-symbols-outlined text-emerald-600 dark:text-[#81C995] text-[18px] shrink-0">check_circle</span>
                <span>Xem video bài 3.1 Multiplexing / Demultiplexing</span>
              </li>
              <li className="flex items-start gap-2.5 text-gray-900 dark:text-[#E3E3E3] font-semibold">
                <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[18px] shrink-0">radio_button_checked</span>
                <span>Hoàn thành mô phỏng Bài 3.2 TCP 3-Way Handshake</span>
              </li>
              <li className="flex items-start gap-2.5 text-amber-700 dark:text-[#FFB784]">
                <span className="material-symbols-outlined text-amber-600 dark:text-[#FFB784] text-[18px] shrink-0">pending</span>
                <span>Nộp file pcapng Wireshark Lab 3.4 (Hạn 20/10)</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => handleOpenLesson('les-3-2', 'Bài 3.2 TCP 3-Way Handshake')}
              className="w-full py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold transition-all shadow-xs border-none cursor-pointer"
            >
              Tiếp tục học ngay &rarr;
            </button>
          </div>

          {/* Card 2: Chuẩn đầu ra cá nhân (CLO) */}
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[20px]">
                  insights
                </span>
                <span>Mức độ đạt chuẩn đầu ra (CLO)</span>
              </h4>
              <span className="font-semibold text-xs text-purple-600 dark:text-purple-400">
                82% Tích lũy
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-gray-700 dark:text-[#C4C7C5]">CLO 1: Kiến trúc phân tầng &amp; OSI</span>
                  <span className="text-emerald-600 dark:text-[#81C995] font-semibold">100% (Đạt)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#282A2C] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-gray-700 dark:text-[#C4C7C5]">CLO 2: Giao thức truyền vận TCP / UDP</span>
                  <span className="text-blue-600 dark:text-[#A8C7FA] font-semibold">65% (Đang học)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#282A2C] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#007BFF] dark:bg-[#A8C7FA] h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: AI Socratic Tutor Quick Help */}
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none space-y-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-[#E3E3E3]">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[20px]">psychology</span>
              <h4 className="text-sm font-semibold">Trợ lý Socratic AI Tutor</h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-[#C4C7C5] leading-relaxed">
              Bạn có câu hỏi nào về cơ chế bắt tay 3 bước TCP SYN/ACK hay thuật toán cửa sổ trượt (Sliding Window)?
            </p>
            <button
              type="button"
              onClick={() => onToast('Mở trợ lý Socratic AI Tutor hỗ trợ bài 3.2!')}
              className="w-full py-2.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-blue-600 dark:text-[#A8C7FA] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
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

