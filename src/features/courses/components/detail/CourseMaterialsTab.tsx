'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CustomSelect } from '@/components/shared';
import { useCourseMaterials } from '../../hooks/useCourse';
import { downloadCourseMaterial } from '../../services/course.service';
import {
  isActiveAiIngestionStatus,
  type AiIngestionStatus,
  type CourseMaterialItem,
} from '../../schemas/course.schema';

interface CourseMaterialsTabProps {
  courseId: string;
  courseName?: string;
  canEdit?: boolean;
  onShowToast?: (msg: string) => void;
  onOpenKnowledgeGraph?: (materialId?: string) => void;
  autoPublish?: boolean;
  onAutoPublishChange?: (val: boolean) => void;
}

type FileTypeFilter = 'ALL' | 'PDF' | 'DOCX' | 'PPTX' | 'OTHER';
type AiStatusFilter =
  | 'ALL'
  | 'NOT_EXTRACTED'
  | 'ACTIVE'
  | 'AWAITING_REVIEW'
  | 'SUCCESS'
  | 'FAILED';

function resolveFileVisual(fileType: string, filename?: string | null) {
  const combined = `${fileType} ${filename ?? ''}`.toUpperCase();
  if (combined.includes('PDF')) {
    return {
      icon: 'picture_as_pdf',
      label: 'PDF',
      colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
    };
  }
  if (combined.includes('PPT')) {
    return {
      icon: 'slideshow',
      label: 'PPTX',
      colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    };
  }
  if (combined.includes('DOC')) {
    return {
      icon: 'description',
      label: 'DOCX',
      colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
    };
  }
  if (
    combined.includes('PY') ||
    combined.includes('JS') ||
    combined.includes('TS') ||
    combined.includes('JAVA') ||
    combined.includes('SQL') ||
    combined.includes('GO') ||
    combined.includes('MD')
  ) {
    return {
      icon: 'code',
      label: 'CODE',
      colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
    };
  }
  if (combined.includes('ZIP') || combined.includes('RAR')) {
    return {
      icon: 'folder_zip',
      label: 'ZIP',
      colorClass: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60',
    };
  }
  return {
    icon: 'draft',
    label: fileType.toUpperCase() || 'FILE',
    colorClass: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
  };
}

function renderAiStatusBadge(item: CourseMaterialItem) {
  const status: AiIngestionStatus = item.aiIngestionStatus;
  switch (status) {
    case 'SUCCESS':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/70 dark:border-emerald-900/60">
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          Đã xuất bản Neo4j
          {typeof item.conceptsCount === 'number' && item.conceptsCount > 0
            ? ` · ${item.conceptsCount} khái niệm`
            : ''}
        </span>
      );
    case 'AWAITING_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200/70 dark:border-amber-900/60">
          <span className="material-symbols-outlined text-[14px]">rate_review</span>
          Chờ giảng viên duyệt
        </span>
      );
    case 'PUBLISHING':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200/70 dark:border-indigo-900/60">
          <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
          Đang xuất bản Neo4j &amp; ChromaDB...
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/70 dark:border-blue-900/60">
          <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
          AI đang phân tích (4 Agents)...
        </span>
      );
    case 'QUEUED':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Đang xếp hàng đợi AI
        </span>
      );
    case 'FAILED':
      return (
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200/70 dark:border-rose-900/60"
          title={item.aiErrorCode || undefined}
        >
          <span className="material-symbols-outlined text-[14px]">error</span>
          Bóc tách thất bại{item.aiErrorCode ? ` (${item.aiErrorCode})` : ''}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/70 dark:border-slate-700/70">
          <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
          Chưa bóc tách AI
        </span>
      );
  }
}

