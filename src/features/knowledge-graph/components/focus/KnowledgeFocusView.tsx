'use client';

import React, { useState, useEffect } from 'react';
import { GraphCanvas } from '../canvas/GraphCanvas';
import { SketchCanvasOverlay } from '../canvas/SketchCanvasOverlay';
import { FloatingNodeCard } from './FloatingNodeCard';
import { FocusPillToolbar } from './FocusPillToolbar';
import { KnowledgeNodeData } from '../../types';
import type { ConceptDetail } from '../../knowledge-graph.schema';
import type { Node, Edge } from '@xyflow/react';

interface KnowledgeFocusViewProps {
  userFullName?: string;
  nodesData: KnowledgeNodeData[];
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
}

export function KnowledgeFocusView({
  nodesData,
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
}: KnowledgeFocusViewProps) {
  const [isSpotlightActive, setIsSpotlightActive] = useState(true);
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [clearDrawingTrigger, setClearDrawingTrigger] = useState(0);

  // Keyboard shortcuts (ESC to exit, D for Draw, M for Minimap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitFocus();
      } else if (e.key === 'd' || e.key === 'D') {
        setIsDrawingMode((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMinimapVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFocus]);

  const activeFocusNode = selectedNode || nodesData[0] || null;

  return (
    <div className="relative w-screen h-screen m-0 p-0 overflow-hidden bg-[#F0F4F9] dark:bg-[#131314] font-sans text-slate-800 dark:text-[#E3E3E3] select-none">
      {/* 1. Freehand Sketch Drawing Layer */}
      <SketchCanvasOverlay
        isActive={isDrawingMode}
        clearTrigger={clearDrawingTrigger}
      />

      {/* 2. TOP-LEFT: Zen Mode Indicator & Spotlight Switch */}
      <div className="fixed top-6 left-6 z-30 flex items-center gap-3 bg-white dark:bg-[#1E1F20] backdrop-blur-xl px-4 py-2 rounded-full border-none shadow-none">
        <div className="flex items-center gap-2.5 pr-2 border-none">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B57D0] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0B57D0] dark:bg-[#A8C7FA]" />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-slate-900 dark:text-[#E3E3E3] uppercase">
            Chế độ Tập trung
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#C4C7C5]">
          <span className="text-slate-400 font-medium">Đang học:</span>
          <span className="font-medium text-[#041E49] dark:text-[#A8C7FA] px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center gap-1.5 shadow-none">
            <span className="material-symbols-outlined text-[15px]">schema</span>
            {activeFocusNode?.label || 'Chưa chọn khái niệm'}
          </span>
        </div>

        {/* Spotlight Switch */}
        <button
          onClick={() => setIsSpotlightActive((prev) => !prev)}
          className={`ml-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-none border-none cursor-pointer ${
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

      {/* 3. TOP-RIGHT: Exit Focus Mode Button */}
      <div className="fixed top-6 right-6 z-30 flex items-center gap-2.5">
        <button
          onClick={onExitFocus}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] text-[#1F1F1F] dark:text-[#E3E3E3] border-none shadow-none font-medium text-xs transition-all cursor-pointer whitespace-nowrap"
          title="Thoát chế độ tập trung (ESC)"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px] text-slate-400 group-hover:rotate-90 transition-transform">
            close
          </span>
          <span>Thoát chế độ tập trung</span>
          <kbd className="ml-1 px-2 py-0.5 text-[10px] font-mono font-medium bg-white dark:bg-[#1E1F20] text-slate-500 dark:text-[#C4C7C5] rounded-full border-none">
            ESC
          </kbd>
        </button>
      </div>

      {/* 4. Fullscreen Interactive Graph Viewport */}
      <div className="w-full h-full">
        <GraphCanvas
          nodes={rawNodes}
          edges={rawEdges}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
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
        />
      </div>

      {/* 5. In-Place Floating Node Detail Popover */}
      {selectedNode && (
        <FloatingNodeCard
          node={selectedNode}
          conceptDetail={conceptDetail}
          isConceptLoading={isConceptDetailLoading}
          canOpenLesson={canOpenLesson}
          onClose={() => onSelectNode(null)}
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
      />
    </div>
  );
}
