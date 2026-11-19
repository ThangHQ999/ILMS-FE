'use client';

import React, { useState, useMemo } from 'react';
import { useClassGradeReports } from '../../hooks/useClassGradeReports';
import { useClassStudentMembers } from '../../hooks/useClassStudentMembers';
import { useCreateGradeReport } from '../../hooks/useCreateGradeReport';
import { useUpdateStudentGrade } from '../../hooks/useUpdateStudentGrade';
import type { GradeReportItem } from '../../schemas/grade-report.schema';

export interface TeacherGradeReportsTableViewProps {
  classId: string;
  onToast?: (msg: string) => void;
}

function formatScoreCell(val: number | null | undefined): React.ReactNode {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return (
      <span className="text-slate-400 dark:text-slate-500 font-medium text-sm select-none">
        —
      </span>
    );
  }
  if (Number(val) === 0) {
    return (
      <span className="font-medium text-slate-900 dark:text-slate-100 font-mono text-sm">
        0
      </span>
    );
  }
  const formatted = String(val).replace('.', ',');
  return (
    <span className="font-medium text-slate-900 dark:text-slate-100 font-mono text-sm">
      {formatted}
    </span>
  );
}

function getStudentInitials(name?: string): string {
  if (!name) return 'H';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'H';
  const lastPart = parts[parts.length - 1];
  return (lastPart[0] || 'H').toUpperCase();
}

function formatShortUUID(rawId?: string | null): string {
  if (!rawId) return '';
  const trimmed = rawId.trim();
  if (trimmed.length <= 8) return trimmed;
  const suffix = trimmed.replace(/-/g, '').slice(-4);
  return `SV: ...${suffix}`;
}

function formatUpdatedParts(isoString?: string | null): { date: string; time: string } {
  if (!isoString) return { date: '--/--/----', time: '--:--' };
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hours, minutes] = match;
    return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` };
  }
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { date: isoString, time: '' };
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` };
}

function formatUpdatedAt(isoString?: string | null): string {
  const parts = formatUpdatedParts(isoString);
  return `${parts.time} – ${parts.date}`;
}

function validateScoreInput(str: string): { valid: boolean; parsed: number | null; error: string | null } {
  if (!str || str.trim() === '') {
    return { valid: true, parsed: null, error: null };
  }
  const raw = str.trim().replace(',', '.');

  if (!/^-?\d+(\.\d+)?$/.test(raw)) {
    return { valid: false, parsed: null, error: 'Điểm phải là số hợp lệ từ 0 đến 10' };
  }

  const num = parseFloat(raw);
  if (isNaN(num)) {
    return { valid: false, parsed: null, error: 'Điểm không hợp lệ' };
  }

  if (num < 0 || num > 10) {
    return { valid: false, parsed: null, error: 'Điểm phải nằm trong thang từ 0 đến 10' };
  }

  const parts = raw.split('.');
  if (parts.length > 1) {
    const decimals = parts[1].replace(/0+$/, '');
    if (decimals.length > 2) {
      return { valid: false, parsed: null, error: 'Tối đa 2 chữ số thập phân có nghĩa' };
    }
  }

  return { valid: true, parsed: num, error: null };
}

function areScoresEqual(val1: number | null | undefined, val2: number | null | undefined): boolean {
  const isNull1 = val1 === null || val1 === undefined || isNaN(Number(val1));
  const isNull2 = val2 === null || val2 === undefined || isNaN(Number(val2));
  if (isNull1 && isNull2) return true;
  if (isNull1 !== isNull2) return false;
  return Number(val1) === Number(val2);
}

