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
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow watermark */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-indigo-100/40 dark:bg-indigo-900/20 blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[19px]">smart_toy</span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono block">
              Socratic AI Engine
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{recommendation.subtitle}</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">
          {recommendation.topicTitle}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
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
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                    {task.type === 'quiz' ? 'quiz' : task.type === 'video' ? 'play_lesson' : 'chat_spark'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {task.title}
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                  {task.duration}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 line-clamp-1">
                  {task.description}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline shrink-0 ml-2">
                  {task.actionText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Dự kiến hoàn thành: {recommendation.estimatedDays} ngày</span>
        <span className="text-blue-600 dark:text-blue-400 font-bold">+{recommendation.expectedBoost}% Thông thạo</span>
      </div>
    </div>
  );
}
