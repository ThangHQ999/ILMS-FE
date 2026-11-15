'use client';

import React, { useState } from 'react';
import type { ClassItem } from '../../schemas/class.schema';

interface ClassStreamTabProps {
  classInfo: ClassItem;
  currentRole: 'student' | 'teacher' | 'owner';
  onNavigateTab: (tab: string) => void;
  onOpenCreateAnnouncement?: () => void;
  onToast: (msg: string) => void;
}

export function ClassStreamTab({
  classInfo,
  currentRole,
  onNavigateTab,
  onOpenCreateAnnouncement,
  onToast,
}: ClassStreamTabProps) {
  const [quickPostTitle, setQuickPostTitle] = useState('');
  const [quickPostContent, setQuickPostContent] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<string[]>([
    'Em chào thầy, tài liệu Cisco Packet Tracer bản 8.2 có chạy được trên MacOS chip M2 không ạ?',
    'Thầy ơi cho em hỏi phòng B1-204 có cần mang ổ cắm chia điện không ạ?',
    'Đã tải sơ đồ kết nối, cảm ơn thầy!',
  ]);

  const handlePostQuickNotice = () => {
    if (!quickPostTitle.trim() && !quickPostContent.trim()) {
      onToast('Vui lòng nhập nội dung hoặc tiêu đề thông báo!');
      return;
    }
    onToast(`Đã đăng thông báo nhanh tới toàn thể sinh viên lớp ${classInfo.name}!`);
    setQuickPostTitle('');
    setQuickPostContent('');
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    setComments((prev) => [...prev, commentInput.trim()]);
    setCommentInput('');
    onToast('Đã đăng phản hồi công khai vào bài viết ghim!');
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
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 text-gray-500 dark:text-[#8E918F]">
                <button
                  type="button"
                  onClick={() => onToast('Đính kèm tài liệu slide bài giảng PDF')}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none"
                  title="Đính kèm tài liệu slide PDF"
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
                  Gửi tới: <strong className="text-gray-800 dark:text-[#E3E3E3]">Tất cả sinh viên ({classInfo.enrolledCount || 42})</strong>
                </span>
                <button
                  type="button"
                  onClick={handlePostQuickNotice}
                  className="px-5 py-2 rounded-full bg-blue-100 dark:bg-[#A8C7FA] text-blue-900 dark:text-[#062E6F] hover:opacity-90 font-semibold text-xs transition-opacity cursor-pointer border-none shadow-none"
                >
                  Đăng thông báo
                </button>
              </div>
            </div>
          </div>

          {/* 5. THE 3 METRIC CARDS (Flat tonal backgrounds, borderless rounded-3xl) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Amber card: 5 bài nộp */}
            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-[#382B14] text-amber-900 dark:text-[#FDD663] border-none shadow-sm dark:shadow-none flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-[#FDD663] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">pending_actions</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-bold">
                  5 bài nộp
                </span>
                <p className="text-xs mt-0.5 opacity-90">
                  Lab 00 Wireshark đang chờ giảng viên chấm điểm
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

            {/* Red alert card: 3 học viên */}
            <div className="p-5 rounded-3xl bg-red-50 dark:bg-[#3C1919] text-red-900 dark:text-[#F28B82] border-none shadow-sm dark:shadow-none flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-[#F28B82] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-bold">
                  3 học viên
                </span>
                <p className="text-xs mt-0.5 opacity-90">
                  Có nguy cơ trượt / Vắng 2 buổi Lab liên tiếp
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

            {/* Blue card: Nhắc nhở */}
            <div className="p-5 rounded-3xl bg-blue-50 dark:bg-[#162B4D]/60 text-blue-900 dark:text-[#A8C7FA] border-none shadow-sm dark:shadow-none flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">forward_to_inbox</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-bold">
                  Nhắc nhở
                </span>
                <p className="text-xs mt-0.5 opacity-90">
                  Gửi push notification &amp; email hạn nộp Lab 01
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onToast('Đã gửi thông báo nhắc nhở tự động qua Email & LMS đến 42 sinh viên!')
                  }
                  className="mt-2 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                >
                  Gửi tự động (1-Click)
                </button>
              </div>
            </div>
          </div>
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

          {/* Pinned Post: Lab Relocation */}
          <article className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] flex items-center justify-center font-bold text-sm">
                  LN
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-[#E3E3E3]">
                      TS. Lê Hoàng Nam
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] font-semibold text-[10px] uppercase">
                      Chủ nhiệm môn
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-[#8E918F]">Hôm qua lúc 14:30 • Thông báo ghim 📌</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-[#FDD663] text-xs font-semibold border-none">
                Thay đổi phòng học
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-800 dark:text-[#C4C7C5] leading-relaxed">
              Chào cả lớp, do phòng Lab tiến hành bảo trì hạ tầng switch Cisco Catalyst 2960 trong tuần này, buổi thực hành cấu hình định tuyến tĩnh (Static Route) vào thứ 5 sẽ được chuyển sang{' '}
              <strong className="text-blue-600 dark:text-[#A8C7FA]">
                Phòng Lab B1-204 (Tòa nhà Trung tâm Công nghệ)
              </strong>
              . Các bạn lưu ý mang theo laptop cá nhân đã cài sẵn Packet Tracer 8.2 hoặc GNS3.
            </p>

            {/* Inner attachment card - flat, subtle background, zero borders */}
            <div className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[26px]">
                  description
                </span>
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3]">
                    So-do-ket-noi-Lab-B1-204.pdf
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-[#8E918F]">1.4 MB • Tài liệu tham khảo</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToast('Đang tải xuống So-do-ket-noi-Lab-B1-204.pdf...')}
                className="px-3.5 py-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold transition-colors cursor-pointer border-none"
              >
                Tải xuống
              </button>
            </div>

            {/* Comment Section (No dashed lines) */}
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-gray-500 dark:text-[#8E918F] text-xs">
                <span>{comments.length} phản hồi từ sinh viên</span>
                <span className="text-gray-400 dark:text-[#8E918F]">Mới nhất</span>
              </div>

              <div className="space-y-2">
                {comments.slice(-2).map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs text-gray-800 dark:text-[#C4C7C5] border-none"
                  >
                    {c}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] flex items-center justify-center font-bold text-xs shrink-0">
                  YOU
                </div>
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Viết câu hỏi hoặc phản hồi công khai..."
                  className="flex-1 bg-[#F0F4F8] dark:bg-[#131314] px-4 py-2 rounded-full text-xs text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] border-none outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs cursor-pointer border-none transition-all shadow-xs"
                >
                  Gửi
                </button>
              </div>
            </div>
          </article>

          {/* Post 2: New Lecture Upload */}
          <article className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] flex items-center justify-center font-bold text-sm">
                  BA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-[#E3E3E3]">
                      ThS. Nguyễn Bảo Anh
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] font-semibold text-[10px] uppercase">
                      Trợ giảng
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-[#8E918F]">3 ngày trước</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-800 dark:text-[#C4C7C5] leading-relaxed">
              Đã cập nhật Slide bài giảng Chương 3 (Tầng Giao vận TCP/UDP) kèm tập tin mẫu bắt gói tin{' '}
              <span className="px-2 py-0.5 rounded-full bg-[#F0F4F8] dark:bg-[#131314] font-medium text-blue-600 dark:text-[#A8C7FA] text-xs">
                tcp_handshake_dump.pcapng
              </span>
              . Các bạn xem trước phần Sliding Window Protocol để chuẩn bị cho buổi làm quiz trên lớp nhé!
            </p>

            <div className="flex items-center gap-4 text-gray-500 dark:text-[#8E918F] text-xs pt-1">
              <button
                type="button"
                onClick={() => onToast('Đã thích bài viết của ThS. Nguyễn Bảo Anh')}
                className="flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                <span>18 Thích</span>
              </button>
              <button
                type="button"
                onClick={() => onToast('Mở mục Hỏi đáp bài giảng Chương 3')}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-[#A8C7FA] transition-colors cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                <span>2 Hỏi đáp</span>
              </button>
            </div>
          </article>
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
