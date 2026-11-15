'use client';

import React, { useState, useEffect } from 'react';
import type { ClassMember } from '../../schemas/class-detail.schema';

export interface StudentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: ClassMember | null;
  classCode?: string;
  onSendMessage?: (student: ClassMember) => void;
  onUnenroll?: (student: ClassMember) => void;
  onSaveNote?: (studentId: string, note: string) => void;
  onToast?: (message: string) => void;
}

export function StudentDetailDrawer({
  isOpen,
  onClose,
  student,
  classCode = 'CS-202',
  onSendMessage,
  onUnenroll,
  onSaveNote,
  onToast,
}: StudentDetailDrawerProps) {
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
  const [instructorNote, setInstructorNote] = useState(
    'Sinh viên có năng lực tư duy giải thuật xuất sắc. Đã hỗ trợ rất tích cực các bạn trong nhóm 01 giải quyết bài toán cây AVL. Xem xét đề xuất làm trợ giảng (TA) kỳ tới.'
  );
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUnenrollConfirm) {
          setShowUnenrollConfirm(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showUnenrollConfirm, onClose]);

  // Reset confirmation popover on open / student change
  useEffect(() => {
    setShowUnenrollConfirm(false);
    setIsNoteSaved(false);
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  const handleSaveNote = () => {
    setIsNoteSaved(true);
    if (onSaveNote && student) {
      onSaveNote(student.id, instructorNote);
    }
    notify(`Đã lưu ghi chú nội bộ cho sinh viên ${student.name}`);
    setTimeout(() => {
      setIsNoteSaved(false);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage(student);
    } else {
      notify(`Đang mở cuộc trò chuyện trực tiếp với ${student.name}...`);
    }
  };

  const handleConfirmUnenroll = () => {
    setShowUnenrollConfirm(false);
    if (onUnenroll) {
      onUnenroll(student);
    }
    notify(`Hệ thống đã gửi yêu cầu xác thực hủy ghi danh cho sinh viên ${student.studentCode || student.name} tới Phòng Đào tạo.`);
    onClose();
  };

  // Calculations & badges
  const gpa = student.gpa ?? 8.8;
  const isExcellent = gpa >= 8.5;
  const rankLabel = isExcellent ? 'Tốt • Top 5% lớp' : gpa >= 7.0 ? 'Khá • Top 20% lớp' : 'Cần cải thiện';
  const gradeClassification = isExcellent ? 'Giỏi' : gpa >= 7.0 ? 'Khá' : 'Trung bình';
  const firstName = student.name.trim().split(' ').pop() || student.name;

  return (
    <>
      {/* Drawer Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-[2px] z-50 transition-opacity duration-300"
        id="drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Student Roster Detail Drawer (480px, Crisp Elevation, Level-3 Depth) */}
      <aside
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] max-w-full bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col justify-between overflow-hidden border-l-[3px] border-slate-300 dark:border-slate-700 animate-in slide-in-from-right duration-300 ease-out"
        id="student-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-drawer-title"
      >
        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {/* Drawer Header Bar */}
          <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                {student.avatarUrl ? (
                  <img
                    className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700"
                    src={student.avatarUrl}
                    alt={student.name}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    {student.avatar || firstName.charAt(0)}
                  </div>
                )}
                <span
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                  title="Đang trực tuyến"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="student-drawer-title"
                    className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight"
                  >
                    {student.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1 font-semibold border border-blue-200 dark:border-blue-900/50">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Chính thức
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">
                    MSSV: {student.studentCode || 'B21DCCN512'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">• Khóa D21</span>
                </div>
              </div>
            </div>

            {/* Close Button [X] */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng hồ sơ học viên"
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              id="close-drawer-btn"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Identity & Contact Information Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border-[3px] border-slate-200 dark:border-slate-700 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Thông tin liên hệ &amp; Phân công
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs">
                <span className="material-symbols-outlined text-[14px]">military_tech</span>
                {student.isClassLeader ? student.leaderBadge || 'Trưởng nhóm học tập' : 'Trưởng nhóm học tập'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase">
                  Email học viện
                </span>
                <a
                  className="text-blue-600 dark:text-blue-400 font-medium truncate hover:underline flex items-center gap-1 mt-0.5"
                  href={`mailto:${student.email}`}
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  {student.email}
                </a>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase">
                  Số điện thoại
                </span>
                <span className="text-slate-900 dark:text-slate-100 font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">call</span>
                  (+84) 987 654 321
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase">
                  Ngày ghi danh
                </span>
                <span className="text-slate-900 dark:text-slate-100 font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                  {student.joinedAt || '15/08/2024 (Tuần 1)'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase">
                  Nhóm đồ án lớn
                </span>
                <span className="text-slate-900 dark:text-slate-100 font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">folder_shared</span>
                  Nhóm 01 (Cây đỏ-đen)
                </span>
              </div>
            </div>
          </div>

          {/* Course Progress Statistics Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Tiến độ môn học {classCode}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                {rankLabel}
              </span>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Lesson Progress */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lý thuyết</span>
                <div className="my-1.5">
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">18</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/24 bài</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                  75% hoàn thành
                </span>
              </div>

              {/* Lab Submissions */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bài tập Lab</span>
                <div className="my-1.5">
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">5</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/6 bài</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '83%' }} />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Còn thiếu Lab 06
                </span>
              </div>

              {/* GPA Score */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">ĐTB Quá trình</span>
                <div className="my-1.5 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                    {gpa.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/10</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  <span>+0.4 so với GK</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Xếp loại: {gradeClassification}
                </span>
              </div>
            </div>

            {/* Mini Visual Chart: Progress Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Tương tác hệ thống đánh giá tự động (Judge)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  38 lượt nộp code • 34 Accepted • 4 Time Limit
                </span>
              </div>

              {/* Inline Sparkline / Mini Donut Indicator */}
              <svg className="w-12 h-12 transform -rotate-90 shrink-0" viewBox="0 0 36 36">
                <circle
                  className="stroke-slate-200 dark:stroke-slate-700"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="15.5"
                  strokeWidth="3"
                />
                <circle
                  className="stroke-blue-600 dark:stroke-blue-400"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="15.5"
                  strokeDasharray="100"
                  strokeDashoffset="25"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>

          {/* Recent Learning History */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Lịch sử tương tác học tập gần đây
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Cập nhật tức thời
              </span>
            </div>

            <div className="relative pl-6 flex flex-col gap-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
              {/* Event 1 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Hoàn thành bài: &apos;Segment Tree - Cây phân đoạn&apos;
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    2 giờ trước
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Vượt qua 10/10 test cases của bài toán Range Minimum Query (RMQ) với độ phức tạp $O(\log N)$.
                </p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Điểm quiz: 100/100
                </span>
              </div>

              {/* Event 2 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Nộp lại bài: &apos;Lab 01 - Cấu trúc dữ liệu Tự cân bằng&apos;
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Hôm qua, 21:40
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Đã tối ưu hóa hàm xoay trái/xoay phải trên AVL Tree để khắc phục lỗi tràn bộ nhớ đệm (Lần nộp thứ 2).
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    commit #f48a1c9
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    Điểm chấm: 9.5
                  </span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white dark:ring-slate-900" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Tham gia thảo luận diễn đàn lớp
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    3 ngày trước
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Đã trả lời câu hỏi của bạn Phạm Quỳnh Anh về thuật toán Tarjan tìm thành phần liên thông mạnh.
                </p>
              </div>
            </div>
          </div>

          {/* Instructor Internal Notes */}
          <div className="flex flex-col gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border-[3px] border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5"
                htmlFor="instructor-note"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                  lock
                </span>
                Ghi chú nội bộ của Giảng viên (Riêng tư)
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Chỉ ban giảng dạy thấy
              </span>
            </div>

            <textarea
              id="instructor-note"
              value={instructorNote}
              onChange={(e) => setInstructorNote(e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all resize-none leading-relaxed"
              placeholder="Nhập nhận xét, điểm mạnh, cần lưu ý khi chấm đồ án cuối kỳ..."
              rows={3}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNote}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  isNoteSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-200'
                }`}
                id="save-note-btn"
              >
                {isNoteSaved ? 'Đã lưu ✓' : 'Lưu ghi chú'}
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 bg-white dark:bg-slate-900 border-t-[3px] border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-lg">
          {/* Primary Communication Action */}
          <button
            type="button"
            onClick={handleSendMessage}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Gửi tin nhắn riêng cho {firstName}
          </button>

          {/* Danger Zone: Expel / Unenroll with Confirmation Layer */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUnenrollConfirm(!showUnenrollConfirm)}
              className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/60 cursor-pointer"
              id="btn-unenroll-trigger"
            >
              <span className="material-symbols-outlined text-[18px] text-rose-600">
                person_remove
              </span>
              Hủy ghi danh / Mời ra khỏi lớp {classCode}
            </button>

            {/* Inline Popover Confirmation */}
            {showUnenrollConfirm && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-[3px] border-rose-300 dark:border-rose-700 flex flex-col gap-3 z-30 animate-in fade-in slide-in-from-bottom-2"
                id="unenroll-confirm-modal"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 shrink-0">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Xác nhận hủy ghi danh?
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Sinh viên <strong className="text-slate-900 dark:text-slate-100">{student.name}</strong> sẽ bị xóa quyền truy cập tài liệu bài giảng, hệ thống nộp bài Lab và đồ án nhóm của {classCode}. Thao tác này được lưu vết học vụ.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUnenrollConfirm(false)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    id="cancel-unenroll-btn"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmUnenroll}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                    id="confirm-unenroll-btn"
                  >
                    Đồng ý rút khỏi lớp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

