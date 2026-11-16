'use client';

import React, { useState } from 'react';
import type { ClassMember } from '../../schemas/class-detail.schema';

interface StudentDetailDrawerProps {
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
  const [instructorNote, setInstructorNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);

  if (!isOpen || !student) return null;

  const handleSaveNote = () => {
    if (onSaveNote && student) {
      onSaveNote(student.id, instructorNote);
    }
    setIsNoteSaved(true);
    if (onToast) onToast('Đã lưu ghi chú học vụ cho sinh viên!');
    setTimeout(() => setIsNoteSaved(false), 2000);
  };

  const handleSendMessage = () => {
    if (onSendMessage && student) {
      onSendMessage(student);
    }
  };

  const handleConfirmUnenroll = () => {
    if (onUnenroll && student) {
      onUnenroll(student);
    }
    setShowUnenrollConfirm(false);
    onClose();
  };

  const gpa = student.gpa ?? 8.5;
  const gradeClassification =
    gpa >= 9.0
      ? 'Xuất sắc (A+)'
      : gpa >= 8.0
      ? 'Giỏi (A)'
      : gpa >= 7.0
      ? 'Khá (B)'
      : gpa >= 5.5
      ? 'Trung bình (C)'
      : 'Cảnh báo học vụ (D/F)';

  const rankLabel =
    student.learningStatus === 'EXCELLENT'
      ? 'Top 5% sinh viên tiêu biểu'
      : student.learningStatus === 'ACTIVE'
      ? 'Tiến độ đồng đều, chuyên cần cao'
      : student.learningStatus === 'NEED_HELP'
      ? 'Cần hỗ trợ kiến thức thuật toán'
      : 'Nguy cơ trượt môn (Thiếu bài tập)';

