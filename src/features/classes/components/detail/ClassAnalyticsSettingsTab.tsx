'use client';

import React, { useState } from 'react';
import type { ClassItem } from '../../schemas/class.schema';

interface ClassAnalyticsSettingsTabProps {
  classInfo: ClassItem;
  onToast: (msg: string) => void;
}

export function ClassAnalyticsSettingsTab({
  classInfo,
  onToast,
}: ClassAnalyticsSettingsTabProps) {
  const [enrollmentKey, setEnrollmentKey] = useState(
    classInfo.enrollmentKey || 'CS202-NET-AUTUMN24'
  );
  const [allowStudentPosts, setAllowStudentPosts] = useState(true);
  const [enableSocraticAi, setEnableSocraticAi] = useState(true);
  const [allowViewGpaStats, setAllowViewGpaStats] = useState(false);

  const handleGenerateNewKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CS202-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEnrollmentKey(code);
    onToast(`Đã tạo mã tự ghi danh mới: ${code}`);
  };

  const handleSaveSettings = () => {
    onToast('Đã lưu cấu hình học phần & phân quyền sinh viên thành công!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Cài đặt học phần & Bảng tổng kết dữ liệu học tập
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dành riêng cho Ban giảng huấn môn {classInfo.name} ({classInfo.title}).
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
        >
          Lưu thay đổi
        </button>
      </div>

      {/* 4 Analytic KPI Cards Grid - All with border-[3px] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tỷ lệ hoàn thành môn
          </div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            84.2%
          </div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+5.4% so với kỳ trước</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Điểm TB Lớp học
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            8.12<span className="text-xs font-normal text-slate-400">/10</span>
          </div>
          <div className="text-xs text-slate-500">
            Chuẩn đầu ra loại Giỏi/Khá
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Lượt hỏi AI Tutor
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            1,420
          </div>
          <div className="text-xs text-slate-500">
            Chủ đề: Subnetting & OSPF
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-rose-300 dark:border-rose-900 shadow-sm flex flex-col justify-between gap-3">
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Sinh viên cần hỗ trợ
          </div>
          <div className="text-3xl font-extrabold text-rose-600">
            3 SV
          </div>
          <div className="text-xs text-rose-500">
            Chưa nộp bài &lt;50% tiến độ
          </div>
        </div>
      </div>

      {/* Grade Distribution Gaussian SVG & Course Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Phổ điểm phân phối môn học (Gaussian)
              </h3>
              <p className="text-xs text-slate-500">Phân bố điểm quá trình & thi giữa kỳ</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs">
              N=48 SV
            </span>
          </div>

          {/* Inline Gaussian Distribution SVG Chart */}
          <div className="relative w-full h-48 py-2">
            <svg
              className="w-full h-full text-blue-600"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 400 160"
            >
              <line stroke="#dfe3e7" strokeWidth="1" x1="0" x2="400" y1="140" y2="140" />
              <line
                stroke="#dfe3e7"
                strokeDasharray="4 4"
                x1="0"
                x2="400"
                y1="90"
                y2="90"
              />
              <line
                stroke="#dfe3e7"
                strokeDasharray="4 4"
                x1="0"
                x2="400"
                y1="40"
                y2="40"
              />
              <path
                d="M 10 140 C 90 140, 110 135, 150 95 C 190 55, 210 20, 240 20 C 270 20, 290 55, 330 95 C 370 135, 380 140, 395 140 Z"
                fill="currentColor"
                fillOpacity="0.12"
              />
              <path
                d="M 10 140 C 90 140, 110 135, 150 95 C 190 55, 210 20, 240 20 C 270 20, 290 55, 330 95 C 370 135, 380 140, 395 140"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <circle cx="240" cy="20" fill="#0059bb" r="5" />
            </svg>
            <div className="absolute top-2 left-[58%] text-[11px] font-bold text-blue-700 bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-xs border border-blue-200">
              Đỉnh: 8.5 Điểm
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border">
              <span className="font-bold text-rose-600 block">Điểm F (&lt;5):</span>
              <span className="font-medium text-slate-500">2 SV (4%)</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border">
              <span className="font-bold text-amber-600 block">Điểm C (5-6.9):</span>
              <span className="font-medium text-slate-500">7 SV (15%)</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border">
              <span className="font-bold text-blue-600 block">Điểm B (7-8.4):</span>
              <span className="font-medium text-slate-500">25 SV (52%)</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border">
              <span className="font-bold text-emerald-600 block">Điểm A (&ge;8.5):</span>
              <span className="font-medium text-slate-500">14 SV (29%)</span>
            </div>
          </div>
        </div>

        {/* Class Settings Configuration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-5">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Cấu hình & Phân quyền sinh viên
          </h3>

          <div className="flex flex-col gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mã tự ghi danh (Enrollment Code)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={enrollmentKey}
                  className="font-mono bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-900 dark:text-slate-100 flex-1 font-bold border border-slate-200 dark:border-slate-700 outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateNewKey}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-blue-600 dark:text-blue-400 font-bold transition-colors cursor-pointer"
                >
                  Tạo mã mới
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowStudentPosts}
                  onChange={(e) => setAllowStudentPosts(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  Cho phép sinh viên đăng bài và thảo luận tự do trên Bảng tin
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableSocraticAi}
                  onChange={(e) => setEnableSocraticAi(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  Kích hoạt trợ lý Socratic AI Tutor tự động giải thích thuật toán
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowViewGpaStats}
                  onChange={(e) => setAllowViewGpaStats(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  Cho phép sinh viên xem điểm trung bình và biểu đồ phổ điểm lớp
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
            >
              Lưu cấu hình lớp học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

