'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { CustomSelect } from '@/components/shared';
import { api } from '@/lib/axios';
import { uploadImage } from '@/lib/upload';
import type { ApiResponse } from '@/types/common';

interface CreateCoursePageViewProps {
  userFullName?: string;
}

export function CreateCoursePageView({ userFullName }: CreateCoursePageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rawClassId = searchParams.get('classId')?.trim() || '';
  const targetClassId = rawClassId.startsWith('class-')
    ? rawClassId.slice('class-'.length)
    : rawClassId;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [name, setName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [semester, setSemester] = useState('Học kỳ 1');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submittingMode, setSubmittingMode] = useState<'DRAFT' | 'PUBLISHED' | null>(null);
  const isSubmitting = submittingMode !== null;

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploadError(null);
    setIsUploadingImage(true);
    try {
      const uploaded = await uploadImage(file, 'ilms/courses');
      setBackgroundUrl(uploaded.url);
      setUploadedFileName(uploaded.originalFilename || file.name);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải ảnh nền lên máy chủ.';
      setUploadError(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveBackground = () => {
    setBackgroundUrl('');
    setUploadedFileName('');
    setUploadError(null);
  };

  const submitCourse = async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    setApiError(null);

    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) {
      nextErrors.name = 'Tên môn học phải có ít nhất 2 ký tự.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmittingMode(targetStatus);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        status: targetStatus,
        ...(backgroundUrl ? { backgroundUrl } : {}),
        ...(courseCode.trim() ? { courseCode: courseCode.trim() } : {}),
        credits,
      };

      const { data } = await api.post<
        ApiResponse<{ id?: string; courseId?: string }>
      >('/courses', payload);
      const resData = data?.data ?? (data as unknown as { id?: string; courseId?: string });
      const createdId = resData?.id || resData?.courseId;

      if (!createdId) {
        throw new Error('Máy chủ không trả về ID môn học vừa tạo.');
      }

      // Sync explicit status via PATCH /api/v1/courses/{id}/status
      try {
        await api.patch(`/courses/${createdId}/status`, { status: targetStatus });
      } catch {
        // Ignore if POST /courses already set the status
      }

      await queryClient.invalidateQueries({
        queryKey: ['class-detail'],
      });

      if (targetClassId) {
        await api.post(`/classes/${targetClassId}/courses`, {
          courseId: createdId,
          semester,
          academicYear: '2026-2027',
        });
        await queryClient.invalidateQueries({
          queryKey: ['class-detail', targetClassId],
        });
        router.push(`/classes/${targetClassId}?tab=subjects`);
      } else {
        router.push(`/courses/${createdId}`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Không thể tạo môn học lúc này. Vui lòng thử lại.';
      setApiError(message);
    } finally {
      setSubmittingMode(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCourse('PUBLISHED');
  };

  const backHref = targetClassId ? `/classes/${targetClassId}?tab=subjects` : '/courses';
  const backLabel = targetClassId ? 'Quay lại lớp học' : 'Quay lại danh sách môn học';
  const previewCode = courseCode.trim() || 'IT-NEW';
  const previewTitle = name.trim() || 'Tên môn học sẽ hiển thị tại đây';
  const previewDescription =
    description.trim() || 'Mô tả ngắn về nội dung, chuẩn đầu ra và mục tiêu của môn học.';

  return (
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] antialiased font-sans">
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <DashboardHeader
        isFocus={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => {}}
        userFullName={userFullName}
        showFocusMode={false}
      />

      <main
        className={`min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-[72px]' : 'pl-64'
        }`}
      >
        <div className="pt-20 pb-16 px-4 sm:px-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Header with Preview Card Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-[#8E918F] dark:hover:text-[#E3E3E3] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>{backLabel}</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight">
                Tạo môn học mới
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F]">
                {targetClassId
                  ? 'Thiết lập thông tin, ảnh bìa và chế độ chia sẻ trước khi gắn trực tiếp vào lớp học.'
                  : 'Thiết lập thông tin môn học, ảnh bìa và chế độ chia sẻ cho chương trình giảng dạy.'}
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
              <span>Xem trước thẻ môn học</span>
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
                  apiError.includes('COURSE_CREATION_LIMIT') ||
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

          {/* 2-Column Layout: Left = Background Upload + Settings | Right = Course Info */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Upload Background + Visibility & Academic Settings */}
            <div className="lg:col-span-5 space-y-6">
              {/* Background Upload Card */}
              <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-7 space-y-4 border border-slate-200/70 dark:border-[#282A2C]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                      Ảnh nền môn học
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F] mt-0.5">
                      Hiển thị làm lớp nền phía sau chữ trên thẻ môn học và banner chi tiết.
                    </p>
                  </div>
                  {backgroundUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      className="text-xs font-medium text-red-600 dark:text-[#FFB4AB] hover:underline bg-transparent border-none cursor-pointer shrink-0"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {backgroundUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#3c4043] bg-[#F0F4F8] dark:bg-[#131314]">
                    <img
                      src={backgroundUrl}
                      alt="Course background preview"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end justify-between p-4">
                      <div className="text-white text-xs truncate pr-4">
                        {uploadedFileName || 'Ảnh bìa đã tải lên'}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold cursor-pointer border-none transition-colors shrink-0"
                      >
                        Đổi ảnh khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full h-40 rounded-2xl border border-dashed border-slate-300 dark:border-[#3c4043] bg-[#F8FAFD] dark:bg-[#131314] hover:bg-[#F0F4F8] dark:hover:bg-[#282A2C] transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isUploadingImage ? (
                      <>
                        <span className="w-6 h-6 border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium text-gray-600 dark:text-[#C4C7C5]">
                          Đang tải ảnh lên...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[28px] text-[#0B57D0] dark:text-[#A8C7FA]">
                          add_photo_alternate
                        </span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-[#E3E3E3]">
                          Tải ảnh nền môn học (PNG, JPG, WEBP)
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                          Tối đa 10 MB • Khuyên dùng tỷ lệ 16:9
                        </span>
                      </>
                    )}
                  </button>
                )}

                {uploadError && (
                  <p className="text-xs font-medium text-[#B3261E] dark:text-[#FFB4AB]">
                    {uploadError}
                  </p>
                )}
              </section>

              {/* Visibility & Academic Settings Card */}
              <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-7 space-y-5 border border-slate-200/70 dark:border-[#282A2C]">
                <h2 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                  Cài đặt hiển thị &amp; Học vụ
                </h2>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-[#C4C7C5] block">
                    Chế độ chia sẻ môn học
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['PUBLIC', 'PRIVATE'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setVisibility(opt)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border text-left flex items-center gap-2 ${
                          visibility === opt
                            ? 'bg-[#D3E3FD]/60 dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] border-[#0B57D0]/40 dark:border-[#A8C7FA]/40'
                            : 'bg-[#F0F4F8] dark:bg-[#131314] text-gray-700 dark:text-[#C4C7C5] border-transparent hover:opacity-90'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {opt === 'PUBLIC' ? 'public' : 'lock'}
                        </span>
                        <span>{opt === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-[#F0F4F8] dark:bg-[#131314] text-[11px] text-gray-600 dark:text-[#C4C7C5] leading-relaxed flex items-start gap-2">
                    <span className="material-symbols-outlined text-[15px] text-[#0B57D0] dark:text-[#A8C7FA] shrink-0 mt-0.5">
                      info
                    </span>
                    <span>
                      <strong>Chế độ Công khai</strong> cho phép mọi người có thể thêm môn học của bạn vào lớp học của họ.{' '}
                      <strong>Chế độ Riêng tư</strong> thì môn học chỉ có hiệu lực ở lớp học của bạn.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700 dark:text-[#C4C7C5] block">
                      Số tín chỉ
                    </label>
                    <CustomSelect<number>
                      value={credits}
                      onChange={setCredits}
                      options={[1, 2, 3, 4, 5, 6].map((c) => ({
                        value: c,
                        label: `${c} tín chỉ`,
                      }))}
                    />
                  </div>

                  {targetClassId && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700 dark:text-[#C4C7C5] block">
                        Học kỳ áp dụng
                      </label>
                      <CustomSelect<string>
                        value={semester}
                        onChange={setSemester}
                        options={[
                          { value: 'Học kỳ 1', label: 'Học kỳ 1' },
                          { value: 'Học kỳ 2', label: 'Học kỳ 2' },
                          { value: 'Học kỳ Hè', label: 'Học kỳ Hè' },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Course Basic Info & Submit */}
            <div className="lg:col-span-7 space-y-6">
              <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-7 space-y-5 border border-slate-200/70 dark:border-[#282A2C]">
                <h2 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                  Thông tin môn học
                </h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-[#C4C7C5] block">
                    Tên môn học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({});
                    }}
                    placeholder="Ví dụ: Cấu trúc dữ liệu và Giải thuật"
                    className={`w-full px-4 py-3 rounded-xl bg-[#F0F4F8] dark:bg-[#131314] text-sm text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none border ${
                      errors.name
                        ? 'border-red-500'
                        : 'border-transparent focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-[#B3261E] dark:text-[#FFB4AB]">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-[#C4C7C5] block">
                    Mã môn học (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="Ví dụ: IT3010 (để trống hệ thống sẽ tự sinh)"
                    className="w-full px-4 py-3 rounded-xl bg-[#F0F4F8] dark:bg-[#131314] text-sm font-mono text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none border border-transparent focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-[#C4C7C5] block">
                    Mô tả môn học
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Giới thiệu tổng quan về nội dung môn học, mục tiêu đầu ra (CLO/PLO) và yêu cầu tiên quyết..."
                    className="w-full px-4 py-3 rounded-xl bg-[#F0F4F8] dark:bg-[#131314] text-sm text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none border border-transparent focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                  <Link
                    href={backHref}
                    className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] transition-colors"
                  >
                    Hủy
                  </Link>
                  <button
                    type="button"
                    onClick={() => submitCourse('DRAFT')}
                    disabled={isSubmitting || isUploadingImage}
                    className="px-5 py-2.5 rounded-full bg-[#E1E5EA] hover:bg-[#D4DAE1] dark:bg-[#282A2C] dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] text-xs sm:text-sm font-semibold transition-all cursor-pointer border-none disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {submittingMode === 'DRAFT' && (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Lưu bản nháp</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingImage}
                    className="px-6 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] text-white dark:text-[#041E49] text-xs sm:text-sm font-semibold transition-all cursor-pointer border-none disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {submittingMode === 'PUBLISHED' && (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{targetClassId ? 'Xuất bản & Gắn vào lớp' : 'Xuất bản môn học'}</span>
                  </button>
                </div>
              </section>
            </div>
          </form>
        </div>
      </main>

      {/* Preview Card Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPreviewOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                Xem trước thẻ môn học
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#282A2C] text-gray-500 border-none bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="relative overflow-hidden rounded-3xl p-5 min-h-[260px] flex flex-col bg-[#FFFFFF] dark:bg-[#131314] shadow-sm">
              {backgroundUrl && (
                <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
                  <img src={backgroundUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/85 to-white/65 dark:from-[#131314]/95 dark:via-[#131314]/85 dark:to-[#131314]/65" />
                </div>
              )}

              <div className="relative z-10 flex items-center gap-2 mb-4">
                <span className="bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA] px-2.5 py-1 rounded-md text-[11px] font-bold uppercase">
                  {previewCode}
                </span>
                <span className="bg-gray-100 dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] px-2.5 py-1 rounded-md text-[11px] font-semibold">
                  {credits} Tín chỉ
                </span>
                <span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5]">
                  {visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                </span>
              </div>

              <div className="relative z-10 space-y-2">
                <h4 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3] line-clamp-2">
                  {previewTitle}
                </h4>
                <p className="text-xs text-gray-600 dark:text-[#C4C7C5] line-clamp-3">
                  {previewDescription}
                </p>
              </div>

              <div className="relative z-10 mt-auto pt-4">
                <div className="w-full flex justify-center items-center gap-2 bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] rounded-full py-2.5 text-sm font-semibold">
                  <span>Vào môn học</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
