'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomSelect } from '@/components/shared';
import {
  validateImportGraphJson,
  SAMPLE_IMPORT_GRAPH_JSON,
  IMPORT_SCHEMA_DOCUMENTATION,
  type ValidationResult,
} from '../../utils/json-import-validator';
import { useImportKnowledgeGraphMutation } from '../../hooks/useKnowledgeGraphQueries';
import type { StudioCourseOption } from '../../services/knowledge-graph.service';

interface ImportJsonGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseOptions?: StudioCourseOption[];
  currentCourseId?: string | null;
  onSuccess?: (courseId: string, resultMessage: string) => void;
}

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  BEGINNER: {
    bg: '#eff6ff',
    border: '#3b82f6',
    text: '#1e3a8a',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  INTERMEDIATE: {
    bg: '#fffbeb',
    border: '#f59e0b',
    text: '#78350f',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  ADVANCED: {
    bg: '#fdf2f8',
    border: '#ec4899',
    text: '#831843',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  },
};

export function ImportJsonGraphModal({
  isOpen,
  onClose,
  courseOptions = [],
  currentCourseId = null,
  onSuccess,
}: ImportJsonGraphModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(currentCourseId || '');
  const [jsonText, setJsonText] = useState<string>(SAMPLE_IMPORT_GRAPH_JSON);
  const [showDocs, setShowDocs] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'docs'>('editor');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const importMutation = useImportKnowledgeGraphMutation();

  useEffect(() => {
    if (currentCourseId) {
      setSelectedCourseId(currentCourseId);
    } else if (courseOptions.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courseOptions[0].courseId);
    }
  }, [currentCourseId, courseOptions, selectedCourseId]);

  // Real-time Validation Engine with Debounce-like responsiveness
  const validation: ValidationResult = useMemo(() => {
    return validateImportGraphJson(jsonText);
  }, [jsonText]);

  // Transform validated JSON data into visual React Flow nodes and edges for 2D Live Preview
  const { previewNodes, previewEdges } = useMemo(() => {
    if (!validation.isValid || !validation.parsedData) {
      return { previewNodes: [], previewEdges: [] };
    }

    const { nodes: rawNodes, edges: rawEdges } = validation.parsedData;
    const count = rawNodes.length;

    // Arrange nodes in a smart layered circle / grid layout for 2D Preview
    const nodes: Node[] = rawNodes.map((n, idx) => {
      const lvl = (n.level || 'BEGINNER').toUpperCase();
      const styleConfig = LEVEL_COLORS[lvl] || LEVEL_COLORS.BEGINNER;

      // Calculate coordinates: arrange in neat columns/rows
      const cols = Math.min(3, Math.ceil(Math.sqrt(count)));
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);

      const posX = 60 + colIdx * 290;
      const posY = 50 + rowIdx * 170;

      return {
        id: n.id,
        position: { x: posX, y: posY },
        data: {
          label: (
            <div className="text-left select-none p-1">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className={`text-[9px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded ${styleConfig.badge}`}
                >
                  {n.level || 'BEGINNER'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                  {n.id}
                </span>
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                {n.label}
              </h5>
              {n.category && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                  📁 {n.category}
                </p>
              )}
            </div>
          ),
        },
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          border: `2px solid ${styleConfig.border}`,
          borderRadius: '16px',
          padding: '8px 10px',
          width: 240,
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        },
      };
    });

    const edges: Edge[] = rawEdges.map((e, idx) => ({
      id: `preview-edge-${idx}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label: e.relation || 'PREREQUISITE',
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      labelStyle: {
        fontSize: 10,
        fontWeight: 800,
        fill: '#1e3a8a',
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.95,
      },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
    }));

    return { previewNodes: nodes, previewEdges: edges };
  }, [validation]);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setJsonText(SAMPLE_IMPORT_GRAPH_JSON);
  };

  const handlePrettify = () => {
    try {
      const obj = JSON.parse(jsonText);
      setJsonText(JSON.stringify(obj, null, 2));
    } catch {
      // Ignore if syntax is broken
    }
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_IMPORT_GRAPH_JSON);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmit = async () => {
    if (!validation.isValid || !validation.parsedData || !selectedCourseId) return;

    try {
      const result = await importMutation.mutateAsync({
        courseId: selectedCourseId,
        payload: validation.parsedData,
      });

      const message = `Đã xuất bản thành công đồ thị tri thức "${validation.parsedData.title}" (${result.totalNodes || validation.parsedData.nodes.length} khái niệm, ${result.totalEdges || validation.parsedData.edges.length} liên kết) lên Neo4j!`;
      onSuccess?.(selectedCourseId, message);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  const courseSelectOptions = [
    { value: '', label: '-- Chọn môn học cần nạp đồ thị tri thức --' },
    ...courseOptions.map((c) => ({
      value: c.courseId,
      label: `${c.name}${c.className ? ` (${c.className})` : ''}`,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 dark:bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-7xl h-[92vh] rounded-3xl bg-white dark:bg-[#1A1C1E] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0059bb] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">data_object</span>
            </div>
            <div className="truncate">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                Tạo Đồ thị Tri thức từ Dữ liệu JSON
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Tuân thủ chuẩn API Spec (§16.2), tự động kiểm tra tính hợp lệ DAG và kết xuất trực quan 2D
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Course Target Selection Banner */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400 shrink-0">
              school
            </span>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              Môn học áp dụng: <span className="text-rose-500">*</span>
            </label>
            <div className="flex-1 max-w-md">
              <CustomSelect<string>
                value={selectedCourseId}
                onChange={(val) => setSelectedCourseId(val)}
                options={courseSelectOptions}
                variant="default"
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'editor' ? 'docs' : 'editor')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                activeTab === 'docs'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>{activeTab === 'docs' ? 'Quay lại soạn thảo' : 'Xem hướng dẫn Schema'}</span>
            </button>
          </div>
        </div>

        {/* Main Split-Screen Workspace (Left Editor · Right 2D Live Preview) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {/* Left Column (5/12): JSON Editor & Diagnostics */}
          <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1E1F20]">
            {activeTab === 'docs' ? (
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    📖 Quy cách Cấu trúc JSON Đồ thị Tri thức
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopySample}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>{copySuccess ? 'Đã sao chép!' : 'Sao chép mẫu'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {IMPORT_SCHEMA_DOCUMENTATION.map((item) => (
                    <div
                      key={item.field}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {item.field}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{item.type}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        {item.description}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        Ví dụ: {item.example}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Editor Toolbar */}
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                    JSON Input ({jsonText.split('\n').length} dòng)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Nạp dữ liệu mẫu Cấu trúc dữ liệu & Giải thuật"
                    >
                      Nạp mẫu chuẩn
                    </button>
                    <button
                      type="button"
                      onClick={handlePrettify}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Định dạng thụt lề JSON đẹp mắt"
                    >
                      Format JSON
                    </button>
                  </div>
                </div>

                {/* Textarea Editor */}
                <div className="flex-1 min-h-0 relative">
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder="Dán hoặc nhập cấu trúc JSON đồ thị tri thức tại đây..."
                    className="w-full h-full p-4 font-mono text-xs text-slate-900 dark:text-slate-100 bg-transparent resize-none outline-none leading-relaxed overflow-auto"
                    spellCheck={false}
                  />
                </div>

                {/* Diagnostics Panel (Real-time Error & Success Reports) */}
                <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto shrink-0 bg-slate-50/60 dark:bg-slate-900/60">
                  {validation.isValid ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">
                            check_circle
                          </span>
                          <span>JSON hoàn toàn hợp lệ &amp; Đạt chuẩn DAG</span>
                        </div>
                        <span className="text-[11px] font-mono">
                          {validation.stats.nodeCount} nút · {validation.stats.edgeCount} liên kết
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                          {validation.stats.levels.BEGINNER} Cơ bản
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                          {validation.stats.levels.INTERMEDIATE} Trung cấp
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold">
                          {validation.stats.levels.ADVANCED} Nâng cao
                        </span>
                        <span className="text-slate-400">
                          {validation.stats.categories.length} phân nhóm
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>Phát hiện {validation.errors.length} lỗi cần sửa đổi:</span>
                      </div>

                      <div className="space-y-1.5">
                        {validation.errors.map((err) => (
                          <div
                            key={err.id}
                            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{err.title}</span>
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-rose-200/60 dark:bg-rose-900/70 text-rose-800 dark:text-rose-300">
                                {err.type}
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed">{err.message}</p>
                            {err.detail && (
                              <p className="text-[10px] font-mono text-rose-700 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-950/80 p-1.5 rounded-lg">
                                {err.detail}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {validation.warnings.map((warn, wIdx) => (
                        <div
                          key={wIdx}
                          className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[15px]">warning</span>
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Column (7/12): Live 2D Graph Preview Canvas */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#121417] relative">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs shrink-0 z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">
                  preview
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Kết quả Đồ thị Tri thức 2D Xem trước (Live Preview)
                </h4>
              </div>

              {validation.isValid && validation.parsedData && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="truncate max-w-[200px] font-semibold text-blue-600 dark:text-blue-400">
                    &ldquo;{validation.parsedData.title}&rdquo;
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">
                    {previewNodes.length} nút · {previewEdges.length} dây nối
                  </span>
                </div>
              )}
            </div>

            {/* 2D Canvas Area */}
            <div className="flex-1 w-full h-full relative overflow-hidden">
              {validation.isValid && previewNodes.length > 0 ? (
                <ReactFlow
                  key={`preview-${previewNodes.length}-${previewEdges.length}`}
                  nodes={previewNodes}
                  edges={previewEdges}
                  fitView
                  minZoom={0.1}
                  maxZoom={2}
                  nodesDraggable={true}
                  nodesConnectable={false}
                >
                  <Background color="#94a3b8" gap={20} size={1.2} />
                  <Controls />
                </ReactFlow>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[36px]">hub</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Chưa có dữ liệu 2D hợp lệ để hiển thị
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                    Vui lòng khắc phục các lỗi cú pháp hoặc cấu trúc ở cột bên trái. Bạn cũng có thể bấm{' '}
                    <strong className="text-blue-600 dark:text-blue-400 cursor-pointer" onClick={handleLoadSample}>
                      &ldquo;Nạp mẫu chuẩn&rdquo;
                    </strong>{' '}
                    để trải nghiệm đồ thị 2D mẫu ngay lập tức.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#1E1F20] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {!selectedCourseId ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                ⚠️ Vui lòng chọn môn học cần áp dụng ở đầu trang trước khi xuất bản.
              </span>
            ) : validation.isValid ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Sẵn sàng xuất bản cây tri thức lên Neo4j &amp; ChromaDB.
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                ⚠️ Cần khắc phục lỗi trước khi có thể nạp đồ thị.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={importMutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!validation.isValid || !selectedCourseId || importMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-[#0059bb] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {importMutation.isPending ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Đang nạp lên Neo4j...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  <span>Xác nhận Nạp Đồ Thị Tri Thức</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
