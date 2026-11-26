'use client';

import React, { useState, useMemo } from 'react';
import type { KnowledgeNodeData } from '../../types';
import type { ConceptDetail } from '../../knowledge-graph.schema';
import {
  useMaterialGraphAuditLogs,
  useMaterialGraphRevisions,
} from '../../hooks/useKnowledgeGraphQueries';
import {
  getPedagogicalDefinition,
  deriveTopicDisplayName,
  isUuidOrCode,
  deduplicateParagraphs,
} from '../../services/knowledge-graph.service';
import { askOwlAboutConcept } from '@/hooks/useSocraticLessonContext';

interface NodeInspectorPanelProps {
  node: KnowledgeNodeData | null;
  allNodes?: KnowledgeNodeData[];
  conceptDetail?: ConceptDetail | null;
  isConceptLoading?: boolean;
  canManageGraph?: boolean;
  selectedMaterialId?: string | null;
  selectedCourseId?: string | null;
  activePublicationId?: string | null;
  activePublicationStatus?: string | null;
  isStartingDraft?: boolean;
  isWithdrawing?: boolean;
  isRetryingPublication?: boolean;
  onSelectNode?: (id: string) => void;
  onStartDraftEdit?: (materialId: string) => void;
  onWithdrawPublication?: (materialId: string, publicationId: string, reason?: string) => void;
  onRetryPublication?: (publicationId: string) => void;
  onSwitchToFocus?: () => void;
  onEditNode?: (node: KnowledgeNodeData) => void;
  onSaveNode?: (id: string, updates: Partial<KnowledgeNodeData>) => void;
  onDeleteNode?: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

type InspectorTab = 'overview' | 'processes' | 'exercises' | 'examples';

export function NodeInspectorPanel({
  node,
  allNodes = [],
  conceptDetail,
  isConceptLoading = false,
  canManageGraph = false,
  selectedMaterialId = null,
  selectedCourseId = null,
  activePublicationId = null,
  activePublicationStatus = null,
  isStartingDraft = false,
  isWithdrawing = false,
  isRetryingPublication = false,
  onSelectNode,
  onStartDraftEdit,
  onWithdrawPublication,
  onRetryPublication,
  onSwitchToFocus,
  onEditNode,
  onDeleteNode,
  isCollapsed,
  onToggleCollapse,
}: NodeInspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');
  const [showAdminHistory, setShowAdminHistory] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [confirmWithdrawOpen, setConfirmWithdrawOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const revisionsQuery = useMaterialGraphRevisions(
    selectedMaterialId,
    Boolean(canManageGraph && selectedMaterialId && showAdminHistory)
  );
  const auditQuery = useMaterialGraphAuditLogs(
    selectedMaterialId,
    Boolean(canManageGraph && selectedMaterialId && showAdminHistory)
  );

  const chunksList = useMemo(() => {
    const raw = node?.chunks ?? [];
    const seen = new Set<string>();
    return raw.filter((chk, idx) => {
      // Deduplicate by ID if present, otherwise by locator + text snippet
      const key = chk.id ? `id-${chk.id}` : `txt-${chk.locator || ''}-${chk.text?.trim().slice(0, 50) || idx}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [node?.chunks]);

  const definition = useMemo(() => {
    if (!node) return '';
    let rawDef = '';

    // 1. Concept detail from API if available
    const candDetail =
      (conceptDetail?.definition &&
        (typeof conceptDetail.definition === 'string'
          ? conceptDetail.definition.trim()
          : (conceptDetail.definition as { content?: string })?.content?.trim())) ||
      (conceptDetail?.description && conceptDetail.description.trim());
    if (candDetail && !isUuidOrCode(candDetail)) {
      rawDef = candDetail;
    } else {
      // 2. Injected definition from node
      const isGenericFallback = (str?: string | null) =>
        !str || str.startsWith('Khái niệm tri thức nền tảng trong chương trình đào tạo');

      if (node.definitionText && node.definitionText.trim() && !isGenericFallback(node.definitionText)) {
        rawDef = node.definitionText.trim();
      } else if (
        node.description &&
        node.description.trim() &&
        !isUuidOrCode(node.description) &&
        !isGenericFallback(node.description)
      ) {
        rawDef = node.description.trim();
      } else {
        // 3. Fallback from linked nodes (DEFINITION or CHUNK)
        if (allNodes.length > 0) {
          const isLinked = (n: KnowledgeNodeData) =>
            node.prerequisites?.includes(n.id) ||
            node.successors?.includes(n.id) ||
            n.prerequisites?.includes(node.id) ||
            n.successors?.includes(node.id);

          const linkedDef = allNodes.find((n) => {
            const k = (n.kind ?? '').toUpperCase();
            return k === 'DEFINITION' && isLinked(n) && n.description && !isUuidOrCode(n.description);
          });
          if (linkedDef?.description) {
            rawDef = linkedDef.description;
          } else {
            const linkedChunk = allNodes.find((n) => {
              const k = (n.kind ?? '').toUpperCase();
              return k === 'CHUNK' && isLinked(n) && n.description && !isUuidOrCode(n.description);
            });
            if (linkedChunk?.description) {
              rawDef = linkedChunk.description;
            }
          }
        }

        // 4. Fallback from chunks embedded in node
        if (!rawDef && chunksList.length > 0 && chunksList[0].text) {
          rawDef = chunksList[0].text;
        }

        // 5. Pedagogical dictionary fallback
        if (!rawDef) {
          rawDef = getPedagogicalDefinition(node.label, node.topic || node.materialTitle);
        }
      }
    }

    return deduplicateParagraphs(rawDef);
  }, [conceptDetail, node, allNodes, chunksList]);

  const nodeMap = useMemo(() => new Map(allNodes.map((n) => [n.id, n])), [allNodes]);

  const prereqs = useMemo(() => {
    if (!node) return [];
    const seen = new Set<string>();
    return (node.prerequisites ?? [])
      .filter((id) => {
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((id) => nodeMap.get(id))
      .filter(
        (item): item is KnowledgeNodeData =>
          Boolean(item && !item.isAuxiliary && (item.kind ?? '').toUpperCase() !== 'TOPIC')
      );
  }, [node, nodeMap]);

  const successors = useMemo(() => {
    if (!node) return [];
    const seen = new Set<string>();
    return (node.successors ?? [])
      .filter((id) => {
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((id) => nodeMap.get(id))
      .filter(
        (item): item is KnowledgeNodeData =>
          Boolean(item && !item.isAuxiliary && (item.kind ?? '').toUpperCase() !== 'TOPIC')
      );
  }, [node, nodeMap]);

  const processes = useMemo(() => {
    if (!node) return [];
    if (conceptDetail?.processes && conceptDetail.processes.length > 0) {
      return conceptDetail.processes;
    }
    if (node.processes && node.processes.length > 0) {
      return node.processes;
    }
    // Linked process steps fallback
    const linkedSteps: Array<{ stepNumber: number; action: string }> = [];
    allNodes.forEach((n) => {
      const k = (n.kind ?? '').toUpperCase();
      const isLinked =
        node.prerequisites?.includes(n.id) ||
        node.successors?.includes(n.id) ||
        n.prerequisites?.includes(node.id) ||
        n.successors?.includes(node.id) ||
        n.parentEntityId === node.id;
      if (
        isLinked &&
        (k === 'PROCESS_STEP' ||
          k === 'PROCESSSTEP' ||
          k === 'PROCESS' ||
          n.stepNumber != null ||
          n.label.toLowerCase().startsWith('bước'))
      ) {
        const stepNum = n.stepNumber ?? linkedSteps.length + 1;
        const act = n.auxiliaryActionText || n.description || n.label;
        if (act) linkedSteps.push({ stepNumber: stepNum, action: act });
      }
    });
    if (linkedSteps.length > 0) {
      linkedSteps.sort((a, b) => a.stepNumber - b.stepNumber);
      return [{ name: 'Quy trình thực thi', steps: linkedSteps }];
    }
    return [];
  }, [allNodes, conceptDetail?.processes, node]);

  const exercises = useMemo(() => {
    if (!node) return [];
    if (conceptDetail?.exercises && conceptDetail.exercises.length > 0) {
      return conceptDetail.exercises;
    }
    if (node.exercises && node.exercises.length > 0) {
      return node.exercises;
    }
    const linkedEx: Array<{
      id?: string;
      title: string;
      content: string;
      steps?: Array<{ stepNumber: number; action: string }>;
    }> = [];
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
          content: n.description || n.auxiliaryActionText || 'Thực hành cài đặt thuật toán.',
        });
      }
    });
    return linkedEx;
  }, [allNodes, conceptDetail?.exercises, node]);

  const examples = useMemo(() => {
    if (!node) return [];
    if (conceptDetail?.examples && conceptDetail.examples.length > 0) {
      return conceptDetail.examples;
    }
    if (node.examples && node.examples.length > 0) {
      return node.examples;
    }
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
    return linkedEg;
  }, [allNodes, conceptDetail?.examples, node]);

  const argumentsList = useMemo(() => {
    if (!node) return [];
    if (conceptDetail?.arguments && conceptDetail.arguments.length > 0) {
      return conceptDetail.arguments;
    }
    return node.arguments ?? [];
  }, [conceptDetail?.arguments, node]);

  const totalStepsCount = useMemo(() => {
    return processes.reduce((acc, p) => acc + (p.steps?.length ?? 0), 0) || processes.length;
  }, [processes]);

  if (isCollapsed) {
    return null;
  }

  if (!node) {
    return (
      <div className="w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border border-slate-200/70 dark:border-slate-800 flex flex-col items-center justify-center text-center min-h-[460px]">
        <div className="w-16 h-16 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-slate-400 mb-3">
          <span className="material-symbols-outlined text-[32px]">touch_app</span>
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-[#E3E3E3]">
          Chưa chọn thực thể tri thức
        </h4>
        <p className="text-xs text-slate-500 dark:text-[#C4C7C5] max-w-xs mt-1">
          Nhấp vào bất kỳ nút nào trên đồ thị Neo4j để xem định nghĩa, quy trình, bài tập, ví dụ và lộ trình liên kết.
        </p>
      </div>
    );
  }

  const targetMaterialId = selectedMaterialId || node.materialId || conceptDetail?.materialId || null;

  const topicBadgeName = deriveTopicDisplayName(
    node.topic,
    node.label,
    node.materialTitle,
    1
  );

  const handleAskAi = () => {
    if (!node) return;
    askOwlAboutConcept({
      id: node.id,
      label: node.label,
      definition,
      materialTitle: node.materialTitle,
      topic: deriveTopicDisplayName(node.topic || node.materialTitle),
      courseId: selectedCourseId || undefined,
      courseName: node.materialTitle || undefined,
      processes:
        conceptDetail?.processes && conceptDetail.processes.length > 0
          ? conceptDetail.processes
          : node.processes,
      exercises:
        conceptDetail?.exercises && conceptDetail.exercises.length > 0
          ? conceptDetail.exercises
          : node.exercises,
      examples:
        conceptDetail?.examples && conceptDetail.examples.length > 0
          ? conceptDetail.examples
          : node.examples,
    });
  };

  return (
    <div className="w-full bg-white dark:bg-[#1E1F20] rounded-3xl border border-slate-200/70 dark:border-slate-800 flex flex-col overflow-hidden transition-all">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {node.isAuxiliary ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 text-[11px] font-bold">
                Chi tiết phụ trợ • {node.sublabel || 'Quy trình'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-[11px] font-bold">
                {topicBadgeName}
              </span>
            )}
            {node.canonicalCode && canManageGraph && (
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]" title={node.canonicalCode}>
                {node.canonicalCode}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {canManageGraph && onEditNode && (
              <button
                type="button"
                onClick={() => onEditNode(node)}
                className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer border-none bg-transparent"
                title="Chỉnh sửa thông tin node này"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            )}
            {canManageGraph && onDeleteNode && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border-none bg-transparent"
                title="Xóa node khỏi đồ thị"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
              title="Thu gọn bảng chi tiết"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">dock_to_right</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-[#E3E3E3] leading-snug">
            {node.label}
          </h3>
          {node.materialTitle && (
            <p className="text-[11px] text-slate-500 dark:text-[#C4C7C5] mt-0.5">
              Nguồn: {node.materialTitle}
            </p>
          )}
        </div>

        {!node.isAuxiliary && (
          <>
            {/* Mastery bar */}
            {typeof node.masteryScore === 'number' && node.masteryScore > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-[#C4C7C5] font-medium">Độ nắm vững</span>
                  <span className="font-bold text-slate-800 dark:text-[#E3E3E3]">
                    {node.masteryScore}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      node.masteryScore >= 80 ? 'bg-emerald-500' : 'bg-[#0B57D0] dark:bg-[#A8C7FA]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, node.masteryScore))}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 py-1">
                <span>Độ nắm vững</span>
                <span className="font-mono text-[10px]">Chưa có dữ liệu học tập</span>
              </div>
            )}

            {/* 4 Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C]">
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
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer truncate ${
                    activeTab === key
                      ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                      : 'text-slate-600 dark:text-[#C4C7C5]'
                  }`}
                >
                  {label}
                  {count !== null && count > 0 ? ` (${count})` : ''}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="p-5 space-y-4 max-h-[430px] overflow-y-auto text-xs">
        {node.isAuxiliary ? (
          /* Auxiliary Detail Body */
          <div className="space-y-4">
            {/* Parent Entity Card */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#162B4D]/70 dark:to-[#1A237E]/40 border border-blue-200/80 dark:border-blue-900/60 p-4 space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#0B57D0] dark:text-[#A8C7FA] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">account_tree</span>
                <span>Thuộc thực thể tri thức chính</span>
              </div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-[#E3E3E3]">
                {node.parentEntityLabel || 'Thuật toán Sắp xếp nổi bọt'}
              </div>
              {node.parentEntityId && (
                <button
                  type="button"
                  onClick={() => onSelectNode?.(node.parentEntityId!)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B57D0] hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  <span>Mở thực thể tri thức chính</span>
                </button>
              )}
            </div>

            {/* Content description */}
            <div className="space-y-2 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-4 text-slate-700 dark:text-[#E3E3E3]">
              <div className="font-bold text-xs text-[#0B57D0] dark:text-[#A8C7FA] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  {node.icon || 'info'}
                </span>
                <span>
                  {node.stepNumber ? `Thao tác bước #${node.stepNumber}` : 'Chi tiết nội dung'}
                </span>
              </div>
              <p className="leading-relaxed whitespace-pre-line text-xs font-normal">
                {node.auxiliaryActionText || node.description || 'Chi tiết thành phần bổ trợ cho giải thuật.'}
              </p>
            </div>
          </div>
        ) : isConceptLoading && activeTab !== 'overview' ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ) : activeTab === 'overview' ? (
          <>
            <div className="space-y-1.5">
              <div className="font-bold text-slate-700 dark:text-[#E3E3E3]">
                Định nghĩa &amp; Tri thức cốt lõi
              </div>
              {definition ? (
                <p className="text-slate-600 dark:text-[#C4C7C5] leading-relaxed whitespace-pre-line">
                  {definition}
                </p>
              ) : (
                <p className="text-slate-400 italic">
                  Chưa có định nghĩa chi tiết được lưu trên Neo4j cho thực thể này.
                </p>
              )}
            </div>

            {node.exceptions && node.exceptions.length > 0 && (
              <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 p-4 space-y-2">
                <div className="font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>Ngoại lệ &amp; Giới hạn áp dụng</span>
                </div>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-amber-950 dark:text-amber-200/90 leading-relaxed">
                  {node.exceptions.map((ex, i) => (
                    <li key={`excep-${i}`}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}

            {node.conditions && node.conditions.length > 0 && (
              <div className="rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 p-4 space-y-2">
                <div className="font-bold text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Điều kiện áp dụng</span>
                </div>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-blue-950 dark:text-blue-200/90 leading-relaxed">
                  {node.conditions.map((cond, i) => (
                    <li key={`cond-${i}`}>{cond}</li>
                  ))}
                </ul>
              </div>
            )}

            {argumentsList.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-[#E3E3E3]">Lập luận</div>
                {argumentsList.map((arg, idx) => (
                  <div
                    key={`studio-arg-${idx}`}
                    className="rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 space-y-1"
                  >
                    {arg.hypothesis && <div className="font-semibold">{arg.hypothesis}</div>}
                    {arg.evidence && <div className="text-slate-500 dark:text-[#C4C7C5]">{arg.evidence}</div>}
                    {arg.conclusion && (
                      <div className="font-medium text-[#0B57D0] dark:text-[#A8C7FA]">
                        → {arg.conclusion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {prereqs.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-[#E3E3E3]">
                  Tiền đề cần học trước ({prereqs.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prereqs.map((pre, idx) => (
                    <button
                      key={`pre-${pre.id}-${idx}`}
                      type="button"
                      onClick={() => onSelectNode?.(pre.id)}
                      className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200/70 dark:border-amber-900 cursor-pointer hover:bg-amber-100"
                    >
                      ← {pre.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {successors.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-[#E3E3E3]">
                  Kiến thức kế tiếp ({successors.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {successors.map((succ, idx) => (
                    <button
                      key={`succ-${succ.id}-${idx}`}
                      type="button"
                      onClick={() => onSelectNode?.(succ.id)}
                      className="px-2.5 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-semibold cursor-pointer hover:opacity-90"
                    >
                      {succ.label} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chunksList.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-700 dark:text-[#E3E3E3]">
                  Đoạn trích tài liệu gốc ({chunksList.length})
                </div>
                <div className="space-y-2">
                  {chunksList.map((chk, idx) => (
                    <div
                      key={`st-chunk-${chk.id || 'id'}-${idx}`}
                      className="rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 text-slate-600 dark:text-[#C4C7C5] leading-relaxed text-[11px]"
                    >
                      {chk.locator && (
                        <div className="font-semibold text-slate-800 dark:text-[#E3E3E3] mb-1">
                          {chk.locator.toLowerCase().startsWith('page:')
                            ? `Trang ${chk.locator.slice(5).trim()}`
                            : chk.locator}
                        </div>
                      )}
                      <p className="line-clamp-4 hover:line-clamp-none transition-all">{chk.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'processes' ? (
          processes.length === 0 ? (
            <p className="text-slate-400 italic text-center py-6">
              Không có quy trình từng bước cho thực thể này.
            </p>
          ) : (
            <div className="space-y-2.5">
              {processes.map((proc, idx) => (
                <div
                  key={`st-proc-${idx}`}
                  className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3.5 space-y-2"
                >
                  <div className="font-bold">{proc.name}</div>
                  {proc.description && (
                    <p className="text-slate-600 dark:text-[#C4C7C5]">{proc.description}</p>
                  )}
                  {proc.steps.length > 0 && (
                    <ol className="space-y-1">
                      {proc.steps.map((s, stepIdx) => (
                        <li key={`proc-step-${s.stepNumber || stepIdx}-${stepIdx}`} className="flex items-start gap-2">
                          <span className="font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                            {stepIdx + 1}.
                          </span>
                          <span>{s.action}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'exercises' ? (
          exercises.length === 0 ? (
            <p className="text-slate-400 italic text-center py-6">
              Chưa có bài tập gắn với thực thể này.
            </p>
          ) : (
            <div className="space-y-2.5">
              {exercises.map((ex, idx) => (
                <div
                  key={`st-ex-${idx}`}
                  className="rounded-2xl bg-emerald-50/70 dark:bg-[#142E20] p-3.5 space-y-1.5"
                >
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">{ex.title}</div>
                  {ex.content && <p className="whitespace-pre-line">{ex.content}</p>}
                  {ex.steps && ex.steps.length > 0 && (
                    <ol className="space-y-1 pt-1">
                      {ex.steps.map((s, stepIdx) => (
                        <li key={`ex-step-${s.stepNumber || stepIdx}-${stepIdx}`}>
                          <strong>Bước {s.stepNumber}:</strong> {s.action}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          )
        ) : examples.length === 0 ? (
          <p className="text-slate-400 italic text-center py-6">
            Chưa có ví dụ minh họa cho thực thể này.
          </p>
        ) : (
          <div className="space-y-2.5">
            {examples.map((eg, idx) => (
              <div
                key={`st-eg-${idx}`}
                className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3.5 space-y-2"
              >
                <div className="font-bold">{eg.title}</div>
                {eg.explanation && <p>{eg.explanation}</p>}
                {eg.codeSnippet && (
                  <pre className="rounded-xl bg-slate-950 text-emerald-200 p-2.5 font-mono text-[11px] overflow-x-auto">
                    {eg.codeSnippet}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Teacher/Admin Governance: Revisions & Audit Log */}
        {canManageGraph && targetMaterialId && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => setShowAdminHistory((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-[#C4C7C5] hover:text-[#0B57D0] cursor-pointer"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">history</span>
                <span>Lịch sử phiên bản</span>
              </span>
              <span className="material-symbols-outlined text-[18px]">
                {showAdminHistory ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showAdminHistory && (
              <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 space-y-2 text-[11px]">
                <div className="font-bold text-slate-700 dark:text-[#E3E3E3]">
                  Phiên bản ({revisionsQuery.data?.length ?? 0})
                </div>
                {revisionsQuery.isLoading ? (
                  <p className="text-slate-400">Đang tải lịch sử phiên bản...</p>
                ) : (revisionsQuery.data ?? []).length === 0 ? (
                  <p className="text-slate-400">Chưa có bản ghi lịch sử revision.</p>
                ) : (
                  <ul className="space-y-1">
                    {(revisionsQuery.data ?? []).slice(0, 4).map((rev, revIdx) => (
                      <li key={`rev-${rev.id || rev.revision}-${revIdx}`} className="flex items-center justify-between">
                        <span>Rev #{rev.revision}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#1E1F20]">
                          {rev.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="font-bold text-slate-700 dark:text-[#E3E3E3] pt-1">
                  Nhật ký kiểm toán ({auditQuery.data?.length ?? 0})
                </div>
                {auditQuery.isLoading ? (
                  <p className="text-slate-400">Đang tải audit log...</p>
                ) : (auditQuery.data ?? []).length === 0 ? (
                  <p className="text-slate-400">Chưa có nhật ký thay đổi.</p>
                ) : (
                  <ul className="space-y-1">
                    {(auditQuery.data ?? []).slice(0, 4).map((log, logIdx) => (
                      <li key={`audit-${log.id || logIdx}-${logIdx}`} className="text-slate-600 dark:text-[#C4C7C5]">
                        <strong className="font-mono text-[10px]">{log.action}</strong>
                        {log.summary ? ` — ${log.summary}` : ''}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Publication Governance: Withdraw / Retry */}
                {activePublicationId && (
                  <div className="pt-2 mt-2 border-t border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-700 dark:text-[#E3E3E3]">
                        Xuất bản ({activePublicationStatus || 'PUBLISHED'})
                      </span>
                      {onRetryPublication &&
                        (activePublicationStatus ?? '').toUpperCase() === 'FAILED' && (
                          <button
                            type="button"
                            disabled={isRetryingPublication}
                            onClick={() => onRetryPublication(activePublicationId)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
                          >
                            {isRetryingPublication ? 'Đang thử lại...' : 'Thử xuất bản lại'}
                          </button>
                        )}
                    </div>

                    {onWithdrawPublication && !confirmWithdrawOpen && (
                      <button
                        type="button"
                        onClick={() => setConfirmWithdrawOpen(true)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-200/70 dark:border-rose-900 cursor-pointer"
                      >
                        Thu hồi bản đồ thị đã xuất bản (Withdraw)
                      </button>
                    )}

                    {onWithdrawPublication && confirmWithdrawOpen && (
                      <div className="rounded-xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-2.5 space-y-2">
                        <input
                          type="text"
                          value={withdrawReason}
                          onChange={(e) => setWithdrawReason(e.target.value)}
                          placeholder="Lý do thu hồi (tùy chọn)..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-[11px] focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmWithdrawOpen(false);
                              setWithdrawReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[10px] font-semibold cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            disabled={isWithdrawing}
                            onClick={() => {
                              onWithdrawPublication(
                                targetMaterialId,
                                activePublicationId,
                                withdrawReason || undefined
                              );
                              setConfirmWithdrawOpen(false);
                              setWithdrawReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
                          >
                            {isWithdrawing ? 'Đang thu hồi...' : 'Xác nhận thu hồi'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-[#F0F4F9]/70 dark:bg-[#282A2C]/60 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        {node.isAuxiliary && node.parentEntityId && (
          <button
            type="button"
            onClick={() => onSelectNode?.(node.parentEntityId!)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] hover:bg-[#B9D0F9] text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Mở Thực thể tri thức chính</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAskAi}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B57D0] hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            <span>Hỏi AI Tutor</span>
          </button>
          {onSwitchToFocus && (
            <button
              type="button"
              onClick={onSwitchToFocus}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#1E1F20] hover:bg-slate-100 dark:hover:bg-[#333537] text-slate-700 dark:text-[#E3E3E3] text-xs font-bold border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
              <span>Focus</span>
            </button>
          )}
        </div>

        {/* Direct CRUD Actions for Teacher */}
        {canManageGraph && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {confirmDeleteOpen ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2 text-xs">
                <p className="font-semibold text-rose-800 dark:text-rose-200">
                  Xác nhận xóa khái niệm "{node.label}" khỏi đồ thị?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteNode?.(node.id);
                      setConfirmDeleteOpen(false);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer border-none text-[11px]"
                  >
                    Xóa ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOpen(false)}
                    className="py-1.5 px-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer border-none text-[11px]"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {onEditNode && (
                  <button
                    type="button"
                    onClick={() => onEditNode(node)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0B57D0] dark:text-[#A8C7FA] text-xs font-bold transition-colors cursor-pointer border border-blue-200/60 dark:border-blue-900/60"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Sửa node</span>
                  </button>
                )}
                {onDeleteNode && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-900/60"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Xóa node</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {canManageGraph && targetMaterialId && onStartDraftEdit && (
          <button
            type="button"
            disabled={isStartingDraft}
            onClick={() => onStartDraftEdit(targetMaterialId)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-800 dark:text-amber-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>
              {isStartingDraft
                ? 'Đang tạo bản nháp...'
                : 'Mở Trình duyệt nháp tài liệu (/tasks)'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
