'use client';

import React from 'react';
import { CompetencyRadarData } from '../../types';

interface CompetencyRadarCardProps {
  data: CompetencyRadarData;
  showClassAvg: boolean;
  showPloTarget: boolean;
  showPersonalTarget: boolean;
}

export function CompetencyRadarCard({
  data,
  showClassAvg,
  showPloTarget,
  showPersonalTarget,
}: CompetencyRadarCardProps) {
  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-none flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B57D0] dark:text-[#A8C7FA] font-mono">
            Phân tích đa chiều
          </span>
          <h2 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3] mt-0.5">Biểu đồ Radar Năng lực</h2>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-mono text-[11px] font-semibold border-none">
          6 Tiêu chí PLO
        </span>
      </div>

      {/* Radar SVG Canvas */}
      <div className="relative my-4 flex items-center justify-center">
        <svg
          role="img"
          aria-label="Biểu đồ radar so sánh năng lực học sinh"
          className="w-full max-w-sm h-auto overflow-visible"
          viewBox="0 0 440 400"
        >
          <defs>
            <linearGradient id="studentFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B57D0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0B57D0" stopOpacity="0.06" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0B57D0" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Concentric Hexagon Grid Web (Center at 220, 200) */}
          {/* 100% */}
          <polygon
            points="220,60 341,130 341,270 220,340 99,270 99,130"
            fill="none"
            className="stroke-[#E1E5EA] dark:stroke-[#282A2C]"
            strokeWidth="1.2"
          />
          {/* 80% */}
          <polygon
            points="220,88 317,144 317,256 220,312 123,256 123,144"
            fill="none"
            className="stroke-[#E1E5EA] dark:stroke-[#282A2C]"
            strokeDasharray="3,3"
            strokeWidth="1"
          />
          {/* 60% */}
          <polygon
            points="220,116 293,158 293,242 220,284 147,242 147,158"
            fill="none"
            className="stroke-[#E1E5EA] dark:stroke-[#282A2C]"
            strokeWidth="1"
          />
          {/* 40% */}
          <polygon
            points="220,144 268,172 268,228 220,256 172,228 172,172"
            fill="none"
            className="stroke-[#E1E5EA] dark:stroke-[#282A2C]"
            strokeDasharray="3,3"
            strokeWidth="1"
          />
          {/* 20% */}
          <polygon
            points="220,172 244,186 244,214 220,228 196,214 196,186"
            fill="none"
            className="stroke-[#E1E5EA] dark:stroke-[#282A2C]"
            strokeWidth="1"
          />

          {/* Radiating Axes */}
          <line x1="220" y1="200" x2="220" y2="60" className="stroke-[#E1E5EA] dark:stroke-[#333537]" strokeWidth="1" />
          <line x1="220" y1="200" x2="341" y2="130" className="stroke-[#E1E5EA] dark:stroke-[#333537]" strokeWidth="1" />
          <line x1="220" y1="200" x2="341" y2="270" className="stroke-[#E1E5EA] dark:stroke-[#333537]" strokeWidth="1" />
          <line x1="220" y1="200" x2="220" y2="340" className="stroke-[#E1E5EA] dark:stroke-[#333537]" strokeWidth="1" />
          <line x1="220" y1="200" x2="99" y2="270" className="stroke-[#E1E5EA] dark:stroke-[#333537]" strokeWidth="1" />
          <line x1="220" y1="200" x2="99" y2="130" className="stroke-[#E1E5EA] dark:stroke-[#333537]" strokeWidth="1" />

          {/* Benchmark 1: Class Average (Dotted Grey Outline) */}
          {showClassAvg && (
            <polygon
              points="220,99 307,150 311,252 220,306 145,243 130,148"
              fill="#747775"
              fillOpacity="0.08"
              stroke="#747775"
              strokeDasharray="4,4"
              strokeWidth="1.8"
            />
          )}

          {/* Benchmark 2: PLO 80% (Neutral Muted Slate dotted ring) */}
          {showPloTarget && (
            <polygon
              points="220,88 317,144 317,256 220,312 123,256 123,144"
              fill="none"
              stroke="#5F6368"
              strokeDasharray="2,2"
              strokeOpacity="0.7"
              strokeWidth="1.5"
            />
          )}

          {/* Benchmark 3: Personal Target (Soft MD3 Green 90%) */}
          {showPersonalTarget && (
            <polygon
              points="220,74 329,137 329,263 220,326 111,263 111,137"
              fill="none"
              stroke="#1EA85A"
              strokeDasharray="3,3"
              strokeOpacity="0.7"
              strokeWidth="1.5"
            />
          )}

          {/* Student Polygon (Trần Nhật Minh): */}
          {/* Algo: 88%, DataStruct: 85%, Complexity: 92%, C++: 78%, DP: 58%, Graph: 74% */}
          <polygon
            points="220,77 323,140 331,264 220,309 150,241 130,148"
            fill="url(#studentFillGrad)"
            filter="url(#softGlow)"
            stroke="#0B57D0"
            strokeWidth="2.5"
          />

          {/* Node marker points */}
          <circle cx="220" cy="77" r="4.5" fill="#0B57D0" stroke="#ffffff" strokeWidth="2" />
          <circle cx="323" cy="140" r="4.5" fill="#0B57D0" stroke="#ffffff" strokeWidth="2" />
          <circle cx="331" cy="264" r="4.5" fill="#0B57D0" stroke="#ffffff" strokeWidth="2" />
          <circle cx="220" cy="309" r="4.5" fill="#0B57D0" stroke="#ffffff" strokeWidth="2" />
          {/* DP Warning Marker: Soft Amber (NOT RED) */}
          <circle cx="150" cy="241" r="5.5" fill="#BA8000" stroke="#ffffff" strokeWidth="2" />
          <circle cx="130" cy="148" r="4.5" fill="#0B57D0" stroke="#ffffff" strokeWidth="2" />

          {/* Dimension Labels */}
          <text x="220" y="44" textAnchor="middle" className="text-[12px] font-medium fill-[#1F1F1F] dark:fill-[#E3E3E3]">
            Tư duy Thuật toán (88%)
          </text>
          <text x="350" y="128" textAnchor="start" className="text-[12px] font-medium fill-[#1F1F1F] dark:fill-[#E3E3E3]">
            CTDL Nâng cao (85%)
          </text>
          <text x="350" y="278" textAnchor="start" className="text-[12px] font-medium fill-[#1F1F1F] dark:fill-[#E3E3E3]">
            Tối ưu Độ phức tạp (92%)
          </text>
          <text x="220" y="362" textAnchor="middle" className="text-[12px] font-medium fill-[#1F1F1F] dark:fill-[#E3E3E3]">
            Lập trình C++ (78%)
          </text>
          {/* DP Callout Soft Amber */}
          <text x="75" y="258" textAnchor="end" className="text-[12px] font-medium fill-[#B06000] dark:fill-[#FFB784]">
            Quy hoạch động (58%) ⚠
          </text>
          <text x="80" y="126" textAnchor="end" className="text-[12px] font-medium fill-[#1F1F1F] dark:fill-[#E3E3E3]">
            Đồ thị &amp; Toán rời rạc (74%)
          </text>
        </svg>
      </div>

      {/* Color Badge Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
          <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-medium">Học viên ({data.overallUserScore}%)</span>
        </div>
        {showClassAvg && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#747775]" />
            <span className="text-[#444746] dark:text-[#C4C7C5]">TB Lớp ({data.overallClassAvg}%)</span>
          </div>
        )}
        {showPloTarget && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#5F6368]/50" />
            <span className="text-[#444746] dark:text-[#C4C7C5]">Kỳ vọng PLO ({data.overallPloTarget}%)</span>
          </div>
        )}
        {showPersonalTarget && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1EA85A]/50" />
            <span className="text-[#444746] dark:text-[#C4C7C5]">Mục tiêu cá nhân (90%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
