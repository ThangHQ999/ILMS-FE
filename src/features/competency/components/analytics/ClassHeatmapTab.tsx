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
        <span className="px-3 py-0.5 rounded-full bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] font-mono text-xs font-medium border-none whitespace-nowrap">
          {score}%
        </span>
      );
    }
    if (score < 80) {
      return (
        <span className="px-3 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] font-mono text-xs font-medium border-none whitespace-nowrap">
          {score}%
        </span>
      );
    }
    return (
      <span className="px-3 py-0.5 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] font-mono text-xs font-semibold border-none whitespace-nowrap">
        {score}%
      </span>
    );
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-xs font-semibold font-mono border-none">
              Chế độ Giảng viên
            </span>
            <span className="font-mono text-xs text-[#747775] dark:text-[#8E918F]">
              Lớp: {data.classCode} • Sĩ số: {data.totalStudents}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3] mt-1">
            Bản đồ nhiệt Thông thạo Cả lớp
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#747775] dark:text-[#8E918F]">Thang đo màu:</span>
          <div className="flex items-center gap-1.5 text-[#444746] dark:text-[#C4C7C5]">
            <span className="w-4 h-4 rounded-full bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784] flex items-center justify-center font-bold text-[10px]">
              &lt;
            </span>
            <span>&lt;60% Cần trợ giúp</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#444746] dark:text-[#C4C7C5]">
            <span className="w-4 h-4 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center font-bold text-[10px]">
              75
            </span>
            <span>Đạt chuẩn PLO</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#444746] dark:text-[#C4C7C5]">
            <span className="w-4 h-4 rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] flex items-center justify-center font-bold text-[10px]">
              90
            </span>
            <span>Xuất sắc</span>
          </div>
        </div>
      </div>

      {/* Heatmap Table Matrix Container */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-none overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[840px]">
          <thead>
            <tr className="border-b border-[#F0F4F9] dark:border-[#282A2C] text-xs font-bold text-[#747775] dark:text-[#C4C7C5]">
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
          <tbody className="divide-y divide-[#F0F4F9] dark:divide-[#282A2C]/50 text-xs">
            {data.students.map((st) => (
              <tr
                key={st.id}
                className={`transition-colors ${
                  st.isCurrentUser
                    ? 'bg-[#D3E3FD]/30 dark:bg-[#162B4D]/40 hover:bg-[#D3E3FD]/50 dark:hover:bg-[#162B4D]/60'
                    : 'hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C]'
                }`}
              >
                <td className="py-3.5 px-3 font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      st.isCurrentUser
                        ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                        : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
                    }`}
                  >
                    {st.avatarText}
                  </span>
                  <div>
                    <span className={st.isCurrentUser ? 'text-[#0B57D0] dark:text-[#A8C7FA] font-bold' : ''}>
                      {st.name}
                    </span>
                    <span className="block text-[11px] text-[#747775] dark:text-[#8E918F] font-mono">
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
                  <span className={st.overallPlo < 60 ? 'text-[#725200] dark:text-[#FFB784]' : 'text-[#0B57D0] dark:text-[#A8C7FA]'}>
                    {st.overallPlo}%
                  </span>
                </td>
              </tr>
            ))}

            {/* Class Average Row Footer */}
            <tr className="bg-[#F0F4F9] dark:bg-[#1E1F20] font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              <td className="py-3.5 px-3">
                Trung Bình Cả Lớp ({data.totalStudents} SV)
              </td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.algo}%</td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.segTree}%</td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.fenwick}%</td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.dijkstra}%</td>
              <td className="py-3.5 px-3 text-center font-mono text-[#725200] dark:text-[#FFB784]">
                {data.classAverages.dpBitmask}% ⚠
              </td>
              <td className="py-3.5 px-3 text-center font-mono">{data.classAverages.advGraph}%</td>
              <td className="py-3.5 px-3 text-right font-bold text-[#0B57D0] dark:text-[#A8C7FA] font-mono text-sm">
                {data.classAverages.overallPlo}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
