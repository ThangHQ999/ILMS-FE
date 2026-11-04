'use client';

import React from 'react';
import { KnowledgeNodeData } from '../../types';

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
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'ds':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
      case 'algo':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300';
      case 'icpc':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300';
      case 'plo':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const getCategoryName = (category: string) => {
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

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Bảng Ma Trận Thực Thể Tri Thức (Knowledge Matrix)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chế độ danh mục chuẩn cho khả năng truy cập dễ dàng & tra cứu nhanh ({nodes.length} thực thể)
          </p>
        </div>
        <button
          onClick={onSwitchToGraph}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">bubble_chart</span>
          <span>Xem trên mạng lưới 2D</span>
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold">
              <th className="py-3 px-4 rounded-l-xl">Thực thể</th>
              <th className="py-3 px-4">Phân loại</th>
              <th className="py-3 px-4">Độ phức tạp</th>
              <th className="py-3 px-4">Liên kết kề</th>
              <th className="py-3 px-4">Độ thành thạo</th>
              <th className="py-3 px-4 rounded-r-xl text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const relatedSummary = [
                ...(node.prerequisites || []),
                ...(node.successors || []),
              ]
                .slice(0, 3)
                .join(', ');

              return (
                <tr
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                        {node.icon || 'adjust'}
                      </span>
                      <div>
                        <span>{node.label}</span>
                        {node.sublabel && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {node.sublabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getCategoryBadge(
                        node.category
                      )}`}
                    >
                      {getCategoryName(node.category)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {node.complexity.time}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {relatedSummary || 'Độc lập'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all"
                          style={{ width: `${node.masteryScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
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
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
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
