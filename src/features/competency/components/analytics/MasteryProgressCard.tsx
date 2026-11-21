'use client';

import React from 'react';
import { MasteryTopic, MasteryTrendPoint } from '../../types';

interface MasteryProgressCardProps {
  topics: MasteryTopic[];
  trendPoints: MasteryTrendPoint[];
}

export function MasteryProgressCard({ topics, trendPoints }: MasteryProgressCardProps) {
  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-none flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B57D0] dark:text-[#A8C7FA] font-mono">
              Cấp độ thông thạo
            </span>
            <h2 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3] mt-0.5">Tiến độ Chủ đề Trọng tâm</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] font-mono text-[11px] font-medium border-none">
            4 Mức Năng lực
          </span>
        </div>

        {/* Progress Bars */}
        <div className="flex flex-col gap-3.5 mt-3">
          {topics.map((item) => {
            if (item.isBottleneck) {
              return (
                <div key={item.id} className="flex flex-col gap-1 p-3.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[17px] text-[#B3261E] dark:text-[#F28B82]">
                        lightbulb
                      </span>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-[#FAD2CF] dark:bg-[#3C1919] text-[#B3261E] dark:text-[#F28B82] text-[11px] font-medium border-none">
                        {item.tierLabel}
                      </span>
                      <span className="font-mono font-bold text-[#B3261E] dark:text-[#F28B82]">{item.progress}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white dark:bg-[#1E1F20] overflow-hidden border-none">
                    <div className="h-full rounded-full bg-[#B3261E] dark:bg-[#F28B82]" style={{ width: `${item.progress}%` }} />
                  </div>
                  {item.subtitle && (
                    <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] mt-0.5">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#1F1F1F] dark:text-[#E3E3E3]">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-medium border-none ${
                        item.tier === 'excellent'
                          ? 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]'
                          : item.tier === 'master'
                          ? 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]'
                          : 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
                      }`}
                    >
                      {item.tierLabel}
                    </span>
                    <span className="font-mono font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">{item.progress}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] overflow-hidden border-none">
                  <div
                    className={`h-full rounded-full ${
                      item.tier === 'excellent' || item.tier === 'master'
                        ? 'bg-[#1EA85A] dark:bg-[#81C995]'
                        : 'bg-[#0B57D0] dark:bg-[#A8C7FA]'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Trend Line (Progress Over Time 12 Weeks) */}
      <div className="pt-4 mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#444746] dark:text-[#C4C7C5] font-medium">Lịch sử tiến bộ (Tuần 1 → 12)</span>
          <span className="text-xs text-[#0B57D0] dark:text-[#A8C7FA] font-bold">+27.5% tổng thể</span>
        </div>
        <div className="relative h-14 w-full">
          <svg
            role="img"
            aria-label="Đồ thị tiến trình tuần"
            className="w-full h-full overflow-visible"
            viewBox="0 0 320 60"
          >
            <path
              d="M 10 50 Q 80 44, 110 32 T 210 22 T 310 8"
              fill="none"
              stroke="#0B57D0"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
            {/* Area Fill */}
            <path
              d="M 10 50 Q 80 44, 110 32 T 210 22 T 310 8 L 310 60 L 10 60 Z"
              fill="#0B57D0"
              opacity="0.1"
            />
            {/* Points */}
            <circle cx="10" cy="50" r="3.5" fill="#0B57D0" />
            <circle cx="110" cy="32" r="3.5" fill="#0B57D0" />
            <circle cx="210" cy="22" r="3.5" fill="#0B57D0" />
            <circle cx="310" cy="8" r="4.5" fill="#0B57D0" />
          </svg>
        </div>
        <div className="flex justify-between text-[11px] font-mono text-[#747775] dark:text-[#8E918F] mt-1">
          {trendPoints.map((tp, idx) => (
            <span
              key={tp.week}
              className={idx === trendPoints.length - 1 ? 'text-[#0B57D0] dark:text-[#A8C7FA] font-bold' : ''}
            >
              {tp.week} ({tp.label})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
