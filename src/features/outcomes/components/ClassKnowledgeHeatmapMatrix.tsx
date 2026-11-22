'use client';

import React, { useState } from 'react';
import { useClassKnowledgeHeatmap, useClassKnowledgeGaps } from '../hooks/useOutcomes';
import type { MasteryStatus } from '../schemas/knowledge-heatmap.schema';

interface ClassKnowledgeHeatmapMatrixProps {
  classId: string;
  courseId: string;
}

export function ClassKnowledgeHeatmapMatrix({
  classId,
  courseId,
}: ClassKnowledgeHeatmapMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showGapsPanel, setShowGapsPanel] = useState(false);
  const [threshold, setThreshold] = useState(50.0);

  const {
    data: heatmap,
    isLoading: isHeatmapLoading,
    isError: isHeatmapError,
    refetch: refetchHeatmap,
  } = useClassKnowledgeHeatmap(classId, courseId);

  const {
    data: gaps,
    isLoading: isGapsLoading,
  } = useClassKnowledgeGaps(classId, courseId, threshold);

  // Helper for color coding the 5 mastery levels (Mục 21.1)
  const getMasteryBadge = (score?: number, status?: MasteryStatus) => {
    if (score === undefined || score === null || score < 1) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          --
        </span>
      );
    }

    if (score < 40) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
          {score.toFixed(1)}%
        </span>
      );
    }

    if (score < 70) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
          {score.toFixed(1)}%
        </span>
      );
    }

    if (score < 85) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
          {score.toFixed(1)}%
        </span>
      );
    }

    return (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-50 text-teal-800 dark:bg-teal-950/70 dark:text-teal-200 border border-teal-200/60 dark:border-teal-900/40">
        {score.toFixed(1)}%
      </span>
    );
  };

  // 1. Loading Skeleton
  if (isHeatmapLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-[#1E1F20] rounded-2xl w-72" />
        <div className="h-96 bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border border-slate-200 dark:border-[#333537]" />
      </div>
    );
  }

  // 2. Error State
  if (isHeatmapError || !heatmap) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#333537] text-center space-y-3">
        <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-[#E3E3E3]">
          Không thể tải Bản đồ nhiệt Tri thức
        </h3>
        <p className="text-xs text-slate-500 dark:text-[#C4C7C5]">
          Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.
        </p>
        <button
          type="button"
          onClick={() => refetchHeatmap()}
          className="px-4 py-2 text-xs font-semibold rounded-full bg-[#0B57D0] text-white hover:bg-[#0842A0] transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Filter rows by search
  const filteredRows = heatmap.rows.filter((r) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(q) ||
      (r.studentEmail && r.studentEmail.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]">
              Môn học: {heatmap.courseName || courseId}
            </span>
            <span className="text-xs text-slate-500 dark:text-[#C4C7C5]">
              Sĩ số: {heatmap.rows.length} sinh viên • {heatmap.conceptHeaders.length} khái niệm
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#E3E3E3] mt-1">
            Bản đồ nhiệt Thành thục Tri thức (Knowledge Mastery Heatmap)
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search box */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-full text-xs bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#383A3D] text-slate-800 dark:text-[#E3E3E3] focus:outline-none focus:ring-2 focus:ring-[#A8C7FA]"
            />
          </div>

          {/* Toggle Gaps Drawer */}
          <button
            type="button"
            onClick={() => setShowGapsPanel((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border cursor-pointer ${
              showGapsPanel
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
                : 'bg-white dark:bg-[#1E1F20] text-slate-700 dark:text-[#E3E3E3] border-slate-200 dark:border-[#383A3D] hover:bg-slate-50 dark:hover:bg-[#282A2C]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-rose-500">
              warning
            </span>
            <span>Phân tích Điểm nghẽn ({gaps?.weakConcepts.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Knowledge Gaps Analysis Panel (Collapsible) */}
      {showGapsPanel && gaps && (
        <div className="p-5 rounded-3xl bg-rose-50/50 dark:bg-[#2A1717]/60 border border-rose-200/80 dark:border-rose-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[20px]">
                crisis_alert
              </span>
              <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                Cảnh báo Điểm nghẽn Tri thức &amp; Sinh viên Nguy cơ (Dưới ngưỡng {threshold}%)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 dark:text-slate-300">Ngưỡng cảnh báo:</span>
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-[#1E1F20] border border-rose-300 dark:border-rose-800 text-slate-800 dark:text-[#E3E3E3]"
              >
                <option value={40}>40% (Rất yếu)</option>
                <option value={50}>50% (Tiêu chuẩn)</option>
                <option value={60}>60% (Cảnh báo sớm)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weak Concepts */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-rose-100 dark:border-rose-900/40 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-[#E3E3E3] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-rose-500 text-[16px]">
                  psychology_alt
                </span>
                Khái niệm nhiều sinh viên chưa đạt ({gaps.weakConcepts.length})
              </h4>
              {gaps.weakConcepts.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Không có khái niệm nào dưới ngưỡng cảnh báo!
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {gaps.weakConcepts.map((c) => (
                    <div
                      key={c.conceptId}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-[#282A2C] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-[#E3E3E3]">
                          {c.conceptName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {c.chapterTitle || 'Chương học'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {c.averageScore.toFixed(1)}%
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {c.weakStudentCount}/{c.totalStudents} sinh viên yếu
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* At-risk Students */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-rose-100 dark:border-rose-900/40 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-[#E3E3E3] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-rose-500 text-[16px]">
                  person_alert
                </span>
                Sinh viên có nguy cơ rớt môn ({gaps.atRiskStudents.length})
              </h4>
              {gaps.atRiskStudents.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Không có sinh viên nào rơi vào vùng nguy cơ!
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {gaps.atRiskStudents.map((s) => (
                    <div
                      key={s.studentId}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-[#282A2C] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-[#E3E3E3]">
                          {s.studentName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {s.studentEmail || s.studentId}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          TB: {s.averageScore.toFixed(1)}%
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {s.weakConceptCount} khái niệm yếu
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="flex items-center gap-3 text-xs flex-wrap bg-white dark:bg-[#1E1F20] p-3 rounded-2xl border border-slate-100 dark:border-[#282A2C]">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Thang đo thành thục:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="text-slate-600 dark:text-slate-400">Chưa bắt đầu (&lt;1%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-slate-600 dark:text-slate-400">Yếu (1 - 39.9%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-600 dark:text-slate-400">Đang phát triển (40 - 69.9%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-600 dark:text-slate-400">Thành thạo (70 - 84.9%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-teal-600" />
          <span className="text-slate-600 dark:text-slate-400">Làm chủ (&ge;85%)</span>
        </div>
      </div>

      {/* 2D Heatmap Matrix Table */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-[#333537] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#282A2C] text-xs font-bold text-slate-600 dark:text-slate-300">
              <th className="py-3 px-4 min-w-[200px] sticky left-0 bg-white dark:bg-[#1E1F20] z-10">
                Sinh viên ({filteredRows.length})
              </th>
              <th className="py-3 px-3 text-center min-w-[80px]">
                Điểm TB
              </th>
              {heatmap.conceptHeaders.map((header) => (
                <th
                  key={header.conceptId}
                  className="py-3 px-2.5 text-center min-w-[130px] max-w-[180px]"
                  title={header.chapterTitle ? `${header.chapterTitle} • ${header.conceptName}` : header.conceptName}
                >
                  <p className="truncate text-xs font-semibold text-slate-800 dark:text-[#E3E3E3]">
                    {header.conceptName}
                  </p>
                  {header.chapterTitle && (
                    <p className="text-[10px] text-slate-400 truncate font-normal">
                      {header.chapterTitle}
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#282A2C]/60 text-xs">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={heatmap.conceptHeaders.length + 2}
                  className="py-12 text-center text-slate-400 text-xs"
                >
                  Không tìm thấy sinh viên nào phù hợp bộ lọc tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr
                  key={row.studentId}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#282A2C]/50 transition-colors"
                >
                  <td className="py-3 px-4 sticky left-0 bg-white dark:bg-[#1E1F20] z-10">
                    <p className="font-semibold text-slate-800 dark:text-[#E3E3E3]">
                      {row.studentName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {row.studentEmail || row.studentId}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-slate-100">
                    {row.averageScore.toFixed(1)}%
                  </td>
                  {heatmap.conceptHeaders.map((header) => {
                    const score = row.conceptScores[header.conceptId];
                    return (
                      <td
                        key={header.conceptId}
                        className="py-3 px-2 text-center"
                      >
                        {getMasteryBadge(score)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>

          {/* Footer: Class Averages */}
          {heatmap.classAverages && heatmap.classAverages.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-[#383A3D] bg-slate-50 dark:bg-[#191A1B] text-xs font-bold">
                <td className="py-3.5 px-4 sticky left-0 bg-slate-50 dark:bg-[#191A1B] z-10 text-slate-900 dark:text-[#E3E3E3]">
                  Trung bình Cả lớp
                </td>
                <td className="py-3.5 px-3 text-center text-blue-600 dark:text-[#A8C7FA]">
                  {(
                    heatmap.classAverages.reduce((acc, curr) => acc + curr.averageScore, 0) /
                    heatmap.classAverages.length
                  ).toFixed(1)}%
                </td>
                {heatmap.conceptHeaders.map((header) => {
                  const avg = heatmap.classAverages.find(
                    (a) => a.conceptId === header.conceptId
                  );
                  return (
                    <td
                      key={header.conceptId}
                      className="py-3.5 px-2 text-center"
                    >
                      {getMasteryBadge(avg?.averageScore, avg?.status)}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