  const firstName = student.name.trim().split(' ').pop() || student.name;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300"
        id="drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-xl max-h-[85vh] bg-white dark:bg-[#1E1F20] rounded-3xl shadow-2xl border-2 border-slate-300 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          id="student-detail-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-drawer-title"
        >
          {/* Modal Header Bar */}
          <div className="px-5 pt-3.5 pb-3 sm:px-6 sm:pt-4 sm:pb-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                {student.avatarUrl ? (
                  <img
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-sm ring-2 ring-blue-100 dark:ring-blue-900/50"
                    src={student.avatarUrl}
                    alt={student.name}
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-100 dark:bg-[#162B4D] text-blue-700 dark:text-[#A8C7FA] flex items-center justify-center font-bold text-base sm:text-lg shadow-sm border-none ring-2 ring-blue-100 dark:ring-blue-900/50">
                    {student.avatar || firstName.charAt(0)}
                  </div>
                )}
                <span
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E1F20]"
                  title="Đang trực tuyến"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="student-drawer-title"
                    className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#E3E3E3] tracking-tight"
                  >
                    {student.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-[#162B4D] text-blue-700 dark:text-[#A8C7FA] text-xs flex items-center gap-1 font-semibold border-none">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Chính thức
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-gray-600 dark:text-[#C4C7C5] bg-[#E1E5EA] dark:bg-[#282A2C] px-2.5 py-0.5 rounded-full font-medium">
                    MSSV: {student.studentCode || 'B21DCCN512'}
                  </span>
                  <span className="text-gray-500 dark:text-[#8E918F] text-xs">• Khóa D21</span>
                </div>
              </div>
            </div>

            {/* Close Button [X] */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng hồ sơ học viên"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-500 dark:text-[#8E918F] hover:text-gray-900 dark:hover:text-[#E3E3E3] hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer border-none"
              id="close-drawer-btn"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">close</span>
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 flex flex-col gap-5 custom-scrollbar">

          {/* Identity & Contact Information Card */}
          <div className="bg-[#F0F4F8] dark:bg-[#131314] p-4 rounded-3xl border-none flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-none">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-[#8E918F] font-bold">
                Thông tin liên hệ &amp; Phân công
              </span>
              <span className="px-3 py-1 rounded-full bg-[#0B57D0] text-white text-xs font-semibold flex items-center gap-1 border-none">
                <span className="material-symbols-outlined text-[14px]">military_tech</span>
                {student.isClassLeader ? student.leaderBadge || 'Trưởng nhóm học tập' : 'Trưởng nhóm học tập'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col">
                <span className="text-gray-400 dark:text-[#8E918F] text-[11px] font-medium uppercase">
                  Email học viện
                </span>
                <a
                  className="text-blue-600 dark:text-[#A8C7FA] font-medium truncate hover:underline flex items-center gap-1 mt-0.5"
                  href={`mailto:${student.email}`}
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  {student.email}
                </a>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-400 dark:text-[#8E918F] text-[11px] font-medium uppercase">
                  Số điện thoại
                </span>
                <span className="text-gray-900 dark:text-[#E3E3E3] font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-gray-400">call</span>
                  (+84) 987 654 321
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-400 dark:text-[#8E918F] text-[11px] font-medium uppercase">
                  Ngày ghi danh
                </span>
                <span className="text-gray-900 dark:text-[#E3E3E3] font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-gray-400">calendar_today</span>
                  {student.joinedAt || '15/08/2024 (Tuần 1)'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-400 dark:text-[#8E918F] text-[11px] font-medium uppercase">
                  Nhóm đồ án lớn
                </span>
                <span className="text-gray-900 dark:text-[#E3E3E3] font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-gray-400">folder_shared</span>
                  Nhóm 01 (Cây đỏ-đen)
                </span>
              </div>
            </div>
          </div>

          {/* Course Progress Statistics Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3]">
                Tiến độ môn học {classCode}
              </span>
              <span className="text-xs text-blue-600 dark:text-[#A8C7FA] font-semibold">
                {rankLabel}
              </span>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Lesson Progress */}
              <div className="bg-[#F0F4F8] dark:bg-[#131314] p-3.5 rounded-2xl border-none flex flex-col justify-between">
                <span className="text-xs text-gray-500 dark:text-[#8E918F] font-medium">Lý thuyết</span>
                <div className="my-1.5">
                  <span className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3]">18</span>
                  <span className="text-xs text-gray-500 dark:text-[#8E918F]">/24 bài</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#282A2C] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#007BFF] dark:bg-[#A8C7FA] h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-xs text-blue-600 dark:text-[#A8C7FA] font-medium mt-1">
                  75% hoàn thành
                </span>
              </div>

              {/* Lab Submissions */}
              <div className="bg-[#F0F4F8] dark:bg-[#131314] p-3.5 rounded-2xl border-none flex flex-col justify-between">
                <span className="text-xs text-gray-500 dark:text-[#8E918F] font-medium">Bài tập Lab</span>
                <div className="my-1.5">
                  <span className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3]">5</span>
                  <span className="text-xs text-gray-500 dark:text-[#8E918F]">/6 bài</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#282A2C] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#007BFF] dark:bg-[#A8C7FA] h-full rounded-full" style={{ width: '83%' }} />
                </div>
                <span className="text-xs text-gray-500 dark:text-[#8E918F] font-medium mt-1">
                  Còn thiếu Lab 06
                </span>
              </div>

              {/* GPA Score */}
              <div className="bg-[#F0F4F8] dark:bg-[#131314] p-3.5 rounded-2xl border-none flex flex-col justify-between">
                <span className="text-xs text-gray-500 dark:text-[#8E918F] font-medium">ĐTB Quá trình</span>
                <div className="my-1.5 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-blue-600 dark:text-[#A8C7FA]">
                    {gpa.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-[#8E918F]">/10</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 dark:text-[#A8C7FA] text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  <span>+0.4 so với GK</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-[#8E918F] mt-1">
                  {gradeClassification}
                </span>
              </div>
            </div>

            {/* Mini Visual Chart: Progress Breakdown */}
            <div className="bg-[#F0F4F8] dark:bg-[#131314] p-4 rounded-2xl border-none flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3]">
                  Tương tác hệ thống đánh giá tự động (Judge)
                </span>
                <span className="text-xs text-gray-500 dark:text-[#8E918F] mt-0.5">
                  38 lượt nộp code • 34 Accepted • 4 Time Limit
                </span>
              </div>

              <svg className="w-12 h-12 transform -rotate-90 shrink-0" viewBox="0 0 36 36">
                <circle
                  className="stroke-[#E1E5EA] dark:stroke-[#282A2C]"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="15.5"
                  strokeWidth="3"
                />
                <circle
                  className="stroke-blue-600 dark:stroke-[#A8C7FA]"
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
              <span className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3]">
                Lịch sử tương tác học tập gần đây
              </span>
              <span className="text-xs text-gray-400 dark:text-[#8E918F]">
                Cập nhật tức thời
              </span>
            </div>

            <div className="relative pl-6 flex flex-col gap-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E1E5EA] dark:before:bg-[#282A2C]">
              {/* Event 1 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#007BFF] dark:bg-[#A8C7FA] ring-4 ring-white dark:ring-[#1E1F20]" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3]">
                    Hoàn thành bài: &apos;Segment Tree - Cây phân đoạn&apos;
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                    2 giờ trước
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-[#C4C7C5] leading-relaxed">
                  Vượt qua 10/10 test cases của bài toán Range Minimum Query (RMQ) với độ phức tạp O(log N).
                </p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Điểm quiz: 100/100
                </span>
              </div>

              {/* Event 2 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#1E1F20]" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3]">
                    Nộp lại bài: &apos;Lab 01 - Cấu trúc dữ liệu Tự cân bằng&apos;
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                    Hôm qua, 21:40
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-[#C4C7C5] leading-relaxed">
                  Đã tối ưu hóa hàm xoay trái/xoay phải trên AVL Tree để khắc phục lỗi tràn bộ nhớ đệm.
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[11px] text-gray-600 dark:text-[#C4C7C5] bg-[#E1E5EA] dark:bg-[#282A2C] px-2.5 py-0.5 rounded-full">
                    commit #f48a1c9
                  </span>
                  <span className="text-xs text-gray-700 dark:text-[#E3E3E3] font-semibold">
                    Điểm chấm: 9.5
                  </span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-gray-400 ring-4 ring-white dark:ring-[#1E1F20]" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-800 dark:text-[#E3E3E3]">
                    Tham gia thảo luận diễn đàn lớp
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                    3 ngày trước
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-[#C4C7C5] leading-relaxed">
                  Đã trả lời câu hỏi của bạn Phạm Quỳnh Anh về thuật toán Tarjan tìm thành phần liên thông mạnh.
                </p>
              </div>
            </div>
          </div>

          {/* Instructor Internal Notes */}
          <div className="flex flex-col gap-2.5 bg-[#F0F4F8] dark:bg-[#131314] p-4 rounded-3xl border-none">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-1.5"
                htmlFor="instructor-note"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-[#A8C7FA]">
                  lock
                </span>
                Ghi chú nội bộ của Giảng viên (Riêng tư)
              </label>
              <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                Chỉ ban giảng dạy thấy
              </span>
            </div>

            <textarea
              id="instructor-note"
              value={instructorNote}
              onChange={(e) => setInstructorNote(e.target.value)}
              className="w-full p-3.5 bg-white dark:bg-[#1E1F20] rounded-2xl text-xs text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] border-none outline-none resize-none leading-relaxed"
              placeholder="Nhập nhận xét, điểm mạnh, cần lưu ý khi chấm đồ án cuối kỳ..."
              rows={3}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNote}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1 cursor-pointer border-none ${
                  isNoteSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5]'
                }`}
                id="save-note-btn"
              >
                {isNoteSaved ? 'Đã lưu ✓' : 'Lưu ghi chú'}
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 bg-white dark:bg-[#1E1F20] border-none flex flex-col gap-3 shadow-lg">
          {/* Primary Communication Action */}
          <button
            type="button"
            onClick={handleSendMessage}
            className="w-full py-3 px-4 bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold rounded-full flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Gửi tin nhắn riêng cho {firstName}
          </button>

          {/* Danger Zone: Expel / Unenroll with Confirmation Layer */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUnenrollConfirm(!showUnenrollConfirm)}
              className="w-full py-3 px-4 bg-red-100 dark:bg-[#F2B8B5] text-red-900 dark:text-[#601410] hover:brightness-95 text-xs font-semibold rounded-full transition-colors flex items-center justify-center gap-2 border-none cursor-pointer"
              id="btn-unenroll-trigger"
            >
              <span className="material-symbols-outlined text-[18px]">
                person_remove
              </span>
              Hủy ghi danh / Mời ra khỏi lớp {classCode}
            </button>

            {/* Inline Popover Confirmation */}
            {showUnenrollConfirm && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 p-5 bg-white dark:bg-[#1E1F20] rounded-3xl shadow-2xl border-none flex flex-col gap-3 z-30 animate-in fade-in slide-in-from-bottom-2"
                id="unenroll-confirm-modal"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-[#3C1919] flex items-center justify-center text-red-700 dark:text-[#F28B82] shrink-0">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] block">
                      Xác nhận hủy ghi danh?
                    </span>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F] mt-1 leading-relaxed">
                      Sinh viên <strong className="text-gray-900 dark:text-[#E3E3E3]">{student.name}</strong> sẽ bị xóa quyền truy cập tài liệu bài giảng, hệ thống nộp bài Lab và đồ án nhóm của {classCode}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-none">
                  <button
                    type="button"
                    onClick={() => setShowUnenrollConfirm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    id="cancel-unenroll-btn"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmUnenroll}
                    className="px-4 py-2 bg-red-100 dark:bg-[#F2B8B5] text-red-900 dark:text-[#601410] hover:brightness-95 text-xs font-semibold rounded-full shadow-sm transition-all cursor-pointer border-none"
                    id="confirm-unenroll-btn"
                  >
                    Đồng ý rút khỏi lớp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
