'use client';

import React, { useState } from 'react';
import { AttendanceStatus, Student } from '../types';
import { AttendanceTableRow } from './AttendanceTableRow';

interface AttendanceTableProps {
  students: Student[];
  attendanceMap: Record<string, { status: AttendanceStatus | null; note: string }>;
  onStatusChange: (studentId: string, status: AttendanceStatus | null) => void;
  onNoteChange: (studentId: string, note: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  students,
  attendanceMap,
  onStatusChange,
  onNoteChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | AttendanceStatus | 'UNCHECKED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'ALL'>(10);

  const filteredStudents = students.filter((stu) => {
    const record = attendanceMap[stu.studentId];
    const stuStatus = record?.status ?? null;
    const matchesSearch =
      stu.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.studentCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'UNCHECKED') return stuStatus === null;
    return stuStatus === filterCategory;
  });

  const totalItems = filteredStudents.length;
  const effectivePageSize = pageSize === 'ALL' ? totalItems : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / (pageSize === 'ALL' ? totalItems || 1 : pageSize)));

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * effectivePageSize;
  const paginatedStudents =
    pageSize === 'ALL'
      ? filteredStudents
      : filteredStudents.slice(startIndex, startIndex + effectivePageSize);

  const presentCount = students.filter(
    (s) => attendanceMap[s.studentId]?.status === 'PRESENT'
  ).length;
  const lateCount = students.filter((s) => attendanceMap[s.studentId]?.status === 'LATE').length;
  const absentCount = students.filter(
    (s) => ['ABSENT', 'EXCUSED'].includes(attendanceMap[s.studentId]?.status || '')
  ).length;
  const uncheckedCount = students.filter(
    (s) => !attendanceMap[s.studentId]?.status
  ).length;

  const handleFilterChange = (cat: 'ALL' | AttendanceStatus | 'UNCHECKED') => {
    setFilterCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 flex flex-col gap-4 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined text-[18px] text-[#747775] dark:text-[#8E918F] absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo tên hoặc mã SV..."
            className="w-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] pl-9 pr-12 py-2.5 rounded-full text-[#1F1F1F] dark:text-[#E3E3E3] text-xs sm:text-sm placeholder-[#8E918F] outline-none border-none transition-all"
            type="text"
          />
          <kbd className="font-mono text-[10px] text-[#747775] dark:text-[#8E918F] bg-[#E1E5EA] dark:bg-[#333537] px-1.5 py-0.5 rounded absolute right-2.5 top-1/2 -translate-y-1/2">
            ⌘F
          </kbd>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#F0F4F9] dark:bg-[#1E1F20] rounded-full max-w-full">
          <button
            onClick={() => handleFilterChange('ALL')}
            type="button"
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border-none cursor-pointer ${
              filterCategory === 'ALL'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                : 'text-[#444746] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C]'
            }`}
          >
            <span>Tất cả</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/70 text-[#041E49] dark:bg-[#282A2C] dark:text-[#A8C7FA] font-bold">
              {students.length}
            </span>
          </button>
          <button
            onClick={() => handleFilterChange('PRESENT')}
            type="button"
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border-none cursor-pointer ${
              filterCategory === 'PRESENT'
                ? 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]'
                : 'text-[#444746] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C]'
            }`}
          >
            <span>Có mặt</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#0D652D]/15 dark:bg-[#81C995]/20 text-[#0D652D] dark:text-[#81C995] font-bold">
              {presentCount}
            </span>
          </button>
          <button
            onClick={() => handleFilterChange('LATE')}
            type="button"
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border-none cursor-pointer ${
              filterCategory === 'LATE'
                ? 'bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784]'
                : 'text-[#444746] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C]'
            }`}
          >
            <span>Đi muộn</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#725200]/15 dark:bg-[#FFB784]/20 text-[#725200] dark:text-[#FFB784] font-bold">
              {lateCount}
            </span>
          </button>
          <button
            onClick={() => handleFilterChange('ABSENT')}
            type="button"
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border-none cursor-pointer ${
              filterCategory === 'ABSENT'
                ? 'bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82]'
                : 'text-[#444746] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C]'
            }`}
          >
            <span>Vắng mặt</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#B3261E]/15 dark:bg-[#F28B82]/20 text-[#B3261E] dark:text-[#F28B82] font-bold">
              {absentCount}
            </span>
          </button>
          {uncheckedCount > 0 && (
            <button
              onClick={() => handleFilterChange('UNCHECKED')}
              type="button"
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border-none cursor-pointer ${
                filterCategory === 'UNCHECKED'
                  ? 'bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#333537] dark:text-[#E3E3E3]'
                  : 'text-[#444746] hover:text-[#1F1F1F] dark:text-[#C4C7C5] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C]'
              }`}
            >
              <span>Chưa điểm danh</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#747775]/20 dark:bg-[#8E918F]/20 text-[#444746] dark:text-[#C4C7C5] font-bold">
                {uncheckedCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F0F4F9] dark:bg-[#282A2C]/60 text-[#747775] dark:text-[#8E918F] text-xs uppercase tracking-wider">
              <th className="py-3 px-4 w-14 text-center font-mono rounded-l-2xl">STT</th>
              <th className="py-3 px-4 min-w-[240px]">Học sinh &amp; Sinh viên</th>
              <th className="py-3 px-4 min-w-[340px] text-center">Trạng thái điểm danh (1-Click)</th>
              <th className="py-3 px-4 min-w-[220px]">Ghi chú cá nhân</th>
              <th className="py-3 px-4 w-12 text-center rounded-r-2xl" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F9] dark:divide-[#282A2C]/50 text-[#444746] dark:text-[#C4C7C5] text-xs">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#747775] dark:text-[#8E918F]">
                  Không tìm thấy sinh viên nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student, idx) => {
                const globalIndex = startIndex + idx;
                const record = attendanceMap[student.studentId] || { status: null, note: '' };
                return (
                  <AttendanceTableRow
                    key={student.studentId}
                    index={globalIndex}
                    student={student}
                    status={record.status}
                    note={record.note}
                    onStatusChange={onStatusChange}
                    onNoteChange={onNoteChange}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#747775] dark:text-[#8E918F]">
        <div className="flex items-center gap-2">
          <span>
            Hiển thị{' '}
            <strong className="text-[#1F1F1F] dark:text-[#E3E3E3] font-bold">
              {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + effectivePageSize, totalItems)}
            </strong>{' '}
            trong tổng số <strong className="text-[#1F1F1F] dark:text-[#E3E3E3] font-bold">{students.length}</strong> sinh viên
          </span>
          <span className="text-[#747775] dark:text-[#8E918F]">•</span>
          <button
            onClick={() => {
              setPageSize(pageSize === 'ALL' ? 10 : 'ALL');
              setCurrentPage(1);
            }}
            className="text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border-none cursor-pointer"
          >
            {pageSize === 'ALL' ? 'Chia trang (10 SV/trang)' : 'Xem tất cả 45 SV'}
          </button>
        </div>

        {pageSize !== 'ALL' && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="px-3 py-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] disabled:opacity-40 whitespace-nowrap transition-colors border-none cursor-pointer"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-full font-mono text-xs transition-all whitespace-nowrap border-none cursor-pointer ${
                  safeCurrentPage === pageNum
                    ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#A8C7FA] dark:text-[#062E6F] font-bold'
                    : 'hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="px-3 py-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] disabled:opacity-40 whitespace-nowrap transition-colors border-none cursor-pointer"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
