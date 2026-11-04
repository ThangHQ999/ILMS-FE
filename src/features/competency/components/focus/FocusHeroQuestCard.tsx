'use client';

import React from 'react';
import { FocusGoal } from '../../types';

interface FocusHeroQuestCardProps {
  goal: FocusGoal;
  allGoals: FocusGoal[];
  currentScore: number;
  onCycleGoal: () => void;
  onSelectGoal: (index: number) => void;
  onOpenTheory: () => void;
  onOpenQuiz: () => void;
}

export function FocusHeroQuestCard({
  goal,
  allGoals,
  currentScore,
  onCycleGoal,
  onSelectGoal,
  onOpenTheory,
  onOpenQuiz,
}: FocusHeroQuestCardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* CONTEXT BANNER & MINIMAP */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-1 font-mono">
          <span>TIẾN TRÌNH NHIỆM VỤ HÔM NAY ({allGoals.length} MỤC TIÊU)</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Đang học: {goal.index + 1}. {goal.title.split(' ')[0]} ({currentScore}%)
          </span>
        </div>

        {/* 4 Segment progress bar */}
        <div className="grid grid-cols-4 gap-2 w-full">
          {allGoals.map((g, idx) => {
            const isCurrent = idx === goal.index;
            return (
              <div
                key={g.id}
                onClick={() => onSelectGoal(idx)}
                className="group relative cursor-pointer"
              >
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-500 shadow-md shadow-amber-500/30'
                      : g.urgency === 'reviewed'
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2 py-1 rounded bg-slate-900 text-white text-[10px] whitespace-nowrap shadow-xl z-30 font-medium pointer-events-none">
                  {idx + 1}. {g.title} ({isCurrent ? currentScore : g.currentScore}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestion banner */}
      <div className="flex items-center gap-2 mb-6 text-xs text-blue-800 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 px-4 py-1.5 rounded-full shadow-sm">
        <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
          auto_fix_high
        </span>
        <span>
          Hệ thống đã tự động thu gọn 5 nhánh năng lực khác và chọn ra{' '}
          <strong>Điểm trũng then chốt nhất</strong> cho bạn
        </span>
      </div>

      {/* MAIN HERO QUEST CARD */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-200/60 dark:shadow-none relative overflow-hidden transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-md text-xs font-bold tracking-wide uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Mục tiêu trọng tâm hôm nay (Next Best Action)
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
              {goal.category}
            </span>
            <button
              type="button"
              onClick={onCycleGoal}
              className="group flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-300 dark:border-slate-700 hover:border-blue-300 shadow-sm transition"
              title="Đổi sang mục tiêu tiếp theo trong hàng đợi"
            >
              <span className="material-symbols-outlined text-[15px] text-blue-600 group-hover:rotate-180 transition duration-300">
                swap_horiz
              </span>
              <span>Đổi mục tiêu khác</span>
              <span className="text-[10px] text-slate-400 font-mono">[Tab]</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
            Chuẩn đầu ra {goal.ploCode}
          </div>
        </div>

        {/* Goal Title & Score */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              {goal.title}
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {goal.subtag}
              </span>
            </h1>

            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                {currentScore}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                Mức độ thành thạo cá nhân
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {goal.bottleneckReason} {goal.actionNotice}
          </p>
        </div>

        {/* Beam Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Cần củng cố</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{currentScore}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Mục tiêu phiên này:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {goal.targetScore}% (+{goal.scoreGap}%)
              </span>
            </div>
          </div>

          <div className="relative w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 relative shadow-sm bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600"
              style={{ width: `${currentScore}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_rgba(0,0,0,0.25)] border border-blue-600" />
            </div>
            {/* Target line */}
            <div
              className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-emerald-500/80 dashed z-10"
              title="Mục tiêu phiên này (60%)"
            />
          </div>

          <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>0% Bắt đầu</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">flag</span>
              Mốc mở khóa: {goal.milestoneUnlock}
            </span>
            <span>100% Master</span>
          </div>
        </div>

        {/* Action Route: 2 Steps */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">play_lesson</span>
              Lộ trình vi mô dọn sẵn (2 bước hành động ngay)
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Ước tính: ~8 phút</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: Flashcard Theory */}
            <button
              type="button"
              onClick={onOpenTheory}
              className="group text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between shadow-sm cursor-pointer"
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition duration-200">
                  <span className="material-symbols-outlined text-[22px]">auto_stories</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                  BƯỚC 1 • 3 PHÚT
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition flex items-center gap-1.5 mb-1">
                  Ôn tập lý thuyết cốt lõi
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition">
                    arrow_forward
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  Flashcard 4 bước tư duy: Định nghĩa trạng thái, công thức truy hồi, trường hợp cơ sở và tối ưu không gian O(W).
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                <span className="material-symbols-outlined text-[15px]">style</span>
                <span>Mở 1 thẻ tóm tắt then chốt</span>
              </div>
            </button>

            {/* Step 2: Diagnostic Quiz */}
            <button
              type="button"
              onClick={onOpenQuiz}
              className="group text-left p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-slate-50 to-white dark:from-blue-950/40 dark:via-slate-800/60 dark:to-slate-900 hover:bg-white border border-blue-200 dark:border-blue-800 hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between shadow-sm cursor-pointer"
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition duration-200">
                  <span className="material-symbols-outlined text-[22px]">quiz</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                  BƯỚC 2 • 5 PHÚT
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition flex items-center gap-1.5 mb-1">
                  Làm bài tập chẩn đoán (3 câu)
                  <span className="material-symbols-outlined text-[16px] text-blue-600 group-hover:translate-x-1 transition">
                    arrow_forward
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  Thử sức ngay với 3 câu trắc nghiệm thuật toán Knapsack 0/1 để kéo thanh kinh nghiệm lên 60%.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-medium">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">add_task</span>
                  <span>+15% Năng lực khi hoàn tất</span>
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                  Bắt đầu ngay →
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Psychological safety footer note */}
      <div className="mt-5 text-center flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span className="material-symbols-outlined text-[15px] text-emerald-600">lock</span>
        <span>
          Không gian học tập riêng tư. Toàn bộ điểm số và tốc độ giải bài chỉ phục vụ lộ trình cá nhân của riêng bạn.
        </span>
      </div>
    </div>
  );
}
