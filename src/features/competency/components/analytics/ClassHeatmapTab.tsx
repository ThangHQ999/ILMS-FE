'use client';

import React from 'react';
import { ClassHeatmapData } from '../../types';

interface ClassHeatmapTabProps {
  data: ClassHeatmapData;
}

export function ClassHeatmapTab({ data }: ClassHeatmapTabProps) {
  const renderScoreBadge = (score: number) => {
    if (score < 60) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold">
          {score}%
        </span>
      );
    }
    if (score < 80) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold">
          {score}%
        </span>
      );
    }
    if (score < 90) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-mono text-xs font-bold">
          {score}%
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono text-xs font-bold">
        {score}%
      </span>
    );
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono">
              Chế độ Giảng viên
            </span>
            <span className="font-mono text-xs text-slate-400">
              Lớp: {data.classCode} • Sĩ số: {data.totalStudents}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Bản đồ nhiệt Thông thạo Cả lớp
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Thang đo màu:</span>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-[10px]">
              &lt;
            </span>
            <span>&lt;60% Cần trợ giúp</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
              75
            </span>
            <span>Đạt chuẩn PLO</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              90
            </span>
            <span>Xuất sắc</span>
          </div>
        </div>
      </div>

      {/* Heatmap Table Matrix Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[840px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
              <th className="py-3 px-3">Mã SV &amp; Họ tên</th>
              <th className="py-3 px-3 text-center">Tư duy Thuật toán</th>
              <th className="py-3 px-3 text-center">CTDL Segment Tree</th>
              <th className="py-3 px-3 text-center">Fenwick (BIT)</th>
              <th className="py-3 px-3 text-center">Dijkstra &amp; DSU</th>
              <th className="py-3 px-3 text-center">Quy hoạch động Bitmask</th>
              <th className="py-3 px-3 text-center">Đồ thị nâng cao</th>
              <th className="py-3 px-3 text-right">Tổng thể PLO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {data.students.map((st) => (
              <tr
                key={st.id}
                className={`transition-colors ${
                  st.isCurrentUser
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/60 dark:hover:bg-blue-900/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      st.isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {st.avatarText}
                  </span>
                  <div>
                    <span className={st.isCurrentUser ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>
                      {st.name}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-mono">
                      {st.studentCode} {st.isCurrentUser ? '• You' : ''}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-center">{renderScoreBadge(st.scores.algo)}</td>
                <td className="py-3.5 px-3 text-center">{renderScoreBadge(st.scores.segTree)}</td>
                <td className="py-3.5 px-3 text-center">{renderScoreBadge(st.scores.fenwick)}</td>
                <td className="py-3.5 px-3 text-center">{renderScoreBadge(st.scores.dijkstra)}</td>
                <td className="py-3.5 px-3 text-center">{renderScoreBadge(st.scores.dpBitmask)}</td>
                <td className="py-3.5 px-3 text-center">{renderScoreBadge(st.scores.advGraph)}</td>
                <td className="py-3.5 px-3 text-right font-bold font-mono text-sm">
                  <span className={st.overallPlo < 60 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}>
                    {st.overallPlo}%
                  </span>
                </td>
              </tr>
            ))}

            {/* Class Average Row Footer */}
            <tr className="bg-slate-100/80 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
              <td className="py-3.5 px-3">
                Trung Bình Cả Lớp ({data.totalStudents} SV)
              </td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.algo}%</td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.segTree}%</td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.fenwick}%</td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.dijkstra}%</td>
              <td className="py-3.5 px-3 text-center font-mono text-amber-700 dark:text-amber-400">
                {data.classAverages.dpBitmask}% ⚠
              </td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.advGraph}%</td>
              <td className="py-3.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                {data.classAverages.overallPlo}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
