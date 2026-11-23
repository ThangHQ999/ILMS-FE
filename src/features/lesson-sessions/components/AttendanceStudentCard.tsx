'use client';

import React from 'react';
import { AttendanceStatus, Student } from '../types';

interface AttendanceStudentCardProps {
  index: number;
  student: Student;
  status: AttendanceStatus | null;
  note: string;
  onStatusChange: (studentId: string, status: AttendanceStatus | null) => void;
  onNoteChange: (studentId: string, note: string) => void;
}

export const AttendanceStudentCard: React.FC<AttendanceStudentCardProps> = ({
  index,
  student,
  status,
  note,
  onStatusChange,
  onNoteChange,
}) => {
  const initials = student.studentName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const getStatusBadge = () => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]">
            ✓ Có mặt
          </span>
        );
      case 'LATE':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784]">
            ⏱ Đi muộn
          </span>
        );
      case 'ABSENT':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82]">
            ✗ Vắng mặt
          </span>
        );
      case 'EXCUSED':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]">
            ✉ Có phép
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] text-[#747775] dark:text-[#8E918F] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#282A2C]">
            Chưa điểm danh
          </span>
        );
    }
  };

  return (
    <div className="bg-[#F0F4F9]/60 dark:bg-[#282A2C]/40 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]/70 rounded-2xl p-3.5 flex flex-col gap-3 transition-colors border border-black/5 dark:border-white/5">
      {/* Top Student Info Row */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-xs font-semibold text-[#747775] dark:text-[#8E918F] w-6 shrink-0">
            #{String(index + 1).padStart(2, '0')}
          </span>
          <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] font-bold flex items-center justify-center text-xs shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
              {student.studentName}
            </span>
            <span className="font-mono text-[11px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
              {student.studentCode}
            </span>
          </div>
        </div>
        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* 4 Attendance 1-Click Action Buttons */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-white dark:bg-[#1E1F20] rounded-xl border border-black/5 dark:border-white/5">
        <button
          type="button"
          onClick={() => onStatusChange(student.studentId, status === 'PRESENT' ? null : 'PRESENT')}
          className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            status === 'PRESENT'
              ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] shadow-xs'
              : 'text-[#747775] dark:text-[#8E918F] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
          }`}
        >
          <span>Có mặt</span>
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(student.studentId, status === 'LATE' ? null : 'LATE')}
          className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            status === 'LATE'
              ? 'bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] shadow-xs'
              : 'text-[#747775] dark:text-[#8E918F] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
          }`}
        >
          <span>Đi muộn</span>
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(student.studentId, status === 'ABSENT' ? null : 'ABSENT')}
          className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            status === 'ABSENT'
              ? 'bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] shadow-xs'
              : 'text-[#747775] dark:text-[#8E918F] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
          }`}
        >
          <span>Vắng</span>
        </button>
        <button
          type="button"
          onClick={() => onStatusChange(student.studentId, status === 'EXCUSED' ? null : 'EXCUSED')}
          className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all border-none cursor-pointer ${
            status === 'EXCUSED'
              ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] shadow-xs'
              : 'text-[#747775] dark:text-[#8E918F] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
          }`}
        >
          <span>Phép</span>
        </button>
      </div>

      {/* Note Input */}
      <div>
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(student.studentId, e.target.value)}
          placeholder="Thêm ghi chú cá nhân cho SV..."
          className="w-full bg-white dark:bg-[#1E1F20] px-3.5 py-2 rounded-xl text-xs text-[#1F1F1F] dark:text-[#E3E3E3] placeholder-[#8E918F] outline-none border border-black/5 dark:border-white/5 transition-all"
        />
      </div>
    </div>
  );
};
