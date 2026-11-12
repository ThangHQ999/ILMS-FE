'use client';

import React from 'react';
import { SocraticRecommendation } from '../../types';

interface SocraticActionCardProps {
  recommendation: SocraticRecommendation;
  onOpenAICoach: () => void;
  onStartQuizAction?: () => void;
}

export function SocraticActionCard({
  recommendation,
  onOpenAICoach,
  onStartQuizAction,
}: SocraticActionCardProps) {
  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-none flex flex-col justify-between relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-indigo-100/40 dark:bg-indigo-900/20 blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] whitespace-nowrap flex items-center justify-center border-none shadow-none">
            <span className="material-symbols-outlined text-[19px]">smart_toy</span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B57D0] dark:text-[#A8C7FA] font-mono block">
              Socratic AI Engine
            </span>
            <span className="text-[11px] text-[#747775] dark:text-[#8E918F] font-mono">{recommendation.subtitle}</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3] mt-3 mb-1">
          {recommendation.topicTitle}
        </h3>
        <p className="text-xs text-[#444746] dark:text-[#C4C7C5] leading-relaxed mb-4">
          {recommendation.explanation}
        </p>

        {/* Action list items */}
        <div className="flex flex-col gap-2.5">
          {recommendation.tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                if (task.type === 'chat') {
                  onOpenAICoach();
                } else if (task.type === 'quiz' && onStartQuizAction) {
                  onStartQuizAction();
                }
              }}
              className="p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] border-none transition cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                    {task.type === 'quiz' ? 'quiz' : task.type === 'video' ? 'play_lesson' : 'chat_spark'}
                  </span>
                  <span className="text-xs font-bold text-[#1F1F1F] dark:text-[#E3E3E3] group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition">
                    {task.title}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#1E1F20] text-[10px] font-mono text-[#444746] dark:text-[#C4C7C5] border-none">
                  {task.duration}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-[#747775] dark:text-[#C4C7C5] line-clamp-1">
                  {task.description}
                </span>
                <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-semibold group-hover:underline shrink-0 ml-2">
                  {task.actionText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-none flex items-center justify-between text-xs text-[#747775] dark:text-[#C4C7C5]">
        <span>Dự kiến hoàn thành: {recommendation.estimatedDays} ngày</span>
        <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-bold">+{recommendation.expectedBoost}% Thông thạo</span>
      </div>
    </div>
  );
}
