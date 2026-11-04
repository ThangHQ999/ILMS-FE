'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DraggableMinimapProps {
  isVisible: boolean;
  onClose: () => void;
}

export function DraggableMinimap({ isVisible, onClose }: DraggableMinimapProps) {
  const [position, setPosition] = useState({ x: 32, y: 100 });
  const isDraggingRef = useRef(false);
  const startDragOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicked on close button, don't start dragging
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
      const nextX = Math.max(16, Math.min(window.innerWidth - 240, e.clientX - startDragOffsetRef.current.x));
      const nextY = Math.max(16, Math.min(window.innerHeight - 180, e.clientY - startDragOffsetRef.current.y));
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

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-30 w-56 h-36 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl p-2.5 flex flex-col justify-between select-none"
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-medium cursor-grab active:cursor-grabbing hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-1 px-1 rounded-t-lg transition-colors"
        title="Kéo để di chuyển vị trí"
      >
        <span className="flex items-center gap-1.5 pointer-events-none">
          <span className="material-symbols-outlined text-[14px] text-slate-400">
            drag_indicator
          </span>
          <span className="material-symbols-outlined text-[14px] text-blue-600 dark:text-blue-400">
            explore
          </span>
          Minimap (Vùng nhìn)
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded"
          title="Đóng minimap"
          type="button"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </div>

      {/* Mini Visual Representation */}
      <div className="relative w-full h-24 bg-slate-50 dark:bg-slate-950/60 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 pointer-events-none">
        {/* Dimmed mini dots */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 left-8 top-5" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 left-7 top-14" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 right-9 top-6" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 right-6 top-16" />

        {/* Spotlight line in minimap */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 65 52 L 85 38 L 115 50 L 145 48"
            fill="none"
            stroke="#0070ea"
            strokeWidth="2"
            opacity="0.8"
          />
        </svg>

        {/* Active mini dots */}
        <div className="absolute w-2 h-2 rounded-full bg-emerald-500 left-[62px] top-[48px]" />
        <div className="absolute w-2 h-2 rounded-full bg-blue-500 left-[82px] top-[34px]" />
        <div className="absolute w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-300 dark:ring-blue-800 left-[111px] top-[45px] shadow-sm animate-pulse" />
        <div className="absolute w-2 h-2 rounded-full bg-purple-500 left-[142px] top-[44px]" />

        {/* Current Viewport Lens Box */}
        <div className="absolute w-20 h-14 border-2 border-blue-500/80 bg-blue-500/10 rounded-md left-[75px] top-[26px]" />
      </div>
    </div>
  );
}
