'use client';

import React, { useState, useId, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useClassActiveCourses, useCourseLessons } from '../hooks/useAssignmentQueries';
import { useCreateAssignment } from '../hooks/useAssignmentMutations';
import { createAssignmentSchema } from '../schemas/assignment.schema';
import { DueDatePicker } from './DueDatePicker';

export interface TeacherCreateAssignmentFormViewProps {
  classId: string;
  className?: string;
  onCancel: () => void;
  onSuccess: () => void;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function TeacherCreateAssignmentFormView({
  classId,
  className = 'CNTT-K22-01',
  onCancel,
  onSuccess,
  onToast,
}: TeacherCreateAssignmentFormViewProps) {
  const t = useTranslations('assignments.teacher.create');
  const tTeacher = useTranslations('assignments.teacher');

  const courseSelectId = useId();
  const lessonSelectId = useId();
  const titleInputId = useId();
  const descriptionInputId = useId();
  const maxScoreInputId = useId();
  const fileUrlInputId = useId();

  // Form states
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('10');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [allowLateSubmission, setAllowLateSubmission] = useState<boolean>(true);
  const [fileAttachmentUrl, setFileAttachmentUrl] = useState<string>('');

  // Field validation error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Queries & Mutations
  const { data: activeCourses = [], isLoading: isLoadingCourses } = useClassActiveCourses(classId);
  const { data: lessons = [], isLoading: isLoadingLessons } = useCourseLessons(selectedCourseId);
  const createAssignmentMutation = useCreateAssignment(classId);

  // Handle course change: reset lesson selection
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourseId = e.target.value;
    setSelectedCourseId(newCourseId);
    setSelectedLessonId(''); // Reset lesson selection when course changes
    if (errors.courseId) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.courseId;
        return copy;
      });
    }
  };

  // Handle title input change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.title;
        return copy;
      });
    }
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    // Parse max score value
    const parsedMaxScore = parseFloat(maxScore);

    // Validate using Zod schema
    const validationResult = createAssignmentSchema.safeParse({
      courseId: selectedCourseId ? selectedCourseId.trim() : '',
      lessonId: selectedLessonId ? selectedLessonId.trim() : null,
      title: title ? title.trim() : '',
      description: description ? description.trim() : '',
      maxScore: isNaN(parsedMaxScore) ? undefined : parsedMaxScore,
      dueDate: dueDate ? dueDate : null,
      allowLateSubmission,
      fileAttachmentUrl: fileAttachmentUrl?.trim() ? fileAttachmentUrl.trim() : null,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = String(issue.path[0] || 'global');
        // Map issue message key to translated text
        const errorKey = issue.message.replace('errors.', '');
        const translatedMsg = t(`errors.${errorKey}` as any) || issue.message;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = translatedMsg;
        }
      }
      setErrors(fieldErrors);
      // Dừng xử lý trước khi gọi POST hoặc lưu bài demo, giữ nguyên dữ liệu đã nhập
      return;
    }

    try {
      await createAssignmentMutation.mutateAsync(validationResult.data);
      if (onToast) {
        onToast(t('toasts.success'), 'success');
      }
      onSuccess();
    } catch (err: unknown) {
      const errorMsg =
        (err as { message?: string; response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        t('toasts.error');
      setGlobalError(errorMsg);
      if (onToast) {
        onToast(errorMsg, 'error');
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      {/* 1. Return Link & Page Title */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('pageTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs whitespace-nowrap">
              {t('roleTeacherBadge')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('pageSubtitle')}
          </p>
        </div>
      </div>

      {/* 3. Form Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border-2 border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all">
        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
            <span className="material-symbols-outlined text-[20px] text-rose-600 dark:text-rose-400 shrink-0">
              error_outline
            </span>
            <span>{globalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          {/* HÀNG 1: MÔN HỌC & BÀI HỌC (2 CỘT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Trường 1: Môn học * */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={courseSelectId}
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1"
              >
                <span>{t('fields.course')}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  id={courseSelectId}
                  value={selectedCourseId}
                  onChange={handleCourseChange}
                  className={`w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs appearance-none focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer ${errors.courseId
                      ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  <option value="">
                    {isLoadingCourses ? 'Đang tải danh sách môn học...' : t('fields.coursePlaceholder')}
                  </option>
                  {activeCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              </div>
              {errors.courseId && (
                <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.courseId}</p>
              )}
            </div>

            {/* Trường 2: Bài học (Tùy chọn) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={lessonSelectId}
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                <span>{t('fields.lesson')}</span>
              </label>
              <div className="relative">
                <select
                  id={lessonSelectId}
                  value={selectedLessonId}
                  disabled={!selectedCourseId || isLoadingLessons}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className={`w-full h-11 px-3.5 pr-10 rounded-xl text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs appearance-none focus:outline-none transition-all ${!selectedCourseId || isLoadingLessons
                      ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 cursor-pointer'
                    }`}
                >
                  <option value="">{t('fields.noLessonOption')}</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG 2: TÊN BÀI TẬP */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={titleInputId}
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1"
              >
                <span>{t('fields.title')}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                {title.length}/255
              </span>
            </div>
            <div className="relative">
              <input
                id={titleInputId}
                type="text"
                maxLength={255}
                value={title}
                onChange={handleTitleChange}
                placeholder={t('fields.titlePlaceholder')}
                className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.title
                    ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
              />
            </div>
            {errors.title && (
              <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.title}</p>
            )}
          </div>

          {/* HÀNG 3: YÊU CẦU BÀI TẬP (LƯU VÀO DESCRIPTION) */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={descriptionInputId}
              className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              {t('fields.description')}
            </label>
            <textarea
              id={descriptionInputId}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('fields.descriptionPlaceholder')}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 resize-y min-h-[110px] transition-all"
            />
          </div>

          {/* HÀNG 4: ĐIỂM TỐI ĐA & HẠN NỘP (2 CỘT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Trường: Điểm tối đa */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={maxScoreInputId}
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                <span>{t('fields.maxScore')}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id={maxScoreInputId}
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={maxScore}
                  onChange={(e) => {
                    setMaxScore(e.target.value);
                    if (errors.maxScore) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.maxScore;
                        return copy;
                      });
                    }
                  }}
                  className={`w-full h-11 pl-3.5 pr-14 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.maxScore
                      ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                />
                <div className="pointer-events-none absolute right-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('fields.pointsUnit')}
                </div>
              </div>
              {errors.maxScore ? (
                <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.maxScore}</p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">info</span>
                  <span>{t('fields.maxScoreHint')}</span>
                </p>
              )}
            </div>

            {/* Trường: Hạn nộp (Ô Ngày + Ô Giờ, lịch tiếng Việt, điền sẵn 23:59 lần đầu, nút Bỏ hạn nộp) */}
            <DueDatePicker
              value={dueDate}
              onChange={(newDueDate) => {
                setDueDate(newDueDate);
                if (errors.dueDate) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.dueDate;
                    return copy;
                  });
                }
              }}
              error={errors.dueDate}
            />
          </div>

          {/* HÀNG 5: CHO PHÉP NỘP MUỘN */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 transition-all">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">history_toggle_off</span>
              </div>
              <div className="flex flex-col min-w-0">
                <label
                  onClick={() => setAllowLateSubmission((prev) => !prev)}
                  className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 cursor-pointer select-none"
                >
                  {t('fields.lateSubmission')}
                </label>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  {t('fields.lateSubmissionDesc')}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="shrink-0 flex items-center">
              <button
                type="button"
                role="switch"
                aria-checked={allowLateSubmission}
                onClick={() => setAllowLateSubmission((prev) => !prev)}
                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${allowLateSubmission
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                  }`}
              >
                <span className="sr-only">{t('fields.lateSubmissionAria')}</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-0.5 ${allowLateSubmission ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* HÀNG 6: ĐƯỜNG DẪN TÀI LIỆU ĐỀ BÀI */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={fileUrlInputId}
              className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              {t('fields.fileAttachmentUrl')}
            </label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-[20px]">link</span>
              </div>
              <input
                id={fileUrlInputId}
                type="url"
                maxLength={500}
                value={fileAttachmentUrl}
                onChange={(e) => {
                  setFileAttachmentUrl(e.target.value);
                  if (errors.fileAttachmentUrl) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.fileAttachmentUrl;
                      return copy;
                    });
                  }
                }}
                placeholder={t('fields.fileAttachmentUrlPlaceholder')}
                className={`w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.fileAttachmentUrl
                    ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
              />
            </div>
            {errors.fileAttachmentUrl && (
              <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.fileAttachmentUrl}</p>
            )}
          </div>

          {/* CHÂN FORM: CỤM NÚT HÀNH ĐỘNG */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={createAssignmentMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={createAssignmentMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              <span>
                {createAssignmentMutation.isPending
                  ? t('buttons.submitting')
                  : t('buttons.submit')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
