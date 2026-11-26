'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useValidateCourseGraphMutation,
  useAiRepairCourseGraphMutation,
  useApplyAiRepairCourseGraphMutation,
} from '../../hooks/useKnowledgeGraphQueries';
import type {
  GraphValidationResponseDTO,
  GraphAiRepairResponseDTO,
  GraphValidationIssue,
  AiRepairAction,
} from '../../knowledge-graph.schema';
import type { KnowledgeNodeData, KnowledgeEdgeData } from '../../types';
import type { StudioCourseOption } from '../../services/knowledge-graph.service';

interface GraphAiRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string | null;
  courseTitle?: string;
  courseOptions?: StudioCourseOption[];
  currentNodes: KnowledgeNodeData[];
  currentEdges: KnowledgeEdgeData[];
  onApplyRepairedGraph?: (repairedNodes: unknown[], repairedEdges: unknown[]) => void;
  onFocusIssueTarget?: (targetId: string, targetType: 'NODE' | 'EDGE' | 'GRAPH') => void;
}

type ModalStep = 'VALIDATING' | 'REPORT' | 'REPAIRING' | 'PREVIEW' | 'APPLYING';

export function GraphAiRepairModal({
  isOpen,
  onClose,
  courseId,
  courseTitle = 'Môn học hiện tại',
  courseOptions = [],
  currentNodes,
  currentEdges,
  onApplyRepairedGraph,
  onFocusIssueTarget,
}: GraphAiRepairModalProps) {
  const [step, setStep] = useState<ModalStep>('VALIDATING');
  const [instruction, setInstruction] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || courseOptions[0]?.courseId || '');
  const [validationData, setValidationData] = useState<GraphValidationResponseDTO | null>(null);
  const [repairData, setRepairData] = useState<GraphAiRepairResponseDTO | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BLOCKER' | 'WARNING'>('ALL');

  const validateMutation = useValidateCourseGraphMutation();
  const repairMutation = useAiRepairCourseGraphMutation();
  const applyMutation = useApplyAiRepairCourseGraphMutation();

  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    } else if (courseOptions.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courseOptions[0].courseId);
    }
  }, [courseId, courseOptions, selectedCourseId]);

  // Convert current React Flow graph into backend-ready snapshot
  const prepareSnapshot = () => {
    const nodes = currentNodes.map((n) => ({
      id: n.id,
      label: n.label,
      description: n.description || n.definitionText || '',
      category: n.category || 'algo',
      level: n.level || 'INTERMEDIATE',
    }));

    const edges = currentEdges.map((e) => ({
      source: e.source,
      target: e.target,
      relation: e.relation || e.label || 'PREREQUISITE',
    }));

    return { nodes, edges };
  };

  const effectiveCourseId = selectedCourseId || courseId || courseOptions[0]?.courseId || '';

  // Run validation on modal open
  const runValidation = async (targetId?: string) => {
    const cId = targetId || effectiveCourseId;
    if (!cId) {
      toast.error('Vui lòng chọn môn học để kiểm tra đồ thị');
      return;
    }

    setStep('VALIDATING');
    setRepairData(null);
    try {
      const snapshot = prepareSnapshot();
      const res = await validateMutation.mutateAsync({
        courseId: cId,
        snapshot,
      });
      setValidationData(res);
      setStep('REPORT');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kiểm tra đồ thị';
      toast.error(msg);
      setStep('REPORT');
    }
  };

  useEffect(() => {
    if (isOpen) {
      const cId = courseId || courseOptions[0]?.courseId || '';
      if (cId) {
        setSelectedCourseId(cId);
        runValidation(cId);
      }
    } else {
      setStep('VALIDATING');
      setValidationData(null);
      setRepairData(null);
      setInstruction('');
      setActiveFilter('ALL');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  // Handle AI Auto-Repair call
  const handleStartAiRepair = async () => {
    if (!effectiveCourseId) return;

    setStep('REPAIRING');
    try {
      const snapshot = prepareSnapshot();
      const res = await repairMutation.mutateAsync({
        courseId: effectiveCourseId,
        payload: {
          nodes: snapshot.nodes,
          edges: snapshot.edges,
          instruction: instruction.trim() || undefined,
        },
      });
      setRepairData(res);
      setStep('PREVIEW');
      toast.success('AI đã hoàn thành phân tích và đề xuất phương án sửa lỗi!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Quá trình sửa lỗi AI thất bại';
      toast.error(msg);
      setStep('REPORT');
    }
  };

  // Handle Accept & Apply AI Repaired Graph
  const handleApplyRepair = async () => {
    if (!effectiveCourseId || !repairData) return;

    setStep('APPLYING');
    try {
      await applyMutation.mutateAsync({
        courseId: effectiveCourseId,
        payload: {
          repairSummary: repairData.summary || 'Áp dụng bản sửa đổi AI cho đồ thị môn học',
          repairedNodes: repairData.repairedNodes,
          repairedEdges: repairData.repairedEdges,
        },
      });
      toast.success('Đã áp dụng bản sửa đổi AI cho đồ thị môn học thành công!');
      onApplyRepairedGraph?.(repairData.repairedNodes, repairData.repairedEdges);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu bản sửa đổi AI';
      toast.error(msg);
      setStep('PREVIEW');
    }
  };

  const blockers = validationData?.issues.filter((i) => i.severity === 'BLOCKER') ?? [];
  const warnings = validationData?.issues.filter((i) => i.severity === 'WARNING') ?? [];
  const displayedIssues =
    validationData?.issues.filter((i) => {
      if (activeFilter === 'BLOCKER') return i.severity === 'BLOCKER';
      if (activeFilter === 'WARNING') return i.severity === 'WARNING';
      return true;
    }) ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#E3E3E3] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 dark:border-white/10 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 shrink-0 bg-[#F8FAFD] dark:bg-[#282A2C]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                {step === 'PREVIEW' ? 'auto_awesome' : 'troubleshoot'}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] flex items-center gap-2">
                <span>
                  {step === 'PREVIEW'
                    ? 'Đề xuất Sửa đổi từ Trợ lý AI'
                    : 'Kiểm tra & Chuẩn hóa Đồ thị Tri thức'}
                </span>
                <span className="text-[11px] font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#C4C7C5]">
                  {courseTitle}
                </span>
              </h2>
              <p className="text-xs text-[#444746] dark:text-[#8E918F] mt-0.5">
                {step === 'PREVIEW'
                  ? 'Xem xét các can thiệp sửa mã JSON trước khi xuất bản'
                  : 'Phát hiện chu trình lặp vô hạn, cạnh trỏ vào hư vô và thực thể thiếu mô tả'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer border-none bg-transparent"
            title="Đóng"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {step === 'VALIDATING' && (
            <div className="py-14 text-center space-y-3">
              <div className="inline-block w-10 h-10 border-3 border-[#0B57D0] border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-sm text-[#1F1F1F] dark:text-[#E3E3E3]">
                Đang quét cấu trúc topo đồ thị tri thức...
              </p>
              <p className="text-[#444746] dark:text-[#8E918F] max-w-sm mx-auto">
                Thuật toán DFS 3 màu đang truy vết chu trình lặp vô hạn và kiểm tra tính toàn vẹn của {currentNodes.length} nút &amp; {currentEdges.length} cạnh.
              </p>
            </div>
          )}

          {step === 'REPAIRING' && (
            <div className="py-14 text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-amber-400 animate-spin opacity-30 blur-md" />
                <div className="absolute w-12 h-12 rounded-full bg-white dark:bg-[#1E1F20] flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[24px] text-purple-600 dark:text-purple-400 animate-pulse">
                    auto_awesome
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-[#1F1F1F] dark:text-[#E3E3E3]">
                  AI đang tiến hành phân tích &amp; sửa lỗi cấu trúc...
                </p>
                <p className="text-[#444746] dark:text-[#8E918F] max-w-md mx-auto text-xs">
                  Mô hình LLM đang ngắt cạnh gây chu trình lặp vô hạn, tự động tổng hợp mô tả học thuật chuẩn cho các khái niệm và dọn sạch các liên kết không hợp lệ.
                </p>
              </div>
            </div>
          )}

          {step === 'APPLYING' && (
            <div className="py-14 text-center space-y-3">
              <div className="inline-block w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-sm text-[#1F1F1F] dark:text-[#E3E3E3]">
                Đang lưu và xuất bản đồ thị đã sửa lên hệ thống...
              </p>
              <p className="text-[#444746] dark:text-[#8E918F]">
                Đồng bộ hóa các thay đổi vào cơ sở dữ liệu Neo4j &amp; cập nhật lại Canvas.
              </p>
            </div>
          )}

          {step === 'REPORT' && validationData && (
            <div className="space-y-5">
              {/* Summary Status Banner */}
              {validationData.valid ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200">
                  <span className="material-symbols-outlined text-[28px] text-emerald-600 dark:text-emerald-400 shrink-0">
                    verified
                  </span>
                  <div>
                    <h4 className="font-bold text-sm">Đồ thị đạt chuẩn 100% (DAG Valid)</h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Không phát hiện chu trình lặp vô hạn nào. Toàn bộ {currentNodes.length} thực thể và {currentEdges.length} liên kết đều hợp lệ.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#FFF8F6] dark:bg-[#2A1D1C] border border-red-200/70 dark:border-red-900/40 text-[#410002] dark:text-[#FFDAD6]">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[26px] text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                      error
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-red-950 dark:text-red-200">
                        Phát hiện {validationData.totalBlockers + validationData.totalWarnings} vấn đề cần lưu ý
                      </h4>
                      <p className="text-[11px] text-red-800/90 dark:text-red-300 mt-0.5">
                        Bao gồm {blockers.length} lỗi nghiêm trọng (Blocker) và {warnings.length} cảnh báo (Warning).
                      </p>
                    </div>
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveFilter('ALL')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer border-none ${
                        activeFilter === 'ALL'
                          ? 'bg-[#1F1F1F] dark:bg-white text-white dark:text-[#1F1F1F]'
                          : 'bg-white/80 dark:bg-white/10 text-slate-700 dark:text-[#C4C7C5]'
                      }`}
                    >
                      Tất cả ({validationData.issues.length})
                    </button>
                    {blockers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveFilter('BLOCKER')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer border-none ${
                          activeFilter === 'BLOCKER'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                        }`}
                      >
                        Lỗi ({blockers.length})
                      </button>
                    )}
                    {warnings.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveFilter('WARNING')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer border-none ${
                          activeFilter === 'WARNING'
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        Cảnh báo ({warnings.length})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Issues List */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {displayedIssues.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 italic">
                    Không có vấn đề nào trong bộ lọc này.
                  </p>
                ) : (
                  displayedIssues.map((issue: GraphValidationIssue) => {
                    const isBlocker = issue.severity === 'BLOCKER';
                    return (
                      <div
                        key={issue.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isBlocker
                            ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/30'
                            : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isBlocker
                                  ? 'bg-red-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {isBlocker ? 'BLOCKER' : 'CẢNH BÁO'}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {issue.code}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-white/10 text-slate-700 dark:text-[#C4C7C5]">
                              {issue.targetType}: {issue.targetId}
                            </span>
                          </div>

                          {onFocusIssueTarget && (
                            <button
                              type="button"
                              onClick={() => onFocusIssueTarget(issue.targetId, issue.targetType)}
                              className="text-[11px] font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                            >
                              <span className="material-symbols-outlined text-[14px]">center_focus_strong</span>
                              <span>Định vị</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[#1F1F1F] dark:text-[#E3E3E3] font-medium text-xs leading-relaxed">
                          {issue.message}
                        </p>

                        {issue.suggestion && (
                          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined text-[14px] text-amber-500 shrink-0 mt-0.5">
                              lightbulb
                            </span>
                            <span className="italic">{issue.suggestion}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Optional Prompt Instruction for AI */}
              {!validationData.valid && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                  <label className="text-[11px] font-bold text-[#444746] dark:text-[#C4C7C5] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-purple-600 dark:text-purple-400">
                      psychology
                    </span>
                    <span>Chỉ dẫn sư phạm cho AI (Tùy chọn):</span>
                  </label>
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="VD: Ưu tiên ngắt cạnh chu trình b ➔ a và bổ sung mô tả học thuật chi tiết..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] border border-transparent focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs outline-none transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {step === 'PREVIEW' && repairData && (
            <div className="space-y-4">
              {/* AI Pedagogical Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/40 dark:to-blue-950/40 border border-purple-200/70 dark:border-purple-800/40 text-purple-950 dark:text-purple-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-purple-600 dark:text-purple-400">
                    auto_awesome
                  </span>
                  <span className="font-bold text-xs uppercase tracking-wide">
                    Tóm tắt Phân tích &amp; Can thiệp của AI
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {repairData.summary}
                </p>
              </div>

              {/* Changes Action Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#444746] dark:text-[#C4C7C5] block">
                  Danh sách {repairData.changes.length} hành động can thiệp trực tiếp:
                </span>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {repairData.changes.map((ch: AiRepairAction, idx: number) => {
                    const isRemove = ch.action === 'REMOVE_EDGE';
                    const isReverse = ch.action === 'REVERSE_EDGE';
                    const isAddDef = ch.action === 'ADD_DESCRIPTION';
                    const isLink = ch.action === 'LINK_ORPHAN';

                    let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200';
                    let actionIcon = 'build';
                    if (isRemove) {
                      badgeColor = 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300';
                      actionIcon = 'link_off';
                    } else if (isReverse) {
                      badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300';
                      actionIcon = 'sync_alt';
                    } else if (isAddDef) {
                      badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300';
                      actionIcon = 'description';
                    } else if (isLink) {
                      badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300';
                      actionIcon = 'add_link';
                    }

                    return (
                      <div
                        key={`ch-${idx}`}
                        className="p-3 rounded-2xl bg-[#F8FAFD] dark:bg-[#282A2C]/60 border border-slate-100 dark:border-white/5 flex items-start gap-3"
                      >
                        <div className={`p-1.5 rounded-xl shrink-0 ${badgeColor}`}>
                          <span className="material-symbols-outlined text-[16px]">{actionIcon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeColor}`}>
                              {ch.action}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 truncate">
                              {ch.targetId}
                            </span>
                          </div>
                          <p className="text-xs text-[#1F1F1F] dark:text-[#E3E3E3] font-medium leading-relaxed">
                            {ch.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Topology Comparison Metrics */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Đồ thị sau khi sửa
                  </span>
                  <span className="text-sm font-bold text-[#0B57D0] dark:text-[#A8C7FA] font-mono">
                    {repairData.repairedNodes.length} nút &bull; {repairData.repairedEdges.length} liên kết
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Lỗi nghiêm trọng còn lại
                  </span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      repairData.remainingIssues.length === 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {repairData.remainingIssues.length === 0
                      ? '0 (Đạt chuẩn DAG)'
                      : `${repairData.remainingIssues.length} vấn đề`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 shrink-0 bg-[#F8FAFD] dark:bg-[#282A2C]/50">
          {step === 'REPORT' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E1E5EA] dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => runValidation()}
                  disabled={validateMutation.isPending}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA] bg-[#D3E3FD] dark:bg-[#162B4D] hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer border-none flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Quét lại</span>
                </button>

                {validationData && !validationData.valid && (
                  <button
                    type="button"
                    onClick={handleStartAiRepair}
                    disabled={repairMutation.isPending}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md transition-all cursor-pointer border-none flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                    <span>AI Gợi ý &amp; Sửa lỗi</span>
                  </button>
                )}
              </div>
            </>
          )}

          {step === 'PREVIEW' && (
            <>
              <button
                type="button"
                onClick={() => setStep('REPORT')}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E1E5EA] dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Quay lại báo cáo</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors cursor-pointer border-none"
                >
                  Từ chối &amp; Giữ nguyên
                </button>

                <button
                  type="button"
                  onClick={handleApplyRepair}
                  disabled={applyMutation.isPending}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer border-none flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[17px]">check_circle</span>
                  <span>Chấp nhận bản sửa (Accept)</span>
                </button>
              </div>
            </>
          )}

          {(step === 'VALIDATING' || step === 'REPAIRING' || step === 'APPLYING') && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer"
              >
                Hủy tác vụ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
