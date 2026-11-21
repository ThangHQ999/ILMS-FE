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
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-none flex items-center justify-center text-[#444746] dark:text-[#8E918F] text-xs min-h-[400px]">
        Chọn một kỹ năng trên cây để xem chi tiết
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-none flex flex-col justify-between transition-all">
      <div className="flex flex-col gap-4">
        {/* Header & Breadcrumb */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-mono text-[11px] font-semibold border-none">
              {selectedNode.stageLabel} • {selectedNode.masteryPercentage}% Độ thành thạo
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#0B57D0] dark:text-[#A8C7FA]">
              verified
            </span>
          </div>

          <div className="text-[11px] text-[#444746] dark:text-[#C4C7C5] flex items-center gap-1 font-mono">
            <span>CS-301</span>
            <span>&gt;</span>
            <span>CTDL nâng cao</span>
            <span>&gt;</span>
            <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-bold">{selectedNode.name}</span>
          </div>

          <h3 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3] mt-1">
            {selectedNode.title}
          </h3>
        </div>

        {/* Definition / Description Card */}
        <div className="p-3.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none">
          <p className="text-xs text-[#1F1F1F] dark:text-[#C4C7C5] leading-relaxed">
            {selectedNode.desc}
          </p>
        </div>

        {/* Historical Performance Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex flex-col">
            <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">Lịch sử bài tập</span>
            <span className="text-lg font-extrabold text-[#1F1F1F] dark:text-[#E3E3E3] mt-0.5">
              {selectedNode.scoreRatio.split(' ')[0]}
            </span>
            <span className="text-[11px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
              Tỷ lệ đạt {selectedNode.masteryPercentage}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none flex flex-col">
            <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">Lab ICPC &amp; Hackathon</span>
            <span className="text-lg font-extrabold text-[#1F1F1F] dark:text-[#E3E3E3] mt-0.5">
              {selectedNode.labsRatio.split(' ')[0]}
            </span>
            <span className="text-[11px] font-semibold text-[#1EA85A] dark:text-[#81C995]">
              Hoàn thành đúng hạn
            </span>
          </div>
        </div>

        {/* Prerequisites Checklist */}
        {selectedNode.prerequisites.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] font-bold uppercase tracking-wider font-mono">
              Điều kiện tiên quyết (Prerequisites)
            </span>
            {selectedNode.prerequisites.map((pre, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#1EA85A] dark:text-[#81C995]">
                    check_circle
                  </span>
                  <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-medium">{pre.name}</span>
                </div>
                <span className="font-mono text-[#1EA85A] dark:text-[#81C995] font-bold">
                  {pre.score}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Next Unlocks */}
        {selectedNode.nextUnlocks.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#444746] dark:text-[#C4C7C5] font-bold uppercase tracking-wider font-mono">
              Mở khóa kỹ năng tiếp theo
            </span>
            {selectedNode.nextUnlocks.map((nxt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[17px] ${
                      nxt.isLocked ? 'text-[#8E918F]' : 'text-[#BA8000] dark:text-[#FFB784]'
                    }`}
                  >
                    {nxt.isLocked ? 'lock' : 'hourglass_top'}
                  </span>
                  <span
                    className={
                      nxt.isLocked
                        ? 'text-[#8E918F]'
                        : 'text-[#1F1F1F] dark:text-[#E3E3E3] font-medium'
                    }
                  >
                    {nxt.name}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border-none ${
                    nxt.isLocked
                      ? 'bg-[#E1E5EA] dark:bg-[#333537] text-[#444746] dark:text-[#C4C7C5]'
                      : 'bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#B06000] dark:text-[#FFB784]'
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
      <div className="flex flex-col gap-2 mt-6 pt-4 border-none">
        <button
          type="button"
          onClick={onStartQuiz}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap text-xs font-medium border-none shadow-none transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">quiz</span>
          <span>Luyện bài tập Quiz củng cố</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenAICoach(selectedNode.name)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-medium border-none shadow-none transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
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
          className="w-full text-center py-2 px-4 rounded-full text-xs text-[#0B57D0] hover:bg-[#F0F4F9] dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] transition-colors font-medium border-none"
        >
          Xem tài liệu lý thuyết &amp; Mã nguồn C++ mẫu →
        </a>
      </div>
    </div>
  );
}
