'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GraphCanvas } from '../canvas/GraphCanvas';
import { SketchCanvasOverlay } from '../canvas/SketchCanvasOverlay';
import { FloatingNodeCard } from './FloatingNodeCard';
import { FocusPillToolbar } from './FocusPillToolbar';
import { GraphAiRepairModal } from '../analytics/GraphAiRepairModal';
import { KnowledgeNodeData, KnowledgeEdgeData } from '../../types';
import type { ConceptDetail } from '../../knowledge-graph.schema';
import type { StudioCourseOption } from '../../services/knowledge-graph.service';
import type { Node, Edge } from '@xyflow/react';

interface KnowledgeFocusViewProps {
  userFullName?: string;
  courseId?: string | null;
  courseOptions?: StudioCourseOption[];
  nodesData: KnowledgeNodeData[];
  edgesData?: KnowledgeEdgeData[];
  rawNodes: Node<KnowledgeNodeData>[];
  rawEdges: Edge[];
  selectedNodeId: string | null;
  selectedNode: KnowledgeNodeData | null;
  conceptDetail?: ConceptDetail | null;
  isConceptDetailLoading?: boolean;
  canOpenLesson?: boolean;
  onSelectNode: (id: string | null) => void;
  hoveredNodeId: string | null;
  onHoverNode: (id: string | null) => void;
  onOpenLesson?: (node: KnowledgeNodeData) => void;
  onAskAiTutor?: (node: KnowledgeNodeData) => void;
  onExitFocus: () => void;
  onRefetch?: () => void;
}

