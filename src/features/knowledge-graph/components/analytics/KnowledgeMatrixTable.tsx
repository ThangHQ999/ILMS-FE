'use client';

import React, { useMemo } from 'react';
import { KnowledgeNodeData } from '../../types';
import { deriveTopicDisplayName } from '../../services/knowledge-graph.service';

interface KnowledgeMatrixTableProps {
  nodes: KnowledgeNodeData[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onSwitchToGraph: () => void;
}

export function KnowledgeMatrixTable({
  nodes,
  selectedNodeId,
  onSelectNode,
  onSwitchToGraph,
}: KnowledgeMatrixTableProps) {
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Filter out satellite/auxiliary nodes so only true Knowledge Entities appear in the matrix
  const coreNodes = useMemo(() => {
    const filtered = nodes.filter(
      (n) => !n.isAuxiliary && (n.kind || '').toUpperCase() !== 'TOPIC'
    );
    return filtered.length > 0 ? filtered : nodes.filter((n) => !n.isAuxiliary);
  }, [nodes]);

  const getCategoryBadge = (category: string, kind?: string) => {
    const normKind = (kind || '').trim().toUpperCase();
    if (normKind === 'DEFINITION') {
      return 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300';
    }
    if (normKind === 'CHUNK') {
      return 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300';
    }
    if (normKind === 'TOPIC') {
      return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300';
    }
    if (normKind === 'ARGUMENT') {
      return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300';
    }
    if (normKind === 'KNOWLEDGE_ENTITY' || normKind === 'KNOWLEDGEENTITY' || normKind === 'CONCEPT') {
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300';
    }
    if (normKind === 'PROCESS') {
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300';
    }
    if (normKind === 'EXERCISE') {
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300';
    }
    if (normKind === 'EXAMPLE') {
      return 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300';
    }

    switch (category) {
      case 'ds':
        return 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]';
      case 'algo':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300';
      case 'icpc':
        return 'bg-[#C4EED0] dark:bg-[#142E20] text-[#0D652D] dark:text-[#81C995]';
      case 'plo':
        return 'bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784]';
      default:
        return 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]';
    }
  };

  const getCategoryName = (category: string, kind?: string) => {
    const normKind = (kind || '').trim().toUpperCase();
    if (normKind === 'DEFINITION') return 'Định nghĩa';
    if (normKind === 'CHUNK') return 'Đoạn trích';
    if (normKind === 'TOPIC') return 'Chủ đề';
    if (normKind === 'ARGUMENT') return 'Luận cứ';
    if (normKind === 'KNOWLEDGE_ENTITY' || normKind === 'KNOWLEDGEENTITY' || normKind === 'CONCEPT') return 'Thực thể tri thức';
    if (normKind === 'PROCESS') return 'Quy trình';
    if (normKind === 'PROCESS_STEP' || normKind === 'PROCESSSTEP') return 'Bước quy trình';
    if (normKind === 'EXERCISE') return 'Bài tập';
    if (normKind === 'EXAMPLE') return 'Ví dụ';

    switch (category) {
      case 'ds':
        return 'Cấu trúc DL';
      case 'algo':
        return 'Thuật toán';
      case 'icpc':
        return 'ICPC Lab';
      case 'plo':
        return 'Chuẩn PLO';
      default:
        return 'Toán học';
    }
  };

  const getComplexityDisplay = (time: string, kind?: string) => {
    const raw = (time || '').trim();
    if (raw.toUpperCase().startsWith('O(')) return raw;
    if (raw.toUpperCase() === 'BEGINNER') return 'Cơ bản';
    if (raw.toUpperCase() === 'INTERMEDIATE') return 'Trung bình';
    if (raw.toUpperCase() === 'ADVANCED') return 'Nâng cao';

    const norm = (kind || time || '').trim().toUpperCase();
    if (norm === 'PROCESS_STEP' || norm === 'PROCESSSTEP') return 'Bước quy trình';
    if (norm === 'PROCESS') return 'Quy trình';
    if (norm === 'EXERCISE' || norm === 'EXERCISE_STEP') return 'Bài tập';
    if (norm === 'DEFINITION') return 'Định nghĩa';
    if (norm === 'CHUNK') return 'Đoạn trích';
    if (norm === 'TOPIC') return 'Tổng quan';
    if (norm === 'ARGUMENT') return 'Luận cứ';
    if (norm === 'EXAMPLE') return 'Ví dụ';
    if (norm.includes('KNOWLEDGE') || norm === 'CONCEPT') return 'Cơ bản';

    return 'Cơ bản';
  };

  return (
    <div className="w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-none border-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-[#E3E3E3]">
            Bảng Ma Trận Thực Thể Tri Thức (Knowledge Matrix)
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-0.5">
            Chế độ danh mục chuẩn cho khả năng truy cập dễ dàng &amp; tra cứu nhanh ({coreNodes.length} thực thể)
          </p>
        </div>
        <button
          onClick={onSwitchToGraph}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap text-xs font-medium border-none shadow-none transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">bubble_chart</span>
          <span>Xem trên mạng lưới 2D</span>
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F0F4F9] dark:bg-[#282A2C] text-slate-700 dark:text-[#C4C7C5] font-semibold border-none">
              <th className="py-3 px-4 rounded-l-2xl">Thực thể</th>
              <th className="py-3 px-4">Phân loại</th>
              <th className="py-3 px-4">Độ phức tạp</th>
              <th className="py-3 px-4">Liên kết kề</th>
              <th className="py-3 px-4">Độ thành thạo</th>
              <th className="py-3 px-4 rounded-r-2xl text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F9] dark:divide-[#282A2C]/50">
            {coreNodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const relatedNames = Array.from(
                new Set([
                  ...(node.prerequisites || []),
                  ...(node.successors || []),
                ])
              )
                .map((id) => nodeMap.get(id)?.label || id)
                .filter(Boolean);

              const relatedSummary = relatedNames.slice(0, 2).join(', ');
              const remainingCount = relatedNames.length > 2 ? relatedNames.length - 2 : 0;
              const isTopicNode = (node.kind || '').toUpperCase() === 'TOPIC';
              const displayLabel =
                isTopicNode && (node.label.startsWith('Chủ đề #') || node.label === 'Chủ đề')
                  ? deriveTopicDisplayName(
                      null,
                      relatedNames[0] || (node.topic !== node.label ? node.topic : null),
                      node.materialTitle,
                      1
                    )
                  : node.label;

              return (
                <tr
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#D3E3FD]/40 dark:bg-[#162B4D]'
                      : 'hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C]'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-[#E3E3E3]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[18px]">
                          {node.icon || 'hub'}
                        </span>
                      </div>
                      <div className="min-w-0 max-w-sm">
                        <span className="truncate block font-semibold text-slate-900 dark:text-[#E3E3E3]" title={displayLabel}>
                          {displayLabel}
                        </span>
                        {node.sublabel && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-normal truncate mt-0.5" title={node.sublabel}>
                            {node.sublabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-medium border-none ${getCategoryBadge(
                        node.category,
                        node.kind
                      )}`}
                    >
                      {getCategoryName(node.category, node.kind)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
                    {getComplexityDisplay(node.complexity.time, node.kind)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-[#C4C7C5] max-w-xs">
                    {relatedNames.length > 0 ? (
                      <div className="flex items-center gap-1.5 truncate" title={relatedNames.join(', ')}>
                        <span className="text-slate-700 dark:text-[#E3E3E3] truncate">
                          {relatedSummary}
                        </span>
                        {remainingCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-[#282A2C] text-slate-500 font-medium shrink-0">
                            +{remainingCount}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">Độc lập</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[#E1E5EA] dark:bg-[#282A2C] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0B57D0] dark:bg-[#A8C7FA] h-full rounded-full transition-all"
                          style={{ width: `${node.masteryScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                        {node.masteryScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNode(node.id);
                        onSwitchToGraph();
                      }}
                      className="px-4 py-1.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] font-medium text-[11px] border-none shadow-none transition-colors"
                      type="button"
                    >
                      Định vị
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
