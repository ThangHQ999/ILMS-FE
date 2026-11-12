'use client';

import React, { useState } from 'react';
import type { ClassItem } from '../../schemas/class.schema';

interface ClassSettingsTabProps {
  classInfo: ClassItem;
  onSaveClassInfo: (updates: { title: string; description: string }) => void;
  onRegenerateCode: () => void;
  onOpenArchiveModal: () => void;
}

export function ClassSettingsTab({
  classInfo,
  onSaveClassInfo,
  onRegenerateCode,
  onOpenArchiveModal,
}: ClassSettingsTabProps) {
  const [title, setTitle] = useState(classInfo.title);
  const [description, setDescription] = useState(classInfo.description || '');
  const [requireApproval, setRequireApproval] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClassInfo({ title, description });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Cài đặt lớp học
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Tùy chỉnh thông tin định danh, quyền tham gia và lưu trữ không gian lớp.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Group 1: Thông tin lớp */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">
              badge
            </span>
            <span>Thông tin nhận diện lớp</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên lớp học
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mô tả lớp
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>

        {/* Group 2: Tham gia lớp & Mã code */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">
              vpn_key
            </span>
            <span>Cài đặt tham gia lớp học</span>
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 gap-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Mã tham gia trực tiếp
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Học viên có thể nhập mã này để ghi danh vào lớp.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {classInfo.enrollmentKey || classInfo.name}
                </span>
                <button
                  type="button"
                  onClick={onRegenerateCode}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 underline"
                >
                  Tạo mã mới
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Yêu cầu phê duyệt
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Giảng viên/Chủ lớp phải duyệt trước khi sinh viên được vào lớp.
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Group 3: Vùng nguy hiểm / Lưu trữ lớp */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-rose-900 dark:text-rose-200 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-rose-600 dark:text-rose-400">
                  archive
                </span>
                <span>Lưu trữ lớp học này</span>
              </h3>
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                Khi lưu trữ, lớp học sẽ chuyển sang chế độ chỉ đọc. Học viên không thể nộp bài tập mới và lớp sẽ được chuyển vào tab "Đã lưu trữ". Bạn có thể khôi phục lại bất kỳ lúc nào.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenArchiveModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 hover:bg-rose-600 hover:text-white transition-all shadow-xs flex-shrink-0"
            >
              Lưu trữ lớp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

