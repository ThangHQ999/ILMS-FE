'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClassRequestSchema, type CreateClassRequest, type ClassItem } from '../schemas/class.schema';
import { AVAILABLE_MAJORS, DEFAULT_ACADEMIC_YEAR } from '../constants';
import { useCreateClass } from '../hooks/useCreateClass';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (created: ClassItem) => void;
}

export function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const t = useTranslations('classes');
  const { mutateAsync: createClassMutate, isPending } = useCreateClass();

  const [formData, setFormData] = useState<CreateClassRequest>({
    name: '',
    title: '',
    description: '',
    academicYear: DEFAULT_ACADEMIC_YEAR,
    major: AVAILABLE_MAJORS[0],
    maxStudents: 60,
    enrollmentKey: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateClassRequest, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxStudents' ? Number(value) || 0 : value,
    }));
    if (errors[name as keyof CreateClassRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createClassRequestSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CreateClassRequest, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateClassRequest;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setApiError(null);
      const created = await createClassMutate(result.data);
      setFormData({
        name: '',
        title: '',
        description: '',
        academicYear: DEFAULT_ACADEMIC_YEAR,
        major: AVAILABLE_MAJORS[0],
        maxStudents: 60,
        enrollmentKey: '',
      });
      setErrors({});
      onSuccess?.(created);
      onClose();
    } catch (err: unknown) {
      let msg = 'Có lỗi xảy ra khi gửi yêu cầu tới API Spring Boot.';
      if (typeof err === 'object' && err !== null) {
        const anyErr = err as { httpStatus?: number; message?: string };
        if (anyErr.httpStatus === 401) {
          msg =
            'Lỗi 401 Unauthorized: Bạn cần đăng nhập tài khoản Giảng viên / Quản trị viên (tại /login) để thực hiện tạo lớp học!';
        } else if (typeof anyErr.message === 'string') {
          msg = anyErr.message;
        }
      }
      setApiError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-surface border border-border/80 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
            </div>
            <div>
              <h3
                id="modal-title"
                className="text-base font-bold text-foreground"
              >
                {t('modalCreateTitle')}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {t('modalCreateDesc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {apiError && (
            <div className="p-4 rounded-xl bg-destructive/15 text-destructive text-xs flex items-start gap-2.5 border border-destructive/30">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1 leading-relaxed font-medium">{apiError}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Class Code / Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('fieldName')} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('fieldNamePlaceholder')}
                className="w-full h-11 px-4 rounded-xl bg-muted/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50 font-mono transition-all"
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-destructive font-medium">{errors.name}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('fieldAcademicYear')} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-muted/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50 transition-all"
              />
              {errors.academicYear && (
                <p className="mt-1 text-[11px] text-destructive font-medium">
                  {errors.academicYear}
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('fieldTitle')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('fieldTitlePlaceholder')}
              className="w-full h-11 px-4 rounded-xl bg-muted/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50 transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-destructive font-medium">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Major */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('fieldMajor')} <span className="text-destructive">*</span>
              </label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-muted/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50 transition-all cursor-pointer"
              >
                {AVAILABLE_MAJORS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Students */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('fieldMaxStudents')}
              </label>
              <input
                type="number"
                name="maxStudents"
                min="1"
                max="500"
                value={formData.maxStudents}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-muted/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50 transition-all"
              />
            </div>
          </div>

          {/* Enrollment Key */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('fieldEnrollmentKey')}
            </label>
            <input
              type="text"
              name="enrollmentKey"
              value={formData.enrollmentKey || ''}
              onChange={handleChange}
              placeholder={t('fieldEnrollmentKeyPlaceholder')}
              className="w-full h-11 px-4 rounded-xl bg-muted/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50 font-mono transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('fieldDescription')}
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              placeholder={t('fieldDescriptionPlaceholder')}
              className="w-full p-3.5 rounded-2xl bg-muted/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl border border-border bg-surface text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 disabled:opacity-50 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  <span>{t('btnCreating')}</span>
                </>
              ) : (
                <span>{t('btnSubmitCreate')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
