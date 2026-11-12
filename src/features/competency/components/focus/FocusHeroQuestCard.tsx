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
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#444746] dark:text-[#C4C7C5] mb-1.5 px-1 font-mono">
          <span>TIẾN TRÌNH NHIỆM VỤ HÔM NAY ({allGoals.length} MỤC TIÊU)</span>
          <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BA8000] animate-ping" />
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
                      ? 'bg-[#BA8000]'
                      : g.urgency === 'reviewed'
                      ? 'bg-[#1EA85A]'
                      : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA]'
                  }`}
                />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2.5 py-1 rounded-full bg-[#1F1F1F] text-white text-[10px] whitespace-nowrap shadow-none z-30 font-medium pointer-events-none">
                  {idx + 1}. {g.title} ({isCurrent ? currentScore : g.currentScore}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestion banner */}
      <div className="flex items-center gap-2 mb-6 text-xs text-[#041E49] dark:text-[#A8C7FA] bg-[#D3E3FD] dark:bg-[#162B4D] border-none px-5 py-2 rounded-full shadow-none">
        <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
          auto_fix_high
        </span>
        <span>
          Hệ thống đã tự động thu gọn 5 nhánh năng lực khác và chọn ra{' '}
          <strong>Điểm trũng then chốt nhất</strong> cho bạn
        </span>
      </div>

      {/* MAIN HERO QUEST CARD */}
      <div className="w-full bg-white dark:bg-[#1E1F20] border-none rounded-3xl p-6 sm:p-9 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none relative overflow-hidden transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-medium uppercase bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784] border-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#BA8000] animate-pulse" />
              Mục tiêu trọng tâm hôm nay (Next Best Action)
            </span>
            <span className="text-xs text-[#444746] dark:text-[#C4C7C5] bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1 rounded-full border-none font-medium">
              {goal.category}
            </span>
            <button
              type="button"
              onClick={onCycleGoal}
              className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] border-none shadow-none transition cursor-pointer"
              title="Đổi sang mục tiêu tiếp theo trong hàng đợi"
            >
              <span className="material-symbols-outlined text-[15px] text-[#0B57D0] dark:text-[#A8C7FA] group-hover:rotate-180 transition duration-300">
                swap_horiz
              </span>
              <span>Đổi mục tiêu khác</span>
              <span className="text-[10px] text-[#747775] dark:text-[#8E918F] font-mono">[Tab]</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#444746] dark:text-[#C4C7C5] font-mono">
            <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">verified</span>
            Chuẩn đầu ra {goal.ploCode}
          </div>
        </div>

        {/* Goal Title & Score */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight flex items-center gap-3">
              {goal.title}
              <span className="text-xs px-3 py-1 rounded-full font-medium font-mono bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] border-none">
                {goal.subtag}
              </span>
            </h1>

            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0B57D0] dark:text-[#A8C7FA] font-mono tracking-tight">
                {currentScore}%
              </span>
              <span className="text-xs text-[#444746] dark:text-[#C4C7C5] block font-medium">
                Mức độ thành thạo cá nhân
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#444746] dark:text-[#C4C7C5] leading-relaxed max-w-2xl">
            {goal.bottleneckReason} {goal.actionNotice}
          </p>
        </div>

        {/* Beam Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-[#444746] dark:text-[#C4C7C5] mb-2 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#747775] dark:text-[#8E918F]">Cần củng cố</span>
              <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-bold">{currentScore}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#747775] dark:text-[#8E918F]">Mục tiêu phiên này:</span>
              <span className="text-[#0D652D] dark:text-[#81C995] font-bold">
                {goal.targetScore}% (+{goal.scoreGap}%)
              </span>
            </div>
          </div>

          <div className="relative w-full h-3 bg-[#F0F4F9] dark:bg-[#131314] rounded-full overflow-hidden p-0 border-none shadow-none">
            <div
              className="h-full rounded-full transition-all duration-700 relative bg-[#0B57D0] dark:bg-[#A8C7FA]"
              style={{ width: `${currentScore}%` }}
            />
            {/* Target line */}
            <div
              className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-[#1EA85A] dashed z-10"
              title="Mục tiêu phiên này (60%)"
            />
          </div>

          <div className="flex justify-between items-center mt-2 text-[11px] text-[#444746] dark:text-[#C4C7C5] font-medium">
            <span>0% Bắt đầu</span>
            <span className="text-[#0D652D] dark:text-[#81C995] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">flag</span>
              Mốc mở khóa: {goal.milestoneUnlock}
            </span>
            <span>100% Master</span>
          </div>
        </div>

        {/* Action Route: 2 Steps */}
        <div className="pt-6 border-none">
          <div className="text-xs uppercase font-bold tracking-wider text-[#444746] dark:text-[#C4C7C5] mb-4 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">play_lesson</span>
              Lộ trình vi mô dọn sẵn (2 bước hành động ngay)
            </span>
            <span className="text-[11px] text-[#747775] dark:text-[#8E918F] font-normal">Ước tính: ~8 phút</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: Flashcard Theory */}
            <button
              type="button"
              onClick={onOpenTheory}
              className="group text-left p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] border-none transition-all duration-200 flex flex-col justify-between shadow-none cursor-pointer"
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] group-hover:scale-105 transition duration-200">
                  <span className="material-symbols-outlined text-[22px]">auto_stories</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] border-none font-mono">
                  BƯỚC 1 • 3 PHÚT
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition flex items-center gap-1.5 mb-1">
                  Ôn tập lý thuyết cốt lõi
                  <span className="material-symbols-outlined text-[16px] text-[#747775] group-hover:text-[#0B57D0] group-hover:translate-x-1 transition">
                    arrow_forward
                  </span>
                </h3>
                <p className="text-xs text-[#444746] dark:text-[#C4C7C5] line-clamp-2">
                  Flashcard 4 bước tư duy: Định nghĩa trạng thái, công thức truy hồi, trường hợp cơ sở và tối ưu không gian O(W).
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#0B57D0] dark:text-[#A8C7FA] font-medium">
                <span className="material-symbols-outlined text-[15px]">style</span>
                <span>Mở 1 thẻ tóm tắt then chốt</span>
              </div>
            </button>

            {/* Step 2: Diagnostic Quiz */}
            <button
              type="button"
              onClick={onOpenQuiz}
              className="group text-left p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#1E1F20] hover:bg-[#E1E5EA] dark:hover:bg-[#282A2C] border-none transition-all duration-200 flex flex-col justify-between shadow-none cursor-pointer"
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] whitespace-nowrap flex items-center justify-center border-none shadow-none group-hover:scale-105 transition duration-200">
                  <span className="material-symbols-outlined text-[22px]">quiz</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] border-none font-mono">
                  BƯỚC 2 • 5 PHÚT
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition flex items-center gap-1.5 mb-1">
                  Làm bài tập chẩn đoán (3 câu)
                  <span className="material-symbols-outlined text-[16px] text-[#0B57D0] group-hover:translate-x-1 transition">
                    arrow_forward
                  </span>
                </h3>
                <p className="text-xs text-[#444746] dark:text-[#C4C7C5] line-clamp-2">
                  Thử sức ngay với 3 câu trắc nghiệm thuật toán Knapsack 0/1 để kéo thanh kinh nghiệm lên 60%.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-medium">
                <span className="text-[#0D652D] dark:text-[#81C995] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">add_task</span>
                  <span>+15% Năng lực khi hoàn tất</span>
                </span>
                <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-semibold group-hover:underline">
                  Bắt đầu ngay →
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Psychological safety footer note */}
      <div className="mt-5 text-center flex items-center justify-center gap-2 text-xs text-[#444746] dark:text-[#C4C7C5] font-medium">
        <span className="material-symbols-outlined text-[15px] text-[#1EA85A] dark:text-[#81C995]">lock</span>
        <span>
          Không gian học tập riêng tư. Toàn bộ điểm số và tốc độ giải bài chỉ phục vụ lộ trình cá nhân của riêng bạn.
        </span>
      </div>
    </div>
  );
}
