'use client';

import React, { useEffect, useState } from 'react';
import { CustomSelect } from '@/components/shared';
import {
  fetchUserCourseOptions,
  type IngestionCourseOption,
} from '../../services/ingestion.service';

interface DirectUploadModalProps {
  isOpen: boolean;
  userId?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

export function DirectUploadModal({
  isOpen,
  userId,
  isSubmitting,
  onClose,
  onSubmit,
}: DirectUploadModalProps) {
  const [uploadMode, setUploadMode] = useState<'AI_EXTRACTION' | 'STORAGE_ONLY'>('AI_EXTRACTION');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courseOptions, setCourseOptions] = useState<IngestionCourseOption[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !userId) return;
    let active = true;
    void fetchUserCourseOptions(userId)
      .then((opts) => {
        if (active) setCourseOptions(opts);
      })
      .catch(() => {
        // Optional dropdown: silently ignore if user has no enrolled/owned courses yet
      });
    return () => {
      active = false;
    };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    if (picked && !title.trim()) {
      setTitle(picked.name);
    }
    setError('');
  };

  const handleSelectCourse = (selectedId: string) => {
    setCourseId(selectedId);
    const found = courseOptions.find((c) => c.courseId === selectedId);
    if (found && !subject.trim()) {
      setSubject(found.name);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn tệp tài liệu để đưa vào pipeline AI.');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề học liệu.');
      return;
    }
    if (!subject.trim()) {
      setError('Vui lòng nhập tên môn học / chủ đề.');
      return;
    }

    const form = new FormData();
    form.append('file', file);
    form.append('title', title.trim());
    form.append('subject', subject.trim());
    if (courseId) {
      form.append('courseId', courseId);
    }
    if (uploadMode === 'STORAGE_ONLY') {
      form.append('skipAiExtraction', 'true');
      form.append('isStorageOnly', 'true');
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {uploadMode === 'STORAGE_ONLY'
                ? 'Tải tài liệu lưu trữ (Thuần file Cloud)'
                : 'Tải tài liệu vào Pipeline AI (Luồng duyệt tay)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {uploadMode === 'STORAGE_ONLY' ? (
                <span>
                  Tệp sẽ được lưu trữ an toàn trên Cloud Storage mà không kích hoạt pipeline 4 Agent AI và không bóc tách thực thể Neo4j.
                </span>
              ) : (
                <span>
                  Hệ thống sẽ chạy 4 Agent AI trích xuất thực thể, tạo bản nháp và dừng ở trạng thái{' '}
                  <strong className="text-amber-600 dark:text-amber-400">Chờ duyệt</strong> để bạn kiểm tra trước khi xuất bản Neo4j.
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Segmented Mode Control */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setUploadMode('AI_EXTRACTION')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              uploadMode === 'AI_EXTRACTION'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>Bóc tách AI (Tạo đồ thị)</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('STORAGE_ONLY')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              uploadMode === 'STORAGE_ONLY'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder</span>
            <span>Chỉ lưu trữ file (Thuần tệp)</span>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* File drop / picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tệp tài liệu *
            </label>
            <input
              type="file"
              onChange={handleFilePick}
              accept=".pdf,.docx,.pptx,.txt,.md,.py,.js,.ts,.java,.go,.sql"
              className="block w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 dark:file:bg-blue-950/70 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/40"
            />
            <p className="text-[11px] text-slate-400">
              Hỗ trợ: PDF (text), DOCX, PPTX, TXT, MD, PY, JS, TS, JAVA, GO, SQL.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tiêu đề tài liệu *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="VD: Giáo trình Chương 3 - Cây cân bằng AVL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gắn với khóa học (tùy chọn)
              </label>
              <CustomSelect<string>
                value={courseId}
                onChange={handleSelectCourse}
                options={[
                  { value: '', label: 'Không gắn khóa học cụ thể' },
                  ...courseOptions.map((c) => ({
                    value: c.courseId,
                    label: c.className ? `${c.name} (${c.className})` : c.name,
                  })),
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tên môn học / Lĩnh vực *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
                placeholder="VD: Cấu trúc dữ liệu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-300"
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                uploadMode === 'STORAGE_ONLY'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#0059bb] hover:bg-blue-700'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isSubmitting ? 'animate-spin' : ''
                }`}
              >
                {isSubmitting
                  ? 'progress_activity'
                  : uploadMode === 'STORAGE_ONLY'
                  ? 'cloud_upload'
                  : 'psychology'}
              </span>
              <span>
                {isSubmitting
                  ? 'Đang xử lý...'
                  : uploadMode === 'STORAGE_ONLY'
                  ? 'Lưu trữ tệp Cloud'
                  : 'Bắt đầu bóc tách AI'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
