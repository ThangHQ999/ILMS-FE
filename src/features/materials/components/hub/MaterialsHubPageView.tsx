'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { useUserRole } from '@/hooks/useUserRole';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import {
  useIngestionJobsList,
  useUploadIngestionMaterialMutation,
} from '../../hooks/useIngestionJobs';
import {
  isActiveIngestionJobStatus,
  isCompletedIngestionJobStatus,
  type IngestionJobStatus,
  type IngestionJobSummary,
} from '../../schemas/ingestion.schema';
import { DirectUploadModal } from './DirectUploadModal';
import { JobDetailReviewPanel } from './JobDetailReviewPanel';

type StatusFilterKey = 'ALL' | 'AWAITING_REVIEW' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

function renderJobBadge(status: IngestionJobStatus) {
  switch (status) {
    case 'AWAITING_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Chờ duyệt
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          AI Đang chạy
        </span>
      );
    case 'PUBLISHING':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Đang xuất bản
        </span>
      );
    case 'QUEUED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Hàng đợi
        </span>
      );
    case 'COMPLETED':
    case 'SUCCESS':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Đã xuất bản
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Thất bại
        </span>
      );
  }
}

export function MaterialsHubPageView() {
  const t = useTranslations('materialsHub');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isTeacher, isAdmin } = useUserRole();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    searchParams.get('jobId')
  );
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const canUploadOrReview = isTeacher || isAdmin;

  const {
    jobs,
    metrics,
    hasActiveJobs,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useIngestionJobsList();

  const uploadMutation = useUploadIngestionMaterialMutation();

  // Keep selectedJobId in sync with URL ?jobId=
  useEffect(() => {
    const paramJobId = searchParams.get('jobId');
    if (paramJobId && paramJobId !== selectedJobId) {
      setSelectedJobId(paramJobId);
    }
  }, [searchParams, selectedJobId]);

  const handleSelectJob = useCallback(
    (jobId: string) => {
      setSelectedJobId(jobId);
      const next = new URLSearchParams(searchParams.toString());
      next.set('jobId', jobId);
      next.delete('tab');
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Auto-select first job (prioritizing AWAITING_REVIEW) if none is selected
  useEffect(() => {
    if (selectedJobId || jobs.length === 0) return;
    const priority =
      jobs.find((j) => j.status === 'AWAITING_REVIEW') ?? jobs[0];
    if (priority) {
      setSelectedJobId(priority.jobId);
    }
  }, [jobs, selectedJobId]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'AWAITING_REVIEW' && job.status === 'AWAITING_REVIEW') ||
        (statusFilter === 'ACTIVE' && isActiveIngestionJobStatus(job.status)) ||
        (statusFilter === 'COMPLETED' && isCompletedIngestionJobStatus(job.status)) ||
        (statusFilter === 'FAILED' && job.status === 'FAILED');

      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        (job.courseTitle ?? '').toLowerCase().includes(q) ||
        (job.subject ?? '').toLowerCase().includes(q) ||
        job.jobId.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [jobs, searchQuery, statusFilter]);

  const selectedSummary: IngestionJobSummary | null = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => j.jobId === selectedJobId) ?? null;
  }, [jobs, selectedJobId]);

  const handleDirectUpload = (formData: FormData) => {
    uploadMutation.mutate(formData, {
      onSuccess: (created) => {
        setIsUploadOpen(false);
        showToast('Đã đưa tài liệu vào hàng đợi bóc tách AI (chế độ chờ duyệt).');
        handleSelectJob(created.jobId);
      },
      onError: (err) => {
        showToast(
          err instanceof Error ? err.message : 'Không thể tải tài liệu lên pipeline AI.'
        );
      },
    });
  };

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Shell Navigation */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isFocusMode ? 'pl-20' : isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <DashboardHeader
          isFocus={isFocusMode}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleMode={() => setIsFocusMode((prev) => !prev)}
          userFullName={userFullName}
          title={t('title')}
        />

        <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 pb-10 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
          {/* Top Header & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {t('title')}
                </h1>
                {hasActiveJobs && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    {t('livePolling')}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  void refetch();
                  showToast('Đã đồng bộ danh sách tiến trình mới nhất từ máy chủ.');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                <span
                  className={`material-symbols-outlined text-[17px] text-blue-600 dark:text-blue-400 ${
                    isFetching ? 'animate-spin' : ''
                  }`}
                >
                  sync
                </span>
                <span>{t('refresh')}</span>
              </button>

              {canUploadOrReview && (
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  <span>{t('actions.uploadDirect')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Real 4-KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all cursor-pointer ${
                statusFilter === 'ACTIVE'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('kpi.active')}
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  {metrics.activeCount}
                </span>
                <span className="text-[11px] text-slate-400">
                  {metrics.queuedCount} chờ · {metrics.processingCount + metrics.publishingCount} chạy
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('AWAITING_REVIEW')}
              className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all cursor-pointer ${
                statusFilter === 'AWAITING_REVIEW'
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {t('kpi.awaitingReview')}
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {metrics.awaitingReviewCount}
                </span>
                <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
                  AWAITING_REVIEW
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('COMPLETED')}
              className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all cursor-pointer ${
                statusFilter === 'COMPLETED'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('kpi.completed')}
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {metrics.completedCount}
                </span>
                <span className="text-[11px] text-slate-400">COMPLETED</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('FAILED')}
              className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all cursor-pointer ${
                statusFilter === 'FAILED'
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-rose-300'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {t('kpi.failed')}
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {metrics.failedCount}
                </span>
                <span className="text-[11px] text-rose-500/80">FAILED</span>
              </div>
            </button>
          </div>

          {/* Filter Chips & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  ['ALL', `${t('filters.all')} (${metrics.totalCount})`],
                  ['AWAITING_REVIEW', `${t('filters.awaitingReview')} (${metrics.awaitingReviewCount})`],
                  ['ACTIVE', `${t('filters.active')} (${metrics.activeCount})`],
                  ['COMPLETED', `${t('filters.completed')} (${metrics.completedCount})`],
                  ['FAILED', `${t('filters.failed')} (${metrics.failedCount})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === key
                      ? 'bg-[#0059bb] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Master-Detail Split Grid (4/12 Left Job Queue · 8/12 Right Draft Review Studio) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Master Column */}
            <div className="xl:col-span-4 flex flex-col gap-2.5 max-h-[760px] overflow-y-auto pr-1">
              {isLoading ? (
                [1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 animate-pulse space-y-2.5"
                  >
                    <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800/70" />
                  </div>
                ))
              ) : isError ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Không thể tải danh sách tiến trình AI
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0059bb] text-white text-xs font-bold cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[26px]">auto_awesome</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Chưa có tiến trình bóc tách AI nào
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tải tài liệu trực tiếp tại đây hoặc bấm &ldquo;Bóc tách AI&rdquo; từ tab Tài liệu trong khóa học.
                  </p>
                  {canUploadOrReview && (
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0059bb] text-white text-xs font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                      <span>Tải tài liệu đầu tiên</span>
                    </button>
                  )}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Không có tiến trình nào khớp bộ lọc hiện tại.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = job.jobId === selectedJobId;
                  return (
                    <button
                      key={job.jobId}
                      type="button"
                      onClick={() => handleSelectJob(job.jobId)}
                      className={`w-full text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                          {job.title}
                        </h4>
                        <div className="shrink-0 flex items-center gap-1.5">
                          {job.status === 'AWAITING_REVIEW' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                              <span className="material-symbols-outlined text-[12px]">rate_review</span>
                              Cần duyệt
                            </span>
                          )}
                          {renderJobBadge(job.status)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {(job.courseTitle || job.subject) && (
                          <span className="truncate max-w-[180px] font-medium text-slate-600 dark:text-slate-300">
                            {job.courseTitle || job.subject}
                          </span>
                        )}
                        {job.stage && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {job.stage}
                          </span>
                        )}
                        {job.hasBlockers && (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            • BLOCKER
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right Detail & Draft Review Column */}
            <div className="xl:col-span-8">
              <JobDetailReviewPanel
                jobId={selectedJobId}
                summary={selectedSummary}
                onShowToast={showToast}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Flow B Direct Upload Modal */}
      <DirectUploadModal
        isOpen={isUploadOpen}
        userId={user?.id}
        isSubmitting={uploadMutation.isPending}
        onClose={() => setIsUploadOpen(false)}
        onSubmit={handleDirectUpload}
      />
    </div>
  );
}
