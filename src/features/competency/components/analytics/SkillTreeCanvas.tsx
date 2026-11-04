'use client';

import React from 'react';
import { SkillTreeStage, SkillNode } from '../../types';

interface SkillTreeCanvasProps {
  stages: SkillTreeStage[];
  selectedNodeKey: string;
  onSelectNode: (node: SkillNode) => void;
}

export function SkillTreeCanvas({
  stages,
  selectedNodeKey,
  onSelectNode,
}: SkillTreeCanvasProps) {
  const stage1 = stages.find((s) => s.stageNumber === 1);
  const stage2 = stages.find((s) => s.stageNumber === 2);
  const stage3 = stages.find((s) => s.stageNumber === 3);
  const stage4 = stages.find((s) => s.stageNumber === 4);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-x-auto relative">
      {/* Subtle ambient grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#0A192F 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="min-w-[720px] flex flex-col gap-6 relative z-10 py-2">
        {/* STAGE 1: NỀN TẢNG */}
        {stage1 && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                {stage1.stageCode}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {stage1.title}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3.5">
              {stage1.nodes.map((node) => {
                const isSelected = selectedNodeKey === node.key;
                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectNode(node)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {node.title}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {node.masteryPercentage}% Thông thạo
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      lock_open
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SVG Connector Wave 1 -> 2 */}
        <div className="h-5 relative">
          <svg className="w-full h-full text-slate-300 dark:text-slate-700" preserveAspectRatio="none">
            <line x1="16%" y1="0" x2="33%" y2="100%" stroke="currentColor" strokeDasharray="4,4" strokeWidth="2" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="2" />
            <line x1="84%" y1="0" x2="66%" y2="100%" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" />
          </svg>
        </div>

        {/* STAGE 2: TRUNG CẤP */}
        {stage2 && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                {stage2.stageCode}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {stage2.title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 max-w-xl mx-auto w-full">
              {stage2.nodes.map((node) => {
                const isSelected = selectedNodeKey === node.key;
                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectNode(node)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {node.title}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {node.masteryPercentage}% • Đã thông thạo
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">
                      verified
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SVG Connector Wave 2 -> 3 */}
        <div className="h-5 relative">
          <svg className="w-full h-full text-blue-500 dark:text-blue-400" preserveAspectRatio="none">
            <line x1="33%" y1="0" x2="25%" y2="100%" stroke="currentColor" strokeWidth="2.5" />
            <line x1="33%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
            <line x1="66%" y1="0" x2="75%" y2="100%" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </div>

        {/* STAGE 3: NÂNG CAO (ACTIVE ZONE) */}
        {stage3 && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold">
                  {stage3.stageCode}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {stage3.title}
                </span>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Đang trọng tâm môn học
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3.5">
              {stage3.nodes.map((node) => {
                const isSelected = selectedNodeKey === node.key;
                const isAmber = node.status === 'learning';
                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectNode(node)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500 shadow-md transform -translate-y-0.5'
                        : isAmber
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-800/40 hover:bg-amber-50/70'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : isAmber
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                        }`}
                      >
                        {isSelected ? 'Đang chọn' : isAmber ? 'Đang học' : 'Thành thạo'}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          isSelected ? 'text-blue-600 dark:text-blue-400' : isAmber ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {node.masteryPercentage}%
                      </span>
                    </div>

                    <div className="flex items-start gap-3 my-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : isAmber
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isAmber ? 'hourglass_top' : 'account_tree'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {node.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {node.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span
                        className={
                          isAmber ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-blue-600 dark:text-blue-400 font-semibold'
                        }
                      >
                        {node.scoreRatio}
                      </span>
                      <span className="text-slate-400 font-mono">{node.complexityOrMetric}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SVG Connector Wave 3 -> 4 (Locked Paths) */}
        <div className="h-5 relative">
          <svg className="w-full h-full text-slate-300 dark:text-slate-700" preserveAspectRatio="none">
            <line x1="50%" y1="0" x2="35%" y2="100%" stroke="currentColor" strokeDasharray="3,3" strokeWidth="1.5" />
            <line x1="25%" y1="0" x2="65%" y2="100%" stroke="currentColor" strokeDasharray="3,3" strokeWidth="1.5" />
          </svg>
        </div>

        {/* STAGE 4: CHUYÊN GIA (LOCKED) */}
        {stage4 && (
          <div className="flex flex-col gap-2.5 opacity-75">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono text-[11px] font-bold">
                {stage4.stageCode}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {stage4.title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {stage4.nodes.map((node) => {
                const isSelected = selectedNodeKey === node.key;
                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectNode(node)}
                    className={`p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between cursor-not-allowed ${
                      isSelected ? 'ring-2 ring-slate-400' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {node.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {node.complexityOrMetric}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      {node.masteryPercentage}% Đạt
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
