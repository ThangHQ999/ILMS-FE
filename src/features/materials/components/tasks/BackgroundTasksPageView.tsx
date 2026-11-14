'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useMaterialsTasks } from '../../hooks/useMaterialsTasks';
import type { MaterialBackgroundTask } from '../../schemas/materials-tasks.schema';
import { PipelineSettingsCard } from './PipelineSettingsCard';
import { TaskTerminalLogModal } from './TaskTerminalLogModal';

export function BackgroundTasksPageView() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Banner dismiss state
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'processing' | 'queued' | 'success'>('all');

  // Terminal Log Modal
  const [selectedTaskForLogs, setSelectedTaskForLogs] = useState<MaterialBackgroundTask | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Hook data & actions
  const {
    tasks,
    isLoading,
    isRefetching,
    refetch,
    isAllPaused,
    handleTogglePauseAll,
    settings,
    updateSettings,
    resetSettings,
    clusterMetrics,
    activeCount,
    queuedCount,
    completedCount,
    failedCount,
    retryMutation,
    uploadMutation,
    togglePauseMutation,
    boostPriorityMutation,
    removeTaskMutation,
  } = useMaterialsTasks();

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (activeFilter === 'processing') return t.status === 'PROCESSING' || t.status === 'PAUSED';
      if (activeFilter === 'queued') return t.status === 'QUEUED';
      if (activeFilter === 'success') return t.status === 'SUCCESS';
      return true;
    });
  }, [tasks, activeFilter]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);
    form.append('title', file.name);
    form.append('subject', 'Học liệu tải lên mới');

    uploadMutation.mutate(form, {
      onSuccess: () => {
        showToast(`Đã đưa tệp "${file.name}" vào hàng đợi xử lý AI!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: () => {
        showToast('Có lỗi xảy ra khi tải tệp lên.');
      },
    });
  };

  const handleRetryFailed = (taskId: string) => {
    retryMutation.mutate(taskId, {
      onSuccess: () => {
        showToast('Đang khởi động lại tiến trình với AI khử nhiễu nâng cao!');
      },
    });
  };

  const handleBoost = (task: MaterialBackgroundTask) => {
    boostPriorityMutation.mutate(task.id, {
      onSuccess: () => {
        showToast(`Đã ưu tiên cấp phát GPU tức thì cho "${task.filename}"!`);
      },
    });
  };

  const handleRemove = (task: MaterialBackgroundTask) => {
    removeTaskMutation.mutate(task.id, {
      onSuccess: () => {
        showToast(`Đã xóa "${task.filename}" khỏi hàng đợi.`);
      },
    });
  };

  const handleTogglePause = (task: MaterialBackgroundTask) => {
    togglePauseMutation.mutate(task.id, {
      onSuccess: () => {
        showToast(
          task.status === 'PAUSED'
            ? `Đã tiếp tục tiến trình "${task.filename}".`
            : `Đã tạm dừng tiến trình "${task.filename}".`
        );
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Hidden file input for upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.pptx,.ppt,.docx,.doc,.mp4,.zip"
      />

      {/* Sidebar Navigation */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Header Navigation */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
        userFullName="TS. Nguyễn Văn An"
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-8 max-w-7xl w-full mx-auto ${
          isFocusMode
            ? 'pl-24'
            : isSidebarCollapsed
            ? 'pl-24'
            : 'lg:pl-[284px]'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Top Breadcrumbs & Header Strip */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Link
                  href="/materials"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Kho học liệu
                </Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">
                  Quản lý tiến trình xử lý ngầm (Background AI Queue)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Hàng đợi &amp; Tiến trình Xử lý AI Học liệu
                </h1>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200/60 dark:border-blue-900/40">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                  </span>
                  <span>Đồng bộ đám mây thời gian thực (Cloud Persistent Sync)</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                Tiến trình chạy độc lập trên máy chủ AI Cloud phân tán. Giảng viên có thể đóng trình duyệt hoặc tắt máy mà không làm gián đoạn quá trình bóc tách OCR, sinh Bloom-Quiz và cập nhật Đồ thị tri thức (Knowledge Graph).
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start xl:self-center">
              <button
                type="button"
                onClick={() => {
                  document.getElementById('settings-panel')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                  tune
                </span>
                <span>Cấu hình AI thông minh</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  refetch();
                  showToast('Đã làm mới danh sách tiến trình AI từ máy chủ');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all cursor-pointer group"
              >
                <span
                  className={`material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400 ${
                    isRefetching ? 'animate-spin' : 'group-hover:rotate-180'
                  } transition-transform duration-500`}
                >
                  sync
                </span>
                <span>Làm mới (Live Polling)</span>
              </button>

              <button
                type="button"
                onClick={handleTogglePauseAll}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border shadow-xs transition-all cursor-pointer ${
                  isAllPaused
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAllPaused ? 'play_circle' : 'pause_circle'}
                </span>
                <span>{isAllPaused ? 'Tiếp tục hàng đợi' : 'Tạm dừng tất cả'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>+ Tải lên tệp mới</span>
              </button>
            </div>
          </div>

          {/* Persistent Storage Info Banner */}
          {!isBannerDismissed && (
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Cơ chế lưu trữ ngoại tuyến &amp; khôi phục bền vững (Persistent Worker)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200/60 dark:border-blue-900/40">
                        Worker v4.2 Online
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Dữ liệu trạng thái được lưu liên tục vào LocalStorage + Cloud Database. Khi bạn mở lại trang trên bất kỳ thiết bị nào, toàn bộ tiến trình, lịch sử bóc tách và thông báo sẽ được phục hồi tức thì.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      Node: {clusterMetrics.nodeId}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Độ trễ AI Queue: {clusterMetrics.latencyMs}ms
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBannerDismissed(true)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Đóng thông báo"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* KPI 1: Active */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Đang xử lý (Active)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                      {String(activeCount).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      tệp song song
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px] animate-spin" style={{ animationDuration: '4s' }}>
                    cycle
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-[16px]">speed</span>
                  14.5 trang / phút
                </span>
                <span className="font-mono text-[11px]">OCR &amp; Graph Core</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />
            </div>

            {/* KPI 2: Queued */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Trong hàng đợi (Queued)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                      {String(queuedCount).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      chờ điều phối
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">queue</span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Ước tính: ~4p 20s
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-medium">
                  FIFO Mode
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* KPI 3: Completed */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hoàn tất gần đây
                  </span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                      {completedCount}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      học liệu
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  98.6% độ chính xác
                </span>
                <span className="font-mono text-[11px]">Đã lập chỉ mục</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
            </div>

            {/* KPI 4: Failed */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    Cần xem xét (Failed)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">
                      {String(failedCount).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      lỗi scan mờ
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">error_outline</span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const failed = tasks.find((t) => t.status === 'FAILED');
                    if (failed) handleRetryFailed(failed.id);
                  }}
                  className="font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  Thử lại với AI nâng cao
                </button>
                <span className="font-mono text-[11px] text-slate-400">PDF #SCAN-91</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500" />
            </div>
          </div>

          {/* Main 2-Column Grid (8 cols left / 4 cols right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Tasks List (8 cols) */}
            <div className="xl:col-span-8 flex flex-col gap-5">
              {/* Filter and Auto-Refresh Strip */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả tiến trình ({tasks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('processing')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeFilter === 'processing'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Đang chạy ({activeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('queued')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeFilter === 'queued'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Chờ xếp lượt ({queuedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('success')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeFilter === 'success'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Hoàn tất ({tasks.filter((t) => t.status === 'SUCCESS').length})
                  </button>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Tự động cập nhật mỗi:
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
                    2.5s
                  </span>
                </div>
              </div>

              {/* Tasks List Items */}
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
                  <span className="material-symbols-outlined text-[36px] text-slate-400">
                    hourglass_empty
                  </span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Không có tiến trình nào trong danh mục này
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isActive = task.status === 'PROCESSING' || task.status === 'PAUSED';
                  const isQueued = task.status === 'QUEUED';
                  const isSuccess = task.status === 'SUCCESS';
                  const isFailed = task.status === 'FAILED';

                  const fileIcon =
                    task.fileType === 'pdf'
                      ? 'picture_as_pdf'
                      : task.fileType === 'pptx'
                      ? 'co_present'
                      : task.fileType === 'docx'
                      ? 'description'
                      : task.fileType === 'mp4'
                      ? 'video_file'
                      : 'insert_drive_file';

                  const iconColor =
                    task.fileType === 'pdf'
                      ? 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-900/40'
                      : task.fileType === 'pptx'
                      ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40'
                      : task.fileType === 'docx'
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/40'
                      : 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-900/40';

                  return (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4 transition-all hover:shadow-md"
                    >
                      {/* Task Header: File info & actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${iconColor}`}
                          >
                            <span className="material-symbols-outlined text-[26px]">
                              {fileIcon}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight break-all">
                                {task.filename}
                              </h3>
                              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {task.size}
                              </span>
                              {isQueued && task.queuePosition && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                                  Hàng đợi #{task.queuePosition}
                                </span>
                              )}
                              {isSuccess && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-900/40">
                                  <span className="material-symbols-outlined text-[14px]">check</span>
                                  Hoàn tất 100%
                                </span>
                              )}
                              {isFailed && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-bold flex items-center gap-1 border border-red-200/60 dark:border-red-900/40">
                                  <span className="material-symbols-outlined text-[14px]">error</span>
                                  Lỗi xử lý
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {task.courseCode && (
                                <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                                  <span className="material-symbols-outlined text-[15px]">
                                    folder_special
                                  </span>
                                  {task.courseCode}: {task.courseName}
                                </span>
                              )}
                              {task.courseCode && <span>•</span>}
                              {task.uploadedBy && <span>Người tải: {task.uploadedBy}</span>}
                              {task.uploadedAt && (
                                <>
                                  <span>•</span>
                                  <span>{task.uploadedAt}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                          <button
                            type="button"
                            onClick={() => setSelectedTaskForLogs(task)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            title="Xem nhật ký AI Realtime"
                          >
                            <span className="material-symbols-outlined text-[18px]">terminal</span>
                          </button>

                          {isActive && (
                            <button
                              type="button"
                              onClick={() => handleTogglePause(task)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                              title={task.status === 'PAUSED' ? 'Tiếp tục' : 'Tạm dừng'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {task.status === 'PAUSED' ? 'play_arrow' : 'pause'}
                              </span>
                            </button>
                          )}

                          {isQueued && (
                            <button
                              type="button"
                              onClick={() => handleBoost(task)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 border border-blue-200/60 dark:border-blue-900/40 transition-colors"
                              title="Ưu tiên chạy ngay (Boost Priority)"
                            >
                              <span className="material-symbols-outlined text-[16px]">bolt</span>
                              <span>Ưu tiên</span>
                            </button>
                          )}

                          {!isSuccess && (
                            <button
                              type="button"
                              onClick={() => handleRemove(task)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/80 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title={isQueued ? 'Hủy xếp hàng' : 'Hủy bỏ'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {isQueued ? 'close' : 'delete_outline'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Feature Tags Strip */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {task.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 border border-blue-200/40 dark:border-blue-900/30"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                auto_awesome
                              </span>
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Progress meter for Active tasks */}
                      {isActive && (
                        <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-4 flex flex-col gap-2 border border-slate-200/60 dark:border-slate-800/80">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {task.currentStep || 'Đang bóc tách dữ liệu AI...'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {task.conceptsFound && (
                                <span className="text-slate-500 dark:text-slate-400">
                                  Đã tìm thấy{' '}
                                  <strong className="text-slate-800 dark:text-slate-200 font-bold">
                                    {task.conceptsFound} concepts
                                  </strong>
                                </span>
                              )}
                              {task.quizQuestionsGenerated && (
                                <span className="text-slate-500 dark:text-slate-400">
                                  Đã tạo{' '}
                                  <strong className="text-slate-800 dark:text-slate-200 font-bold">
                                    {task.quizQuestionsGenerated}/{task.quizQuestionsTotal} câu hỏi
                                  </strong>
                                </span>
                              )}
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                {task.progressPercent}%
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${task.progressPercent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                            <span className="font-mono text-[11px]">
                              {task.tokensProcessed
                                ? `Token Stream: ${task.tokensProcessed.toLocaleString()} / ${task.tokensTotal?.toLocaleString()} tokens`
                                : task.validationText || 'Đang xác thực cú pháp và cấu trúc'}
                            </span>
                            {task.etaSeconds && (
                              <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 text-[11px]">
                                <span className="material-symbols-outlined text-[13px]">
                                  timer
                                </span>
                                <span>Dự kiến còn {task.etaSeconds} giây</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Queued condition box */}
                      {isQueued && (
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">
                              hourglass_top
                            </span>
                            <span>{task.queueCondition || 'Chờ slot GPU rảnh từ cụm cluster'}</span>
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {task.queueEtaText || 'Ước tính: ~2 phút'}
                          </span>
                        </div>
                      )}

                      {/* Completed actions */}
                      {isSuccess && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {task.completedSummary || 'Đã xuất bản thành công vào Đồ thị tri thức'}
                          </span>
                          <div className="flex items-center gap-2">
                            <Link
                              href="/knowledge-graph"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                                hub
                              </span>
                              <span>Xem trên Đồ thị</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                showToast(`Đang tải báo cáo bóc tách cho ${task.filename}...`)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                download
                              </span>
                              <span>Tải báo cáo</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Failed error box */}
                      {isFailed && (
                        <div className="bg-red-50 dark:bg-red-950/40 rounded-xl p-3.5 border border-red-200/80 dark:border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                            <span className="material-symbols-outlined text-[18px]">warning</span>
                            <span>{task.errorMessage || 'Lỗi bóc tách văn bản scan mờ'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRetryFailed(task.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shrink-0 self-end sm:self-auto"
                          >
                            Thử lại ngay
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* RIGHT COLUMN: AI Smart Processing Pipeline Settings (4 cols sticky) */}
            <div className="xl:col-span-4">
              <PipelineSettingsCard
                settings={settings}
                clusterMetrics={clusterMetrics}
                onUpdateSettings={updateSettings}
                onResetSettings={resetSettings}
                onToast={showToast}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Terminal Log Modal */}
      <TaskTerminalLogModal
        task={selectedTaskForLogs}
        isOpen={Boolean(selectedTaskForLogs)}
        onClose={() => setSelectedTaskForLogs(null)}
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 dark:bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md border border-slate-700/60 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <span className="material-symbols-outlined text-blue-400 text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
