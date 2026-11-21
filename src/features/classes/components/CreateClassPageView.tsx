'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { CustomSelect } from '@/components/shared';
import { uploadImage } from '@/lib/upload';
import { AVAILABLE_MAJORS, DEFAULT_ACADEMIC_YEAR } from '../constants';
import { createClassRequestSchema } from '../schemas/class.schema';
import { useCreateClass } from '../hooks/useCreateClass';

interface CreateClassPageViewProps {
  userFullName?: string;
}

export function CreateClassPageView({ userFullName }: CreateClassPageViewProps) {
  const router = useRouter();
  const t = useTranslations('classes');
  const tCreate = useTranslations('classes.createPage');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [academicYear, setAcademicYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [major, setMajor] = useState<string>(AVAILABLE_MAJORS[0]);
  const [maxCapacity, setMaxCapacity] = useState(60);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [requireApproval, setRequireApproval] = useState(true);
  const [isCodeActive, setIsCodeActive] = useState(true);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { mutateAsync: createClassAsync, isPending } = useCreateClass();

  useEffect(() => {
    if (!isPreviewOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploadingImage(true);
    try {
      const uploaded = await uploadImage(file, 'ilms/classes');
      setBackgroundUrl(uploaded.url);
      setUploadedFileName(uploaded.originalFilename || file.name);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : tCreate('uploadFailed');
      setUploadError(msg);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveBackground = () => {
    setBackgroundUrl('');
    setUploadedFileName('');
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    const parsed = createClassRequestSchema.safeParse({
      name,
      title,
      description,
      academicYear,
      major,
      maxStudents: maxCapacity,
      maxCapacity,
      visibility,
      requireApproval,
      isCodeActive,
      backgroundUrl: backgroundUrl || undefined,
      startAt: startAt ? `${startAt}T07:00:00` : undefined,
      endAt: endAt ? `${endAt}T18:00:00` : undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || '');
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      const created = await createClassAsync(parsed.data);
      router.push(`/classes/${created.id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message ? err.message : t('errorCreateApi');
      setApiError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0B0F19] text-gray-900 dark:text-[#E3E3E3] flex flex-col font-sans transition-colors duration-200">
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        workspaceMode="faculty"
      />

      <DashboardHeader
        isFocus={false}
        showFocusMode={false}
        showRoleSwitcher={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => {}}
        userFullName={userFullName}
        title={tCreate('breadcrumbTitle')}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-[72px]' : 'pl-64'
        }`}
      >
        <div className="pt-20 pb-16 px-4 sm:px-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Header with Preview Card Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <Link
                href="/classes"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-[#8E918F] dark:hover:text-[#E3E3E3] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>{tCreate('backToClasses')}</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight">
                {tCreate('heading')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F]">
                {tCreate('subheading')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 dark:bg-[#1E1F20] dark:hover:bg-[#282A2C] text-gray-800 dark:text-[#E3E3E3] border border-slate-200 dark:border-[#3c4043] text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                visibility
              </span>
              <span>{tCreate('previewTitle')}</span>
            </button>
          </div>

          {apiError && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-[#3C1919] text-[#B3261E] dark:text-[#FFB4AB] text-xs sm:text-sm flex items-start gap-2.5 border border-red-200 dark:border-[#93000A]/60">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="font-medium leading-relaxed">{apiError}</span>
                {(apiError.includes('hạn mức') ||
                  apiError.includes('CLASS_CREATION_LIMIT') ||
                  apiError.includes('nâng cấp') ||
                  apiError.includes('tối đa')) && (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-bold whitespace-nowrap shadow-sm shrink-0 self-start sm:self-auto transition-transform active:scale-95"
                  >
                    <span>Nâng cấp gói ngay</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* 2-Column Layout: Left = Background Upload + Settings | Right = Class Info */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Upload Background + Schedule & Enrollment Settings */}
            <div className="lg:col-span-5 space-y-5">
              {/* Background Upload Card */}
              <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                      wallpaper
                    </span>
                    <span>{tCreate('sectionBackground')}</span>
                  </h2>
                  <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                    {tCreate('backgroundHint')}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {backgroundUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#333537] h-44">
                    <img
                      src={backgroundUrl}
                      alt={uploadedFileName || 'Class background'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end justify-between p-4">
                      <span className="text-xs text-white font-medium truncate max-w-[55%]">
                        {uploadedFileName || tCreate('uploadedLabel')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold border-none cursor-pointer transition-colors"
                        >
                          {tCreate('changeBgBtn')}
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveBackground}
                          className="px-3 py-1.5 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold border-none cursor-pointer transition-colors"
                        >
                          {tCreate('removeBgBtn')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#3c4043] bg-[#F8FAFD] dark:bg-[#131314] hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] p-6 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isUploadingImage ? (
                      <>
                        <div className="w-6 h-6 animate-spin rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5]">
                          {tCreate('uploadingLabel')}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-[#E3E3E3]">
                          {tCreate('uploadCta')}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                          {tCreate('uploadSubtext')}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {uploadError && (
                  <p className="text-xs text-[#B3261E] dark:text-[#FFB4AB] font-medium">
                    {uploadError}
                  </p>
                )}
              </section>

              {/* Schedule & Enrollment Settings Card */}
              <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none space-y-4">
                <h2 className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                    tune
                  </span>
                  <span>{tCreate('sectionSettings')}</span>
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                    {tCreate('visibilityLabel')}
                  </label>
                  <CustomSelect<'PUBLIC' | 'PRIVATE'>
                    value={visibility}
                    onChange={setVisibility}
                    options={[
                      { value: 'PUBLIC', label: tCreate('visibilityPublic') },
                      { value: 'PRIVATE', label: tCreate('visibilityPrivate') },
                    ]}
                    triggerClassName="bg-[#F0F4F8] dark:bg-[#131314] border-none rounded-2xl h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                      {tCreate('startDateLabel')}
                    </label>
                    <input
                      type="date"
                      value={startAt}
                      onChange={(e) => setStartAt(e.target.value)}
                      className="w-full h-11 px-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                      {tCreate('endDateLabel')}
                    </label>
                    <input
                      type="date"
                      value={endAt}
                      onChange={(e) => setEndAt(e.target.value)}
                      className="w-full h-11 px-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                        {tCreate('isCodeActiveLabel')}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                        {tCreate('isCodeActiveHint')}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isCodeActive}
                      onChange={(e) => setIsCodeActive(e.target.checked)}
                      className="w-4 h-4 accent-[#0B57D0]"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                        {tCreate('requireApprovalLabel')}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                        {tCreate('requireApprovalHint')}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="w-4 h-4 accent-[#0B57D0]"
                    />
                  </label>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Class Basic Info + Submit */}
            <div className="lg:col-span-7 space-y-5">
              <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-none space-y-5">
                <h2 className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                    school
                  </span>
                  <span>{tCreate('sectionBasic')}</span>
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                    {t('fieldTitle')} <span className="text-[#B3261E] dark:text-[#FFB4AB]">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((p) => ({ ...p, title: '' }));
                    }}
                    placeholder={t('fieldTitlePlaceholder')}
                    className="w-full h-11 px-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40 transition-all"
                  />
                  {errors.title && (
                    <p className="mt-1 text-[11px] text-[#B3261E] dark:text-[#FFB4AB]">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                      {t('fieldName')} <span className="text-[#B3261E] dark:text-[#FFB4AB]">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                      }}
                      placeholder={t('fieldNamePlaceholder')}
                      className="w-full h-11 px-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40 font-mono transition-all"
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] text-[#B3261E] dark:text-[#FFB4AB]">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                      {t('fieldAcademicYear')}
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="2026-2027"
                      className="w-full h-11 px-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                      {t('fieldMajor')}
                    </label>
                    <CustomSelect<string>
                      value={major}
                      onChange={setMajor}
                      options={AVAILABLE_MAJORS.map((m) => ({ value: m, label: m }))}
                      triggerClassName="bg-[#F0F4F8] dark:bg-[#131314] border-none rounded-2xl h-11"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                      {t('fieldMaxStudents')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Number(e.target.value) || 60)}
                      className="w-full h-11 px-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                    {t('fieldDescription')}
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('fieldDescriptionPlaceholder')}
                    className="w-full p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40 resize-none transition-all"
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Link
                  href="/classes"
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 dark:bg-[#1E1F20] dark:hover:bg-[#282A2C] text-gray-700 dark:text-[#E3E3E3] text-xs sm:text-sm font-semibold transition-colors"
                >
                  {t('btnCancel')}
                </Link>
                <button
                  type="submit"
                  disabled={isPending || isUploadingImage}
                  className="px-6 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:hover:bg-[#b9d5fb] text-white dark:text-[#062E6F] text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending && (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isPending ? t('btnCreating') : t('btnSubmitCreate')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Preview Class Card Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setIsPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-class-card-title"
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-[#F0F4F8] dark:bg-[#131314] border border-slate-200 dark:border-[#3c4043] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3
                id="preview-class-card-title"
                className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                  visibility
                </span>
                <span>{tCreate('previewTitle')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                aria-label={t('btnCancel')}
                className="p-1.5 rounded-full text-gray-500 hover:bg-white dark:hover:bg-[#282A2C] border-none bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <article className="relative overflow-hidden rounded-3xl p-6 min-h-[280px] flex flex-col justify-between bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none">
              {backgroundUrl && (
                <>
                  <img
                    src={backgroundUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/85 to-white/65 dark:from-[#1E1F20]/95 dark:via-[#1E1F20]/85 dark:to-[#1E1F20]/65" />
                </>
              )}

              <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E1E5EA]/90 dark:bg-[#282A2C]/90 text-gray-800 dark:text-[#C4C7C5]">
                  {visibility === 'PUBLIC' ? tCreate('visibilityPublic') : tCreate('visibilityPrivate')}
                </span>
                <span className="text-xs font-mono text-gray-600 dark:text-[#C4C7C5]">
                  {academicYear || DEFAULT_ACADEMIC_YEAR}
                </span>
              </div>

              <div className="relative z-10 space-y-1.5">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] line-clamp-2">
                  {title.trim() || tCreate('previewDefaultTitle')}
                </h4>
                <p className="text-xs font-medium text-gray-600 dark:text-[#C4C7C5]">
                  {name.trim() || 'D21CNPM01'} • {major}
                </p>
                {description.trim() && (
                  <p className="text-xs text-gray-600 dark:text-[#C4C7C5] line-clamp-2 pt-1">
                    {description.trim()}
                  </p>
                )}
              </div>

              <div className="relative z-10 pt-5 mt-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-[#C4C7C5]">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  <span>0/{maxCapacity} Học viên</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-100 dark:bg-[#A8C7FA] text-blue-900 dark:text-[#062E6F] text-xs font-semibold">
                  <span>Vào không gian lớp</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </span>
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
