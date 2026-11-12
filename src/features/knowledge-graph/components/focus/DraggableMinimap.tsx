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
      className="fixed z-30 w-56 h-36 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-none p-3 flex flex-col justify-between select-none"
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between pb-1.5 text-[11px] text-[#444746] dark:text-[#C4C7C5] font-medium cursor-grab active:cursor-grabbing hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] px-2 py-1 rounded-full transition-colors"
        title="Kéo để di chuyển vị trí"
      >
        <span className="flex items-center gap-1.5 pointer-events-none">
          <span className="material-symbols-outlined text-[14px] text-[#8E918F]">
            drag_indicator
          </span>
          <span className="material-symbols-outlined text-[14px] text-[#0B57D0] dark:text-[#A8C7FA]">
            explore
          </span>
          Minimap (Vùng nhìn)
        </span>
        <button
          onClick={onClose}
          className="text-[#8E918F] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] cursor-pointer p-1 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors border-none"
          title="Đóng minimap"
          type="button"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </div>

      {/* Mini Visual Representation */}
      <div className="relative w-full h-24 bg-[#F0F4F9] dark:bg-[#131314] rounded-2xl overflow-hidden border-none pointer-events-none">
        {/* Dimmed mini dots */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#282A2C] left-8 top-5" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#282A2C] left-7 top-14" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#282A2C] right-9 top-6" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#282A2C] right-6 top-16" />

        {/* Spotlight line in minimap */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 65 52 L 85 38 L 115 50 L 145 48"
            fill="none"
            stroke="#0B57D0"
            strokeWidth="2"
            opacity="0.8"
          />
        </svg>

        {/* Active mini dots */}
        <div className="absolute w-2 h-2 rounded-full bg-[#81C995] left-[62px] top-[48px]" />
        <div className="absolute w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] left-[82px] top-[34px]" />
        <div className="absolute w-3 h-3 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] ring-2 ring-[#D3E3FD] dark:ring-[#162B4D] left-[111px] top-[45px] shadow-none animate-pulse" />
        <div className="absolute w-2 h-2 rounded-full bg-purple-500 left-[142px] top-[44px]" />

        {/* Current Viewport Lens Box */}
        <div className="absolute w-20 h-14 bg-[#0B57D0]/15 dark:bg-[#A8C7FA]/20 rounded-xl left-[75px] top-[26px]" />
      </div>
    </div>
  );
}
