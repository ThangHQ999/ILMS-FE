'use client';

import React from 'react';
import { MasteryTopic, MasteryTrendPoint } from '../../types';

interface MasteryProgressCardProps {
  topics: MasteryTopic[];
  trendPoints: MasteryTrendPoint[];
}

export function MasteryProgressCard({ topics, trendPoints }: MasteryProgressCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Cấp độ thông thạo
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Tiến độ Chủ đề Trọng tâm</h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
            4 Mức Năng lực
          </span>
        </div>

        {/* Progress Bars */}
        <div className="flex flex-col gap-3.5 mt-3">
          {topics.map((item) => {
            if (item.isBottleneck) {
              return (
                <div key={item.id} className="flex flex-col gap-1 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-300/50 dark:border-amber-900/40">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[17px] text-amber-600 dark:text-amber-400">
                        lightbulb
                      </span>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                        {item.tierLabel}
                      </span>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{item.progress}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${item.progress}%` }} />
                  </div>
                  {item.subtitle && (
                    <span className="text-[11px] text-amber-700 dark:text-amber-300/90 mt-0.5">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-900 dark:text-slate-100">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        item.tier === 'excellent'
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                          : item.tier === 'master'
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.tierLabel}
                    </span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{item.progress}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.tier === 'excellent'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        : item.tier === 'master'
                        ? 'bg-blue-600'
                        : 'bg-slate-400 dark:bg-slate-500'
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
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lịch sử tiến bộ (Tuần 1 → 12)</span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">+27.5% tổng thể</span>
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
              stroke="#2563eb"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
            {/* Area Fill */}
            <path
              d="M 10 50 Q 80 44, 110 32 T 210 22 T 310 8 L 310 60 L 10 60 Z"
              fill="#2563eb"
              opacity="0.12"
            />
            {/* Points */}
            <circle cx="10" cy="50" r="3.5" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="110" cy="32" r="3.5" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="210" cy="22" r="3.5" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="310" cy="8" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
          {trendPoints.map((tp, idx) => (
            <span
              key={tp.week}
              className={idx === trendPoints.length - 1 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
            >
              {tp.week} ({tp.label})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
