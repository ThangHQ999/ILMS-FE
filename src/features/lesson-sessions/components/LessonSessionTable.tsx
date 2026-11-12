'use client';

import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { LessonSession } from '../types';

interface LessonSessionTableProps {
  sessions: LessonSession[];
  isLoading: boolean;
  onSelectAttendance: (session: LessonSession) => void;
  onOpenCreateModal: () => void;
}

export const LessonSessionTable: React.FC<LessonSessionTableProps> = ({
  sessions,
  isLoading,
  onSelectAttendance,
  onOpenCreateModal,
}) => {
  const { isTeacher } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionDate.includes(searchTerm) ||
      (session.note && session.note.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    const total = session.totalStudents ?? 45;
    const attended = session.attendedCount ?? 0;
    const isFullyAttended = attended >= total && total > 0;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'checked') return isFullyAttended;
    if (statusFilter === 'unchecked') return attended === 0 && session.status === 'SCHEDULED';
    if (statusFilter === 'in_progress') return !isFullyAttended && (attended > 0 || session.status === 'IN_PROGRESS');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action Bar & Filter Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white dark:bg-[#1E1F20] p-4 rounded-3xl border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-semibold whitespace-nowrap border-none">
            <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">calendar_month</span>
            <span className="font-mono">01/10/2024 - 31/12/2024</span>
            <span className="material-symbols-outlined text-[16px] text-[#747775] dark:text-[#8E918F]">arrow_drop_down</span>
          </div>

          {/* Status Dropdown Selector */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-semibold cursor-pointer outline-none transition-all border-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="checked">Đã điểm danh</option>
              <option value="in_progress">Đang điểm danh</option>
              <option value="unchecked">Chưa điểm danh</option>
            </select>
            <span className="material-symbols-outlined text-[18px] text-[#747775] dark:text-[#8E918F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Room / Date Search Field */}
          <div className="relative flex-1 min-w-[220px]">
            <span className="material-symbols-outlined text-[18px] text-[#747775] dark:text-[#8E918F] absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo phòng, ngày hoặc nội dung..."
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] placeholder-[#8E918F] text-xs sm:text-sm outline-none border-none transition-all"
              type="text"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 justify-end">
          <button
            type="button"
            className="flex items-center gap-2 bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] font-medium rounded-full px-5 py-2.5 whitespace-nowrap transition-colors text-xs cursor-pointer border-none shadow-none"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">file_download</span>
            <span>Xuất dữ liệu Excel</span>
          </button>
          {isTeacher && (
            <button
              onClick={onOpenCreateModal}
              className="bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium rounded-full px-6 py-2.5 whitespace-nowrap transition-colors text-xs flex items-center gap-2 cursor-pointer border-none shadow-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Tạo ca học mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col gap-4">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">Kế hoạch ca học chi tiết</h2>
            <p className="text-xs text-[#747775] dark:text-[#8E918F]">Theo dõi lịch trình, giảng đường thực tế và trạng thái điểm danh từng buổi</p>
          </div>
          <span className="text-xs font-mono text-[#747775] dark:text-[#8E918F]">Hiển thị {filteredSessions.length} ca học</span>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F4F9] dark:bg-[#282A2C]/60 text-[#747775] dark:text-[#8E918F] text-xs uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-2xl">Ngày học (Session Date)</th>
                <th className="py-3 px-4">Thời gian &amp; Ca</th>
                <th className="py-3 px-4">Phòng học</th>
                <th className="py-3 px-4">Trạng thái điểm danh</th>
                <th className="py-3 px-4 min-w-[240px]">Ghi chú &amp; Nội dung bài học</th>
                <th className="py-3 px-4 text-right rounded-r-2xl">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F9] dark:divide-[#282A2C]/50 text-[#444746] dark:text-[#C4C7C5] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#747775] dark:text-[#8E918F]">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải kế hoạch ca học...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#747775] dark:text-[#8E918F]">
                    Không tìm thấy ca học nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const total = session.totalStudents ?? 45;
                  const attended = session.attendedCount ?? 0;
                  const isFullyAttended = attended >= total && total > 0;

                  return (
                    <tr key={session.lessonSessionId} className="hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C]/40 transition-colors">
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center font-bold font-mono text-xs">
                            {session.sessionDate.slice(-2)}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">{session.sessionDate}</span>
                              {session.sessionDate === '2024-11-18' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-[10px] uppercase font-bold whitespace-nowrap border-none">Hôm nay</span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">{session.instructorName || 'ThS. Nguyễn Văn An'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">{session.startTime} - {session.endTime}</span>
                          <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">Tiết {session.startShift} - {session.endShift}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <span className="inline-flex items-center gap-1 text-[#444746] dark:text-[#C4C7C5] font-mono font-semibold">
                          <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">computer</span>
                          {session.roomName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        {isFullyAttended ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] text-[11px] font-medium whitespace-nowrap border-none">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Đã điểm danh ({attended}/{total})
                          </span>
                        ) : attended > 0 || session.status === 'IN_PROGRESS' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-[11px] font-medium whitespace-nowrap border-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
                            Đang điểm danh ({attended}/{total})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] text-[#444746] dark:bg-[#282A2C] dark:text-[#C4C7C5] text-[11px] font-medium whitespace-nowrap border-none">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            Chưa điểm danh (0/{total})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <p className="line-clamp-1 font-medium text-[#444746] dark:text-[#C4C7C5]">{session.note || 'Không có ghi chú'}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right align-middle">
                        <button
                          onClick={() => onSelectAttendance(session)}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors cursor-pointer border-none shadow-none ${
                            isFullyAttended
                              ? 'bg-transparent hover:bg-[#F0F4F9] text-[#0B57D0] dark:hover:bg-[#282A2C] dark:text-[#A8C7FA]'
                              : 'bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isFullyAttended ? 'visibility' : 'how_to_reg'}
                          </span>
                          <span>{isFullyAttended ? 'Xem điểm danh' : isTeacher ? 'Điểm danh ngay' : 'Xem chi tiết'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Session Sticky Prompt Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">timer</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">Ca học hôm nay đang sẵn sàng mở điểm danh</h4>
            <p className="text-xs text-[#747775] dark:text-[#8E918F]">Hệ thống mở cổng điểm danh cho giảng viên trước giờ học 15 phút.</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => {
              const live = sessions.find((s) => s.status === 'IN_PROGRESS') || sessions[0];
              if (live) onSelectAttendance(live);
            }}
            className="w-full md:w-auto bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-medium rounded-full px-6 py-2.5 whitespace-nowrap transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer border-none shadow-none"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            <span>Vào điểm danh ca học</span>
          </button>
        </div>
      </div>
    </div>
  );
};
