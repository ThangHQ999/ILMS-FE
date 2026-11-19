'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useClassActiveCourses,
  useCourseLessons,
  useAssignmentItem,
} from '../hooks/useAssignmentQueries';
import { useUpdateAssignment } from '../hooks/useAssignmentMutations';
import { formatToLocalDateTime } from '../services/assignment.service';
import { updateAssignmentSchema, type UpdateAssignmentPayload } from '../schemas/assignment.schema';
import { DueDatePicker } from './DueDatePicker';

export interface TeacherEditAssignmentFormViewProps {
  classId: string;
  assignmentId: string;
  className?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface FormInitialValues {
  courseId: string;
  lessonId: string;
  title: string;
  description: string;
  maxScore: string;
  dueDate: string | null;
  allowLateSubmission: boolean;
  fileAttachmentUrl: string;
}

export function TeacherEditAssignmentFormView({
  classId,
  assignmentId,
  className = 'CNTT-K22-01',
  onCancel,
  onSuccess,
  onToast,
}: TeacherEditAssignmentFormViewProps) {
  const router = useRouter();
  const t = useTranslations('assignments.teacher.create');
  const tEdit = useTranslations('assignments.teacher.edit');

  const courseSelectId = useId();
  const lessonSelectId = useId();
  const titleInputId = useId();
  const descriptionInputId = useId();
  const maxScoreInputId = useId();
  const fileUrlInputId = useId();

  // Load assignment detail
  const {
    data: assignment,
    isLoading: isLoadingAssignment,
    isError: isErrorAssignment,
    error: assignmentError,
    refetch: refetchAssignment,
  } = useAssignmentItem(assignmentId, classId);

  // Queries for courses and lessons
  const { data: activeCourses = [], isLoading: isLoadingCourses } = useClassActiveCourses(classId);

  // Initial snapshot for dirty tracking
  const [initialValues, setInitialValues] = useState<FormInitialValues | null>(null);

  // Form states
  const [courseId, setCourseId] = useState<string>('');
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

  // Mutation for updating assignment (PATCH /api/v1/assignments/{id})
  const updateAssignmentMutation = useUpdateAssignment(classId, assignmentId);

  // Lessons for current course
  const { data: lessons = [], isLoading: isLoadingLessons } = useCourseLessons(courseId);

  // Populate form when assignment is loaded
  useEffect(() => {
    if (assignment && (!initialValues || assignment.id !== assignmentId)) {
      const init: FormInitialValues = {
        courseId: assignment.courseId || '',
        lessonId: assignment.lessonId || '',
        title: assignment.title || '',
        description: assignment.description || '',
        maxScore: String(assignment.maxScore ?? assignment.studentMaxScore ?? 10),
        dueDate: assignment.dueDate || null,
        allowLateSubmission: assignment.allowLateSubmission !== false,
        fileAttachmentUrl: assignment.fileAttachmentUrl || '',
      };
      setInitialValues(init);
      setCourseId(init.courseId);
      setSelectedLessonId(init.lessonId);
      setTitle(init.title);
      setDescription(init.description);
      setMaxScore(init.maxScore);
      setDueDate(init.dueDate);
      setAllowLateSubmission(init.allowLateSubmission);
      setFileAttachmentUrl(init.fileAttachmentUrl);
    }
  }, [assignment, assignmentId, initialValues]);

  // Resolve course name display for read-only view
  const courseDisplayName = useMemo(() => {
    if (!courseId && !assignment?.courseId) {
      if (activeCourses.length > 0) {
        return activeCourses[0].name;
      }
      return 'Mạng máy tính (CS-202)';
    }
    const matched = activeCourses.find((c) => c.id === courseId || c.id === assignment?.courseId);
    if (matched) {
      if (matched.name.includes('(')) return matched.name;
      return `${matched.name} (${matched.code || 'CS-202'})`;
    }
    return assignment?.chapter || 'Mạng máy tính (CS-202)';
  }, [activeCourses, courseId, assignment]);

  // Dirty fields detection
  const dirtyFields = useMemo(() => {
    if (!initialValues) return { hasChanges: false, fields: {} as Record<string, boolean> };

    const normalizeDueDate = (d: string | null | undefined) => (d ? formatToLocalDateTime(d) : null);

    const fields: Record<string, boolean> = {
      title: title.trim() !== initialValues.title.trim(),
      description: description.trim() !== initialValues.description.trim(),
      lessonId: (selectedLessonId || '') !== (initialValues.lessonId || ''),
      maxScore: maxScore.trim() !== initialValues.maxScore.trim(),
      dueDate: normalizeDueDate(dueDate) !== normalizeDueDate(initialValues.dueDate),
      allowLateSubmission: allowLateSubmission !== initialValues.allowLateSubmission,
      fileAttachmentUrl: fileAttachmentUrl.trim() !== initialValues.fileAttachmentUrl.trim(),
    };

    const hasChanges = Object.values(fields).some(Boolean);
    return { hasChanges, fields };
  }, [
    initialValues,
    title,
    description,
    selectedLessonId,
    maxScore,
    dueDate,
    allowLateSubmission,
    fileAttachmentUrl,
  ]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/classes/${classId}?tab=assignments`);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    // Parse max score value
    const parsedMaxScore = parseFloat(maxScore);

    // Validate fields
    const validationResult = updateAssignmentSchema.safeParse({
      title: title ? title.trim() : '',
      description: description ? description.trim() : '',
      lessonId: selectedLessonId ? selectedLessonId.trim() : null,
      maxScore: isNaN(parsedMaxScore) ? undefined : parsedMaxScore,
      dueDate: dueDate ? dueDate : null,
      allowLateSubmission,
      fileAttachmentUrl: fileAttachmentUrl?.trim() ? fileAttachmentUrl.trim() : null,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = String(issue.path[0] || 'global');
        const errorKey = issue.message.replace('errors.', '');
        const translatedMsg = t(`errors.${errorKey}` as any) || issue.message;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = translatedMsg;
        }
      }
      setErrors(fieldErrors);
      // Keep user input intact, do not reset form or call API
      return;
    }

    // Build only dirty payload
    const dirtyPayload: Partial<UpdateAssignmentPayload> = {};

    if (dirtyFields.fields.title) {
      dirtyPayload.title = title.trim();
    }
    if (dirtyFields.fields.description) {
      dirtyPayload.description = description.trim();
    }
    if (dirtyFields.fields.lessonId) {
      dirtyPayload.lessonId = selectedLessonId ? selectedLessonId.trim() : null;
    }
    if (dirtyFields.fields.maxScore) {
      dirtyPayload.maxScore = parsedMaxScore;
    }
    if (dirtyFields.fields.dueDate) {
      // If cleared, explicitly send null
      dirtyPayload.dueDate = dueDate ? formatToLocalDateTime(dueDate) : null;
    }
    if (dirtyFields.fields.allowLateSubmission) {
      // Send boolean explicitly, e.g. allowLateSubmission: false when turned off
      dirtyPayload.allowLateSubmission = allowLateSubmission;
    }
    if (dirtyFields.fields.fileAttachmentUrl) {
      dirtyPayload.fileAttachmentUrl = fileAttachmentUrl?.trim() ? fileAttachmentUrl.trim() : null;
    }

    // If nothing changed, we can consider it successful and return
    if (!dirtyFields.hasChanges) {
      if (onToast) {
        onToast(tEdit('toasts.success'), 'success');
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/classes/${classId}?tab=assignments`);
      }
      return;
    }

    try {
      await updateAssignmentMutation.mutateAsync(dirtyPayload);
      if (onToast) {
        onToast(tEdit('toasts.success'), 'success');
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/classes/${classId}?tab=assignments`);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { message?: string; response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        tEdit('toasts.error');
      setGlobalError(errorMsg);
      if (onToast) {
        onToast(errorMsg, 'error');
      }
    }
  };

  // Loading state
  if (isLoadingAssignment) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/80 dark:border-slate-800 p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-11 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-11 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="h-11 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-11 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-11 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not found or load error state
  if (isErrorAssignment || !assignment) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">assignment_late</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Không tìm thấy thông tin bài tập
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {assignmentError?.message || 'Bài tập không tồn tại hoặc đã bị gỡ bỏ.'}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
            >
              {tEdit('backToList')}
            </button>
            <button
              type="button"
              onClick={() => refetchAssignment()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      {/* 1. Return Link & Page Title */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {tEdit('pageTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs whitespace-nowrap">
              {tEdit('roleTeacherBadge')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {tEdit('pageSubtitle')}
          </p>
        </div>
      </div>

      {/* 2. Form Container Card */}
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
          {/* HÀNG 1: MÔN HỌC (CHẾ ĐỘ CHỈ ĐỌC) & BÀI HỌC (2 CỘT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Trường 1: Môn học (CHẾ ĐỘ CHỈ ĐỌC) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={courseSelectId}
                  className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1"
                >
                  <span>{t('fields.course')}</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Cố định</span>
                </span>
              </div>
              <div className="relative">
                <select
                  id={courseSelectId}
                  disabled
                  value={courseId || 'CS-202'}
                  title={tEdit('readonlyCourse')}
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs sm:text-sm border-2 border-slate-200 dark:border-slate-800 shadow-xs cursor-not-allowed select-none appearance-none focus:outline-none opacity-75"
                >
                  <option value={courseId || 'CS-202'}>{courseDisplayName}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[15px] text-slate-400">info</span>
                <span>Không thể đổi môn học của bài tập đã tạo</span>
              </p>
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
                  disabled={isLoadingLessons}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 shadow-xs appearance-none focus:outline-none transition-all cursor-pointer"
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
                className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.title
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
                  className={`w-full h-11 pl-3.5 pr-14 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.maxScore
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

            {/* Trường: Hạn nộp (DueDatePicker) */}
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
                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  allowLateSubmission
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className="sr-only">{t('fields.lateSubmissionAria')}</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-0.5 ${
                    allowLateSubmission ? 'translate-x-6' : 'translate-x-1'
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
                className={`w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.fileAttachmentUrl
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
              onClick={handleCancel}
              disabled={updateAssignmentMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tEdit('buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={updateAssignmentMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateAssignmentMutation.isPending ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">check</span>
              )}
              <span>
                {updateAssignmentMutation.isPending
                  ? tEdit('buttons.submitting')
                  : tEdit('buttons.submit')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
