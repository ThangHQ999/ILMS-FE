'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CustomSelect } from '@/components/shared';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { GraphCanvas } from '../canvas/GraphCanvas';
import { GraphFilterBar } from './GraphFilterBar';
import { NodeInspectorPanel } from './NodeInspectorPanel';
import { KnowledgeMatrixTable } from './KnowledgeMatrixTable';
import { ShortestPathModal } from './ShortestPathModal';
import { EditFloatingPalette } from './EditFloatingPalette';
import { QuickAddNodeModal } from './QuickAddNodeModal';
import { QuickConnectModal } from './QuickConnectModal';
import type {
  KnowledgeNodeData,
  KnowledgeEdgeData,
  KnowledgeCategory,
  EditTool,
  LayoutMode,
  ShortestPathResult,
} from '../../types';
import type {
  ConceptDetail,
  PublishedGraphSummary,
} from '../../knowledge-graph.schema';
import type { StudioCourseOption } from '../../services/knowledge-graph.service';
import type { Node, Edge } from '@xyflow/react';

interface KnowledgeAnalyticsViewProps {
  userFullName?: string;
  canManageGraph?: boolean;
  graphTitle?: string;
  courseOptions?: StudioCourseOption[];
  publishedGraphs?: PublishedGraphSummary[];
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
  selectedMaterialId?: string | null;
  onSelectMaterial?: (materialId: string | null) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRefetch?: () => void;
  conceptDetail?: ConceptDetail | null;
  isConceptDetailLoading?: boolean;
  activePublicationId?: string | null;
  activePublicationStatus?: string | null;
  isStartingDraft?: boolean;
  isWithdrawing?: boolean;
  isRetryingPublication?: boolean;
  onStartDraftEdit?: (materialId: string) => void;
  onWithdrawPublication?: (materialId: string, publicationId: string, reason?: string) => void;
  onRetryPublication?: (publicationId: string) => void;
  externalToastMessage?: string | null;
  nodesData: KnowledgeNodeData[];
  edgesData?: KnowledgeEdgeData[];
  rawNodes: Node<KnowledgeNodeData>[];
  rawEdges: Edge[];
  selectedNodeId: string | null;
  selectedNode: KnowledgeNodeData | null;
  onSelectNode: (id: string | null) => void;
  hoveredNodeId: string | null;
  onHoverNode: (id: string | null) => void;
  filterCategory: KnowledgeCategory;
  onSelectCategory: (cat: KnowledgeCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  depth: number;
  onDepthChange: (d: number) => void;
  isSmartDimActive: boolean;
  onToggleSmartDim: () => void;
  showAuxiliaryNodes?: boolean;
  onToggleAuxiliaryNodes?: () => void;
  auxiliaryCount?: number;
  allNodesData?: KnowledgeNodeData[];
  isEditMode: boolean;
  onToggleEditMode: () => void;
  activeTool: EditTool;
  onSelectTool: (tool: EditTool) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onAddNode: (node: KnowledgeNodeData) => void;
  onUpdateNode: (id: string, updates: Partial<KnowledgeNodeData>) => void;
  onDeleteNode: (id: string) => void;
  onConnectNodes: (source: string, target: string, rawRelation?: string, label?: string) => void;
  hasUnsavedChanges?: boolean;
  unsavedCount?: number;
  onResetDraftChanges?: () => void;
  onSwitchToFocus: () => void;
}

export function KnowledgeAnalyticsView({
  userFullName = '',
  canManageGraph = false,
  graphTitle,
  courseOptions = [],
  publishedGraphs = [],
  selectedCourseId = null,
  onSelectCourse,
  selectedMaterialId = null,
  onSelectMaterial,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRefetch,
  conceptDetail = null,
  isConceptDetailLoading = false,
  activePublicationId = null,
  activePublicationStatus = null,
  isStartingDraft = false,
  isWithdrawing = false,
  isRetryingPublication = false,
  onStartDraftEdit,
  onWithdrawPublication,
  onRetryPublication,
  externalToastMessage = null,
  nodesData,
  edgesData = [],
  rawNodes,
  rawEdges,
  selectedNodeId,
  selectedNode,
  onSelectNode,
  hoveredNodeId,
  onHoverNode,
  filterCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  depth,
  onDepthChange,
  isSmartDimActive,
  onToggleSmartDim,
  showAuxiliaryNodes = false,
  onToggleAuxiliaryNodes,
  auxiliaryCount = 0,
  allNodesData = [],
  isEditMode = false,
  onToggleEditMode,
  activeTool = 'select',
  onSelectTool,
  layoutMode,
  onLayoutModeChange,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onConnectNodes,
  hasUnsavedChanges = false,
  unsavedCount = 0,
  onResetDraftChanges,
  onSwitchToFocus,
}: KnowledgeAnalyticsViewProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'graph' | 'table'>('graph');
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [highlightPathIds, setHighlightPathIds] = useState<string[] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick CRUD States
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [addNodePosition, setAddNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [editingNode, setEditingNode] = useState<KnowledgeNodeData | null>(null);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectSourceNode, setConnectSourceNode] = useState<KnowledgeNodeData | null>(null);
  const [connectTargetNode, setConnectTargetNode] = useState<KnowledgeNodeData | null>(null);
  const [connectPendingNodeId, setConnectPendingNodeId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const connectPendingLabel = React.useMemo(() => {
    if (!connectPendingNodeId) return null;
    return nodesData.find((n) => n.id === connectPendingNodeId)?.label || connectPendingNodeId;
  }, [connectPendingNodeId, nodesData]);

  const handleCanvasAddNodeAtPosition = (pos: { x: number; y: number }) => {
    setAddNodePosition(pos);
    setEditingNode(null);
    setIsAddNodeModalOpen(true);
  };

  const handleSubmitNodeModal = (data: Partial<KnowledgeNodeData>) => {
    if (editingNode) {
      onUpdateNode?.(editingNode.id, data);
      showToast(`Đã cập nhật khái niệm "${data.label || editingNode.label}"`);
    } else {
      const newNode = data as KnowledgeNodeData;
      onAddNode?.(newNode);
      showToast(`Đã thêm khái niệm "${newNode.label}" vào đồ thị`);
    }
  };

  const handleTriggerConnect = (sourceId: string, targetId: string) => {
    const sNode = nodesData.find((n) => n.id === sourceId) || null;
    const tNode = nodesData.find((n) => n.id === targetId) || null;
    if (sNode && tNode) {
      setConnectSourceNode(sNode);
      setConnectTargetNode(tNode);
      setIsConnectModalOpen(true);
    }
  };

  const handleConfirmConnect = (relationType: string, label: string) => {
    if (connectSourceNode && connectTargetNode) {
      onConnectNodes?.(connectSourceNode.id, connectTargetNode.id, relationType, label);
      showToast(`Đã tạo liên kết ${label} giữa "${connectSourceNode.label}" và "${connectTargetNode.label}"`);
      setConnectPendingNodeId(null);
    }
  };

  const handleConfirmPath = (result: ShortestPathResult) => {
    setHighlightPathIds(result.pathIds);
    showToast(
      `Đã kích hoạt lộ trình học tối ưu (${result.stepsCount} chặng - ${result.totalTimeEstimate})`
    );
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ nodes: nodesData, edges: edgesData }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `knowledge_graph_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã xuất dữ liệu đồ thị JSON thành công!');
  };

  const activeScopeLabel =
    graphTitle ||
    publishedGraphs.find((g) => g.materialId === selectedMaterialId)?.title ||
    courseOptions.find((c) => c.courseId === selectedCourseId)?.name ||
    'Neo4j Knowledge Graph';

  const visibleToast = externalToastMessage || toastMessage;

  return (
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] font-sans text-[#1F1F1F] dark:text-[#E3E3E3]">
      {visibleToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{visibleToast}</span>
        </div>
      )}

      {/* 1. Global Navigation Sidebar */}
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Global Top Header */}
      <DashboardHeader
        isFocus={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={onSwitchToFocus}
        userFullName={userFullName}
      />

      {/* 3. Main Stage Content */}
      <div
        className={`pt-20 px-4 sm:px-6 pb-12 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-[96px]' : 'md:pl-[280px]'
        }`}
      >
        <div className="flex flex-col w-full max-w-[1720px] mx-auto gap-5">
          {/* Top Ribbon & Scope Selector */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA]">
                  <span className="material-symbols-outlined text-[26px]">hub</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight">
                      Knowledge Graph Studio
                    </h1>
                    <span className="px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-medium text-[11px] max-w-[260px] truncate">
                      {activeScopeLabel}
                    </span>
                    {isFetching && !isLoading && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
                        <span className="material-symbols-outlined text-[14px] animate-spin">
                          sync
                        </span>
                        Đang tải...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-0.5">
                    {nodesData.length} khái niệm tri thức · {edgesData.length} liên kết học tập
                    {auxiliaryCount > 0 && !showAuxiliaryNodes && (
                      <span className="text-slate-400 dark:text-slate-500 font-normal">
                        {' '}(đã gom gọn {auxiliaryCount} chi tiết phụ trợ)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Action Tools */}
              <div className="flex items-center flex-wrap gap-2">
                <CustomSelect<LayoutMode>
                  variant="pill"
                  value={layoutMode}
                  onChange={onLayoutModeChange}
                  options={[
                    { value: 'force', label: 'Force-Directed (Lực hút đẩy)', icon: 'account_tree' },
                    { value: 'hierarchical', label: 'Hierarchical (Phân cấp DAG)', icon: 'account_tree' },
                    { value: 'circular', label: 'Circular (Cụm xoay tròn)', icon: 'account_tree' },
                  ]}
                  className="min-w-[220px]"
                />

                {nodesData.length >= 2 && (
                  <button
                    onClick={() => setIsPathModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[18px]">
                      route
                    </span>
                    <span>Lộ trình A → B</span>
                  </button>
                )}

                {nodesData.length > 0 && (
                  <button
                    onClick={handleExportJson}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#1E1F20] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Xuất JSON</span>
                  </button>
                )}

                <div className="flex items-center bg-white/70 dark:bg-[#1E1F20] p-1 rounded-full">
                  <button
                    onClick={() => setActiveTab('graph')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'graph'
                        ? 'bg-[#D3E3FD] dark:bg-[#282A2C] text-[#041E49] dark:text-[#E3E3E3]'
                        : 'text-slate-600 dark:text-[#C4C7C5]'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[17px]">bubble_chart</span>
                    <span>Mạng lưới 2D</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('table')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'table'
                        ? 'bg-[#D3E3FD] dark:bg-[#282A2C] text-[#041E49] dark:text-[#E3E3E3]'
                        : 'text-slate-600 dark:text-[#C4C7C5]'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[17px]">table_rows</span>
                    <span>Bảng ma trận</span>
                  </button>
                </div>

                {nodesData.length > 0 && (
                  <button
                    onClick={onSwitchToFocus}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      center_focus_strong
                    </span>
                    <span>Chế độ Tập trung</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scope Selector Strip (Course -> Published Material) */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="flex items-center gap-2 min-w-[230px]">
                  <span className="text-xs font-bold text-slate-500 dark:text-[#C4C7C5] whitespace-nowrap">
                    Khóa học:
                  </span>
                  <CustomSelect<string>
                    value={selectedCourseId ?? ''}
                    onChange={(val) => onSelectCourse?.(val || null)}
                    options={[
                      { value: '', label: 'Tất cả đồ thị đã xuất bản' },
                      ...courseOptions.map((c) => ({
                        value: c.courseId,
                        label: c.className ? `${c.name} (${c.className})` : c.name,
                      })),
                    ]}
                    className="flex-1 min-w-[200px]"
                  />
                </div>

                <div className="flex items-center gap-2 min-w-[260px]">
                  <span className="text-xs font-bold text-slate-500 dark:text-[#C4C7C5] whitespace-nowrap">
                    Tài liệu:
                  </span>
                  <CustomSelect<string>
                    value={selectedMaterialId ?? ''}
                    onChange={(val) => onSelectMaterial?.(val || null)}
                    options={[
                      ...(selectedCourseId
                        ? [{ value: '', label: 'Toàn bộ đồ thị của khóa học' }]
                        : [{ value: '', label: 'Chọn tài liệu đã xuất bản...' }]),
                      ...publishedGraphs.map((g) => ({
                        value: g.materialId,
                        label: `${g.title}${g.conceptsCount ? ` (${g.conceptsCount} kn)` : ''}`,
                      })),
                    ]}
                    className="flex-1 min-w-[220px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canManageGraph && onToggleEditMode && (
                  <button
                    type="button"
                    onClick={onToggleEditMode}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none shadow-xs ${
                      isEditMode
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 dark:ring-blue-500'
                        : 'bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-800 dark:text-amber-200'
                    }`}
                    title={
                      isEditMode
                        ? 'Đang bật chế độ chỉnh sửa (Bấm để thoát)'
                        : 'Bật chế độ chỉnh sửa đồ thị tri thức'
                    }
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isEditMode ? 'edit_square' : 'architecture'}
                    </span>
                    <span>{isEditMode ? 'Đang Chỉnh Sửa' : 'Bật Chỉnh Sửa'}</span>
                  </button>
                )}

                {canManageGraph && selectedMaterialId && onStartDraftEdit && (
                  <button
                    type="button"
                    disabled={isStartingDraft}
                    onClick={() => onStartDraftEdit(selectedMaterialId)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-slate-200 dark:hover:bg-[#333537] text-slate-700 dark:text-[#E3E3E3] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                    <span>
                      {isStartingDraft ? 'Đang tạo bản nháp...' : 'Chỉnh sửa bản nháp'}
                    </span>
                  </button>
                )}

                {canManageGraph && (
                  <Link
                    href="/materials/tasks"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-slate-200 dark:hover:bg-[#333537] text-slate-700 dark:text-[#E3E3E3] text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">fact_check</span>
                    <span>Quản lý &amp; Duyệt AI</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 7-State Matrix for Main Stage */}
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-pulse">
              <div className="xl:col-span-8 h-[640px] rounded-3xl bg-white dark:bg-[#1E1F20]" />
              <div className="xl:col-span-4 h-[640px] rounded-3xl bg-white dark:bg-[#1E1F20]" />
            </div>
          ) : isError ? (
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-12 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[30px]">cloud_off</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#E3E3E3]">
                Không thể tải dữ liệu Đồ thị tri thức từ Neo4j
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#C4C7C5] max-w-md">
                Vui lòng kiểm tra kết nối máy chủ hoặc thử tải lại.
              </p>
              <button
                type="button"
                onClick={() => onRefetch?.()}
                className="px-5 py-2.5 rounded-full bg-[#0B57D0] text-white text-xs font-bold cursor-pointer hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : nodesData.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-14 text-center flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center">
                <span className="material-symbols-outlined text-[34px]">hub</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#E3E3E3]">
                Chưa có Đồ thị tri thức nào được xuất bản trong phạm vi này
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#C4C7C5] max-w-lg">
                {canManageGraph
                  ? 'Hãy tải lên giáo trình ở Trung tâm Xử lý AI hoặc trong tab Tài liệu của khóa học, chạy bóc tách 4 Agent AI và duyệt xuất bản lên Neo4j.'
                  : 'Giảng viên chưa xuất bản đồ thị tri thức cho khóa học hoặc tài liệu này. Hãy thử chọn khóa học khác ở thanh phạm vi phía trên.'}
              </p>
              {canManageGraph && (
                <Link
                  href="/materials/tasks"
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B57D0] hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  <span>Mở Trung tâm Xử lý &amp; Xuất bản AI</span>
                </Link>
              )}
            </div>
          ) : activeTab === 'graph' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Canvas Column */}
              <div
                className={`flex flex-col gap-4 transition-all duration-300 ${
                  isInspectorCollapsed ? 'xl:col-span-12' : 'xl:col-span-8'
                }`}
              >
                <GraphFilterBar
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  selectedCategory={filterCategory}
                  onSelectCategory={onSelectCategory}
                  depth={depth}
                  onDepthChange={onDepthChange}
                  isSmartDimActive={isSmartDimActive}
                  onToggleSmartDim={onToggleSmartDim}
                  showAuxiliaryNodes={showAuxiliaryNodes}
                  onToggleAuxiliaryNodes={onToggleAuxiliaryNodes}
                  auxiliaryCount={auxiliaryCount}
                  nodes={nodesData}
                  onSelectNode={(id) => onSelectNode(id)}
                />

                <div className="relative w-full h-[640px] bg-white dark:bg-[#1E1F20] rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-xs">
                  {/* Floating Edit Toolbar when isEditMode is active */}
                  {canManageGraph && isEditMode && (
                    <EditFloatingPalette
                      activeTool={activeTool}
                      onSelectTool={onSelectTool}
                      onOpenAddModal={() => {
                        setAddNodePosition(null);
                        setEditingNode(null);
                        setIsAddNodeModalOpen(true);
                      }}
                      onCloseEditMode={onToggleEditMode}
                      connectPendingLabel={connectPendingLabel}
                    />
                  )}

                  <GraphCanvas
                    nodes={rawNodes}
                    edges={rawEdges}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    hoveredNodeId={hoveredNodeId}
                    onHoverNode={onHoverNode}
                    filterCategory={filterCategory}
                    searchQuery={searchQuery}
                    depth={depth}
                    isSmartDimActive={isSmartDimActive}
                    isEditMode={Boolean(canManageGraph && isEditMode)}
                    activeTool={activeTool}
                    layoutMode={layoutMode}
                    onAddNodeAtPosition={handleCanvasAddNodeAtPosition}
                    onDeleteNode={(id) => {
                      onDeleteNode?.(id);
                      showToast('Đã xóa đối tượng khỏi đồ thị');
                    }}
                    onConnectNodes={handleTriggerConnect}
                    onConnectStartNodeChange={(id) => setConnectPendingNodeId(id)}
                    highlightPathIds={highlightPathIds}
                    isFocusMode={false}
                  />

                  {/* Floating Draft Action Bar at Bottom of Canvas */}
                  {canManageGraph && (isEditMode || hasUnsavedChanges) && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md text-xs font-semibold animate-fade-in border border-slate-700 dark:border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span className="font-bold">
                          {hasUnsavedChanges
                            ? `Bản nháp có ${unsavedCount} thay đổi`
                            : 'Chế độ Chỉnh sửa trực tiếp'}
                        </span>
                      </div>

                      <div className="w-[1px] h-4 bg-slate-600 dark:bg-slate-300" />

                      {hasUnsavedChanges && onResetDraftChanges && (
                        <button
                          type="button"
                          onClick={() => {
                            onResetDraftChanges();
                            showToast('Đã hoàn tác các thay đổi local về bản gốc');
                          }}
                          className="text-slate-300 dark:text-slate-600 hover:text-white dark:hover:text-black font-semibold cursor-pointer border-none bg-transparent"
                        >
                          Hoàn tác
                        </button>
                      )}

                      {selectedMaterialId && onStartDraftEdit ? (
                        <button
                          type="button"
                          onClick={() => onStartDraftEdit(selectedMaterialId)}
                          className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer border-none shadow-xs"
                        >
                          Đồng bộ với Bản nháp AI
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => showToast('Đã lưu các thay đổi trực quan trên đồ thị')}
                          className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer border-none shadow-xs"
                        >
                          Lưu thay đổi
                        </button>
                      )}
                    </div>
                  )}

                  {isInspectorCollapsed && (
                    <button
                      onClick={() => setIsInspectorCollapsed(false)}
                      className="absolute right-4 top-4 z-30 bg-white dark:bg-[#1E1F20] px-4 py-2 rounded-full text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      title="Mở rộng Bảng chi tiết thực thể"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">first_page</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-[#E3E3E3] pr-1">
                        Chi tiết Node
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Inspector Panel Column */}
              {!isInspectorCollapsed && (
                <div className="xl:col-span-4 w-full">
                  <NodeInspectorPanel
                    node={selectedNode}
                    allNodes={allNodesData.length > 0 ? allNodesData : nodesData}
                    conceptDetail={conceptDetail}
                    isConceptLoading={isConceptDetailLoading}
                    canManageGraph={canManageGraph}
                    selectedMaterialId={selectedMaterialId}
                    selectedCourseId={selectedCourseId}
                    activePublicationId={activePublicationId}
                    activePublicationStatus={activePublicationStatus}
                    isStartingDraft={isStartingDraft}
                    isWithdrawing={isWithdrawing}
                    isRetryingPublication={isRetryingPublication}
                    onSelectNode={(id) => onSelectNode(id)}
                    onStartDraftEdit={onStartDraftEdit}
                    onWithdrawPublication={onWithdrawPublication}
                    onRetryPublication={onRetryPublication}
                    onSwitchToFocus={onSwitchToFocus}
                    onEditNode={(node) => {
                      setEditingNode(node);
                      setAddNodePosition(null);
                      setIsAddNodeModalOpen(true);
                    }}
                    onDeleteNode={(id) => {
                      onDeleteNode?.(id);
                      showToast('Đã xóa đối tượng khỏi đồ thị');
                    }}
                    isCollapsed={isInspectorCollapsed}
                    onToggleCollapse={() => setIsInspectorCollapsed(true)}
                  />
                </div>
              )}
            </div>
          ) : (
            <KnowledgeMatrixTable
              nodes={nodesData}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => {
                onSelectNode(id);
                setActiveTab('graph');
              }}
              onSwitchToGraph={() => setActiveTab('graph')}
            />
          )}
        </div>
      </div>

      {/* Shortest Path Modal */}
      <ShortestPathModal
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        nodes={nodesData}
        edges={edgesData}
        onConfirmPath={handleConfirmPath}
      />

      {/* Quick Add / Edit Node Modal */}
      <QuickAddNodeModal
        isOpen={isAddNodeModalOpen}
        onClose={() => {
          setIsAddNodeModalOpen(false);
          setEditingNode(null);
          setAddNodePosition(null);
        }}
        onSubmit={handleSubmitNodeModal}
        initialNode={editingNode}
        initialPosition={addNodePosition}
      />

      {/* Quick Connect Modal */}
      <QuickConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          setConnectSourceNode(null);
          setConnectTargetNode(null);
          setConnectPendingNodeId(null);
        }}
        onSubmit={handleConfirmConnect}
        sourceNode={connectSourceNode}
        targetNode={connectTargetNode}
      />
    </div>
  );
}
