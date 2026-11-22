'use client';

import React, { useState, useEffect } from 'react';
import { CustomSelect } from '@/components/shared';
import { ACADEMIC_SHIFTS } from '@/features/timetable/constants';
import { CreateLessonSessionRequest, Room, ConflictDetails, LessonSession } from '../types';

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  session?: LessonSession | null;
  rooms: Room[];
  existingSessions?: LessonSession[];
  isSubmitting?: boolean;
  onSubmit: (dto: CreateLessonSessionRequest) => Promise<void>;
  onDelete?: (sessionId: string) => Promise<void>;
  onTriggerConflict?: (conflict: ConflictDetails) => void;
  defaultDate?: string;
  defaultShift?: number;
}

export const SessionFormModal: React.FC<SessionFormModalProps> = ({
  isOpen,
  onClose,
  mode = 'create',
  session,
  rooms,
  isSubmitting = false,
  onSubmit,
  onDelete,
  onTriggerConflict,
  defaultDate,
  defaultShift = 1,
}) => {
  const isEdit = mode === 'edit' && Boolean(session);

  const [roomId, setRoomId] = useState<string>(() => {
    return session?.roomId || rooms[0]?.roomId || 'Lab 402';
  });
  const [sessionDate, setSessionDate] = useState<string>(() => {
    return session?.sessionDate || defaultDate || new Date().toISOString().split('T')[0];
  });
  const [startShift, setStartShift] = useState<number>(() => {
    return session?.startShift || defaultShift;
  });
  const [endShift, setEndShift] = useState<number>(() => {
    return session?.endShift || Math.min(12, defaultShift + 2);
  });
  const [startTime, setStartTime] = useState<string>(() => {
    return session?.startTime || '07:30';
  });
  const [endTime, setEndTime] = useState<string>(() => {
    return session?.endTime || '09:50';
  });
  const [note, setNote] = useState<string>(() => {
    return session?.note || '';
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (session && mode === 'edit') {
      setRoomId(session.roomId || rooms[0]?.roomId || 'Lab 402');
      setSessionDate(session.sessionDate);
      setStartShift(session.startShift || 1);
      setEndShift(session.endShift || 3);
      setStartTime(session.startTime || '07:30');
      setEndTime(session.endTime || '09:50');
      setNote(session.note || '');
    } else if (mode === 'create') {
      if (defaultDate) setSessionDate(defaultDate);
      if (defaultShift) {
        setStartShift(defaultShift);
        setEndShift(Math.min(12, defaultShift + 2));
        const startInfo = ACADEMIC_SHIFTS.find((s) => s.shift === defaultShift);
        const endInfo = ACADEMIC_SHIFTS.find((s) => s.shift === Math.min(12, defaultShift + 2));
        if (startInfo) setStartTime(startInfo.timeRange.split(' - ')[0]);
        if (endInfo) setEndTime(endInfo.timeRange.split(' - ')[1]);
      }
      setNote('');
    }
    setConfirmDelete(false);
    setErrorMsg(null);
  }, [session, mode, defaultDate, defaultShift, rooms, isOpen]);

  if (!isOpen) return null;

  const handleShiftChange = (start: number, end: number) => {
    setStartShift(start);
    setEndShift(end);
    const startInfo = ACADEMIC_SHIFTS.find((s) => s.shift === start);
    const endInfo = ACADEMIC_SHIFTS.find((s) => s.shift === end);
    if (startInfo) setStartTime(startInfo.timeRange.split(' - ')[0]);
    if (endInfo) setEndTime(endInfo.timeRange.split(' - ')[1]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (endShift < startShift) {
      setErrorMsg('Tiết kết thúc không được nhỏ hơn tiết bắt đầu');
      return;
    }
    if (endTime <= startTime) {
      setErrorMsg('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    // Check conflict demo
    const isConflictScenario =
      !isEdit && roomId.toLowerCase().includes('402') && startTime < '11:00';
    if (isConflictScenario && onTriggerConflict) {
      onTriggerConflict({
        roomName: rooms.find((r) => r.roomId === roomId)?.roomName || roomId,
        conflictingCourse: 'Lập trình Mobile (CNTT-K20B)',
        instructorName: 'TS. Trần Văn Minh',
        timeSlot: `${startTime} - ${endTime}`,
        date: sessionDate,
        shifts: `Tiết ${startShift} - ${endShift}`,
      });
      return;
    }

    try {
      await onSubmit({
        roomId,
        sessionDate,
        startTime,
        endTime,
        startShift,
        endShift,
        note,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu ca học');
    }
  };

  const handleDelete = async () => {
    if (!session || !onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(session.lessonSessionId);
      setIsDeleting(false);
      onClose();
    } catch (err) {
      setIsDeleting(false);
      setErrorMsg(err instanceof Error ? err.message : 'Không thể xóa ca học lúc này');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1E1F20] rounded-3xl p-6 sm:p-7 shadow-2xl border-none ring-0 outline-none transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">
                {isEdit ? 'edit_calendar' : 'add_task'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3]">
                {isEdit ? 'Chỉnh sửa Ca học' : 'Lên lịch Ca học mới'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                {isEdit ? `Mã ca: #${session?.lessonSessionId}` : 'Thêm ca học thủ công vào thời khóa biểu lớp'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] flex items-center justify-center text-gray-600 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ngày học & Phòng học */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                Ngày học <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] text-xs font-medium outline-none border border-transparent focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                Phòng học <span className="text-red-500">*</span>
              </label>
              <CustomSelect<string>
                value={roomId}
                onChange={setRoomId}
                options={rooms.map((r) => ({
                  value: r.roomId,
                  label: r.roomName,
                }))}
                variant="pill"
                className="w-full"
              />
            </div>
          </div>

          {/* Tiết bắt đầu & Tiết kết thúc */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                Tiết bắt đầu
              </label>
              <select
                value={startShift}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handleShiftChange(val, Math.max(val, endShift));
                }}
                className="w-full px-3 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] text-xs font-medium outline-none border border-transparent focus:border-[#0B57D0]"
              >
                {ACADEMIC_SHIFTS.map((s) => (
                  <option key={s.shift} value={s.shift}>
                    Tiết {s.shift} ({s.timeRange.split(' - ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                Tiết kết thúc
              </label>
              <select
                value={endShift}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handleShiftChange(Math.min(startShift, val), val);
                }}
                className="w-full px-3 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] text-xs font-medium outline-none border border-transparent focus:border-[#0B57D0]"
              >
                {ACADEMIC_SHIFTS.map((s) => (
                  <option key={s.shift} value={s.shift}>
                    Tiết {s.shift} ({s.timeRange.split(' - ')[1]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Khung giờ tương ứng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] text-xs font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] text-xs font-mono outline-none"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
              Ghi chú / Nội dung bài giảng
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Thực hành Lab 03 - Server Components. Yêu cầu sinh viên mang laptop."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] text-xs outline-none border border-transparent focus:border-[#0B57D0] resize-none"
            />
          </div>

          {/* Confirm delete prompt when in edit mode */}
          {confirmDelete && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                Bạn có chắc chắn muốn xóa ca học này? Ca học sẽ bị gỡ khỏi thời khóa biểu của lớp.
              </p>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 dark:text-[#C4C7C5] hover:bg-gray-200 dark:hover:bg-[#282A2C] border-none cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors border-none cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-2.5">
            {isEdit && onDelete && !confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Xóa ca học</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] text-xs font-semibold text-gray-800 dark:text-[#E3E3E3] transition-colors border-none cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] hover:bg-[#0842a0] dark:hover:bg-[#8ab4f8] text-xs font-semibold flex items-center gap-1.5 transition-colors border-none cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSubmitting ? 'sync' : isEdit ? 'save' : 'add'}
                </span>
                <span>{isSubmitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo ca học'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