export function KnowledgeFocusView({
  courseId = null,
  courseOptions = [],
  nodesData,
  edgesData = [],
  rawNodes,
  rawEdges,
  selectedNodeId,
  selectedNode,
  conceptDetail = null,
  isConceptDetailLoading = false,
  canOpenLesson = false,
  onSelectNode,
  hoveredNodeId,
  onHoverNode,
  onOpenLesson,
  onAskAiTutor,
  onExitFocus,
  onRefetch,
}: KnowledgeFocusViewProps) {
  const [isSpotlightActive, setIsSpotlightActive] = useState(true);
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [clearDrawingTrigger, setClearDrawingTrigger] = useState(0);
  const [isCardDismissed, setIsCardDismissed] = useState(false);
  const [isAiRepairModalOpen, setIsAiRepairModalOpen] = useState(false);
  const prevSelectedNodeIdRef = useRef<string | null>(selectedNodeId);

  // If a node is selected and it changed to a different node, ensure the card is shown
  useEffect(() => {
    if (selectedNodeId && selectedNodeId !== prevSelectedNodeIdRef.current) {
      setIsCardDismissed(false);
    }
    prevSelectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  const handleCloseCard = () => {
    setIsCardDismissed(true);
    onSelectNode(null);
  };

  const handleSelectNode = (id: string | null) => {
    if (id !== null) {
      setIsCardDismissed(false);
    }
    onSelectNode(id);
  };

  // Keyboard shortcuts (ESC to close card or exit, F to toggle fullscreen, D for Draw, M for Minimap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        if (selectedNodeId && !isCardDismissed) {
          handleCloseCard();
          return;
        }
        onExitFocus();
      } else if (e.key === 'f' || e.key === 'F') {
        onExitFocus();
      } else if (e.key === 'd' || e.key === 'D') {
        setIsDrawingMode((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMinimapVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFocus, selectedNodeId, isCardDismissed]);

  const activeFocusNode = selectedNode || nodesData[0] || null;

  return (
    <div className="relative w-screen h-screen m-0 p-0 overflow-hidden bg-[#F0F4F9] dark:bg-[#131314] font-sans text-slate-800 dark:text-[#E3E3E3] select-none">
      {/* 1. Freehand Sketch Drawing Layer */}
      <SketchCanvasOverlay
        isActive={isDrawingMode}
        clearTrigger={clearDrawingTrigger}
      />

      {/* 2. TOP-LEFT: Fullscreen Mode Indicator & Controls */}
      <div className="fixed top-6 left-6 z-30 flex items-center gap-2.5 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-200/60 dark:border-white/10 shadow-md">
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200 dark:border-white/10">
          <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
            fullscreen
          </span>
          <span className="text-[11px] font-bold tracking-widest text-slate-900 dark:text-[#E3E3E3] uppercase">
            Toàn màn hình
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#C4C7C5]">
          <span className="text-slate-400 font-medium">Đang xem:</span>
          <span className="font-medium text-[#041E49] dark:text-[#A8C7FA] px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center gap-1.5 shadow-none max-w-[220px] truncate">
            <span className="material-symbols-outlined text-[15px] shrink-0">schema</span>
            <span className="truncate">{activeFocusNode?.label || 'Chưa chọn khái niệm'}</span>
          </span>
        </div>

        {/* Spotlight Switch */}
        <button
          onClick={() => setIsSpotlightActive((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all shadow-none border-none cursor-pointer ${
            isSpotlightActive
              ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
              : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
          }`}
          title="Bật/tắt chế độ tia rọi tập trung"
          type="button"
        >
          <span className="material-symbols-outlined text-[15px] text-amber-500">
            flash_on
          </span>
          <span>{isSpotlightActive ? 'Tia rọi: BẬT' : 'Tia rọi: TẮT'}</span>
        </button>
      </div>

      {/* 3. TOP-RIGHT: Exit Fullscreen Button */}
      <div className="fixed top-6 right-6 z-30 flex items-center gap-2.5">
        <button
          onClick={onExitFocus}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 dark:bg-[#1E1F20]/95 hover:bg-slate-100 dark:hover:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] border border-slate-200/60 dark:border-white/10 shadow-md font-medium text-xs transition-all cursor-pointer whitespace-nowrap"
          title="Thoát chế độ toàn màn hình (Phím ESC hoặc F)"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:scale-110 transition-transform">
            fullscreen_exit
          </span>
          <span>Thoát toàn màn hình</span>
          <kbd className="ml-1 px-2 py-0.5 text-[10px] font-mono font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#C4C7C5] rounded-full border-none">
            ESC / F
          </kbd>
        </button>
      </div>

      {/* 4. Fullscreen Interactive Graph Viewport */}
      <div className="w-full h-full">
        <GraphCanvas
          nodes={rawNodes}
          edges={rawEdges}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          hoveredNodeId={hoveredNodeId}
          onHoverNode={onHoverNode}
          filterCategory="all"
          searchQuery=""
          depth={2}
          isSmartDimActive={isSpotlightActive}
          isEditMode={false}
          activeTool="select"
          layoutMode="force"
          isFocusMode={true}
          isMinimapVisible={isMinimapVisible}
          onToggleMinimap={() => setIsMinimapVisible((prev) => !prev)}
          onCloseMinimap={() => setIsMinimapVisible(false)}
          onOpenAiRepairModal={() => setIsAiRepairModalOpen(true)}
        />
      </div>

      {/* 5. In-Place Floating Node Detail Popover */}
      {selectedNode && !isCardDismissed && (
        <FloatingNodeCard
          node={selectedNode}
          allNodes={nodesData}
          conceptDetail={conceptDetail}
          isConceptLoading={isConceptDetailLoading}
          canOpenLesson={canOpenLesson}
          onClose={handleCloseCard}
          onSelectNode={handleSelectNode}
          onOpenLesson={onOpenLesson}
          onAskAiTutor={onAskAiTutor}
        />
      )}

      {/* 6. Bottom Pill Toolbar */}
      <FocusPillToolbar
        isMinimapVisible={isMinimapVisible}
        onToggleMinimap={() => setIsMinimapVisible((prev) => !prev)}
        isDrawingMode={isDrawingMode}
        onToggleDrawingMode={() => setIsDrawingMode((prev) => !prev)}
        onClearDrawing={() => setClearDrawingTrigger((prev) => prev + 1)}
        onCenterSegmentTree={() => {
          const center = nodesData.find((n) => n.isCenterpiece) ?? nodesData[0];
          if (center) onSelectNode(center.id);
        }}
        onOpenAiRepairModal={() => setIsAiRepairModalOpen(true)}
      />

      {/* 7. AI Graph Validation & Auto-Repair Modal */}
      <GraphAiRepairModal
        isOpen={isAiRepairModalOpen}
        onClose={() => setIsAiRepairModalOpen(false)}
        courseId={courseId}
        courseTitle="Đồ thị toàn màn hình"
        courseOptions={courseOptions}
        currentNodes={nodesData}
        currentEdges={edgesData}
        onApplyRepairedGraph={() => {
          onRefetch?.();
        }}
        onFocusIssueTarget={(targetId, targetType) => {
          if (targetType === 'NODE') {
            handleSelectNode(targetId);
            setIsAiRepairModalOpen(false);
          }
        }}
      />
    </div>
  );
}
