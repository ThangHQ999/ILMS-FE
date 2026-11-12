'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClassRequestSchema, type CreateClassRequest } from '../schemas/class.schema';
import { AVAILABLE_MAJORS, DEFAULT_ACADEMIC_YEAR } from '../constants';
import { useCreateClass } from '../hooks/useCreateClass';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateClassModal({ isOpen, onClose }: CreateClassModalProps) {
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
      await createClassMutate(result.data);
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
      onClose();
    } catch {
      // Error handled by TanStack Query / global ApiError
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] shadow-2xl overflow-hidden border-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </div>
            <div>
              <h3
                id="modal-title"
                className="text-base font-display font-bold text-[#1F1F1F] dark:text-[#E3E3E3]"
              >
                {t('modalCreateTitle')}
              </h3>
              <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">
                {t('modalCreateDesc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#747775] dark:text-[#8E918F] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Class Code / Name */}
            <div>
              <label className="block text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] mb-1">
                {t('fieldName')} <span className="text-[#B3261E] dark:text-[#F28B82]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('fieldNamePlaceholder')}
                className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] border-none outline-none transition-all font-mono"
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-[#B3261E] dark:text-[#F28B82] font-medium">{errors.name}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] mb-1">
                {t('fieldAcademicYear')} <span className="text-[#B3261E] dark:text-[#F28B82]">*</span>
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] border-none outline-none transition-all"
              />
              {errors.academicYear && (
                <p className="mt-1 text-[11px] text-[#B3261E] dark:text-[#F28B82] font-medium">
                  {errors.academicYear}
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] mb-1">
              {t('fieldTitle')} <span className="text-[#B3261E] dark:text-[#F28B82]">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('fieldTitlePlaceholder')}
              className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] border-none outline-none transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-[#B3261E] dark:text-[#F28B82] font-medium">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Major */}
            <div>
              <label className="block text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] mb-1">
                {t('fieldMajor')} <span className="text-[#B3261E] dark:text-[#F28B82]">*</span>
              </label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] border-none outline-none transition-all cursor-pointer"
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
              <label className="block text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] mb-1">
                {t('fieldMaxStudents')}
              </label>
              <input
                type="number"
                name="maxStudents"
                min="1"
                max="500"
                value={formData.maxStudents}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] border-none outline-none transition-all"
              />
            </div>
          </div>

          {/* Enrollment Key */}
          <div>
            <label className="block text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] mb-1">
              {t('fieldEnrollmentKey')}
            </label>
            <input
              type="text"
              name="enrollmentKey"
              value={formData.enrollmentKey || ''}
              onChange={handleChange}
              placeholder={t('fieldEnrollmentKeyPlaceholder')}
              className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] border-none outline-none transition-all font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] mb-1">
              {t('fieldDescription')}
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              placeholder={t('fieldDescriptionPlaceholder')}
              className="w-full p-4 rounded-2xl bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] border-none outline-none transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="bg-transparent border border-[#747775] hover:bg-[#F0F4F9] text-[#1F1F1F] dark:border-[#8E918F] dark:hover:bg-[#282A2C] dark:text-[#E3E3E3] font-medium px-5 py-2.5 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-medium whitespace-nowrap transition-colors border-none shadow-none cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
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
