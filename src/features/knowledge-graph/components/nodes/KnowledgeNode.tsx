'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { KnowledgeNodeData } from '../../types';

export const KnowledgeNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as KnowledgeNodeData;
  const isCenterpiece = Boolean(nodeData.isCenterpiece);

  // Category & Status Colors
  const getCategoryStyles = () => {
    switch (nodeData.category) {
      case 'ds':
        return {
          bg: 'bg-blue-50 dark:bg-[#162B4D]',
          border: 'border-[#0059bb] dark:border-blue-400',
          text: 'text-[#0059bb] dark:text-[#A8C7FA]',
          badgeBg: 'bg-blue-100 dark:bg-[#162B4D]',
          badgeText: 'text-blue-800 dark:text-blue-200',
        };
      case 'algo':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/40',
          border: 'border-[#6C5CE7] dark:border-purple-400',
          text: 'text-[#6C5CE7] dark:text-purple-400',
          badgeBg: 'bg-purple-100 dark:bg-purple-900/60',
          badgeText: 'text-purple-800 dark:text-purple-200',
        };
      case 'icpc':
        return {
          bg: 'bg-emerald-50 dark:bg-[#142E20]',
          border: 'border-[#059669] dark:border-emerald-400',
          text: 'text-[#059669] dark:text-[#81C995]',
          badgeBg: 'bg-emerald-100 dark:bg-[#142E20]',
          badgeText: 'text-emerald-800 dark:text-emerald-200',
        };
      case 'plo':
        return {
          bg: 'bg-amber-50 dark:bg-[#3C2A1E]',
          border: 'border-[#D97706] dark:border-amber-400',
          text: 'text-[#D97706] dark:text-[#FFB784]',
          badgeBg: 'bg-amber-100 dark:bg-[#3C2A1E]',
          badgeText: 'text-amber-800 dark:text-amber-200',
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-[#1E1F20]',
          border: 'border-slate-400 dark:border-transparent',
          text: 'text-slate-600 dark:text-[#C4C7C5]',
          badgeBg: 'bg-slate-200 dark:bg-[#282A2C]',
          badgeText: 'text-slate-700 dark:text-[#E3E3E3]',
        };
    }
  };

  const colors = getCategoryStyles();

  if (isCenterpiece) {
    return (
      <div className="relative group cursor-pointer select-none">
        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-[#0070ea] border-2 border-white dark:border-slate-900 -top-2"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-[#0070ea] border-2 border-white dark:border-slate-900 -bottom-2"
        />
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-[#0070ea] border-2 border-white dark:border-slate-900 -left-2"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-[#0070ea] border-2 border-white dark:border-slate-900 -right-2"
        />

        {/* Outer Halo Waves */}
        <div className="absolute -inset-6 rounded-full bg-blue-500/15 dark:bg-blue-400/20 blur-xl animate-pulse pointer-events-none" />
        <div className="absolute -inset-3 rounded-full border-2 border-blue-400/40 animate-ping opacity-25 pointer-events-none" />

        {/* Core Node Body */}
        <div
          className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-[#0d1c32] via-[#0A192F] to-[#1e3a8a] text-white border-3 shadow-2xl transition-all duration-300 ${
            selected
              ? 'border-blue-400 ring-4 ring-blue-400/50 scale-110 shadow-blue-500/40'
              : 'border-[#0070ea] hover:scale-105'
          }`}
        >
          {/* Top 'Đang học' pill */}
          <div className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[9px] tracking-wider uppercase border border-white shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Đang học
          </div>

          <span className="material-symbols-outlined text-[26px] text-blue-200 mt-1">
            {nodeData.icon || 'hub'}
          </span>
          <span className="text-[10px] font-mono font-extrabold text-blue-200 mt-0.5">
            {nodeData.masteryScore}% Pro
          </span>
        </div>

        {/* Label Tag below node */}
        <div className="mt-2.5 px-3 py-1 rounded-full bg-white/95 dark:bg-[#1E1F20] border border-blue-200 dark:border-transparent text-center shadow-lg backdrop-blur-sm whitespace-nowrap">
          <span className="text-[11px] font-bold text-slate-900 dark:text-[#E3E3E3] block">
            {nodeData.label}
          </span>
          <span className="text-[9px] font-medium text-blue-600 dark:text-[#A8C7FA]">
            {nodeData.complexity?.time || 'O(log N)'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer select-none">
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 !bg-slate-400 dark:!bg-slate-500 border border-white -top-1.5"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 !bg-slate-400 dark:!bg-slate-500 border border-white -bottom-1.5"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-slate-400 dark:!bg-slate-500 border border-white -left-1.5"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-slate-400 dark:!bg-slate-500 border border-white -right-1.5"
      />

      {/* Node Circle */}
      <div
        className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-[#1E1F20] border-2 shadow-md transition-all duration-300 ${
          colors.border
        } ${
          selected
            ? 'ring-4 ring-offset-2 ring-blue-500 dark:ring-blue-400 shadow-xl scale-110'
            : 'hover:scale-105 hover:shadow-lg'
        }`}
      >
        <span className={`material-symbols-outlined text-[20px] ${colors.text}`}>
          {nodeData.icon || 'adjust'}
        </span>
        <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-[#C4C7C5]">
          {nodeData.complexity?.time || `${nodeData.masteryScore}%`}
        </span>

        {/* Mastered checkmark badge */}
        {nodeData.status === 'mastered' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white shadow">
            <span className="material-symbols-outlined text-[10px] font-bold">check</span>
          </div>
        )}
      </div>

      {/* Label Capsule */}
      <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#1E1F20] border border-slate-200 dark:border-transparent text-center shadow-sm backdrop-blur-sm whitespace-nowrap max-w-[130px] truncate">
        <span className="text-[10px] font-semibold text-slate-800 dark:text-[#E3E3E3] block truncate">
          {nodeData.label}
        </span>
      </div>
    </div>
  );
});

KnowledgeNode.displayName = 'KnowledgeNode';
