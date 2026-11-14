'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClassModulesTabProps {
  currentRole: 'student' | 'teacher' | 'owner';
  onToast: (msg: string) => void;
  onViewSubjects?: () => void;
  subjectsCount?: number;
}

export function ClassModulesTab({
  currentRole,
  onToast,
  onViewSubjects,
  subjectsCount,
}: ClassModulesTabProps) {
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({
    'mod-1': false,
    'mod-2': false,
    'mod-3': true,
    'mod-4': false,
  });

  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateModule = () => {
    if (!newModuleName.trim()) {
      onToast('Vui lòng nhập tên chương / module mới!');
      return;
    }
    onToast(`Đã thêm thành công chương mới: "${newModuleName}"`);
    setNewModuleName('');
    setIsAddModuleOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Module Top Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Đề cương & Nội dung bài giảng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lộ trình 5 chương kiến trúc mạng theo chuẩn ACM/IEEE Computing Curricula.
          </p>
        </div>

        {/* Teacher Module Controls */}
        <div className="flex items-center gap-3">
          {onViewSubjects && (
            <button
              type="button"
              onClick={onViewSubjects}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">menu_book</span>
              <span>Môn học liên kết ({subjectsCount || 4})</span>
            </button>
          )}

          {(currentRole === 'teacher' || currentRole === 'owner') && (
            <>
              <button
                type="button"
                onClick={() => onToast('Kích hoạt chế độ kéo thả sắp xếp thứ tự module')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                <span>Sắp xếp lại thứ tự</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddModuleOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ Thêm Module mới</span>
              </button>
            </>
          )}

          {currentRole === 'student' && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Tiến độ chương: <strong className="text-blue-600 dark:text-blue-400 font-bold">2/4 Đã hoàn tất</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Module List Tree */}
      <div className="flex flex-col gap-5">
        {/* Module 1: Completed */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 transition-all">
          <div
            onClick={() => toggleModule('mod-1')}
            className="p-5 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-4">
              <span className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">check</span>
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Chương 1 • Đã hoàn thành 100%
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Tổng quan Kiến trúc Mạng & Mô hình OSI / TCP/IP
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden sm:inline">
                4 bài học • 1 bài trắc nghiệm
              </span>
              <span className="material-symbols-outlined text-slate-400">
                {expandedModules['mod-1'] ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </div>

          {expandedModules['mod-1'] && (
            <div className="p-5 flex flex-col gap-2.5 text-xs sm:text-sm border-t border-slate-200 dark:border-slate-800">
              <div
                onClick={() => onToast('Mở nội dung bài 1.1: Lịch sử Internet & Packet Switching')}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>
                  <span>Bài 1.1: Lịch sử Internet & Khái niệm chuyển mạch gói (Packet Switching)</span>
                </div>
                <span className="text-xs text-slate-400">Video 25 phút</span>
              </div>

              <div
                onClick={() => onToast('Mở tài liệu slide so sánh OSI vs TCP/IP')}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>
                  <span>Bài 1.2: So sánh chi tiết mô hình 7 tầng OSI và 4 tầng TCP/IP</span>
                </div>
                <span className="text-xs text-slate-400">Slide 42 trang</span>
              </div>

              <div
                onClick={() => onToast('Xem kết quả Trắc nghiệm Chương 1: 10/10 điểm')}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">quiz</span>
                  <span>Trắc nghiệm ôn tập Chương 1 (Điểm: 10/10)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  100%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Module 2: Completed */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 transition-all">
          <div
            onClick={() => toggleModule('mod-2')}
            className="p-5 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-4">
              <span className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">check</span>
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Chương 2 • Đã hoàn thành 100%
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Tầng Ứng dụng: HTTP/3, DNS & Lập trình Socket Mạng
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden sm:inline">
                3 bài học • 1 bài Lab Wireshark
              </span>
              <span className="material-symbols-outlined text-slate-400">
                {expandedModules['mod-2'] ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </div>

          {expandedModules['mod-2'] && (
            <div className="p-5 flex flex-col gap-2.5 text-xs sm:text-sm border-t border-slate-200 dark:border-slate-800">
              <div
                onClick={() => onToast('Mở bài 2.1: Giao thức HTTP/1.1, HTTP/2 và HTTP/3 QUIC')}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>
                  <span>Bài 2.1: Giao thức HTTP/1.1, HTTP/2 và HTTP/3 (QUIC Protocol)</span>
                </div>
                <span className="text-xs text-slate-400">Video 30 phút</span>
              </div>
              <div
                onClick={() => onToast('Mở bài 2.2: Hệ thống phân giải tên miền DNS & Root Servers')}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>
                  <span>Bài 2.2: Hệ thống phân giải tên miền DNS & Phân tích DNS Hierarchy</span>
                </div>
                <span className="text-xs text-slate-400">Slide 35 trang</span>
              </div>
            </div>
          )}
        </div>

        {/* Module 3: In Progress (Active) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-[3px] border-blue-400 dark:border-blue-600 transition-all">
          <div
            onClick={() => toggleModule('mod-3')}
            className="p-5 bg-blue-50/60 dark:bg-blue-950/40 flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-4">
              <span className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                60%
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Chương 3 • Đang học
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Tầng Giao vận: Kiểm soát luồng & Tránh tắc nghẽn TCP vs UDP
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hidden sm:inline">
                Đang diễn ra
              </span>
              <span className="material-symbols-outlined text-blue-600">
                {expandedModules['mod-3'] ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </div>

          {expandedModules['mod-3'] && (
            <div className="p-5 flex flex-col gap-2.5 text-xs sm:text-sm border-t border-blue-200 dark:border-blue-900">
              <div
                onClick={() => onToast('Bài 3.1: Dịch vụ định vị cổng đã hoàn tất!')}
                className="p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>
                  <span>Bài 3.1: Dịch vụ định vị cổng (Port Multiplexing) & Cấu trúc UDP Datagram</span>
                </div>
                <span className="text-xs text-slate-400">Đã học xong</span>
              </div>

              <div
                onClick={() => {
                  onToast('Đang mở không gian học tập chi tiết: Bài 3.2...');
                  router.push('/courses/course-cs-202/lessons/les-3-2');
                }}
                className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 flex items-center justify-between cursor-pointer border-[3px] border-blue-500 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">
                    play_circle
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Bài 3.2: Cơ chế bắt tay 3 bước (TCP 3-Way Handshake) & Sliding Window
                  </span>
                </div>
                <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">
                  Tiếp tục học &rarr;
                </span>
              </div>

              <div
                onClick={() => onToast('Mở tài liệu Bài 3.3: Thuật toán kiểm soát tắc nghẽn')}
                className="p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    radio_button_unchecked
                  </span>
                  <span>Bài 3.3: Thuật toán kiểm soát tắc nghẽn TCP Reno & TCP CUBIC</span>
                </div>
                <span className="text-xs text-slate-400">Chưa học</span>
              </div>

              <div
                onClick={() => onToast('Quiz 03 sẽ được mở vào Thứ Tư lúc 19:30')}
                className="p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-amber-200 dark:border-amber-900"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-600 text-[20px]">
                    assignment
                  </span>
                  <span className="font-medium">
                    Quiz 03: Kiểm tra trắc nghiệm kiểm soát luồng giao vận
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Mở vào Thứ 4 tới
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Module 4: Locked */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 opacity-60">
          <div className="p-5 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Chương 4 • Bị khóa
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                  Tầng Mạng: Định tuyến tĩnh, Thuật toán Dijkstra, OSPF & BGP
                </h3>
              </div>
            </div>
            <div className="text-xs text-slate-500">Điều kiện: Hoàn tất Quiz Chương 3</div>
          </div>
        </div>
      </div>

      {/* Modal Add Module */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Thêm Module / Chương học mới
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModuleOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Tên chương / Module:</label>
                <input
                  type="text"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="Ví dụ: Chương 5: Tầng Liên kết dữ liệu (Data Link Layer)..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModuleOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleCreateModule}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Thêm chương
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

