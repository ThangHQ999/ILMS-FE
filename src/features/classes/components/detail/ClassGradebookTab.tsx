'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type {
  GradebookStudent,
  GradebookAiAnalysis,
} from '../../schemas/class-detail.schema';

interface ClassGradebookTabProps {
  students: GradebookStudent[];
  aiAnalysis: GradebookAiAnalysis;
  onSendAiSuggestion: () => void;
  onInterveneClick: (student: GradebookStudent) => void;
  onToast?: (msg: string) => void;
}

export function ClassGradebookTab({
  students,
  aiAnalysis,
  onSendAiSuggestion,
  onInterveneClick,
  onToast,
}: ClassGradebookTabProps) {
  const t = useTranslations('classes.detail');

  // Filters & State
  const [selectedCourse, setSelectedCourse] = useState(
    'CS-202: Cấu trúc dữ liệu & Giải thuật nâng cao (Trọng tâm)'
  );
  const [evaluationFilter, setEvaluationFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'scores' | 'plo'>('scores');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('20');

  // Interactive Modals
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isCustomQuizModalOpen, setIsCustomQuizModalOpen] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] =
    useState<GradebookStudent | null>(null);

  // Weight Configuration State
  const [weights, setWeights] = useState({
    attendance: 10,
    quiz: 15,
    lab: 20,
    midterm: 20,
    final: 35,
  });

  const notify = (msg: string) => {
    if (onToast) {
      onToast(msg);
    } else {
      alert(msg);
    }
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    let list = [...students];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, searchTerm]);

  // Checkbox handlers
  const isAllSelected =
    filteredStudents.length > 0 &&
    selectedStudentIds.length === filteredStudents.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export handlers
  const handleExportExcel = () => {
    notify('Đang xuất bảng điểm chi tiết định dạng Excel (.xlsx)...');
  };

  const handleExportPdf = () => {
    notify('Đang khởi tạo báo cáo Ma trận Chuẩn đầu ra PLO (PDF)...');
  };

  const handleAiAutoGrade = () => {
    notify('Đang kích hoạt trợ lý AI Chấm bài & Đối soát điểm tự động...');
  };

  const handleApplyAiRecommendation = () => {
    notify(
      'Đã tự động gửi bộ đề Quiz 20 câu phục hồi PLO-03 cho 2 SV và kích hoạt mô hình Đôi bạn cùng tiến!'
    );
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. BENTO GRID: TOP ANALYTICS & AI EXAM ASSISTANT
          All cards styled with thick borders: border-2 border-slate-300 dark:border-slate-700
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Điểm trung bình lớp CS-202 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Điểm trung bình (CS-202)
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">grade</span>
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {aiAnalysis.averageScore || 8.24}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                / 10.0
              </span>
              <span className="ml-auto inline-flex items-center text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                +0.4 so kỳ trước
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>
                Cao nhất: <strong className="text-slate-900 dark:text-slate-100 font-bold">9.8</strong>
              </span>
              <span>
                Thấp nhất: <strong className="text-rose-600 dark:text-rose-400 font-bold">4.2</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Tỷ lệ đạt chuẩn đầu ra PLO */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tỷ lệ đạt chuẩn PLO
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {aiAnalysis.ploPassRate || 88.1}%
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {aiAnalysis.ploPassedCount || 37} / {aiAnalysis.totalStudents || 42} sinh viên
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${aiAnalysis.ploPassRate || 88.1}%` }}
              />
            </div>

            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-2.5 flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400">
                check_circle
              </span>
              Vượt chỉ tiêu tối thiểu khoa đề ra (80%)
            </p>
          </div>
        </div>

        {/* Card 3: Phân loại học lực */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Phân loại học lực
            </span>
            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">pie_chart</span>
            </span>
          </div>

          <div>
            {/* Multi-segment progress visual */}
            <div className="flex h-2.5 rounded-full overflow-hidden gap-1 bg-slate-100 dark:bg-slate-800 mb-3">
              <div
                className="bg-blue-600 h-full rounded-l"
                style={{ width: '52.4%' }}
                title="Xuất sắc & Giỏi: 52.4%"
              />
              <div
                className="bg-blue-400 h-full"
                style={{ width: '28.6%' }}
                title="Khá: 28.6%"
              />
              <div
                className="bg-slate-400 dark:bg-slate-500 h-full"
                style={{ width: '14.3%' }}
                title="Trung bình: 14.3%"
              />
              <div
                className="bg-rose-500 h-full rounded-r"
                style={{ width: '4.7%' }}
                title="Nguy cơ: 4.7%"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[12px]">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span>Giỏi/XS: <strong>22 (52.4%)</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                <span>Khá: <strong>12 (28.6%)</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                <span>TB: <strong>6 (14.3%)</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>Nguy cơ: <strong>2 (4.7%)</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Trợ lý AI Khảo thí & Cảnh báo Sớm (High-Tech Alert Card) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border-2 border-blue-500/80 dark:border-blue-500 flex flex-col justify-between gap-3 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-xs">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              AI Khảo thí cảnh báo
            </span>
            <span className="text-[11px] font-mono text-blue-200 bg-white/10 px-2 py-0.5 rounded border border-white/10">
              Real-time
            </span>
          </div>

          <div>
            <p className="text-[13px] text-slate-200 leading-snug">
              Phát hiện <strong className="text-white underline decoration-rose-400 decoration-2">2 SV</strong> (Phạm Văn Hùng, Vũ Đức Long) bị hổng nặng chuẩn{' '}
              <strong className="text-amber-300">PLO-03 (Cây AVL & Cây Đỏ - Đen)</strong>, cần kích hoạt bài test phục hồi điểm.
            </p>
            <button
              type="button"
              onClick={onSendAiSuggestion}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:text-white transition-colors group cursor-pointer"
            >
              Xem lộ trình can thiệp AI
              <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CONTROL & FILTER BAR (GRADEBOOK CONTROL BAR)
          With thick border: border-2 border-slate-300 dark:border-slate-700
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          {/* Search & Course Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên học viên, MSSV hoặc email..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Course Select */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 gap-2 shrink-0">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                menu_book
              </span>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none cursor-pointer max-w-[280px] truncate"
              >
                <option value="CS-202: Cấu trúc dữ liệu & Giải thuật nâng cao (Trọng tâm)">
                  CS-202: Cấu trúc dữ liệu & Giải thuật nâng cao (Trọng tâm)
                </option>
                <option value="CS-301: Thiết kế & Phân tích thuật toán">
                  CS-301: Thiết kế & Phân tích thuật toán
                </option>
                <option value="IT-101: Nhập môn Kỹ thuật Lập trình">
                  IT-101: Nhập môn Kỹ thuật Lập trình
                </option>
                <option value="CS-205: Cơ sở dữ liệu quan hệ">
                  CS-205: Cơ sở dữ liệu quan hệ
                </option>
                <option value="Tất cả các môn (4 môn tổng hợp)">
                  Tất cả các môn (4 môn tổng hợp)
                </option>
              </select>
            </div>

            {/* Evaluation Filter */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 gap-2 shrink-0">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                filter_list
              </span>
              <select
                value={evaluationFilter}
                onChange={(e) => setEvaluationFilter(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="all">Cả học kỳ (Tổng kết điểm & PLO)</option>
                <option value="quiz">Chuyên cần & Quiz tự học</option>
                <option value="lab">Bài tập lớn & Lab thực hành</option>
                <option value="exam">Thi giữa kỳ & Thi kết thúc môn</option>
              </select>
            </div>
          </div>

          {/* View Toggle Mode & Main Actions */}
          <div className="flex items-center justify-between xl:justify-end gap-3 flex-wrap">
            {/* View Toggle Pills */}
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('scores')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'scores'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">table_chart</span>
                Điểm số & Thành phần
              </button>
              <button
                type="button"
                onClick={() => setViewMode('plo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'plo'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">hub</span>
                Ma trận PLO (Bloom)
              </button>
            </div>

            {/* Action Buttons & Primary CTAs */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Xuất dữ liệu Excel (.xlsx)"
              >
                <span className="material-symbols-outlined text-[17px] text-emerald-600 dark:text-emerald-400">
                  table_view
                </span>
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Xuất báo cáo PDF Ma trận chuẩn đầu ra"
              >
                <span className="material-symbols-outlined text-[17px] text-rose-600 dark:text-rose-400">
                  picture_as_pdf
                </span>
                <span className="hidden sm:inline">Báo cáo PLO</span>
              </button>

              <button
                type="button"
                onClick={handleAiAutoGrade}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">smart_toy</span>
                <span>Chấm & Nhập điểm AI</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWeightModalOpen(true)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Cấu hình trọng số điểm (%)"
              >
                <span className="material-symbols-outlined text-[19px]">settings_input_component</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Badges & Formula Summary */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              Công thức trọng số:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/80 dark:border-slate-700">
              Chuyên cần ({weights.attendance}%)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/80 dark:border-slate-700">
              Quiz AI ({weights.quiz}%)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/80 dark:border-slate-700">
              Lab Coding ({weights.lab}%)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/80 dark:border-slate-700">
              Giữa kỳ ({weights.midterm}%)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/80 dark:border-slate-700">
              Cuối kỳ ({weights.final}%)
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span>
              Hiển thị: <strong className="text-slate-900 dark:text-slate-100 font-bold">{filteredStudents.length} / {aiAnalysis.totalStudents || 42}</strong> sinh viên
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Cập nhật 15 phút trước bởi TS. Nguyễn Văn An
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. COMPREHENSIVE GRADEBOOK TABLE & PLO COMPETENCY MATRIX
          With thick border: border-2 border-slate-300 dark:border-slate-700
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Toolbar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-4 flex-wrap border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span>Chọn tất cả lớp ({filteredStudents.length} SV)</span>
            </label>
            <span className="text-slate-500 dark:text-slate-400 text-xs hidden sm:inline">
              | Đã chọn: <strong className="text-slate-900 dark:text-slate-100">{selectedStudentIds.length}</strong> SV
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> GPA &ge; 8.5 (Giỏi)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> 7.0 - 8.4 (Khá)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &lt; 5.0 (Cảnh báo)
            </span>
          </div>
        </div>

        {/* Table Container with Horizontal Scroll */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1280px]">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3.5 px-4 w-12 text-center sticky left-0 bg-slate-100 dark:bg-slate-800 z-20">
                  #
                </th>
                <th className="py-3.5 px-4 min-w-[240px] sticky left-12 bg-slate-100 dark:bg-slate-800 z-20">
                  Sinh viên
                </th>
                <th className="py-3.5 px-3 text-center">
                  Chuyên cần<br />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    {weights.attendance}%
                  </span>
                </th>
                <th className="py-3.5 px-3 text-center">
                  Quiz AI<br />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    {weights.quiz}%
                  </span>
                </th>
                <th className="py-3.5 px-3 text-center">
                  Lab Thực hành<br />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    {weights.lab}%
                  </span>
                </th>
                <th className="py-3.5 px-3 text-center">
                  Giữa kỳ<br />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    {weights.midterm}%
                  </span>
                </th>
                <th className="py-3.5 px-3 text-center">
                  Cuối kỳ<br />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    {weights.final}%
                  </span>
                </th>
                <th className="py-3.5 px-4 text-center bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-extrabold">
                  Tổng kết 10<br />
                  <span className="text-[10px] font-normal text-blue-700 dark:text-blue-400">
                    Hệ 10
                  </span>
                </th>
                <th className="py-3.5 px-3 text-center">
                  Điểm chữ
                </th>

                {/* PLO Matrix Headers */}
                <th
                  className="py-3.5 px-4 min-w-[125px] text-center bg-slate-100/60 dark:bg-slate-800/60 border-l border-slate-200 dark:border-slate-700"
                  title="Tư duy Thuật toán & Đánh giá Độ phức tạp (Big-O)"
                >
                  PLO-01<br />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    Tư duy TT
                  </span>
                </th>
                <th
                  className="py-3.5 px-4 min-w-[125px] text-center bg-slate-100/60 dark:bg-slate-800/60"
                  title="Cài đặt cấu trúc dữ liệu nâng cao (Tree, Graph)"
                >
                  PLO-02<br />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    Cài đặt Cấu trúc
                  </span>
                </th>
                <th
                  className="py-3.5 px-4 min-w-[130px] text-center bg-slate-100/60 dark:bg-slate-800/60"
                  title="Tối ưu hóa & Cây cân bằng AVL/Red-Black"
                >
                  PLO-03<br />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    Cây AVL/Đỏ-Đen
                  </span>
                </th>
                <th
                  className="py-3.5 px-4 min-w-[125px] text-center bg-slate-100/60 dark:bg-slate-800/60 border-r border-slate-200 dark:border-slate-700"
                  title="Giải quyết bài toán thực tế thực thi thuật toán"
                >
                  PLO-04<br />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    Giải quyết TT
                  </span>
                </th>

                <th className="py-3.5 px-4 text-right sticky right-0 bg-slate-100 dark:bg-slate-800 z-20">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
              {filteredStudents.map((s, idx) => {
                const isSelected = selectedStudentIds.includes(s.id);
                const isWarning =
                  s.ploStatus === 'NEEDS_SUPPORT' ||
                  Boolean(s.warning) ||
                  (s.totalGpa && s.totalGpa < 5.0) ||
                  s.finalScore < 5.0;
                const isRowFailingPlo3 = Boolean(s.plo3?.isHole);

                return (
                  <tr
                    key={s.id}
                    className={`transition-colors group ${
                      isWarning
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                        : isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Checkbox sticky */}
                    <td
                      className={`py-3.5 px-4 text-center sticky left-0 z-10 transition-colors ${
                        isWarning
                          ? 'bg-rose-50/90 dark:bg-slate-900 group-hover:bg-rose-100/80 dark:group-hover:bg-slate-850'
                          : isSelected
                          ? 'bg-blue-50/90 dark:bg-slate-900 group-hover:bg-blue-100/80 dark:group-hover:bg-slate-850'
                          : 'bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleStudent(s.id)}
                        className={`w-4 h-4 rounded cursor-pointer ${
                          isWarning ? 'accent-rose-600' : 'accent-blue-600'
                        }`}
                      />
                    </td>

                    {/* Student Info sticky */}
                    <td
                      className={`py-3.5 px-4 sticky left-12 z-10 transition-colors ${
                        isWarning
                          ? 'bg-rose-50/90 dark:bg-slate-900 group-hover:bg-rose-100/80 dark:group-hover:bg-slate-850'
                          : isSelected
                          ? 'bg-blue-50/90 dark:bg-slate-900 group-hover:bg-blue-100/80 dark:group-hover:bg-slate-850'
                          : 'bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                            isWarning
                              ? 'bg-rose-600 text-white'
                              : s.avatarColor || 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {s.avatar || 'SV'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              onClick={() => setSelectedStudentForProfile(s)}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate"
                            >
                              {s.name}
                            </span>
                            {isWarning && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold text-[10px] uppercase shrink-0">
                                Cảnh báo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                            <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                              {s.studentCode}
                            </span>
                            <span>•</span>
                            <span className="truncate">{s.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Component Scores */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {s.attendanceScore.toFixed(1)}
                    </td>
                    <td
                      className={`py-3.5 px-3 text-center font-mono font-bold ${
                        s.quizScore < 5.0
                          ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {s.quizScore.toFixed(1)}
                    </td>
                    <td
                      className={`py-3.5 px-3 text-center font-mono font-bold ${
                        s.labScore < 5.0
                          ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {s.labScore.toFixed(1)}
                    </td>
                    <td
                      className={`py-3.5 px-3 text-center font-mono font-bold ${
                        s.midtermScore < 5.0
                          ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {s.midtermScore.toFixed(1)}
                    </td>
                    <td
                      className={`py-3.5 px-3 text-center font-mono font-bold ${
                        s.finalScore < 5.0
                          ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {s.finalScore.toFixed(1)}
                    </td>

                    {/* Total 10 Highlight Cell */}
                    <td
                      className={`py-3.5 px-4 text-center font-mono font-extrabold text-sm ${
                        isWarning
                          ? 'bg-rose-100/60 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                          : 'bg-blue-50/60 dark:bg-blue-950/30 text-blue-600 dark:text-blue-300'
                      }`}
                    >
                      {(s.totalGpa ?? s.finalScore).toFixed(2)}
                    </td>

                    {/* Letter Grade */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-xs inline-block ${
                          isWarning
                            ? 'bg-rose-600 text-white'
                            : (s.totalGpa ?? s.finalScore) >= 8.5
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {s.letterGrade}
                      </span>
                    </td>

                    {/* PLO-01 */}
                    <td className="py-3.5 px-4 bg-slate-50/40 dark:bg-slate-800/20 border-l border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {s.plo1?.status || `${s.ploPercent}% Đạt`}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (s.plo1?.percent ?? s.ploPercent) >= 80
                                ? 'bg-blue-600'
                                : (s.plo1?.percent ?? s.ploPercent) >= 50
                                ? 'bg-slate-500'
                                : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${s.plo1?.percent ?? s.ploPercent}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* PLO-02 */}
                    <td className="py-3.5 px-4 bg-slate-50/40 dark:bg-slate-800/20">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {s.plo2?.status || `${Math.max(s.ploPercent - 3, 45)}% Đạt`}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (s.plo2?.percent ?? s.ploPercent) >= 80
                                ? 'bg-blue-600'
                                : (s.plo2?.percent ?? s.ploPercent) >= 50
                                ? 'bg-slate-500'
                                : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${s.plo2?.percent ?? Math.max(s.ploPercent - 3, 45)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* PLO-03 (Warning Check) */}
                    <td
                      className={`py-3.5 px-4 ${
                        isRowFailingPlo3
                          ? 'bg-rose-100/60 dark:bg-rose-950/40'
                          : 'bg-slate-50/40 dark:bg-slate-800/20'
                      }`}
                    >
                      <div className="flex flex-col gap-1 items-center">
                        {isRowFailingPlo3 ? (
                          <span className="font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">warning</span>
                            {s.plo3?.status || '32% Hổng'}
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {s.plo3?.status || `${Math.max(s.ploPercent - 5, 50)}% Đạt`}
                          </span>
                        )}
                        <div
                          className={`w-16 h-1.5 rounded-full overflow-hidden ${
                            isRowFailingPlo3
                              ? 'bg-rose-200 dark:bg-rose-900'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <div
                            className={`h-full rounded-full ${
                              isRowFailingPlo3
                                ? 'bg-rose-600'
                                : (s.plo3?.percent ?? s.ploPercent) >= 80
                                ? 'bg-blue-600'
                                : 'bg-slate-500'
                            }`}
                            style={{
                              width: `${s.plo3?.percent ?? (isRowFailingPlo3 ? 32 : 88)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* PLO-04 */}
                    <td className="py-3.5 px-4 bg-slate-50/40 dark:bg-slate-800/20 border-r border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {s.plo4?.status || `${Math.max(s.ploPercent - 2, 45)}% Đạt`}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (s.plo4?.percent ?? s.ploPercent) >= 80
                                ? 'bg-blue-600'
                                : (s.plo4?.percent ?? s.ploPercent) >= 50
                                ? 'bg-slate-500'
                                : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${s.plo4?.percent ?? Math.max(s.ploPercent - 2, 45)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action sticky right */}
                    <td
                      className={`py-3.5 px-4 text-right sticky right-0 z-10 transition-colors ${
                        isWarning
                          ? 'bg-rose-50/90 dark:bg-slate-900 group-hover:bg-rose-100/80 dark:group-hover:bg-slate-850'
                          : isSelected
                          ? 'bg-blue-50/90 dark:bg-slate-900 group-hover:bg-blue-100/80 dark:group-hover:bg-slate-850'
                          : 'bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1 text-slate-500 dark:text-slate-400">
                        {isWarning ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onInterveneClick(s)}
                              className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                              title="Tạo bài test gỡ điểm AI"
                            >
                              <span className="material-symbols-outlined text-[17px]">build</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => notify(`Đã gửi nhắc nhở khẩn cấp tới ${s.name} qua email và SMS`)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Gửi nhắc nhở khẩn cấp"
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                notification_important
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForProfile(s)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              title="Xem hồ sơ năng lực cá nhân"
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                account_box
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => notify(`Mở khung nhận xét học tập cho sinh viên: ${s.name}`)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              title="Gửi thông báo / Nhận xét"
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                chat_bubble_outline
                              </span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => notify(`Xem thêm tùy chọn cho: ${s.name}`)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination & Batch Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span>
              Hiển thị <strong className="text-slate-900 dark:text-slate-100">{filteredStudents.length}</strong> / 42 học viên (Trang {currentPage}/5)
            </span>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span>Xem mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="bg-transparent font-bold text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">first_page</span>
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-lg font-bold text-xs cursor-pointer ${
                currentPage === 1
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-lg font-bold text-xs cursor-pointer ${
                currentPage === 2
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 rounded-lg font-bold text-xs cursor-pointer ${
                currentPage === 3
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              3
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(5)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">last_page</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. BOTTOM SECTION: PLO COMPETENCY DEEP-DIVE & AI PEDAGOGICAL RECOMMENDATIONS
          Both cards have thick borders: border-2 border-slate-300 dark:border-slate-700 / border-2 border-blue-400
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 5 PLOs Radar/Bar Distribution Analytics (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Mức độ đáp ứng Chuẩn đầu ra (PLO Benchmark)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Đối chiếu chuẩn kiểm định quốc tế ABET & CDIO đối với môn CS-202
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              Kỳ II 2024-2025
            </span>
          </div>

          {/* Competency Visual Matrix Bars */}
          <div className="flex flex-col gap-4">
            {/* PLO-01 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  PLO-01: Phân tích độ phức tạp thời gian & không gian thuật toán (Big-O)
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  91.4% (38/42 Đạt)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '91.4%' }} />
              </div>
            </div>

            {/* PLO-02 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  PLO-02: Thiết kế & Cài đặt cấu trúc dữ liệu tuyến tính và phi tuyến tính
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  88.5% (37/42 Đạt)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '88.5%' }} />
              </div>
            </div>

            {/* PLO-03 (Chỉ tiêu thấp nhất cần can thiệp) - Highlighted in red alert box */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-900">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">error</span>
                  PLO-03: Tối ưu hoá cân bằng cây AVL, Cây Đỏ - Đen & B-Tree
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  71.4% (30/42 Đạt - Dưới chuẩn 80%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-rose-200 dark:bg-rose-900/60 overflow-hidden">
                <div className="h-full bg-rose-600 rounded-full" style={{ width: '71.4%' }} />
              </div>
            </div>

            {/* PLO-04 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  PLO-04: Vận dụng cấu trúc Đồ thị (Dijkstra, Bellman-Ford, Kruskal) giải bài toán thực tiễn
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  85.7% (36/42 Đạt)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '85.7%' }} />
              </div>
            </div>

            {/* PLO-05 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  PLO-05: Kỹ năng gỡ lỗi (Debugging), Viết Unit Test và Tối ưu mã nguồn C++
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  92.8% (39/42 Đạt)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '92.8%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
            <span>
              Ngưỡng chuẩn kiểm định Khoa: <strong className="text-slate-900 dark:text-slate-100 font-bold">&ge; 80.0%</strong>
            </span>
            <button
              type="button"
              onClick={() => notify('Đang tải xuống Ma trận đối chiếu tương thích CDIO (.xlsx)...')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              Tải ma trận tương thích CDIO (.xlsx)
              <span className="material-symbols-outlined text-[16px]">download</span>
            </button>
          </div>
        </div>

        {/* Right: AI Pedagogical Intervention & Remedial Quiz Generator (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-blue-400 dark:border-blue-600/70 shadow-sm flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    Khuyến nghị Sư phạm AI Socratic
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Tối ưu hóa năng lực thích ứng
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-900">
                Khả thi 94%
              </span>
            </div>

            {/* Recommendation Items */}
            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0 mt-0.5">
                  quiz
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-slate-100">
                    Mở đợt Quiz phục hồi PLO-03:
                  </strong>{' '}
                  Hệ thống đã tự động soạn bộ đề thích ứng 20 câu tập trung vào phép xoay kép (Double Rotation) của cây AVL cho 5 SV điểm dưới 5.0.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0 mt-0.5">
                  group_add
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-slate-100">
                    Mô hình Học nhóm Đôi bạn cùng tiến:
                  </strong>{' '}
                  Đề xuất ghép cặp <strong>Phạm Văn Hùng</strong> với{' '}
                  <strong>Trần Nhật Minh</strong> (A+) trong 2 buổi phụ đạo Lab thuật toán cuối tuần.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0 mt-0.5">
                  tune
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-slate-100">
                    Điều chỉnh trọng số đồ án:
                  </strong>{' '}
                  Tăng trọng số bài tập thực hành Lab để bù đắp điểm thi giữa kỳ cho các sinh viên có tiến bộ đột phá qua đồ thị năng lực.
                </div>
              </div>
            </div>
          </div>

          {/* Remedial Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleApplyAiRecommendation}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs hover:shadow cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Áp dụng khuyến nghị AI ngay
            </button>
            <button
              type="button"
              onClick={() => setIsCustomQuizModalOpen(true)}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              Tùy chỉnh đề test
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. MODALS & POPUPS
          ========================================================================= */}
      {/* Weight Configuration Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-xl">
                  settings_input_component
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Cấu hình trọng số điểm môn học
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWeightModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Chuyên cần:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={weights.attendance}
                    onChange={(e) =>
                      setWeights({ ...weights, attendance: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold text-right"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Quiz trắc nghiệm AI:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={weights.quiz}
                    onChange={(e) =>
                      setWeights({ ...weights, quiz: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold text-right"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Lab Thực hành:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={weights.lab}
                    onChange={(e) =>
                      setWeights({ ...weights, lab: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold text-right"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Thi giữa kỳ:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={weights.midterm}
                    onChange={(e) =>
                      setWeights({ ...weights, midterm: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold text-right"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Thi kết thúc môn:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={weights.final}
                    onChange={(e) =>
                      setWeights({ ...weights, final: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded font-mono font-bold text-right"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="pt-2 border-t flex justify-between font-bold text-sm">
                <span>Tổng trọng số:</span>
                <span
                  className={
                    weights.attendance +
                      weights.quiz +
                      weights.lab +
                      weights.midterm +
                      weights.final ===
                    100
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }
                >
                  {weights.attendance +
                    weights.quiz +
                    weights.lab +
                    weights.midterm +
                    weights.final}
                  %
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsWeightModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWeightModalOpen(false);
                  notify('Đã cập nhật công thức trọng số thành công!');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Quiz Modal */}
      {isCustomQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-xl">
                  tune
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Tùy chỉnh đề test phục hồi năng lực AI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomQuizModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <label className="font-bold block mb-1">Mục tiêu chuẩn đầu ra (PLO):</label>
                <select className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                  <option>PLO-03: Cây AVL, Cây Đỏ - Đen & Cây B-Tree (Khuyến nghị)</option>
                  <option>PLO-01: Phân tích độ phức tạp thời gian Big-O</option>
                  <option>PLO-02: Cấu trúc dữ liệu tuyến tính</option>
                  <option>PLO-04: Cấu trúc Đồ thị & Dijkstra</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Số lượng câu hỏi thích ứng:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-300 font-bold text-blue-700 dark:text-blue-300"
                  >
                    20 câu (Chuẩn)
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border font-medium"
                  >
                    30 câu (Sâu)
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border font-medium"
                  >
                    10 câu (Nhanh)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Đối tượng áp dụng:</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-1.5 border">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-blue-600" />
                    <span>Phạm Văn Hùng (22028204 - 32% PLO-03)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-blue-600" />
                    <span>Vũ Đức Long (22028215 - 35% PLO-03)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomQuizModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCustomQuizModalOpen(false);
                  notify('Đã tạo và gửi đề thi phục hồi thích ứng AI tới học viên!');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                Kích hoạt ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Quick View Modal */}
      {selectedStudentForProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    selectedStudentForProfile.avatarColor || 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {selectedStudentForProfile.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {selectedStudentForProfile.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedStudentForProfile.studentCode} • {selectedStudentForProfile.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForProfile(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <div className="text-slate-500 text-[10px]">Điểm TB (GPA)</div>
                  <div className="font-mono font-bold text-base text-blue-600">
                    {(selectedStudentForProfile.totalGpa ?? selectedStudentForProfile.finalScore).toFixed(2)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <div className="text-slate-500 text-[10px]">Điểm chữ</div>
                  <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {selectedStudentForProfile.letterGrade}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <div className="text-slate-500 text-[10px]">Chuẩn PLO</div>
                  <div className="font-mono font-bold text-base text-emerald-600">
                    {selectedStudentForProfile.ploPercent}%
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Đánh giá năng lực theo chuẩn đầu ra (PLO):
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>PLO-01 (Tư duy thuật toán):</span>
                    <span className="font-bold font-mono">
                      {selectedStudentForProfile.plo1?.status || `${selectedStudentForProfile.ploPercent}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>PLO-02 (Cấu trúc dữ liệu):</span>
                    <span className="font-bold font-mono">
                      {selectedStudentForProfile.plo2?.status || `${selectedStudentForProfile.ploPercent}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>PLO-03 (Cây AVL / Đỏ-Đen):</span>
                    <span
                      className={`font-bold font-mono ${
                        selectedStudentForProfile.plo3?.isHole ? 'text-rose-600' : ''
                      }`}
                    >
                      {selectedStudentForProfile.plo3?.status || `${selectedStudentForProfile.ploPercent}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>PLO-04 (Thuật toán đồ thị):</span>
                    <span className="font-bold font-mono">
                      {selectedStudentForProfile.plo4?.status || `${selectedStudentForProfile.ploPercent}%`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentForProfile(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const student = selectedStudentForProfile;
                  setSelectedStudentForProfile(null);
                  onInterveneClick(student);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Hỗ trợ học tập cá nhân
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
