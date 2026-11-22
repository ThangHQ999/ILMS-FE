'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MarkdownContent } from '@/components/shared';
import type { ClassAnnouncement } from '@/features/classes/schemas/class-detail.schema';
import {
  saveLocalAnnouncement,
  getLocalAnnouncements,
} from '@/features/classes/services/class-detail.service';

interface ClassAnnouncementsTabProps {
  classId?: string;
  announcements?: ClassAnnouncement[];
  currentRole?: 'owner' | 'teacher' | 'student';
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
      authorName: currentRole === 'owner' ? '' : 'TS. Nguyễn Văn An',
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
      <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-none border-none">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-[#E3E3E3] whitespace-nowrap">
              Bảng tin &amp; Thông báo Lớp học
            </h1>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] font-semibold tracking-wider border-none">
              CNTT-K22-01
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5]">
              Học kỳ II • 2024 - 2025
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5]">
              GVCN: TS. Nguyễn Văn An
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] border-none font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              42 sinh viên ghi danh
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onPostClick) {
                  onPostClick();
                } else {
                  document.getElementById('quick-composer')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs shadow-xs transition-all cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[19px]">campaign</span>
              <span>+ Tạo thông báo mới</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onPostClick) {
                  onPostClick();
                } else {
                  notify('Đã mở hộp thoại lên lịch phát tin tự động');
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] font-semibold text-xs transition-colors cursor-pointer border-none bg-transparent"
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
            className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col gap-4 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] leading-snug">
                    Tạo thông báo nhanh cho cả lớp
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                    Truyền đạt thông điệp, tài liệu kiểm tra hoặc thông báo đột xuất tức thời
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] border-none font-medium">
                Markdown hỗ trợ
              </span>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="flex flex-col gap-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tiêu đề thông báo quan trọng (ví dụ: Thay đổi lịch thi, bài tập lớn)..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs font-medium text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none border-none transition-all"
              />

              <div className="relative">
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Nhập chi tiết nội dung thông báo gửi đến 42 sinh viên lớp CNTT-K22-01. Bạn có thể chèn liên kết bài tập hoặc tag môn học liên quan..."
                  className="w-full p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none border-none transition-all resize-y"
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
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border-none ${hasAttachment
                        ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F]'
                        : 'text-gray-600 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C]'
                        }`}
                      title="Đính kèm tài liệu PDF / Slide"
                    >
                      <span className="material-symbols-outlined text-[17px]">attach_file</span>
                      <span>{hasAttachment ? 'Đã đính kèm PDF (1)' : 'Đính kèm PDF/Slide'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => notify('Đã chèn liên kết Quiz 05 vào nội dung bài đăng')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-600 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-medium transition-colors cursor-pointer border-none"
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
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-600 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-medium transition-colors cursor-pointer border-none"
                      title="Gán thẻ môn học"
                    >
                      <span className="material-symbols-outlined text-[17px]">sell</span>
                      <span>Gán môn học</span>
                    </button>
                  </div>

                  {/* Selected Tag Chip Preview */}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] border-none">
                    <span className="material-symbols-outlined text-[13px]">tag</span>
                    <span>{selectedTag}</span>
                  </span>
                </div>
              </div>

              {/* Publishing Checkbox Options */}
              <div className="bg-[#F0F4F8] dark:bg-[#131314] p-3.5 rounded-2xl border-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs shadow-xs transition-all shrink-0 cursor-pointer border-none"
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
              <span className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                Dòng thời gian thông báo
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] font-semibold border-none">
                {filteredAnnouncements.length} bản tin
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs bg-[#E1E5EA] dark:bg-[#282A2C] p-1 rounded-full">
              <button
                type="button"
                onClick={() => setFeedFilter('all')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer border-none ${feedFilter === 'all'
                  ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                  : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                  }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFeedFilter('pinned')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer border-none ${feedFilter === 'pinned'
                  ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                  : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                  }`}
              >
                Đã ghim
              </button>
              <button
                type="button"
                onClick={() => setFeedFilter('attachment')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer border-none ${feedFilter === 'attachment'
                  ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                  : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
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
                  className={`bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-7 border-none shadow-sm dark:shadow-none flex flex-col gap-4 relative overflow-hidden transition-all ${isArchived ? 'opacity-85 hover:opacity-100' : ''
                    }`}
                >
                  {/* Left Accent Bar */}
                  {item.isPinned && (
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${isErrorTheme ? 'bg-[#F28B82]' : 'bg-[#007BFF] dark:bg-[#A8C7FA]'
                        }`}
                    />
                  )}

                  {/* Header badge & Poster info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] flex items-center justify-center font-bold text-sm shrink-0 border-none">
                        {item.authorInitials || 'AN'}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-[#E3E3E3] text-sm">
                            {item.authorName}
                          </span>
                          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] border-none">
                            {item.authorRole}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 dark:text-[#8E918F] mt-0.5">
                          {item.createdAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isPinned && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border-none ${isErrorTheme
                            ? 'bg-rose-100 dark:bg-[#3C1919] text-rose-800 dark:text-[#F28B82]'
                            : 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
                            }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">push_pin</span>
                          <span>{item.pinBadge || 'ĐÃ GHIM'}</span>
                        </span>
                      )}

                      {isArchived && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] border-none">
                          Lưu trữ
                        </span>
                      )}

                      {isPoll && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-none">
                          Đã thu thập {totalPollVotes} lượt vote
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => notify(`Tác vụ bổ sung cho bài viết: "${item.title}"`)}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-[#E3E3E3] hover:bg-gray-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none"
                      >
                        <span className="material-symbols-outlined text-[19px]">more_vert</span>
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] leading-snug">
                      {item.title}
                    </h3>
                    <MarkdownContent
                      content={item.content}
                      className="text-gray-600 dark:text-[#C4C7C5]"
                    />

                    {/* Due Date Highlight Pill if applicable */}
                    {item.dueText && (
                      <div className="p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-[#F28B82] font-semibold">
                          <span className="material-symbols-outlined text-[18px]">timer</span>
                          <span>{item.dueText}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => notify('Đang chuyển hướng tới Cổng nộp bài tập Lab 04...')}
                          className="font-semibold text-blue-600 dark:text-[#A8C7FA] hover:underline cursor-pointer border-none bg-transparent"
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
                            className="p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none hover:opacity-90 transition-all flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${att.type === 'pdf'
                                  ? 'bg-rose-100 dark:bg-[#3C1919] text-rose-600 dark:text-[#F28B82]'
                                  : att.type === 'pptx'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-[#FFB784]'
                                    : 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
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
                                <span className="font-semibold text-gray-800 dark:text-[#E3E3E3] truncate">
                                  {att.name}
                                </span>
                                <span className="text-[11px] text-gray-400 dark:text-[#8E918F] truncate">
                                  {att.size} • {att.desc || 'Tài liệu đính kèm'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => notify(`Đang tải xuống tệp: ${att.name}`)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] hover:opacity-85 font-semibold text-[11px] border-none shadow-xs transition-colors shrink-0 cursor-pointer"
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
                              className={`p-3 rounded-2xl border-none flex flex-col gap-1 relative overflow-hidden text-left transition-all cursor-pointer ${isVoted
                                ? 'bg-[#D3E3FD]/40 dark:bg-[#162B4D]/40'
                                : 'bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90'
                                }`}
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-[#007BFF]/15 dark:bg-[#A8C7FA]/15 transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                              <div className="relative z-10 flex items-center justify-between text-xs">
                                <span
                                  className={`font-semibold ${isVoted
                                    ? 'text-blue-800 dark:text-[#A8C7FA]'
                                    : 'text-gray-800 dark:text-[#E3E3E3]'
                                    }`}
                                >
                                  {opt.label}
                                </span>
                                <span className="font-mono text-blue-600 dark:text-[#A8C7FA] font-bold">
                                  {votes} phiếu ({percent}%)
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400 dark:text-[#8E918F]">
                          <span>{item.poll.deadlineText}</span>
                          <button
                            type="button"
                            onClick={() => setIsReportModalOpen(true)}
                            className="text-blue-600 dark:text-[#A8C7FA] font-semibold hover:underline cursor-pointer border-none bg-transparent"
                          >
                            Xem danh sách sinh viên đã chọn →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Engagement Footer */}
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {/* Read count */}
                        {item.readCount !== undefined && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] font-semibold border-none">
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
                      <div className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none space-y-3 animate-fadeIn text-xs">
                        <div className="font-semibold text-gray-700 dark:text-[#C4C7C5]">
                          Bình luận trao đổi ({item.commentsCount || 0}):
                        </div>
                        <div className="space-y-2">
                          <div className="p-3 rounded-2xl bg-white dark:bg-[#1E1F20] border-none flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-bold flex items-center justify-center shrink-0 text-[10px]">
                              TM
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900 dark:text-[#E3E3E3]">
                                  (Lớp trưởng)
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-[#8E918F]">1 giờ trước</span>
                              </div>
                              <p className="text-gray-600 dark:text-[#C4C7C5] mt-0.5">
                                Em đã nhận được đề cương và thông báo lại cho toàn thể các bạn trong nhóm thực hành ạ!
                              </p>
                            </div>
                          </div>

                          <div className="p-3 rounded-2xl bg-white dark:bg-[#1E1F20] border-none flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              HY
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900 dark:text-[#E3E3E3]">
                                  Lê Hoàng Yến
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-[#8E918F]">35 phút trước</span>
                              </div>
                              <p className="text-gray-600 dark:text-[#C4C7C5] mt-0.5">
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
                            className="flex-1 px-4 py-2 rounded-full bg-white dark:bg-[#1E1F20] border-none text-xs text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none"
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
                            className="px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs border-none cursor-pointer transition-all"
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
          <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[22px]">
                  insights
                </span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                  Thống kê tương tác bảng tin
                </h3>
              </div>
              <span className="text-[11px] font-medium text-gray-400 dark:text-[#8E918F]">30 ngày qua</span>
            </div>

            {/* Big Stat KPI with Circular Ring Meter */}
            <div className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 dark:text-[#8E918F]">
                  Tỷ lệ sinh viên đọc trung bình
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-blue-600 dark:text-[#A8C7FA] font-mono">
                    92.4%
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-[#81C995] flex items-center font-bold">
                    <span className="material-symbols-outlined text-[15px]">trending_up</span>
                    <span>+3.8%</span>
                  </span>
                </div>
              </div>

              {/* Inline Ring Meter Visual */}
              <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-[#282A2C]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-[#007BFF] dark:text-[#A8C7FA]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="92.4, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <span className="absolute font-mono text-[10px] font-bold text-gray-800 dark:text-[#E3E3E3]">
                  42 SV
                </span>
              </div>
            </div>

            {/* Metric Details */}
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0F4F8] dark:hover:bg-[#282A2C] transition-colors">
                <div className="flex items-center gap-2 text-gray-600 dark:text-[#C4C7C5]">
                  <span className="material-symbols-outlined text-gray-400 dark:text-[#8E918F] text-[17px]">
                    schedule
                  </span>
                  <span>Khung giờ đọc nhiều nhất:</span>
                </div>
                <span className="font-mono font-bold text-blue-600 dark:text-[#A8C7FA]">
                  20:00 - 22:00
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0F4F8] dark:hover:bg-[#282A2C] transition-colors">
                <div className="flex items-center gap-2 text-gray-600 dark:text-[#C4C7C5]">
                  <span className="material-symbols-outlined text-gray-400 dark:text-[#8E918F] text-[17px]">
                    speed
                  </span>
                  <span>Tốc độ xem tin sau khi đăng:</span>
                </div>
                <span className="font-mono font-semibold text-gray-800 dark:text-[#E3E3E3]">
                  ~ 42 phút
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0F4F8] dark:hover:bg-[#282A2C] transition-colors">
                <div className="flex items-center gap-2 text-gray-600 dark:text-[#C4C7C5]">
                  <span className="material-symbols-outlined text-gray-400 dark:text-[#8E918F] text-[17px]">
                    mark_email_unread
                  </span>
                  <span>SV thường xuyên trễ tin:</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-[#3C1919] text-rose-800 dark:text-[#F28B82] border-none">
                  2 bạn
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="w-full py-2.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] border-none text-xs font-semibold transition-all cursor-pointer"
            >
              Xem báo cáo chi tiết từng cá nhân →
            </button>
          </section>

          {/* Widget 2: Kênh liên lạc khẩn cấp & Ban cán sự */}
          <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 text-[22px]">
                  contact_emergency
                </span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
                  Kênh liên lạc khẩn cấp
                </h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Trực tuyến" />
            </div>

            <p className="text-xs text-gray-500 dark:text-[#8E918F] leading-relaxed">
              Các đường dây nóng hỗ trợ xử lý sự cố phòng máy, xin vắng có phép hoặc trao đổi tức thời ngoài giờ học.
            </p>

            {/* Channel Links */}
            <div className="flex flex-col gap-2">
              {/* Zalo */}
              <button
                type="button"
                onClick={() => notify('Đang mở nhóm Zalo hỗ trợ kỹ thuật CNTT-K22')}
                className="p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90 border-none transition-all flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] flex items-center justify-center font-bold text-sm shrink-0 border-none">
                    Z
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] group-hover:text-blue-600 dark:group-hover:text-[#A8C7FA]">
                      Nhóm Zalo CNTT-K22
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                      42/42 thành viên • Ban cán sự trực
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-600 text-[18px]">
                  arrow_outward
                </span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => notify('Đang mở Telegram Alert Bot push thông báo')}
                className="p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90 border-none transition-all flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 border-none">
                    <span className="material-symbols-outlined text-[19px]">near_me</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] group-hover:text-blue-600 dark:group-hover:text-[#A8C7FA]">
                      Telegram Alert Bot
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                      Tự động push thông báo lab
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-600 text-[18px]">
                  arrow_outward
                </span>
              </button>
            </div>

            {/* Hotline Ban Cán Sự Lớp */}
            <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#8E918F]">
                Đại diện Ban cán sự lớp
              </span>

              {/* Lớp trưởng */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] flex items-center justify-center text-xs font-bold shrink-0">
                    TM
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">

                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">Lớp trưởng • 0982.112.xxx</span>
                  </div>
                </div>
                <a
                  href="tel:0982112888"
                  onClick={(e) => {
                    e.preventDefault();
                    notify('Đang gọi điện cho Lớp trưởng : 0982.112.888');
                  }}
                  className="p-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] hover:opacity-85 transition-colors border-none"
                  title="Gọi điện"
                >
                  <span className="material-symbols-outlined text-[17px]">call</span>
                </a>
              </div>

              {/* Lớp phó */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] flex items-center justify-center text-xs font-bold shrink-0">
                    MA
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                      Nguyễn Mai Anh
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">Lớp phó Học tập • 0914.332.xxx</span>
                  </div>
                </div>
                <a
                  href="tel:0914332999"
                  onClick={(e) => {
                    e.preventDefault();
                    notify('Đang gọi điện cho Lớp phó Nguyễn Mai Anh: 0914.332.999');
                  }}
                  className="p-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] hover:opacity-85 transition-colors border-none"
                  title="Gọi điện"
                >
                  <span className="material-symbols-outlined text-[17px]">call</span>
                </a>
              </div>
            </div>
          </section>

          {/* Widget 3: Quick Filter by Subject / Tag */}
          <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col gap-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] uppercase tracking-wide">
              Lọc theo học phần phụ trách
            </h4>
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('ALL')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer border-none ${selectedSubjectFilter === 'ALL'
                  ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F]'
                  : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] hover:opacity-85'
                  }`}
              >
                Tất cả học phần
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('ctdl')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer border-none ${selectedSubjectFilter === 'ctdl'
                  ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F]'
                  : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] hover:opacity-85'
                  }`}
              >
                Cấu trúc Dữ liệu &amp; Giải thuật (K22)
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('csdl')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer border-none ${selectedSubjectFilter === 'csdl'
                  ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F]'
                  : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] hover:opacity-85'
                  }`}
              >
                Cơ sở dữ liệu nâng cao
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('web')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer border-none ${selectedSubjectFilter === 'web'
                  ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F]'
                  : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] hover:opacity-85'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">insights</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                    Báo cáo tỷ lệ đọc thông báo lớp
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8E918F]">Chi tiết tương tác 42 sinh viên lớp CNTT-K22-01</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#282A2C] text-gray-400 dark:text-[#8E918F] flex items-center justify-center border-none transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {[
                { name: '', code: '22028192', read: true, time: '2 phút sau khi đăng' },
                { name: 'Nguyễn Tuấn Anh', code: '22028195', read: true, time: '14 phút sau khi đăng' },
                { name: 'Lê Hoàng Yến', code: '22028198', read: true, time: '28 phút sau khi đăng' },
                { name: 'Đỗ Minh Châu', code: '22028210', read: true, time: '45 phút sau khi đăng' },
                { name: 'Hoàng Gia Bảo', code: '22028225', read: true, time: '1 giờ sau khi đăng' },
                { name: 'Phạm Văn Hùng', code: '22028204', read: false, time: 'Chưa xem (Trễ 2 giờ)' },
                { name: 'Vũ Đức Long', code: '22028215', read: false, time: 'Chưa xem (Trễ 2 giờ)' },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border-none flex items-center justify-between ${s.read
                    ? 'bg-[#F0F4F8] dark:bg-[#131314]'
                    : 'bg-rose-50 dark:bg-[#3C1919]'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[16px] ${s.read ? 'text-emerald-600 dark:text-[#81C995]' : 'text-rose-600 dark:text-[#F28B82]'
                        }`}
                    >
                      {s.read ? 'check_circle' : 'cancel'}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-[#E3E3E3]">
                      {s.name} ({s.code})
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-mono ${s.read ? 'text-gray-500 dark:text-[#8E918F]' : 'text-rose-600 dark:text-[#F28B82] font-semibold'
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
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 transition-all shadow-xs cursor-pointer border-none"
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
