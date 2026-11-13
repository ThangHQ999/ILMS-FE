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
}

export function ClassGradebookTab({
  students,
  aiAnalysis,
  onSendAiSuggestion,
  onInterveneClick,
}: ClassGradebookTabProps) {
  const t = useTranslations('classes.detail');
  const [selectedCourse, setSelectedCourse] = useState('CS-202');
  const [selectedColumn, setSelectedColumn] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('final_desc');

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

    if (sortBy === 'final_desc') {
      list.sort((a, b) => b.finalScore - a.finalScore);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'plo_asc') {
      list.sort((a, b) => a.ploPercent - b.ploPercent);
    } else if (sortBy === 'code_asc') {
      list.sort((a, b) => a.studentCode.localeCompare(b.studentCode));
    }
    return list;
  }, [students, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">
              fact_check
            </span>
            {t('gradebookTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {t('gradebookDesc')}
          </p>
        </div>

        {/* 3 Standardized Buttons (Point 3.2): 1 Primary, 2 Secondary */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Secondary 1 */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-500 dark:text-slate-400">
              file_download
            </span>
            <span>{t('exportGradebook')}</span>
          </button>

          {/* Secondary 2 */}
          <button
            type="button"
            onClick={() => alert('Đang đồng bộ dữ liệu với hệ thống Đào tạo...')}
            className="px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-500 dark:text-slate-400">
              sync
            </span>
            <span>{t('syncTraining')}</span>
          </button>

          {/* Primary */}
          <button
            type="button"
            onClick={onSendAiSuggestion}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">psychology</span>
            <span>{t('aiGradeAnalysis')}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards - Expanded Padding & Spacing (Point 1.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Điểm TB toàn lớp */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('kpiAvgScore')}
              </span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">insights</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {aiAnalysis.averageScore}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ 10.0</span>
            </div>
          </div>
          <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              +0.4
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              so với kỳ trước • Khá-Giỏi
            </span>
          </div>
        </div>

        {/* Card 2: Tỷ lệ đạt chuẩn PLO */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('kpiPloRate')}
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {aiAnalysis.ploPassRate}%
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ({aiAnalysis.ploPassedCount}/{aiAnalysis.totalStudents} SV)
              </span>
            </div>
          </div>
          <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${aiAnalysis.ploPassRate}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-right">
              Mục tiêu học kỳ: 85%
            </div>
          </div>
        </div>

        {/* Card 3: Tiến độ chấm điểm */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('kpiGradingProgress')}
              </span>
              <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">
                  assignment_turned_in
                </span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {aiAnalysis.gradingProgress}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">bài đánh giá</span>
            </div>
          </div>
          <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {aiAnalysis.gradingPercent}% đã nhập điểm
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Còn 2 bài Lab</span>
          </div>
        </div>

        {/* Card 4: Cần can thiệp sớm */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('kpiEarlySupport')}
              </span>
              <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">
                  notification_important
                </span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                {aiAnalysis.earlyInterventionCount}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">học viên</span>
            </div>
          </div>
          <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Hổng kiến thức: Cây & Đồ thị</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Gradebook - Perfectly Baseline-Aligned (Point 2.2) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Selectors */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              Môn học:
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="CS-202">CS-202: Cấu trúc dữ liệu và giải thuật</option>
              <option value="CS-201">CS-201: Cơ sở dữ liệu</option>
              <option value="CS-203">CS-203: Lập trình hướng đối tượng</option>
              <option value="CS-204">CS-204: Nhập môn trí tuệ nhân tạo</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              Cột điểm:
            </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">Tất cả cột (CC 10%, Quiz 20%, Lab 30%, GK 40%)</option>
              <option value="cc">Chuyên cần (10%)</option>
              <option value="quiz">Quiz trắc nghiệm tuần (20%)</option>
              <option value="lab">Thực hành Lab (30%)</option>
              <option value="gk">Thi giữa kỳ (40%)</option>
            </select>
          </div>
        </div>

        {/* Right Side: Search & Sorter */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm học viên theo tên, MSSV..."
              className="h-10 w-full pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer whitespace-nowrap"
          >
            <option value="final_desc">Sắp xếp: Điểm tổng kết giảm dần</option>
            <option value="name_asc">Sắp xếp: Họ tên A–Z</option>
            <option value="plo_asc">Sắp xếp: Tỷ lệ đạt PLO thấp đến cao</option>
            <option value="code_asc">Sắp xếp: MSSV tăng dần</option>
          </select>
        </div>
      </div>

      {/* Gradebook Table with Enhanced Text Contrast (Point 1.1) and Uniform Row Heights (Point 2.1) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">STT</th>
                <th className="px-5 py-3.5">Học viên & MSSV</th>
                <th className="px-4 py-3.5 text-center">
                  Chuyên cần
                  <br />
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                    (10%)
                  </span>
                </th>
                <th className="px-4 py-3.5 text-center">
                  Quiz TB
                  <br />
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                    (20%)
                  </span>
                </th>
                <th className="px-4 py-3.5 text-center">
                  Lab 01-04
                  <br />
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                    (30%)
                  </span>
                </th>
                <th className="px-4 py-3.5 text-center">
                  Giữa kỳ
                  <br />
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                    (40%)
                  </span>
                </th>
                <th className="px-4 py-3.5 text-center">
                  Tổng kết
                  <br />
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                    (Hệ 10 / Chữ)
                  </span>
                </th>
                <th className="px-5 py-3.5 text-center">Chuẩn đầu ra PLO</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredStudents.map((s) => {
                const isNeedsSupport = s.ploStatus === 'NEEDS_SUPPORT';
                const isExcellent = s.ploStatus === 'EXCELLENT';
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors h-16 ${
                      isNeedsSupport
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/30'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-4 py-3 text-center text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      {s.stt}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs ${s.avatarColor}`}
                        >
                          {s.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1.5">
                            <span className="truncate">{s.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {s.studentCode}
                            </span>

                            {/* Warning Tooltip (Point 2.1) - keeps uniform row height */}
                            {s.warning && (
                              <div className="group/warn relative inline-flex items-center">
                                <span
                                  className="material-symbols-outlined text-[17px] text-rose-500 hover:text-rose-600 cursor-help animate-pulse"
                                  title={s.warning}
                                >
                                  warning
                                </span>
                                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/warn:flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 dark:bg-slate-800 text-white px-2.5 py-1 text-[11px] font-medium shadow-xl z-30 border border-slate-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                  <span>{s.warning}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {s.attendanceScore.toFixed(1)}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-mono font-bold text-xs ${
                        s.quizScore < 6
                          ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {s.quizScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {s.labScore.toFixed(1)}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-mono font-bold text-xs ${
                        s.midtermScore < 6
                          ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {s.midtermScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${
                          isNeedsSupport
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                            : isExcellent
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <span className="text-xs font-mono">{s.finalScore.toFixed(1)}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                            isNeedsSupport
                              ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100'
                              : isExcellent
                              ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                              : 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                          }`}
                        >
                          {s.letterGrade}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 min-w-[170px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`font-extrabold ${
                              isNeedsSupport
                                ? 'text-rose-600 dark:text-rose-400'
                                : isExcellent
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {s.ploPercent}%
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              isNeedsSupport
                                ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                : isExcellent
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                            }`}
                          >
                            {isNeedsSupport
                              ? 'Cần hỗ trợ ⚠️'
                              : isExcellent
                              ? 'Xuất sắc ⭐'
                              : 'Đạt chuẩn'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              isNeedsSupport
                                ? 'bg-rose-500'
                                : isExcellent
                                ? 'bg-emerald-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${s.ploPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isNeedsSupport ? (
                          <button
                            type="button"
                            onClick={() => onInterveneClick(s)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              support_agent
                            </span>
                            Hỗ trợ
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => alert(`Xem chi tiết bài thi của ${s.name}`)}
                              title="Xem chi tiết bài thi"
                              className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                assignment
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => alert(`Gửi nhận xét tới ${s.name}`)}
                              title="Gửi nhận xét"
                              className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                comment
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Hiển thị <span className="font-bold text-slate-900 dark:text-slate-100">1 - {filteredStudents.length}</span> trong số <span className="font-bold text-slate-900 dark:text-slate-100">42</span> học viên
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 flex items-center justify-center disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs"
            >
              1
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium flex items-center justify-center"
            >
              2
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium flex items-center justify-center"
            >
              3
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Intelligence Card with Structured Bullet Points (Point 3.3) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {t('aiAssistantTitle')}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                  ILMS Intelligence
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Phát hiện bất thường và cá nhân hóa lộ trình hỗ trợ cho học viên chưa đạt chuẩn.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSendAiSuggestion}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            {t('aiSendSuggestion')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Distribution Column */}
          <div className="space-y-2">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Phân phối phổ điểm học phần:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Tập trung chủ yếu ở mức điểm khá (B/B+)
              </span>
            </div>
            <div className="space-y-2 pt-1">
              {/* Loại A */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Loại A (8.5 - 10):
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {aiAnalysis.distribution.gradeA.percent}% ({aiAnalysis.distribution.gradeA.count} SV)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${aiAnalysis.distribution.gradeA.percent}%` }}
                  />
                </div>
              </div>

              {/* Loại B */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Loại B (7.0 - 8.4):
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {aiAnalysis.distribution.gradeB.percent}% ({aiAnalysis.distribution.gradeB.count} SV)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${aiAnalysis.distribution.gradeB.percent}%` }}
                  />
                </div>
              </div>

              {/* Loại C */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Loại C (5.5 - 6.9):
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {aiAnalysis.distribution.gradeC.percent}% ({aiAnalysis.distribution.gradeC.count} SV)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${aiAnalysis.distribution.gradeC.percent}%` }}
                  />
                </div>
              </div>

              {/* Loại D/F */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Loại D/F (&lt; 5.5):
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {aiAnalysis.distribution.gradeDF.percent}% ({aiAnalysis.distribution.gradeDF.count} SV)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className="bg-rose-500 h-2 rounded-full"
                    style={{ width: `${aiAnalysis.distribution.gradeDF.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation Column - Scannable Bullet Points */}
          <div className="md:col-span-2 p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center flex-shrink-0 font-bold">
                <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Khuyến nghị can thiệp kiến thức trọng tâm
                </h4>

                {/* Structured Scannable Bullet Points */}
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>
                      Nhận diện <strong className="text-slate-900 dark:text-slate-100">3 học viên</strong> đang gặp khó khăn ở bài <strong>Quiz 05 (Cây phân đoạn - Segment Tree)</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>
                      Thực hành giải thuật tìm đường đi ngắn nhất (<strong>Dijkstra</strong>) có điểm trung bình thấp hơn <strong className="text-rose-600 dark:text-rose-400">32%</strong> so với toàn khóa.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>
                      Cần kích hoạt lộ trình gợi ý ôn tập Socratic AI hoặc tạo phiên luyện tập trọng tâm trước kỳ thi cuối kỳ.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/60">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Đề xuất hành động tức thì:
              </span>
              <button
                type="button"
                onClick={() => alert('Đã khởi tạo phiên Flash Practice 10 câu trắc nghiệm trọng tâm')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                Mở phiên luyện tập Flash Practice (10 câu)
              </button>
              <button
                type="button"
                onClick={() => alert('Đã tạo bài tập bổ trợ cá nhân hóa cho học viên cần hỗ trợ')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                Giao bài tập bổ trợ cá nhân hóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
