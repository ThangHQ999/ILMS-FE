'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { GraphCanvas } from '../canvas/GraphCanvas';
import { GraphFilterBar } from './GraphFilterBar';
import { EditFloatingPalette } from './EditFloatingPalette';
import { NodeInspectorPanel } from './NodeInspectorPanel';
import { KnowledgeMatrixTable } from './KnowledgeMatrixTable';
import { ShortestPathModal } from './ShortestPathModal';
import {
  KnowledgeNodeData,
  KnowledgeCategory,
  EditTool,
  LayoutMode,
  ShortestPathResult,
} from '../../types';
import type { Node, Edge } from '@xyflow/react';

interface KnowledgeAnalyticsViewProps {
  userFullName?: string;
  nodesData: KnowledgeNodeData[];
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
  isEditMode: boolean;
  onToggleEditMode: () => void;
  activeTool: EditTool;
  onSelectTool: (tool: EditTool) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onAddNode: (node: KnowledgeNodeData) => void;
  onUpdateNode: (id: string, updates: Partial<KnowledgeNodeData>) => void;
  onDeleteNode: (id: string) => void;
  onConnectNodes: (source: string, target: string) => void;
  onSwitchToFocus: () => void;
}

export function KnowledgeAnalyticsView({
  userFullName = 'Trần Nhật Minh',
  nodesData,
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
  isEditMode,
  onToggleEditMode,
  activeTool,
  onSelectTool,
  layoutMode,
  onLayoutModeChange,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onConnectNodes,
  onSwitchToFocus,
}: KnowledgeAnalyticsViewProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'graph' | 'table'>('graph');
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [highlightPathIds, setHighlightPathIds] = useState<string[] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleToolSelect = (tool: EditTool) => {
    onSelectTool(tool);
    if (tool === 'connect') {
      showToast('Công cụ Nối dây: Chọn Node gốc rồi chọn Node tiếp theo');
    } else if (tool === 'add-node') {
      showToast('Click vào vị trí trống trên khung vẽ để tạo Node mới');
    } else if (tool === 'delete') {
      showToast('Click vào bất kỳ Node nào để xóa khỏi đồ thị');
    } else {
      showToast('Chế độ Con trỏ chọn & di chuyển');
    }
  };

  const handleAddNodeAtPosition = (pos: { x: number; y: number }) => {
    const newId = `node-custom-${Date.now()}`;
    const newNode: KnowledgeNodeData = {
      id: newId,
      label: 'Khái niệm mới',
      sublabel: 'Tự định nghĩa',
      category: 'algo',
      status: 'learning',
      masteryScore: 0,
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: 'Mô tả khái niệm tri thức vừa được thêm vào bản đồ.',
      icon: 'school',
      prerequisites: [],
      successors: [],
    };
    onAddNode(newNode);
    showToast('Đã thêm một Node tri thức mới vào canvas!');
  };

  const handleConfirmPath = (result: ShortestPathResult) => {
    setHighlightPathIds(result.pathIds);
    showToast(`Đã kích hoạt lộ trình học tối ưu (${result.stepsCount} chặng - ${result.totalTimeEstimate})`);
  };

  const handleExportData = (type: 'svg' | 'png' | 'json') => {
    if (type === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ nodes: nodesData, edges: rawEdges }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `knowledge_graph_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Đã xuất JSON Graph Schema thành công!');
    } else {
      showToast(`Đã xuất đồ thị định dạng ${type.toUpperCase()} thành công!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314] font-sans text-[#1F1F1F] dark:text-[#E3E3E3]">
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
        className={`pt-20 px-6 pb-12 transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-26' : 'pl-72'
        }`}
      >
        <div className="flex flex-col w-full max-w-[1720px] mx-auto gap-6">
          {/* Top Ribbon & Quick Analytics Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA] border-none shadow-none">
                <span className="material-symbols-outlined text-[26px]">hub</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-[#E3E3E3] tracking-tight">
                    Knowledge Graph Studio
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] whitespace-nowrap font-medium text-[11px] border-none">
                    Bản đồ kiến trúc CS
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-0.5">
                  Mạng lưới {nodesData.length} thực thể tri thức, liên kết suy luận đồ thị & lộ trình cá nhân hóa
                </p>
              </div>
            </div>

            {/* Right Action Tools */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Layout Mode Selector */}
              <div className="flex items-center bg-[#F0F4F9] dark:bg-[#1E1F20] border-none px-3 py-1.5 rounded-full shadow-none">
                <span className="material-symbols-outlined text-slate-400 text-[18px] ml-1 mr-1">
                  account_tree
                </span>
                <select
                  value={layoutMode}
                  onChange={(e) => onLayoutModeChange(e.target.value as LayoutMode)}
                  className="bg-transparent text-xs font-semibold text-slate-800 dark:text-[#E3E3E3] py-1 pr-3 pl-1 outline-none cursor-pointer"
                >
                  <option value="force" className="dark:bg-[#1E1F20]">Force-Directed (Lực hút đẩy)</option>
                  <option value="hierarchical" className="dark:bg-[#1E1F20]">Hierarchical (Phân cấp DAG)</option>
                  <option value="circular" className="dark:bg-[#1E1F20]">Circular (Cụm xoay tròn)</option>
                </select>
              </div>

              {/* Shortest Path Finder Trigger */}
              <button
                onClick={() => setIsPathModalOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-medium border-none shadow-none transition-all cursor-pointer whitespace-nowrap"
                type="button"
              >
                <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[18px]">
                  route
                </span>
                <span>Lộ trình ngắn nhất (A → B)</span>
              </button>

              {/* Edit Mode Toggle */}
              <button
                onClick={() => {
                  onToggleEditMode();
                  showToast(
                    !isEditMode
                      ? 'Đã kích hoạt Chế độ Chỉnh sửa đồ thị tri thức'
                      : 'Đã chuyển về chế độ Xem (Read-only)'
                  );
                }}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-medium border-none shadow-none transition-all cursor-pointer whitespace-nowrap ${
                  isEditMode
                    ? 'bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F]'
                    : 'bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>{isEditMode ? 'Chế độ Chỉnh sửa' : 'Bật Chỉnh sửa'}</span>
                {isEditMode && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>

              {/* Export Data Dropdown */}
              <div className="relative group">
                <button
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-medium border-none shadow-none transition-all cursor-pointer whitespace-nowrap"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Xuất dữ liệu</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border-none py-1.5 hidden group-hover:block z-50">
                  <button
                    onClick={() => handleExportData('svg')}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-xs font-medium text-slate-700 dark:text-[#E3E3E3] flex items-center gap-2"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0B57D0]">image</span>
                    SVG Vector HD
                  </button>
                  <button
                    onClick={() => handleExportData('png')}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-xs font-medium text-slate-700 dark:text-[#E3E3E3] flex items-center gap-2"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0B57D0]">photo_camera</span>
                    PNG 300 DPI
                  </button>
                  <button
                    onClick={() => handleExportData('json')}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-xs font-medium text-slate-700 dark:text-[#E3E3E3] flex items-center gap-2"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0B57D0]">data_object</span>
                    JSON Graph Schema
                  </button>
                </div>
              </div>

              {/* View Switcher (2D Graph vs Matrix Table) */}
              <div className="flex items-center bg-[#E1E5EA] dark:bg-[#1E1F20] p-1 rounded-full border-none">
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'graph'
                      ? 'bg-white dark:bg-[#282A2C] text-[#041E49] dark:text-[#E3E3E3] shadow-none'
                      : 'text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">bubble_chart</span>
                  <span>Mạng lưới 2D</span>
                </button>
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'table'
                      ? 'bg-white dark:bg-[#282A2C] text-[#041E49] dark:text-[#E3E3E3] shadow-none'
                      : 'text-slate-600 dark:text-[#C4C7C5] hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>
                  <span>Bảng ma trận</span>
                </button>
              </div>

              {/* Enter Zen Focus Mode Button */}
              <button
                onClick={onSwitchToFocus}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-medium border-none shadow-none transition-all cursor-pointer whitespace-nowrap"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                <span>Chế độ Tập trung</span>
              </button>
            </div>
          </div>

          {/* Main Stage Grid: Canvas & Inspector */}
          {activeTab === 'graph' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Canvas Column (xl:col-span-8 or 12 when inspector collapsed) */}
              <div
                className={`flex flex-col gap-4 transition-all duration-300 ${
                  isInspectorCollapsed ? 'xl:col-span-12' : 'xl:col-span-8'
                }`}
              >
                {/* Filter and Search Bar */}
                <GraphFilterBar
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  selectedCategory={filterCategory}
                  onSelectCategory={onSelectCategory}
                  depth={depth}
                  onDepthChange={onDepthChange}
                  isSmartDimActive={isSmartDimActive}
                  onToggleSmartDim={onToggleSmartDim}
                  nodes={nodesData}
                  onSelectNode={(id) => onSelectNode(id)}
                />

                {/* Graph Stage Canvas Wrapper */}
                <div className="relative w-full h-[640px] bg-white dark:bg-[#1E1F20] rounded-3xl overflow-hidden shadow-none border-none">
                  {/* Floating Edit Palette if Edit Mode Active */}
                  {isEditMode && (
                    <EditFloatingPalette
                      activeTool={activeTool}
                      onSelectTool={handleToolSelect}
                      toastMessage={toastMessage}
                    />
                  )}

                  {/* React Flow Graph Canvas */}
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
                    isEditMode={isEditMode}
                    activeTool={activeTool}
                    layoutMode={layoutMode}
                    onAddNodeAtPosition={handleAddNodeAtPosition}
                    onDeleteNode={onDeleteNode}
                    onConnectNodes={onConnectNodes}
                    highlightPathIds={highlightPathIds}
                    isFocusMode={false}
                  />

                  {/* Floating Expand Inspector Strip if Collapsed */}
                  {isInspectorCollapsed && (
                    <button
                      onClick={() => setIsInspectorCollapsed(false)}
                      className="absolute right-4 top-4 z-30 bg-white dark:bg-[#1E1F20] shadow-none border-none px-4 py-2 rounded-full text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-all flex items-center gap-2 cursor-pointer"
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

              {/* Right Inspector Panel Column (xl:col-span-4) */}
              {!isInspectorCollapsed && (
                <div className="xl:col-span-4 w-full">
                  <NodeInspectorPanel
                    node={selectedNode}
                    onSaveNode={onUpdateNode}
                    onDeleteNode={onDeleteNode}
                    isCollapsed={isInspectorCollapsed}
                    onToggleCollapse={() => setIsInspectorCollapsed(true)}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Table Fallback View */
            <KnowledgeMatrixTable
              nodes={nodesData}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
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
        onConfirmPath={handleConfirmPath}
      />
    </div>
  );
}
