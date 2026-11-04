'use client';

import React, { useState, useEffect } from 'react';
import { GraphCanvas } from '../canvas/GraphCanvas';
import { SketchCanvasOverlay } from '../canvas/SketchCanvasOverlay';
import { FloatingNodeCard } from './FloatingNodeCard';
import { FocusPillToolbar } from './FocusPillToolbar';
import { DraggableMinimap } from './DraggableMinimap';
import { KnowledgeNodeData } from '../../types';
import type { Node, Edge } from '@xyflow/react';

interface KnowledgeFocusViewProps {
  userFullName?: string;
  nodesData: KnowledgeNodeData[];
  rawNodes: Node<KnowledgeNodeData>[];
  rawEdges: Edge[];
  selectedNodeId: string | null;
  selectedNode: KnowledgeNodeData | null;
  onSelectNode: (id: string | null) => void;
  hoveredNodeId: string | null;
  onHoverNode: (id: string | null) => void;
  onExitFocus: () => void;
}

export function KnowledgeFocusView({
  nodesData,
  rawNodes,
  rawEdges,
  selectedNodeId,
  selectedNode,
  onSelectNode,
  hoveredNodeId,
  onHoverNode,
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

  const activeFocusNode =
    selectedNode || nodesData.find((n) => n.id === 'seg-tree') || nodesData[0];

  return (
    <div className="relative w-screen h-screen m-0 p-0 overflow-hidden bg-[#f6fafe] dark:bg-[#070A10] font-sans text-slate-800 dark:text-slate-100 select-none">
      {/* 1. Freehand Sketch Drawing Layer */}
      <SketchCanvasOverlay
        isActive={isDrawingMode}
        clearTrigger={clearDrawingTrigger}
      />

      {/* 2. TOP-LEFT: Zen Mode Indicator & Spotlight Switch */}
      <div className="fixed top-6 left-6 z-30 flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-2.5 pr-3 border-r border-slate-200 dark:border-slate-800">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-slate-900 dark:text-slate-100 uppercase">
            Chế độ Tập trung
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="text-slate-400 font-medium">Đang học:</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[15px]">schema</span>
            {activeFocusNode?.label || 'Segment Tree'}
          </span>
        </div>

        {/* Spotlight Switch */}
        <button
          onClick={() => setIsSpotlightActive((prev) => !prev)}
          className={`ml-2 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer ${
            isSpotlightActive
              ? 'bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
          className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 hover:bg-rose-50 dark:hover:bg-rose-950/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 hover:border-rose-300 shadow-xl text-slate-700 dark:text-slate-300 hover:text-rose-600 font-medium text-xs transition-all cursor-pointer"
          title="Thoát chế độ tập trung (ESC)"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px] text-slate-400 group-hover:text-rose-500 group-hover:rotate-90 transition-transform">
            close
          </span>
          <span className="font-semibold">Thoát chế độ tập trung</span>
          <kbd className="ml-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md border border-slate-200 dark:border-slate-700 group-hover:border-rose-300 group-hover:text-rose-600">
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
        />
      </div>

      {/* 5. In-Place Floating Node Detail Popover */}
      {selectedNode && (
        <FloatingNodeCard
          node={selectedNode}
          onClose={() => onSelectNode(null)}
          onOpenLesson={(n) => alert(`Chuyển hướng vào bài học: ${n.label}`)}
          onAskAiTutor={(n) => alert(`Mở gia sư Socratic AI phân tích: ${n.label}`)}
        />
      )}

      {/* 6. Draggable Minimap */}
      <DraggableMinimap
        isVisible={isMinimapVisible}
        onClose={() => setIsMinimapVisible(false)}
      />

      {/* 7. Bottom Pill Toolbar */}
      <FocusPillToolbar
        isMinimapVisible={isMinimapVisible}
        onToggleMinimap={() => setIsMinimapVisible((prev) => !prev)}
        isDrawingMode={isDrawingMode}
        onToggleDrawingMode={() => setIsDrawingMode((prev) => !prev)}
        onClearDrawing={() => setClearDrawingTrigger((prev) => prev + 1)}
        onCenterSegmentTree={() => onSelectNode('seg-tree')}
      />
    </div>
  );
}
