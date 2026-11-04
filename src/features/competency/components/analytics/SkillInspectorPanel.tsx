'use client';

import React from 'react';
import { SkillNode } from '../../types';

interface SkillInspectorPanelProps {
  selectedNode: SkillNode | null;
  onOpenAICoach: (topicName: string) => void;
  onStartQuiz: () => void;
}

export function SkillInspectorPanel({
  selectedNode,
  onOpenAICoach,
  onStartQuiz,
}: SkillInspectorPanelProps) {
  if (!selectedNode) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-400 text-xs min-h-[400px]">
        Chọn một kỹ năng trên cây để xem chi tiết
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-all">
      <div className="flex flex-col gap-4">
        {/* Header & Breadcrumb */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold border border-blue-200 dark:border-blue-800">
              {selectedNode.stageLabel} • {selectedNode.masteryPercentage}% Độ thành thạo
            </span>
            <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">
              verified
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
            <span>CS-301</span>
            <span>&gt;</span>
            <span>CTDL nâng cao</span>
            <span>&gt;</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedNode.name}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {selectedNode.title}
          </h3>
        </div>

        {/* Definition / Description Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {selectedNode.desc}
          </p>
        </div>

        {/* Historical Performance Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Lịch sử bài tập</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {selectedNode.scoreRatio.split(' ')[0]}
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Tỷ lệ đạt {selectedNode.masteryPercentage}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Lab ICPC &amp; Hackathon</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {selectedNode.labsRatio.split(' ')[0]}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Hoàn thành đúng hạn
            </span>
          </div>
        </div>

        {/* Prerequisites Checklist */}
        {selectedNode.prerequisites.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-mono">
              Điều kiện tiên quyết (Prerequisites)
            </span>
            {selectedNode.prerequisites.map((pre, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-emerald-600">
                    check_circle
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{pre.name}</span>
                </div>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {pre.score}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Next Unlocks */}
        {selectedNode.nextUnlocks.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-mono">
              Mở khóa kỹ năng tiếp theo
            </span>
            {selectedNode.nextUnlocks.map((nxt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[17px] ${
                      nxt.isLocked ? 'text-slate-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {nxt.isLocked ? 'lock' : 'hourglass_top'}
                  </span>
                  <span
                    className={
                      nxt.isLocked
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200 font-medium'
                    }
                  >
                    {nxt.name}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    nxt.isLocked
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {nxt.statusLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onStartQuiz}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">quiz</span>
          <span>Luyện bài tập Quiz củng cố</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenAICoach(selectedNode.name)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
            smart_toy
          </span>
          <span>Hỏi Socratic AI về kỹ năng này</span>
        </button>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onOpenAICoach(selectedNode.name);
          }}
          className="w-full text-center py-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Xem tài liệu lý thuyết &amp; Mã nguồn C++ mẫu →
        </a>
      </div>
    </div>
  );
}
