'use client';

import React, { useState, useMemo, useRef } from 'react';
import { MarkdownContent } from '@/components/shared';
import { uploadFile, type UploadedFileResult } from '@/lib/upload';
import type { ClassItem } from '../../schemas/class.schema';
import type { ClassAnnouncement } from '../../schemas/class-detail.schema';
import type { ClassBannerStats } from '../../services/class-detail.service';

interface ClassStreamTabProps {
  classInfo: ClassItem;
  bannerStats?: ClassBannerStats;
  announcements?: ClassAnnouncement[];
  isLoadingAnnouncements?: boolean;
  currentRole: 'student' | 'teacher' | 'owner';
  onNavigateTab: (tab: string) => void;
  onOpenCreateAnnouncement?: () => void;
  onPostAnnouncement?: (payload: { title: string; content: string }) => void;
  onPinAnnouncement?: (announcementId: string, pin: boolean) => void;
  onDeleteAnnouncement?: (announcementId: string) => void;
  isPostingAnnouncement?: boolean;
  onToast: (msg: string) => void;
}

export function ClassStreamTab({
  classInfo,
  bannerStats,
  announcements = [],
  isLoadingAnnouncements = false,
  currentRole,
  onNavigateTab,
  onOpenCreateAnnouncement,
  onPostAnnouncement,
  onPinAnnouncement,
  onDeleteAnnouncement,
  isPostingAnnouncement = false,
  onToast,
}: ClassStreamTabProps) {
  interface QuickAttachmentItem {
    id: string;
    fileName: string;
    status: 'uploading' | 'uploaded' | 'error';
    url?: string;
    errorMessage?: string;
    abortController?: AbortController;
  }

  const [quickPostTitle, setQuickPostTitle] = useState('');
  const [quickPostContent, setQuickPostContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<QuickAttachmentItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUploadingFiles = attachedFiles.some((f) => f.status === 'uploading');
  const hasFailedFiles = attachedFiles.some((f) => f.status === 'error');
  const uploadedFiles = attachedFiles.filter((f) => f.status === 'uploaded' && f.url);

  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [announcements]);

  const handleFileAttachChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const newEntries: Array<{ item: QuickAttachmentItem; file: File; controller: AbortController }> =
      files.map((file) => {
        const controller = new AbortController();
        return {
          file,
          controller,
          item: {
            id: `quick-att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            fileName: file.name,
            status: 'uploading',
            abortController: controller,
          },
        };
      });

    setAttachedFiles((prev) => [...prev, ...newEntries.map((entry) => entry.item)]);

    // Upload all selected files concurrently without blocking each other or subsequent selections
    newEntries.forEach(({ item, file, controller }) => {
      uploadFile(file, 'ilms/announcements', controller.signal)
        .then((res: UploadedFileResult) => {
          setAttachedFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: 'uploaded',
                    url: res.url,
                    fileName: res.originalFilename || f.fileName,
                    abortController: undefined,
                  }
                : f
            )
          );
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) {
            return;
          }
          const msg =
            err instanceof Error ? err.message : 'Tải tệp lên thất bại.';
          setAttachedFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: 'error',
                    errorMessage: msg,
                    abortController: undefined,
                  }
                : f
            )
          );
        });
    });
  };

  const handleRemoveAttachedFile = (id: string) => {
    setAttachedFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.abortController) {
        target.abortController.abort();
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handlePostQuickNotice = () => {
    if (hasUploadingFiles) {
      onToast('Vui lòng chờ tất cả tệp tải lên hoàn tất hoặc hủy tệp đang tải!');
      return;
    }
    if (hasFailedFiles) {
      onToast('Có tệp tải lên thất bại. Vui lòng gỡ tệp lỗi trước khi đăng thông báo!');
      return;
    }

    const title = quickPostTitle.trim();
    const content = quickPostContent.trim();
    if (!title && !content && uploadedFiles.length === 0) {
      onToast('Vui lòng nhập nội dung, tiêu đề hoặc đính kèm tệp!');
      return;
    }

    const attachmentLines =
      uploadedFiles.length > 0
        ? `\n\n**Tệp đính kèm:**\n${uploadedFiles
            .map((f) => `- [${f.fileName}](${f.url})`)
            .join('\n')}`
        : '';

    const finalContent = `${content || title || 'Tài liệu đính kèm lớp học'}${attachmentLines}`;

    if (onPostAnnouncement) {
      onPostAnnouncement({
        title: title || 'Thông báo lớp học',
        content: finalContent,
      });
    } else {
      onToast(`Đã đăng thông báo nhanh tới toàn thể sinh viên lớp ${classInfo.name}!`);
    }
    setQuickPostTitle('');
    setQuickPostContent('');
    setAttachedFiles([]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* =========================================================================
          ROLE-SPECIFIC HEADER SECTION (STUDENT vs TEACHER)
          Zero borders, flat MD3 tonal colors
          ========================================================================= */}

      {/* [STUDENT VIEW] Stream Header Alerts & Metrics */}
      {currentRole === 'student' && (
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Urgent Deadline Banner */}
          <div className="flex-1 p-6 rounded-3xl bg-red-50 dark:bg-[#3C1919] text-red-900 dark:text-[#F28B82] border-none shadow-sm dark:shadow-none flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-[#F28B82] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">alarm</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-[#F28B82]">
                  Hạn chót sắp tới
                </span>
                <span className="text-xs font-medium text-red-800/80 dark:text-[#F28B82]/80">
                  23:59 • Chủ nhật tuần này
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-red-950 dark:text-white truncate mt-1">
                Bài tập lớn 01: Thiết kế mạng phân cụm VLSM &amp; Cấu hình OSPF
              </h2>
              <p className="text-xs sm:text-sm text-red-900/80 dark:text-[#F28B82]/90 mt-1 line-clamp-2">
                Nộp file Cisco Packet Tracer (.pkt) kèm bản báo cáo phân tích bảng routing.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('assignments')}
                  className="px-5 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs transition-all cursor-pointer border-none shadow-xs"
                >
                  Nộp bài ngay
                </button>
                <button
                  type="button"
                  onClick={() => onToast('Mở đề cương bài thực hành Lab định tuyến OSPF')}
                  className="px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-red-950 dark:text-white font-semibold text-xs transition-colors cursor-pointer border-none"
                >
                  Xem đề cương lab
                </button>
              </div>
            </div>
          </div>

          {/* Academic Performance Quick Card */}
          <div className="w-full lg:w-80 p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wider">
                  Tiến độ cá nhân
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-[#A8C7FA]">
                  68%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] overflow-hidden">
                <div
                  className="h-full bg-[#007BFF] dark:bg-[#A8C7FA] rounded-full transition-all duration-500"
                  style={{ width: '68%' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none">
                <div className="text-[11px] font-medium text-gray-500 dark:text-[#8E918F]">
                  GPA Quá trình
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-[#E3E3E3] mt-0.5">
                  8.6<span className="text-xs font-normal text-gray-400 dark:text-[#8E918F]">/10</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none">
                <div className="text-[11px] font-medium text-gray-500 dark:text-[#8E918F]">
                  Chuẩn PLO
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Đạt chuẩn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* [TEACHER VIEW] Quick Actions & Instructor Radar */}
      {(currentRole === 'teacher' || currentRole === 'owner') && (
        <div className="flex flex-col gap-5">
          {/* 4. SIMPLIFY THE QUICK POST INPUT (Single, flat, elevated card) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </div>
                <h2 className="font-semibold text-base text-gray-900 dark:text-[#E3E3E3]">
                  Đăng bảng tin nhanh cho lớp {classInfo.name}
                </h2>
              </div>
              {onOpenCreateAnnouncement && (
                <button
                  type="button"
                  onClick={onOpenCreateAnnouncement}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] text-xs font-medium transition-colors cursor-pointer border-none"
                >
                  <span className="material-symbols-outlined text-[16px]">campaign</span>
                  <span>Soạn thông báo đầy đủ</span>
                </button>
              )}
            </div>

            {/* Flat, borderless subtle background input area */}
            <div className="bg-[#F0F4F8] dark:bg-[#131314] rounded-2xl p-4 mb-4 border-none space-y-2">
              <input
                type="text"
                value={quickPostTitle}
                onChange={(e) => setQuickPostTitle(e.target.value)}
                placeholder="Tiêu đề thông báo hoặc dặn dò cho sinh viên..."
                className="w-full bg-transparent font-semibold text-sm text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none border-none"
              />
              <textarea
                value={quickPostContent}
                onChange={(e) => setQuickPostContent(e.target.value)}
                placeholder="Nội dung chi tiết, yêu cầu chuẩn bị hoặc hướng dẫn bổ sung..."
                rows={2}
                className="w-full bg-transparent text-xs sm:text-sm text-gray-800 dark:text-[#C4C7C5] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none border-none resize-none leading-relaxed"
              />

              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      title={file.errorMessage}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs shadow-xs ${
                        file.status === 'error'
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                          : 'bg-white dark:bg-[#1E1F20] text-gray-800 dark:text-[#E3E3E3]'
                      }`}
                    >
                      {file.status === 'uploading' ? (
                        <span className="w-3.5 h-3.5 border-2 border-blue-600 dark:border-[#A8C7FA] border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : file.status === 'error' ? (
                        <span className="material-symbols-outlined text-[15px] text-rose-600 dark:text-rose-400">
                          error
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400">
                          check_circle
                        </span>
                      )}
                      <span className="max-w-[180px] truncate font-medium">
                        {file.fileName}
                      </span>
                      {file.status === 'uploading' && (
                        <span className="text-[10px] text-blue-600 dark:text-[#A8C7FA] font-medium">
                          Đang tải...
                        </span>
                      )}
                      {file.status === 'error' && (
                        <span className="text-[10px] font-medium">Lỗi</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachedFile(file.id)}
                        className="text-gray-400 hover:text-rose-500 cursor-pointer border-none bg-transparent flex items-center"
                        title={file.status === 'uploading' ? 'Hủy tải lên' : 'Gỡ tệp'}
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileAttachChange}
            />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 text-gray-500 dark:text-[#8E918F]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none inline-flex items-center gap-1"
                  title="Đính kèm một hoặc nhiều tệp tin"
                >
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToast('Thêm liên kết phòng học trực tuyến Zoom/Meet')}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none"
                  title="Đính kèm link bài giảng Zoom/Meet"
                >
                  <span className="material-symbols-outlined text-[20px]">video_camera_front</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToast('Khởi tạo cuộc thăm dò nhanh (Poll) cho lớp')}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none"
                  title="Thêm khảo sát poll nhanh"
                >
                  <span className="material-symbols-outlined text-[20px]">poll</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-[#8E918F]">
                  Gửi tới: <strong className="text-gray-800 dark:text-[#E3E3E3]">Tất cả sinh viên ({classInfo.enrolledCount ?? 0})</strong>
                </span>
                <button
                  type="button"
                  onClick={handlePostQuickNotice}
                  disabled={isPostingAnnouncement || hasUploadingFiles || hasFailedFiles}
                  title={
                    hasUploadingFiles
                      ? 'Vui lòng chờ tệp tải lên hoàn tất'
                      : hasFailedFiles
                        ? 'Vui lòng gỡ tệp tải lỗi trước khi đăng'
                        : undefined
                  }
                  className="px-5 py-2 rounded-full bg-blue-100 dark:bg-[#A8C7FA] text-blue-900 dark:text-[#062E6F] hover:opacity-90 font-semibold text-xs transition-opacity cursor-pointer border-none shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPostingAnnouncement
                    ? 'Đang đăng...'
                    : hasUploadingFiles
                      ? 'Đang tải tệp...'
                      : 'Đăng thông báo'}
                </button>
              </div>
            </div>
          </div>

          {/* 5. REAL METRIC CARDS (Only shown when real data > 0) */}
          {(() => {
            const ungradedCount = classInfo.stats?.ungradedAssignmentsCount ?? 0;
            const pendingRequestsCount = classInfo.stats?.pendingRequestsCount ?? 0;
            const pendingAssignmentsCount = bannerStats?.pendingAssignmentsCount ?? 0;
            const hasAnyAlertCard =
              ungradedCount > 0 || pendingRequestsCount > 0 || pendingAssignmentsCount > 0;

            if (!hasAnyAlertCard) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {ungradedCount > 0 && (
                  <div className="p-5 rounded-3xl bg-amber-50 dark:bg-[#382B14] text-amber-900 dark:text-[#FDD663] border-none shadow-sm dark:shadow-none flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-[#FDD663] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">pending_actions</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-lg font-bold">
                        {ungradedCount} bài nộp
                      </span>
                      <p className="text-xs mt-0.5 opacity-90">
                        Đang chờ giảng viên chấm điểm
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigateTab('assignments')}
                        className="mt-2 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      >
                        Chấm bài ngay &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {pendingRequestsCount > 0 && (
                  <div className="p-5 rounded-3xl bg-red-50 dark:bg-[#3C1919] text-red-900 dark:text-[#F28B82] border-none shadow-sm dark:shadow-none flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-[#F28B82] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">warning</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-lg font-bold">
                        {pendingRequestsCount} yêu cầu
                      </span>
                      <p className="text-xs mt-0.5 opacity-90">
                        Học viên đang chờ phê duyệt vào lớp
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigateTab('people')}
                        className="mt-2 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      >
                        Xem danh sách &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {pendingAssignmentsCount > 0 && (
                  <div className="p-5 rounded-3xl bg-blue-50 dark:bg-[#162B4D]/60 text-blue-900 dark:text-[#A8C7FA] border-none shadow-sm dark:shadow-none flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">forward_to_inbox</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-lg font-bold">
                        Nhắc nhở
                      </span>
                      <p className="text-xs mt-0.5 opacity-90">
                        Có {pendingAssignmentsCount} bài tập / hạn nộp đang mở
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenCreateAnnouncement
                            ? onOpenCreateAnnouncement()
                            : onNavigateTab('assignments')
                        }
                        className="mt-2 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      >
                        Soạn thông báo nhắc &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          SHARED STREAM FEED & SIDEBAR (2 COLS & 1 COL)
          Clean white/charcoal borderless cards (rounded-3xl)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[#E3E3E3]">
              Bảng tin &amp; Thông báo môn học
            </h2>
            <div className="flex items-center gap-1 text-gray-500 dark:text-[#8E918F] text-xs font-medium">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Lọc theo: Mới nhất</span>
            </div>
          </div>

          {/* Real Announcements Feed */}
          {isLoadingAnnouncements ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-36 rounded-3xl bg-white dark:bg-[#1E1F20]" />
              <div className="h-36 rounded-3xl bg-white dark:bg-[#1E1F20]" />
            </div>
          ) : sortedAnnouncements.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F0F4F8] dark:bg-[#282A2C] text-gray-500 dark:text-[#8E918F] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[24px]">campaign</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                Chưa có thông báo nào trong lớp học
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8E918F] max-w-sm mx-auto">
                {currentRole === 'student'
                  ? 'Các thông báo, lịch học và tài liệu từ giảng viên sẽ hiển thị tại đây.'
                  : 'Hãy đăng thông báo đầu tiên để cập nhật lịch học hoặc nhắc nhở sinh viên.'}
              </p>
              {currentRole !== 'student' && onOpenCreateAnnouncement && (
                <button
                  type="button"
                  onClick={onOpenCreateAnnouncement}
                  className="px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] text-xs font-semibold hover:brightness-95 transition-all cursor-pointer border-none"
                >
                  Tạo thông báo mới
                </button>
              )}
            </div>
          ) : (
            sortedAnnouncements.map((ann) => {
              const formattedDate =
                ann.createdAt && !Number.isNaN(new Date(ann.createdAt).getTime())
                  ? new Date(ann.createdAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ann.createdAt;

              return (
                <article
                  key={ann.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] flex items-center justify-center font-bold text-sm">
                        {ann.authorInitials || 'GV'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-[#E3E3E3]">
                            {ann.authorName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] font-semibold text-[10px] uppercase">
                            {ann.authorRole}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-[#8E918F]">
                          {formattedDate}
                          {ann.isPinned ? ' • Đã ghim' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ann.isPinned && (
                        <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-[#FDD663] text-xs font-semibold border-none">
                          Ghim
                        </span>
                      )}
                      {currentRole !== 'student' && onPinAnnouncement && (
                        <button
                          type="button"
                          onClick={() => onPinAnnouncement(ann.id, !ann.isPinned)}
                          title={ann.isPinned ? 'Bỏ ghim thông báo' : 'Ghim thông báo'}
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#282A2C] text-gray-500 dark:text-[#8E918F] cursor-pointer border-none bg-transparent transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {ann.isPinned ? 'keep_off' : 'keep'}
                          </span>
                        </button>
                      )}
                      {currentRole !== 'student' && onDeleteAnnouncement && (
                        <button
                          type="button"
                          onClick={() => onDeleteAnnouncement(ann.id)}
                          title="Xóa thông báo"
                          className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-500 hover:text-rose-600 dark:text-[#8E918F] dark:hover:text-rose-400 cursor-pointer border-none bg-transparent transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {ann.title && (
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                      {ann.title}
                    </h3>
                  )}

                  <MarkdownContent content={ann.content} />
                </article>
              );
            })
          )}
        </div>

        {/* Sidebar Widgets: Calendar & Reference Docs (1 col) */}
        <div className="flex flex-col gap-5">
          {/* Live Session & Lab Scheduler */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-[#E3E3E3]">
                Lịch học tuần này
              </h3>
              <span className="text-xs font-semibold text-blue-600 dark:text-[#A8C7FA] bg-[#E1E5EA] dark:bg-[#282A2C] px-3 py-1 rounded-full">
                Tuần 09
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex items-start gap-3.5">
                <div className="px-3 py-2 rounded-2xl bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] font-bold text-center text-xs shrink-0 whitespace-nowrap">
                  <div>T5</div>
                  <div className="text-[10px] font-normal">24/10</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-gray-900 dark:text-[#E3E3E3] truncate">
                    Thực hành Lab Định tuyến OSPF
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-[#8E918F] mt-0.5 whitespace-nowrap">
                    07:30 - 11:30 • Lab B1-204
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex items-start gap-3.5">
                <div className="px-3 py-2 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] font-bold text-center text-xs shrink-0 whitespace-nowrap">
                  <div>T7</div>
                  <div className="text-[10px] font-normal">26/10</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-gray-900 dark:text-[#E3E3E3] truncate">
                    Q&amp;A Trực tuyến với Trợ giảng AI
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-[#8E918F] mt-0.5 whitespace-nowrap">
                    19:30 - 21:00 • Virtual Room 02
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fast Links & Reference Materials */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-[#E3E3E3]">
              Kho tài liệu chuẩn
            </h3>

            <div className="flex flex-col gap-2 text-xs">
              <button
                type="button"
                onClick={() => onToast('Đang mở giáo trình Kurose & Ross 8th Edition...')}
                className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-80 border-none flex items-center justify-between text-gray-800 dark:text-[#C4C7C5] transition-opacity text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[18px]">
                    menu_book
                  </span>
                  Giáo trình Kurose &amp; Ross 8th
                </span>
                <span className="material-symbols-outlined text-gray-400 dark:text-[#8E918F] text-[16px]">
                  open_in_new
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToast('Đang tải Cisco IOS Command Cheatsheet (.pdf)...')}
                className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-80 border-none flex items-center justify-between text-gray-800 dark:text-[#C4C7C5] transition-opacity text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[18px]">
                    terminal
                  </span>
                  Cisco IOS Command Cheatsheet
                </span>
                <span className="material-symbols-outlined text-gray-400 dark:text-[#8E918F] text-[16px]">
                  download
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToast('Mở kho Github mẫu C/C++ Sockets Programming')}
                className="p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-80 border-none flex items-center justify-between text-gray-800 dark:text-[#C4C7C5] transition-opacity text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[18px]">code</span>
                  Kho Github mẫu C/C++ Sockets
                </span>
                <span className="material-symbols-outlined text-gray-400 dark:text-[#8E918F] text-[16px]">code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
