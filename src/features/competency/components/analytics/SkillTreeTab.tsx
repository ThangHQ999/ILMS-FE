'use client';

import React, { useState } from 'react';
import { SkillTreeStage, SkillNode } from '../../types';
import { SkillTreeCanvas } from './SkillTreeCanvas';
import { SkillInspectorPanel } from './SkillInspectorPanel';

interface SkillTreeTabProps {
  stages: SkillTreeStage[];
  onOpenAICoach: (topicName: string) => void;
  onSwitchToFocus: () => void;
}

export function SkillTreeTab({
  stages,
  onOpenAICoach,
  onSwitchToFocus,
}: SkillTreeTabProps) {
  // Find default selected node (Segment Tree)
  const defaultNode =
    stages
      .flatMap((s) => s.nodes)
      .find((n) => n.key === 'segTree') || stages[0]?.nodes[0] || null;

  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(defaultNode);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono block">
            Bản đồ quan hệ tiên quyết (Directed Acyclic Graph)
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Hệ thống Cây Kỹ năng CS-301
          </h2>
        </div>

        {/* Legend for Skill Tree Canvas */}
        <div className="flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Đã thành thạo</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Đang học / Cần củng cố</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Khóa tiên quyết</span>
          </div>
        </div>
      </div>

      {/* Grid split: Canvas (8 cols) + Inspector (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8">
          <SkillTreeCanvas
            stages={stages}
            selectedNodeKey={selectedNode?.key || ''}
            onSelectNode={setSelectedNode}
          />
        </div>

        <div className="xl:col-span-4">
          <SkillInspectorPanel
            selectedNode={selectedNode}
            onOpenAICoach={onOpenAICoach}
            onStartQuiz={onSwitchToFocus}
          />
        </div>
      </div>
    </section>
  );
}
