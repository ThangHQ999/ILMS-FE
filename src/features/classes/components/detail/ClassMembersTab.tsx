'use client';

import React, { useState, useMemo } from 'react';
import type { ClassMember } from '../../schemas/class-detail.schema';

interface ClassMembersTabProps {
  members?: ClassMember[];
  currentRole?: 'owner' | 'teacher' | 'student';
  onApproveMember?: (member: ClassMember) => void;
  onRejectMember?: (member: ClassMember) => void;
  onInviteClick?: () => void;
  onToast?: (message: string) => void;
}

export function ClassMembersTab({
  members = [],
  currentRole = 'owner',
  onApproveMember,
  onRejectMember,
  onInviteClick,
  onToast,
}: ClassMembersTabProps) {
  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'good' | 'attention' | 'risk'>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Popovers
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<ClassMember | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    // Only student members in the main table
    const studentList = members.filter((m) => m.role === 'STUDENT');

    return studentList.filter((m) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesCode = m.studentCode?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesEmail && !matchesCode) return false;
      }

      // 2. Status Filter
      if (statusFilter === 'good') {
        if (m.learningStatus !== 'EXCELLENT' && m.learningStatus !== 'ACTIVE') return false;
      } else if (statusFilter === 'attention') {
        if (m.learningStatus !== 'NEED_HELP') return false;
      } else if (statusFilter === 'risk') {
        if (m.learningStatus !== 'AT_RISK') return false;
      }

      return true;
    });
  }, [members, search, statusFilter]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSubjectFilter('all');
    setCurrentPage(1);
    notify('Đã đặt lại bộ lọc về mặc định.');
  };

  const handleExportExcel = () => {
    notify('Đang tạo và tải xuống danh sách học viên (DS_HocVien_CNTT-K22-01.xlsx)...');
  };

  const handleSendEmailAll = () => {
    notify('Đã mở khung soạn thảo email gửi đến toàn thể 42 sinh viên trong lớp.');
  };

  const handleAssignGroup = () => {
    if (selectedIds.length === 0) {
      notify('Vui lòng chọn ít nhất 1 sinh viên để gán nhóm.');
      return;
    }
    notify(`Đã mở hộp thoại phân nhóm đồ án cho ${selectedIds.length} sinh viên đã chọn.`);
  };

  const handleSendReminder = () => {
    if (selectedIds.length === 0) {
      notify('Vui lòng chọn sinh viên cần gửi nhắc nhở.');
      return;
    }
    notify(`Đã gửi thông báo nhắc nhở làm bài tập tới ${selectedIds.length} sinh viên.`);
  };

  const handleTakeAttendance = () => {
    notify('Đã lưu kết quả điểm danh buổi học hôm nay thành công (40/42 có mặt, 95.2%)!');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. CLASS CAPACITY & ENROLLMENT HERO STATS */}
      <div className="relative w-full rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border-[3px] border-slate-300 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        {/* Architectural subtle trace */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-100/40 dark:bg-blue-950/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-48 h-48 rounded-full bg-slate-100/60 dark:bg-slate-800/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Danh sách Học viên &amp; Sĩ số lớp
            </h2>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 font-semibold tracking-wider">
              CNTT-K22-01
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-blue-400">
              verified
            </span>
            <span>Học kỳ II • Niên khóa 2024 - 2025 • Phòng máy Lab A2-404</span>
          </p>

          {/* Key Capacity & Enrolment Badges */}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[19px]">
                groups
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300">Chính thức:</span>
              <span className="text-sm text-slate-900 dark:text-slate-100 font-bold">42</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-slate-400 text-[19px]">
                pending_actions
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Chờ duyệt:</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">0</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-slate-400 text-[19px]">
                event_seat
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Sĩ số tối đa:</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">60</span>
            </div>

            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '70%' }} />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
              70% lấp đầy
            </span>
          </div>
        </div>

        {/* Quick Class Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">file_download</span>
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmailAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">forward_to_inbox</span>
            <span>Gửi email toàn lớp</span>
          </button>

          <button
            type="button"
            onClick={onInviteClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">person_add</span>
            <span>+ Thêm học viên Email / CSV</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER & BATCH ACTION TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search bar */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 rounded-xl w-full sm:w-72 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
              placeholder="Tìm theo Tên, MSSV, Email..."
              type="text"
            />
          </div>

          {/* Filter 1: Trạng thái học tập */}
          <div className="relative inline-block">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 pl-3 pr-8 py-2 rounded-xl cursor-pointer outline-none hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="good">Đang học tốt</option>
              <option value="attention">Cần chú ý</option>
              <option value="risk">Nguy cơ trượt môn</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-2.5 text-slate-400 text-[18px]">
              keyboard_arrow_down
            </span>
          </div>

          {/* Filter 2: Môn học */}
          <div className="relative inline-block">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 pl-3 pr-8 py-2 rounded-xl cursor-pointer outline-none hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
            >
              <option value="all">Môn học: Tất cả môn (4)</option>
              <option value="cs202">CS-202: Cấu trúc dữ liệu &amp; Giải thuật nâng cao</option>
              <option value="cs301">CS-301: Thiết kế Thuật toán &amp; Đồ thị thông minh</option>
              <option value="it101">IT-101: Nhập môn Công nghệ thông tin</option>
              <option value="cs205">CS-205: Lập trình hướng đối tượng (OOP)</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-2.5 text-slate-400 text-[18px]">
              keyboard_arrow_down
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <span className="material-symbols-outlined text-[19px]">filter_alt_off</span>
          </button>
        </div>

        {/* Batch Actions Trigger */}
        <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:inline">
            Thao tác chọn ({selectedIds.length}):
          </span>

          <button
            type="button"
            onClick={handleAssignGroup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">hub</span>
            <span>Gán nhóm</span>
          </button>

          <button
            type="button"
            onClick={handleSendReminder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">notification_important</span>
            <span>Gửi nhắc nhở</span>
          </button>

          <button
            type="button"
            onClick={handleTakeAttendance}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">fact_check</span>
            <span>Điểm danh buổi hôm nay</span>
          </button>
        </div>
      </div>

      {/* 3. ENTERPRISE DATA TABLE */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3.5 pl-4 pr-2 w-10" scope="col">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      selectedIds.length === filteredStudents.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 focus:outline-none cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3" scope="col">
                  Học viên
                </th>
                <th className="py-3.5 px-3" scope="col">
                  Email Sinh viên
                </th>
                <th className="py-3.5 px-3 text-center" scope="col">
                  Chuyên cần
                </th>
                <th className="py-3.5 px-3" scope="col">
                  Đồ thị Tri thức (Nodes)
                </th>
                <th className="py-3.5 px-3 text-center" scope="col">
                  Điểm GPA / PLO
                </th>
                <th className="py-3.5 px-3" scope="col">
                  Trạng thái
                </th>
                <th className="py-3.5 px-3 text-right pr-4" scope="col">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredStudents.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                const isRisk = student.learningStatus === 'AT_RISK';
                const isNeedHelp = student.learningStatus === 'NEED_HELP';

                const rowBg = isRisk
                  ? 'bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100/50 dark:hover:bg-rose-950/40'
                  : isNeedHelp
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/40 dark:hover:bg-amber-950/30'
                  : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40';

                return (
                  <tr key={student.id} className={`${rowBg} transition-colors`}>
                    {/* Checkbox */}
                    <td className="py-3.5 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(student.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {student.avatarUrl ? (
                            <img
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              src={student.avatarUrl}
                              alt={student.name}
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                                isRisk
                                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                                  : isNeedHelp
                                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                                  : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {student.avatar}
                            </div>
                          )}

                          {student.leaderBadge && (
                            <span
                              className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-blue-600 text-white rounded text-[9px] font-bold shadow-2xs"
                              title="Lớp trưởng"
                            >
                              {student.leaderBadge}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                            {student.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            MSSV: {student.studentCode || '22028190'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {student.email}
                    </td>

                    {/* Attendance */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono ${
                          (student.attendanceRate ?? 90) >= 90
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900'
                            : (student.attendanceRate ?? 90) >= 75
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        }`}
                      >
                        {student.attendanceRate ?? 90}%
                      </span>
                    </td>

                    {/* Knowledge Graph Nodes Progress */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col gap-1 w-36">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {student.knowledgeNodesUnlocked ?? 60}/{student.knowledgeNodesTotal ?? 82}
                          </span>
                          <span
                            className={`font-semibold font-mono ${
                              isRisk || isNeedHelp
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {student.knowledgePercent ?? 75}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isRisk || isNeedHelp ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${student.knowledgePercent ?? 75}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* GPA / PLO */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-base font-extrabold font-mono ${
                          isRisk
                            ? 'text-rose-600 dark:text-rose-400'
                            : (student.gpa ?? 8.0) >= 9.0
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {student.gpa?.toFixed(1) ?? '8.0'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      {student.learningStatus === 'EXCELLENT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold">
                          <span>{student.statusBadge || 'Top 1 Xuất sắc'}</span>
                        </span>
                      ) : student.learningStatus === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-100 dark:border-blue-900">
                          {student.statusBadge || 'Tích cực'}
                        </span>
                      ) : student.learningStatus === 'NEED_HELP' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold">
                          <span>{student.statusBadge || 'Cần trợ giúp ⚠️'}</span>
                          {student.statusDetail && (
                            <span className="text-[10px] font-normal opacity-90">
                              {student.statusDetail}
                            </span>
                          )}
                        </span>
                      ) : student.learningStatus === 'AT_RISK' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-semibold shadow-2xs">
                          <span>{student.statusBadge || 'Nguy cơ trượt ⚠️'}</span>
                          {student.statusDetail && (
                            <span className="text-[10px] font-normal opacity-90">
                              {student.statusDetail}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium">
                          {student.statusBadge || 'Bình thường'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right pr-4">
                      <div className="inline-flex items-center gap-1">
                        {/* Profile button */}
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForProfile(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Xem hồ sơ cá nhân"
                        >
                          <span className="material-symbols-outlined text-[18px]">badge</span>
                        </button>

                        {/* Direct Chat */}
                        <button
                          type="button"
                          onClick={() => notify(`Mở kênh chat trực tiếp với sinh viên ${student.name}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Nhắn tin riêng"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                        </button>

                        {/* Special AI Intervention button for students needing help */}
                        {isNeedHelp && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentForProfile(student);
                              notify(`Đã kích hoạt gợi ý lộ trình AI ôn tập cho sinh viên ${student.name}`);
                            }}
                            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                            title="Gợi ý lộ trình AI ôn tập"
                          >
                            <span className="material-symbols-outlined text-[18px]">psychology</span>
                          </button>
                        )}

                        {/* Warning button for students at risk */}
                        {isRisk && (
                          <button
                            type="button"
                            onClick={() => notify(`Đã gửi thư cảnh báo học tập tới ${student.name} và phụ huynh!`)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                            title="Gửi cảnh báo học tập"
                          >
                            <span className="material-symbols-outlined text-[18px]">warning</span>
                          </button>
                        )}

                        {/* More Menu */}
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === student.id ? null : student.id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Tùy chọn vai trò"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>

                          {activeMenuId === student.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs z-40 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    notify(`Đã chỉ định ${student.name} làm Lớp phó học tập!`);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[15px]">
                                    military_tech
                                  </span>
                                  <span>Bổ nhiệm cán sự</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    notify(`Đã gán ${student.name} vào Nhóm đồ án số 1.`);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[15px]">group</span>
                                  <span>Gán vào nhóm đồ án</span>
                                </button>
                                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    if (onRejectMember) onRejectMember(student);
                                    notify(`Đã xóa học viên ${student.name} khỏi lớp.`);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[15px]">
                                    person_remove
                                  </span>
                                  <span>Xóa khỏi lớp</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-850/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Hiển thị{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-bold">
              1 - {filteredStudents.length}
            </strong>{' '}
            trên tổng số{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-bold">42</strong> học viên
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                currentPage === 1
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                currentPage === 2
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(3)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(4)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(5)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. CLASS ANALYTICS SUMMARY CARDS (Bento style bottom section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Chuẩn đầu ra PLO */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
            <span className="material-symbols-outlined text-[28px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Chuẩn đầu ra đợt 1
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                35/42
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                83.3% Đạt
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              7 sinh viên trong danh sách ôn tập tăng cường
            </span>
          </div>
        </div>

        {/* Card 2: Chuyên cần trung bình */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
            <span className="material-symbols-outlined text-[28px]">co_present</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Điểm chuyên cần trung bình
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                91.2%
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Tỷ lệ có mặt
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Duy trì ổn định qua 8 tuần thực hành
            </span>
          </div>
        </div>

        {/* Card 3: Khuyến nghị AI giảng dạy */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white dark:from-slate-900 to-indigo-50/50 dark:to-indigo-950/20 border-[3px] border-indigo-200 dark:border-indigo-800 shadow-xs flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-[19px]">smart_toy</span>
              <span className="text-[11px] font-bold uppercase tracking-wide">
                Khuyến nghị AI Giáo vụ
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
              2 Sinh viên cần can thiệp
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              Phạm Văn Hùng &amp; Vũ Đức Long thiếu hụt bài tập cấu trúc dữ liệu.
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              notify('Mở báo cáo can thiệp sư phạm AI cho 2 sinh viên hổng kiến thức AVL & Fenwick Tree')
            }
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Chi tiết
          </button>
        </div>
      </div>

      {/* 5. MODAL HỒ SƠ HỌC VIÊN CHI TIẾT */}
      {selectedStudentForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {selectedStudentForProfile.avatarUrl ? (
                  <img
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    src={selectedStudentForProfile.avatarUrl}
                    alt={selectedStudentForProfile.name}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center">
                    {selectedStudentForProfile.avatar}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedStudentForProfile.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    MSSV: {selectedStudentForProfile.studentCode} • {selectedStudentForProfile.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForProfile(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Chuyên cần</span>
                <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {selectedStudentForProfile.attendanceRate}%
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Đồ thị tri thức</span>
                <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {selectedStudentForProfile.knowledgePercent}%
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Điểm GPA</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                  {selectedStudentForProfile.gpa?.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 font-bold">
                <span className="material-symbols-outlined text-[17px]">psychology</span>
                <span>Đánh giá năng lực chuẩn ABET / PLO:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Sinh viên có năng lực giải quyết vấn đề tốt trên đồ thị tri thức (đã mở{' '}
                {selectedStudentForProfile.knowledgeNodesUnlocked}/82 nút mạng). Đạt yêu cầu chuẩn đầu ra PLO1 và PLO3.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentForProfile(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStudentForProfile(null);
                  notify(`Đã chuyển hướng đến Sổ tay học tập chi tiết của ${selectedStudentForProfile.name}`);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Xem chi tiết học tập →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
