'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelAll?: () => void;
  onRunInBackground?: () => void;
}

export function UploadMaterialModal({
  isOpen,
  onClose,
  onCancelAll,
  onRunInBackground,
}: UploadMaterialModalProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isFile2Removed, setIsFile2Removed] = useState(false);

  if (!isOpen) return null;

  const handleCancelAll = () => {
    if (onCancelAll) {
      onCancelAll();
    } else {
      onClose();
    }
  };

  const handleRunInBackground = () => {
    if (onRunInBackground) {
      onRunInBackground();
    } else {
      onClose();
    }
  };

  return (
    <div
      id="uploadMaterialModal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-xs border border-blue-200/60 dark:border-blue-900/40">
              <span className="material-symbols-outlined text-[22px] animate-pulse">
                auto_awesome
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="upload-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug"
                >
                  Đang tải lên &amp; Phân tích Trí tuệ nhân tạo
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                  AI Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Hệ thống đang tải tệp lên Cloud và chạy pipeline trích xuất thực thể Đồ thị tri thức tự động
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Đóng hộp thoại"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* 1. Danh sách tệp đang tải lên */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Tiến độ truyền tải tệp ({isFile2Removed ? '1 tệp' : '2 tệp'})</span>
              <span className="text-blue-700 dark:text-blue-400 font-mono">
                Tổng: {isFile2Removed ? '8.4 MB' : '22.6 MB'}
              </span>
            </div>

            {/* File 1: Slide hoàn thành tải lên, chuyển AI */}
            <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">slideshow</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        Slide_Chuong06_Cay_Fenwick_BIT.pptx
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 font-medium ml-2 flex-shrink-0">
                        8.4 MB
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 mt-0.5 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-emerald-600 dark:text-emerald-400">
                        check_circle
                      </span>
                      <span>Đã tải lên 100% • Đang chuyển giao sang AI Pipeline</span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 flex-shrink-0">
                  Cloud OK
                </span>
              </div>
              <div className="w-full bg-emerald-200 dark:bg-emerald-900/50 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* File 2: PDF đang tải lên 72% */}
            {!isFile2Removed && (
              <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/30 dark:bg-blue-950/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          Giao_trinh_Cau_truc_du_lieu_Nang_cao_2024.pdf
                        </span>
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-400 ml-2 flex-shrink-0">
                          {isPaused ? 'Tạm dừng (72%)' : '72%'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span>10.2 MB / 14.2 MB</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {isPaused ? '0 MB/s' : '4.5 MB/s'}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span>{isPaused ? 'Đã tạm dừng' : 'Còn ~1 giây'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsPaused(!isPaused)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isPaused ? 'Tiếp tục tải' : 'Tạm dừng'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isPaused ? 'play_arrow' : 'pause'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFile2Removed(true)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Hủy tải"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full duration-300 transition-all ${
                      isPaused ? 'bg-slate-400' : 'bg-blue-600'
                    }`}
                    style={{ width: '72%' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Khối AI Knowledge Extraction Pipeline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                  <span className="material-symbols-outlined text-[18px]">schema</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    AI Knowledge Extraction Pipeline (Thời gian thực)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Đang phân tích cấu trúc &amp; tự động trích xuất thực thể học phần
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                Đang xử lý
              </span>
            </div>

            {/* 4 Bước Pipeline */}
            <div className="space-y-3">
              {/* Bước 1: Hoàn tất */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Bước 1: Quét OCR &amp; Phân tích cấu trúc trang bài giảng
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      100% Hoàn thành
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Đã quét 42 trang slide &amp; phân đoạn chương trình học chuẩn xác
                  </p>
                </div>
              </div>

              {/* Bước 2: Đang thực hiện với Live Entity Tags */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                  <span className="material-symbols-outlined text-[13px]">sync</span>
                </div>
                <div className="flex-1 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      Bước 2: Bóc tách khái niệm &amp; Thực thể tri thức (Concepts &amp; Entities)
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 font-mono">
                      68%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200/60 dark:bg-blue-900/50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '68%' }} />
                  </div>

                  {/* Live Entity Badges Stream */}
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                      Thực thể AI vừa nhận diện tức thì:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                        Cây Fenwick (BIT)
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400" />
                        Truy vấn đoạn O(log N)
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                        Point Update &amp; Range Query
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-amber-600 dark:bg-amber-400" />
                        Bitwise Indexing (i &amp; -i)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bước 3: Đang chuẩn bị */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold font-mono">
                  3
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Bước 3: Tạo ma trận tiên quyết &amp; Liên kết Đồ thị tri thức
                    </span>
                    <span className="text-[10px] text-slate-400">Đang chuẩn bị</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ánh xạ thực thể vào 142 nút mạng kiến thức sẵn có của lớp
                  </p>
                </div>
              </div>

              {/* Bước 4: Hàng đợi */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold font-mono">
                  4
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Bước 4: Khởi tạo ngân hàng Auto-Quiz chuẩn Bloom
                    </span>
                    <span className="text-[10px] text-slate-400">Hàng đợi</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sinh 10 câu trắc nghiệm khách quan đa tầng nhận thức
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400">
              info
            </span>
            <span>Bạn có thể tiếp tục làm việc, hệ thống sẽ gửi thông báo khi hoàn tất.</span>
          </div>
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancelAll}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border border-rose-200 dark:border-rose-900 cursor-pointer"
            >
              Hủy toàn bộ tiến trình
            </button>
            <Link
              href="/materials/tasks"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">queue</span>
              <span>Xem hàng đợi AI</span>
            </Link>
            <button
              type="button"
              onClick={handleRunInBackground}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">visibility_off</span>
              <span>Ẩn xuống để chạy ngầm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

