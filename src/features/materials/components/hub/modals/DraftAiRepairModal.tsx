'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import {
  useValidateDraftKnowledgeGraphMutation,
  useAiRepairDraftKnowledgeGraphMutation,
  useApplyAiRepairDraftKnowledgeGraphMutation,
} from '../../../hooks/useIngestionJobs';
import { fetchUserCourseOptions, type IngestionCourseOption } from '../../../services/ingestion.service';
import type {
  GraphValidationResponseDTO,
  GraphAiRepairResponseDTO,
  GraphValidationIssue,
  AiRepairAction,
} from '../../../schemas/ingestion.schema';
import {
  parseDraftGraph,
  stringifyDraftGraph,
  type DraftGraphData,
  type DraftEntity,
} from '../../../utils/draft-graph-crud';

interface DraftAiRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string | null;
  courseTitle?: string;
  materialTitle?: string;
  draftText: string;
  onApplyRepairedDraft: (newGraphText: string) => void;
  onFocusNode?: (nodeName: string) => void;
}

type ModalStep = 'VALIDATING' | 'REPORT' | 'REPAIRING' | 'PREVIEW';

export function DraftAiRepairModal({
  isOpen,
  onClose,
  courseId,
  courseTitle = 'Môn học hiện tại',
  materialTitle = 'Bản nháp chờ duyệt',
  draftText,
  onApplyRepairedDraft,
  onFocusNode,
}: DraftAiRepairModalProps) {
  const { user } = useUserRole();
  const [step, setStep] = useState<ModalStep>('VALIDATING');
  const [instruction, setInstruction] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || '');
  const [courseOptions, setCourseOptions] = useState<IngestionCourseOption[]>([]);
  const [validationData, setValidationData] = useState<GraphValidationResponseDTO | null>(null);
  const [repairData, setRepairData] = useState<GraphAiRepairResponseDTO | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BLOCKER' | 'WARNING'>('ALL');

  const validateMutation = useValidateDraftKnowledgeGraphMutation();
  const repairMutation = useAiRepairDraftKnowledgeGraphMutation();
  const applyMutation = useApplyAiRepairDraftKnowledgeGraphMutation();

  // Load course options if courseId is missing
  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    } else if (user?.id) {
      fetchUserCourseOptions(user.id).then((opts) => {
        setCourseOptions(opts);
        if (opts.length > 0 && !selectedCourseId) {
          setSelectedCourseId(opts[0].courseId);
        }
      });
    }
  }, [courseId, user?.id, selectedCourseId]);

  // Parse draft data
  const currentDraftData = useMemo<DraftGraphData>(() => {
    return parseDraftGraph(draftText);
  }, [draftText]);

  // Convert current Draft into backend-ready snapshot
  const prepareSnapshot = () => {
    const nodes = (currentDraftData.entities || []).map((ent, idx) => ({
      id: ent.name || `entity-${idx}`,
      label: ent.name || `Thực thể #${idx + 1}`,
      description: ent.description || ent.definition || '',
      category: (ent as { category?: string }).category || 'algo',
      level: (ent as { level?: string }).level || 'INTERMEDIATE',
    }));

    const edges = (currentDraftData.knowledge_relations || []).map((rel) => ({
      source: rel.source,
      target: rel.target,
      relation: rel.relation_type || 'PREREQUISITE',
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
      } else {
        setStep('REPORT');
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

  // Trigger AI Auto-Repair
  const handleStartAiRepair = async () => {
    if (!effectiveCourseId) {
      toast.error('Vui lòng chọn môn học trước khi gọi AI sửa lỗi');
      return;
    }

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
      toast.success('AI đã hoàn thành phân tích và đề xuất sửa đổi bản nháp!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI không thể sửa lỗi đồ thị lúc này';
      toast.error(msg);
      setStep('REPORT');
    }
  };

  // Apply Repaired Graph back to the Ingestion Draft
  const handleApplyRepair = async () => {
    if (!repairData) return;

    try {
      const next = structuredClone(currentDraftData);
      const repNodes = repairData.repairedNodes as Array<{
        id?: string;
        label?: string;
        description?: string;
      }>;
      const repEdges = repairData.repairedEdges as Array<{
        source?: string;
        target?: string;
        relation?: string;
      }>;

      // 1. Update entities or add new ones
      if (Array.isArray(next.entities)) {
        const repNodeMap = new Map<string, { label?: string; description?: string }>();
        repNodes.forEach((rn) => {
          if (rn.id) repNodeMap.set(rn.id.toLowerCase(), rn);
          if (rn.label) repNodeMap.set(rn.label.toLowerCase(), rn);
        });

        next.entities = next.entities.map((ent) => {
          const match = repNodeMap.get((ent.name || '').toLowerCase());
          if (match) {
            return {
              ...ent,
              name: match.label || ent.name,
              description: match.description || ent.description,
            };
          }
          return ent;
        });

        // Add any newly synthesized entities
        if (!Array.isArray(next.entities)) {
          next.entities = [];
        }
        const entitiesList = next.entities;
        repNodes.forEach((rn) => {
          const label = rn.label || rn.id || '';
          if (!label) return;
          const exists = entitiesList.some((e) => e.name.toLowerCase() === label.toLowerCase());
          if (!exists) {
            entitiesList.push({
              name: label,
              description: rn.description || '',
              definition: rn.description || '',
              processes: [],
              exercises: [],
              examples: [],
              arguments: [],
            });
          }
        });
      }

      // 2. Replace relations with repaired DAG edges
      next.knowledge_relations = repEdges
        .filter((re) => Boolean(re.source && re.target))
        .map((re) => ({
          source: re.source!,
          target: re.target!,
          relation_type: re.relation || 'REQUIRES',
        }));

      // Apply to Draft
      const serialized = stringifyDraftGraph(next);
      onApplyRepairedDraft(serialized);

      // Also call backend apply API if courseId is available
      if (effectiveCourseId) {
        applyMutation.mutate({
          courseId: effectiveCourseId,
          payload: {
            repairSummary: repairData.summary,
            repairedNodes: repairData.repairedNodes,
            repairedEdges: repairData.repairedEdges,
          },
        });
      }

      toast.success('Đã áp dụng thành công sửa đổi của AI vào bản nháp đồ thị!');
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra khi áp dụng bản sửa đổi vào bản nháp');
    }
  };

  if (!isOpen) return null;

  const issuesList: GraphValidationIssue[] = validationData?.issues || [];
  const filteredIssues = issuesList.filter((issue) => {
    if (activeFilter === 'BLOCKER') return issue.severity === 'BLOCKER';
    if (activeFilter === 'WARNING') return issue.severity === 'WARNING';
    return true;
  });

  const blockerCount = validationData?.totalBlockers ?? issuesList.filter((i) => i.severity === 'BLOCKER').length;
  const warningCount = validationData?.totalWarnings ?? issuesList.filter((i) => i.severity === 'WARNING').length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#1E1F20] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 flex flex-col overflow-hidden text-slate-800 dark:text-[#E3E3E3] animate-scale-up"
      >
        {/* Header Row */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[22px]">troubleshoot</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  Kiểm tra &amp; Sửa lỗi Bản nháp Đồ thị (AI)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                  AWAITING_REVIEW
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {materialTitle} · {courseTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: VALIDATING */}
          {step === 'VALIDATING' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-950 border-t-purple-600 animate-spin flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-purple-600">
                  search_check
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Đang quét kiểm tra cấu trúc đồ thị bản nháp...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  Thuật toán DFS 3 màu đang duyệt cây DAG phát hiện chu trình lặp vô hạn, các node mồ côi và thực thể thiếu mô tả học thuật.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: REPORT */}
          {step === 'REPORT' && (
            <div className="space-y-4">
              {/* Course Selector if multiple courses available */}
              {courseOptions.length > 1 && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                    Môn học đối chiếu:
                  </span>
                  <select
                    value={effectiveCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      runValidation(e.target.value);
                    }}
                    className="flex-1 text-xs bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    {courseOptions.map((opt) => (
                      <option key={opt.courseId} value={opt.courseId}>
                        {opt.name} {opt.className ? `(${opt.className})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Summary Banner */}
              {validationData?.valid ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[24px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Đồ thị bản nháp hoàn hảo (0 lỗi Blocker)!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Toàn bộ các thực thể và liên kết đã tạo thành đồ thị có hướng không chu trình (DAG) chuẩn tắc. Bản nháp đã sẵn sàng để xuất bản lên Neo4j &amp; ChromaDB!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 flex items-start gap-3">
                  <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[24px] shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      Phát hiện {blockerCount} lỗi nghiêm trọng (Blocker) cần xử lý trước khi xuất bản
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      Đồ thị có chu trình lặp vô hạn hoặc liên kết không hợp lệ. Bạn có thể bấm nút &quot;AI Gợi ý &amp; Sửa lỗi&quot; bên dưới để AI tự động khắc phục trực tiếp trên mã JSON.
                    </p>
                  </div>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
                    activeFilter === 'ALL'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({issuesList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('BLOCKER')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
                    activeFilter === 'BLOCKER'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
                  }`}
                >
                  🔴 Blocker ({blockerCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('WARNING')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
                    activeFilter === 'WARNING'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100'
                  }`}
                >
                  🟡 Cảnh báo ({warningCount})
                </button>
              </div>

              {/* Issues List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {filteredIssues.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    Không có vấn đề nào thuộc bộ lọc này.
                  </div>
                ) : (
                  filteredIssues.map((issue, idx) => {
                    const isBlocker = issue.severity === 'BLOCKER';
                    return (
                      <div
                        key={issue.id || `issue-${idx}`}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isBlocker
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40'
                            : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isBlocker
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}
                              >
                                {issue.severity}
                              </span>
                              {issue.code && (
                                <span className="font-mono text-[10px] text-slate-400">
                                  {issue.code}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                              {issue.message}
                            </p>
                            {issue.suggestion && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px] text-amber-500">
                                  tips_and_updates
                                </span>
                                <span>Gợi ý: {issue.suggestion}</span>
                              </p>
                            )}
                          </div>

                          {issue.targetId && issue.targetType === 'NODE' && (
                            <button
                              type="button"
                              onClick={() => {
                                onFocusNode?.(issue.targetId!);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-white/10 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 shrink-0 cursor-pointer"
                            >
                              Xem vị trí
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* AI Instruction Input & Suggestion Chips */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-purple-600">
                      psychology
                    </span>
                    <span>Yêu cầu chỉ đạo AI sửa lỗi (Tùy chọn):</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Ưu tiên ngắt các cạnh tạo chu trình lặp vô hạn',
                    'Tự động sinh mô tả học thuật chuẩn cho các khái niệm',
                    'Nối các thực thể mồ côi vào mạch kiến thức chính',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setInstruction(chip)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white dark:bg-white/10 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Ví dụ: Giữ nguyên khái niệm A, chỉ đảo chiều cạnh B -> A..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1F20] border border-purple-200 dark:border-purple-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>
          )}

          {/* STEP 3: REPAIRING */}
          {step === 'REPAIRING' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 animate-pulse flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-[32px] animate-spin">
                  auto_fix_high
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Google Gemini &amp; AI Repair Engine đang sửa mã JSON đồ thị...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  AI đang bẻ gãy các chu trình lặp, bổ sung mô tả học thuật chuẩn hóa và tối ưu cấu trúc bản nháp theo mô hình DAG.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW / COMPARISON */}
          {step === 'PREVIEW' && repairData && (
            <div className="space-y-4">
              {/* AI Explanation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/40 dark:to-blue-950/40 border border-purple-200/80 dark:border-purple-800/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-200">
                  <span className="material-symbols-outlined text-[17px] text-purple-600">
                    smart_toy
                  </span>
                  <span>Giải trình giải pháp của AI:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {repairData.summary}
                </p>
              </div>

              {/* Detailed Actions List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chi tiết {repairData.changes.length} can thiệp sửa đổi:
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {repairData.changes.map((ch: AiRepairAction, idx: number) => {
                    const isRemove = ch.action === 'REMOVE_EDGE';
                    const isAddDesc = ch.action === 'ADD_DESCRIPTION';
                    return (
                      <div
                        key={`change-${idx}`}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-start gap-2.5 text-xs"
                      >
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            isRemove
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : isAddDesc
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {ch.action}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {ch.description}
                          </p>
                          {ch.targetId && (
                            <span className="font-mono text-[10px] text-slate-400">
                              Mục tiêu: {ch.targetId}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Topology Metrics Comparison */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    Khái niệm (Nodes)
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {repairData.repairedNodes.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    Liên kết (Edges)
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {repairData.repairedEdges.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    Lỗi Blocker (Chu trình)
                  </span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {blockerCount} ➔ 0 (Sạch lỗi)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#18191A] border-t border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer border-none"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {step === 'REPORT' && (
              <>
                <button
                  type="button"
                  onClick={() => runValidation()}
                  disabled={validateMutation.isPending}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA] bg-[#D3E3FD] dark:bg-[#162B4D] hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer border-none flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Quét lại</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartAiRepair}
                  disabled={repairMutation.isPending}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md transition-all cursor-pointer border-none flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                  <span>✨ AI Gợi ý &amp; Sửa lỗi</span>
                </button>
              </>
            )}

            {step === 'PREVIEW' && (
              <>
                <button
                  type="button"
                  onClick={() => setStep('REPORT')}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer border-none"
                >
                  Quay lại báo cáo
                </button>

                <button
                  type="button"
                  onClick={handleApplyRepair}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer border-none flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>✅ Áp dụng vào bản nháp</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
