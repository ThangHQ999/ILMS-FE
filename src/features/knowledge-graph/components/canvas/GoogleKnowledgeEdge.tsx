'use client';

import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';

export const GoogleKnowledgeEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#0B57D0' : style.stroke || '#747775',
          strokeWidth: selected ? 2.5 : style.strokeWidth || 1.8,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide shadow-xs transition-all duration-200 cursor-pointer select-none border ${
                selected
                  ? 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] border-[#0B57D0]/40 dark:border-[#A8C7FA]/40 shadow-sm scale-105'
                  : 'bg-white dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] border-slate-200/80 dark:border-white/10 hover:border-[#0B57D0]/50 hover:bg-[#F0F4F9] dark:hover:bg-[#333537]'
              }`}
              title={typeof label === 'string' ? label : undefined}
            >
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

GoogleKnowledgeEdge.displayName = 'GoogleKnowledgeEdge';
