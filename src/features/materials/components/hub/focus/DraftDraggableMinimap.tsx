'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MiniMap, type Node } from '@xyflow/react';

interface DraftDraggableMinimapProps {
  isVisible: boolean;
  onClose: () => void;
}

export function DraftDraggableMinimap({
  isVisible,
  onClose,
}: DraftDraggableMinimapProps) {
  const [position, setPosition] = useState({ x: 24, y: 76 });
  const isDraggingRef = useRef(false);
  const startDragOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDraggingRef.current = true;
    startDragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const nextX = Math.max(
        12,
        Math.min(window.innerWidth - 280, e.clientX - startDragOffsetRef.current.x)
      );
      const nextY = Math.max(
        12,
        Math.min(window.innerHeight - 200, e.clientY - startDragOffsetRef.current.y)
      );
      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isVisible) return null;

  const getNodeColor = (node: Node) => {
    const kind = ((node.data as { kind?: string })?.kind || '').toUpperCase();
    if (kind.includes('TOPIC')) return '#9333EA';
    if (kind.includes('DEFINITION')) return '#0284C7';
    if (kind.includes('PROCESS')) return '#2563EB';
    if (kind.includes('EXERCISE')) return '#059669';
    if (kind.includes('EXAMPLE')) return '#D97706';
    if (kind.includes('ARGUMENT')) return '#DB2777';
    return '#0059BB';
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="absolute z-30 w-[264px] rounded-3xl bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-xl shadow-2xl p-3 flex flex-col gap-2 select-none border border-slate-200/80 dark:border-slate-800"
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between pb-1 text-[11px] text-[#444746] dark:text-[#C4C7C5] font-medium cursor-grab active:cursor-grabbing hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] px-2.5 py-1.5 rounded-full transition-colors"
        title="Kéo để di chuyển vị trí Minimap"
      >
        <span className="flex items-center gap-1.5 pointer-events-none">
          <span className="material-symbols-outlined text-[15px] text-[#8E918F]">
            drag_indicator
          </span>
          <span className="material-symbols-outlined text-[15px] text-[#0B57D0] dark:text-[#A8C7FA]">
            explore
          </span>
          <span className="font-bold text-slate-800 dark:text-[#E3E3E3]">
            Minimap (Vùng nhìn)
          </span>
        </span>
        <button
          onClick={onClose}
          className="text-[#8E918F] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] cursor-pointer p-1 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors border-none"
          title="Đóng minimap"
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">close</span>
        </button>
      </div>

      {/* Interactive MiniMap Component */}
      <div className="relative w-full h-[126px] rounded-2xl overflow-hidden bg-[#F0F4F9] dark:bg-[#131314] border border-slate-200/60 dark:border-slate-800/80">
        <MiniMap
          style={{
            position: 'relative',
            width: 240,
            height: 126,
            margin: 0,
            top: 0,
            left: 0,
            right: 'auto',
            bottom: 'auto',
          }}
          className="!w-full !h-full !m-0 !border-none !bg-transparent"
          nodeColor={getNodeColor}
          nodeStrokeWidth={2}
          maskColor="rgba(11, 15, 23, 0.45)"
          zoomable
          pannable
        />
      </div>
    </div>
  );
}