export function TeacherGradeReportsTableView({
  classId,
  onToast,
}: TeacherGradeReportsTableViewProps) {
  // Query parameters state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const sortParam = sortOption === 'newest' ? 'updatedAt,desc' : 'updatedAt,asc';

  // 1. Fetch Class Grade Reports
  const { data, isLoading, isError, refetch } = useClassGradeReports(classId, {
    search: searchTerm,
    page: currentPage,
    size: pageSize,
    sort: sortParam,
  });

  // 2. Fetch all student members for Create Modal
  const { data: studentMembers = [] } = useClassStudentMembers(classId);

  // 3. Mutations
  const createMutation = useCreateGradeReport(classId);
  const updateMutation = useUpdateStudentGrade(classId);

  // Modal 1: Create State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStudentId, setCreateStudentId] = useState('');
  const [createScoreAtt, setCreateScoreAtt] = useState('');
  const [createScoreMid, setCreateScoreMid] = useState('');
  const [createScoreFin, setCreateScoreFin] = useState('');
  const [createApiError, setCreateApiError] = useState<string | null>(null);

  // Modal 2: Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GradeReportItem | null>(null);
  const [editScoreAtt, setEditScoreAtt] = useState('');
  const [editScoreMid, setEditScoreMid] = useState('');
  const [editScoreFin, setEditScoreFin] = useState('');
  const [editApiError, setEditApiError] = useState<string | null>(null);

  // Set of student UUIDs that already have grade reports
  const existingStudentIds = useMemo(() => {
    const set = new Set<string>();
    (data?.items || []).forEach((r) => {
      if (r.studentId) set.add(r.studentId);
      if (r.studentUUID) set.add(r.studentUUID);
    });
    return set;
  }, [data?.items]);

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(0); // Reset to page 0 on search
  };

  // Handle Sort Change
  const handleSortChange = (val: 'newest' | 'oldest') => {
    setSortOption(val);
    setCurrentPage(0); // Reset to page 0 on sort change
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateStudentId('');
    setCreateScoreAtt('');
    setCreateScoreMid('');
    setCreateScoreFin('');
    setCreateApiError(null);
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: GradeReportItem) => {
    setEditingItem(item);
    setEditScoreAtt(item.attendanceScore !== null && item.attendanceScore !== undefined ? String(item.attendanceScore).replace('.', ',') : '');
    setEditScoreMid(item.midtermScore !== null && item.midtermScore !== undefined ? String(item.midtermScore).replace('.', ',') : '');
    setEditScoreFin(item.finalScore !== null && item.finalScore !== undefined ? String(item.finalScore).replace('.', ',') : '');
    setEditApiError(null);
    setIsEditOpen(true);
  };

  // Validate Create Form
  const valCreateAtt = validateScoreInput(createScoreAtt);
  const valCreateMid = validateScoreInput(createScoreMid);
  const valCreateFin = validateScoreInput(createScoreFin);
  const isCreateFormValid =
    Boolean(createStudentId) &&
    valCreateAtt.valid &&
    valCreateMid.valid &&
    valCreateFin.valid;

  // Handle Submit Create
  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCreateFormValid) return;
    setCreateApiError(null);

    try {
      await createMutation.mutateAsync({
        studentId: createStudentId,
        attendanceScore: valCreateAtt.parsed,
        midtermScore: valCreateMid.parsed,
        finalScore: valCreateFin.parsed,
      });
      setIsCreateOpen(false);
      onToast?.('Đã tạo bảng điểm thành công cho học viên!');
      refetch();
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đã có lỗi xảy ra khi tạo bảng điểm.';
      setCreateApiError(msg);
    }
  };

  // Validate Edit Form (Dirty check & Score validation)
  const valEditAtt = validateScoreInput(editScoreAtt);
  const valEditMid = validateScoreInput(editScoreMid);
  const valEditFin = validateScoreInput(editScoreFin);
  const areEditScoresValid = valEditAtt.valid && valEditMid.valid && valEditFin.valid;

  const isEditDirty = useMemo(() => {
    if (!editingItem) return false;
    const attChanged = !areScoresEqual(editingItem.attendanceScore, valEditAtt.parsed);
    const midChanged = !areScoresEqual(editingItem.midtermScore, valEditMid.parsed);
    const finChanged = !areScoresEqual(editingItem.finalScore, valEditFin.parsed);
    return attChanged || midChanged || finChanged;
  }, [editingItem, valEditAtt.parsed, valEditMid.parsed, valEditFin.parsed]);

  const isEditSubmitEnabled = areEditScoresValid && isEditDirty && !updateMutation.isPending;

  // Handle Submit Edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditSubmitEnabled || !editingItem) return;
    setEditApiError(null);

    // Build dirty payload: only fields that changed, sending null when cleared
    const dirtyPayload: {
      attendanceScore?: number | null;
      midtermScore?: number | null;
      finalScore?: number | null;
    } = {};

    if (!areScoresEqual(editingItem.attendanceScore, valEditAtt.parsed)) {
      dirtyPayload.attendanceScore = valEditAtt.parsed;
    }
    if (!areScoresEqual(editingItem.midtermScore, valEditMid.parsed)) {
      dirtyPayload.midtermScore = valEditMid.parsed;
    }
    if (!areScoresEqual(editingItem.finalScore, valEditFin.parsed)) {
      dirtyPayload.finalScore = valEditFin.parsed;
    }

    try {
      await updateMutation.mutateAsync({
        studentId: editingItem.studentId || editingItem.studentUUID || editingItem.id || '',
        dirtyPayload,
      });
      setIsEditOpen(false);
      onToast?.('Đã cập nhật điểm thành công!');
      refetch();
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đã có lỗi xảy ra khi cập nhật điểm.';
      setEditApiError(msg);
    }
  };

  const reportsList = data?.items || [];
  const totalElements = data?.totalElements ?? reportsList.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border-2 border-slate-200/80 dark:border-slate-800 transition-all w-full">
      {/* 1. Tiêu đề trang & Nút Tạo bảng điểm */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3.5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Bảng điểm lớp
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý điểm thành phần • Thang điểm 10
          </p>
        </div>
        <button
          id="btn-open-create-modal"
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all cursor-pointer shrink-0 active:scale-98"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Tạo bảng điểm</span>
        </button>
      </div>

      {/* 2. Toolbar: Ô tìm kiếm và Sắp xếp cùng chiều cao */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200/80 dark:border-slate-700/80">
        {/* Search Input */}
        <div className="relative w-full sm:w-72 md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            id="input-search-student"
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo tên học viên…"
            className="w-full h-9 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg pl-9 pr-8 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Sắp xếp:
          </span>
          <select
            id="select-sort-order"
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
            className="h-9 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg px-2.5 sm:px-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="newest">Cập nhật mới nhất</option>
            <option value="oldest">Cập nhật cũ nhất</option>
          </select>
        </div>
      </div>

      {/* 3. Bảng điểm (w-full vừa vặn thẻ, gom 3 cột điểm dưới tiêu đề chung Điểm thành phần · Thang 10) */}
      {isLoading ? (
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-12 bg-slate-50 dark:bg-slate-800/60 rounded-xl" />
          <div className="h-12 bg-slate-50 dark:bg-slate-800/60 rounded-xl" />
          <div className="h-12 bg-slate-50 dark:bg-slate-800/60 rounded-xl" />
        </div>
      ) : isError ? (
        <div className="p-10 text-center space-y-3">
          <span className="material-symbols-outlined text-3xl text-rose-500">error_outline</span>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Không thể tải danh sách bảng điểm lớp.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : reportsList.length === 0 ? (
        <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">search_off</span>
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {searchTerm ? 'Không tìm thấy bảng điểm phù hợp' : 'Chưa có bảng điểm'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Vui lòng thử tìm kiếm bằng từ khóa hoặc tên học viên khác.'
              : 'Bấm nút "+ Tạo bảng điểm" để thêm điểm cho học viên đầu tiên.'}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors cursor-pointer"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-xs font-semibold border-b border-slate-200/80 dark:border-slate-800">
                  <th
                    rowSpan={2}
                    scope="col"
                    className="py-2.5 px-3 text-left bg-slate-50/90 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 align-middle"
                  >
                    HỌC VIÊN
                  </th>
                  <th
                    colSpan={3}
                    scope="colgroup"
                    className="py-1.5 px-2 text-center bg-blue-50/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-b border-blue-200/60 dark:border-blue-900/60 font-bold text-xs tracking-wider"
                  >
                    Điểm thành phần · Thang 10
                  </th>
                  <th
                    rowSpan={2}
                    scope="col"
                    className="py-2.5 px-2.5 text-center sm:text-left whitespace-nowrap w-[130px] sm:w-[140px] bg-slate-50/90 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 align-middle"
                  >
                    CẬP NHẬT
                  </th>
                  <th
                    rowSpan={2}
                    scope="col"
                    className="py-2.5 pr-3 pl-1 text-right whitespace-nowrap w-[115px] sm:w-[125px] bg-slate-50/90 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 align-middle"
                  >
                    THAO TÁC
                  </th>
                </tr>
                <tr className="text-xs font-semibold border-b border-slate-200/80 dark:border-slate-800">
                  <th
                    scope="col"
                    className="py-1.5 px-2 text-center whitespace-nowrap w-[110px] sm:w-[120px] bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300/90"
                  >
                    CHUYÊN CẦN
                  </th>
                  <th
                    scope="col"
                    className="py-1.5 px-2 text-center whitespace-nowrap w-[110px] sm:w-[120px] bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300/90"
                  >
                    GIỮA KỲ
                  </th>
                  <th
                    scope="col"
                    className="py-1.5 px-2 text-center whitespace-nowrap w-[110px] sm:w-[120px] bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300/90"
                  >
                    CUỐI KỲ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {reportsList.map((item, idx) => {
                  const updatedParts = formatUpdatedParts(item.updatedAt);
                  return (
                    <tr
                      key={item.id || item.studentId || idx}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                    >
                      {/* Học viên: Avatar nhỏ + Tên đậm + UUID rút gọn */}
                      <td className="py-2.5 px-3 align-middle">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {getStudentInitials(item.studentName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                              {item.studentName}
                            </div>
                            <div
                              className="text-[11px] font-mono text-slate-400 truncate mt-0.5"
                              title={item.studentUUID || item.studentId}
                            >
                              {formatShortUUID(item.studentUUID || item.studentId)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Chuyên cần */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap w-[110px] sm:w-[120px] align-middle">
                        {formatScoreCell(item.attendanceScore)}
                      </td>

                      {/* Giữa kỳ */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap w-[110px] sm:w-[120px] align-middle">
                        {formatScoreCell(item.midtermScore)}
                      </td>

                      {/* Cuối kỳ */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap w-[110px] sm:w-[120px] align-middle">
                        {formatScoreCell(item.finalScore)}
                      </td>

                      {/* Cập nhật: Ngày ở dòng trên, giờ xám ở dòng dưới */}
                      <td className="py-2.5 px-2.5 text-center sm:text-left whitespace-nowrap w-[130px] sm:w-[140px] align-middle">
                        <div className="font-mono text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {updatedParts.date}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {updatedParts.time}
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className="py-2.5 pr-3 pl-1 text-right whitespace-nowrap w-[115px] sm:w-[125px] align-middle">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200/80 dark:border-blue-800/80 shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <span className="material-symbols-outlined text-[15px] shrink-0">edit</span>
                          <span>Sửa điểm</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Chân bảng: Chú giải & Phân trang */}
          {totalElements > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 sm:mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div id="paginationText">
                  Hiển thị{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalElements)}
                  </span>{' '}
                  trên tổng số{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {totalElements}
                  </span>{' '}
                  bảng điểm
                </div>

                <div className="hidden sm:block w-px h-3.5 bg-slate-200 dark:bg-slate-700" />

                {/* Chú giải điểm null */}
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-400 dark:text-slate-500 select-none text-sm">—</span>
                  <span>Chưa có điểm</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-xs font-medium"
                >
                  Trước
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      currentPage === i
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-xs font-medium"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= MODAL 1: TẠO BẢNG ĐIỂM ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">post_add</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
                    Tạo bảng điểm
                  </h3>
                  <p className="text-xs text-slate-400">
                    Thêm bản ghi điểm thành phần cho học viên
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitCreate} className="p-5 space-y-4">
              {/* Chọn học viên */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Học viên <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createStudentId}
                  onChange={(e) => setCreateStudentId(e.target.value)}
                  className="w-full bg-[#F6FAFE] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 cursor-pointer transition-all"
                >
                  <option value="" disabled>
                    -- Chọn học viên thuộc lớp --
                  </option>
                  {studentMembers.map((st) => {
                    const stId = st.userId || st.studentId || st.id || '';
                    const isAlreadyGraded = existingStudentIds.has(stId);
                    return (
                      <option key={stId} value={stId} disabled={isAlreadyGraded}>
                        {st.fullName || st.name} ({stId}){isAlreadyGraded ? ' — Đã có bảng điểm' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Thông báo chú thích */}
              <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-lg text-xs text-blue-600 dark:text-blue-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
                <span>Có thể tạo bảng điểm khi chưa có điểm thành phần (để trống cả 3 ô).</span>
              </div>

              {/* 3 Ô nhập điểm */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {/* Chuyên cần */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Chuyên cần <span className="text-slate-400 font-normal">/ 10</span>
                  </label>
                  <input
                    type="text"
                    value={createScoreAtt}
                    onChange={(e) => setCreateScoreAtt(e.target.value)}
                    placeholder="-- (trống)"
                    className="w-full bg-[#F6FAFE] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 text-center transition-all"
                  />
                  {!valCreateAtt.valid && (
                    <div className="text-[10px] text-rose-600 mt-1 leading-tight">
                      {valCreateAtt.error}
                    </div>
                  )}
                </div>

                {/* Giữa kỳ */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Giữa kỳ <span className="text-slate-400 font-normal">/ 10</span>
                  </label>
                  <input
                    type="text"
                    value={createScoreMid}
                    onChange={(e) => setCreateScoreMid(e.target.value)}
                    placeholder="-- (trống)"
                    className="w-full bg-[#F6FAFE] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 text-center transition-all"
                  />
                  {!valCreateMid.valid && (
                    <div className="text-[10px] text-rose-600 mt-1 leading-tight">
                      {valCreateMid.error}
                    </div>
                  )}
                </div>

                {/* Cuối kỳ */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cuối kỳ <span className="text-slate-400 font-normal">/ 10</span>
                  </label>
                  <input
                    type="text"
                    value={createScoreFin}
                    onChange={(e) => setCreateScoreFin(e.target.value)}
                    placeholder="-- (trống)"
                    className="w-full bg-[#F6FAFE] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 text-center transition-all"
                  />
                  {!valCreateFin.valid && (
                    <div className="text-[10px] text-rose-600 mt-1 leading-tight">
                      {valCreateFin.error}
                    </div>
                  )}
                </div>
              </div>

              {/* Lỗi từ API nếu có (ví dụ 409 Conflict) */}
              {createApiError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300">
                  {createApiError}
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!isCreateFormValid || createMutation.isPending}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isCreateFormValid && !createMutation.isPending
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo bảng điểm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: SỬA ĐIỂM ================= */}
      {isEditOpen && editingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
                    Sửa điểm
                  </h3>
                  <p className="text-xs text-slate-400">
                    Điều chỉnh điểm thành phần trên thang 10
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitEdit} className="p-5 space-y-4">
              {/* Thông tin học viên (chỉ đọc) */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <div className="text-xs text-slate-400 font-medium">Học viên</div>
                <div className="text-sm font-heading font-bold text-slate-900 dark:text-slate-100">
                  {editingItem.studentName}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 select-all">
                  {editingItem.studentUUID || editingItem.studentId}
                </div>
              </div>

              {/* Hướng dẫn */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Để trống một thành phần để đưa điểm đó về trạng thái <strong>Chưa có điểm</strong>.
              </p>

              {/* 3 Ô nhập điểm */}
              <div className="grid grid-cols-3 gap-3">
                {/* Chuyên cần */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Chuyên cần <span className="text-slate-400 font-normal">/ 10</span>
                  </label>
                  <input
                    type="text"
                    value={editScoreAtt}
                    onChange={(e) => setEditScoreAtt(e.target.value)}
                    placeholder="Chưa có điểm"
                    className="w-full bg-[#F6FAFE] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 text-center transition-all"
                  />
                  {!valEditAtt.valid && (
                    <div className="text-[10px] text-rose-600 mt-1 leading-tight">
                      {valEditAtt.error}
                    </div>
                  )}
                </div>

                {/* Giữa kỳ */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Giữa kỳ <span className="text-slate-400 font-normal">/ 10</span>
                  </label>
                  <input
                    type="text"
                    value={editScoreMid}
                    onChange={(e) => setEditScoreMid(e.target.value)}
                    placeholder="Chưa có điểm"
                    className="w-full bg-[#F6FAFE] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 text-center transition-all"
                  />
                  {!valEditMid.valid && (
                    <div className="text-[10px] text-rose-600 mt-1 leading-tight">
                      {valEditMid.error}
                    </div>
                  )}
                </div>

                {/* Cuối kỳ */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cuối kỳ <span className="text-slate-400 font-normal">/ 10</span>
                  </label>
                  <input
                    type="text"
                    value={editScoreFin}
                    onChange={(e) => setEditScoreFin(e.target.value)}
                    placeholder="Chưa có điểm"
                    className="w-full bg-[#F6FAFE] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 text-center transition-all"
                  />
                  {!valEditFin.valid && (
                    <div className="text-[10px] text-rose-600 mt-1 leading-tight">
                      {valEditFin.error}
                    </div>
                  )}
                </div>
              </div>

              {/* Lỗi API nếu có */}
              {editApiError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300">
                  {editApiError}
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!isEditSubmitEnabled}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isEditSubmitEnabled
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
