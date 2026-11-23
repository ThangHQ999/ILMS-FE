'use client';

import React, { useState, useMemo } from 'react';
import { useLessonSessions, useRooms } from '@/features/lesson-sessions';

interface CourseMaterialItem {
  id: string;
  title: string;
  format?: string;
  categoryType?: string;
  url?: string;
  fileUrl?: string;
  downloadUrl?: string;
}

interface CourseStreamTabContentProps {
  role: 'student' | 'teacher';
  courseCode: string;
  onGoToAssignments: () => void;
  onGoToPeople: () => void;
  showToast: (msg: string) => void;
  classId?: string;
  materials?: CourseMaterialItem[];
}

export function CourseStreamTabContent({
  role,
  courseCode,
  onGoToAssignments,
  onGoToPeople,
  showToast,
  classId,
  materials = [],
}: CourseStreamTabContentProps) {
  const [quickPostTitle, setQuickPostTitle] = useState('');
  const [quickPostContent, setQuickPostContent] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<string[]>([
    'Em đã cài xong Packet Tracer 8.2 ạ, cảm ơn Thầy!',
    'Phòng B1-204 có cổng mạng LAN riêng cho từng bàn không Thầy ơi?',
  ]);

  const { data: lessonSessions = [], isLoading: isLoadingSessions } = useLessonSessions(classId || '');
  const { data: rooms = [] } = useRooms();

  const isUuid = (val?: string | null) =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim()));

  const isTechnicalCode = (val?: string | null) =>
    Boolean(val && (/^CA-?\d+$/i.test(val.trim()) || /^SES-?\d+/i.test(val.trim()) || isUuid(val)));

  const getSessionTitle = (session: (typeof lessonSessions)[0]) => {
    if (session.note && !isTechnicalCode(session.note)) {
      return session.note;
    }
    const classBase =
      session.className && !isUuid(session.className)
        ? session.className
        : courseCode || 'Môn học chuyên đề';

    const shiftText =
      session.startShift && session.endShift ? `Tiết ${session.startShift}-${session.endShift}` : 'Ca sáng';
    return `${classBase} (${shiftText})`;
  };

  const getSessionRoom = (roomName?: string | null) => {
    if (!roomName || roomName.trim() === '') return 'Học Online';
    if (!isUuid(roomName)) return roomName;
    const match = rooms.find(
      (r) => r.roomId?.toLowerCase() === roomName.toLowerCase()
    );
    if (match && match.roomName && !isUuid(match.roomName)) return match.roomName;
    return 'Phòng B2-302';
  };

  const upcomingSessions = useMemo(() => {
    if (!lessonSessions || lessonSessions.length === 0) return [];
    return [...lessonSessions]
      .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
      .slice(0, 4);
  }, [lessonSessions]);

  const getDayOfWeek = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'T2';
      const day = d.getDay();
      if (day === 0) return 'CN';
      return `T${day + 1}`;
    } catch {
      return 'T2';
    }
  };

  const formatDayMonth = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  const getMaterialIcon = (format?: string, categoryType?: string) => {
    if (format === 'PDF' || categoryType === 'syllabus') return 'menu_book';
    if (categoryType === 'code') return 'code';
    if (categoryType === 'slide') return 'terminal';
    return 'description';
  };

  const handlePostAnnouncement = () => {
    if (!quickPostTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề thông báo!');
      return;
    }
    showToast(`Đã đăng thông báo "${quickPostTitle}" tới 48 sinh viên!`);
    setQuickPostTitle('');
    setQuickPostContent('');
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    setComments((prev) => [...prev, commentInput.trim()]);
    setCommentInput('');
    showToast('Đã gửi phản hồi vào bài viết!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. ROLE SPECIFIC STREAM HEADER */}
      {role === 'student' ? (
        /* Student View: Urgent Deadline Banner & Academic Performance */
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Urgent Deadline Banner */}
          <div className="flex-1 p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900 shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">alarm</span>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-900/60">
                  Hạn chót sắp tới
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  23:59 • Chủ nhật tuần này
                </span>
              </div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base leading-snug">
                Bài tập lớn 01: Thiết kế mạng phân cụm VLSM &amp; Cấu hình OSPF
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Nộp file Cisco Packet Tracer (.pkt) kèm bản báo cáo phân tích bảng routing.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onGoToAssignments}
                  className="px-4 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Nộp bài ngay
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Mở tài liệu đề cương Lab 01 (PDF)...')}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Xem đề cương lab
                </button>
              </div>
            </div>
          </div>

          {/* Academic Performance Quick Card */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tiến độ cá nhân
                </span>
                <span className="font-mono text-sm font-extrabold text-[#0059bb] dark:text-blue-400">
                  68%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-[#0059bb] rounded-full transition-all duration-500" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">GPA Quá trình</div>
                <div className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-0.5">
                  8.6<span className="text-xs font-normal text-slate-400">/10</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Chuẩn PLO</div>
                <div className="font-display font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Đạt chuẩn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Teacher View: Quick Announcements & Instructor Radar */
        <div className="flex flex-col gap-5">
          {/* Instructor Quick Actions Composer */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-[#0059bb] dark:text-blue-400 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Đăng bảng tin nhanh cho lớp {courseCode || 'CS-202'}
              </h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
              <input
                type="text"
                value={quickPostTitle}
                onChange={(e) => setQuickPostTitle(e.target.value)}
                placeholder="Tiêu đề thông báo hoặc dặn dò cho sinh viên..."
                className="w-full bg-transparent font-semibold text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <textarea
                value={quickPostContent}
                onChange={(e) => setQuickPostContent(e.target.value)}
                placeholder="Nội dung chi tiết, yêu cầu chuẩn bị hoặc hướng dẫn bổ sung..."
                rows={2}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => showToast('Đã mở hộp thoại chọn tệp đính kèm')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Đính kèm tài liệu slide PDF"
                >
                  <span className="material-symbols-outlined text-[19px]">attach_file</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Đã thêm liên kết phòng họp trực tuyến')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Đính kèm link bài giảng Zoom/Meet"
                >
                  <span className="material-symbols-outlined text-[19px]">video_camera_front</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Mở tạo cuộc khảo sát nhanh')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Thêm khảo sát poll nhanh"
                >
                  <span className="material-symbols-outlined text-[19px]">poll</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Gửi tới: <strong className="text-slate-900 dark:text-white">Tất cả sinh viên (48)</strong>
                </span>
                <button
                  type="button"
                  onClick={handlePostAnnouncement}
                  className="px-4 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Đăng thông báo
                </button>
              </div>
            </div>
          </div>

          {/* Instructor Insight Radar Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-amber-200/80 dark:border-amber-900/60 shadow-2xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">pending_actions</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">5 bài nộp</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Lab 00 Wireshark đang chờ giảng viên chấm điểm
                </p>
                <button
                  type="button"
                  onClick={onGoToAssignments}
                  className="mt-2 text-xs font-bold text-[#0059bb] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Chấm bài ngay</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-rose-200/80 dark:border-rose-900/60 shadow-2xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">3 học viên</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Có nguy cơ trượt / Vắng 2 buổi Lab liên tiếp
                </p>
                <button
                  type="button"
                  onClick={onGoToPeople}
                  className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem danh sách</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-blue-200/80 dark:border-blue-900/60 shadow-2xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0059bb] dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">forward_to_inbox</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Nhắc nhở</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gửi push notification &amp; email hạn nộp Lab 01
                </p>
                <button
                  type="button"
                  onClick={() => showToast('Đã gửi thông báo nhắc nhở tự động qua Email & LMS đến 48 sinh viên!')}
                  className="mt-2 text-xs font-bold text-[#0059bb] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Gửi tự động (1-Click)</span>
                  <span className="material-symbols-outlined text-[15px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SHARED FEED STREAM (Main Feed 2 cols + Widgets 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Bảng tin &amp; Thông báo môn học
            </h3>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Lọc theo: Mới nhất</span>
            </div>
          </div>

          {/* Post 1 (Pinned): Lab Relocation */}
          <article className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#0d1c32] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  LN
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">TS. Lê Hoàng Nam</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[#0059bb] dark:text-blue-300 text-[10px] font-bold uppercase">
                      Chủ nhiệm môn
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Hôm qua lúc 14:30 • Thông báo ghim 📌</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold shrink-0">
                Thay đổi phòng học
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Chào cả lớp, do phòng Lab H6-302 tiến hành bảo trì hạ tầng switch Cisco Catalyst 2960 trong tuần này, buổi thực hành cấu hình định tuyến tĩnh (Static Route) vào thứ 5 sẽ được chuyển sang <strong className="text-slate-900 dark:text-white font-semibold">Phòng Lab B1-204 (Tòa nhà Trung tâm Công nghệ)</strong>. Các bạn lưu ý mang theo laptop cá nhân đã cài sẵn Packet Tracer 8.2 hoặc GNS3.
            </p>

            {/* Attachment Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-[#0059bb] dark:text-blue-400 text-[24px] shrink-0">
                  description
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    So-do-ket-noi-Lab-B1-204.pdf
                  </div>
                  <div className="text-[11px] text-slate-400">1.4 MB • Tài liệu tham khảo</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast('Đang tải xuống So-do-ket-noi-Lab-B1-204.pdf')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#0059bb] dark:text-blue-300 transition-colors shrink-0 cursor-pointer"
              >
                Tải xuống
              </button>
            </div>

            {/* Comment Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{comments.length} phản hồi từ sinh viên</span>
                <span className="text-[11px] text-blue-600">Thảo luận công khai</span>
              </div>

              {comments.map((c, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                  {c}
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-[#0059bb] flex items-center justify-center font-bold text-[10px] shrink-0">
                  YOU
                </div>
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Viết câu hỏi hoặc phản hồi công khai..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-3 py-1.5 rounded-xl bg-[#0059bb] text-white font-semibold text-xs hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                >
                  Gửi
                </button>
              </div>
            </div>
          </article>

          {/* Post 2: New Lecture Upload */}
          <article className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0059bb] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  BA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">ThS. Nguyễn Bảo Anh</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase">
                      Trợ giảng
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">3 ngày trước</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Đã cập nhật Slide bài giảng Chương 3 (Tầng Giao vận TCP/UDP) kèm tập tin mẫu bắt gói tin <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 font-semibold">tcp_handshake_dump.pcapng</code>. Các bạn xem trước phần Sliding Window Protocol để chuẩn bị cho buổi làm quiz trên lớp nhé!
            </p>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs pt-1">
              <span className="flex items-center gap-1 hover:text-rose-500 cursor-pointer">
                <span className="material-symbols-outlined text-[17px]">favorite</span> 18 Thích
              </span>
              <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                <span className="material-symbols-outlined text-[17px]">chat_bubble</span> 2 Hỏi đáp
              </span>
            </div>
          </article>
        </div>

        {/* Sidebar Widgets Column */}
        <div className="space-y-5">
          {/* Live Session & Lab Scheduler */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Lịch học tuần này
              </h4>
              <span className="text-xs font-bold text-[#0059bb] dark:text-blue-400">
                {upcomingSessions.length > 0 ? `${upcomingSessions.length} ca học` : 'Tuần học'}
              </span>
            </div>

            <div className="space-y-2.5">
              {isLoadingSessions ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
                </div>
              ) : upcomingSessions.length > 0 ? (
                upcomingSessions.map((session, idx) => (
                  <div
                    key={session.lessonSessionId || idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3"
                  >
                    <div
                      className={`px-2.5 py-1 rounded-lg font-bold text-center text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-[#0059bb] text-white shadow-2xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div>{getDayOfWeek(session.sessionDate)}</div>
                      <div className="text-[10px] font-normal opacity-80">
                        {formatDayMonth(session.sessionDate)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-slate-900 dark:text-white truncate flex items-center justify-between gap-2">
                        <span className="truncate">{getSessionTitle(session)}</span>
                        {session.sessionCode && (
                          <span className="font-mono text-[10px] text-blue-600 dark:text-[#A8C7FA] bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded font-normal shrink-0">
                            {session.sessionCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                        {session.startTime || '07:30'} - {session.endTime || '09:50'}
                        {' • '}
                        {getSessionRoom(session.roomName)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <span className="material-symbols-outlined text-slate-400 text-xl">event_busy</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chưa có lịch ca học nào được xếp
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fast Links & Reference Materials */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Kho tài liệu chuẩn
              </h4>
              {materials.length > 0 && (
                <span className="text-[11px] font-medium text-slate-400">
                  {materials.length} tài liệu
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 text-xs">
              {materials.length > 0 ? (
                materials.slice(0, 4).map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => {
                      const link = mat.fileUrl || mat.url || mat.downloadUrl;
                      if (typeof link === 'string' && link.startsWith('http')) {
                        window.open(link, '_blank', 'noopener,noreferrer');
                      } else {
                        showToast(`Đang mở tài liệu: ${mat.title}`);
                      }
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors border-none bg-transparent text-left cursor-pointer w-full"
                  >
                    <span className="flex items-center gap-2.5 truncate pr-2">
                      <span className="material-symbols-outlined text-[#0059bb] dark:text-blue-400 text-[19px] shrink-0">
                        {getMaterialIcon(mat.format, mat.categoryType)}
                      </span>
                      <span className="truncate font-medium">{mat.title}</span>
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px] shrink-0">
                      {mat.categoryType === 'code' ? 'code' : 'open_in_new'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <span className="material-symbols-outlined text-slate-400 text-xl">folder_off</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chưa có tài liệu tải lên cho môn học
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

