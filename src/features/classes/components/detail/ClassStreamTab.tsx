'use client';

import React, { useState } from 'react';
import type { ClassItem } from '../../schemas/class.schema';

interface ClassStreamTabProps {
  classInfo: ClassItem;
  currentRole: 'student' | 'teacher' | 'owner';
  onNavigateTab: (tab: string) => void;
  onToast: (msg: string) => void;
}

export function ClassStreamTab({
  classInfo,
  currentRole,
  onNavigateTab,
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
          All cards with border-[3px] border-slate-300 dark:border-slate-700
          ========================================================================= */}

      {/* [STUDENT VIEW] Stream Header Alerts & Metrics */}
      {currentRole === 'student' && (
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Urgent Deadline Banner */}
          <div className="flex-1 p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-rose-300 dark:border-rose-900 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">alarm</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Hạn chót sắp tới
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  23:59 • Chủ nhật tuần này
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                Bài tập lớn 01: Thiết kế mạng phân cụm VLSM & Cấu hình OSPF
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                Nộp file Cisco Packet Tracer (.pkt) kèm bản báo cáo phân tích bảng routing.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('assignments')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  Nộp bài ngay
                </button>
                <button
                  type="button"
                  onClick={() => onToast('Mở đề cương bài thực hành Lab định tuyến OSPF')}
                  className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Xem đề cương lab
                </button>
              </div>
            </div>
          </div>

          {/* Academic Performance Quick Card */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tiến độ cá nhân
                </span>
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                  68%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: '68%' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  GPA Quá trình
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                  8.6<span className="text-xs font-normal text-slate-400">/10</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
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
          {/* Instructor Quick Actions Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
              </div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Đăng bảng tin nhanh cho lớp {classInfo.name}
              </h2>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3.5 mb-3 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                value={quickPostTitle}
                onChange={(e) => setQuickPostTitle(e.target.value)}
                placeholder="Tiêu đề thông báo hoặc dặn dò cho sinh viên..."
                className="w-full bg-transparent font-bold text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none mb-2"
              />
              <textarea
                value={quickPostContent}
                onChange={(e) => setQuickPostContent(e.target.value)}
                placeholder="Nội dung chi tiết, yêu cầu chuẩn bị hoặc hướng dẫn bổ sung..."
                rows={2}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => onToast('Đính kèm tài liệu slide bài giảng PDF')}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Đính kèm tài liệu slide PDF"
                >
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToast('Thêm liên kết phòng học trực tuyến Zoom/Meet')}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Đính kèm link bài giảng Zoom/Meet"
                >
                  <span className="material-symbols-outlined text-[20px]">video_camera_front</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToast('Khởi tạo cuộc thăm dò nhanh (Poll) cho lớp')}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Thêm khảo sát poll nhanh"
                >
                  <span className="material-symbols-outlined text-[20px]">poll</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Gửi tới: <strong className="text-slate-900 dark:text-slate-100">Tất cả sinh viên (48)</strong>
                </span>
                <button
                  type="button"
                  onClick={handlePostQuickNotice}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  Đăng thông báo
                </button>
              </div>
            </div>
          </div>

          {/* Instructor Insight Warnings (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-amber-300 dark:border-amber-900/60 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">pending_actions</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  5 bài nộp
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Lab 00 Wireshark đang chờ giảng viên chấm điểm
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('assignments')}
                  className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Chấm bài ngay &rarr;
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-rose-300 dark:border-rose-900 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  3 học viên
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Có nguy cơ trượt / Vắng 2 buổi Lab liên tiếp
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('people')}
                  className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Xem danh sách &rarr;
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-blue-300 dark:border-blue-900 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">forward_to_inbox</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Nhắc nhở
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Gửi push notification & email hạn nộp Lab 01
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onToast('Đã gửi thông báo nhắc nhở tự động qua Email & LMS đến 48 sinh viên!')
                  }
                  className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
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
          All cards with border-[3px] border-slate-300 dark:border-slate-700
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Bảng tin & Thông báo môn học
            </h2>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Lọc theo: Mới nhất</span>
            </div>
          </div>

          {/* Pinned Post: Lab Relocation */}
          <article className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  LN
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      TS. Lê Hoàng Nam
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[10px] uppercase">
                      Chủ nhiệm môn
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Hôm qua lúc 14:30 • Thông báo ghim 📌</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                Thay đổi phòng học
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              Chào cả lớp, do phòng Lab H6-302 tiến hành bảo trì hạ tầng switch Cisco Catalyst 2960 trong tuần này, buổi thực hành cấu hình định tuyến tĩnh (Static Route) vào thứ 5 sẽ được chuyển sang{' '}
              <strong className="text-blue-600 dark:text-blue-400">
                Phòng Lab B1-204 (Tòa nhà Trung tâm Công nghệ)
              </strong>
              . Các bạn lưu ý mang theo laptop cá nhân đã cài sẵn Packet Tracer 8.2 hoặc GNS3.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 text-[26px]">
                  description
                </span>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    So-do-ket-noi-Lab-B1-204.pdf
                  </div>
                  <div className="text-[11px] text-slate-400">1.4 MB • Tài liệu tham khảo</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToast('Đang tải xuống So-do-ket-noi-Lab-B1-204.pdf...')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border text-blue-600 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Tải xuống
              </button>
            </div>

            {/* Comment Section */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>{comments.length} phản hồi từ sinh viên</span>
                <span className="text-slate-400">Mới nhất</span>
              </div>

              <div className="space-y-2">
                {comments.slice(-2).map((c, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    {c}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                  YOU
                </div>
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Viết câu hỏi hoặc phản hồi công khai..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  Gửi
                </button>
              </div>
            </div>
          </article>

          {/* Post 2: New Lecture Upload */}
          <article className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  BA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      ThS. Nguyễn Bảo Anh
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase">
                      Trợ giảng
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">3 ngày trước</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              Đã cập nhật Slide bài giảng Chương 3 (Tầng Giao vận TCP/UDP) kèm tập tin mẫu bắt gói tin{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-blue-600 dark:text-blue-400 text-xs">
                tcp_handshake_dump.pcapng
              </code>
              . Các bạn xem trước phần Sliding Window Protocol để chuẩn bị cho buổi làm quiz trên lớp nhé!
            </p>

            <div className="flex items-center gap-4 text-slate-500 text-xs pt-2">
              <button
                type="button"
                onClick={() => onToast('Đã thích bài viết của ThS. Nguyễn Bảo Anh')}
                className="flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                <span>18 Thích</span>
              </button>
              <button
                type="button"
                onClick={() => onToast('Mở mục Hỏi đáp bài giảng Chương 3')}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
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
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Lịch học tuần này
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                Tuần 09
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-center text-xs shrink-0">
                  <div>T5</div>
                  <div className="text-[10px] font-normal">24/10</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    Thực hành Lab Định tuyến OSPF
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    07:30 - 11:30 • Lab B1-204
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-center text-xs shrink-0">
                  <div>T7</div>
                  <div className="text-[10px] font-normal">26/10</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    Q&A Trực tuyến với Trợ giảng AI
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    19:30 - 21:00 • Virtual Room 02
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fast Links & Reference Materials */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col gap-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Kho tài liệu chuẩn
            </h3>

            <div className="flex flex-col gap-2 text-xs">
              <button
                type="button"
                onClick={() => onToast('Đang mở giáo trình Kurose & Ross 8th Edition...')}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">
                    menu_book
                  </span>
                  Giáo trình Kurose & Ross 8th
                </span>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">
                  open_in_new
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToast('Đang tải Cisco IOS Command Cheatsheet (.pdf)...')}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">
                    terminal
                  </span>
                  Cisco IOS Command Cheatsheet
                </span>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">
                  download
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToast('Mở kho Github mẫu C/C++ Sockets Programming')}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">code</span>
                  Kho Github mẫu C/C++ Sockets
                </span>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

