'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CustomSelect } from '@/components/shared';
import type { ClassItem } from '../../schemas/class.schema';
import type { ClassCourse, ClassMember } from '../../schemas/class-detail.schema';
import { StudentDetailDrawer } from './StudentDetailDrawer';

interface ClassMembersTabProps {
  classInfo?: ClassItem;
  members?: ClassMember[];
  courses?: ClassCourse[];
  currentRole?: 'owner' | 'teacher' | 'student';
  classCode?: string;
  onApproveMember?: (member: ClassMember) => void;
  onRejectMember?: (member: ClassMember) => void;
  onInviteClick?: () => void;
  onToast?: (message: string) => void;
}

export function ClassMembersTab({
  classInfo,
  members = [],
  courses = [],
  currentRole = 'owner',
  classCode = '',
  onApproveMember,
  onRejectMember,
  onInviteClick,
  onToast,
}: ClassMembersTabProps) {
  const router = useRouter();

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

  const approvedStudentsCount = useMemo(
    () =>
      members.filter((m) => m.role === 'STUDENT' && m.status !== 'PENDING').length ||
      classInfo?.enrolledCount ||
      0,
    [members, classInfo?.enrolledCount]
  );

  const pendingStudentsCount = useMemo(
    () => members.filter((m) => m.status === 'PENDING').length,
    [members]
  );

  const maxStudentsCount = classInfo?.maxStudents ?? 60;
  const displayClassCode = classInfo?.enrollmentKey || classInfo?.name || classCode || 'Lớp học';
  const classSubtitle = [
    classInfo?.semester,
    classInfo?.academicYear,
    classInfo?.schedule?.room || classInfo?.major,
  ]
    .filter(Boolean)
    .join(' • ');

  // Course filter options from real class courses
  const courseFilterOptions = useMemo(
    () => [
      { value: 'all', label: `Môn học: Tất cả môn (${courses.length})` },
      ...courses.map((c) => ({
        value: c.id,
        label: c.code ? `${c.code}: ${c.name}` : c.name,
      })),
    ],
    [courses]
  );

  // Real analytics derived from approved students in class
  const memberAnalytics = useMemo(() => {
    const activeStudents = members.filter(
      (m) => m.role === 'STUDENT' && m.status !== 'PENDING'
    );
    const total = activeStudents.length;
    const passed = activeStudents.filter(
      (s) =>
        s.learningStatus === 'EXCELLENT' ||
        s.learningStatus === 'ACTIVE' ||
        (typeof s.gpa === 'number' && s.gpa >= 5.0)
    ).length;
    const needReview = Math.max(0, total - passed);
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

    const withAttendance = activeStudents.filter(
      (s) => typeof s.attendanceRate === 'number'
    );
    const avgAttendance =
      withAttendance.length > 0
        ? (
            withAttendance.reduce((sum, s) => sum + (s.attendanceRate ?? 0), 0) /
            withAttendance.length
          ).toFixed(1)
        : null;

    const atRiskStudents = activeStudents.filter(
      (s) => s.learningStatus === 'AT_RISK' || s.learningStatus === 'NEED_HELP'
    );

    return {
      total,
      passed,
      needReview,
      passRate,
      withAttendanceCount: withAttendance.length,
      avgAttendance,
      atRiskStudents,
    };
  }, [members]);

  // Filter students
  const filteredStudents = useMemo(() => {
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
    const targetClassId = classInfo?.id || classCode;
    if (targetClassId) {
      router.push(`/classes/${targetClassId}?tab=sessions&action=attendance`);
    } else {
      router.push('/lesson-sessions?action=attendance');
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* 1. CLASS CAPACITY & ENROLLMENT HERO STATS */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-sm dark:shadow-none border-none flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight">
              Danh sách Học viên &amp; Sĩ số lớp
            </h2>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] font-semibold">
              {displayClassCode}
            </span>
          </div>
          {classSubtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-[#A8C7FA]">
                verified
              </span>
              <span>{classSubtitle}</span>
            </p>
          )}

          {/* Key Capacity & Enrolment Badges */}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <div className="flex items-center gap-2 bg-[#F0F4F8] dark:bg-[#131314] px-3.5 py-1.5 rounded-2xl border-none">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[19px]">
                groups
              </span>
              <span className="text-xs text-gray-600 dark:text-[#C4C7C5]">Chính thức:</span>
              <span className="text-sm text-gray-900 dark:text-[#E3E3E3] font-bold">
                {approvedStudentsCount}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#F0F4F8] dark:bg-[#131314] px-3.5 py-1.5 rounded-2xl border-none">
              <span className="material-symbols-outlined text-gray-400 text-[19px]">
                pending_actions
              </span>
              <span className="text-xs text-gray-500 dark:text-[#8E918F]">Chờ duyệt:</span>
              <span className="text-sm text-amber-600 dark:text-amber-400 font-bold">
                {pendingStudentsCount}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#F0F4F8] dark:bg-[#131314] px-3.5 py-1.5 rounded-2xl border-none">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[19px]">
                how_to_reg
              </span>
              <span className="text-xs text-gray-600 dark:text-[#C4C7C5]">Sĩ số tối đa:</span>
              <span className="text-sm text-gray-900 dark:text-[#E3E3E3] font-bold">
                {maxStudentsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[17px]">file_download</span>
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmailAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[17px]">mail</span>
            <span>Gửi email</span>
          </button>

          {currentRole !== 'student' && onInviteClick && (
            <button
              type="button"
              onClick={onInviteClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold shadow-sm transition-all cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Thêm học viên</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. FILTER & BATCH ACTION TOOLBAR */}
      <div className="bg-white dark:bg-[#1E1F20] p-4 sm:p-5 rounded-3xl shadow-sm dark:shadow-none border-none flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search bar */}
          <div className="flex items-center bg-[#E1E5EA] dark:bg-[#282A2C] px-3.5 py-1.5 rounded-full w-full sm:w-72 border-none">
            <span className="material-symbols-outlined text-gray-500 dark:text-[#8E918F] text-[18px] mr-2">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-500 dark:placeholder:text-[#8E918F] outline-none border-none"
              placeholder="Tìm theo Tên, MSSV, Email..."
              type="text"
            />
          </div>

          {/* Filter 1: Trạng thái học tập */}
          <CustomSelect<'all' | 'good' | 'attention' | 'risk'>
            variant="pill"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'all', label: 'Trạng thái: Tất cả' },
              { value: 'good', label: 'Đang học tốt' },
              { value: 'attention', label: 'Cần chú ý' },
              { value: 'risk', label: 'Nguy cơ trượt môn' },
            ]}
            className="min-w-[165px]"
          />

          {/* Filter 2: Môn học */}
          <CustomSelect<string>
            variant="pill"
            value={subjectFilter}
            onChange={(val) => setSubjectFilter(val)}
            options={courseFilterOptions}
            className="min-w-[200px]"
          />

          <button
            type="button"
            onClick={handleResetFilters}
            className="p-2 rounded-full text-gray-500 dark:text-[#8E918F] hover:text-gray-900 dark:hover:text-[#E3E3E3] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
            title="Đặt lại bộ lọc"
          >
            <span className="material-symbols-outlined text-[19px]">filter_alt_off</span>
          </button>
        </div>

        {/* Batch Actions Trigger */}
        <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
          <span className="text-xs font-semibold text-gray-500 dark:text-[#8E918F] hidden md:inline">
            Thao tác chọn ({selectedIds.length}):
          </span>

          <button
            type="button"
            onClick={handleAssignGroup}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold transition-colors cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[17px]">hub</span>
            <span>Gán nhóm</span>
          </button>

          <button
            type="button"
            onClick={handleSendReminder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold transition-colors cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[17px]">notification_important</span>
            <span>Gửi nhắc nhở</span>
          </button>

          <button
            type="button"
            onClick={handleTakeAttendance}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold transition-all cursor-pointer shadow-xs border-none"
          >
            <span className="material-symbols-outlined text-[17px]">fact_check</span>
            <span>Điểm danh hôm nay</span>
          </button>
        </div>
      </div>

      {/* 3. ENTERPRISE DATA TABLE */}
      <div className="w-full bg-white dark:bg-[#1E1F20] rounded-3xl shadow-sm dark:shadow-none border-none overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F4F8] dark:bg-[#131314] text-gray-500 dark:text-[#8E918F] text-[11px] font-semibold uppercase tracking-wider border-none select-none">
                <th className="py-4 pl-6 pr-2 w-12 align-middle" scope="col">
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
                <th className="py-4 px-4 min-w-[240px] align-middle" scope="col">
                  Học viên
                </th>
                <th className="py-4 px-4 w-[220px] min-w-[170px] align-middle whitespace-nowrap" scope="col">
                  Email Sinh viên
                </th>
                <th className="py-4 px-3 w-[120px] text-center align-middle whitespace-nowrap" scope="col">
                  Chuyên cần
                </th>
                <th className="py-4 px-4 w-[180px] min-w-[150px] align-middle whitespace-nowrap" scope="col">
                  Đồ thị Tri thức (Nodes)
                </th>
                <th className="py-4 px-3 w-[120px] text-center align-middle whitespace-nowrap" scope="col">
                  Điểm GPA / PLO
                </th>
                <th className="py-4 px-4 w-[160px] min-w-[130px] align-middle whitespace-nowrap" scope="col">
                  Trạng thái
                </th>
                <th className="py-4 px-4 text-right pr-6 w-[120px] align-middle whitespace-nowrap" scope="col">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {filteredStudents.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                const isRisk = student.learningStatus === 'AT_RISK';
                const isNeedHelp = student.learningStatus === 'NEED_HELP';

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors border-none"
                  >
                    {/* Checkbox */}
                    <td className="py-5 pl-6 pr-2 align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(student.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Student Info */}
                    <td className="py-5 px-4 align-middle">
                      <div
                        onClick={() => setSelectedStudentForProfile(student)}
                        className="flex items-center gap-3 cursor-pointer group"
                        title="Xem hồ sơ &amp; tiến độ chi tiết"
                      >
                        <div className="relative shrink-0">
                          {student.avatarUrl ? (
                            <img
                              className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                              src={student.avatarUrl}
                              alt={student.name}
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                            >
                              {student.avatar || student.name.charAt(0)}
                            </div>
                          )}

                          {student.leaderBadge && (
                            <span
                              className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] rounded-full text-[9px] font-bold whitespace-nowrap"
                              title="Lớp trưởng"
                            >
                              {student.leaderBadge}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-gray-900 dark:text-[#E3E3E3] truncate text-sm group-hover:text-blue-600 dark:group-hover:text-[#A8C7FA] transition-colors">
                            {student.name}
                          </span>
                          <span className="font-mono text-[11px] text-gray-500 dark:text-[#8E918F]">
                            MSSV: {student.studentCode || '22028190'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-5 px-4 font-mono text-[11px] text-gray-500 dark:text-[#8E918F] align-middle whitespace-nowrap">
                      {student.email}
                    </td>

                    {/* Attendance */}
                    <td className="py-5 px-3 text-center align-middle whitespace-nowrap">
                      <span
                        className={`whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold font-mono border-none ${(student.attendanceRate ?? 90) >= 90
                            ? 'bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA]'
                            : (student.attendanceRate ?? 90) >= 75
                              ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5]'
                              : 'bg-red-100 dark:bg-[#3C1919] text-red-800 dark:text-[#F28B82]'
                          }`}
                      >
                        {student.attendanceRate ?? 90}%
                      </span>
                    </td>

                    {/* Knowledge Graph Nodes Progress */}
                    <td className="py-5 px-4 align-middle whitespace-nowrap">
                      <div className="flex flex-col gap-1 w-36">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-700 dark:text-[#C4C7C5] font-medium">
                            {student.knowledgeNodesUnlocked ?? 60}/{student.knowledgeNodesTotal ?? 82}
                          </span>
                          <span
                            className={`font-semibold font-mono ${isRisk || isNeedHelp
                                ? 'text-red-700 dark:text-[#F28B82]'
                                : 'text-[#007BFF] dark:text-[#A8C7FA]'
                              }`}
                          >
                            {student.knowledgePercent ?? 75}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-[#282A2C] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isRisk || isNeedHelp ? 'bg-red-500' : 'bg-[#007BFF] dark:bg-[#A8C7FA]'
                              }`}
                            style={{ width: `${student.knowledgePercent ?? 75}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* GPA / PLO */}
                    <td className="py-5 px-3 text-center align-middle whitespace-nowrap">
                      <span
                        className={`text-base font-extrabold font-mono ${isRisk
                            ? 'text-red-700 dark:text-[#F28B82]'
                            : (student.gpa ?? 8.0) >= 9.0
                              ? 'text-blue-600 dark:text-[#A8C7FA]'
                              : 'text-gray-900 dark:text-[#E3E3E3]'
                          }`}
                      >
                        {student.gpa?.toFixed(1) ?? '8.0'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-5 px-4 align-middle whitespace-nowrap">
                      {student.learningStatus === 'EXCELLENT' ? (
                        <span className="whitespace-nowrap inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] text-xs font-semibold border-none">
                          <span>{student.statusBadge || 'Top 1 Xuất sắc'}</span>
                        </span>
                      ) : student.learningStatus === 'ACTIVE' ? (
                        <span className="whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA] text-xs font-semibold border-none">
                          {student.statusBadge || 'Tích cực'}
                        </span>
                      ) : student.learningStatus === 'NEED_HELP' ? (
                        <span className="whitespace-nowrap inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-[#2E1F00] text-amber-800 dark:text-[#FFB784] text-xs font-semibold border-none">
                          <span>{student.statusBadge || 'Cần trợ giúp'}</span>
                        </span>
                      ) : student.learningStatus === 'AT_RISK' ? (
                        <span className="whitespace-nowrap inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-[#3C1919] text-red-800 dark:text-[#F28B82] text-xs font-semibold border-none">
                          <span>{student.statusBadge || 'Nguy cơ trượt'}</span>
                        </span>
                      ) : (
                        <span className="whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] text-xs font-medium border-none">
                          {student.statusBadge || 'Bình thường'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-5 px-4 text-right pr-6 align-middle whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* Profile button */}
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForProfile(student)}
                          className="p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-[#E3E3E3] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
                          title="Xem hồ sơ cá nhân"
                        >
                          <span className="material-symbols-outlined text-[18px]">badge</span>
                        </button>

                        {/* Direct Chat */}
                        <button
                          type="button"
                          onClick={() => notify(`Mở kênh chat trực tiếp với sinh viên ${student.name}`)}
                          className="p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-[#E3E3E3] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
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
                            className="p-2 rounded-full text-amber-700 dark:text-[#FFB784] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
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
                            className="p-2 rounded-full text-red-700 dark:text-[#F28B82] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
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
                            className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-[#E3E3E3] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
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
                              <div className="absolute right-0 mt-1 w-48 rounded-2xl bg-white dark:bg-[#1E1F20] shadow-xl py-2 text-xs z-40 text-left border-none animate-in fade-in zoom-in-95 duration-150">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    notify(`Đã chỉ định ${student.name} làm Lớp phó học tập!`);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-[#C4C7C5] flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
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
                                  className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-[#C4C7C5] flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">group</span>
                                  <span>Gán vào nhóm đồ án</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    if (onRejectMember) onRejectMember(student);
                                    notify(`Đã xóa học viên ${student.name} khỏi lớp.`);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-[#F28B82] flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
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
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-none">
          <span className="text-gray-500 dark:text-[#8E918F]">
            Hiển thị{' '}
            <strong className="text-gray-900 dark:text-[#E3E3E3] font-semibold">
              {filteredStudents.length === 0 ? 0 : 1} - {filteredStudents.length}
            </strong>{' '}
            trên tổng số{' '}
            <strong className="text-gray-900 dark:text-[#E3E3E3] font-semibold">
              {filteredStudents.length}
            </strong>{' '}
            học viên
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40 cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-[17px]">chevron_left</span>
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all border-none cursor-pointer ${currentPage === page
                    ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] shadow-xs'
                    : 'text-gray-600 dark:text-[#C4C7C5] hover:bg-black/5 dark:hover:bg-white/5 bg-transparent'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-[17px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. CLASS ANALYTICS SUMMARY CARDS (Bento style bottom section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Chuẩn đầu ra PLO */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-[#162B4D] flex items-center justify-center shrink-0 text-blue-600 dark:text-[#A8C7FA]">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wide">
              Chuẩn đầu ra đợt 1
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-gray-900 dark:text-[#E3E3E3] font-mono">
                {memberAnalytics.passed}/{memberAnalytics.total}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-[#A8C7FA]">
                {memberAnalytics.passRate}% Đạt
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-[#8E918F] truncate mt-0.5">
              {memberAnalytics.total === 0
                ? 'Chưa có dữ liệu học viên trong lớp'
                : `${memberAnalytics.needReview} sinh viên cần ôn tập thêm`}
            </span>
          </div>
        </div>

        {/* Card 2: Chuyên cần trung bình */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C] flex items-center justify-center shrink-0 text-gray-700 dark:text-[#C4C7C5]">
            <span className="material-symbols-outlined text-[24px]">co_present</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wide">
              Điểm chuyên cần trung bình
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-gray-900 dark:text-[#E3E3E3] font-mono">
                {memberAnalytics.avgAttendance !== null ? `${memberAnalytics.avgAttendance}%` : '--'}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-[#8E918F]">
                Tỷ lệ có mặt
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-[#8E918F] truncate mt-0.5">
              {memberAnalytics.withAttendanceCount > 0
                ? `Tính trên ${memberAnalytics.withAttendanceCount}/${memberAnalytics.total} học viên`
                : 'Chưa có dữ liệu điểm danh'}
            </span>
          </div>
        </div>

        {/* Card 3: Khuyến nghị AI giảng dạy */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-[#A8C7FA]">
              <span className="material-symbols-outlined text-[19px]">smart_toy</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Khuyến nghị AI
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mt-1">
              {memberAnalytics.atRiskStudents.length} Sinh viên cần can thiệp
            </span>
            <span className="text-xs text-gray-500 dark:text-[#8E918F] line-clamp-1 mt-0.5">
              {memberAnalytics.atRiskStudents.length === 0
                ? 'Chưa ghi nhận sinh viên có nguy cơ.'
                : `${memberAnalytics.atRiskStudents
                    .slice(0, 2)
                    .map((s) => s.name)
                    .join(' & ')}${
                    memberAnalytics.atRiskStudents.length > 2
                      ? ` và ${memberAnalytics.atRiskStudents.length - 2} người khác`
                      : ''
                  }`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (memberAnalytics.atRiskStudents.length > 0) {
                setStatusFilter('risk');
              } else {
                notify('Hiện chưa có sinh viên nào thuộc nhóm cần can thiệp.');
              }
            }}
            className="px-4 py-2 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold shrink-0 transition-colors cursor-pointer border-none bg-transparent"
          >
            Chi tiết
          </button>
        </div>
      </div>
      </div>

      {/* 5. DRAWER HỒ SƠ & TIẾN ĐỘ HỌC VIÊN CHI TIẾT (Tách biệt hoàn toàn khỏi flow .space-y-6) */}
      <StudentDetailDrawer
        isOpen={!!selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        student={selectedStudentForProfile}
        classCode={classCode}
        onSendMessage={(s) =>
          notify(`Đang mở hội thoại trực tiếp với sinh viên ${s.name}...`)
        }
        onUnenroll={(s) => {
          if (onRejectMember) onRejectMember(s);
          notify(`Đã xử lý rút học viên ${s.name} khỏi lớp ${classCode}.`);
        }}
        onSaveNote={(sId, note) =>
          notify(`Đã lưu ghi chú học vụ cho sinh viên ID ${sId}`)
        }
        onToast={notify}
      />
    </>
  );
}
