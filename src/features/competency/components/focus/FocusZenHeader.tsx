'use client';

import React, { useState, useEffect } from 'react';
import { FocusGoal } from '../../types';

interface FocusZenHeaderProps {
  goals: FocusGoal[];
  currentGoalIndex: number;
  onSelectGoal: (index: number) => void;
  onExitFocus: () => void;
}

export function FocusZenHeader({
  goals,
  currentGoalIndex,
  onSelectGoal,
  onExitFocus,
}: FocusZenHeaderProps) {
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const currentGoal = goals[currentGoalIndex] || goals[0];

  // Listen to ESC key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitFocus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFocus]);

  return (
    <header className="relative z-20 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-3">
        {/* Focus Mode Live Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
          </span>
          <span className="text-[11px] font-bold tracking-wider text-blue-700 dark:text-blue-300 uppercase font-mono">
            BẢN ĐỒ NĂNG LỰC • FOCUS MODE
          </span>

          <span className="text-slate-300 dark:text-slate-600 text-xs">|</span>

          {/* Queue dropdown menu */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setIsQueueOpen((prev) => !prev)}
              className="text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 font-semibold py-0.5 px-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-blue-400">
                checklist
              </span>
              <span>Nhiệm vụ {currentGoalIndex + 1}/{goals.length} hôm nay</span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-1 rounded-full font-mono">
                {goals.length}
              </span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">
                expand_more
              </span>
            </button>

            {isQueueOpen && (
              <div className="absolute left-0 mt-2.5 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-3 z-50 transition-all duration-200 backdrop-blur-md">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                      alt_route
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      Hàng đợi hôm nay (Queue)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium font-mono">
                    1/{goals.length} hoàn tất
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {goals.map((g, idx) => {
                    const isSelected = idx === currentGoalIndex;
                    return (
                      <div
                        key={g.id}
                        onClick={() => {
                          onSelectGoal(idx);
                          setIsQueueOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col gap-1.5 ${
                          isSelected
                            ? 'border-blue-500/60 bg-blue-50/70 dark:bg-blue-950/40'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                g.urgency === 'urgent'
                                  ? 'bg-amber-500 animate-pulse'
                                  : g.urgency === 'reviewed'
                                  ? 'bg-emerald-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            {idx + 1}. {g.title.split(' ')[0]}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono border ${
                              g.urgency === 'urgent'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : g.urgency === 'reviewed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {g.statusText}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              g.urgency === 'urgent'
                                ? 'bg-amber-500'
                                : g.urgency === 'reviewed'
                                ? 'bg-emerald-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${g.currentScore}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-blue-600">info</span>
                    Click mục tiêu để chuyển ngay
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQueueOpen(false)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">trending_up</span>
          <span>Bạn đã làm tốt hơn chính mình ngày hôm qua (+12% khả năng tư duy)</span>
        </div>
      </div>

      {/* Right dock: Streak, XP, Exit button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm text-xs">
          <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
            <span className="material-symbols-outlined text-[16px] text-amber-500">
              local_fire_department
            </span>
            <span>Chuỗi 5 ngày 🔥</span>
          </div>
          <span className="text-slate-200 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
            <span className="material-symbols-outlined text-[16px] text-blue-500">bolt</span>
            <span>+120 XP</span>
          </div>
        </div>

        {/* Exit Focus Mode Button */}
        <button
          type="button"
          onClick={onExitFocus}
          className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition text-xs font-semibold"
          title="Quay lại Chế độ Phân tích (ESC)"
        >
          <span className="material-symbols-outlined text-[16px] text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white transition">
            close
          </span>
          <span>Thoát chế độ tập trung</span>
          <kbd className="hidden sm:inline-block text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-600">
            ESC
          </kbd>
        </button>
      </div>
    </header>
  );
}
