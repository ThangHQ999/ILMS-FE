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
    <header className="relative z-20 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-none bg-white/90 dark:bg-[#1E1F20] backdrop-blur-md shadow-none">
      <div className="flex items-center gap-3">
        {/* Focus Mode Live Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none shadow-none">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B57D0] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0B57D0] dark:bg-[#A8C7FA]" />
          </span>
          <span className="text-[11px] font-bold tracking-wider text-[#041E49] dark:text-[#A8C7FA] uppercase font-mono">
            BẢN ĐỒ NĂNG LỰC • FOCUS MODE
          </span>

          <span className="text-slate-300 dark:text-[#8E918F] text-xs">|</span>

          {/* Queue dropdown menu */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setIsQueueOpen((prev) => !prev)}
              className="text-xs text-slate-700 dark:text-[#C4C7C5] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] flex items-center gap-1.5 font-semibold py-0.5 px-2 rounded-full hover:bg-white/80 dark:hover:bg-[#333537] transition"
            >
              <span className="material-symbols-outlined text-[15px] text-[#0B57D0] dark:text-[#A8C7FA]">
                checklist
              </span>
              <span>Nhiệm vụ {currentGoalIndex + 1}/{goals.length} hôm nay</span>
              <span className="text-[10px] bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-bold px-1.5 py-0.2 rounded-full font-mono border-none">
                {goals.length}
              </span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">
                expand_more
              </span>
            </button>

            {isQueueOpen && (
              <div className="absolute left-0 mt-2.5 w-80 rounded-2xl bg-white dark:bg-[#1E1F20] border-none shadow-2xl p-3 z-50 transition-all duration-200 backdrop-blur-md">
                <div className="flex items-center justify-between pb-2 mb-2 border-none">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                      alt_route
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-[#E3E3E3] uppercase tracking-wide">
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
                        className={`p-2.5 rounded-2xl border-none cursor-pointer transition flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-[#D3E3FD] dark:bg-[#162B4D]'
                            : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-[#E3E3E3] flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                g.urgency === 'urgent'
                                  ? 'bg-[#725200] animate-pulse'
                                  : g.urgency === 'reviewed'
                                  ? 'bg-[#0D652D]'
                                  : 'bg-[#0B57D0]'
                              }`}
                            />
                            {idx + 1}. {g.title.split(' ')[0]}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border-none ${
                              g.urgency === 'urgent'
                                ? 'bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784]'
                                : g.urgency === 'reviewed'
                                ? 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]'
                                : 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
                            }`}
                          >
                            {g.statusText}
                          </span>
                        </div>
                        <div className="w-full bg-[#E1E5EA] dark:bg-[#333537] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              g.urgency === 'urgent'
                                ? 'bg-[#725200] dark:bg-[#FFB784]'
                                : g.urgency === 'reviewed'
                                ? 'bg-[#0D652D] dark:bg-[#81C995]'
                                : 'bg-[#0B57D0] dark:bg-[#A8C7FA]'
                            }`}
                            style={{ width: `${g.currentScore}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-none flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#0B57D0]">info</span>
                    Click mục tiêu để chuyển ngay
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQueueOpen(false)}
                    className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C4EED0] dark:bg-[#142E20] border-none text-[#0D652D] dark:text-[#81C995] text-xs font-medium">
          <span className="material-symbols-outlined text-[16px] text-[#0D652D] dark:text-[#81C995]">trending_up</span>
          <span>Bạn đã làm tốt hơn chính mình ngày hôm qua (+12% khả năng tư duy)</span>
        </div>
      </div>

      {/* Right dock: Streak, XP, Exit button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#F0F4F9] dark:bg-[#282A2C] border-none px-3.5 py-1.5 rounded-full shadow-none text-xs">
          <div className="flex items-center gap-1 font-semibold text-[#725200] dark:text-[#FFB784]">
            <span className="material-symbols-outlined text-[16px] text-[#725200] dark:text-[#FFB784]">
              local_fire_department
            </span>
            <span>Chuỗi 5 ngày 🔥</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <div className="flex items-center gap-1 font-semibold text-[#041E49] dark:text-[#A8C7FA]">
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">bolt</span>
            <span>+120 XP</span>
          </div>
        </div>

        {/* Exit Focus Mode Button */}
        <button
          type="button"
          onClick={onExitFocus}
          className="group flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] border-none shadow-none transition text-xs font-medium"
          title="Quay lại Chế độ Phân tích (ESC)"
        >
          <span className="material-symbols-outlined text-[16px] text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white transition">
            close
          </span>
          <span>Thoát chế độ tập trung</span>
          <kbd className="hidden sm:inline-block text-[10px] bg-white dark:bg-[#1E1F20] px-1.5 py-0.5 rounded-full text-slate-500 dark:text-[#C4C7C5] font-mono border-none">
            ESC
          </kbd>
        </button>
      </div>
    </header>
  );
}