export function CourseMaterialsTab({
  courseId,
  courseName,
  canEdit = false,
  onShowToast,
  onOpenKnowledgeGraph,
  autoPublish: propAutoPublish,
  onAutoPublishChange,
}: CourseMaterialsTabProps) {
  const t = useTranslations('courseMaterials');
  const tHub = useTranslations('materialsHub');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>('ALL');
  const [aiStatusFilter, setAiStatusFilter] = useState<AiStatusFilter>('ALL');

  // Mặc định là FALSE (Dừng chờ duyệt tay) theo yêu cầu của Giảng viên.
  // Đồng bộ và lưu giữ trong localStorage để khi chuyển tab quay lại không bị mất.
  const [internalAutoPublish, setInternalAutoPublish] = useState<boolean>(() => {
    if (typeof propAutoPublish === 'boolean') return propAutoPublish;
    if (typeof window === 'undefined') return false;
    try {
      const coursePref = localStorage.getItem(`ilms_course_materials_auto_publish_${courseId}`);
      if (coursePref !== null) return coursePref === 'true';
      const globalPref = localStorage.getItem('ilms_course_materials_auto_publish');
      if (globalPref !== null) return globalPref === 'true';
    } catch {
      // fallback
    }
    return false;
  });

  const autoPublish = propAutoPublish ?? internalAutoPublish;

  useEffect(() => {
    if (typeof propAutoPublish === 'boolean') return;
    try {
      const coursePref = localStorage.getItem(`ilms_course_materials_auto_publish_${courseId}`);
      if (coursePref !== null) {
        setInternalAutoPublish(coursePref === 'true');
        return;
      }
      const globalPref = localStorage.getItem('ilms_course_materials_auto_publish');
      if (globalPref !== null) {
        setInternalAutoPublish(globalPref === 'true');
      }
    } catch {
      // ignore
    }
  }, [courseId, propAutoPublish]);

  const handleToggleAutoPublish = () => {
    const nextVal = !autoPublish;
    try {
      localStorage.setItem(`ilms_course_materials_auto_publish_${courseId}`, String(nextVal));
      localStorage.setItem('ilms_course_materials_auto_publish', String(nextVal));
    } catch {
      // ignore
    }
    setInternalAutoPublish(nextVal);
    onAutoPublishChange?.(nextVal);
    onShowToast?.(
      nextVal
        ? 'Đã chuyển sang: Tự động xuất bản lên Neo4j & ChromaDB khi AI trích xuất xong.'
        : 'Đã chuyển sang: Dừng chờ duyệt tay (AI trích xuất xong sẽ dừng ở bản nháp chờ giảng viên duyệt).'
    );
  };

  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingDownloadId, setTogglingDownloadId] = useState<string | null>(null);

  const {
    materials,
    hasActiveJobs,
    isLoading,
    isFetching,
    isError,
    refetch,
    uploadMutation,
    extractMutation,
    extractBatchMutation,
    toggleDownloadableMutation,
    deleteMutation,
  } = useCourseMaterials(courseId);

  // Derived pipeline counts for Tier 2 live banner & Tier 1 CTA
  const pipelineCounts = useMemo(() => {
    const active = materials.filter((m) => isActiveAiIngestionStatus(m.aiIngestionStatus)).length;
    const awaiting = materials.filter((m) => m.aiIngestionStatus === 'AWAITING_REVIEW').length;
    const failed = materials.filter((m) => m.aiIngestionStatus === 'FAILED').length;
    const published = materials.filter((m) => m.aiIngestionStatus === 'SUCCESS').length;
    const unextracted = materials.filter(
      (m) => m.aiIngestionStatus === 'NOT_EXTRACTED' && m.uploadStatus === 'READY'
    );
    return { active, awaiting, failed, published, unextracted };
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materials.filter((mat) => {
      const matchesSearch =
        !q ||
        mat.title.toLowerCase().includes(q) ||
        (mat.originalFileName ?? '').toLowerCase().includes(q) ||
        (mat.lessonTitle ?? '').toLowerCase().includes(q) ||
        (mat.chapterTitle ?? '').toLowerCase().includes(q);

      const ft = `${mat.fileType} ${mat.originalFileName ?? ''}`.toUpperCase();
      const matchesType =
        fileTypeFilter === 'ALL' ||
        (fileTypeFilter === 'PDF' && ft.includes('PDF')) ||
        (fileTypeFilter === 'DOCX' && ft.includes('DOC')) ||
        (fileTypeFilter === 'PPTX' && ft.includes('PPT')) ||
        (fileTypeFilter === 'OTHER' &&
          !ft.includes('PDF') &&
          !ft.includes('DOC') &&
          !ft.includes('PPT'));

      const matchesStatus =
        aiStatusFilter === 'ALL' ||
        (aiStatusFilter === 'ACTIVE' && isActiveAiIngestionStatus(mat.aiIngestionStatus)) ||
        mat.aiIngestionStatus === aiStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [materials, searchQuery, fileTypeFilter, aiStatusFilter]);

  const hasFilters =
    Boolean(searchQuery.trim()) || fileTypeFilter !== 'ALL' || aiStatusFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFileTypeFilter('ALL');
    setAiStatusFilter('ALL');
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(
      { file, title: file.name, isDownloadable: true },
      {
        onSuccess: () => {
          onShowToast?.(`Đã tải lên tài liệu "${file.name}" lên Google Drive.`);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (err) => {
          onShowToast?.(
            err instanceof Error ? err.message : 'Không thể tải tài liệu lên. Vui lòng thử lại.'
          );
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      }
    );
  };

  const handleExtractOne = (mat: CourseMaterialItem, publishAuto = autoPublish) => {
    setExtractingId(mat.id);
    extractMutation.mutate(
      { materialId: mat.id, autoPublish: publishAuto },
      {
        onSuccess: () => {
          onShowToast?.(
            publishAuto
              ? `Đã đưa "${mat.title}" vào hàng đợi AI (tự động xuất bản nếu không lỗi).`
              : `Đã đưa "${mat.title}" vào hàng đợi AI (dừng chờ giảng viên duyệt).`
          );
        },
        onError: (err) => {
          onShowToast?.(
            err instanceof Error ? err.message : 'Không thể khởi chạy bóc tách AI cho tài liệu này.'
          );
        },
        onSettled: () => setExtractingId(null),
      }
    );
  };

  const handleExtractAllPending = () => {
    const targets = pipelineCounts.unextracted.map((m) => m.id);
    if (targets.length === 0) {
      onShowToast?.('Không có tài liệu nào đang chờ bóc tách AI.');
      return;
    }

    extractBatchMutation.mutate(
      { materialIds: targets, autoPublish },
      {
        onSuccess: (res) => {
          if (res.failed.length === 0) {
            onShowToast?.(
              `Đã đưa ${res.succeeded.length} tài liệu vào hàng đợi bóc tách AI.`
            );
          } else {
            onShowToast?.(
              `Đã đưa ${res.succeeded.length} tài liệu vào hàng đợi, ${res.failed.length} tài liệu gặp lỗi.`
            );
          }
        },
        onError: () => {
          onShowToast?.('Không thể kích hoạt bóc tách hàng loạt.');
        },
      }
    );
  };

  const handleToggleDownloadable = (mat: CourseMaterialItem) => {
    setTogglingDownloadId(mat.id);
    const nextVal = !mat.isDownloadable;
    toggleDownloadableMutation.mutate(
      { materialId: mat.id, isDownloadable: nextVal },
      {
        onSuccess: () => {
          onShowToast?.(
            nextVal
              ? `Đã bật quyền tải xuống cho "${mat.title}".`
              : `Đã tắt quyền tải xuống học viên cho "${mat.title}".`
          );
        },
        onError: () => {
          onShowToast?.('Không thể cập nhật quyền tải xuống.');
        },
        onSettled: () => setTogglingDownloadId(null),
      }
    );
  };

  const handleDelete = (mat: CourseMaterialItem) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài liệu "${mat.title}"?`)) return;
    setDeletingId(mat.id);
    deleteMutation.mutate(mat.id, {
      onSuccess: () => onShowToast?.(`Đã xóa tài liệu "${mat.title}".`),
      onError: () => onShowToast?.('Không thể xóa tài liệu này.'),
      onSettled: () => setDeletingId(null),
    });
  };

  const handleDownload = async (mat: CourseMaterialItem) => {
    try {
      await downloadCourseMaterial(mat.id, mat.originalFileName || mat.title);
      onShowToast?.(`Đang tải xuống "${mat.title}"...`);
    } catch {
      onShowToast?.('Không thể tải xuống tệp. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Hidden File Input (Teacher/Admin only) */}
      {canEdit && (
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUploadFile}
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.py,.js,.ts,.java,.go,.sql,.zip,.rar"
        />
      )}

      {/* TIER 1: ACTION BAR & FILTERS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('title')}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {materials.length} {t('filesUnit')}
              </span>
              {pipelineCounts.published > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {pipelineCounts.published} {t('publishedUnit')}
                </span>
              )}
              {isFetching && !isLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                  {t('syncing')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {canEdit
                ? `Tải lên giáo trình, slide cho ${courseName || 'môn học'} và kích hoạt pipeline 4 Agent AI để xây dựng Đồ thị tri thức.`
                : `Tài liệu bài giảng và học liệu đã được giảng viên chuẩn hóa tri thức cho ${courseName || 'môn học'}.`}
            </p>
          </div>

          {/* Teacher / Admin Primary Actions */}
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleAutoPublish}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  autoPublish
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70'
                }`}
                title={
                  autoPublish
                    ? 'Chế độ hiện tại: Tự động xuất bản lên Neo4j & ChromaDB nếu không có lỗi BLOCKER. Nhấp để chuyển sang Dừng chờ duyệt tay.'
                    : 'Chế độ hiện tại: Dừng ở trạng thái Chờ duyệt để giảng viên kiểm tra thủ công. Nhấp để chuyển sang Tự động xuất bản.'
                }
              >
                <span className="material-symbols-outlined text-[16px]">
                  {autoPublish ? 'bolt' : 'fact_check'}
                </span>
                <span>
                  {autoPublish ? tHub('actions.autoPublishOn') : tHub('actions.autoPublishOff')}
                </span>
              </button>

              {pipelineCounts.unextracted.length > 0 && (
                <button
                  type="button"
                  onClick={handleExtractAllPending}
                  disabled={extractBatchMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      extractBatchMutation.isPending ? 'animate-spin' : ''
                    }`}
                  >
                    {extractBatchMutation.isPending ? 'progress_activity' : 'auto_awesome'}
                  </span>
                  <span>
                    {t('extractAll')} ({pipelineCounts.unextracted.length})
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {uploadMutation.isPending ? 'progress_activity' : 'upload_file'}
                </span>
                <span>
                  {uploadMutation.isPending ? t('uploadingButton') : t('uploadButton')}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên tài liệu, chương hoặc bài học..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect<FileTypeFilter>
              value={fileTypeFilter}
              onChange={setFileTypeFilter}
              options={[
                { value: 'ALL', label: 'Mọi định dạng' },
                { value: 'PDF', label: 'PDF' },
                { value: 'DOCX', label: 'Word (DOCX)' },
                { value: 'PPTX', label: 'Slide (PPTX)' },
                { value: 'OTHER', label: 'Mã nguồn / Khác' },
              ]}
              className="min-w-[140px]"
            />

            {canEdit && (
              <CustomSelect<AiStatusFilter>
                value={aiStatusFilter}
                onChange={setAiStatusFilter}
                options={[
                  { value: 'ALL', label: 'Mọi trạng thái AI' },
                  { value: 'NOT_EXTRACTED', label: 'Chưa bóc tách' },
                  { value: 'ACTIVE', label: 'Đang chạy / Hàng đợi' },
                  { value: 'AWAITING_REVIEW', label: 'Chờ giảng viên duyệt' },
                  { value: 'SUCCESS', label: 'Đã xuất bản Neo4j' },
                  { value: 'FAILED', label: 'Thất bại' },
                ]}
                className="min-w-[175px]"
              />
            )}

            {hasFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Đặt lại
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TIER 2: LIVE PIPELINE BANNER (Teacher/Admin when jobs are active, awaiting review, or failed) */}
      {canEdit &&
        (pipelineCounts.active > 0 ||
          pipelineCounts.awaiting > 0 ||
          pipelineCounts.failed > 0) && (
          <div className="rounded-2xl p-4 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-amber-50/60 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-amber-950/30 border border-blue-200/70 dark:border-blue-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center shrink-0">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    hasActiveJobs
                      ? 'text-blue-600 dark:text-blue-400 animate-spin'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {hasActiveJobs ? 'sync' : 'notifications_active'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {pipelineCounts.active > 0 && (
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    ⚡ Đang xử lý AI {pipelineCounts.active} tài liệu (tự động cập nhật mỗi 4s)
                  </span>
                )}
                {pipelineCounts.awaiting > 0 && (
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    ⚠ {pipelineCounts.awaiting} bản nháp chờ duyệt thủ công
                  </span>
                )}
                {pipelineCounts.failed > 0 && (
                  <span className="font-bold text-rose-700 dark:text-rose-300">
                    ✕ {pipelineCounts.failed} tài liệu bóc tách lỗi
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/materials/tasks"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors shrink-0 self-start sm:self-center"
            >
              <span>Mở Trung tâm Xử lý AI</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>
          </div>
        )}

      {/* TIER 3: MATERIALS LIST + 7-STATE MATRIX */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              <div className="h-8 w-full rounded-xl bg-slate-100 dark:bg-slate-800/80" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">cloud_off</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Không thể tải danh sách tài liệu môn học
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Kết nối tới máy chủ học liệu bị gián đoạn. Vui lòng thử tải lại.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-1 px-4 py-2 rounded-xl bg-[#0059bb] text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : materials.length === 0 ? (
        /* Empty Zero-Data */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px]">folder_open</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Chưa có tài liệu học tập nào
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            {canEdit
              ? 'Tải lên giáo trình PDF, Slide PPTX hoặc tệp DOCX đầu tiên để lưu trên Google Drive và cho AI bóc tách thành Đồ thị tri thức.'
              : 'Giảng viên chưa đăng tải tài liệu bổ sung cho môn học này.'}
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Tải tài liệu đầu tiên</span>
            </button>
          )}
        </div>
      ) : filteredMaterials.length === 0 ? (
        /* Empty Filter Mismatch */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">search_off</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Không tìm thấy tài liệu phù hợp bộ lọc
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Thử điều chỉnh từ khóa tìm kiếm hoặc đặt lại bộ lọc trạng thái.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${
            isFetching && !isLoading ? 'opacity-80' : 'opacity-100'
          }`}
        >
          {filteredMaterials.map((mat) => {
            const visual = resolveFileVisual(mat.fileType, mat.originalFileName);
            const isActiveJob = isActiveAiIngestionStatus(mat.aiIngestionStatus);
            const isUploadingDrive = mat.uploadStatus !== 'READY';
            const isRowExtracting = extractingId === mat.id;
            const isRowDeleting = deletingId === mat.id;
            const reviewHref = mat.ingestionJobId
              ? `/materials/tasks?jobId=${encodeURIComponent(mat.ingestionJobId)}`
              : '/materials/tasks';

            return (
              <div
                key={mat.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/70 transition-all shadow-xs flex flex-col justify-between gap-4"
              >
                {/* Top Metadata */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${visual.colorClass}`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{visual.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate"
                        title={mat.title}
                      >
                        {mat.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        {visual.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {mat.fileSizeFormatted && <span>{mat.fileSizeFormatted}</span>}
                      {mat.chapterTitle && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[180px]" title={mat.chapterTitle}>
                            {mat.chapterTitle}
                          </span>
                        </>
                      )}
                      {mat.lessonTitle && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[180px]" title={mat.lessonTitle}>
                            {mat.lessonTitle}
                          </span>
                        </>
                      )}
                      {!mat.chapterTitle && !mat.lessonTitle && (
                        <>
                          <span>•</span>
                          <span>Học liệu cấp môn học</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {isUploadingDrive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[14px] animate-spin">
                            cloud_upload
                          </span>
                          Đang đồng bộ lên Drive...
                        </span>
                      ) : canEdit || mat.aiIngestionStatus === 'SUCCESS' ? (
                        renderAiStatusBadge(mat)
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[14px]">menu_book</span>
                          Tài liệu học tập
                        </span>
                      )}

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleToggleDownloadable(mat)}
                          disabled={togglingDownloadId === mat.id}
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            mat.isDownloadable
                              ? 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                              : 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30'
                          }`}
                          title="Bật/tắt quyền tải xuống của học viên"
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {mat.isDownloadable ? 'download_done' : 'block'}
                          </span>
                          <span>{mat.isDownloadable ? 'Cho tải' : 'Khóa tải'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Left: Primary AI / Knowledge CTA */}
                  <div className="flex flex-wrap items-center gap-2">
                    {mat.aiIngestionStatus === 'SUCCESS' && (
                      <button
                        type="button"
                        onClick={() => onOpenKnowledgeGraph?.(mat.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-emerald-900 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">hub</span>
                        <span>{canEdit ? 'Xem Đồ thị môn' : 'Xem tri thức bài này'}</span>
                      </button>
                    )}

                    {canEdit && mat.aiIngestionStatus === 'AWAITING_REVIEW' && (
                      <Link
                        href={reviewHref}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">rate_review</span>
                        <span>Duyệt bản nháp</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    )}

                    {canEdit && isActiveJob && (
                      <Link
                        href={reviewHref}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">monitoring</span>
                        <span>Theo dõi chi tiết</span>
                      </Link>
                    )}

                    {canEdit &&
                      !isUploadingDrive &&
                      (mat.aiIngestionStatus === 'NOT_EXTRACTED' ||
                        mat.aiIngestionStatus === 'FAILED') && (
                        <button
                          type="button"
                          onClick={() => handleExtractOne(mat)}
                          disabled={isRowExtracting}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                            mat.aiIngestionStatus === 'FAILED'
                              ? 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : 'bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[15px] ${
                              isRowExtracting ? 'animate-spin' : ''
                            }`}
                          >
                            {isRowExtracting
                              ? 'progress_activity'
                              : mat.aiIngestionStatus === 'FAILED'
                                ? 'refresh'
                                : 'auto_awesome'}
                          </span>
                          <span>
                            {mat.aiIngestionStatus === 'FAILED'
                              ? 'Thử bóc tách lại'
                              : 'Bóc tách AI'}
                          </span>
                        </button>
                      )}
                  </div>

                  {/* Right: File utilities */}
                  <div className="flex items-center gap-1.5">
                    {mat.url && (
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Mở trên Google Drive"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </a>
                    )}

                    {(canEdit || mat.isDownloadable) && (
                      <button
                        type="button"
                        onClick={() => void handleDownload(mat)}
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Tải tệp gốc"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleDelete(mat)}
                        disabled={isRowDeleting}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer disabled:opacity-40"
                        title="Xóa tài liệu"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
