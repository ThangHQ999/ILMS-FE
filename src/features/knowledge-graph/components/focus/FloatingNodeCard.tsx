'use client';

import React, { useMemo, useState } from 'react';
import type { KnowledgeNodeData } from '../../types';
import type { ConceptDetail } from '../../knowledge-graph.schema';
import {
  deriveTopicDisplayName,
  getPedagogicalDefinition,
  deduplicateParagraphs,
} from '../../services/knowledge-graph.service';
import { askOwlAboutConcept } from '@/hooks/useSocraticLessonContext';

interface FloatingNodeCardProps {
  node: KnowledgeNodeData | null;
  allNodes?: KnowledgeNodeData[];
  conceptDetail?: ConceptDetail | null;
  isConceptLoading?: boolean;
  canOpenLesson?: boolean;
  onClose: () => void;
  onSelectNode?: (id: string) => void;
  onOpenLesson?: (node: KnowledgeNodeData) => void;
  onAskAiTutor?: (node: KnowledgeNodeData) => void;
}

type TabKey = 'overview' | 'processes' | 'exercises' | 'examples';

interface ExerciseItem {
  id?: string;
  title: string;
  content: string;
  steps?: Array<{ stepNumber?: number; action?: string } | string>;
}

export function FloatingNodeCard({
  node,
  allNodes = [],
  conceptDetail,
  isConceptLoading = false,
  canOpenLesson = false,
  onClose,
  onSelectNode,
  onOpenLesson,
  onAskAiTutor,
}: FloatingNodeCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const topicDisplayName = useMemo(() => {
    if (!node) return 'Khái niệm cốt lõi';
    return (
      deriveTopicDisplayName(node.topic || node.materialTitle) ||
      (node.sublabel && !node.sublabel.includes('trung tâm') ? node.sublabel : null) ||
      'Khái niệm cốt lõi'
    );
  }, [node]);

  const definition = useMemo(() => {
    if (!node) return '';
    let rawDef = '';
    const candDef =
      (conceptDetail?.definition &&
        (typeof conceptDetail.definition === 'string'
          ? conceptDetail.definition.trim()
          : (conceptDetail.definition as { content?: string })?.content?.trim())) ||
      '';
    if (candDef) {
      rawDef = candDef;
    } else if (
      conceptDetail?.description &&
      conceptDetail.description.trim() &&
      !conceptDetail.description.startsWith('INGESTION_') &&
      !conceptDetail.description.startsWith('NODE_')
    ) {
      rawDef = conceptDetail.description.trim();
    } else if (node.definitionText && node.definitionText.trim()) {
      rawDef = node.definitionText.trim();
    } else if (
      node.description &&
      node.description.trim() &&
      !node.description.startsWith('INGESTION_') &&
      !node.description.startsWith('NODE_')
    ) {
      rawDef = node.description.trim();
    } else {
      rawDef = '';
    }
    return deduplicateParagraphs(rawDef);
  }, [conceptDetail, node]);

  const processes = useMemo(() => {
    if (conceptDetail?.processes && conceptDetail.processes.length > 0) {
      return conceptDetail.processes;
    }
    if (node?.processes && node.processes.length > 0) {
      return node.processes;
    }
    // Fallback: look for linked processes from allNodes
    if (node && allNodes.length > 0) {
      const linkedSteps: Array<{ stepNumber: number; action: string }> = [];
      allNodes.forEach((n) => {
        const k = (n.kind ?? '').toUpperCase();
        const isLinked =
          node.prerequisites?.includes(n.id) ||
          node.successors?.includes(n.id) ||
          n.prerequisites?.includes(node.id) ||
          n.successors?.includes(node.id) ||
          n.parentEntityId === node.id;
        if (isLinked && (k === 'PROCESS_STEP' || k === 'PROCESSSTEP' || n.stepNumber !== undefined)) {
          const actionText = n.auxiliaryActionText || n.description || n.label;
          if (actionText) {
            linkedSteps.push({
              stepNumber: n.stepNumber || linkedSteps.length + 1,
              action: actionText,
            });
          }
        }
      });
      if (linkedSteps.length > 0) {
        linkedSteps.sort((a, b) => a.stepNumber - b.stepNumber);
        return [{ name: `Quy trình thực thi: ${node.label}`, steps: linkedSteps }];
      }
    }
    return [];
  }, [allNodes, conceptDetail?.processes, node]);

  const exercises = useMemo<ExerciseItem[]>(() => {
    if (conceptDetail?.exercises && conceptDetail.exercises.length > 0) {
      return conceptDetail.exercises as ExerciseItem[];
    }
    if (node?.exercises && node.exercises.length > 0) {
      return node.exercises as ExerciseItem[];
    }
    if (node && allNodes.length > 0) {
      const linkedEx: ExerciseItem[] = [];
      allNodes.forEach((n) => {
        const k = (n.kind ?? '').toUpperCase();
        const isLinked =
          node.prerequisites?.includes(n.id) ||
          node.successors?.includes(n.id) ||
          n.prerequisites?.includes(node.id) ||
          n.successors?.includes(node.id) ||
          n.parentEntityId === node.id;
        if (isLinked && (k === 'EXERCISE' || k === 'EXERCISE_STEP' || n.label.toLowerCase().startsWith('bài tập'))) {
          linkedEx.push({
            id: n.id,
            title: n.label || 'Bài tập rèn luyện',
            content: n.description || n.auxiliaryActionText || 'Thực hành áp dụng giải thuật.',
          });
        }
      });
      if (linkedEx.length > 0) return linkedEx;
    }
    return [];
  }, [allNodes, conceptDetail?.exercises, node]);

  const examples = useMemo(() => {
    if (conceptDetail?.examples && conceptDetail.examples.length > 0) {
      return conceptDetail.examples;
    }
    if (node?.examples && node.examples.length > 0) {
      return node.examples;
    }
    if (node && allNodes.length > 0) {
      const linkedEg: Array<{ id?: string; title: string; explanation?: string; codeSnippet?: string }> = [];
      allNodes.forEach((n) => {
        const k = (n.kind ?? '').toUpperCase();
        const isLinked =
          node.prerequisites?.includes(n.id) ||
          node.successors?.includes(n.id) ||
          n.prerequisites?.includes(node.id) ||
          n.successors?.includes(node.id) ||
          n.parentEntityId === node.id;
        if (isLinked && (k === 'EXAMPLE' || n.label.toLowerCase().startsWith('ví dụ'))) {
          linkedEg.push({
            id: n.id,
            title: n.label || 'Ví dụ minh họa',
            explanation: n.description || '',
          });
        }
      });
      if (linkedEg.length > 0) return linkedEg;
    }
    return [];
  }, [allNodes, conceptDetail?.examples, node]);

  const argumentsList = useMemo(() => {
    if (!node) return [];
    if (conceptDetail?.arguments && conceptDetail.arguments.length > 0) {
      return conceptDetail.arguments;
    }
    return node.arguments ?? [];
  }, [conceptDetail?.arguments, node]);

  const nodeMap = useMemo(() => new Map(allNodes.map((n) => [n.id, n])), [allNodes]);
  const prereqNodes = useMemo(() => {
    if (!node?.prerequisites) return [];
    return node.prerequisites
      .map((id) => nodeMap.get(id))
      .filter((n): n is KnowledgeNodeData => Boolean(n));
  }, [node?.prerequisites, nodeMap]);

  const successorNodes = useMemo(() => {
    if (!node) return [];
    return allNodes.filter((n) => n.prerequisites?.includes(node.id));
  }, [allNodes, node]);

  if (!node) return null;

  const totalStepsCount = processes.reduce((acc, p) => acc + (p.steps?.length ?? 0), 0) || processes.length;

  const handleAskAi = () => {
    askOwlAboutConcept({
      id: node.id,
      label: node.label,
      definition,
      materialTitle: node.materialTitle,
      topic: topicDisplayName,
      processes,
      exercises,
      examples,
    });
    onAskAiTutor?.(node);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed z-40 w-[520px] max-w-[calc(100vw-2rem)] max-h-[88vh] rounded-3xl p-6 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl text-[#1F1F1F] dark:text-[#E3E3E3] right-6 top-20 flex flex-col overflow-hidden animate-scale-up"
    >
      {/* Header Row: Topic Badge, Title, Material Source & Close */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[11px] font-bold text-[#041E49] dark:text-[#A8C7FA] max-w-[220px] truncate">
              <span className="material-symbols-outlined text-[14px]">schema</span>
              <span className="truncate">{topicDisplayName}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-[#C4C7C5] text-[10px] font-semibold">
              {node.complexity?.time || 'Cơ bản'}
            </span>
            {node.canonicalCode && (
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                {node.canonicalCode}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-snug">
            {node.label}
          </h3>
          {node.materialTitle && (
            <p className="text-[11px] text-[#444746] dark:text-[#C4C7C5] font-medium mt-0.5 truncate">
              Nguồn: {node.materialTitle}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="relative z-50 text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] p-2 rounded-full transition-colors cursor-pointer shrink-0 border-none bg-transparent"
          title="Đóng bảng chi tiết (ESC)"
          type="button"
          aria-label="Đóng bảng chi tiết"
        >
          <span className="material-symbols-outlined text-[20px] pointer-events-none">close</span>
        </button>
      </div>

      {/* Mastery Progress Bar */}
      {typeof node.masteryScore === 'number' && node.masteryScore > 0 ? (
        <div className="py-2.5 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#444746] dark:text-[#8E918F] text-[11px] font-medium">
              Độ thành thạo kiến thức
            </span>
            <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-bold font-mono text-[11px]">
              {node.masteryScore}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#131314] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, node.masteryScore))}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="py-2 border-b border-slate-100 dark:border-white/5 shrink-0 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Độ thành thạo kiến thức</span>
          <span className="font-mono text-[10px]">Chưa có dữ liệu học tập</span>
        </div>
      )}

      {/* 4 Multi-purpose Knowledge Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] my-3 shrink-0">
        {(
          [
            ['overview', 'Tổng quan', null],
            ['processes', 'Quy trình', totalStepsCount],
            ['exercises', 'Bài tập', exercises.length],
            ['examples', 'Ví dụ', examples.length],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate flex items-center justify-center gap-1 border-none ${
              activeTab === key
                ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                : 'text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <span>{label}</span>
            {count !== null && count > 0 && (
              <span className="text-[10px] font-mono opacity-80">({count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Scrollable Tab Content Body */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs max-h-[440px]">
        {isConceptLoading && activeTab !== 'overview' ? (
          <div className="space-y-3 animate-pulse p-2">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-20 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-20 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          </div>
        ) : activeTab === 'overview' ? (
          <div className="space-y-3.5">
            {/* Definition Section */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Định nghĩa &amp; Nội dung cốt lõi
              </span>
              {definition ? (
                <p className="text-[#444746] dark:text-[#C4C7C5] leading-relaxed whitespace-pre-line text-xs font-normal">
                  {definition}
                </p>
              ) : (
                <p className="text-slate-400 italic text-xs">
                  Chưa có mô tả chi tiết cho khái niệm này trên Neo4j.
                </p>
              )}
            </div>

            {/* Central Arguments / Hypotheses if available */}
            {argumentsList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                  Luận cứ &amp; Giả thuyết ({argumentsList.length})
                </span>
                {argumentsList.map((arg, idx) => (
                  <div
                    key={`arg-${idx}`}
                    className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 space-y-1"
                  >
                    {arg.hypothesis && (
                      <div className="font-bold text-purple-900 dark:text-purple-200 text-xs">
                        {arg.hypothesis}
                      </div>
                    )}
                    {arg.evidence && (
                      <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {arg.evidence}
                      </div>
                    )}
                    {arg.conclusion && (
                      <div className="font-semibold text-purple-700 dark:text-purple-300 text-[11px]">
                        → {arg.conclusion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Prerequisites & Successors */}
            {(prereqNodes.length > 0 || successorNodes.length > 0) && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                {prereqNodes.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                      Kiến thức tiên quyết ({prereqNodes.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {prereqNodes.map((pre) => (
                        <button
                          key={pre.id}
                          type="button"
                          onClick={() => onSelectNode?.(pre.id)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-[#E3E3E3] text-[11px] font-semibold transition-colors cursor-pointer border-none flex items-center gap-1"
                          title={`Xem chi tiết: ${pre.label}`}
                        >
                          <span className="material-symbols-outlined text-[13px] text-blue-500">
                            arrow_back
                          </span>
                          <span>{pre.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {successorNodes.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                      Mở rộng / Kế tiếp ({successorNodes.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {successorNodes.map((succ) => (
                        <button
                          key={succ.id}
                          type="button"
                          onClick={() => onSelectNode?.(succ.id)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-[#E3E3E3] text-[11px] font-semibold transition-colors cursor-pointer border-none flex items-center gap-1"
                          title={`Xem chi tiết: ${succ.label}`}
                        >
                          <span>{succ.label}</span>
                          <span className="material-symbols-outlined text-[13px] text-emerald-500">
                            arrow_forward
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'processes' ? (
          <div className="space-y-3">
            {processes.length === 0 ? (
              <p className="text-slate-400 italic text-xs text-center py-6">
                Chưa có quy trình giải thuật nào được ghi nhận cho khái niệm này.
              </p>
            ) : (
              processes.map((proc, pIdx) => (
                <div
                  key={`proc-${pIdx}`}
                  className="rounded-2xl p-3.5 bg-[#F0F4F9] dark:bg-[#282A2C] border border-slate-200/50 dark:border-white/5 space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0B57D0] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {pIdx + 1}
                    </span>
                    <span className="font-bold text-[#041E49] dark:text-[#A8C7FA] text-xs">
                      {proc.name || `Quy trình thực thi #${pIdx + 1}`}
                    </span>
                  </div>
                  {proc.description && (
                    <p className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">
                      {proc.description}
                    </p>
                  )}
                  {proc.steps && proc.steps.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
                      {proc.steps.map((st, sIdx) => {
                        const stepText = typeof st === 'string' ? st : st.action;
                        const stepNum = typeof st === 'object' && st.stepNumber ? st.stepNumber : sIdx + 1;
                        return (
                          <div key={`st-${sIdx}`} className="flex items-start gap-2.5 text-[11px]">
                            <span className="px-1.5 py-0.5 rounded-md bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-bold font-mono text-[10px] shrink-0">
                              B{stepNum}
                            </span>
                            <span className="text-[#444746] dark:text-[#E3E3E3] leading-relaxed">
                              {stepText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'exercises' ? (
          <div className="space-y-3">
            {exercises.length === 0 ? (
              <p className="text-slate-400 italic text-xs text-center py-6">
                Chưa có bài tập rèn luyện nào được gán cho khái niệm này.
              </p>
            ) : (
              exercises.map((ex, eIdx) => (
                <div
                  key={`ex-${eIdx}`}
                  className="rounded-2xl p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">
                      fitness_center
                    </span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                      {ex.title || `Bài tập #${eIdx + 1}`}
                    </span>
                  </div>
                  {ex.content && (
                    <p className="text-slate-700 dark:text-slate-200 text-[11px] leading-relaxed whitespace-pre-line">
                      {ex.content}
                    </p>
                  )}
                  {ex.steps && ex.steps.length > 0 && (
                    <div className="space-y-1.5 pt-1.5 border-t border-emerald-200/50 dark:border-emerald-800/30">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        Các bước giải quyết:
                      </span>
                      {ex.steps.map((st: { stepNumber?: number; action?: string } | string, sIdx: number) => {
                        const stepText = typeof st === 'string' ? st : (st.action || '');
                        const stepNum = typeof st === 'object' && st.stepNumber ? st.stepNumber : sIdx + 1;
                        return (
                          <div key={`ex-st-${sIdx}`} className="flex items-start gap-2 text-[11px]">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {stepNum}.
                            </span>
                            <span className="text-slate-600 dark:text-slate-300">{stepText}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {examples.length === 0 ? (
              <p className="text-slate-400 italic text-xs text-center py-6">
                Chưa có ví dụ thực tế hoặc đoạn mã minh họa nào.
              </p>
            ) : (
              examples.map((eg, egIdx) => (
                <div
                  key={`eg-${egIdx}`}
                  className="rounded-2xl p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[18px]">
                      lightbulb
                    </span>
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                      {eg.title || `Ví dụ minh họa #${egIdx + 1}`}
                    </span>
                  </div>
                  {eg.explanation && (
                    <p className="text-slate-700 dark:text-slate-200 text-[11px] leading-relaxed">
                      {eg.explanation}
                    </p>
                  )}
                  {eg.codeSnippet && (
                    <div className="rounded-xl bg-slate-900 dark:bg-black p-3 overflow-x-auto text-slate-100 font-mono text-[11px] leading-relaxed border border-slate-800">
                      <pre>{eg.codeSnippet}</pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 shrink-0">
        {canOpenLesson && (
          <button
            onClick={() => onOpenLesson?.(node)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#162B4D] dark:hover:bg-[#1f3a63] dark:text-[#A8C7FA] font-bold text-xs transition-colors cursor-pointer border-none"
            type="button"
          >
            <span>Vào bài học</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        )}
        <button
          onClick={handleAskAi}
          className={`${
            canOpenLesson ? 'px-4' : 'flex-1'
          } flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#0B57D0] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer border-none`}
          type="button"
        >
          <span className="material-symbols-outlined text-[17px]">smart_toy</span>
          <span>Hỏi Gia sư AI</span>
        </button>
      </div>
    </div>
  );
}
