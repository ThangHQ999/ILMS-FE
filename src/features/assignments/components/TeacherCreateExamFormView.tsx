'use client';

import React, { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useClassActiveCourses } from '../hooks/useClassActiveCourses';
import { useCreateExam } from '../hooks/useCreateExam';
import { createExamFormSchema, type CreateExamInput } from '../schemas/exam.schema';
import { DueDatePicker } from './DueDatePicker';

export interface TeacherCreateExamFormViewProps {
  classId: string;
  className?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  onToast?: (message: string) => void;
}

export function TeacherCreateExamFormView({
  classId,
  className = 'CNTT-K22-01',
  onCancel,
  onSuccess,
  onToast,
}: TeacherCreateExamFormViewProps) {
  const router = useRouter();

  const courseSelectId = useId();
  const examTypeSelectId = useId();
  const titleInputId = useId();
  const descriptionInputId = useId();
  const durationInputId = useId();
  const totalScoreInputId = useId();

  // Load active courses for the class (GET /api/v1/classes/{classId}/courses?status=ACTIVE)
  const { data: courses = [], isLoading: isLoadingCourses } = useClassActiveCourses(classId);

  // Mutation for creating exam (POST /api/v1/classes/{classId}/exams)
  const createExamMutation = useCreateExam(classId);

  // Form field states
  const [courseId, setCourseId] = useState<string>('');
  const [examType, setExamType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<string>('60');
  const [totalScore, setTotalScore] = useState<string>('10');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  // UI state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
    }
  };

  const validateForm = (): CreateExamInput | null => {
    const rawData = {
      courseId,
      examType,
      title,
      description,
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      totalScore: totalScore ? Number(totalScore) : undefined,
      startTime,
      endTime,
    };

    const parsed = createExamFormSchema.safeParse(rawData);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = String(issue.path[0] || 'general');
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      }
      setFieldErrors(errors);
      return null;
    }

    setFieldErrors({});
    return parsed.data;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setApiErrorMessage(null);

    const validData = validateForm();
    if (!validData) {
      return;
    }

    createExamMutation.mutate(validData, {
      onSuccess: () => {
        setShowSuccessAlert(true);
        if (onToast) {
          onToast('Tạo bài thi thành công!');
        }

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
          }
        }, 1000);
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Không thể tạo bài thi. Vui lòng kiểm tra lại thông tin.';
        setApiErrorMessage(message);
        if (onToast) {
          onToast(message);
        }
      },
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      {/* 1. Page Title & Subtitle matching TeacherCreateAssignmentFormView */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Tạo bài thi mới
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs whitespace-nowrap">
              Giảng viên
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {className
              ? `Lớp ${className} • Thiết lập thông tin bài thi hoặc bài đánh giá định kỳ`
              : 'Thiết lập thông tin bài thi hoặc bài đánh giá định kỳ cho lớp học'}
          </p>
        </div>
      </div>

      {/* 2. Form Container Card matching TeacherCreateAssignmentFormView */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border-2 border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all">
        {/* Success Alert Banner */}
        {showSuccessAlert && (
          <div
            id="successAlert"
            className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn"
          >
            <span className="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400 shrink-0">
              check_circle
            </span>
            <span>
              Tạo bài thi thành công! Đang chuyển hướng về danh sách bài thi...
            </span>
          </div>
        )}

        {/* Global / API Error Banner */}
        {apiErrorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
            <span className="material-symbols-outlined text-[20px] text-rose-600 dark:text-rose-400 shrink-0">
              error_outline
            </span>
            <span>{apiErrorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          {/* HÀNG 1: MÔN HỌC & LOẠI BÀI THI (2 CỘT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Trường 1: Môn học * */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={courseSelectId}
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1"
              >
                <span>Môn học</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  id={courseSelectId}
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    if (fieldErrors.courseId) {
                      setFieldErrors((prev) => ({ ...prev, courseId: '' }));
                    }
                  }}
                  className={`w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs appearance-none focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer ${
                    fieldErrors.courseId
                      ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <option value="" disabled>
                    {isLoadingCourses ? 'Đang tải danh sách môn học...' : 'Chọn môn học'}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              </div>
              {fieldErrors.courseId && (
                <p id="courseError" className="text-xs text-rose-500 font-medium mt-0.5">
                  {fieldErrors.courseId}
                </p>
              )}
            </div>

            {/* Trường 2: Loại bài thi * */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={examTypeSelectId}
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1"
              >
                <span>Loại bài thi</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  id={examTypeSelectId}
                  value={examType}
                  onChange={(e) => {
                    setExamType(e.target.value);
                    if (fieldErrors.examType) {
                      setFieldErrors((prev) => ({ ...prev, examType: '' }));
                    }
                  }}
                  className={`w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs appearance-none focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer ${
                    fieldErrors.examType
                      ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <option value="" disabled>
                    Chọn loại bài thi
                  </option>
                  <option value="QUIZ">Quiz</option>
                  <option value="MIDTERM">Giữa kỳ</option>
                  <option value="FINAL">Cuối kỳ</option>
                  <option value="CONTEST">Cuộc thi</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              </div>
              {fieldErrors.examType && (
                <p id="typeError" className="text-xs text-rose-500 font-medium mt-0.5">
                  {fieldErrors.examType}
                </p>
              )}
            </div>
          </div>

          {/* HÀNG 2: TÊN BÀI THI (1 HÀNG TOÀN CHIỀU RỘNG) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={titleInputId}
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1"
              >
                <span>Tên bài thi</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span
                id="charCounter"
                className="text-xs font-mono text-slate-400 dark:text-slate-500"
              >
                {title.length}/255
              </span>
            </div>
            <div className="relative">
              <input
                id={titleInputId}
                type="text"
                maxLength={255}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) {
                    setFieldErrors((prev) => ({ ...prev, title: '' }));
                  }
                }}
                placeholder="Nhập tên bài thi (ví dụ: Kiểm tra Giữa kỳ Mạng máy tính)"
                className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  fieldErrors.title
                    ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              />
            </div>
            {fieldErrors.title && (
              <p id="nameError" className="text-xs text-rose-500 font-medium mt-0.5">
                {fieldErrors.title}
              </p>
            )}
          </div>

          {/* HÀNG 3: MÔ TẢ BÀI THI (TÙY CHỌN) */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={descriptionInputId}
              className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              <span>Mô tả</span>{' '}
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                (tùy chọn)
              </span>
            </label>
            <textarea
              id={descriptionInputId}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả hoặc hướng dẫn làm bài cho học viên (tùy chọn)..."
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 resize-y min-h-[110px] transition-all"
            />
          </div>

          {/* HÀNG 4: THỜI LƯỢNG & TỔNG ĐIỂM (2 CỘT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Trường 1: Thời lượng (phút) * */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={durationInputId}
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1"
              >
                <span>Thời lượng (phút)</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id={durationInputId}
                  type="number"
                  min="1"
                  step="1"
                  value={durationMinutes}
                  onChange={(e) => {
                    setDurationMinutes(e.target.value);
                    if (fieldErrors.durationMinutes) {
                      setFieldErrors((prev) => ({ ...prev, durationMinutes: '' }));
                    }
                  }}
                  placeholder="ví dụ: 60"
                  className={`w-full h-11 pl-3.5 pr-14 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    fieldErrors.durationMinutes
                      ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                />
                <div className="pointer-events-none absolute right-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  phút
                </div>
              </div>
              {fieldErrors.durationMinutes && (
                <p id="durationError" className="text-xs text-rose-500 font-medium mt-0.5">
                  {fieldErrors.durationMinutes}
                </p>
              )}
            </div>

            {/* Trường 2: Tổng điểm * */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={totalScoreInputId}
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1"
              >
                <span>Tổng điểm</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id={totalScoreInputId}
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={totalScore}
                  onChange={(e) => {
                    setTotalScore(e.target.value);
                    if (fieldErrors.totalScore) {
                      setFieldErrors((prev) => ({ ...prev, totalScore: '' }));
                    }
                  }}
                  placeholder="ví dụ: 10"
                  className={`w-full h-11 pl-3.5 pr-14 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    fieldErrors.totalScore
                      ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                />
                <div className="pointer-events-none absolute right-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  điểm
                </div>
              </div>
              {fieldErrors.totalScore ? (
                <p id="scoreError" className="text-xs text-rose-500 font-medium mt-0.5">
                  {fieldErrors.totalScore}
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">info</span>
                  <span>Thang điểm chuẩn 10 hoặc theo trọng số học phần</span>
                </p>
              )}
            </div>
          </div>

          {/* HÀNG 5: NGÀY GIỜ MỞ & NGÀY GIỜ ĐÓNG (2 CỘT DÙNG DueDatePicker) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Ngày giờ mở */}
            <DueDatePicker
              label="Ngày giờ mở"
              required
              placeholderDate="Chọn ngày mở"
              defaultTime="08:00"
              value={startTime || null}
              onChange={(newVal) => {
                setStartTime(newVal || '');
                if (fieldErrors.startTime) {
                  setFieldErrors((prev) => ({ ...prev, startTime: '' }));
                }
              }}
              error={fieldErrors.startTime}
              helperText="Thời điểm bắt đầu mở đề cho học viên"
            />

            {/* Ngày giờ đóng */}
            <DueDatePicker
              label="Ngày giờ đóng"
              required
              placeholderDate="Chọn ngày đóng"
              defaultTime="17:00"
              value={endTime || null}
              onChange={(newVal) => {
                setEndTime(newVal || '');
                if (fieldErrors.endTime) {
                  setFieldErrors((prev) => ({ ...prev, endTime: '' }));
                }
              }}
              error={fieldErrors.endTime}
              helperText="Thời điểm kết thúc và khóa nộp bài"
            />
          </div>

          {/* DÒNG HƯỚNG DẪN THỜI GIAN */}
          <div
            className={`flex items-center gap-1.5 text-xs ${
              fieldErrors.endTime && fieldErrors.endTime.includes('Khoảng thời gian mở')
                ? 'text-rose-600 font-medium'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-slate-400">info</span>
            <span>
              Giờ đóng phải sau giờ mở. Khoảng thời gian mở phải đủ thời lượng làm bài.
            </span>
          </div>

          {/* THÔNG BÁO CHƯA CÔNG BỐ (ĐẶT NGAY TRÊN HÀNG NÚT) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border-2 border-blue-100 dark:border-blue-900/60 text-xs sm:text-sm text-blue-800 dark:text-blue-300 flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px] shrink-0">
              assignment_turned_in
            </span>
            <span>
              Bài thi mới ở trạng thái <strong>Chưa công bố</strong>. Sau khi tạo, bạn có thể thêm câu hỏi và công bố.
            </span>
          </div>

          {/* CHÂN FORM: CỤM NÚT HÀNH ĐỘNG CĂN PHẢI (HỦY → TẠO BÀI THI) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3.5">
            <button
              id="btnCancelForm"
              type="button"
              onClick={handleCancel}
              disabled={createExamMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              id="btnSubmitExam"
              type="submit"
              disabled={createExamMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createExamMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">add_task</span>
              )}
              <span>
                {createExamMutation.isPending ? 'Đang tạo...' : 'Tạo bài thi'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
