'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { ClassAnnouncement } from '@/features/classes/schemas/class-detail.schema';
import {
  saveLocalAnnouncement,
  getLocalAnnouncements,
} from '@/features/classes/services/class-detail.service';

interface ClassAnnouncementsTabProps {
  classId?: string;
  announcements?: ClassAnnouncement[];
  currentRole?: 'owner' | 'teacher';
  onPublishAnnouncement?: (announcement: ClassAnnouncement) => void;
  onPostClick?: () => void;
  onToast?: (message: string) => void;
}

export function ClassAnnouncementsTab({
  classId,
  announcements: initialAnnouncements = [],
  currentRole = 'owner',
  onPublishAnnouncement,
  onPostClick,
  onToast,
}: ClassAnnouncementsTabProps) {
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>(initialAnnouncements);

  // Sync state when initialAnnouncements prop updates from server/query
  useEffect(() => {
    if (initialAnnouncements && initialAnnouncements.length > 0) {
      setAnnouncements(initialAnnouncements);
    }
  }, [initialAnnouncements]);

  // Sync locally stored announcements on mount (persists across F5/refresh)
  useEffect(() => {
    if (!classId) return;
    const localItems = getLocalAnnouncements(classId);
    if (localItems.length > 0) {
      setAnnouncements((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newOnes = localItems.filter((a) => !existingIds.has(a.id));
        if (newOnes.length > 0) {
          return [...newOnes, ...prev];
        }
        return prev;
      });
    }
  }, [classId]);

  // Filter states
  const [feedFilter, setFeedFilter] = useState<'all' | 'pinned' | 'attachment'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');

  // Quick Composer State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPinned, setIsPinned] = useState(true);
  const [isPushEmail, setIsPushEmail] = useState(true);
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Cấu trúc dữ liệu & Giải thuật');
  const [hasAttachment, setHasAttachment] = useState(false);

  // Poll state (interactive voting)
  const [userVotedOption, setUserVotedOption] = useState<string | null>(null);
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({
    'opt-a': 24,
    'opt-b': 8,
    'opt-c': 3,
  });

  // Modal / Drawer state for viewing read report
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // 1. Feed tab filter
      if (feedFilter === 'pinned' && !item.isPinned) return false;
      if (feedFilter === 'attachment' && (!item.attachments || item.attachments.length === 0)) {
        return false;
      }

      // 2. Subject filter
      if (selectedSubjectFilter !== 'ALL') {
        const text = (item.title + ' ' + item.content + ' ' + (item.tag || '')).toLowerCase();
        if (selectedSubjectFilter === 'csdl' && !text.includes('cơ sở dữ liệu') && !text.includes('csdl')) {
          return false;
        }
        if (selectedSubjectFilter === 'ctdl' && !text.includes('cấu trúc') && !text.includes('giải thuật') && !text.includes('tree')) {
          return false;
        }
        if (selectedSubjectFilter === 'web' && !text.includes('web') && !text.includes('frontend')) {
          return false;
        }
      }

      return true;
    });
  }, [announcements, feedFilter, selectedSubjectFilter]);

  // Handle post new announcement
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      notify('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.');
      return;
    }

    const created: ClassAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      authorName: currentRole === 'owner' ? 'TS. Lê Hoàng Nam' : 'TS. Nguyễn Văn An',
      authorRole: currentRole === 'owner' ? 'Giảng viên Chủ nhiệm' : 'Giảng viên',
      authorInitials: currentRole === 'owner' ? 'LN' : 'AN',
      authorColor: 'bg-primary text-on-primary',
      createdAt: 'Vừa xong',
      isPinned,
      pinBadge: isPinned ? 'ĐÃ GHIM - MỚI' : undefined,
      badgeType: isPinned ? 'error' : 'secondary',
      tag: selectedTag,
      readCount: 1,
      totalStudents: 42,
      readPercent: 2,
      commentsCount: 0,
      attachments: hasAttachment
        ? [
            {
              name: 'Tai_Lieu_Huong_Dan_Moi.pdf',
              size: '1.5 MB',
              desc: 'Tài liệu hướng dẫn đính kèm theo thông báo',
              type: 'pdf',
            },
          ]
        : undefined,
    };

    // Save to localStorage for persistence across page refresh
    if (classId) {
      saveLocalAnnouncement(classId, created);
    }

    setAnnouncements((prev) => [created, ...prev]);
    onPublishAnnouncement?.(created);
    setNewTitle('');
    setNewContent('');
    setHasAttachment(false);

    notify(
      isPushEmail
        ? 'Đã đăng thông báo và gửi Push Notification/Email tới 42 sinh viên!'
        : 'Đã đăng thông báo mới lên bảng tin lớp thành công!'
    );
  };

  // Poll Vote Handler
  const handleVotePoll = (optionId: string) => {
    if (userVotedOption === optionId) return;

    setPollVotes((prev) => {
      const next = { ...prev };
      if (userVotedOption) {
        next[userVotedOption] = Math.max(0, next[userVotedOption] - 1);
      }
      next[optionId] = (next[optionId] || 0) + 1;
      return next;
    });

    setUserVotedOption(optionId);
    notify('Đã ghi nhận lượt bình chọn của bạn thành công!');
  };

  const totalPollVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HERO HEADER BANNER ĐỒNG BỘ */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#162744] to-blue-900 shadow-xl text-white p-5 sm:p-7">
        <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 w-60 h-60 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
              Bảng tin &amp; Thông báo Lớp học
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-600/40 text-blue-200 border border-blue-400/40 font-semibold tracking-wider">
              CNTT-K22-01
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 backdrop-blur-sm">
              Học kỳ II • 2024 - 2025
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 backdrop-blur-sm">
              GVCN: TS. Nguyễn Văn An
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              42 sinh viên ghi danh
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                document.getElementById('quick-composer')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">add_circle</span>
              <span>+ Tạo thông báo mới</span>
            </button>
            <button
              type="button"
              onClick={() => notify('Đã mở hộp thoại lên lịch phát tin tự động')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">schedule_send</span>
              <span>Lên lịch phát tin</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN GRID (Feed 8 cols vs Widgets 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Announcements Feed & Quick Composer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Quick Announcement Composer */}
          <section
            id="quick-composer"
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    Tạo thông báo nhanh cho cả lớp
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Truyền đạt thông điệp, tài liệu kiểm tra hoặc thông báo đột xuất tức thời
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Markdown hỗ trợ
              </span>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="flex flex-col gap-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tiêu đề thông báo quan trọng (ví dụ: Thay đổi lịch thi, bài tập lớn)..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />

              <div className="relative">
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Nhập chi tiết nội dung thông báo gửi đến 42 sinh viên lớp CNTT-K22-01. Bạn có thể chèn liên kết bài tập hoặc tag môn học liên quan..."
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                />

                {/* Quick Composer Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setHasAttachment(!hasAttachment);
                        notify(
                          !hasAttachment
                            ? 'Đã đính kèm tệp PDF: Tai_Lieu_Huong_Dan_Moi.pdf'
                            : 'Đã gỡ tệp đính kèm.'
                        );
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        hasAttachment
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Đính kèm tài liệu PDF / Slide"
                    >
                      <span className="material-symbols-outlined text-[17px]">attach_file</span>
                      <span>{hasAttachment ? 'Đã đính kèm PDF (1)' : 'Đính kèm PDF/Slide'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => notify('Đã chèn liên kết Quiz 05 vào nội dung bài đăng')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                      title="Chèn link bài tập Quiz"
                    >
                      <span className="material-symbols-outlined text-[17px]">add_link</span>
                      <span>Link bài tập Quiz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const tags = [
                          'Cấu trúc dữ liệu & Giải thuật',
                          'Cơ sở dữ liệu nâng cao',
                          'Lập trình Web chuyên sâu',
                        ];
                        const next =
                          tags[(tags.indexOf(selectedTag) + 1) % tags.length] || tags[0];
                        setSelectedTag(next);
                        notify(`Đã chuyển môn học liên kết sang: ${next}`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                      title="Gán thẻ môn học"
                    >
                      <span className="material-symbols-outlined text-[17px]">sell</span>
                      <span>Gán môn học</span>
                    </button>
                  </div>

                  {/* Selected Tag Chip Preview */}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
                    <span className="material-symbols-outlined text-[13px]">tag</span>
                    <span>{selectedTag}</span>
                  </span>
                </div>
              </div>

              {/* Publishing Checkbox Options */}
              <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-rose-500">
                        push_pin
                      </span>
                      <span>Ghim lên đầu bảng tin</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPushEmail}
                      onChange={(e) => setIsPushEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">
                        mark_email_read
                      </span>
                      <span>Push &amp; Email cho 42 SV</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>Lên lịch hẹn giờ</span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <span>Đăng thông báo ngay</span>
                  <span className="material-symbols-outlined text-[17px]">rocket_launch</span>
                </button>
              </div>
            </form>
          </section>

          {/* Announcement Stream / Timeline Feed Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Dòng thời gian thông báo
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                {filteredAnnouncements.length} bản tin
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1 hidden sm:inline">Lọc:</span>
              <button
                type="button"
                onClick={() => setFeedFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  feedFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFeedFilter('pinned')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  feedFilter === 'pinned'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Đã ghim
              </button>
              <button
                type="button"
                onClick={() => setFeedFilter('attachment')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  feedFilter === 'attachment'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Có file đính kèm
              </button>
            </div>
          </div>

          {/* Announcement Stream Items */}
          <div className="space-y-4">
            {filteredAnnouncements.map((item) => {
              const isErrorTheme = item.badgeType === 'error';
              const isPoll = Boolean(item.poll);
              const isArchived = Boolean(item.isArchived);

              return (
                <article
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4 relative overflow-hidden transition-all ${
                    isArchived ? 'opacity-85 hover:opacity-100' : ''
                  }`}
                >
                  {/* Left Accent Bar */}
                  {item.isPinned && (
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isErrorTheme ? 'bg-rose-500' : 'bg-blue-600'
                      }`}
                    />
                  )}

                  {/* Header badge & Poster info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-900 dark:bg-blue-950 text-white flex items-center justify-center font-bold text-sm shadow-xs border border-slate-800 shrink-0">
                        {item.authorInitials || 'AN'}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {item.authorName}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.authorRole}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          {item.createdAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isPinned && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isErrorTheme
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">push_pin</span>
                          <span>{item.pinBadge || 'ĐÃ GHIM'}</span>
                        </span>
                      )}

                      {isArchived && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          Lưu trữ
                        </span>
                      )}

                      {isPoll && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                          Đã thu thập {totalPollVotes} lượt vote
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => notify(`Tác vụ bổ sung cho bài viết: "${item.title}"`)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[19px]">more_vert</span>
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.content}
                    </p>

                    {/* Due Date Highlight Pill if applicable */}
                    {item.dueText && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold">
                          <span className="material-symbols-outlined text-[18px]">timer</span>
                          <span>{item.dueText}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => notify('Đang chuyển hướng tới Cổng nộp bài tập Lab 04...')}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Xem cổng nộp →
                        </button>
                      </div>
                    )}

                    {/* Attachments Section */}
                    {item.attachments && item.attachments.length > 0 && (
                      <div
                        className={
                          item.attachments.length > 1
                            ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1'
                            : 'pt-1'
                        }
                      >
                        {item.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  att.type === 'pdf'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                                    : att.type === 'pptx'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                                    : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {att.type === 'pdf'
                                    ? 'picture_as_pdf'
                                    : att.type === 'pptx'
                                    ? 'slideshow'
                                    : 'terminal'}
                                </span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {att.name}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate">
                                  {att.size} • {att.desc || 'Tài liệu đính kèm'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => notify(`Đang tải xuống tệp: ${att.name}`)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold text-[11px] border border-slate-200 dark:border-slate-600 shadow-2xs transition-colors shrink-0 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">download</span>
                              <span>Tải xuống</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interactive Poll Section */}
                    {item.poll && (
                      <div className="flex flex-col gap-2 pt-1">
                        {item.poll.options.map((opt) => {
                          const votes = pollVotes[opt.id] ?? opt.votes;
                          const percent =
                            totalPollVotes > 0
                              ? Math.round((votes / totalPollVotes) * 1000) / 10
                              : 0;
                          const isVoted = userVotedOption === opt.id;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleVotePoll(opt.id)}
                              className={`p-3 rounded-xl border flex flex-col gap-1 relative overflow-hidden text-left transition-all cursor-pointer ${
                                isVoted
                                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/40'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                              }`}
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-blue-600/15 dark:bg-blue-400/15 transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                              <div className="relative z-10 flex items-center justify-between text-xs">
                                <span
                                  className={`font-semibold ${
                                    isVoted
                                      ? 'text-blue-700 dark:text-blue-300 font-bold'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {opt.label}
                                </span>
                                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                                  {votes} phiếu ({percent}%)
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{item.poll.deadlineText}</span>
                          <button
                            type="button"
                            onClick={() => setIsReportModalOpen(true)}
                            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                          >
                            Xem danh sách sinh viên đã chọn →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Engagement Footer */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {/* Read count */}
                        {item.readCount !== undefined && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                            <span className="material-symbols-outlined text-[15px] text-emerald-600">
                              visibility
                            </span>
                            <span>
                              {item.readCount}/{item.totalStudents || 42} sinh viên đã đọc
                            </span>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white ml-0.5">
                              {item.readPercent || 95}%
                            </span>
                          </div>
                        )}

                        {/* Comments count */}
                        {item.commentsCount !== undefined && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedCommentsId(
                                expandedCommentsId === item.id ? null : item.id
                              )
                            }
                            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              chat_bubble
                            </span>
                            <span>{item.commentsCount} bình luận trao đổi</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            notify(
                              `Đã gửi thông báo nhắc nhở các bạn sinh viên chưa đọc: "${item.title}"`
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Gửi nhắc nhở các bạn chưa đọc"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            notification_important
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            notify('Đã sao chép liên kết thông báo vào bộ nhớ đệm!');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Sao chép liên kết thông báo"
                        >
                          <span className="material-symbols-outlined text-[18px]">share</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Comment Thread (Expanded) */}
                    {expandedCommentsId === item.id && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3 animate-fadeIn text-xs">
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          Bình luận trao đổi ({item.commentsCount || 0}):
                        </div>
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              TM
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  Trần Nhật Minh (Lớp trưởng)
                                </span>
                                <span className="text-[10px] text-slate-400">1 giờ trước</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                                Em đã nhận được đề cương và thông báo lại cho toàn thể các bạn trong nhóm thực hành ạ!
                              </p>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              HY
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  Lê Hoàng Yến
                                </span>
                                <span className="text-[10px] text-slate-400">35 phút trước</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                                Thầy cho em hỏi phần xoay kép LR và RL có trong bài tập thực hành máy không ạ?
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Comment input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Viết phản hồi gửi tới sinh viên..."
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                notify('Đã gửi phản hồi vào luồng thảo luận!');
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => notify('Đã gửi phản hồi vào luồng thảo luận!')}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
                          >
                            Gửi
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Analytics & Urgent Dispatch Widgets (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Widget 1: Thống kê tương tác thông báo */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">
                  insights
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Thống kê tương tác bảng tin
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">30 ngày qua</span>
            </div>

            {/* Big Stat KPI with Circular Ring Meter */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tỷ lệ sinh viên đọc trung bình
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                    92.4%
                  </span>
                  <span className="text-xs text-emerald-600 flex items-center font-bold">
                    <span className="material-symbols-outlined text-[15px]">trending_up</span>
                    <span>+3.8%</span>
                  </span>
                </div>
              </div>

              {/* Inline Ring Meter Visual */}
              <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-700"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-blue-600 dark:text-blue-400"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="92.4, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <span className="absolute font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200">
                  42 SV
                </span>
              </div>
            </div>

            {/* Metric Details */}
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-slate-400 text-[17px]">
                    schedule
                  </span>
                  <span>Khung giờ đọc nhiều nhất:</span>
                </div>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  20:00 - 22:00
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-slate-400 text-[17px]">
                    speed
                  </span>
                  <span>Tốc độ xem tin sau khi đăng:</span>
                </div>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  ~ 42 phút
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-slate-400 text-[17px]">
                    mark_email_unread
                  </span>
                  <span>SV thường xuyên trễ tin:</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  2 bạn
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Xem báo cáo chi tiết từng cá nhân →
            </button>
          </section>

          {/* Widget 2: Kênh liên lạc khẩn cấp & Ban cán sự */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 text-[22px]">
                  contact_emergency
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Kênh liên lạc khẩn cấp
                </h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Trực tuyến" />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Các đường dây nóng hỗ trợ xử lý sự cố phòng máy, xin vắng có phép hoặc trao đổi tức thời ngoài giờ học.
            </p>

            {/* Channel Links */}
            <div className="flex flex-col gap-2">
              {/* Zalo */}
              <button
                type="button"
                onClick={() => notify('Đang mở nhóm Zalo hỗ trợ kỹ thuật CNTT-K22')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950 border border-slate-200/70 dark:border-slate-700 transition-colors flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    Z
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                      Nhóm Zalo CNTT-K22
                    </span>
                    <span className="text-[11px] text-slate-400">
                      42/42 thành viên • Ban cán sự trực
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-[18px]">
                  arrow_outward
                </span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => notify('Đang mở Telegram Alert Bot push thông báo')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950 border border-slate-200/70 dark:border-slate-700 transition-colors flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[19px]">near_me</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                      Telegram Alert Bot
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tự động push thông báo lab
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-[18px]">
                  arrow_outward
                </span>
              </button>
            </div>

            {/* Hotline Ban Cán Sự Lớp */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Đại diện Ban cán sự lớp
              </span>

              {/* Lớp trưởng */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                    TM
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Trần Nhật Minh
                    </span>
                    <span className="text-[11px] text-slate-400">Lớp trưởng • 0982.112.xxx</span>
                  </div>
                </div>
                <a
                  href="tel:0982112888"
                  onClick={(e) => {
                    e.preventDefault();
                    notify('Đang gọi điện cho Lớp trưởng Trần Nhật Minh: 0982.112.888');
                  }}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-colors border border-slate-200 dark:border-slate-600"
                  title="Gọi điện"
                >
                  <span className="material-symbols-outlined text-[17px]">call</span>
                </a>
              </div>

              {/* Lớp phó */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                    MA
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Nguyễn Mai Anh
                    </span>
                    <span className="text-[11px] text-slate-400">Lớp phó Học tập • 0914.332.xxx</span>
                  </div>
                </div>
                <a
                  href="tel:0914332999"
                  onClick={(e) => {
                    e.preventDefault();
                    notify('Đang gọi điện cho Lớp phó Nguyễn Mai Anh: 0914.332.999');
                  }}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-colors border border-slate-200 dark:border-slate-600"
                  title="Gọi điện"
                >
                  <span className="material-symbols-outlined text-[17px]">call</span>
                </a>
              </div>
            </div>
          </section>

          {/* Widget 3: Quick Filter by Subject / Tag */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Lọc theo học phần phụ trách
            </h4>
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedSubjectFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tất cả học phần
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('ctdl')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedSubjectFilter === 'ctdl'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Cấu trúc Dữ liệu &amp; Giải thuật (K22)
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('csdl')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedSubjectFilter === 'csdl'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Cơ sở dữ liệu nâng cao
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('web')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedSubjectFilter === 'web'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Lập trình Web chuyên sâu
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 3. MODAL BÁO CÁO TƯƠNG TÁC TỪNG CÁ NHÂN */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">insights</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Báo cáo tỷ lệ đọc thông báo lớp
                  </h3>
                  <p className="text-xs text-slate-500">Chi tiết tương tác 42 sinh viên lớp CNTT-K22-01</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {[
                { name: 'Trần Nhật Minh', code: '22028192', read: true, time: '2 phút sau khi đăng' },
                { name: 'Nguyễn Tuấn Anh', code: '22028195', read: true, time: '14 phút sau khi đăng' },
                { name: 'Lê Hoàng Yến', code: '22028198', read: true, time: '28 phút sau khi đăng' },
                { name: 'Đỗ Minh Châu', code: '22028210', read: true, time: '45 phút sau khi đăng' },
                { name: 'Hoàng Gia Bảo', code: '22028225', read: true, time: '1 giờ sau khi đăng' },
                { name: 'Phạm Văn Hùng', code: '22028204', read: false, time: 'Chưa xem (Trễ 2 giờ)' },
                { name: 'Vũ Đức Long', code: '22028215', read: false, time: 'Chưa xem (Trễ 2 giờ)' },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    s.read
                      ? 'bg-slate-50 dark:bg-slate-850 border-slate-200/60 dark:border-slate-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        s.read ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {s.read ? 'check_circle' : 'cancel'}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {s.name} ({s.code})
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-mono ${
                      s.read ? 'text-slate-500' : 'text-rose-600 font-bold'
                    }`}
                  >
                    {s.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsReportModalOpen(false);
                  notify('Đã gửi email nhắc nhở cho 2 bạn sinh viên chưa đọc thông báo!');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
              >
                Gửi nhắc nhở cho 2 bạn chưa đọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
