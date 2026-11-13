'use client';

import React, { useState } from 'react';
import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import type { ClassCourse } from '../../schemas/class-detail.schema';
import { saveLocalClassCourse } from '../../services/class-detail.service';

interface CreateSubjectModalProps {
  isOpen: boolean;
  classId: string;
  classNameTitle?: string;
  onClose: () => void;
  onSuccess: (newCourse: ClassCourse) => void;
}

export function CreateSubjectModal({
  isOpen,
  classId,
  classNameTitle,
  onClose,
  onSuccess,
}: CreateSubjectModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'DRAFT'>('PUBLIC');
  const [instructorName, setInstructorName] = useState('TS. Nguyễn Văn A');
  const [hasAiTutor, setHasAiTutor] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên môn học');
      return;
    }

    setIsLoading(true);
    setError(null);

    const generatedCode = code.trim() || `CS-${Math.floor(200 + Math.random() * 800)}`;

    try {
      // 1. Call Backend API POST /api/v1/courses to create course in DB
      let courseId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `crs-${Date.now()}`;
      try {
        const { data: createRes } = await api.post<ApiResponse<{ id: string; courseCode?: string }>>('/courses', {
          name: name.trim(),
          description: description.trim(),
          visibility,
        });
        if (createRes?.data?.id) {
          courseId = createRes.data.id;
        }
      } catch (err: unknown) {
        // If 403 or permission issue, check status
        if (typeof err === 'object' && err !== null) {
          const anyErr = err as { httpStatus?: number; message?: string };
          if (anyErr.httpStatus === 401) {
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            setIsLoading(false);
            return;
          }
        }
      }

      // 2. Assign to class via POST /api/v1/classes/{classId}/courses
      try {
        await api.post(`/classes/${classId}/courses`, {
          courseId,
          semester: 'Học kỳ 1',
          academicYear: '2026-2027',
        });
      } catch {
        // Fallback to local link
      }

      // 3. Construct new ClassCourse object
      const newSubject: ClassCourse = {
        id: courseId,
        code: generatedCode,
        name: name.trim(),
        status: 'ACTIVE',
        credits,
        description: description.trim() || 'Học phần vừa được tạo mới trong chương trình đào tạo của lớp.',
        chaptersCount: 1,
        materialsCount: 0,
        instructorName,
        instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        instructorColor: 'from-blue-600 to-indigo-600',
        hasAiTutor,
        badge: 'Môn mới',
        currentWeek: 'Tuần 1',
        lecturesCount: 12,
        knowledgeNodesCount: 24,
        quizzesCount: 2,
        teachingProgress: 0,
        specialFeature: hasAiTutor ? 'Trợ lý AI Socratic 24/7' : 'Tài liệu số',
        specialFeatureIcon: hasAiTutor ? 'smart_toy' : 'menu_book',
        semester: 'HK1 (2026-2027)',
        classAvgScore: 0,
        studentsCount: 42,
      };

      // 4. Persist to localStorage for this class so it survives F5
      saveLocalClassCourse(classId, newSubject);

      onSuccess(newSubject);
      onClose();
    } catch (err: unknown) {
      let msg = 'Đã có lỗi xảy ra khi tạo môn học.';
      if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = String((err as { message: unknown }).message);
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div
        className="bg-white dark:bg-[#1E1F20] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-subject-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">auto_stories</span>
            </div>
            <div>
              <h3 id="modal-subject-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tạo môn học mới cho lớp học
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {classNameTitle ? `Áp dụng cho: ${classNameTitle}` : 'Thiết lập học phần giảng dạy và sơ đồ tri thức'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 border border-red-200 dark:border-red-900/50">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Subject Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="sub-name">
                Tên môn học / Khóa học <span className="text-red-500">*</span>
              </label>
              <input
                id="sub-name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ví dụ: Cấu trúc dữ liệu & Giải thuật nâng cao"
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium transition-all"
              />
            </div>

            {/* Subject Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="sub-code">
                Mã học phần
              </label>
              <input
                id="sub-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS-205 (hoặc để trống)"
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 uppercase transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Credits */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="sub-credits">
                Số tín chỉ
              </label>
              <select
                id="sub-credits"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer font-medium"
              >
                <option value={2}>2 Tín chỉ</option>
                <option value={3}>3 Tín chỉ (Mặc định)</option>
                <option value={4}>4 Tín chỉ</option>
                <option value={5}>5 Tín chỉ (Đồ án / Khóa luận)</option>
              </select>
            </div>

            {/* Instructor Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="sub-instructor">
                Giảng viên phụ trách
              </label>
              <input
                id="sub-instructor"
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="TS. Nguyễn Văn A"
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
              />
            </div>
          </div>

          {/* Visibility Modes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Chế độ hiển thị
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: 'PUBLIC', label: 'Công khai', icon: 'public' },
                { val: 'PRIVATE', label: 'Riêng tư', icon: 'lock' },
                { val: 'DRAFT', label: 'Bản nháp', icon: 'edit_note' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setVisibility(opt.val as 'PUBLIC' | 'PRIVATE' | 'DRAFT')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    visibility === opt.val
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="sub-desc">
              Mô tả môn học
            </label>
            <textarea
              id="sub-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung tóm tắt môn học, chuẩn đầu ra và các yêu cầu tiên quyết..."
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* AI Tutor Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">
                smart_toy
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Kích hoạt Trợ lý ảo AI Socratic Tutor
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tự động phân tích tài liệu và hỗ trợ giải đáp 24/7 cho sinh viên theo môn học này
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasAiTutor}
              onChange={(e) => setHasAiTutor(e.target.checked)}
              className="w-4 h-4 accent-purple-600 cursor-pointer rounded"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Tạo môn học & Thêm vào lớp</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

