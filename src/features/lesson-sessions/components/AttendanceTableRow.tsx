'use client';

import React from 'react';
import { AttendanceStatus, Student } from '../types';

interface AttendanceTableRowProps {
  index: number;
  student: Student;
  status: AttendanceStatus | null;
  note: string;
  onStatusChange: (studentId: string, status: AttendanceStatus | null) => void;
  onNoteChange: (studentId: string, note: string) => void;
}

export const AttendanceTableRow: React.FC<AttendanceTableRowProps> = ({
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

  return (
    <tr className="hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C]/40 transition-colors">
      <td className="py-3 px-4 text-center font-mono text-xs text-[#747775] dark:text-[#8E918F]">
        {String(index + 1).padStart(2, '0')}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] font-bold flex items-center justify-center text-xs shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate text-xs">
              {student.studentName}
            </span>
            <span className="font-mono text-[11px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
              {student.studentCode}
            </span>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center p-1 bg-[#F0F4F9] dark:bg-[#282A2C] rounded-full gap-1 w-fit mx-auto border-none">
          <button
            type="button"
            onClick={() => onStatusChange(student.studentId, status === 'PRESENT' ? null : 'PRESENT')}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border-none cursor-pointer ${
              status === 'PRESENT'
                ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] font-semibold'
                : 'text-[#747775] dark:text-[#8E918F] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] font-medium'
            }`}
          >
            Có mặt
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(student.studentId, status === 'LATE' ? null : 'LATE')}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border-none cursor-pointer ${
              status === 'LATE'
                ? 'bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] font-semibold'
                : 'text-[#747775] dark:text-[#8E918F] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] font-medium'
            }`}
          >
            Đi muộn
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(student.studentId, status === 'ABSENT' ? null : 'ABSENT')}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border-none cursor-pointer ${
              status === 'ABSENT'
                ? 'bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] font-semibold'
                : 'text-[#747775] dark:text-[#8E918F] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] font-medium'
            }`}
          >
            Vắng
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(student.studentId, status === 'EXCUSED' ? null : 'EXCUSED')}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border-none cursor-pointer ${
              status === 'EXCUSED'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] font-semibold'
                : 'text-[#747775] dark:text-[#8E918F] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] font-medium'
            }`}
          >
            Phép
          </button>
        </div>
      </td>
      <td className="py-3 px-4">
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(student.studentId, e.target.value)}
          placeholder="Thêm ghi chú..."
          className="w-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] px-4 py-2 rounded-full text-xs text-[#1F1F1F] dark:text-[#E3E3E3] placeholder-[#8E918F] outline-none border-none transition-all"
        />
      </td>
      <td className="py-3 px-4 text-center">
        <button
          type="button"
          title="Lịch sử điểm danh"
          className="text-[#747775] dark:text-[#8E918F] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] p-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
        </button>
      </td>
    </tr>
  );
};
