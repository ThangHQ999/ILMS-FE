'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useClassActiveCourses } from '../hooks/useClassActiveCourses';
import { useExamDetail } from '../hooks/useExamDetail';
import { useUpdateExam } from '../hooks/useUpdateExam';
import type { CreateExamInput } from '../schemas/exam.schema';

export interface TeacherEditExamFormViewProps {
  classId: string;
  examId: string;
  className?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  onToast?: (message: string) => void;
}

interface ExamFormValues {
  examId: string;
  courseId: string;
  examType: string;
  title: string;
  description: string;
  durationMinutes: string;
  totalScore: string;
  startTime: string; // YYYY-MM-DDTHH:mm
  endTime: string;   // YYYY-MM-DDTHH:mm
}

function toLocalInputDateTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  // Match YYYY-MM-DDTHH:mm directly without timezone skew
  const directMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (directMatch) {
    return `${directMatch[1]}T${directMatch[2]}`;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export function TeacherEditExamFormView({
  classId,
  examId,
  onCancel,
  onSuccess,
  onToast,
}: TeacherEditExamFormViewProps) {
  const router = useRouter();

  // Load exam detail
  const {
    data: exam,
    isLoading: isLoadingExam,
    isError: isErrorExam,
    error: examLoadError,
    refetch: refetchExam,
  } = useExamDetail(examId, classId);

  // Load active courses for course name resolution
  const { data: courses = [] } = useClassActiveCourses(classId);

  // Mutation for updating exam (PATCH /api/v1/exams/{id})
  const updateExamMutation = useUpdateExam(classId, examId);

  // Initial loaded values snapshot (for dirty tracking)
  const [initialValues, setInitialValues] = useState<ExamFormValues | null>(null);

  // Current form values
  const [courseId, setCourseId] = useState<string>('');
  const [examType, setExamType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');
  const [totalScore, setTotalScore] = useState<string>('10');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  // UI state
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);

  // Populate form once exam detail is loaded
  useEffect(() => {
    if (exam && (!initialValues || initialValues.examId !== exam.id)) {
      const init: ExamFormValues = {
        examId: exam.id,
        courseId: exam.courseId || '',
        examType: exam.examType || 'MIDTERM',
        title: exam.title || '',
        description: exam.description || '',
        durationMinutes:
          exam.durationMinutes !== undefined ? String(exam.durationMinutes) : '60',
        totalScore:
          exam.totalScore !== undefined
            ? String(exam.totalScore)
            : exam.maxScore !== undefined
            ? String(exam.maxScore)
            : '10',
        startTime: toLocalInputDateTime(exam.startTime),
        endTime: toLocalInputDateTime(exam.endTime),
      };

      setInitialValues(init);
      setCourseId(init.courseId);
      setExamType(init.examType);
      setTitle(init.title);
      setDescription(init.description);
      setDurationMinutes(init.durationMinutes);
      setTotalScore(init.totalScore);
      setStartTime(init.startTime);
      setEndTime(init.endTime);
    }
  }, [exam, initialValues]);

  // Compute dirty fields against initialValues
  const dirtyFields = useMemo(() => {
    if (!initialValues) return {};
    const dirty: Partial<Record<keyof ExamFormValues, boolean>> = {};

    if (examType !== initialValues.examType) dirty.examType = true;
    if (title.trim() !== initialValues.title.trim()) dirty.title = true;
    if ((description || '').trim() !== (initialValues.description || '').trim())
      dirty.description = true;
    if (Number(durationMinutes) !== Number(initialValues.durationMinutes))
      dirty.durationMinutes = true;
    if (Number(totalScore) !== Number(initialValues.totalScore))
      dirty.totalScore = true;
    if (startTime !== initialValues.startTime) dirty.startTime = true;
    if (endTime !== initialValues.endTime) dirty.endTime = true;

    return dirty;
  }, [
    initialValues,
    examType,
    title,
    description,
    durationMinutes,
    totalScore,
    startTime,
    endTime,
  ]);

  const isDirty = useMemo(() => {
    return Object.keys(dirtyFields).length > 0;
  }, [dirtyFields]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Tên bài thi là bắt buộc';
    } else if (title.trim().length > 255) {
      errors.title = 'Tên bài thi không được vượt quá 255 ký tự';
    }

    if (!examType) {
      errors.examType = 'Loại bài thi là bắt buộc';
    } else if (!['QUIZ', 'MIDTERM', 'FINAL', 'CONTEST'].includes(examType)) {
      errors.examType = 'Loại bài thi không hợp lệ';
    }

    const durNum = Number(durationMinutes);
    if (!durationMinutes || isNaN(durNum) || durNum <= 0 || !Number.isInteger(durNum)) {
      errors.durationMinutes = 'Thời lượng phải là số nguyên dương';
    }

    const scoreNum = Number(totalScore);
    if (!totalScore || isNaN(scoreNum) || scoreNum <= 0 || scoreNum > 100) {
      errors.totalScore = 'Tổng điểm phải lớn hơn 0 và tối đa 100';
    } else {
      const parts = totalScore.split('.');
      if (parts[1] && parts[1].length > 2) {
        errors.totalScore = 'Tổng điểm có tối đa 2 chữ số thập phân';
      }
    }

    if (!startTime) {
      errors.startTime = 'Ngày giờ mở là bắt buộc';
    }

    if (!endTime) {
      errors.endTime = 'Ngày giờ đóng là bắt buộc';
    }

    if (startTime && endTime) {
      const s = new Date(startTime).getTime();
      const e = new Date(endTime).getTime();
      if (e <= s) {
        errors.endTime = 'Giờ đóng phải sau giờ mở';
      } else if (durNum > 0 && e - s < durNum * 60 * 1000) {
        errors.endTime =
          'Khoảng thời gian mở phải đủ thời lượng làm bài (' + durNum + ' phút)';
      }
    }

    return errors;
  }, [title, examType, durationMinutes, totalScore, startTime, endTime]);

  const isFormValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0;
  }, [validationErrors]);

  const isSaveEnabled = isDirty && isFormValid;

  // Course display label
  const courseDisplayName = useMemo(() => {
    if (exam?.courseName && exam?.courseCode) {
      return `${exam.courseName} (${exam.courseCode})`;
    }
    const matched = courses.find((c) => c.id === courseId);
    if (matched) {
      return `${matched.name} (${matched.code})`;
    }
    return exam?.courseName || 'Mạng máy tính (CS-202)';
  }, [exam, courses, courseId]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSaveEnabled || updateExamMutation.isPending) return;

    setApiErrorMessage(null);

    // Build dirty payload only
    const dirtyPayload: Partial<CreateExamInput> = {};
    if (dirtyFields.examType) {
      dirtyPayload.examType = examType as 'QUIZ' | 'MIDTERM' | 'FINAL' | 'CONTEST';
    }
    if (dirtyFields.title) {
      dirtyPayload.title = title.trim();
    }
    if (dirtyFields.description) {
      dirtyPayload.description = description.trim();
    }
    if (dirtyFields.durationMinutes) {
      dirtyPayload.durationMinutes = Number(durationMinutes);
    }
    if (dirtyFields.totalScore) {
      dirtyPayload.totalScore = Number(totalScore);
    }
    if (dirtyFields.startTime) {
      dirtyPayload.startTime = startTime;
    }
    if (dirtyFields.endTime) {
      dirtyPayload.endTime = endTime;
    }

    updateExamMutation.mutate(dirtyPayload, {
      onSuccess: () => {
        setShowSuccessAlert(true);
        if (onToast) {
          onToast('Cập nhật bài thi thành công!');
        }

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
          }
        }, 800);
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Không thể cập nhật bài thi. Vui lòng kiểm tra lại thông tin.';
        setApiErrorMessage(message);
        if (onToast) {
          onToast(message);
        }
      },
    });
  };

  // Loading skeleton
  if (isLoadingExam) {
    return (
      <div className="w-full">
        <div className="w-full max-w-[928px] mx-auto flex flex-col pb-28">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-6" />
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error loading exam
  if (isErrorExam) {
    return (
      <div className="w-full">
        <div className="w-full max-w-[928px] mx-auto flex flex-col pb-28">
          <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 flex flex-col items-center text-center gap-3">
            <span className="material-symbols-outlined text-4xl text-red-600">
              error
            </span>
            <h3 className="text-base font-semibold">
              Không thể tải thông tin bài thi
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300">
              {examLoadError?.message || 'Bài thi không tồn tại hoặc có lỗi kết nối.'}
            </p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => refetchExam()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium cursor-pointer"
              >
                Thử lại
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* MAIN CONTAINER (928px Centered matching Stitch frame) */}
      <div className="w-full max-w-[928px] mx-auto flex flex-col pb-28">
        {/* HEADING */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sửa bài thi
          </h2>
        </div>

        {/* SUCCESS ALERT BANNER */}
        {showSuccessAlert && (
          <div
            id="successAlert"
            className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-between animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">
                check_circle
              </span>
              <span>
                Cập nhật bài thi thành công! Đang chuyển hướng về danh sách bài thi...
              </span>
            </div>
          </div>
        )}

        {/* API ERROR BANNER */}
        {apiErrorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 flex items-start gap-3 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-red-600 text-xl shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold">Lỗi cập nhật bài thi</h4>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                {apiErrorMessage}
              </p>
            </div>
          </div>
        )}

        {/* EXAM EDIT FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6"
        >
          {/* ROW 1: MÔN HỌC (READ-ONLY) & LOẠI BÀI THI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                htmlFor="examCourse"
              >
                Môn học <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <select
                  id="examCourse"
                  disabled
                  value={courseId}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-not-allowed opacity-90"
                >
                  <option value={courseId}>{courseDisplayName}</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                <span className="material-symbols-outlined text-sm shrink-0">lock</span>
                <span>Không thể đổi môn học khi bài thi đã có câu hỏi.</span>
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                htmlFor="examType"
              >
                Loại bài thi <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <select
                  id="examType"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all cursor-pointer ${
                    validationErrors.examType
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <option value="QUIZ">Quiz</option>
                  <option value="MIDTERM">Giữa kỳ</option>
                  <option value="FINAL">Cuối kỳ</option>
                  <option value="CONTEST">Cuộc thi</option>
                </select>
              </div>
              {validationErrors.examType && (
                <p id="typeError" className="text-[11px] text-red-600 font-medium mt-1">
                  {validationErrors.examType}
                </p>
              )}
            </div>
          </div>

          {/* ROW 2: TÊN BÀI THI */}
          <div>
            <label
              className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
              htmlFor="examName"
            >
              Tên bài thi <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="examName"
                type="text"
                maxLength={255}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tên bài thi (ví dụ: Kiểm tra Giữa kỳ Mạng máy tính)"
                className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all ${
                  validationErrors.title
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              {validationErrors.title ? (
                <p id="nameError" className="text-[11px] text-red-600 font-medium">
                  {validationErrors.title}
                </p>
              ) : (
                <div />
              )}
              <span
                id="charCounter"
                className="text-[11px] text-slate-500 dark:text-slate-400 font-mono ml-auto"
              >
                {title.length}/255
              </span>
            </div>
          </div>

          {/* ROW 3: MÔ TẢ (TÙY CHỌN) */}
          <div>
            <label
              className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
              htmlFor="examDescription"
            >
              Mô tả{' '}
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                (tùy chọn)
              </span>
            </label>
            <textarea
              id="examDescription"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả hoặc hướng dẫn làm bài cho học viên (tùy chọn)..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
          </div>

          {/* ROW 4: THỜI LƯỢNG & TỔNG ĐIỂM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                htmlFor="examDuration"
              >
                Thời lượng (phút) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="examDuration"
                  type="number"
                  min="1"
                  step="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="ví dụ: 60"
                  className={`w-full px-3.5 py-2.5 pr-14 text-sm bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all ${
                    validationErrors.durationMinutes
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400 font-medium pointer-events-none">
                  phút
                </span>
              </div>
              {validationErrors.durationMinutes && (
                <p id="durationError" className="text-[11px] text-red-600 font-medium mt-1">
                  {validationErrors.durationMinutes}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                htmlFor="examMaxScore"
              >
                Tổng điểm <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="examMaxScore"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={totalScore}
                  onChange={(e) => setTotalScore(e.target.value)}
                  placeholder="ví dụ: 10"
                  className={`w-full px-3.5 py-2.5 pr-14 text-sm bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all ${
                    validationErrors.totalScore
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400 font-medium pointer-events-none">
                  điểm
                </span>
              </div>
              {validationErrors.totalScore && (
                <p id="scoreError" className="text-[11px] text-red-600 font-medium mt-1">
                  {validationErrors.totalScore}
                </p>
              )}
            </div>
          </div>

          {/* ROW 5: NGÀY GIỜ MỞ & ĐÓNG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                htmlFor="examStartTime"
              >
                Ngày giờ mở <span className="text-red-600">*</span>
              </label>
              <input
                id="examStartTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all ${
                  validationErrors.startTime
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {validationErrors.startTime && (
                <p id="startTimeError" className="text-[11px] text-red-600 font-medium mt-1">
                  {validationErrors.startTime}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                htmlFor="examEndTime"
              >
                Ngày giờ đóng <span className="text-red-600">*</span>
              </label>
              <input
                id="examEndTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all ${
                  validationErrors.endTime
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {validationErrors.endTime && (
                <p id="endTimeError" className="text-[11px] text-red-600 font-medium mt-1">
                  {validationErrors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* DÒNG HƯỚNG DẪN THỜI GIAN */}
          <div
            className={`flex items-center gap-1.5 text-xs ${
              validationErrors.endTime &&
              validationErrors.endTime.includes('Khoảng thời gian mở')
                ? 'text-red-600 font-medium'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-base">info</span>
            <span>
              Giờ đóng phải sau giờ mở. Khoảng thời gian mở phải đủ thời lượng làm bài.
            </span>
          </div>

          {/* KHỐI THÔNG TIN TRẠNG THÁI CÔNG BỐ (STITCH) */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border-2 border-blue-100 dark:border-blue-900/60 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-base shrink-0">
              info
            </span>
            <span>
              Lưu thay đổi giữ nguyên trạng thái công bố hiện tại của bài thi.
            </span>
          </div>

          {/* NÚT HÀNH ĐỘNG CUỐI THẺ (STITCH: RIGHT-ALIGNED [Hủy] [Lưu thay đổi]) */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              id="btnCancelForm"
              type="button"
              disabled={updateExamMutation.isPending}
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              id="btnSubmitExam"
              type="submit"
              disabled={!isSaveEnabled || updateExamMutation.isPending}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm flex items-center gap-2 ${
                isSaveEnabled && !updateExamMutation.isPending
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              {updateExamMutation.isPending && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>
                {updateExamMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
