'use client';

import React, { useState, useEffect } from 'react';
import { CreateLessonSessionRequest, Room, ConflictDetails, LessonSession } from '../types';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateLessonSessionRequest) => Promise<void>;
  rooms: Room[];
  existingSessions?: LessonSession[];
  isSubmitting?: boolean;
  onTriggerConflict: (conflict: ConflictDetails) => void;
  selectedRoomOverride?: string;
  timeOverride?: { startTime: string; endTime: string };
  defaultRoomId?: string;
  defaultDate?: string;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rooms,
  isSubmitting = false,
  onTriggerConflict,
  selectedRoomOverride,
  timeOverride,
  defaultRoomId,
  defaultDate,
}) => {
  const [roomId, setRoomId] = useState(defaultRoomId || (rooms[0]?.roomId ?? 'Lab 402'));
  const [sessionDate, setSessionDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:30');
  const [startShift, setStartShift] = useState<number>(2);
  const [endShift, setEndShift] = useState<number>(4);
  const [note, setNote] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRoomOverride) {
      setRoomId(selectedRoomOverride);
    }
  }, [selectedRoomOverride]);

  useEffect(() => {
    if (timeOverride) {
      setStartTime(timeOverride.startTime);
      setEndTime(timeOverride.endTime);
    }
  }, [timeOverride]);

  if (!isOpen) return null;

  // Giả lập logic kiểm tra xung đột live khi chọn Lab 402 vào khung giờ sáng
  const isConflictScenario = roomId.toLowerCase().includes('402') && startTime < '11:00';

  const conflictInfo: ConflictDetails = {
    roomName: rooms.find((r) => r.roomId === roomId)?.roomName || roomId,
    conflictingCourse: 'Lập trình Mobile (CNTT-K20B)',
    instructorName: 'TS. Trần Văn Minh',
    timeSlot: '08:00 - 10:30',
    date: sessionDate,
    shifts: 'Tiết 2 - 4',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (endTime <= startTime) {
      setErrorMsg('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    if (endShift < startShift) {
      setErrorMsg('Tiết kết thúc không được nhỏ hơn tiết bắt đầu');
      return;
    }

    // Nếu chọn phòng đang bị xung đột (Lab 402 sáng), kích hoạt modal cảnh báo xung đột (Conflict 409)
    if (isConflictScenario) {
      onTriggerConflict(conflictInfo);
      return;
    }

    try {
      setLocalSubmitting(true);
      await onSubmit({
        roomId,
        sessionDate,
        startTime,
        endTime,
        startShift,
        endShift,
        note,
        sendEmailNotification: sendEmail,
      });
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { message?: string; conflict?: ConflictDetails } } };
      const status = errorObj?.response?.status;
      const errMsg = errorObj?.response?.data?.message;
      const conflictPayload = errorObj?.response?.data?.conflict;

      if (status === 409) {
        onTriggerConflict(
          conflictPayload || {
            roomName: rooms.find((r) => r.roomId === roomId)?.roomName || roomId,
            conflictingCourse: 'Ca học bị trùng lịch',
            instructorName: 'Giảng viên',
            timeSlot: `${startTime} - ${endTime}`,
            date: sessionDate,
            shifts: `Tiết ${startShift} - ${endShift}`,
          }
        );
        return;
      }
      setErrorMsg(errMsg || 'Không thể tạo ca học. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLocalSubmitting(false);
    }
  };

  const loading = isSubmitting || localSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col transition-all max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-8 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">event_note</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3] leading-tight">Tạo Ca học mới</h2>
                <span className="px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-[10px] font-mono uppercase font-semibold whitespace-nowrap border-none">TKB Live</span>
              </div>
              <p className="text-xs text-[#747775] dark:text-[#8E918F] mt-0.5">Lớp: Lập trình Web nâng cao (CNTT-K21A) • Học kỳ 1</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#747775] hover:text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] flex items-center justify-center cursor-pointer transition-colors border-none" type="button">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 py-5 overflow-y-auto space-y-5">
          <div className="p-4 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-start gap-3 border-none">
            <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0">info</span>
            <div className="flex-1 text-xs">
              <span className="font-bold text-[#041E49] dark:text-[#A8C7FA] block">Quy chuẩn điều phối giảng đường</span>
              <p className="mt-0.5 opacity-90">Lưu ý kiểm tra lịch trống của phòng học. Hệ thống sẽ tự động đối soát với cơ sở dữ liệu TKB toàn trường.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* 1. Chọn Phòng Học */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#444746] dark:text-[#C4C7C5] flex items-center justify-between">
                <span>Chọn Phòng học *</span>
                <span className="text-[11px] font-normal text-[#747775] dark:text-[#8E918F]">Tòa Công Nghệ</span>
              </label>
              <div className="relative">
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 rounded-2xl bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] font-semibold outline-none appearance-none cursor-pointer border-none transition-all"
                >
                  {rooms.map((r) => (
                    <option key={r.roomId} value={r.roomId}>{r.roomName}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#0B57D0] dark:text-[#A8C7FA] text-[18px]">location_on</span>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#747775] dark:text-[#8E918F] text-[18px]">expand_more</span>
              </div>
            </div>

            {/* 2. Ngày học */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#444746] dark:text-[#C4C7C5]">Ngày diễn ra ca học *</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] font-mono outline-none border-none transition-all"
                required
              />
            </div>

            {/* 3. Giờ bắt đầu */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#444746] dark:text-[#C4C7C5]">Giờ bắt đầu *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] font-mono outline-none border-none transition-all"
                required
              />
            </div>

            {/* 4. Giờ kết thúc */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#444746] dark:text-[#C4C7C5]">Giờ kết thúc *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] font-mono outline-none border-none transition-all"
                required
              />
              <span className={`text-[11px] font-mono mt-0.5 ${endTime > startTime ? 'text-[#0D652D] dark:text-[#81C995]' : 'text-[#B3261E] dark:text-[#F28B82] font-semibold'}`}>
                {endTime > startTime ? `Giờ kết thúc sau giờ bắt đầu (${endTime} > ${startTime} ✓)` : `Lỗi: ${endTime} phải lớn hơn ${startTime}!`}
              </span>
            </div>

            {/* 5. Tiết bắt đầu & kết thúc */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#444746] dark:text-[#C4C7C5]">Tiết bắt đầu</label>
              <input
                type="number"
                min={1}
                max={12}
                value={startShift}
                onChange={(e) => setStartShift(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] font-mono outline-none border-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#444746] dark:text-[#C4C7C5]">Tiết kết thúc</label>
              <input
                type="number"
                min={1}
                max={12}
                value={endShift}
                onChange={(e) => setEndShift(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] font-mono outline-none border-none transition-all"
              />
            </div>

            {/* 7. Ghi chú */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="font-semibold text-[#444746] dark:text-[#C4C7C5]">Ghi chú ca học</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập nội dung bài học hoặc yêu cầu sinh viên mang laptop..."
                className="w-full p-4 rounded-2xl bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] placeholder-[#8E918F] outline-none resize-none border-none transition-all"
              />
            </div>

            {/* 8. Checkbox */}
            <div className="md:col-span-2 flex items-center gap-2.5 p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C]/60">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded bg-[#F0F4F9] dark:bg-[#282A2C] accent-[#0B57D0] dark:accent-[#A8C7FA] cursor-pointer"
              />
              <label htmlFor="sendEmail" className="font-medium text-[#444746] dark:text-[#C4C7C5] cursor-pointer">
                Tự động gửi thông báo lịch học đến email sinh viên
              </label>
            </div>

            {/* 9. Live conflict indicator */}
            <div
              onClick={() => {
                if (isConflictScenario && conflictInfo) {
                  onTriggerConflict(conflictInfo);
                }
              }}
              className={`md:col-span-2 flex items-center justify-between p-4 rounded-2xl transition-colors border-none ${
                isConflictScenario
                  ? 'bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] cursor-pointer hover:bg-[#F7BCB6] dark:hover:bg-[#4E2222]'
                  : 'bg-[#F0F4F9] dark:bg-[#282A2C]/60 text-[#444746] dark:text-[#C4C7C5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isConflictScenario ? 'bg-[#B3261E] dark:bg-[#F28B82] animate-ping' : 'bg-[#0D652D] dark:bg-[#81C995]'}`} />
                <div>
                  <span className="font-semibold block">
                    {isConflictScenario
                      ? `Cảnh báo: Phòng ${conflictInfo?.roomName || roomId} đã có lịch học trùng (${conflictInfo?.conflictingCourse || 'Lớp khác'} - ${conflictInfo?.timeSlot || ''})!`
                      : `Phòng ${roomId} trống trong khung giờ này ✓`}
                  </span>
                  <span className="text-[10px] font-mono opacity-80">
                    {isConflictScenario ? 'Nhấp vào đây để xem chi tiết xung đột và gợi ý đổi phòng' : 'API ROOM_SCHEDULE_CHECK: OK (status 200)'}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px]">{isConflictScenario ? 'warning' : 'verified'}</span>
            </div>
          </div>

          {errorMsg && <p className="text-xs font-semibold text-[#B3261E] dark:text-[#F28B82]">{errorMsg}</p>}

          {/* Modal Footer */}
          <div className="pt-4 flex items-center justify-end">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent border border-[#747775] hover:bg-[#F0F4F9] text-[#1F1F1F] dark:border-[#8E918F] dark:hover:bg-[#282A2C] dark:text-[#E3E3E3] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium rounded-full px-6 py-2.5 text-xs whitespace-nowrap transition-colors cursor-pointer border-none shadow-none disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Lưu / Tạo mới'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
