'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { KnowledgeNodeData } from '../../types';

export const KnowledgeNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as KnowledgeNodeData;
  const isCenterpiece = Boolean(nodeData.isCenterpiece);

  const normKind = (nodeData.kind ?? '').trim().toUpperCase();
  const labelLower = (nodeData.label ?? '').toLowerCase();

  // Algorithms (such as Dijkstra), concepts, data structures, and entities are strictly Knowledge Entities, NEVER a Topic
  const isEntityOrAlgorithm =
    normKind === 'KNOWLEDGEENTITY' ||
    normKind === 'KNOWLEDGE_ENTITY' ||
    normKind === 'CONCEPT' ||
    labelLower.includes('dijkstra') ||
    labelLower.includes('thuật toán') ||
    labelLower.includes('algorithm') ||
    labelLower.includes('giải thuật');

  // A node is strictly a Topic ONLY if its kind is explicitly 'TOPIC' or 'Topic' (and not an entity/algorithm)
  const isTopic = !isEntityOrAlgorithm && normKind === 'TOPIC';

  // Tonal Color Schemes (Google Material 3)
  const getCategoryStyles = () => {
    if (
      labelLower.includes('dijkstra') ||
      labelLower.includes('thuật toán') ||
      labelLower.includes('algorithm') ||
      labelLower.includes('giải thuật') ||
      nodeData.category === 'algo'
    ) {
      return {
        iconBg: 'bg-[#E8DEF8] dark:bg-[#381E72]',
        iconText: 'text-[#21005D] dark:text-[#D0BCFF]',
        chipBg: 'bg-[#E8DEF8]/60 dark:bg-[#381E72]/60',
        chipText: 'text-[#21005D] dark:text-[#D0BCFF]',
        tag: 'Thuật toán / Quy trình',
      };
    }

    switch (nodeData.category) {
      case 'ds':
        return {
          iconBg: 'bg-[#D3E3FD] dark:bg-[#162B4D]',
          iconText: 'text-[#041E49] dark:text-[#A8C7FA]',
          chipBg: 'bg-[#D3E3FD]/60 dark:bg-[#162B4D]/60',
          chipText: 'text-[#041E49] dark:text-[#A8C7FA]',
          tag: 'Khái niệm lõi',
        };
      case 'icpc':
        return {
          iconBg: 'bg-[#C4EED0] dark:bg-[#142E20]',
          iconText: 'text-[#0D652D] dark:text-[#81C995]',
          chipBg: 'bg-[#C4EED0]/60 dark:bg-[#142E20]/60',
          chipText: 'text-[#0D652D] dark:text-[#81C995]',
          tag: 'Bài tập rèn luyện',
        };
      case 'plo':
        return {
          iconBg: 'bg-[#FCEBA4] dark:bg-[#3C2A1E]',
          iconText: 'text-[#725200] dark:text-[#FFB784]',
          chipBg: 'bg-[#FCEBA4]/60 dark:bg-[#3C2A1E]/60',
          chipText: 'text-[#725200] dark:text-[#FFB784]',
          tag: 'Chủ đề học phần',
        };
      default:
        return {
          iconBg: 'bg-[#F0F4F9] dark:bg-[#282A2C]',
          iconText: 'text-[#444746] dark:text-[#C4C7C5]',
          chipBg: 'bg-[#F0F4F9] dark:bg-[#282A2C]',
          chipText: 'text-[#444746] dark:text-[#C4C7C5]',
          tag: 'Khái niệm',
        };
    }
  };

  const styles = getCategoryStyles();

  // 1. Topic Node (Chủ đề học thuật / PLO)
  if (isTopic) {
    return (
      <div className="relative group cursor-pointer select-none">
        {/* Connection Handles (Invisible by default, revealed on hover) */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-[#0B57D0] dark:!bg-[#A8C7FA] !border-2 !border-white dark:!border-[#1E1F20] rounded-full -top-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 !bg-[#0B57D0] dark:!bg-[#A8C7FA] !border-2 !border-white dark:!border-[#1E1F20] rounded-full -bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
        <Handle
          type="target"
          position={Position.Left}
          className="w-2.5 h-2.5 !bg-[#0B57D0] dark:!bg-[#A8C7FA] !border-2 !border-white dark:!border-[#1E1F20] rounded-full -left-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-2.5 h-2.5 !bg-[#0B57D0] dark:!bg-[#A8C7FA] !border-2 !border-white dark:!border-[#1E1F20] rounded-full -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />

        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E1F20] border transition-all duration-200 ${
            selected
              ? 'ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA] border-transparent shadow-md'
              : 'border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[19px]">folder_special</span>
          </div>
          <div className="min-w-0 pr-1">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
              Chủ đề
            </span>
            <span
              className="text-xs font-bold text-slate-900 dark:text-[#E3E3E3] truncate block max-w-[170px]"
              title={nodeData.label}
            >
              {nodeData.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Core Knowledge Node (Centerpiece or Regular Concept)
  return (
    <div className="relative group cursor-pointer select-none">
      {/* Connection Handles (Invisible by default, revealed on hover) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 !bg-[#0B57D0] dark:!bg-[#A8C7FA] !border-2 !border-white dark:!border-[#1E1F20] rounded-full -top-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 !bg-[#0B57D0] dark:!bg-[#A8C7FA] !border-2 !border-white dark:!border-[#1E1F20] rounded-full -bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-[#0B57D0] dark:!bg-[#A8C7FA] !border-2 !border-white dark:!border-[#1E1F20] rounded-full -left-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-[#0B57D0] dark:!bg-[#A8C7FA] !border-2 !border-white dark:!border-[#1E1F20] rounded-full -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      />

      {/* Main Google Material Card */}
      <div
        className={`w-[210px] p-3 rounded-2xl transition-all duration-200 flex flex-col gap-2 ${
          isCenterpiece
            ? 'bg-[#D3E3FD]/20 dark:bg-[#162B4D]/30 border-blue-200/80 dark:border-blue-800/60'
            : 'bg-white dark:bg-[#1E1F20] border-slate-200/80 dark:border-white/10'
        } ${
          selected
            ? 'ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA] border-transparent shadow-md scale-102'
            : 'border shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-white/20'
        }`}
      >
        {/* Header row: Icon, Category chip & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl ${styles.iconBg} ${styles.iconText} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-[19px]">
                {nodeData.icon || 'psychology'}
              </span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles.chipBg} ${styles.chipText}`}>
              {nodeData.complexity?.time || styles.tag}
            </span>
          </div>

          {/* Centerpiece or Mastered badge */}
          {isCenterpiece ? (
            <span className="px-2 py-0.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-[9px] font-bold tracking-wide uppercase shrink-0">
              Đang học
            </span>
          ) : nodeData.status === 'mastered' ? (
            <div
              className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"
              title="Đã thành thạo"
            >
              <span className="material-symbols-outlined text-[13px] font-bold">check</span>
            </div>
          ) : null}
        </div>

        {/* Concept Title */}
        <div className="min-w-0">
          <span
            className="text-xs font-semibold text-slate-900 dark:text-[#E3E3E3] leading-snug line-clamp-2"
            title={nodeData.label}
          >
            {nodeData.label}
          </span>
        </div>

        {/* Footer info: Mastery progress or related stats */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-[#C4C7C5] pt-1 border-t border-slate-100 dark:border-white/5">
          <span className="truncate">
            {nodeData.sublabel || (nodeData.topic ? `Chủ đề: ${nodeData.topic}` : 'Khái niệm')}
          </span>
          <span className="font-semibold text-slate-700 dark:text-[#E3E3E3] shrink-0 ml-1">
            {nodeData.masteryScore && nodeData.masteryScore > 0 ? `${nodeData.masteryScore}%` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
});

KnowledgeNode.displayName = 'KnowledgeNode';
