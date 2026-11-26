'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export interface DraftNodeCustomData {
  kind: string;
  path: string;
  title: string;
  isSelected?: boolean;
  activeColor: {
    border: string;
    bg: string;
    tag: string;
    text: string;
  };
  isDark?: boolean;
}

export const DraftCustomNode = memo(function DraftCustomNode({
  data,
}: NodeProps) {
  const customData = data as unknown as DraftNodeCustomData;
  const { kind, title, isSelected, activeColor, isDark } = customData;

  return (
    <div
      className="relative select-none text-left transition-all"
      style={{
        background: activeColor.bg,
        border: `${isSelected ? 2.5 : 1.5}px solid ${isSelected ? '#38bdf8' : activeColor.border}`,
        borderRadius: '14px',
        padding: '8px 11px',
        width: 250,
        boxShadow: isSelected
          ? '0 0 0 3px rgba(56, 189, 248, 0.3), 0 8px 24px rgba(0,0,0,0.3)'
          : isDark
          ? '0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 6px rgba(0,0,0,0.06)',
      }}
    >
      {/* 4-Direction Handles for direct Drag-to-Connect on Canvas */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="!w-3 !h-3 !bg-blue-500 hover:!scale-150 !border-2 !border-white dark:!border-slate-900 transition-transform cursor-crosshair -left-1.5"
        title="Kéo đến cổng này để kết nối"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="!w-3 !h-3 !bg-blue-500 hover:!scale-150 !border-2 !border-white dark:!border-slate-900 transition-transform cursor-crosshair -right-1.5"
        title="Kéo từ cổng này sang thực thể khác"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="!w-2.5 !h-2.5 !bg-blue-400 hover:!scale-150 !border !border-white dark:!border-slate-900 transition-transform cursor-crosshair -top-1.5"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="!w-2.5 !h-2.5 !bg-blue-400 hover:!scale-150 !border !border-white dark:!border-slate-900 transition-transform cursor-crosshair -bottom-1.5"
      />

      {/* Node Content */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[10px] font-extrabold uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
          style={{
            color: activeColor.tag,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          }}
        >
          {kind}
        </span>
        {isSelected && (
          <span className="material-symbols-outlined text-[14px] text-blue-400">
            check_circle
          </span>
        )}
      </div>

      <div
        className="text-xs font-bold line-clamp-2 leading-snug"
        style={{ color: activeColor.text }}
      >
        {title}
      </div>
    </div>
  );
});
