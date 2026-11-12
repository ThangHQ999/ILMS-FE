'use client';

import React from 'react';
import { ConflictDetails } from '../types';

interface ConflictWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternativeRoom: (roomId: string) => void;
  onApplyNewTime: (startTime: string, endTime: string) => void;
  onEditConflict?: () => void;
  conflictDetails?: ConflictDetails | null;
}

export const ConflictWarningModal: React.FC<ConflictWarningModalProps> = ({
  isOpen,
  onClose,
  onSelectAlternativeRoom,
  onApplyNewTime,
  onEditConflict,
  conflictDetails,
}) => {
  if (!isOpen) return null;

  const roomName = conflictDetails?.roomName || 'Phòng Lab 402';
  const conflictingCourse = conflictDetails?.conflictingCourse || 'Lập trình Mobile - CNTT-K20B';
  const instructorName = conflictDetails?.instructorName || 'TS. Trần Văn Minh';
  const timeSlot = conflictDetails?.timeSlot || '08:00 - 10:30';
  const date = conflictDetails?.date || '2024-11-20';
  const shifts = conflictDetails?.shifts || 'Tiết 2 - 4';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-none shadow-2xl w-full max-w-[550px] overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <header className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#B3261E] dark:text-[#F28B82] leading-tight">
                  Phát hiện xung đột lịch phòng học
                </h2>
                <span className="px-3 py-1 text-[11px] font-medium bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] rounded-full whitespace-nowrap border-none">
                  409 Conflict
                </span>
              </div>
              <p className="text-xs text-[#747775] dark:text-[#8E918F] mt-1">
                Mã lỗi: ROOM_SCHEDULE_CONFLICT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#747775] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] w-8 h-8 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] flex items-center justify-center cursor-pointer transition-colors border-none"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </header>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Conflict Detail Box */}
          <div className="bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] rounded-2xl p-5 text-xs space-y-2.5 border-none">
            <div className="flex items-center gap-2 font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span>{roomName} đã có lịch học trùng trong khung giờ này!</span>
            </div>
            <div className="space-y-1.5 pt-1 opacity-90">
              <div className="flex justify-between items-center">
                <span className="opacity-80">Lớp học trùng:</span>
                <span className="font-semibold">{conflictingCourse}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">Giảng viên:</span>
                <span className="font-semibold">{instructorName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">Thời gian chiếm:</span>
                <span className="font-semibold">{timeSlot} (Ngày {date})</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="opacity-80">Tiết học:</span>
                <span className="font-semibold text-[11px]">{shifts}</span>
              </div>
            </div>
          </div>

          {/* Smart Suggestions */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              <span className="material-symbols-outlined text-[18px] text-[#725200] dark:text-[#FFB784]">lightbulb</span>
              <span>Gợi ý thông minh (Smart Suggestions):</span>
            </div>

            {/* Gợi ý 1: Lab 401 */}
            <div className="p-4 bg-[#F0F4F9] dark:bg-[#282A2C]/60 rounded-2xl flex items-center justify-between border-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#1F1F1F] dark:text-[#E3E3E3]">Phòng Lab 401</span>
                    <span className="text-[11px] font-medium text-[#0D652D] bg-[#C4EED0] dark:text-[#81C995] dark:bg-[#142E20] px-3 py-0.5 rounded-full whitespace-nowrap border-none">Trống</span>
                  </div>
                  <div className="text-[11px] text-[#747775] dark:text-[#8E918F]">Tòa Công nghệ • Sức chứa 50 máy</div>
                </div>
              </div>
              <button
                onClick={() => onSelectAlternativeRoom('Lab 401')}
                className="bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-none"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Chọn phòng này</span>
              </button>
            </div>

            {/* Gợi ý 2: Hội trường B2 */}
            <div className="p-4 bg-[#F0F4F9] dark:bg-[#282A2C]/60 rounded-2xl flex items-center justify-between border-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#1F1F1F] dark:text-[#E3E3E3]">Hội trường B2</span>
                    <span className="text-[11px] font-medium text-[#0D652D] bg-[#C4EED0] dark:text-[#81C995] dark:bg-[#142E20] px-3 py-0.5 rounded-full whitespace-nowrap border-none">Trống</span>
                  </div>
                  <div className="text-[11px] text-[#747775] dark:text-[#8E918F]">Tòa Đa Năng • Sức chứa 80 chỗ</div>
                </div>
              </div>
              <button
                onClick={() => onSelectAlternativeRoom('Hội trường B2')}
                className="bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-none"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Chọn phòng này</span>
              </button>
            </div>

            {/* Gợi ý 3: Khung thời gian kế tiếp */}
            <div className="px-4 py-3 bg-[#F0F4F9] dark:bg-[#282A2C]/60 rounded-2xl flex items-center justify-between text-xs border-none">
              <div className="flex items-center gap-2 text-[#444746] dark:text-[#C4C7C5]">
                <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">schedule</span>
                <span>Hoặc dời sang khung giờ kế tiếp: <strong className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">10:00 - 12:20</strong></span>
              </div>
              <button
                onClick={() => onApplyNewTime('10:00', '12:20')}
                className="text-[#0B57D0] dark:text-[#A8C7FA] font-medium hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap cursor-pointer transition-colors border-none"
                type="button"
              >
                Áp dụng giờ này
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 flex items-center justify-between gap-3">
          <span className="text-xs text-[#B3261E] dark:text-[#F28B82] font-medium truncate">TKB {roomName} đang bận</span>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => (onEditConflict ? onEditConflict() : onClose())}
              className="bg-transparent border border-[#747775] hover:bg-[#F0F4F9] text-[#1F1F1F] dark:border-[#8E918F] dark:hover:bg-[#282A2C] dark:text-[#E3E3E3] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors cursor-pointer"
              type="button"
            >
              Đóng / Chỉnh sửa
            </button>
            <button
              onClick={() => onSelectAlternativeRoom('Lab 401')}
              className="bg-[#C4EED0] hover:bg-[#A8E5BA] text-[#0D652D] dark:bg-[#142E20] dark:hover:bg-[#1A3D2A] dark:text-[#81C995] font-medium rounded-full px-5 py-2.5 text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
              <span>Giải quyết (Chọn Lab 401)</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
